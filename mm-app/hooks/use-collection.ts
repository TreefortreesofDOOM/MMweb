'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function useCollection() {
  const [isLoading, setIsLoading] = useState(false);

  const removeItem = async (collectionId: string, artworkId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/collections/${collectionId}/items/${artworkId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove item');
      toast.success('Item removed from collection');
    } catch (error) {
      toast.error('Failed to remove item from collection');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const moveItems = async (sourceCollectionId: string, targetCollectionId: string, artworkIds: string[]) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/collections/${sourceCollectionId}/move`, {
        method: 'POST',
        body: JSON.stringify({ targetCollectionId, artworkIds }),
      });
      if (!res.ok) throw new Error('Failed to move items');
      toast.success('Items moved successfully');
    } catch (error) {
      toast.error('Failed to move items');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotes = async (collectionId: string, artworkId: string, notes: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/collections/${collectionId}/items/${artworkId}/notes`, {
        method: 'PATCH',
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Failed to update notes');
      toast.success('Notes updated');
    } catch (error) {
      toast.error('Failed to update notes');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrder = async (collectionId: string, items: { id: string; order: number }[]) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/collections/${collectionId}/order`, {
        method: 'PATCH',
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error('Failed to update order');
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to update order');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    removeItem,
    moveItems,
    updateNotes,
    updateOrder,
  };
} 