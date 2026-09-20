/**
 * Realtime subscription utilities for the public app
 * Subscribes to database changes for live updates
 */
import { getAnonClient } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type ProductChangeHandler = (payload: {
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}) => void;

/**
 * Subscribe to published product changes (INSERT and UPDATE)
 * Returns a channel that can be used to unsubscribe
 */
export function subscribeToProducts(
  onInsert: ProductChangeHandler,
  onUpdate: ProductChangeHandler
): RealtimeChannel {
  const supabase = getAnonClient();

  const channel = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'products',
        filter: 'status=eq.published',
      },
      onInsert
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'products',
        filter: 'status=eq.published',
      },
      onUpdate
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Realtime] Subscribed to products changes');
      } else if (status === 'CLOSED') {
        console.log('[Realtime] Products subscription closed');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Realtime] Products subscription error');
      }
    });

  return channel;
}

/**
 * Unsubscribe from a realtime channel
 */
export function unsubscribeFromChannel(channel: RealtimeChannel): void {
  const supabase = getAnonClient();
  supabase.removeChannel(channel);
}

/**
 * Subscribe to a specific category's products
 */
export function subscribeToCategoryProducts(
  categoryId: string,
  onInsert: ProductChangeHandler,
  onUpdate: ProductChangeHandler
): RealtimeChannel {
  const supabase = getAnonClient();

  const channel = supabase
    .channel(`category-${categoryId}-changes`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'products',
        filter: `category_id=eq.${categoryId}&status=eq.published`,
      },
      onInsert
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'products',
        filter: `category_id=eq.${categoryId}&status=eq.published`,
      },
      onUpdate
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Subscribed to category ${categoryId} products changes`);
      } else if (status === 'CLOSED') {
        console.log(`[Realtime] Category ${categoryId} subscription closed`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[Realtime] Category ${categoryId} subscription error`);
      }
    });

  return channel;
}
