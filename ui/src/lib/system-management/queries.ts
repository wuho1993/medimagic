import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import type { EmployeeDirectoryOption } from '@/src/lib/employees/queries';
import type { PackageNoPayHandling } from '@/src/lib/employees/queries';

export type SystemFieldConfig = {
  id: string;
  moduleKey: string;
  fieldKey: string;
  labelZh: string;
  labelEn: string;
  groupKey: string;
  inputType: string;
  isActive: boolean;
  isRequired: boolean;
  sortOrder: number;
};

export type PayrollSystemSettings = {
  packageNoPayDefaultHandling: PackageNoPayHandling;
};

type SystemFieldConfigRow = {
  id: string;
  module_key: string;
  field_key: string;
  label_zh: string;
  label_en: string | null;
  group_key: string | null;
  input_type: string;
  is_active: boolean;
  is_required: boolean;
  sort_order: number;
};

type LookupRow = {
  id: string;
  code: string;
  name_zh: string;
  name_en: string;
};

type SystemSettingRow = {
  setting_key: string;
  value_text: string | null;
};

const DEFAULT_PAYROLL_SYSTEM_SETTINGS: PayrollSystemSettings = {
  packageNoPayDefaultHandling: 'pro_rate',
};

function normalizePackageNoPayHandling(value: string | null | undefined): PackageNoPayHandling {
  return value === 'no_package' ? 'no_package' : 'pro_rate';
}

export async function fetchPayrollSystemSettings(): Promise<PayrollSystemSettings> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('system_settings')
    .select('setting_key, value_text')
    .eq('setting_key', 'package_no_pay_default_handling')
    .limit(1);

  if (error) {
    console.error('Failed to load payroll system settings:', error.message);
    return DEFAULT_PAYROLL_SYSTEM_SETTINGS;
  }

  const rows = (data ?? []) as SystemSettingRow[];
  const packageNoPayDefaultHandling = normalizePackageNoPayHandling(rows[0]?.value_text);

  return {
    packageNoPayDefaultHandling,
  };
}

function mapFieldConfig(row: SystemFieldConfigRow): SystemFieldConfig {
  return {
    id: row.id,
    moduleKey: row.module_key,
    fieldKey: row.field_key,
    labelZh: row.label_zh,
    labelEn: row.label_en ?? '',
    groupKey: row.group_key ?? '',
    inputType: row.input_type,
    isActive: row.is_active,
    isRequired: row.is_required,
    sortOrder: row.sort_order,
  };
}

async function fetchLookupOptions(table: 'positions' | 'banks' | 'companies' | 'branches'): Promise<EmployeeDirectoryOption[]> {
  const supabase = await createServerSupabaseClient();
  const query = table === 'branches'
    ? supabase.from(table).select('id, code, name_zh, name_en').eq('is_active', true).order('name_zh')
    : supabase.from(table).select('id, code, name_zh, name_en').order('name_zh');

  const { data, error } = await query;

  if (error || !data) {
    if (error) {
      console.error(`Failed to load ${table} for system management:`, error.message);
    }

    return [];
  }

  return (data as LookupRow[]).map((row) => ({
    id: row.id,
    code: row.code,
    labelZh: row.name_zh,
    labelEn: row.name_en,
  }));
}

export async function fetchSystemManagementData() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('system_field_configs')
    .select('id, module_key, field_key, label_zh, label_en, group_key, input_type, is_active, is_required, sort_order')
    .eq('module_key', 'employee')
    .order('sort_order', { ascending: true })
    .order('field_key', { ascending: true });

  if (error) {
    console.error('Failed to load system field configs:', error.message);
  }

  const [positions, banks, companies, branches] = await Promise.all([
    fetchLookupOptions('positions'),
    fetchLookupOptions('banks'),
    fetchLookupOptions('companies'),
    fetchLookupOptions('branches'),
  ]);

  const payrollSettings = await fetchPayrollSystemSettings();

  return {
    fieldConfigs: ((data ?? []) as SystemFieldConfigRow[]).map(mapFieldConfig),
    payrollSettings,
    positions,
    banks,
    companies,
    branches,
  };
}