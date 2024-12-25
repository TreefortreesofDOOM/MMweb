'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import { uploadArtworkImage } from '@/app/actions/upload';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export interface ArtworkImage {
  url: string;
  isPrimary: boolean;
  order: number;
}

interface UploadProgress {
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface ArtworkUploadProps {
  userId: string;
  onImagesChange: (images: ArtworkImage[]) => void;
  onError: (error: string) => void;
}

export function ArtworkUpload({ userId, onImagesChange, onError }: ArtworkUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'pending'
  });
  const [images, setImages] = useState<ArtworkImage[]>([]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress({
      progress: 0,
      status: 'pending'
    });

    try {
      // Validate file
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size must be less than 5MB');
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error('File must be a JPG, PNG, or WebP image');
      }

      // Update status to uploading
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

      // Update progress on success
      setUploadProgress({
        progress: 100,
        status: 'success'
      });

      // Add new image to the list
      const newImage: ArtworkImage = {
        url: result.url,
        isPrimary: images.length === 0, // First image is primary by default
        order: images.length
      };

      const updatedImages = [...images, newImage];
      setImages(updatedImages);
      onImagesChange(updatedImages);
    } catch (err: any) {
      // Update progress on error
      setUploadProgress({
        progress: 0,
        status: 'error',
        error: err.message || 'Upload failed'
      });
      onError(err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  }

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
        isPrimary: img.isPrimary || index === 0 // Make first image primary if we removed the primary
      }));
    setImages(updatedImages);
    onImagesChange(updatedImages);
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image">Images</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept={ALLOWED_FILE_TYPES.join(',')}
          required={images.length === 0}
          disabled={isUploading}
          onChange={handleFileChange}
          className="mt-1"
        />
        <p className="text-sm text-gray-500 mt-1">
          Maximum file size: 5MB. Supported formats: JPG, PNG, WebP
        </p>
      </div>

      {/* Upload Progress */}
      {uploadProgress.status !== 'pending' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Upload Status</span>
            <span className={
              uploadProgress.status === 'success' ? 'text-green-600' :
              uploadProgress.status === 'error' ? 'text-red-600' :
              'text-gray-600'
            }>
              {uploadProgress.status === 'success' ? 'Complete' :
               uploadProgress.status === 'error' ? 'Error' :
               'Uploading...'}
            </span>
          </div>
          <Progress 
            value={uploadProgress.progress} 
            className={
              uploadProgress.status === 'success' ? 'bg-green-200' :
              uploadProgress.status === 'error' ? 'bg-red-200' :
              'bg-gray-200'
            }
          />
          {uploadProgress.error && (
            <p className="text-sm text-red-600">{uploadProgress.error}</p>
          )}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image) => (
            <div key={image.url} className="relative aspect-square">
              <Image
                src={image.url}
                alt="Artwork"
                fill
                className="object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                {!image.isPrimary && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleMakePrimary(image.url)}
                  >
                    Make Primary
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => handleRemoveImage(image.url)}
                >
                  ×
                </Button>
              </div>
              {image.isPrimary && (
                <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 