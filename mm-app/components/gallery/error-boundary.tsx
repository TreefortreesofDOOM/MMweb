'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { GalleryError } from '@/lib/utils/error/error-service-utils';
import { GALLERY_ERROR_CODES } from '@/lib/constants/error-codes';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const isValidationError = (code: string): boolean => {
  return Object.keys(GALLERY_ERROR_CODES.VALIDATION).some(key => 
    GALLERY_ERROR_CODES.VALIDATION[key as keyof typeof GALLERY_ERROR_CODES.VALIDATION] === code
  );
};

function GalleryErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const galleryError = error as GalleryError;
  
  return (
    <div role="alert" className="p-4 border rounded-lg bg-destructive/10">
      <h2 className="font-semibold text-destructive">
        {isValidationError(galleryError.code) ? 'Invalid Input' : 'Something went wrong'}
      </h2>
      <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      <Button 
        onClick={resetErrorBoundary} 
        variant="outline" 
        className="mt-4"
      >
        Try Again
      </Button>
    </div>
  );
}

export function GalleryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary 
      FallbackComponent={GalleryErrorFallback}
      onReset={() => {
        // Optional: Add any cleanup here
      }}
    >
      {children}
    </ErrorBoundary>
  );
} 