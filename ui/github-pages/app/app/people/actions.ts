import { createBrowserSupabaseClient } from '@/src/lib/supabase/client';
import { normalizeCustomCommissionName, normalizeCustomCommissionTiers } from '@/src/lib/employees/custom-commission';
import { calculateProbationEndDate } from '@/src/lib/employees/employment';
import { normalizePayrollBonusCustomName, normalizePayrollBonusTiers, normalizeShopBonusTiers } from '@/src/lib/employees/payroll-bonus';

function isMissingColumnError(message: string | null | undefined) {
  return typeof message === 'string' && (
    message.includes('does not exist') ||
    message.includes('schema cache') ||
    message.includes('Could not find the')
  );
}

function getValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? '').trim();
  if (value === 'null' || value === 'undefined') {
    return '';
  }

  return value;
}

function getNullableValue(formData: FormData, key: string) {
  const value = getValue(formData, key);
  return value.length > 0 ? value : null;
}

function getNullableNumber(formData: FormData, key: string) {
  const value = getValue(formData, key);
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${key} must be a valid number.`);
  }

  return parsed;
}

function getNullablePercentageNumber(formData: FormData, key: string) {
  const value = getValue(formData, key);
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[%,$\s]/g, '');
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) {
    throw new Error(`${key} must be a valid number.`);
  }

  return parsed;
}

function generateTemporaryEmployeeCode() {
  return `TMP${Date.now()}`;
}

function parseSalesBonusCustomTiers(formData: FormData, key: string) {
  const value = getValue(formData, key);
  if (!value) {
    return null;
  }

  try {
    return normalizePayrollBonusTiers(JSON.parse(value));
  } catch {
    throw new Error(`${key} must be valid JSON.`);
  }
}

function parseCommissionCustomTiers(formData: FormData, key: string) {
  const value = getValue(formData, key);
  if (!value) {
    return null;
  }

  try {
    return normalizeCustomCommissionTiers(JSON.parse(value));
  } catch {
    throw new Error(`${key} must be valid JSON.`);
  }
}

function parseShopBonusCustomTiers(formData: FormData, key: string) {
  const value = getValue(formData, key);
  if (!value) {
    return null;
  }

  try {
    return normalizeShopBonusTiers(JSON.parse(value));
  } catch {
    throw new Error(`${key} must be valid JSON.`);
  }
}

function extractPresetId(value: string | null) {
  if (!value || !value.startsWith('preset:')) {
    return null;
  }

  const presetId = value.slice('preset:'.length).trim();
  return presetId.length > 0 ? presetId : null;
}

async function upsertSavedCommissionPreset(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  name: string,
  tiers: ReturnType<typeof normalizeCustomCommissionTiers>,
  presetId: string | null,
) {
  const payload = { name, tiers };

  if (presetId) {
    const { data, error } = await supabase
      .from('saved_commission_presets')
      .update(payload)
      .eq('id', presetId)
      .select('id')
      .maybeSingle();

    if (!error && data?.id) {
      return data.id as string;
    }
  }

  const { data: existing, error: lookupError } = await supabase
    .from('saved_commission_presets')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (lookupError) {
    throw new Error(lookupError.message);
  }

  if (existing?.id) {
    const { data, error } = await supabase
      .from('saved_commission_presets')
      .update(payload)
      .eq('id', existing.id)
      .select('id')
      .maybeSingle();

    if (error || !data?.id) {
      throw new Error(error?.message ?? 'Failed to update saved commission preset.');
    }

    return data.id as string;
  }

  const { data, error } = await supabase
    .from('saved_commission_presets')
    .insert(payload)
    .select('id')
    .maybeSingle();

  if (error || !data?.id) {
    throw new Error(error?.message ?? 'Failed to create saved commission preset.');
  }

  return data.id as string;
}

async function upsertSavedPayrollBonusPreset(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  name: string,
  tiers: ReturnType<typeof normalizePayrollBonusTiers>,
  presetId: string | null,
) {
  const payload = { name, tiers };

  if (presetId) {
    const { data, error } = await supabase
      .from('saved_payroll_bonus_presets')
      .update(payload)
      .eq('id', presetId)
      .select('id')
      .maybeSingle();

    if (!error && data?.id) {
      return data.id as string;
    }
  }

  const { data: existing, error: lookupError } = await supabase
    .from('saved_payroll_bonus_presets')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (lookupError) {
    throw new Error(lookupError.message);
  }

  if (existing?.id) {
    const { data, error } = await supabase
      .from('saved_payroll_bonus_presets')
      .update(payload)
      .eq('id', existing.id)
      .select('id')
      .maybeSingle();

    if (error || !data?.id) {
      throw new Error(error?.message ?? 'Failed to update saved payroll bonus preset.');
    }

    return data.id as string;
  }

  const { data, error } = await supabase
    .from('saved_payroll_bonus_presets')
    .insert(payload)
    .select('id')
    .maybeSingle();

  if (error || !data?.id) {
    throw new Error(error?.message ?? 'Failed to create saved payroll bonus preset.');
  }

  return data.id as string;
}

async function resolveCompanyType(companyId: string | null) {
  if (!companyId) {
    throw new Error('Company is required.');
  }

  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.from('companies').select('code').eq('id', companyId).maybeSingle();

  if (error || !data?.code) {
    throw new Error(error?.message ?? 'Company not found.');
  }

  return data.code as string;
}

async function resolveCompanyTypeOrDefault(companyId: string | null, fallback: string = 'ASA') {
  if (!companyId) {
    return fallback;
  }

  return resolveCompanyType(companyId);
}

export async function createEmployee(formData: FormData) {
  const employeeCode = getValue(formData, 'employeeCode');
  const nameZh = getValue(formData, 'nameZh');
  const nameEn = getValue(formData, 'nameEn');
  const companyId = getNullableValue(formData, 'companyId');
  const branchId = getNullableValue(formData, 'branchId');
  const employmentType = getValue(formData, 'employmentType') || '全職';
  const employmentStatus = getValue(formData, 'employmentStatus') || 'active';
  const gender = getValue(formData, 'gender') || 'other';
  const identityNumber = getNullableValue(formData, 'identityNumber');
  const hireDate = getNullableValue(formData, 'hireDate');

  if (!nameZh || !nameEn) {
    throw new Error('Missing required employee fields.');
  }

  const companyType = await resolveCompanyTypeOrDefault(companyId);
  const probationMonths = getNullableNumber(formData, 'probationMonths');
  const probationEndDate = calculateProbationEndDate(hireDate, probationMonths);
  const supabase = createBrowserSupabaseClient();
  const payload = {
    employee_code: employeeCode || generateTemporaryEmployeeCode(),
    name_zh: nameZh,
    name_en: nameEn,
    alias: getNullableValue(formData, 'alias'),
    gender,
    identity_type: 'hkid',
    identity_number: identityNumber,
    date_of_birth: getNullableValue(formData, 'dateOfBirth'),
    address: getNullableValue(formData, 'address'),
    phone: getNullableValue(formData, 'phone'),
    company_type: companyType,
    company_id: companyId,
    branch_id: branchId,
    employment_type: employmentType,
    employment_status: employmentStatus,
    position_id: getNullableValue(formData, 'positionId'),
    hire_date: hireDate,
    payment_method: getNullableValue(formData, 'paymentMethod'),
    bank_id: getNullableValue(formData, 'bankId'),
    bank_account_number: getNullableValue(formData, 'bankAccountNumber'),
    probation_months: probationMonths,
    annual_leave_days: getNullableNumber(formData, 'annualLeaveDays'),
    probation_end_date: probationEndDate,
    employment_end_date: getNullableValue(formData, 'employmentEndDate'),
    notes: getNullableValue(formData, 'notes'),
  };

  const { error } = await supabase.from('employees').insert(payload);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateEmployee(formData: FormData) {
  const employeeId = getValue(formData, 'employeeId');
  const originalEmployeeCode = getValue(formData, 'originalEmployeeCode');
  const employeeCode = getValue(formData, 'employeeCode');
  const nameZh = getValue(formData, 'nameZh');
  const nameEn = getValue(formData, 'nameEn');
  const companyId = getNullableValue(formData, 'companyId');
  const branchId = getNullableValue(formData, 'branchId');
  const employmentType = getValue(formData, 'employmentType');
  const employmentStatus = getValue(formData, 'employmentStatus');
  const gender = getValue(formData, 'gender');
  const identityType = getValue(formData, 'identityType');
  const identityNumber = getNullableValue(formData, 'identityNumber');
  const hireDate = getNullableValue(formData, 'hireDate');

  if (!employeeId || !nameZh || !nameEn) {
    throw new Error('Missing required employee fields.');
  }

  const supabase = createBrowserSupabaseClient();
  const { data: existingEmployee, error: existingEmployeeError } = await supabase
    .from('employees')
    .select('employee_code, company_type, company_id, branch_id, employment_type, employment_status, gender, identity_type')
    .eq('id', employeeId)
    .maybeSingle();

  if (existingEmployeeError || !existingEmployee) {
    throw new Error(existingEmployeeError?.message ?? 'Employee not found.');
  }

  const normalizedEmployeeCode = employeeCode || originalEmployeeCode || String(existingEmployee.employee_code ?? '') || generateTemporaryEmployeeCode();
  const normalizedEmploymentType = employmentType || String(existingEmployee.employment_type ?? '') || '全職';
  const normalizedEmploymentStatus = employmentStatus || String(existingEmployee.employment_status ?? '') || 'active';
  const normalizedGender = gender || String(existingEmployee.gender ?? '') || 'other';
  const normalizedIdentityType = identityType || String(existingEmployee.identity_type ?? '') || 'hkid';
  const companyType = await resolveCompanyTypeOrDefault(companyId, String(existingEmployee.company_type ?? 'ASA') || 'ASA');
  const probationMonths = getNullableNumber(formData, 'probationMonths');
  const probationEndDate = calculateProbationEndDate(hireDate, probationMonths);
  const employeePayload = {
    employee_code: normalizedEmployeeCode,
    name_zh: nameZh,
    name_en: nameEn,
    alias: getNullableValue(formData, 'alias'),
    gender: normalizedGender,
    identity_type: normalizedIdentityType,
    identity_number: identityNumber,
    date_of_birth: getNullableValue(formData, 'dateOfBirth'),
    address: getNullableValue(formData, 'address'),
    phone: getNullableValue(formData, 'phone'),
    company_type: companyType,
    company_id: companyId,
    branch_id: branchId,
    employment_type: normalizedEmploymentType,
    employment_status: normalizedEmploymentStatus,
    position_id: getNullableValue(formData, 'positionId'),
    hire_date: hireDate,
    payment_method: getNullableValue(formData, 'paymentMethod'),
    bank_id: getNullableValue(formData, 'bankId'),
    bank_account_number: getNullableValue(formData, 'bankAccountNumber'),
    probation_months: probationMonths,
    annual_leave_days: getNullableNumber(formData, 'annualLeaveDays'),
    probation_end_date: probationEndDate,
    employment_end_date: getNullableValue(formData, 'employmentEndDate'),
    notes: getNullableValue(formData, 'notes'),
  };

  const { error: employeeError } = await supabase.from('employees').update(employeePayload).eq('id', employeeId);

  if (employeeError) {
    throw new Error(employeeError.message);
  }

  const salaryType = getNullableValue(formData, 'salaryType');
  const baseSalary = getNullableNumber(formData, 'baseSalary');
  const packageCommissionAmount = salaryType === 'package' ? getNullableNumber(formData, 'packageCommissionAmount') : null;
  const allowanceAmount = getNullableNumber(formData, 'allowanceAmount');
  const effectiveFrom = getNullableValue(formData, 'salaryEffectiveFrom');
  const remarks = getNullableValue(formData, 'salaryRemarks');
  const attendanceBonusAmount = getNullableNumber(formData, 'attendanceBonusAmount');
  const transportAllowance = getNullableNumber(formData, 'transportAllowance');
  const briefingBonus = getNullableNumber(formData, 'briefingBonus');
  const bookingBonus = getNullableNumber(formData, 'bookingBonus');
  const attendanceBonusEnabled = (attendanceBonusAmount ?? 0) > 0;
  const mpfEnabled = getValue(formData, 'mpfEnabled') === 'true';
  const commissionMethodValue = getNullableValue(formData, 'commissionMethod');
  const commissionPresetIdFromForm = extractPresetId(commissionMethodValue);
  const commissionMethod = commissionMethodValue === 'standard' || commissionMethodValue === 'none'
    ? commissionMethodValue
    : (commissionMethodValue ? 'custom' : null);
  const commissionCustomName = commissionMethod === 'custom'
    ? normalizeCustomCommissionName(getNullableValue(formData, 'commissionCustomName'))
    : null;
  const commissionCustomTiers = commissionMethod === 'custom'
    ? parseCommissionCustomTiers(formData, 'commissionCustomTiers')
    : null;
  const commissionRedeemRate = null;
  const commissionSalesRate = null;
  const commissionSgmRate = null;
  const salesAmountRatePercent = getNullablePercentageNumber(formData, 'salesAmountRatePercent');
  const salesBonusEnabled = getValue(formData, 'salesBonusEnabled') === 'true';
  const payrollBonusSchemeValue = getNullableValue(formData, 'payrollBonusScheme');
  const payrollBonusPresetIdFromForm = extractPresetId(payrollBonusSchemeValue);
  const payrollBonusScheme = payrollBonusSchemeValue === 'bonus_1' || payrollBonusSchemeValue === 'bonus_2'
    ? payrollBonusSchemeValue
    : (payrollBonusSchemeValue ? 'custom' : null);
  const salesBonusRate = null;
  const salesBonusCustomName = salesBonusEnabled && payrollBonusScheme === 'custom'
    ? normalizePayrollBonusCustomName(getNullableValue(formData, 'salesBonusCustomName'))
    : null;
  const salesBonusCustomTiers = salesBonusEnabled && payrollBonusScheme === 'custom' ? parseSalesBonusCustomTiers(formData, 'salesBonusCustomTiers') : null;
  const payrollBonusEnabled = salesBonusEnabled && (payrollBonusScheme === 'bonus_1' || payrollBonusScheme === 'bonus_2');
  const streetPromoterEnabled = getValue(formData, 'streetPromoterEnabled') === 'true';
  const telesalesEnabled = getValue(formData, 'telesalesEnabled') === 'true';
  const shopBonusEnabled = getValue(formData, 'shopBonusEnabled') === 'true';
  const shopBonusSchemeValue = getNullableValue(formData, 'shopBonusScheme');
  const shopBonusScheme = shopBonusSchemeValue === 'standard' || shopBonusSchemeValue === 'custom'
    ? shopBonusSchemeValue
    : null;
  const shopBonusCustomName = shopBonusEnabled && shopBonusScheme === 'custom'
    ? normalizePayrollBonusCustomName(getNullableValue(formData, 'shopBonusCustomName'))
    : null;
  const shopBonusCustomTiers = shopBonusEnabled && shopBonusScheme === 'custom'
    ? parseShopBonusCustomTiers(formData, 'shopBonusCustomTiers')
    : null;
  const commissionPresetId = commissionMethod === 'custom' && commissionCustomName && commissionCustomTiers
    ? await upsertSavedCommissionPreset(supabase, commissionCustomName, commissionCustomTiers, commissionPresetIdFromForm)
    : null;
  const payrollBonusPresetId = salesBonusEnabled && payrollBonusScheme === 'custom' && salesBonusCustomName && salesBonusCustomTiers
    ? await upsertSavedPayrollBonusPreset(supabase, salesBonusCustomName, salesBonusCustomTiers, payrollBonusPresetIdFromForm)
    : null;
  const payDayPrimary = getNullableNumber(formData, 'payDayPrimary');
  const payDaySecondary = getNullableNumber(formData, 'payDaySecondary');
  const commissionNotes = getNullableValue(formData, 'commissionNotes');
  const hasSalaryData = [
    salaryType,
    baseSalary,
    packageCommissionAmount,
    allowanceAmount,
    effectiveFrom,
    remarks,
    attendanceBonusAmount,
    transportAllowance,
    briefingBonus,
    bookingBonus,
    commissionMethod,
    commissionPresetId,
    commissionCustomName,
    commissionCustomTiers,
    salesAmountRatePercent,
    payDayPrimary,
    payDaySecondary,
    commissionNotes,
    salesBonusCustomName,
    salesBonusCustomTiers,
    payrollBonusPresetId,
    streetPromoterEnabled,
    telesalesEnabled,
    shopBonusCustomName,
    shopBonusCustomTiers,
    shopBonusScheme,
  ].some((value) => value !== null);

  if (hasSalaryData) {
    const salaryProfilePayload = {
      employee_id: employeeId,
      salary_type: salaryType,
      base_salary: baseSalary,
      package_commission_amount: packageCommissionAmount,
      allowance_amount: allowanceAmount,
      effective_from: effectiveFrom,
      remarks,
      attendance_bonus_enabled: attendanceBonusEnabled,
      attendance_bonus_amount: attendanceBonusAmount,
      transport_allowance: transportAllowance,
      briefing_bonus: briefingBonus,
      booking_bonus: bookingBonus,
      mpf_enabled: mpfEnabled,
      commission_method: commissionMethod,
      commission_preset_id: commissionPresetId,
      commission_custom_name: commissionCustomName,
      commission_custom_tiers: commissionCustomTiers,
      commission_redeem_rate: commissionRedeemRate,
      commission_sales_rate: commissionSalesRate,
      commission_sgm_rate: commissionSgmRate,
      sales_amount_rate_percent: salesAmountRatePercent,
      sales_bonus_enabled: salesBonusEnabled,
      sales_bonus_rate: salesBonusRate,
      payroll_bonus_preset_id: payrollBonusPresetId,
      sales_bonus_custom_name: salesBonusCustomName,
      sales_bonus_custom_tiers: salesBonusCustomTiers,
      payroll_bonus_enabled: payrollBonusEnabled,
      payroll_bonus_scheme: salesBonusEnabled ? payrollBonusScheme : null,
      street_promoter_enabled: streetPromoterEnabled,
      telesales_enabled: telesalesEnabled,
      shop_bonus_enabled: shopBonusEnabled,
      shop_bonus_custom_name: shopBonusCustomName,
      shop_bonus_custom_tiers: shopBonusCustomTiers,
      shop_bonus_scheme: shopBonusEnabled ? shopBonusScheme : null,
      pay_day_primary: payDayPrimary,
      pay_day_secondary: payDaySecondary,
      commission_notes: commissionNotes,
    };

    const currentResult = await supabase
      .from('employee_salary_profiles')
      .upsert(salaryProfilePayload, { onConflict: 'employee_id' });

    const salaryError = currentResult.error && isMissingColumnError(currentResult.error.message)
      ? (console.warn('Employee salary profile schema drift detected while saving commission settings; falling back to legacy salary profile fields.'), (
        await supabase
          .from('employee_salary_profiles')
          .upsert(
            (({ package_commission_amount, street_promoter_enabled, telesales_enabled, sales_amount_rate_percent, ...legacyPayload }) => legacyPayload)(salaryProfilePayload),
            { onConflict: 'employee_id' },
          )
      ).error)
      : currentResult.error;

    if (salaryError) {
      throw new Error(salaryError.message);
    }
  } else {
    const { error: salaryDeleteError } = await supabase.from('employee_salary_profiles').delete().eq('employee_id', employeeId);

    if (salaryDeleteError) {
      throw new Error(salaryDeleteError.message);
    }
  }

  return { employeeCode: normalizedEmployeeCode };
}