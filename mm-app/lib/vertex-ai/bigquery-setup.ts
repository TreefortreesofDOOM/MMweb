import { BigQuery } from '@google-cloud/bigquery'
import { extractArtistData } from './data-extraction-utils'
import type { Database } from '@/lib/types/database.types'
import path from 'path'
import fs from 'fs'

const projectId = process.env.GOOGLE_CLOUD_PROJECT!
const credentialsPath = path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS!)

interface ArtistFeature {
  // Basic Info
  entity_id: string
  feature_timestamp: string
  artist_id: string
  artist_name: string
  role: string | null
  location: string | null
  artist_status: string | null
  
  // Profile Details
  bio: string | null
  avatar_url: string | null
  website: string | null
  email: string | null
  first_name: string | null
  last_name: string | null
  full_name: string | null
  
  // Social Media
  instagram: string | null
  
  // Artist Categories
  styles: string[] | null
  techniques: string[] | null
  keywords: string[] | null
  
  // Verification & Status
  verification_progress: number | null
  application_status: string | null
  verification_requirements: any | null
  exhibition_badge: boolean | null
  community_engagement_score: number | null
  view_count: number | null
  
  // Artwork Details
  artwork_count: number
  artwork_titles: string[]
  artwork_descriptions: string[]
  artwork_statuses: string[]
  artwork_prices: number[]
  artwork_images: any[]
  artwork_display_orders: number[]
  
  // AI Features
  artwork_embeddings_gemini: number[]
  artwork_keywords: string[]
  artwork_styles: string[]
  artwork_techniques: string[]
  
  // Business Details
  stripe_onboarding_complete: boolean | null
}

export async function setupBigQueryTable(forceRecreate = false) {
  try {
    console.log('Starting data extraction...')
    const data = await extractArtistData()
    
    const rows: ArtistFeature[] = data.profiles.map(profile => {
      const artworks = data.artworks.filter(a => a.artist_id === profile.id)
      const embeddings = data.artwork_embeddings_gemini
        .filter(e => artworks.some(a => a.id === e.artwork_id))
        .map(e => e.embedding)
        .flat()
      
      return {
        // Basic Info
        entity_id: profile.id,
        feature_timestamp: new Date().toISOString(),
        artist_id: profile.id,
        artist_name: profile.name || 'Unknown Artist',
        role: profile.role || null,
        location: profile.location || null,
        artist_status: profile.artist_status || null,
        
        // Profile Details
        bio: profile.bio || null,
        avatar_url: profile.avatar_url || null,
        website: profile.website || null,
        email: profile.email || null,
        first_name: profile.first_name || null,
        last_name: profile.last_name || null,
        full_name: profile.full_name || null,
        
        // Social Media
        instagram: profile.instagram || null,
        
        // Artist Categories
        styles: artworks.flatMap(a => a.styles || []),
        techniques: artworks.flatMap(a => a.techniques || []),
        keywords: artworks.flatMap(a => a.keywords || []),
        
        // Verification & Status
        verification_progress: profile.verification_progress,
        application_status: profile.application_status || null,
        verification_requirements: profile.verification_requirements,
        exhibition_badge: profile.exhibition_badge || null,
        community_engagement_score: profile.community_engagement_score || null,
        view_count: profile.view_count || null,
        
        // Artwork Details
        artwork_count: artworks.length,
        artwork_titles: artworks.map(a => a.title || ''),
        artwork_descriptions: artworks.map(a => a.description || ''),
        artwork_statuses: artworks.map(a => a.status || ''),
        artwork_prices: artworks.map(a => a.price || 0),
        artwork_images: artworks.map(a => a.images),
        artwork_display_orders: artworks.map(a => a.display_order || 0),
        
        // AI Features
        artwork_embeddings_gemini: embeddings.length > 0 ? embeddings : [0.0],
        artwork_keywords: artworks.flatMap(a => a.keywords || []),
        artwork_styles: artworks.flatMap(a => a.styles || []),
        artwork_techniques: artworks.flatMap(a => a.techniques || []),
        
        // Business Details
        stripe_onboarding_complete: profile.stripe_onboarding_complete || null
      }
    })

    // Save data to CSV
    const csvPath = path.resolve(process.cwd(), 'artist_features.csv')
    const csvHeader = [
      // Basic Info
      'entity_id', 'feature_timestamp', 'artist_id', 'artist_name', 'role', 'location', 'artist_status',
      // Profile Details
      'bio', 'avatar_url', 'website', 'email', 'first_name', 'last_name', 'full_name',
      // Social Media
      'instagram',
      // Artist Categories
      'styles', 'techniques', 'keywords',
      // Verification & Status
      'verification_progress', 'application_status', 'verification_requirements', 'exhibition_badge',
      'community_engagement_score', 'view_count',
      // Artwork Details
      'artwork_count', 'artwork_titles', 'artwork_descriptions', 'artwork_statuses',
      'artwork_prices', 'artwork_images', 'artwork_display_orders',
      // AI Features
      'artwork_embeddings_gemini', 'artwork_keywords', 'artwork_styles', 'artwork_techniques',
      // Business Details
      'stripe_onboarding_complete'
    ].join(',') + '\n'

    const csvContent = rows.map(row => {
      return [
        // Basic Info
        row.entity_id,
        row.feature_timestamp,
        row.artist_id,
        `"${row.artist_name.replace(/"/g, '""')}"`,
        row.role || '',
        row.location ? `"${row.location.replace(/"/g, '""')}"` : '',
        row.artist_status || '',
        
        // Profile Details
        row.bio ? `"${row.bio.replace(/"/g, '""')}"` : '',
        row.avatar_url || '',
        row.website || '',
        row.email || '',
        row.first_name || '',
        row.last_name || '',
        row.full_name || '',
        
        // Social Media
        row.instagram || '',
        
        // Artist Categories
        `"[${row.styles?.join(',') || ''}]"`,
        `"[${row.techniques?.join(',') || ''}]"`,
        `"[${row.keywords?.join(',') || ''}]"`,
        
        // Verification & Status
        row.verification_progress || '',
        row.application_status || '',
        row.verification_requirements ? `"${JSON.stringify(row.verification_requirements).replace(/"/g, '""')}"` : '',
        row.exhibition_badge || '',
        row.community_engagement_score || '',
        row.view_count || '',
        
        // Artwork Details
        row.artwork_count,
        `"[${row.artwork_titles.map(t => t.replace(/"/g, '""')).join(',')}]"`,
        `"[${row.artwork_descriptions.map(d => d.replace(/"/g, '""')).join(',')}]"`,
        `"[${row.artwork_statuses.join(',')}]"`,
        `"[${row.artwork_prices.join(',')}]"`,
        `"[${row.artwork_images.map(img => JSON.stringify(img).replace(/"/g, '""')).join(',')}]"`,
        `"[${row.artwork_display_orders.join(',')}]"`,
        
        // AI Features
        `"[${row.artwork_embeddings_gemini.join(',')}]"`,
        `"[${row.artwork_keywords.join(',')}]"`,
        `"[${row.artwork_styles.join(',')}]"`,
        `"[${row.artwork_techniques.join(',')}]"`,
        
        // Business Details
        row.stripe_onboarding_complete || ''
      ].join(',')
    }).join('\n')

    fs.writeFileSync(csvPath, csvHeader + csvContent)

    // Also save as JSON for reference
    const jsonPath = path.resolve(process.cwd(), 'artist_features.json')
    fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2))

    return {
      success: true,
      message: `Successfully saved ${rows.length} rows to ${csvPath} and ${jsonPath}`,
      files: {
        csv: csvPath,
        json: jsonPath
      }
    }
  } catch (error) {
    console.error('Error in setupBigQueryTable:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    throw error
  }
} 