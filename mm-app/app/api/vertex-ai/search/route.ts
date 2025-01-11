import { NextResponse } from 'next/server'
import { aiArtistSearch } from '@/lib/vertex-ai/ai-search'

export async function GET(request: Request) {
  try {
    // Get the search query from URL parameters
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    console.log('Received search request with query:', query)

    if (!query) {
      console.log('No query provided')
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Perform the search
    console.log('Calling aiArtistSearch with query:', query)
    const results = await aiArtistSearch(query)
    console.log('Search results:', JSON.stringify(results, null, 2))

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error in search endpoint:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      })
    }
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 