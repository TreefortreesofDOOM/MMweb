'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface PatronAssistantProps {
  artworkId: string;
  imageUrl: string;
}

export function PatronAssistant({ artworkId, imageUrl }: PatronAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          artworkId,
          imageUrl,
          role: 'patron'
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');
      
      const data = await res.json();
      setResponse(data.response);
      setPrompt('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Tell me more about this artwork's style and technique",
    "What makes this piece unique?",
    "How does this fit into current art trends?",
    "What should I look for in this piece?",
    "Suggest similar artworks I might like",
    "Help me understand the artist's perspective"
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="suggestions">Quick Questions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="space-y-4">
          {response && (
            <Card>
              <CardContent className="pt-6">
                <p className="whitespace-pre-wrap">{response}</p>
              </CardContent>
            </Card>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Ask about the artwork..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
            <Button type="submit" disabled={isLoading || !prompt.trim()}>
              {isLoading ? 'Thinking...' : 'Ask AI Assistant'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickPrompts.map((quickPrompt) => (
              <Button
                key={quickPrompt}
                variant="outline"
                className="h-auto py-4 px-6 text-left"
                onClick={() => {
                  setPrompt(quickPrompt);
                  // Switch to chat tab
                  const chatTrigger = document.querySelector('[value="chat"]');
                  if (chatTrigger instanceof HTMLButtonElement) {
                    chatTrigger.click();
                  }
                }}
              >
                {quickPrompt}
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 