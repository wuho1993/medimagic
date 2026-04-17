const dbHost = process.env.SUPABASE_DB_HOST;
const projectRef = dbHost?.replace(/^db\./, '').replace(/\.supabase\.co$/, '');

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  (projectRef ? `https://${projectRef}.supabase.co` : undefined);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase client config. Set NEXT_PUBLIC_SUPABASE_ANON_KEY and either NEXT_PUBLIC_SUPABASE_URL, SUPABASE_URL, or SUPABASE_DB_HOST.'
    );
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  };
}
