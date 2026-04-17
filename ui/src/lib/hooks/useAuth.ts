'use client';

import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/src/lib/supabase/client';
import type { AppShellUser } from '@/src/lib/auth/session';
import { normalizeRole, getRoleLabel } from '@/src/lib/auth/roles';
import { normalizeAccessScope } from '@/src/lib/auth/access';
import type { User } from '@supabase/supabase-js';

function mapUser(u: User): AppShellUser {
  const m = u.user_metadata ?? {};
  const am = u.app_metadata ?? {};
  const role = normalizeRole(m.role ?? am.role ?? null);
  const accessScope = normalizeAccessScope(m.access_scope ?? am.access_scope ?? null, role);
  return {
    email: u.email ?? null,
    fullName: m.full_name ?? m.name ?? u.email?.split('@')[0] ?? 'User',
    role,
    roleLabel: getRoleLabel(role),
    accessScope,
  };
}

export function useAuth() {
  const [user, setUser] = useState<AppShellUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? mapUser(data.user) : null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signOut };
}
