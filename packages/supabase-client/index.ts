/**
 * Shared Supabase client factory
 * Provides consistent client initialization across apps
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedService: SupabaseClient | null = null;
let cachedAnon: SupabaseClient | null = null;

/**
 * Get anon client for public access (RLS-enforced)
 * Should be used for client-side operations and public API routes
 */
export function getAnonClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
): SupabaseClient {
  if (cachedAnon) return cachedAnon;
  cachedAnon = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return cachedAnon;
}

/**
 * Get service role client for admin operations (bypasses RLS)
 * Should ONLY be used server-side in API routes or server actions
 */
export function getServiceClient(
  supabaseUrl: string,
  supabaseServiceKey: string,
): SupabaseClient {
  if (cachedService) return cachedService;
  cachedService = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cachedService;
}

/**
 * Create a new client instance (not cached)
 * Useful for scenarios where you need separate client instances
 */
export function createClientInstance(
  supabaseUrl: string,
  supabaseKey: string,
  options?: {
    persistSession?: boolean;
    autoRefreshToken?: boolean;
  },
): SupabaseClient {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: options?.persistSession ?? true,
      autoRefreshToken: options?.autoRefreshToken ?? true,
    },
  });
}

/**
 * Realtime subscription helpers
 */
export interface RealtimeSubscriptionOptions {
  table: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

/**
 * Subscribe to realtime changes on a table
 */
export function subscribeToTable(
  client: SupabaseClient,
  options: RealtimeSubscriptionOptions,
) {
  const { table, filter, onInsert, onUpdate, onDelete } = options;

  let channel = client.channel(`table-${table}`);

  if (filter) {
    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      (payload) => {
        switch (payload.eventType) {
          case 'INSERT':
            onInsert?.(payload);
            break;
          case 'UPDATE':
            onUpdate?.(payload);
            break;
          case 'DELETE':
            onDelete?.(payload);
            break;
        }
      },
    );
  } else {
    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
      },
      (payload) => {
        switch (payload.eventType) {
          case 'INSERT':
            onInsert?.(payload);
            break;
          case 'UPDATE':
            onUpdate?.(payload);
            break;
          case 'DELETE':
            onDelete?.(payload);
            break;
        }
      },
    );
  }

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log(`[realtime] Subscribed to ${table}`);
    }
  });

  return channel;
}

/**
 * Unsubscribe from a realtime channel
 */
export function unsubscribeFromChannel(channel: any) {
  channel.unsubscribe();
}
