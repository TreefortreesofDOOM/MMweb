'use server'

import { extractArtistData } from './extract-data'
import { formatForVertexAI } from './format'

export async function testDataExtraction() {
  try {
    console.log('Starting data extraction...')
    
    const data = await extractArtistData()
    console.log(`Extracted ${data.profiles.length} artists and ${data.artworks.length} artworks`)
    
    const formattedData = formatForVertexAI(data)
    console.log(`Formatted ${formattedData.documents.length} documents for Vertex AI`)
    
    // Log a sample document
    if (formattedData.documents.length > 0) {
      console.log('\nSample document:')
      console.log(JSON.stringify(formattedData.documents[0], null, 2))
    }
    
    return formattedData
  } catch (error) {
    console.error('Error in test extraction:', error)
    throw error
  }
} 