/**
 * GitHub Pages overlay for admin actions.
 * Replaces server actions with client-side Supabase calls.
 * Auth admin operations (createUser, updateUserRole) are not supported
 * on static export — they require the service role key.
 */

import { buildAccessScopeFromFormData, serializeAccessScope } from '@/src/lib/auth/access';
import { createBrowserSupabaseClient } from '@/src/lib/supabase/client';
import { normalizeRole } from '@/src/lib/auth/roles';

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function getSupabase() {
  return createBrowserSupabaseClient();
}

export async function createAuthUser(_formData: FormData) {
  throw new Error('創建帳號功能需要伺服器端支援，靜態部署不支援此操作。');
}

export async function updateAuthUserRole(_formData: FormData) {
  throw new Error('更新帳號角色功能需要伺服器端支援，靜態部署不支援此操作。');
}

export async function createSystemFieldConfig(formData: FormData) {
  const fieldKey = getValue(formData, 'fieldKey');
  const labelZh = getValue(formData, 'labelZh');
  const labelEn = getValue(formData, 'labelEn');

  if (!fieldKey || !labelZh) {
    throw new Error('Field key and Chinese label are required.');
  }

  const supabase = getSupabase();
  const { error } = await supabase.from('system_field_configs').upsert({
    module_key: 'employee',
    field_key: fieldKey,
    label_zh: labelZh,
    label_en: labelEn,
    group_key: getValue(formData, 'groupKey'),
    input_type: getValue(formData, 'inputType') || 'text',
    is_active: getValue(formData, 'isActive') === 'true',
    is_required: getValue(formData, 'isRequired') === 'true',
    sort_order: Number(getValue(formData, 'sortOrder') || '0'),
  }, { onConflict: 'module_key,field_key' });

  if (error) {
    throw new Error(error.message);
  }

  window.location.reload();
}

export async function updateSystemFieldConfig(formData: FormData) {
  const id = getValue(formData, 'id');

  if (!id) {
    throw new Error('Field config ID is required.');
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from('system_field_configs')
    .update({
      label_zh: getValue(formData, 'labelZh'),
      label_en: getValue(formData, 'labelEn'),
      group_key: getValue(formData, 'groupKey'),
      input_type: getValue(formData, 'inputType') || 'text',
      is_active: getValue(formData, 'isActive') === 'true',
      is_required: getValue(formData, 'isRequired') === 'true',
      sort_order: Number(getValue(formData, 'sortOrder') || '0'),
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  window.location.reload();
}

export async function deleteSystemFieldConfig(formData: FormData) {
  const id = getValue(formData, 'id');

  if (!id) {
    throw new Error('Field config ID is required.');
  }

  const supabase = getSupabase();
  const { error } = await supabase.from('system_field_configs').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  window.location.reload();
}

export async function updatePayrollSystemSettings(formData: FormData) {
  const packageNoPayDefaultHandling = getValue(formData, 'packageNoPayDefaultHandling');

  if (!['no_package', 'pro_rate'].includes(packageNoPayDefaultHandling)) {
    throw new Error('Invalid package no-pay default handling.');
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from('system_settings')
    .upsert({
      setting_key: 'package_no_pay_default_handling',
      value_text: packageNoPayDefaultHandling,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'setting_key' });

  if (error) {
    throw new Error(error.message);
  }

  window.location.reload();
}

export async function createLookupItem(formData: FormData) {
  const table = getValue(formData, 'table');
  const id = getValue(formData, 'id');
  const companyId = getValue(formData, 'companyId');
  const code = getValue(formData, 'code');
  const nameZh = getValue(formData, 'nameZh');
  const nameEn = getValue(formData, 'nameEn');

  if (!['positions', 'banks', 'companies', 'branches'].includes(table) || !code || !nameZh || !nameEn) {
    throw new Error('Invalid lookup item payload.');
  }

  const supabase = getSupabase();

  const payload: Record<string, string | null> = {
    code,
    name_zh: nameZh,
    name_en: nameEn,
  };

  if (table === 'branches') {
    payload.company_id = companyId || null;
  }

  const { error } = id
    ? await supabase.from(table).update(payload).eq('id', id)
    : await supabase.from(table).insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  window.location.reload();
}

export async function deleteLookupItem(formData: FormData) {
  const table = getValue(formData, 'table');
  const id = getValue(formData, 'id');

  if (!['positions', 'banks', 'companies', 'branches'].includes(table) || !id) {
    throw new Error('Invalid lookup item payload.');
  }

  const supabase = getSupabase();
  const { error } = await supabase.from(table).delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  window.location.reload();
}
