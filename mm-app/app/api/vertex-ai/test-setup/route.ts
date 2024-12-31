import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const requiredEnvVars = {
      GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
      GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION,
      GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS
    }

    // Check for missing variables
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      return NextResponse.json({
        error: `Missing required environment variables: ${missingVars.join(', ')}`,
        status: 'error'
      }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Google Cloud environment variables are properly configured',
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION,
      status: 'success'
    })
  } catch (error) {
    console.error('Error in test setup:', error)
    return NextResponse.json(
      { error: 'Failed to verify Google Cloud setup' },
      { status: 500 }
    )
  }
} 