

import { cache } from 'react';
import { normalizeAccessScope, type UserAccessScope } from '@/src/lib/auth/access';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import { getRoleLabel, normalizeRole, type AppRole } from '@/src/lib/auth/roles';

export type AppShellUser = {
  email: string | null;
  fullName: string;
  role: AppRole;
  roleLabel: string;
  accessScope: UserAccessScope;
};

function getFallbackName(email: string | null) {
  if (!email) {
    return 'User';
  }

  return email.split('@')[0].replace(/[._-]+/g, ' ');
}

export const getCurrentUser = cache(async (): Promise<AppShellUser | null> => {
  const supabase = await createServerSupabaseClient();

  let user = null;

  try {
    const {
      data: { user: resolvedUser },
    } = await supabase.auth.getUser();
    user = resolvedUser;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Supabase auth lookup failed; treating request as signed out:', error);
    }
    return null;
  }

  if (!user) {
    return null;
  }

  const metadata = user.user_metadata as {
    full_name?: string;
    name?: string;
    role?: string;
    access_scope?: unknown;
  } | null;
  const appMetadata = user.app_metadata as {
    role?: string;
    access_scope?: unknown;
  } | null;
  const role = normalizeRole(metadata?.role ?? appMetadata?.role ?? null);
  const accessScope = normalizeAccessScope(metadata?.access_scope ?? appMetadata?.access_scope ?? null, role);

  return {
    email: user.email ?? null,
    fullName: metadata?.full_name ?? metadata?.name ?? getFallbackName(user.email ?? null),
    role,
    roleLabel: getRoleLabel(role),
    accessScope,
  };
});