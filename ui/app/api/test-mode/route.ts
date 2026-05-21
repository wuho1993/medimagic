import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRouteUser } from '@/src/lib/supabase/route';
import { getSupabaseEnv } from '@/src/lib/supabase/config';

const ACTIVE_TEST_MODE_SESSION_COOKIE = 'medi_magic_test_mode_session';

function createServiceClient() {
  const { url } = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Test mode needs service role access to snapshot and restore data.');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function jsonError(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET() {
  const { user } = await getRouteUser();
  if (!user) {
    return jsonError('Unauthorized', 401);
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('test_mode_sessions')
      .select('id, status, started_at, finished_at, restored_at, table_count, row_count, error_message, created_by_email')
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ ok: true, activeSession: data ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user } = await getRouteUser();
  if (!user) {
    return jsonError('Unauthorized', 401);
  }

  let payload: { action?: string; sessionId?: string } = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  try {
    const supabase = createServiceClient();

    if (payload.action === 'start') {
      const { data: existing, error: existingError } = await supabase
        .from('test_mode_sessions')
        .select('id, status, started_at, table_count, row_count, created_by_email')
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingError) {
        return jsonError(existingError.message, 500);
      }

      if (existing?.id) {
        const response = NextResponse.json({ ok: true, sessionId: existing.id, activeSession: existing, reused: true });
        response.cookies.set(ACTIVE_TEST_MODE_SESSION_COOKIE, existing.id, { path: '/', sameSite: 'lax' });
        return response;
      }

      const { data, error } = await supabase.rpc('start_test_mode_snapshot', {
        p_user_id: user.id,
        p_user_email: user.email ?? null,
      });

      if (error) {
        return jsonError(error.message, 500);
      }

      const sessionId = String(data);
      const response = NextResponse.json({ ok: true, sessionId });
      response.cookies.set(ACTIVE_TEST_MODE_SESSION_COOKIE, sessionId, { path: '/', sameSite: 'lax' });
      return response;
    }

    if (payload.action === 'finish') {
      const sessionId = payload.sessionId || request.cookies.get(ACTIVE_TEST_MODE_SESSION_COOKIE)?.value;
      if (!sessionId) {
        return NextResponse.json({ ok: true, skipped: true });
      }

      const { error } = await supabase.rpc('finish_test_mode_snapshot', {
        p_session_id: sessionId,
      });

      if (error) {
        return jsonError(error.message, 500);
      }

      const response = NextResponse.json({ ok: true, sessionId });
      response.cookies.delete(ACTIVE_TEST_MODE_SESSION_COOKIE);
      return response;
    }

    return jsonError('Unsupported test mode action.', 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, 500);
  }
}
