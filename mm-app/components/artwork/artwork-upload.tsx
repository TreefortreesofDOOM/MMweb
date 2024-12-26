'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { uploadArtworkImage } from '@/lib/actions';
import { Loader2, X, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ArtworkImage {
  url: string;
  isPrimary: boolean;
  order: number;
}

interface ArtworkUploadProps {
  userId: string;
  onImagesChange: (images: ArtworkImage[]) => void;
  onError: (error: string) => void;
  existingImages?: ArtworkImage[];
}

export function ArtworkUpload({ userId, onImagesChange, onError, existingImages = [] }: ArtworkUploadProps) {
  const [images, setImages] = useState<ArtworkImage[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    progress: number;
    status: 'idle' | 'uploading' | 'success' | 'error';
    error?: string;
  }>({
    progress: 0,
    status: 'idle'
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    const file = acceptedFiles[0];

    try {
      setUploadProgress({
        progress: 10,
        status: 'uploading'
      });

      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadArtworkImage(formData);
      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.url) {
        throw new Error('No URL returned from upload');
      }

      setUploadProgress({
        progress: 100,
        status: 'success'
      });

      const newImage: ArtworkImage = {
        url: result.url,
        isPrimary: images.length === 0,
        order: images.length
      };

      const updatedImages = [...images, newImage];
      setImages(updatedImages);
      onImagesChange(updatedImages);
    } catch (err: any) {
      setUploadProgress({
        progress: 0,
        status: 'error',
        error: err.message || 'Upload failed'
      });
      onError(err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  }, [images, onImagesChange, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false,
    onDragEnter: () => {},
    onDragLeave: () => {},
    onDragOver: () => {}
  });

  function handleMakePrimary(url: string) {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.url === url
    }));
    setImages(updatedImages);
    onImagesChange(updatedImages);
  }

  function handleRemoveImage(url: string) {
    const updatedImages = images
      .filter(img => img.url !== url)
      .map((img, index) => ({
        ...img,
        order: index,
        isPrimary: img.isPrimary || index === 0
      }));
    setImages(updatedImages);
    onImagesChange(updatedImages);
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300",
          isDragActive 
            ? "border-primary bg-primary/10 scale-[1.02]" 
            : "border-muted-foreground/25 hover:border-primary/50",
          isUploading && "border-primary/50"
        )}
      >
        <input {...getInputProps()} className="hidden" />
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
            {uploadProgress.progress > 0 && (
              <div className="w-full max-w-xs mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? 'Drop your image here' : 'Drag & drop an image here, or click to select'}
            </p>
          </div>
        )}
      </div>

      {uploadProgress.status === 'error' && (
        <p className="text-sm text-destructive">{uploadProgress.error}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={image.url} className="relative group">
            <Image
              src={image.url}
              alt={`Uploaded image ${index + 1}`}
              width={200}
              height={200}
              className="rounded-lg object-cover w-full h-40 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
              <Button
                variant={image.isPrimary ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleMakePrimary(image.url)}
                className={cn(
                  "mr-2 bg-white/10 hover:bg-white/20",
                  image.isPrimary && "border-primary"
                )}
                disabled={image.isPrimary}
              >
                {image.isPrimary ? 'Primary' : 'Make Primary'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveImage(image.url)}
                className="bg-white/10 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 