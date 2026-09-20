/**
 * Supabase client configuration for public app
 * Uses anon key for public access with RLS enforcement
 * 
 * Browser: Uses singleton pattern to prevent multiple client instances
 * Server: Creates fresh client per request to avoid session leakage
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from './env';

// Browser-side singleton (client-only)
let cachedClient: SupabaseClient | null = null;

export const getAnonClient = (): SupabaseClient => {
  // Server-side: always create fresh client to avoid session leakage
  if (typeof window === 'undefined') {
    const env = getEnv();
    return createClient(env.supabaseUrl, env.supabaseAnonKey);
  }
  
  // Browser-side: use singleton
  if (cachedClient) return cachedClient;
  const env = getEnv();
  cachedClient = createClient(env.supabaseUrl, env.supabaseAnonKey);
  return cachedClient;
};
