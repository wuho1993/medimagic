'use server';

import { revalidatePath } from 'next/cache';
import { buildAccessScopeFromFormData, serializeAccessScope } from '@/src/lib/auth/access';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { canAccessRoute, normalizeRole } from '@/src/lib/auth/roles';
import { getCurrentUser } from '@/src/lib/auth/session';

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

async function requireSystemManagementAccess() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !canAccessRoute(currentUser.role, 'admin')) {
    throw new Error('You do not have permission to manage system settings.');
  }

  return currentUser;
}

export async function createAuthUser(formData: FormData) {
  await requireSystemManagementAccess();

  const email = getValue(formData, 'email').toLowerCase();
  const password = getValue(formData, 'password');
  const fullName = getValue(formData, 'fullName');
  const role = normalizeRole(getValue(formData, 'role'));
  const accessScope = serializeAccessScope({
    allCompanies: true,
    allBranches: true,
    companyIds: [],
    branchIds: [],
  });

  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
      access_scope: accessScope,
    },
    app_metadata: {
      role,
      access_scope: accessScope,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/app/admin');
}

export async function updateAuthUserRole(formData: FormData) {
  await requireSystemManagementAccess();

  const userId = getValue(formData, 'userId');
  const role = normalizeRole(getValue(formData, 'role'));
  const accessScope = serializeAccessScope(buildAccessScopeFromFormData(formData));

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

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...(user.user_metadata ?? {}),
      role,
      access_scope: accessScope,
    },
    app_metadata: {
      ...(user.app_metadata ?? {}),
      role,
      access_scope: accessScope,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/app/admin');
}

export async function createSystemFieldConfig(formData: FormData) {
  await requireSystemManagementAccess();

  const fieldKey = getValue(formData, 'fieldKey');
  const labelZh = getValue(formData, 'labelZh');
  const labelEn = getValue(formData, 'labelEn');

  if (!fieldKey || !labelZh) {
    throw new Error('Field key and Chinese label are required.');
  }

  const supabase = createSupabaseAdminClient();
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

  revalidatePath('/app/admin');
  revalidatePath('/app/people');
}

export async function updateSystemFieldConfig(formData: FormData) {
  await requireSystemManagementAccess();

  const id = getValue(formData, 'id');

  if (!id) {
    throw new Error('Field config ID is required.');
  }

  const supabase = createSupabaseAdminClient();
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

  revalidatePath('/app/admin');
  revalidatePath('/app/people');
}

export async function deleteSystemFieldConfig(formData: FormData) {
  await requireSystemManagementAccess();

  const id = getValue(formData, 'id');

  if (!id) {
    throw new Error('Field config ID is required.');
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('system_field_configs').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/app/admin');
  revalidatePath('/app/people');
}

export async function updatePayrollSystemSettings(formData: FormData) {
  await requireSystemManagementAccess();

  const packageNoPayDefaultHandling = getValue(formData, 'packageNoPayDefaultHandling');

  if (!['no_package', 'pro_rate'].includes(packageNoPayDefaultHandling)) {
    throw new Error('Invalid package no-pay default handling.');
  }

  const supabase = createSupabaseAdminClient();
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

  revalidatePath('/app/admin');
  revalidatePath('/app/payroll');
}

export async function createLookupItem(formData: FormData) {
  await requireSystemManagementAccess();

  const table = getValue(formData, 'table');
  const id = getValue(formData, 'id');
  const companyId = getValue(formData, 'companyId');
  const code = getValue(formData, 'code');
  const nameZh = getValue(formData, 'nameZh');
  const nameEn = getValue(formData, 'nameEn');

  if (!['positions', 'banks', 'companies', 'branches'].includes(table) || !code || !nameZh || !nameEn) {
    throw new Error('Invalid lookup item payload.');
  }

  const supabase = createSupabaseAdminClient();

  const payload: Record<string, string> = {
    code,
    name_zh: nameZh,
    name_en: nameEn,
  };

  if (table === 'branches') {
    if (!companyId) {
      throw new Error('Company is required for branches.');
    }

    payload.company_id = companyId;
  }

  const { error } = id
    ? await supabase.from(table).update(payload).eq('id', id)
    : await supabase.from(table).insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/app/admin');
  revalidatePath('/app/people');
}

export async function deleteLookupItem(formData: FormData) {
  await requireSystemManagementAccess();

  const table = getValue(formData, 'table');
  const id = getValue(formData, 'id');

  if (!['positions', 'banks', 'companies', 'branches'].includes(table) || !id) {
    throw new Error('Invalid lookup item payload.');
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from(table).delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/app/admin');
  revalidatePath('/app/people');
}