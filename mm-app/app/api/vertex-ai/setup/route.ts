import { NextResponse } from 'next/server'
import { createDataStore, uploadDocuments } from '@/lib/vertex-ai/vertex-client'
import { extractArtistData } from '@/lib/vertex-ai/data-extraction-utils'
import { formatForVertexAI } from '@/lib/vertex-ai/format-utils'

export async function POST() {
  try {
    // Step 1: Extract artist data
    console.log('Starting data extraction...')
    const data = await extractArtistData()
    console.log(`Extracted ${data.profiles.length} artists and ${data.artworks.length} artworks`)

    // Step 2: Format data for Vertex AI
    const formattedData = formatForVertexAI(data)
    console.log(`Formatted ${formattedData.documents.length} documents for Vertex AI`)

    // Step 3: Initialize chat with Gemini
    console.log('Creating data store...')
    const dataStoreId = `artist-discovery-${Date.now()}`
    const dataStore = await createDataStore(
      dataStoreId,
      'Artist Discovery Data Store'
    )
    console.log('Data store created:', dataStore)

    // Step 4: Upload documents
    console.log('Starting document upload...')
    const uploadResponse = await uploadDocuments(dataStoreId, formattedData.documents)
    console.log('Upload response:', uploadResponse)

    return NextResponse.json({
      success: true,
      documentCount: formattedData.documents.length,
      message: uploadResponse.message
    })
  } catch (error) {
    console.error('Error in setup:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    return NextResponse.json(
      { 
        error: 'Failed to set up Vertex AI data store',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 