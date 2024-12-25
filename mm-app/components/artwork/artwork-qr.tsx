'use client';

import { useState } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface ArtworkQRProps {
  artworkId: string;
  title: string;
}

export function ArtworkQR({ artworkId, title }: ArtworkQRProps) {
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generatePaymentLink = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate payment link');
      }

      const { url } = await response.json();
      setPaymentUrl(url);
    } catch (error) {
      console.error('Error generating payment link:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate payment link',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${title.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Button
        onClick={generatePaymentLink}
        disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate Payment QR Code'}
      </Button>

      {paymentUrl && (
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCode
              value={paymentUrl}
              size={200}
              level="H"
              includeMargin
            />
          </div>
          <Button onClick={downloadQR}>
            Download QR Code
          </Button>
        </div>
      )}
    </div>
  );
} 