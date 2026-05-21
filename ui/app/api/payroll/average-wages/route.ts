import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { canAccessRoute, getRoleLabel, normalizeRole } from '@/src/lib/auth/roles';
import { normalizeAccessScope } from '@/src/lib/auth/access';
import { createBrowserSupabaseClient } from '@/src/lib/supabase/client';
import { getSupabaseEnv } from '@/src/lib/supabase/config';
import { fetchCommissionAverageAuditRecords } from '@/src/lib/employees/queries';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';
  const supabase = createBrowserSupabaseClient();
  const { data, error } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();
  const authUser = error ? null : data.user;
  const metadata = authUser?.user_metadata as { full_name?: string; name?: string; role?: string; access_scope?: unknown } | undefined;
  const appMetadata = authUser?.app_metadata as { role?: string; access_scope?: unknown } | undefined;
  const role = normalizeRole(metadata?.role ?? appMetadata?.role ?? null);
  const user = authUser ? {
    email: authUser.email ?? null,
    fullName: metadata?.full_name ?? metadata?.name ?? authUser.email?.split('@')[0] ?? 'User',
    role,
    roleLabel: getRoleLabel(role),
    accessScope: normalizeAccessScope(metadata?.access_scope ?? appMetadata?.access_scope ?? null, role),
  } : null;

  if (!user || !canAccessRoute(user.role, 'payroll')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') ?? '';
  const selectedMonth = /^\d{4}-\d{2}$/.test(month)
    ? month
    : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const { url, anonKey } = getSupabaseEnv();
  const scopedSupabase = token
    ? createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    : supabase;

  const records = await fetchCommissionAverageAuditRecords(user, selectedMonth, scopedSupabase);
  return NextResponse.json({ records });
}
