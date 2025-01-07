import { createClient } from '@/lib/supabase/supabase-server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { isPrivate } = await request.json()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { error } = await supabase
      .from('collections')
      .update({ is_private: isPrivate })
      .eq('id', params.id)
      .eq('patron_id', user.id)

    if (error) throw error
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 