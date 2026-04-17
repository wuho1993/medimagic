'use client';

import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/src/lib/supabase/client';
import type { AppShellUser } from '@/src/lib/auth/types';
import type { User } from '@supabase/supabase-js';

function mapUser(u: User): AppShellUser {
  const m = u.user_metadata ?? {};
  return {
    id: u.id,
    email: u.email ?? '',
    fullName: m.full_name ?? m.name ?? u.email ?? '',
    role: m.role ?? 'employee',
    employeeCode: m.employee_code ?? null,
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
