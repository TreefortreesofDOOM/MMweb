// Collection action types
import { createActionClient } from '@/lib/supabase/supabase-action-utils'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { revalidatePath } from 'next/cache'
import { type Database } from '@/lib/types/database.types'
import type { CollectionWithItems, CollectionWithCount } from '@/lib/types/patron-types'
import { toTransaction } from '@/lib/types/ghost-profiles'

type DbCollectionItem = Database['public']['Tables']['collection_items']['Row'] & {
  transactions?: Database['public']['Tables']['transactions']['Row'] | null
}

interface CollectionCreate {
  name: string
  description?: string
  isPrivate?: boolean
}

interface CollectionUpdate extends Partial<CollectionCreate> {
  id: string
}

interface CollectionItem {
  artworkId: string
  notes?: string
}

export async function createPurchasedCollection(patronId: string) {
  const supabase = createServiceRoleClient()
  
  // Create the "Purchased Works" collection
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .insert({
      name: 'Art Collection',
      description: 'Your collection of purchased artworks',
      patron_id: patronId,
      is_purchased: true,
      is_private: false
    })
    .select()
    .single()

  if (collectionError) throw collectionError

  return collection
}

export async function addPurchasedArtworkToCollection(
  collectionId: string,
  artworkId: string,
  transactionId: string,
  purchaseDate: string
) {
  const supabase = createServiceRoleClient()

  const { error: itemError } = await supabase
    .from('collection_items')
    .insert({
      collection_id: collectionId,
      artwork_id: artworkId,
      transaction_id: transactionId,
      notes: `Purchased on ${new Date(purchaseDate).toLocaleDateString()}`,
      added_at: purchaseDate,
      display_order: 0
    })

  if (itemError) throw itemError
}

export async function createCollection({
  name,
  description,
  isPrivate = false,
}: CollectionCreate) {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('collections')
    .insert({
      name,
      description,
      is_private: isPrivate,
      patron_id: user.id,
      is_purchased: false
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/patron/collections')
  return data
}

export async function updateCollection({
  id,
  name,
  description,
  isPrivate,
}: CollectionUpdate) {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('collections')
    .update({
      name,
      description,
      is_private: isPrivate,
    })
    .eq('patron_id', user.id) // Ensure user owns the collection
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/patron/collections')
  return data
}

export async function deleteCollection(id: string) {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('patron_id', user.id) // Ensure user owns the collection
    .eq('id', id)
    .eq('is_purchased', false) // Prevent deletion of purchased collections

  if (error) throw error
  
  revalidatePath('/patron/collections')
}

export async function addItemToCollection(
  collectionId: string,
  { artworkId, notes }: CollectionItem
) {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // First verify collection ownership
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select('id, patron_id')
    .eq('id', collectionId)
    .eq('patron_id', user.id)
    .single()

  if (collectionError || !collection) throw new Error('Collection not found or access denied')

  const { data, error } = await supabase
    .from('collection_items')
    .insert({
      collection_id: collectionId,
      artwork_id: artworkId,
      notes,
      display_order: 0
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath(`/patron/collections/${collectionId}`)
  return data
}

export async function removeItemFromCollection(
  collectionId: string,
  artworkId: string
) {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // First verify collection ownership and not a purchased collection
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select('id, patron_id, is_purchased')
    .eq('id', collectionId)
    .eq('patron_id', user.id)
    .eq('is_purchased', false)
    .single()

  if (collectionError || !collection) throw new Error('Collection not found or cannot modify purchased collections')

  const { error } = await supabase
    .from('collection_items')
    .delete()
    .match({
      collection_id: collectionId,
      artwork_id: artworkId,
    })

  if (error) throw error
  
  revalidatePath(`/patron/collections/${collectionId}`)
}

export async function getCollection(id: string) {
  const supabase = await createActionClient()
  const serviceClient = createServiceRoleClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // 1. First verify collection access with RLS
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .single()

  if (collectionError) throw collectionError
  if (!collection) throw new Error('Collection not found')

  // 2. Get collection items (still using RLS)
  const { data: items, error: itemsError } = await supabase
    .from('collection_items')
    .select('*')
    .eq('collection_id', id)
    .order('display_order', { ascending: true })

  if (itemsError) throw itemsError

  // 3. Get artwork details (RLS is fine here)
  const artworkIds = items?.map(item => item.artwork_id).filter(Boolean) as string[]
  const { data: artworks, error: artworksError } = await supabase
    .from('artworks')
    .select('id, title, description, images, artist_id')
    .in('id', artworkIds)

  if (artworksError) throw artworksError

  // 4. Get transaction amounts using service role (bypass RLS)
  const transactionIds = items?.map(item => item.transaction_id).filter(Boolean) as string[]
  const { data: transactions, error: transactionsError } = await serviceClient
    .from('transactions')
    .select('id, amount_total, status')
    .in('id', transactionIds)

  if (transactionsError) throw transactionsError

  // 5. Get artist names (RLS is fine here)
  const artistIds = artworks?.map(art => art.artist_id).filter(Boolean) as string[]
  const { data: artists, error: artistsError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', artistIds)

  if (artistsError) throw artistsError

  // Create lookup maps
  const artworkMap = new Map(artworks?.map(a => [a.id, a]))
  const artistMap = new Map(artists?.map(a => [a.id, a]))
  const transactionMap = new Map(transactions?.map(t => [t.id, t]))

  // Combine all the data
  const collectionItems = items?.map(item => ({
    ...item,
    artworks: item.artwork_id ? {
      ...artworkMap.get(item.artwork_id),
      profiles: artistMap.get(artworkMap.get(item.artwork_id)?.artist_id),
      price: (transactionMap.get(item.transaction_id)?.amount_total || 0) / 100 // Convert cents to dollars
    } : null
  }))

  return {
    ...collection,
    collection_items: collectionItems
  }
}

export async function listCollections(): Promise<CollectionWithCount[]> {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get all collections - RLS will handle access control
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      collection_items (
        count
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as CollectionWithCount[]
}

export async function updateCollectionItemOrder(
  collectionId: string,
  itemIds: string[]
) {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify collection ownership
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select('id, patron_id')
    .eq('id', collectionId)
    .eq('patron_id', user.id)
    .single()

  if (collectionError || !collection) throw new Error('Collection not found or access denied')

  // Update each item's order
  const updates = itemIds.map((artworkId, index) => 
    supabase
      .from('collection_items')
      .update({ display_order: index })
      .match({
        collection_id: collectionId,
        artwork_id: artworkId
      })
  )

  try {
    await Promise.all(updates)
    revalidatePath(`/patron/collections/${collectionId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating collection item order:', error)
    throw error
  }
}

export async function updateCollectionItemNotes(
  collectionId: string,
  artworkId: string,
  notes: string
) {
  const supabase = await createActionClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify collection ownership
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select('id, patron_id')
    .eq('id', collectionId)
    .eq('patron_id', user.id)
    .single()

  if (collectionError || !collection) throw new Error('Collection not found or access denied')

  const { error } = await supabase
    .from('collection_items')
    .update({ notes })
    .match({ collection_id: collectionId, artwork_id: artworkId })

  if (error) throw new Error('Failed to update collection item notes')

  revalidatePath(`/patron/collections/${collectionId}`)
}

export async function moveCollectionItems(
  sourceCollectionId: string,
  targetCollectionId: string,
  artworkIds: string[]
) {
  const supabase = await createActionClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify ownership of both collections
  const { data: collections, error: collectionsError } = await supabase
    .from('collections')
    .select('id, patron_id, is_purchased')
    .in('id', [sourceCollectionId, targetCollectionId])
    .eq('patron_id', user.id)

  if (collectionsError || !collections || collections.length !== 2) {
    throw new Error('Collections not found or access denied')
  }

  // Ensure neither collection is a purchased collection
  if (collections.some(c => c.is_purchased)) {
    throw new Error('Cannot modify purchased collections')
  }

  try {
    const { error } = await supabase.rpc('move_collection_items', {
      p_source_collection_id: sourceCollectionId,
      p_target_collection_id: targetCollectionId,
      p_artwork_ids: artworkIds
    })

    if (error) throw error

    revalidatePath(`/patron/collections/${sourceCollectionId}`)
    revalidatePath(`/patron/collections/${targetCollectionId}`)
    return { success: true }
  } catch (error) {
    console.error('Error moving items:', error)
    throw error
  }
}
