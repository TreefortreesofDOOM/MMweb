import { extractBioFromWebsite } from '@/lib/ai/website-bio-extractor'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { website } = await request.json()
    const response = await extractBioFromWebsite(website)
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to extract bio' },
      { status: 500 }
    )
  }
} 