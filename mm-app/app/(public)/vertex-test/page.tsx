'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VertexTestPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTest = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/vertex-ai/test')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to extract data')
      }
      
      setData(result.data)
    } catch (err) {
      console.error('Test error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vertex AI Data Extraction Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleTest} 
            disabled={loading}
          >
            {loading ? 'Extracting Data...' : 'Test Data Extraction'}
          </Button>

          {error && (
            <div className="text-red-500">
              Error: {error}
            </div>
          )}

          {data && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Summary:</h3>
                <p>Total Documents: {data.documents.length}</p>
                <p>Artists: {data.documents.filter((d: any) => d.metadata.type === 'artist').length}</p>
                <p>Artworks: {data.documents.filter((d: any) => d.metadata.type === 'artwork').length}</p>
              </div>

              <div>
                <h3 className="font-semibold">Sample Document:</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(data.documents[0], null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 