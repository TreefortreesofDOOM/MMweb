'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface AIConfig {
  temperature: number;
  maxOutputTokens: number;
  useArtExpertContext: boolean;
}

export function TestChat() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AIConfig>({
    temperature: 0.7,
    maxOutputTokens: 2048,
    useArtExpertContext: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          config: {
            temperature: config.temperature,
            maxOutputTokens: config.maxOutputTokens,
          },
          useArtExpertContext: config.useArtExpertContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setResponse(data.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI Art Consultant Test</CardTitle>
        <CardDescription>
          Test the AI art consultant with different settings and contexts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="temperature">Temperature (Creativity)</Label>
                <span className="text-sm text-muted-foreground w-12">
                  {config.temperature.toFixed(1)}
                </span>
              </div>
              <Slider
                id="temperature"
                value={[config.temperature]}
                onValueChange={(value) => 
                  setConfig(prev => ({ ...prev, temperature: value[0] }))
                }
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <p className="text-sm text-muted-foreground">
                Lower values make responses more focused, higher values more creative.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="tokens">Max Output Tokens</Label>
                <span className="text-sm text-muted-foreground w-16">
                  {config.maxOutputTokens}
                </span>
              </div>
              <Slider
                id="tokens"
                value={[config.maxOutputTokens]}
                onValueChange={(value) => 
                  setConfig(prev => ({ ...prev, maxOutputTokens: value[0] }))
                }
                min={256}
                max={4096}
                step={256}
                className="flex-1"
              />
              <p className="text-sm text-muted-foreground">
                Controls the maximum length of the AI's response.
              </p>
            </div>

            <div className="flex items-center justify-between space-x-2 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="context">Art Expert Context</Label>
                <p className="text-sm text-muted-foreground">
                  Enable specialized art knowledge and terminology.
                </p>
              </div>
              <Switch
                id="context"
                checked={config.useArtExpertContext}
                onCheckedChange={(checked) =>
                  setConfig(prev => ({ ...prev, useArtExpertContext: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Your Prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !prompt}
            className="w-full"
          >
            {isLoading ? 'Generating...' : 'Generate Response'}
          </Button>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {response && (
            <div className="mt-4 p-4 rounded-lg bg-muted">
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
} 