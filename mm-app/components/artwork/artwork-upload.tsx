'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadArtworkImage } from '@/lib/actions';
import { Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils/core/common-utils';
import { SortableImageGrid } from './sortable-image-grid';

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

  function handleReorder(reorderedImages: ArtworkImage[]) {
    setImages(reorderedImages);
    onImagesChange(reorderedImages);
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

      {images.length > 0 && (
        <SortableImageGrid
          images={images}
          onReorder={handleReorder}
          onMakePrimary={handleMakePrimary}
          onRemove={handleRemoveImage}
        />
      )}
    </div>
  );
} 