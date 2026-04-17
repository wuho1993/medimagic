import { createBrowserSupabaseClient } from './client';
export async function createServerSupabaseClient() {
  return createBrowserSupabaseClient();
}
