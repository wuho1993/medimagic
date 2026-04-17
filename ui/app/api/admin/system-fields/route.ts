import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import {
  normalizeApiError,
  parseBoolean,
  parseNumber,
  parseString,
  requireAdminApiAccess,
} from '@/src/lib/api/admin';
import { fetchSystemManagementData } from '@/src/lib/system-management/queries';

type SystemFieldPayload = {
  id?: string;
  fieldKey?: string;
  labelZh?: string;
  labelEn?: string;
  groupKey?: string;
  inputType?: string;
  isActive?: boolean | string;
  isRequired?: boolean | string;
  sortOrder?: number | string;
};

function revalidateFieldPaths() {
  revalidatePath('/app/admin');
  revalidatePath('/app/people');
}

export async function GET() {
  try {
    await requireAdminApiAccess();
    const data = await fetchSystemManagementData();
    return NextResponse.json({ data: data.fieldConfigs });
  } catch (error) {
    return normalizeApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminApiAccess();

    const body = (await request.json()) as SystemFieldPayload;
    const fieldKey = parseString(body.fieldKey);
    const labelZh = parseString(body.labelZh);

    if (!fieldKey || !labelZh) {
      throw new Error('Field key and Chinese label are required.');
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('system_field_configs')
      .upsert(
        {
          module_key: 'employee',
          field_key: fieldKey,
          label_zh: labelZh,
          label_en: parseString(body.labelEn),
          group_key: parseString(body.groupKey),
          input_type: parseString(body.inputType) || 'text',
          is_active: parseBoolean(body.isActive, true),
          is_required: parseBoolean(body.isRequired, false),
          sort_order: parseNumber(body.sortOrder, 0),
        },
        { onConflict: 'module_key,field_key' }
      )
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidateFieldPaths();
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return normalizeApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminApiAccess();

    const body = (await request.json()) as SystemFieldPayload;
    const id = parseString(body.id);

    if (!id) {
      throw new Error('Field config ID is required.');
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('system_field_configs')
      .update({
        label_zh: parseString(body.labelZh),
        label_en: parseString(body.labelEn),
        group_key: parseString(body.groupKey),
        input_type: parseString(body.inputType) || 'text',
        is_active: parseBoolean(body.isActive, true),
        is_required: parseBoolean(body.isRequired, false),
        sort_order: parseNumber(body.sortOrder, 0),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidateFieldPaths();
    return NextResponse.json({ data });
  } catch (error) {
    return normalizeApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminApiAccess();

    const body = (await request.json()) as Pick<SystemFieldPayload, 'id'>;
    const id = parseString(body.id);

    if (!id) {
      throw new Error('Field config ID is required.');
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from('system_field_configs').delete().eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    revalidateFieldPaths();
    return NextResponse.json({ success: true });
  } catch (error) {
    return normalizeApiError(error);
  }
}