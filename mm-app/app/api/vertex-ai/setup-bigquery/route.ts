import { NextResponse } from 'next/server'
import { setupBigQueryTable } from '@/lib/vertex-ai/bigquery-setup'
import path from 'path'

export async function POST() {
  try {
    console.log('Starting BigQuery setup route...')
    
    // Check environment
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    const absolutePath = credentialsPath ? path.resolve(process.cwd(), credentialsPath) : null
    
    console.log('Environment check:', {
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      credentialsPath,
      absolutePath,
      credentialsExist: absolutePath ? require('fs').existsSync(absolutePath) : false,
      location: process.env.GOOGLE_CLOUD_LOCATION,
      cwd: process.cwd()
    })
    
    const result = await setupBigQueryTable()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in setup-bigquery route:', error)
    let errorDetails = ''
    let errorObj = {}
    
    if (error instanceof Error) {
      errorDetails = error.message
      errorObj = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      }
      console.error('Full error details:', errorObj)
    } else {
      errorDetails = String(error)
      errorObj = { raw: error }
      console.error('Non-Error object thrown:', error)
    }
    
    return NextResponse.json({
      error: 'Failed to set up BigQuery table',
      details: errorDetails,
      errorInfo: errorObj,
      env: {
        project: process.env.GOOGLE_CLOUD_PROJECT,
        hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
        credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS
      }
    }, { status: 500 })
  }
} 