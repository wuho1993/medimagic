import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from './config';

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
