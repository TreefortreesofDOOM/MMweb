'use server'

import { v1, protos } from '@google-cloud/discoveryengine'

// Initialize the Discovery Engine clients
const dataStoreClient = new v1.DataStoreServiceClient({
  apiEndpoint: 'discoveryengine.googleapis.com'
})
const documentClient = new v1.DocumentServiceClient({
  apiEndpoint: 'discoveryengine.googleapis.com'
})
const searchClient = new v1.SearchServiceClient({
  apiEndpoint: 'discoveryengine.googleapis.com'
})

const projectId = process.env.GOOGLE_CLOUD_PROJECT!
const location = 'global' // Using global location for full feature set

export async function createDataStore(name: string, displayName: string) {
  console.log('Creating data store with params:', { name, displayName })
  try {
    const createRequest = {
      parent: `projects/${projectId}/locations/${location}/collections/default_collection`,
      dataStoreId: name,
      dataStore: {
        displayName,
        solutionTypes: [protos.google.cloud.discoveryengine.v1.SolutionType.SOLUTION_TYPE_SEARCH],
        contentConfig: protos.google.cloud.discoveryengine.v1.DataStore.ContentConfig.CONTENT_REQUIRED,
        industryVertical: 'GENERIC' as const,
        engineConfig: {
          dataStoreConfig: {
            sourceConfig: {
              source: 'STRUCTURED_DATA'
            }
          }
        }
      }
    }

    const [operation] = await dataStoreClient.createDataStore(createRequest)
    const [dataStore] = await operation.promise()

    console.log('Data store created:', dataStore)
    return dataStore
  } catch (error) {
    console.error('Error creating data store:', error)
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

export async function uploadDocuments(dataStoreId: string, documents: any[]) {
  console.log('Starting document upload with params:', { dataStoreId, documentCount: documents.length })
  try {
    const parent = `projects/${projectId}/locations/${location}/dataStores/${dataStoreId}/branches/default_branch`
    
    // Upload documents in batches
    const batchSize = 100 // Vertex AI Search can handle larger batches
    const batches = []
    for (let i = 0; i < documents.length; i += batchSize) {
      batches.push(documents.slice(i, i + batchSize))
    }

    console.log(`Processing ${batches.length} batches of documents...`)

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      console.log(`Uploading batch ${i + 1}/${batches.length}...`)
      
      // Convert documents to the correct format
      const documentsToImport = batch.map(doc => ({
        id: doc.id,
        jsonData: doc
      }))

      const importRequest = {
        parent,
        inputConfig: {
          jsonRecordsInputConfig: {
            jsonRecords: {
              records: documentsToImport
            }
          }
        },
        reconciliationMode: protos.google.cloud.discoveryengine.v1.ImportDocumentsRequest.ReconciliationMode.INCREMENTAL
      }

      const [operation] = await documentClient.importDocuments(importRequest)
      const [response] = await operation.promise()
      console.log(`Batch ${i + 1}/${batches.length} uploaded:`, response)
    }

    return { success: true, message: 'All documents uploaded successfully' }
  } catch (error) {
    console.error('Error uploading documents:', error)
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

export async function searchDataStore(dataStoreId: string, query: string) {
  console.log('Starting search with params:', { dataStoreId, query, projectId, location })
  try {
    const searchRequest = {
      servingConfig: `projects/${projectId}/locations/${location}/dataStores/${dataStoreId}/servingConfigs/default_config`,
      query,
      pageSize: 50,
      queryExpansionSpec: {
        condition: protos.google.cloud.discoveryengine.v1.SearchRequest.QueryExpansionSpec.Condition.AUTO
      }
    }

    console.log('Search request:', JSON.stringify(searchRequest, null, 2))
    const [response] = await searchClient.search(searchRequest)
    console.log('Raw search response:', JSON.stringify(response, null, 2))
    return response
  } catch (error) {
    console.error('Error searching data store:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      })
    }
    throw error
  }
}

export async function deleteDataStore(dataStoreId: string) {
  console.log('Deleting data store:', dataStoreId)
  try {
    const deleteRequest = {
      name: `projects/${projectId}/locations/${location}/dataStores/${dataStoreId}`
    }

    const [operation] = await dataStoreClient.deleteDataStore(deleteRequest)
    const response = await operation.promise()
    console.log('Delete response:', response)
    return response
  } catch (error) {
    console.error('Error deleting data store:', error)
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