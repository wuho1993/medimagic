import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import {
  normalizeApiError,
  normalizeApiRole,
  parseString,
  requireAdminApiAccess,
} from '@/src/lib/api/admin';

type UserPayload = {
  userId?: string;
  email?: string;
  password?: string;
  fullName?: string;
  role?: string;
};

function mapUser(user: {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
}) {
  const role = normalizeApiRole(user.user_metadata?.role ?? user.app_metadata?.role ?? 'employee');

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''),
    role,
    emailConfirmedAt: user.email_confirmed_at ?? null,
    lastSignInAt: user.last_sign_in_at ?? null,
  };
}

function revalidateUserPaths() {
  revalidatePath('/app/admin');
}

export async function GET() {
  try {
    await requireAdminApiAccess();
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ data: data.users.map(mapUser) });
  } catch (error) {
    return normalizeApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminApiAccess();

    const body = (await request.json()) as UserPayload;
    const email = parseString(body.email).toLowerCase();
    const password = parseString(body.password);
    const fullName = parseString(body.fullName);
    const role = normalizeApiRole(body.role);

    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
      },
      app_metadata: {
        role,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidateUserPaths();
    return NextResponse.json({ data: data.user ? mapUser(data.user) : null }, { status: 201 });
  } catch (error) {
    return normalizeApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminApiAccess();

    const body = (await request.json()) as UserPayload;
    const userId = parseString(body.userId);
    const role = normalizeApiRole(body.role);

    if (!userId) {
      throw new Error('User ID is required.');
    }

    const supabase = createSupabaseAdminClient();
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.admin.getUserById(userId);

    if (getUserError || !user) {
      throw new Error(getUserError?.message ?? 'User not found.');
    }

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...(user.user_metadata ?? {}),
        role,
      },
      app_metadata: {
        ...(user.app_metadata ?? {}),
        role,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidateUserPaths();
    return NextResponse.json({ data: data.user ? mapUser(data.user) : null });
  } catch (error) {
    return normalizeApiError(error);
  }
}