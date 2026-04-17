import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { fetchSystemManagementData } from '@/src/lib/system-management/queries';
import {
  normalizeApiError,
  parseMasterDataTable,
  parseString,
  requireAdminApiAccess,
  type MasterDataTable,
} from '@/src/lib/api/admin';

type MasterDataPayload = {
  table?: string;
  id?: string;
  code?: string;
  nameZh?: string;
  nameEn?: string;
};

async function readTable(table: MasterDataTable) {
  const supabase = createSupabaseAdminClient();
  const query = supabase.from(table).select('id, code, name_zh, name_en').order('name_zh');

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

function buildPayload(table: MasterDataTable, body: MasterDataPayload) {
  const code = parseString(body.code);
  const nameZh = parseString(body.nameZh);
  const nameEn = parseString(body.nameEn);

  if (!code || !nameZh || !nameEn) {
    throw new Error('Code, Chinese name, and English name are required.');
  }

  const payload: Record<string, string> = {
    code,
    name_zh: nameZh,
    name_en: nameEn,
  };

  return payload;
}

function revalidateAdminPaths() {
  revalidatePath('/app/admin');
  revalidatePath('/app/people');
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminApiAccess();

    const tableQuery = request.nextUrl.searchParams.get('table');

    if (tableQuery) {
      const table = parseMasterDataTable(tableQuery);
      const items = await readTable(table);
      return NextResponse.json({ data: items });
    }

    const data = await fetchSystemManagementData();
    return NextResponse.json({ data });
  } catch (error) {
    return normalizeApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminApiAccess();

    const body = (await request.json()) as MasterDataPayload;
    const table = parseMasterDataTable(body.table);
    const payload = buildPayload(table, body);
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase.from(table).insert(payload).select('*').single();

    if (error) {
      throw new Error(error.message);
    }

    revalidateAdminPaths();
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return normalizeApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminApiAccess();

    const body = (await request.json()) as MasterDataPayload;
    const table = parseMasterDataTable(body.table);
    const id = parseString(body.id);

    if (!id) {
      throw new Error('Record ID is required.');
    }

    const payload = buildPayload(table, body);
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select('*').single();

    if (error) {
      throw new Error(error.message);
    }

    revalidateAdminPaths();
    return NextResponse.json({ data });
  } catch (error) {
    return normalizeApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminApiAccess();

    const body = (await request.json()) as Pick<MasterDataPayload, 'table' | 'id'>;
    const table = parseMasterDataTable(body.table);
    const id = parseString(body.id);

    if (!id) {
      throw new Error('Record ID is required.');
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    revalidateAdminPaths();
    return NextResponse.json({ success: true });
  } catch (error) {
    return normalizeApiError(error);
  }
}