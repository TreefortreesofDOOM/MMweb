import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Wand2, FileText, Image, BookOpen } from "lucide-react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { useUnifiedAIActions } from "@/lib/unified-ai/hooks";

interface AIArtistAssistantProps {
  className?: string;
}

export function AIArtistAssistant({ className }: AIArtistAssistantProps) {
  const { setOpen, setMode } = useUnifiedAIActions();
  
  const openChat = useCallback(() => {
    setMode('chat');
    setOpen(true);
  }, [setMode, setOpen]);

  return (
    <Card className={cn(
      "border-2 border-muted shadow-lg hover:shadow-xl transition-shadow duration-300",
      className
    )}>
      <CardHeader className="space-y-1 bg-gradient-to-r from-purple-200/80 to-indigo-300/80 dark:from-purple-900 dark:to-indigo-900">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-primary">AI Artist Assistant</CardTitle>
            <CardDescription className="text-muted-foreground">
              Get help with portfolio management, artwork descriptions, and professional development
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Button 
            asChild 
            variant="outline" 
            className="relative h-auto min-h-[120px] p-4 overflow-hidden hover:bg-muted flex flex-col justify-start items-stretch"
          >
            <Link href="/artist/bio" className="flex flex-col gap-2 text-left h-full">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="font-medium">Bio Generator</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-normal">
                Create a professional artist bio from your website or portfolio
              </p>
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline" 
            className="relative h-auto min-h-[120px] p-4 overflow-hidden hover:bg-muted flex flex-col justify-start items-stretch"
          >
            <Link href="/artist/artworks/new" className="flex flex-col gap-2 text-left h-full">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="font-medium">Artwork Analysis</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-normal">
                Upload artwork to get automatic AI analysis.
              </p>
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline" 
            className="relative h-auto min-h-[120px] p-4 overflow-hidden hover:bg-muted flex flex-col justify-start items-stretch"
          >
            <Link href="/artist/analyze-portfolio" className="flex flex-col gap-2 text-left h-full">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="font-medium">Portfolio Analysis</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-normal">
                Get AI-powered insights to optimize your portfolio
              </p>
            </Link>
          </Button>

          <Button 
            variant="outline" 
            className="relative h-auto min-h-[120px] p-4 overflow-hidden hover:bg-muted flex flex-col justify-start items-stretch"
            onClick={openChat}
          >
            <div className="flex flex-col gap-2 text-left h-full">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="font-medium">AI Assistant</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-normal">
                Chat with the AI assistant for personalized help
              </p>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 