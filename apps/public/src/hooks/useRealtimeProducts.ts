/**
 * React hook for subscribing to realtime product changes
 * Automatically handles subscription lifecycle (subscribe on mount, unsubscribe on unmount)
 */
import { useEffect, useRef } from 'react';
import { subscribeToProducts, subscribeToCategoryProducts, unsubscribeFromChannel, ProductChangeHandler } from '@/lib/realtime';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeProducts(
  onInsert: ProductChangeHandler,
  onUpdate: ProductChangeHandler
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Subscribe to product changes
    channelRef.current = subscribeToProducts(onInsert, onUpdate);

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [onInsert, onUpdate]);
}

/**
 * React hook for subscribing to realtime changes for a specific category
 */
export function useRealtimeCategoryProducts(
  categoryId: string,
  onInsert: ProductChangeHandler,
  onUpdate: ProductChangeHandler
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!categoryId) return;

    // Subscribe to category-specific product changes
    channelRef.current = subscribeToCategoryProducts(categoryId, onInsert, onUpdate);

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [categoryId, onInsert, onUpdate]);
}
