import { testDataExtraction } from '@/lib/vertex-ai/test-extraction'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await testDataExtraction()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to extract data' },
      { status: 500 }
    )
  }
} 