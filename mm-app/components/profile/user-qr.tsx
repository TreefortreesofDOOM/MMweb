'use client';

import { useState, useCallback, useEffect } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils/core/common-utils';
import { AlertCircle } from 'lucide-react';

interface UserQRProps {
  userId: string;
  username: string;
}

export function UserQR({ userId, username }: UserQRProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [qrValue, setQrValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBrightnessHint, setShowBrightnessHint] = useState(false);
  const { toast } = useToast();

  const handleLinkGenerate = useCallback(async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const userLink = `${baseUrl}/gallery/visit/${userId}`;
      setQrValue(userLink);
    } catch (error) {
      console.error('Error generating user link:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  const handleFullScreenToggle = useCallback(() => {
    setIsFullScreen(prev => !prev);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    // Show brightness hint when entering full screen
    if (!isFullScreen) {
      setShowBrightnessHint(true);
      setTimeout(() => setShowBrightnessHint(false), 3000);
    }
  }, [isFullScreen]);

  // Generate QR code on component mount
  useEffect(() => {
    handleLinkGenerate();
  }, [handleLinkGenerate]);

  return (
    <div className={cn(
      "flex flex-col items-center gap-4",
      isFullScreen && "fixed inset-0 z-50 bg-black"
    )}>
      {!isFullScreen && (
        <Button
          onClick={handleLinkGenerate}
          disabled={isLoading}
          className="mb-4"
        >
          {isLoading ? 'Generating...' : 'Refresh QR Code'}
        </Button>
      )}

      {qrValue && (
        <div 
          className={cn(
            "flex flex-col items-center gap-4",
            isFullScreen && "h-full w-full flex justify-center items-center"
          )}
          onClick={handleFullScreenToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleFullScreenToggle()}
          aria-label={isFullScreen ? "Exit full screen QR code" : "View full screen QR code"}
        >
          <div className={cn(
            "bg-white p-4 rounded-lg transition-transform duration-300",
            isFullScreen && "p-8 scale-150"
          )}>
            <QRCode
              value={qrValue}
              size={isFullScreen ? 300 : 200}
              level="H"
              includeMargin
            />
          </div>
          
          {!isFullScreen && (
            <p className="text-sm text-muted-foreground text-center">
              Tap QR code to view full screen
            </p>
          )}
          
          {isFullScreen && showBrightnessHint && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">
                Increase screen brightness for better scanning
              </p>
            </div>
          )}
          
          {isFullScreen && (
            <p className="text-white text-lg mt-4">
              Tap anywhere to exit full screen
            </p>
          )}
        </div>
      )}
    </div>
  );
} 