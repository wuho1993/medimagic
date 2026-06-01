import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import type { SupabaseClient } from '@supabase/supabase-js';
import { hasBranchAccess, hasCompanyAccess } from '@/src/lib/auth/access';
import type { AppShellUser } from '@/src/lib/auth/session';
import { createLegacyCustomCommissionTiers, normalizeCustomCommissionName, normalizeCustomCommissionTiers, type CustomCommissionTier } from './custom-commission';
import {
  createLegacyPayrollBonusConfigCatalog,
  normalizePayrollBonusTiers,
  normalizeShopBonusTiers,
  type PayrollBonusConfigCatalog,
  type PayrollBonusScheme,
  type PayrollBonusTier,
  type PresetPayrollBonusScheme,
  type ShopBonusScheme,
  type ShopBonusTier,
  type StandardPayrollBonusSchemes,
} from './payroll-bonus';
import { createMoonIrisTaiWaiShopCommissionRules, normalizeCommissionRules, type CommissionRule } from './commission-rules';
import { EMPLOYEE_DOCUMENT_BUCKET, type EmployeeDocumentType } from './document-storage';
import type { EmployeeEmploymentType } from './employment';

type QuerySupabaseClient = SupabaseClient<any, any, any>;

export type EmployeeDirectoryRecord = {
  id: string;
  employeeCode: string;
  nameZh: string;
  nameEn: string;
  alias: string | null;
  gender: 'male' | 'female' | 'other';
  phone: string | null;
  companyType: 'ASA' | 'ASAS';
  companyId: string | null;
  companyNameZh: string | null;
  companyNameEn: string | null;
  branchId: string | null;
  branchCode: string | null;
  branchNameZh: string | null;
  branchNameEn: string | null;
  employmentType: EmployeeEmploymentType;
  employmentStatus: 'active' | 'on_leave' | 'resigned' | 'terminated';
  positionNameZh: string | null;
  hireDate: string;
  annualLeaveDays: number | null;
};

export type EmployeeDocumentRecord = {
  id: string;
  documentType: EmployeeDocumentType;
  fileName: string;
  filePath: string;
  storageFolder: string;
  expiryDate: string | null;
  remarks: string | null;
  downloadUrl: string | null;
};

export type EmployeeVisaRecord = {
  id: string;
  visaType: string;
  visaNumber: string | null;
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired' | 'cancelled';
  reminderDays: number[];
  remarks: string | null;
};

export type EmployeeDetailRecord = EmployeeDirectoryRecord & {
  positionId: string | null;
  identityType: 'hkid' | 'passport' | 'other';
  identityNumber: string;
  dateOfBirth: string | null;
  address: string | null;
  paymentMethod: 'autopay' | 'cash' | 'cheque' | 'fps' | null;
  bankId: string | null;
  bankNameZh: string | null;
  bankNameEn: string | null;
  bankAccountNumber: string | null;
  probationMonths: number | null;
  managerEmployeeId: string | null;
  probationEndDate: string | null;
  employmentEndDate: string | null;
  terminationReason: string | null;
  finalPayrollMonth: string | null;
  branchCode: string | null;
  notes: string | null;
  salaryType: 'monthly' | 'daily' | 'hourly' | 'package' | 'street_promoter' | null;
  baseSalary: number | null;
  packageCommissionAmount: number | null;
  allowanceAmount: number | null;
  salaryEffectiveFrom: string | null;
  salaryRemarks: string | null;
  attendanceBonusEnabled: boolean;
  attendanceBonusAmount: number | null;
  transportAllowance: number | null;
  briefingBonus: number | null;
  bookingBonus: number | null;
  officeJobAmount: number | null;
  mpfEnabled: boolean;
  commissionMethod: 'standard' | 'none' | 'custom' | null;
  commissionPresetId: string | null;
  commissionCustomName: string | null;
  commissionCustomTiers: CustomCommissionTier[];
  commissionRules: CommissionRule[];
  commissionRedeemRate: number | null;
  commissionSalesRate: number | null;
  commissionSgmRate: number | null;
  salesAmountRatePercent: number | null;
  salesBonusEnabled: boolean;
  salesBonusRate: number | null;
  payrollBonusPresetId: string | null;
  salesBonusCustomName: string | null;
  salesBonusCustomTiers: PayrollBonusTier[];
  redeemBonusEnabled: boolean;
  redeemBonusCustomName: string | null;
  redeemBonusCustomTiers: PayrollBonusTier[];
  payrollBonusEnabled: boolean;
  payrollBonusScheme: PayrollBonusScheme | null;
  streetPromoterEnabled: boolean;
  telesalesEnabled: boolean;
  shopBonusEnabled: boolean;
  shopBonusCustomName: string | null;
  shopBonusCustomTiers: ShopBonusTier[];
  shopBonusScheme: ShopBonusScheme | null;
  payDayPrimary: number | null;
  payDaySecondary: number | null;
  commissionNotes: string | null;
  documents: EmployeeDocumentRecord[];
  visas: EmployeeVisaRecord[];
};

export type SavedCommissionPresetRecord = {
  id: string;
  name: string;
  tiers: CustomCommissionTier[];
  rules: CommissionRule[];
};

export type SavedPayrollBonusPresetRecord = {
  id: string;
  name: string;
  tiers: PayrollBonusTier[];
};

export type SavedShopCommissionPresetRecord = {
  id: string;
  name: string;
  rules: CommissionRule[];
};

export type EmployeeDirectoryOption = {
  id: string;
  code: string;
  labelZh: string;
  labelEn: string;
  companyId?: string | null;
};

type NamedLookup = { name_zh: string | null; name_en?: string | null } | { name_zh: string | null; name_en?: string | null }[] | null;

type EmployeeQueryRow = {
  id: string;
  employee_code: string;
  name_zh: string;
  name_en: string;
  alias: string | null;
  gender: EmployeeDirectoryRecord['gender'];
  phone: string | null;
  company_type: EmployeeDirectoryRecord['companyType'];
  company_id: string | null;
  branch_id: string | null;
  branch_code: string | null;
  employment_type: EmployeeDirectoryRecord['employmentType'];
  employment_status: EmployeeDirectoryRecord['employmentStatus'];
  hire_date: string;
  annual_leave_days: number | string | null;
  position: NamedLookup;
  company: NamedLookup;
  branch: NamedLookup;
};

type EmployeeDetailQueryRow = EmployeeQueryRow & {
  position_id: string | null;
  identity_type: EmployeeDetailRecord['identityType'];
  identity_number: string;
  date_of_birth: string | null;
  address: string | null;
  payment_method: EmployeeDetailRecord['paymentMethod'];
  bank_id: string | null;
  bank_account_number: string | null;
  probation_months: number | null;
  manager_employee_id: string | null;
  probation_end_date: string | null;
  employment_end_date: string | null;
  termination_reason: string | null;
  final_payroll_month: string | null;
  branch_code: string | null;
  notes: string | null;
  bank: { name_zh: string | null; name_en: string | null } | { name_zh: string | null; name_en: string | null }[] | null;
};

type EmployeeSalaryProfileRow = {
  salary_type: EmployeeDetailRecord['salaryType'];
  base_salary: number | string | null;
  package_commission_amount: number | string | null;
  allowance_amount: number | string | null;
  effective_from: string | null;
  remarks: string | null;
  attendance_bonus_enabled: boolean | null;
  attendance_bonus_amount: number | string | null;
  transport_allowance: number | string | null;
  briefing_bonus: number | string | null;
  booking_bonus: number | string | null;
  office_job_amount?: number | string | null;
  mpf_enabled: boolean | null;
  commission_method: EmployeeDetailRecord['commissionMethod'];
  commission_preset_id: string | null;
  commission_custom_name: string | null;
  commission_custom_tiers: unknown | null;
  commission_rules: unknown | null;
  commission_redeem_rate: number | string | null;
  commission_sales_rate: number | string | null;
  commission_sgm_rate: number | string | null;
  sales_amount_rate_percent: number | string | null;
  sales_bonus_enabled: boolean | null;
  sales_bonus_rate: number | string | null;
  payroll_bonus_preset_id: string | null;
  sales_bonus_custom_name: string | null;
  sales_bonus_custom_tiers: unknown | null;
  redeem_bonus_enabled: boolean | null;
  redeem_bonus_custom_name: string | null;
  redeem_bonus_custom_tiers: unknown | null;
  payroll_bonus_enabled: boolean | null;
  payroll_bonus_scheme: PayrollBonusScheme | null;
  street_promoter_enabled: boolean | null;
  telesales_enabled: boolean | null;
  shop_bonus_enabled: boolean | null;
  shop_bonus_custom_name: string | null;
  shop_bonus_custom_tiers: unknown | null;
  shop_bonus_scheme: ShopBonusScheme | null;
  pay_day_primary: number | null;
  pay_day_secondary: number | null;
  commission_notes: string | null;
};

type EmployeeDocumentRow = {
  id: string;
  document_type: EmployeeDocumentRecord['documentType'];
  file_name: string;
  file_path: string;
  storage_folder: string | null;
  expiry_date: string | null;
  remarks: string | null;
};

type EmployeeVisaRow = {
  id: string;
  visa_type: string;
  visa_number: string | null;
  expiry_date: string;
  status: EmployeeVisaRecord['status'];
  reminder_days: number[] | null;
  remarks: string | null;
};

type LookupRow = {
  id: string;
  code: string;
  name_zh: string;
  name_en: string;
  company_id?: string | null;
};

type PayrollSchemeConfigRow = {
  scheme_category: 'payroll_bonus' | 'shop_bonus';
  scheme_code: string;
  tiers: unknown;
};

const EMPLOYEE_SALARY_PROFILE_SELECT_LEGACY = 'salary_type, base_salary, allowance_amount, effective_from, remarks, attendance_bonus_enabled, attendance_bonus_amount, transport_allowance, briefing_bonus, booking_bonus, mpf_enabled, commission_method, commission_preset_id, commission_custom_name, commission_custom_tiers, commission_redeem_rate, commission_sales_rate, commission_sgm_rate, sales_bonus_enabled, sales_bonus_rate, payroll_bonus_preset_id, sales_bonus_custom_name, sales_bonus_custom_tiers, payroll_bonus_enabled, payroll_bonus_scheme, pay_day_primary, pay_day_secondary, commission_notes';
const EMPLOYEE_SALARY_PROFILE_SELECT_WITH_PACKAGE = `${EMPLOYEE_SALARY_PROFILE_SELECT_LEGACY}, package_commission_amount`;
const EMPLOYEE_SALARY_PROFILE_SELECT_CURRENT = `${EMPLOYEE_SALARY_PROFILE_SELECT_WITH_PACKAGE}, office_job_amount, street_promoter_enabled, telesales_enabled, shop_bonus_enabled, shop_bonus_custom_name, shop_bonus_custom_tiers, shop_bonus_scheme, sales_amount_rate_percent, commission_rules, redeem_bonus_enabled, redeem_bonus_custom_name, redeem_bonus_custom_tiers`;
const PAYROLL_SUMMARY_PROFILE_SELECT_LEGACY = 'salary_type, base_salary, allowance_amount, attendance_bonus_amount, transport_allowance, briefing_bonus, booking_bonus, mpf_enabled, pay_day_primary, pay_day_secondary, commission_method, commission_custom_name, commission_custom_tiers, commission_redeem_rate, commission_sales_rate, commission_sgm_rate, sales_bonus_enabled, sales_bonus_rate, sales_bonus_custom_name, sales_bonus_custom_tiers, payroll_bonus_enabled, payroll_bonus_scheme';
const PAYROLL_SUMMARY_PROFILE_SELECT_WITH_PACKAGE = `${PAYROLL_SUMMARY_PROFILE_SELECT_LEGACY}, package_commission_amount`;
const PAYROLL_SUMMARY_PROFILE_SELECT_CURRENT = `${PAYROLL_SUMMARY_PROFILE_SELECT_WITH_PACKAGE}, office_job_amount, street_promoter_enabled, telesales_enabled, shop_bonus_enabled, shop_bonus_custom_name, shop_bonus_custom_tiers, shop_bonus_scheme, sales_amount_rate_percent, commission_rules, redeem_bonus_enabled, redeem_bonus_custom_name, redeem_bonus_custom_tiers`;
const MONTHLY_COMMISSION_RECORD_SELECT_LEGACY = 'employee_id, year_month, redeem_volume, sales_volume, job_amount, sgm_volume, briefing_bonus_applied, briefing_bonus_amount, attendance_bonus_applied, attendance_bonus_amount, booking_bonus_applied, booking_bonus_amount, redeem_commission, sales_commission, sgm_commission, sales_bonus, payroll_bonus, total_commission, employees!inner(employee_code)';
const MONTHLY_COMMISSION_RECORD_SELECT_CURRENT = `employee_id, year_month, mpf_ee_applied, mpf_ee_deduction_mode, mpf_ee_amount, mpf_ee_manual_override, mpf_er_applied, mpf_er_amount, mpf_er_manual_override, worked_days, worked_hours, redeem_volume, sales_volume, sales_amount_total, sales_amount_commission, job_amount, sgm_volume, street_promoter_headcount, street_promoter_commission_amount, telesales_headcount, telesales_commission_amount, briefing_bonus_applied, briefing_bonus_amount, attendance_bonus_applied, attendance_bonus_amount, booking_bonus_applied, booking_bonus_amount, manual_bonus_applied, manual_bonus_amount, manual_bonus_mpf_included, manual_deduction_applied, manual_deduction_amount, manual_deduction_mpf_included, shop_target_amount, shop_actual_sales_amount, shop_target_percent, shop_bonus_amount, redeem_commission, sales_commission, sgm_commission, sales_bonus, payroll_bonus, redeem_bonus_amount, total_commission, package_no_pay_handling, employees!inner(employee_code)`;
const MONTHLY_COMMISSION_RECORD_SELECT_WITH_PAYOUT = `employee_id, year_month, mpf_ee_applied, mpf_ee_deduction_mode, mpf_ee_amount, mpf_ee_manual_override, mpf_er_applied, mpf_er_amount, mpf_er_manual_override, worked_days, worked_hours, redeem_volume, sales_volume, sales_amount_total, sales_amount_commission, job_amount, sgm_volume, street_promoter_headcount, street_promoter_commission_amount, telesales_headcount, telesales_commission_amount, briefing_bonus_applied, briefing_bonus_amount, attendance_bonus_applied, attendance_bonus_amount, booking_bonus_applied, booking_bonus_amount, manual_bonus_applied, manual_bonus_amount, manual_bonus_mpf_included, manual_bonus_payout, manual_deduction_applied, manual_deduction_amount, manual_deduction_mpf_included, manual_deduction_payout, shop_target_amount, shop_actual_sales_amount, shop_target_percent, shop_bonus_amount, redeem_commission, sales_commission, sgm_commission, sales_bonus, payroll_bonus, redeem_bonus_amount, total_commission, package_no_pay_handling, employees!inner(employee_code)`;
const MONTHLY_COMMISSION_RECORD_SELECT_WITH_MANUAL_REMARKS = `employee_id, year_month, mpf_ee_applied, mpf_ee_deduction_mode, mpf_ee_amount, mpf_ee_manual_override, mpf_er_applied, mpf_er_amount, mpf_er_manual_override, worked_days, worked_hours, redeem_volume, sales_volume, sales_amount_total, sales_amount_commission, job_amount, sgm_volume, street_promoter_headcount, street_promoter_commission_amount, telesales_headcount, telesales_commission_amount, briefing_bonus_applied, briefing_bonus_amount, attendance_bonus_applied, attendance_bonus_amount, booking_bonus_applied, booking_bonus_amount, manual_bonus_applied, manual_bonus_amount, manual_bonus_mpf_included, manual_bonus_payout, manual_bonus_remarks, manual_deduction_applied, manual_deduction_amount, manual_deduction_mpf_included, manual_deduction_payout, manual_deduction_remarks, shop_target_amount, shop_actual_sales_amount, shop_target_percent, shop_bonus_amount, redeem_commission, sales_commission, sgm_commission, sales_bonus, payroll_bonus, redeem_bonus_amount, total_commission, package_no_pay_handling, employees!inner(employee_code)`;
const MONTHLY_COMMISSION_RECORD_SELECT_WITH_OFFICE_JOB = MONTHLY_COMMISSION_RECORD_SELECT_WITH_MANUAL_REMARKS.replace('booking_bonus_applied, booking_bonus_amount, manual_bonus_applied', 'booking_bonus_applied, booking_bonus_amount, office_job_applied, office_job_amount, manual_bonus_applied');

function isMissingColumnError(message: string | null | undefined) {
  return typeof message === 'string' && (
    message.includes('does not exist') ||
    message.includes('schema cache') ||
    message.includes('Could not find the')
  );
}

function createResolvedPayrollBonusSchemes(partialSchemes: Partial<StandardPayrollBonusSchemes>): StandardPayrollBonusSchemes {
  const legacyCatalog = createLegacyPayrollBonusConfigCatalog();

  return {
    bonus_1: partialSchemes.bonus_1 && partialSchemes.bonus_1.length > 0
      ? partialSchemes.bonus_1
      : legacyCatalog.payrollBonusSchemes.bonus_1,
    bonus_2: partialSchemes.bonus_2 && partialSchemes.bonus_2.length > 0
      ? partialSchemes.bonus_2
      : legacyCatalog.payrollBonusSchemes.bonus_2,
  };
}

export async function fetchPayrollBonusConfigCatalog(): Promise<PayrollBonusConfigCatalog> {
  const supabase = await createServerSupabaseClient();
  const legacyCatalog = createLegacyPayrollBonusConfigCatalog();
  const { data, error } = await supabase
    .from('payroll_scheme_configs')
    .select('scheme_category, scheme_code, tiers')
    .eq('is_active', true)
    .order('scheme_category', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    console.warn('Failed to load payroll scheme configs from Supabase; using legacy in-code fallback until remote schema is synced.', error.message);
    return legacyCatalog;
  }

  const payrollBonusSchemes: Partial<StandardPayrollBonusSchemes> = {};
  let shopBonusStandardTiers: ShopBonusTier[] = [];

  for (const row of (data ?? []) as PayrollSchemeConfigRow[]) {
    if (row.scheme_category === 'payroll_bonus' && (row.scheme_code === 'bonus_1' || row.scheme_code === 'bonus_2')) {
      payrollBonusSchemes[row.scheme_code as PresetPayrollBonusScheme] = normalizePayrollBonusTiers(row.tiers);
      continue;
    }

    if (row.scheme_category === 'shop_bonus' && row.scheme_code === 'standard') {
      shopBonusStandardTiers = normalizeShopBonusTiers(row.tiers);
    }
  }

  return {
    payrollBonusSchemes: createResolvedPayrollBonusSchemes(payrollBonusSchemes),
    shopBonusStandardTiers: shopBonusStandardTiers.length > 0 ? shopBonusStandardTiers : legacyCatalog.shopBonusStandardTiers,
  };
}

function normalizeLookupValue(value: NamedLookup) {
  if (!value) {
    return {
      nameZh: null,
      nameEn: null,
    };
  }

  const entry = Array.isArray(value) ? value[0] : value;

  return {
    nameZh: entry?.name_zh ?? null,
    nameEn: entry?.name_en ?? null,
  };
}

function normalizePositionName(position: EmployeeQueryRow['position']) {
  return normalizeLookupValue(position).nameZh;
}

function normalizeBankName(bank: EmployeeDetailQueryRow['bank']) {
  return normalizeLookupValue(bank);
}

function normalizeSalaryProfile(profile: EmployeeSalaryProfileRow | null) {
  if (!profile) {
    return {
      salaryType: null,
      baseSalary: null,
      packageCommissionAmount: null,
      allowanceAmount: null,
      effectiveFrom: null,
      remarks: null,
      attendanceBonusEnabled: false,
      attendanceBonusAmount: null,
      transportAllowance: null,
      briefingBonus: null,
      bookingBonus: null,
      officeJobAmount: null,
      mpfEnabled: false,
      commissionMethod: null,
      commissionPresetId: null,
      commissionCustomName: null,
      commissionCustomTiers: [],
      commissionRules: [],
      commissionRedeemRate: null,
      commissionSalesRate: null,
      commissionSgmRate: null,
      salesAmountRatePercent: null,
      salesBonusEnabled: false,
      salesBonusRate: null,
      payrollBonusPresetId: null,
      salesBonusCustomName: null,
      salesBonusCustomTiers: [],
      redeemBonusEnabled: false,
      redeemBonusCustomName: null,
      redeemBonusCustomTiers: [],
      payrollBonusEnabled: false,
      payrollBonusScheme: null,
      streetPromoterEnabled: false,
      telesalesEnabled: false,
      shopBonusEnabled: false,
      shopBonusCustomName: null,
      shopBonusCustomTiers: [],
      shopBonusScheme: null,
      payDayPrimary: null,
      payDaySecondary: null,
      commissionNotes: null,
    };
  }

  const commissionMethod = profile.commission_method ?? null;
  const commissionRedeemRate = profile.commission_redeem_rate === null ? null : Number(profile.commission_redeem_rate);
  const commissionSalesRate = profile.commission_sales_rate === null ? null : Number(profile.commission_sales_rate);
  const commissionSgmRate = profile.commission_sgm_rate === null ? null : Number(profile.commission_sgm_rate);
  const rawSalesAmountRatePercent = profile.sales_amount_rate_percent === null ? null : Number(profile.sales_amount_rate_percent);
  const salesAmountRatePercent = rawSalesAmountRatePercent !== null && Number.isFinite(rawSalesAmountRatePercent) ? rawSalesAmountRatePercent : null;
  const commissionCustomTiers = normalizeCustomCommissionTiers(profile.commission_custom_tiers);

  return {
    salaryType: profile.salary_type ?? null,
    baseSalary: profile.base_salary === null ? null : Number(profile.base_salary),
    packageCommissionAmount: profile.package_commission_amount == null ? null : Number(profile.package_commission_amount),
    allowanceAmount: profile.allowance_amount === null ? null : Number(profile.allowance_amount),
    effectiveFrom: profile.effective_from ?? null,
    remarks: profile.remarks ?? null,
    attendanceBonusEnabled: profile.attendance_bonus_enabled ?? false,
    attendanceBonusAmount: profile.attendance_bonus_amount === null ? null : Number(profile.attendance_bonus_amount),
    transportAllowance: profile.transport_allowance === null ? null : Number(profile.transport_allowance),
    briefingBonus: profile.briefing_bonus === null ? null : Number(profile.briefing_bonus),
    bookingBonus: profile.booking_bonus === null ? null : Number(profile.booking_bonus),
    officeJobAmount: profile.office_job_amount == null ? null : Number(profile.office_job_amount),
    mpfEnabled: profile.mpf_enabled ?? false,
    commissionMethod,
    commissionPresetId: profile.commission_preset_id ?? null,
    commissionCustomName: normalizeCustomCommissionName(profile.commission_custom_name),
    commissionCustomTiers: commissionMethod === 'custom' && commissionCustomTiers.length === 0
      ? createLegacyCustomCommissionTiers(commissionRedeemRate, commissionSalesRate, commissionSgmRate)
      : commissionCustomTiers,
    commissionRules: normalizeCommissionRules(profile.commission_rules),
    commissionRedeemRate,
    commissionSalesRate,
    commissionSgmRate,
    salesAmountRatePercent,
    salesBonusEnabled: profile.sales_bonus_enabled ?? false,
    salesBonusRate: profile.sales_bonus_rate === null ? null : Number(profile.sales_bonus_rate),
    payrollBonusPresetId: profile.payroll_bonus_preset_id ?? null,
    salesBonusCustomName: profile.sales_bonus_custom_name,
    salesBonusCustomTiers: normalizePayrollBonusTiers(profile.sales_bonus_custom_tiers),
    redeemBonusEnabled: profile.redeem_bonus_enabled ?? false,
    redeemBonusCustomName: profile.redeem_bonus_custom_name ?? null,
    redeemBonusCustomTiers: normalizePayrollBonusTiers(profile.redeem_bonus_custom_tiers),
    payrollBonusEnabled: profile.payroll_bonus_enabled ?? false,
    payrollBonusScheme: profile.payroll_bonus_scheme ?? null,
    streetPromoterEnabled: profile.street_promoter_enabled ?? false,
    telesalesEnabled: profile.telesales_enabled ?? false,
    shopBonusEnabled: profile.shop_bonus_enabled ?? false,
    shopBonusCustomName: profile.shop_bonus_custom_name,
    shopBonusCustomTiers: normalizeShopBonusTiers(profile.shop_bonus_custom_tiers),
    shopBonusScheme: profile.shop_bonus_scheme ?? null,
    payDayPrimary: profile.pay_day_primary ?? null,
    payDaySecondary: profile.pay_day_secondary ?? null,
    commissionNotes: profile.commission_notes ?? null,
  };
}

function mapEmployee(row: EmployeeQueryRow): EmployeeDirectoryRecord {
  const company = normalizeLookupValue(row.company);
  const branch = normalizeLookupValue(row.branch);

  return {
    id: row.id,
    employeeCode: row.employee_code,
    nameZh: row.name_zh,
    nameEn: row.name_en,
    alias: row.alias,
    gender: row.gender,
    phone: row.phone,
    companyType: row.company_type,
    companyId: row.company_id,
    companyNameZh: company.nameZh,
    companyNameEn: company.nameEn,
    branchId: row.branch_id,
    branchCode: row.branch_code,
    branchNameZh: branch.nameZh,
    branchNameEn: branch.nameEn,
    employmentType: row.employment_type,
    employmentStatus: row.employment_status,
    positionNameZh: normalizePositionName(row.position),
    hireDate: row.hire_date,
    annualLeaveDays: row.annual_leave_days === null ? null : Number(row.annual_leave_days),
  };
}

function mapEmployeeDetail(
  row: EmployeeDetailQueryRow,
  salaryProfileRow: EmployeeSalaryProfileRow | null,
  documents: EmployeeDocumentRecord[],
  visas: EmployeeVisaRecord[]
): EmployeeDetailRecord {
  const base = mapEmployee(row);
  const bank = normalizeBankName(row.bank);
  const salaryProfile = normalizeSalaryProfile(salaryProfileRow);

  return {
    ...base,
    positionId: row.position_id,
    identityType: row.identity_type,
    identityNumber: row.identity_number,
    dateOfBirth: row.date_of_birth,
    address: row.address,
    paymentMethod: row.payment_method,
    bankId: row.bank_id,
    bankNameZh: bank.nameZh,
    bankNameEn: bank.nameEn,
    bankAccountNumber: row.bank_account_number,
    probationMonths: row.probation_months,
    managerEmployeeId: row.manager_employee_id,
    probationEndDate: row.probation_end_date,
    employmentEndDate: row.employment_end_date,
    terminationReason: row.termination_reason,
    finalPayrollMonth: row.final_payroll_month,
    branchCode: row.branch_code,
    notes: row.notes,
    salaryType: salaryProfile.salaryType,
    baseSalary: salaryProfile.baseSalary,
    packageCommissionAmount: salaryProfile.packageCommissionAmount,
    allowanceAmount: salaryProfile.allowanceAmount,
    salaryEffectiveFrom: salaryProfile.effectiveFrom,
    salaryRemarks: salaryProfile.remarks,
    attendanceBonusEnabled: salaryProfile.attendanceBonusEnabled,
    attendanceBonusAmount: salaryProfile.attendanceBonusAmount,
    transportAllowance: salaryProfile.transportAllowance,
    briefingBonus: salaryProfile.briefingBonus,
    bookingBonus: salaryProfile.bookingBonus,
    officeJobAmount: salaryProfile.officeJobAmount,
    mpfEnabled: salaryProfile.mpfEnabled,
    commissionMethod: salaryProfile.commissionMethod,
    commissionPresetId: salaryProfile.commissionPresetId,
    commissionCustomName: salaryProfile.commissionCustomName,
    commissionCustomTiers: salaryProfile.commissionCustomTiers,
    commissionRules: salaryProfile.commissionRules,
    commissionRedeemRate: salaryProfile.commissionRedeemRate,
    commissionSalesRate: salaryProfile.commissionSalesRate,
    commissionSgmRate: salaryProfile.commissionSgmRate,
    salesAmountRatePercent: salaryProfile.salesAmountRatePercent,
    salesBonusEnabled: salaryProfile.salesBonusEnabled,
    salesBonusRate: salaryProfile.salesBonusRate,
    payrollBonusPresetId: salaryProfile.payrollBonusPresetId,
    salesBonusCustomName: salaryProfile.salesBonusCustomName,
    salesBonusCustomTiers: salaryProfile.salesBonusCustomTiers,
    redeemBonusEnabled: salaryProfile.redeemBonusEnabled,
    redeemBonusCustomName: salaryProfile.redeemBonusCustomName,
    redeemBonusCustomTiers: salaryProfile.redeemBonusCustomTiers,
    payrollBonusEnabled: salaryProfile.payrollBonusEnabled,
    payrollBonusScheme: salaryProfile.payrollBonusScheme,
    streetPromoterEnabled: salaryProfile.streetPromoterEnabled,
    telesalesEnabled: salaryProfile.telesalesEnabled,
    shopBonusEnabled: salaryProfile.shopBonusEnabled,
    shopBonusCustomName: salaryProfile.shopBonusCustomName,
    shopBonusCustomTiers: salaryProfile.shopBonusCustomTiers,
    shopBonusScheme: salaryProfile.shopBonusScheme,
    payDayPrimary: salaryProfile.payDayPrimary,
    payDaySecondary: salaryProfile.payDaySecondary,
    commissionNotes: salaryProfile.commissionNotes,
    documents,
    visas,
  };
}

function mapEmployeeDocument(row: EmployeeDocumentRow): EmployeeDocumentRecord {
  return {
    id: row.id,
    documentType: row.document_type,
    fileName: row.file_name,
    filePath: row.file_path,
    storageFolder: row.storage_folder ?? '',
    expiryDate: row.expiry_date,
    remarks: row.remarks,
    downloadUrl: null,
  };
}

async function attachDocumentUrls(documents: EmployeeDocumentRecord[]) {
  if (documents.length === 0) {
    return documents;
  }

  try {
    const admin = createSupabaseAdminClient();
    const signed = await Promise.all(
      documents.map(async (document) => {
        const { data } = await admin.storage.from(EMPLOYEE_DOCUMENT_BUCKET).createSignedUrl(document.filePath, 60 * 60);
        return {
          ...document,
          downloadUrl: data?.signedUrl ?? null,
        };
      })
    );

    return signed;
  } catch {
    return documents;
  }
}

function mapEmployeeVisa(row: EmployeeVisaRow): EmployeeVisaRecord {
  return {
    id: row.id,
    visaType: row.visa_type,
    visaNumber: row.visa_number,
    expiryDate: row.expiry_date,
    status: row.status,
    reminderDays: row.reminder_days ?? [],
    remarks: row.remarks,
  };
}

function applyScopeFilters<T extends { in: (...args: [string, string[]]) => T; eq: (...args: [string, string]) => T }>(
  query: T,
  user: AppShellUser
) {
  let scopedQuery = query;

  if (!user.accessScope.allCompanies) {
    if (user.accessScope.companyIds.length === 0) {
      return null;
    }

    scopedQuery = scopedQuery.in('company_id', user.accessScope.companyIds);
  }

  if (!user.accessScope.allBranches) {
    if (user.accessScope.branchIds.length === 0) {
      return null;
    }

    scopedQuery = scopedQuery.in('branch_id', user.accessScope.branchIds);
  }

  return scopedQuery;
}

export async function fetchEmployeeDirectory(user: AppShellUser): Promise<EmployeeDirectoryRecord[]> {
  const supabase = await createServerSupabaseClient();
  const baseQuery = supabase
    .from('employees')
    .select(
      'id, employee_code, name_zh, name_en, alias, gender, phone, company_type, company_id, branch_id, branch_code, employment_type, employment_status, hire_date, annual_leave_days, position:positions(name_zh), company:companies(name_zh,name_en), branch:branches(name_zh,name_en)'
    )
    .order('hire_date', { ascending: false });

  const scopedQuery = applyScopeFilters(baseQuery, user);

  if (!scopedQuery) {
    return [];
  }

  const { data, error } = await scopedQuery;

  if (error) {
    console.error('Failed to load employee directory from Supabase:', error.message);
    return [];
  }

  return ((data ?? []) as EmployeeQueryRow[]).map(mapEmployee);
}

export async function fetchEmployeeDetailByCode(employeeCode: string, user: AppShellUser): Promise<EmployeeDetailRecord | null> {
  const normalizedCode = employeeCode.trim();
  if (!normalizedCode) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const currentSelect = 'id, employee_code, name_zh, name_en, alias, gender, phone, company_type, company_id, branch_id, employment_type, employment_status, hire_date, annual_leave_days, position_id, identity_type, identity_number, date_of_birth, address, payment_method, bank_id, bank_account_number, probation_months, manager_employee_id, probation_end_date, employment_end_date, termination_reason, final_payroll_month, branch_code, notes, position:positions(name_zh), bank:banks(name_zh,name_en), company:companies(name_zh,name_en), branch:branches(name_zh,name_en)';
  const legacySelect = 'id, employee_code, name_zh, name_en, alias, gender, phone, company_type, company_id, branch_id, employment_type, employment_status, hire_date, annual_leave_days, position_id, identity_type, identity_number, date_of_birth, address, payment_method, bank_id, bank_account_number, probation_months, manager_employee_id, probation_end_date, employment_end_date, branch_code, notes, position:positions(name_zh), bank:banks(name_zh,name_en), company:companies(name_zh,name_en), branch:branches(name_zh,name_en)';
  const buildEmployeeDetailQuery = (select: string) => supabase
    .from('employees')
    .select(select)
    .eq('employee_code', normalizedCode);

  const scopedQuery = applyScopeFilters(buildEmployeeDetailQuery(currentSelect), user);

  if (!scopedQuery) {
    return null;
  }

  const currentResult = await scopedQuery.maybeSingle();
  const legacyScopedQuery = currentResult.error && isMissingColumnError(currentResult.error.message)
    ? applyScopeFilters(buildEmployeeDetailQuery(legacySelect), user)
    : null;
  const { data, error } = legacyScopedQuery ? await legacyScopedQuery.maybeSingle() : currentResult;

  if (error) {
    console.error(`Failed to load employee detail for ${normalizedCode}:`, error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const employeeData = data as unknown as EmployeeDetailQueryRow;

  let salaryProfile: EmployeeSalaryProfileRow | null = null;
  let documents: EmployeeDocumentRecord[] = [];
  let visas: EmployeeVisaRecord[] = [];

  const [salaryResult, documentsResult, visasResult] = await Promise.all([
    supabase
      .from('employee_salary_profiles')
      .select(EMPLOYEE_SALARY_PROFILE_SELECT_CURRENT)
      .eq('employee_id', employeeData.id)
      .maybeSingle(),
    supabase
      .from('employee_documents')
      .select('id, document_type, file_name, file_path, storage_folder, expiry_date, remarks')
      .eq('employee_id', employeeData.id)
      .order('expiry_date', { ascending: true, nullsFirst: false }),
    supabase
      .from('employee_visas')
      .select('id, visa_type, visa_number, expiry_date, status, reminder_days, remarks')
      .eq('employee_id', employeeData.id)
      .order('expiry_date', { ascending: true }),
  ]);

  if (salaryResult.error && isMissingColumnError(salaryResult.error.message)) {
    console.warn(`Salary profile schema drift detected for ${normalizedCode}; falling back to legacy salary profile fields.`);
    const fallbackSalaryResult = await supabase
      .from('employee_salary_profiles')
      .select(EMPLOYEE_SALARY_PROFILE_SELECT_LEGACY)
      .eq('employee_id', employeeData.id)
      .maybeSingle();

    if (fallbackSalaryResult.error) {
      console.warn(`Failed to load salary profile for ${normalizedCode}:`, fallbackSalaryResult.error.message);
    } else if (fallbackSalaryResult.data) {
      salaryProfile = fallbackSalaryResult.data as EmployeeSalaryProfileRow;
    }
  } else if (salaryResult.error) {
    console.warn(`Failed to load salary profile for ${normalizedCode}:`, salaryResult.error.message);
  } else if (salaryResult.data) {
    salaryProfile = salaryResult.data as EmployeeSalaryProfileRow;
  }

  if (documentsResult.error) {
    console.warn(`Failed to load employee documents for ${normalizedCode}:`, documentsResult.error.message);
  } else {
    documents = await attachDocumentUrls(((documentsResult.data ?? []) as EmployeeDocumentRow[]).map(mapEmployeeDocument));
  }

  if (visasResult.error) {
    console.warn(`Failed to load employee visas for ${normalizedCode}:`, visasResult.error.message);
  } else {
    visas = ((visasResult.data ?? []) as EmployeeVisaRow[]).map(mapEmployeeVisa);
  }

  return mapEmployeeDetail(employeeData, salaryProfile, documents, visas);
}

async function fetchOptions(table: 'positions' | 'banks' | 'companies' | 'branches', user?: AppShellUser) {
  const supabase = await createServerSupabaseClient();
  let query = table === 'branches'
    ? supabase.from(table).select('id, code, name_zh, name_en, company_id').eq('is_active', true).order('name_zh')
    : supabase.from(table).select('id, code, name_zh, name_en').order('name_zh');

  if (user) {
    if (table === 'companies' && !user.accessScope.allCompanies) {
      if (user.accessScope.companyIds.length === 0) {
        return [];
      }

      query = query.in('id', user.accessScope.companyIds);
    }

    if (table === 'branches' && !user.accessScope.allBranches) {
      if (user.accessScope.branchIds.length === 0) {
        return [];
      }

      query = query.in('id', user.accessScope.branchIds);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Failed to load ${table} from Supabase:`, error.message);
    return [];
  }

  return ((data ?? []) as LookupRow[]).map((row) => ({
    id: row.id,
    code: row.code,
    labelZh: row.name_zh,
    labelEn: row.name_en,
    companyId: row.company_id ?? null,
  }));
}

export async function fetchEmployeeDirectoryOptions(user?: AppShellUser) {
  const [positions, banks, companies, branches] = await Promise.all([
    fetchOptions('positions', user),
    fetchOptions('banks', user),
    fetchOptions('companies', user),
    fetchOptions('branches', user),
  ]);

  return {
    positions,
    banks,
    companies,
    branches,
  };
}

export async function fetchSavedCommissionPresets(): Promise<SavedCommissionPresetRecord[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('saved_commission_presets')
    .select('id, name, tiers')
    .order('name');

  if (error) {
    console.error('Failed to load saved commission presets from Supabase:', error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const rules = normalizeCommissionRules(row.tiers).filter((rule) => rule.metric !== 'shop');
    const tiers = rules.length > 0 ? [] : normalizeCustomCommissionTiers(row.tiers);
    return {
      id: row.id as string,
      name: normalizeCustomCommissionName(row.name) ?? 'Custom Commission',
      tiers,
      rules,
    };
  }).filter((preset) => preset.rules.length > 0 || preset.tiers.length > 0);
}

export async function fetchSavedPayrollBonusPresets(): Promise<SavedPayrollBonusPresetRecord[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('saved_payroll_bonus_presets')
    .select('id, name, tiers')
    .order('name');

  if (error) {
    console.error('Failed to load saved payroll bonus presets from Supabase:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    tiers: normalizePayrollBonusTiers(row.tiers),
  }));
}

export async function fetchSavedShopCommissionPresets(): Promise<SavedShopCommissionPresetRecord[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('saved_shop_commission_presets')
    .select('id, name, rules')
    .order('name');

  const { data: commissionPresetData, error: commissionPresetError } = await supabase
    .from('saved_commission_presets')
    .select('id, name, tiers')
    .order('name');

  if (error && commissionPresetError) {
    console.error('Failed to load saved shop commission presets from Supabase:', error.message);
    return [{ id: 'tai_wai_shop', name: 'Moon and Iris 大圍鋪數方案', rules: createMoonIrisTaiWaiShopCommissionRules() }];
  }

  if (commissionPresetError) {
    console.error('Failed to load shop commission presets from saved commission presets:', commissionPresetError.message);
  }

  const dedicatedPresets = (data ?? [])
    .map((row) => ({
      id: row.id as string,
      name: (row.name as string | null)?.trim() || '鋪數方案',
      rules: normalizeCommissionRules(row.rules).filter((rule) => rule.metric === 'shop'),
    }))
    .filter((preset) => preset.rules.length > 0);

  const sharedPresets = (commissionPresetData ?? [])
    .map((row) => ({
      id: `shared:${row.id as string}`,
      name: (row.name as string | null)?.trim() || '鋪數方案',
      rules: normalizeCommissionRules(row.tiers).filter((rule) => rule.metric === 'shop'),
    }))
    .filter((preset) => preset.rules.length > 0);

  const presetsByName = new Map<string, SavedShopCommissionPresetRecord>();
  for (const preset of [...dedicatedPresets, ...sharedPresets]) {
    presetsByName.set(preset.name, preset);
  }
  const presets = Array.from(presetsByName.values()).sort((left, right) => left.name.localeCompare(right.name));

  return presets.length > 0 ? presets : [{ id: 'tai_wai_shop', name: 'Moon and Iris 大圍鋪數方案', rules: createMoonIrisTaiWaiShopCommissionRules() }];
}

export type DashboardData = {
  totalEmployees: number;
  activeEmployees: number;
  branchBreakdown: { branch: string; count: number }[];
  recentHires: { employeeCode: string; nameZh: string; alias: string | null; hireDate: string; branchName: string | null }[];
  payDayReminders: { label: string; day: number; count: number }[];
};

export async function fetchDashboardData(user: AppShellUser): Promise<DashboardData> {
  const supabase = await createServerSupabaseClient();

  const baseQuery = supabase
    .from('employees')
    .select('id, employee_code, name_zh, alias, employment_status, hire_date, branch:branches(name_zh)')
    .order('hire_date', { ascending: false });

  const scopedQuery = applyScopeFilters(baseQuery, user);
  const { data: employees } = scopedQuery ? await scopedQuery : { data: [] };
  const rows = (employees ?? []) as { id: string; employee_code: string; name_zh: string; alias: string | null; employment_status: string; hire_date: string; branch: NamedLookup }[];

  const totalEmployees = rows.length;
  const activeRows = rows.filter((r) => r.employment_status === 'active');
  const activeEmployees = activeRows.length;

  const branchCounts = new Map<string, number>();
  for (const row of activeRows) {
    const branchName = normalizeLookupValue(row.branch).nameZh ?? '未分配';
    branchCounts.set(branchName, (branchCounts.get(branchName) ?? 0) + 1);
  }
  const branchBreakdown = Array.from(branchCounts.entries())
    .map(([branch, count]) => ({ branch, count }))
    .sort((a, b) => b.count - a.count);

  const recentHires = rows.slice(0, 5).map((r) => ({
    employeeCode: r.employee_code,
    nameZh: r.name_zh,
    alias: r.alias,
    hireDate: r.hire_date,
    branchName: normalizeLookupValue(r.branch).nameZh,
  }));

  const { data: salaryRows } = await supabase
    .from('employee_salary_profiles')
    .select('pay_day_primary, pay_day_secondary');
  const payDayMap = new Map<number, number>();
  for (const row of (salaryRows ?? []) as { pay_day_primary: number | null; pay_day_secondary: number | null }[]) {
    if (row.pay_day_primary) {
      payDayMap.set(row.pay_day_primary, (payDayMap.get(row.pay_day_primary) ?? 0) + 1);
    }
    if (row.pay_day_secondary) {
      payDayMap.set(row.pay_day_secondary, (payDayMap.get(row.pay_day_secondary) ?? 0) + 1);
    }
  }
  const payDayReminders = Array.from(payDayMap.entries())
    .map(([day, count]) => ({ label: `${day}號`, day, count }))
    .sort((a, b) => a.day - b.day);

  return { totalEmployees, activeEmployees, branchBreakdown, recentHires, payDayReminders };
}

export type InboxReminder = {
  type: 'pay_day' | 'probation_ending' | 'visa_expiring' | 'contract_ending' | 'certificate_expiring';
  employeeCode: string;
  employeeName: string;
  date: string;
  detail: string;
};

export async function fetchInboxReminders(user: AppShellUser): Promise<InboxReminder[]> {
  const supabase = await createServerSupabaseClient();
  const reminders: InboxReminder[] = [];
  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  const todayStr = today.toISOString().slice(0, 10);
  const futureStr = thirtyDaysLater.toISOString().slice(0, 10);

  const baseQuery = supabase
    .from('employees')
    .select('employee_code, name_zh, alias, probation_end_date, employment_end_date')
    .eq('employment_status', 'active');
  const scopedQuery = applyScopeFilters(baseQuery, user);
  const { data: employees } = scopedQuery ? await scopedQuery : { data: [] };

  for (const emp of (employees ?? []) as { employee_code: string; name_zh: string; alias: string | null; probation_end_date: string | null; employment_end_date: string | null }[]) {
    const name = emp.alias || emp.name_zh;
    if (emp.probation_end_date && emp.probation_end_date >= todayStr && emp.probation_end_date <= futureStr) {
      reminders.push({ type: 'probation_ending', employeeCode: emp.employee_code, employeeName: name, date: emp.probation_end_date, detail: emp.employee_code });
    }
    if (emp.employment_end_date && emp.employment_end_date >= todayStr && emp.employment_end_date <= futureStr) {
      reminders.push({ type: 'contract_ending', employeeCode: emp.employee_code, employeeName: name, date: emp.employment_end_date, detail: emp.employee_code });
    }
  }

  const { data: visas } = await supabase
    .from('employee_visas')
    .select('employee_id, visa_type, expiry_date, employees!inner(employee_code, name_zh, alias)')
    .gte('expiry_date', todayStr)
    .lte('expiry_date', futureStr)
    .eq('status', 'active');
  for (const visa of (visas ?? []) as unknown as { employee_id: string; visa_type: string; expiry_date: string; employees: { employee_code: string; name_zh: string; alias: string | null } }[]) {
    const name = visa.employees.alias || visa.employees.name_zh;
    reminders.push({ type: 'visa_expiring', employeeCode: visa.employees.employee_code, employeeName: name, date: visa.expiry_date, detail: visa.visa_type });
  }

  const { data: certificates } = await supabase
    .from('employee_documents')
    .select('file_name, expiry_date, employees!inner(employee_code, name_zh, alias)')
    .eq('document_type', 'certificate')
    .gte('expiry_date', todayStr)
    .lte('expiry_date', futureStr);

  for (const certificate of (certificates ?? []) as unknown as { file_name: string; expiry_date: string; employees: { employee_code: string; name_zh: string; alias: string | null } }[]) {
    const name = certificate.employees.alias || certificate.employees.name_zh;
    reminders.push({
      type: 'certificate_expiring',
      employeeCode: certificate.employees.employee_code,
      employeeName: name,
      date: certificate.expiry_date,
      detail: certificate.file_name,
    });
  }

  const currentDay = today.getDate();
  const { data: salaryProfiles } = await supabase
    .from('employee_salary_profiles')
    .select('pay_day_primary, pay_day_secondary, employees!inner(employee_code, name_zh, alias)');
  for (const sp of (salaryProfiles ?? []) as unknown as { pay_day_primary: number | null; pay_day_secondary: number | null; employees: { employee_code: string; name_zh: string; alias: string | null } }[]) {
    const name = sp.employees.alias || sp.employees.name_zh;
    if (sp.pay_day_primary && sp.pay_day_primary >= currentDay && sp.pay_day_primary <= currentDay + 7) {
      reminders.push({ type: 'pay_day', employeeCode: sp.employees.employee_code, employeeName: name, date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(sp.pay_day_primary).padStart(2, '0')}`, detail: `${sp.pay_day_primary}號` });
    }
    if (sp.pay_day_secondary && sp.pay_day_secondary >= currentDay && sp.pay_day_secondary <= currentDay + 7) {
      reminders.push({ type: 'pay_day', employeeCode: sp.employees.employee_code, employeeName: name, date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(sp.pay_day_secondary).padStart(2, '0')}`, detail: `${sp.pay_day_secondary}號` });
    }
  }

  reminders.sort((a, b) => a.date.localeCompare(b.date));
  return reminders;
}

export type CommissionRateTier = {
  commissionType: 'redeem' | 'sales' | 'sgm' | 'job' | 'achievement_bonus';
  staffGroup: string;
  minAmount: number;
  maxAmount: number | null;
  rate: number;
  bonusAmount: number;
  bonusThreshold: number | null;
  description: string | null;
};

export async function fetchCommissionRateTiers(): Promise<CommissionRateTier[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('commission_rate_tiers')
    .select('commission_type, staff_group, min_amount, max_amount, rate, bonus_amount, bonus_threshold, description')
    .eq('is_active', true)
    .order('commission_type')
    .order('staff_group')
    .order('sort_order');
  return ((data ?? []) as { commission_type: string; staff_group: string; min_amount: number; max_amount: number | null; rate: number; bonus_amount: number; bonus_threshold: number | null; description: string | null }[]).map((r) => ({
    commissionType: r.commission_type as CommissionRateTier['commissionType'],
    staffGroup: r.staff_group,
    minAmount: Number(r.min_amount),
    maxAmount: r.max_amount !== null ? Number(r.max_amount) : null,
    rate: Number(r.rate),
    bonusAmount: Number(r.bonus_amount),
    bonusThreshold: r.bonus_threshold !== null ? Number(r.bonus_threshold) : null,
    description: r.description,
  }));
}

export type PayrollEmployeeSummary = {
  employeeCode: string;
  nameZh: string;
  nameEn: string | null;
  alias: string | null;
  gender: EmployeeDetailRecord['gender'];
  identityType: EmployeeDetailRecord['identityType'];
  identityNumber: string | null;
  phone: string | null;
  companyType: EmployeeDirectoryRecord['companyType'];
  companyNameZh: string | null;
  employmentType: EmployeeDirectoryRecord['employmentType'];
  employmentStatus: EmployeeDirectoryRecord['employmentStatus'];
  branchName: string | null;
  positionCode: string | null;
  positionNameZh: string | null;
  hireDate: string;
  employmentEndDate: string | null;
  dateOfBirth: string | null;
  salaryType: EmployeeDetailRecord['salaryType'];
  baseSalary: number;
  packageCommissionAmount: number;
  allowanceAmount: number;
  attendanceBonusAmount: number;
  transportAllowance: number;
  briefingBonus: number;
  bookingBonus: number;
  officeJobAmount: number;
  mpfEnabled: boolean;
  payDayPrimary: number | null;
  payDaySecondary: number | null;
  commissionMethod: string | null;
  commissionCustomName: string | null;
  commissionCustomTiers: CustomCommissionTier[];
  commissionRules: CommissionRule[];
  commissionRedeemRate: number | null;
  commissionSalesRate: number | null;
  commissionSgmRate: number | null;
  salesAmountRatePercent: number | null;
  salesBonusEnabled: boolean;
  salesBonusRate: number | null;
  salesBonusCustomName: string | null;
  salesBonusCustomTiers: PayrollBonusTier[];
  redeemBonusEnabled: boolean;
  redeemBonusCustomName: string | null;
  redeemBonusCustomTiers: PayrollBonusTier[];
  payrollBonusEnabled: boolean;
  payrollBonusScheme: PayrollBonusScheme | null;
  streetPromoterEnabled: boolean;
  telesalesEnabled: boolean;
  shopBonusEnabled: boolean;
  shopBonusCustomName: string | null;
  shopBonusCustomTiers: ShopBonusTier[];
  shopBonusScheme: ShopBonusScheme | null;
};

export async function fetchPayrollSummary(user: AppShellUser, supabaseClient?: QuerySupabaseClient): Promise<PayrollEmployeeSummary[]> {
  const supabase = supabaseClient ?? await createServerSupabaseClient();
  const buildQuery = (profileSelect: string) => supabase
    .from('employees')
    .select(`employee_code, name_zh, name_en, alias, gender, identity_type, identity_number, phone, company_type, employment_type, employment_status, hire_date, employment_end_date, date_of_birth, position:positions(code, name_zh), company:companies(name_zh), branch:branches(name_zh), employee_salary_profiles(${profileSelect})`)
    .order('employee_code');

  const scopedCurrentQuery = applyScopeFilters(buildQuery(PAYROLL_SUMMARY_PROFILE_SELECT_CURRENT), user);
  const currentResult = scopedCurrentQuery ? await scopedCurrentQuery : { data: [], error: null };
  const result = currentResult.error && isMissingColumnError(currentResult.error.message)
    ? (console.warn('Payroll summary schema drift detected; falling back to legacy payroll summary fields.'), await (applyScopeFilters(buildQuery(PAYROLL_SUMMARY_PROFILE_SELECT_LEGACY), user) ?? Promise.resolve({ data: [], error: null })))
    : currentResult;

  if (result.error) {
    console.error('Failed to load payroll summary from Supabase:', result.error.message);
    return [];
  }

  const { data } = result;

  return ((data ?? []) as unknown as {
    employee_code: string;
    name_zh: string;
    name_en: string | null;
    alias: string | null;
    gender: EmployeeDetailRecord['gender'] | null;
    identity_number: string | null;
    identity_type: EmployeeDetailRecord['identityType'] | null;
    phone: string | null;
    company_type: EmployeeDirectoryRecord['companyType'];
    employment_type: EmployeeDirectoryRecord['employmentType'];
    employment_status: EmployeeDirectoryRecord['employmentStatus'];
    hire_date: string;
    employment_end_date: string | null;
    date_of_birth: string | null;
    position: { code: string | null; name_zh: string | null } | { code: string | null; name_zh: string | null }[] | null;
    company: NamedLookup;
    branch: NamedLookup;
    employee_salary_profiles: { salary_type: EmployeeDetailRecord['salaryType']; base_salary: number | string | null; package_commission_amount: number | string | null; allowance_amount: number | string | null; attendance_bonus_amount: number | string | null; transport_allowance: number | string | null; briefing_bonus: number | string | null; booking_bonus: number | string | null; office_job_amount?: number | string | null; mpf_enabled: boolean | null; pay_day_primary: number | null; pay_day_secondary: number | null; commission_method: string | null; commission_custom_name: string | null; commission_custom_tiers: unknown | null; commission_rules: unknown | null; commission_redeem_rate: number | string | null; commission_sales_rate: number | string | null; commission_sgm_rate: number | string | null; sales_amount_rate_percent: number | string | null; sales_bonus_enabled: boolean | null; sales_bonus_rate: number | string | null; sales_bonus_custom_name: string | null; sales_bonus_custom_tiers: unknown | null; redeem_bonus_enabled: boolean | null; redeem_bonus_custom_name: string | null; redeem_bonus_custom_tiers: unknown | null; payroll_bonus_enabled: boolean | null; payroll_bonus_scheme: PayrollBonusScheme | null; street_promoter_enabled: boolean | null; telesales_enabled: boolean | null; shop_bonus_enabled: boolean | null; shop_bonus_custom_name: string | null; shop_bonus_custom_tiers: unknown | null; shop_bonus_scheme: ShopBonusScheme | null } | null;
  }[]).map((row) => {
    // employee_salary_profiles is a single object (unique FK), not an array
    const sp = row.employee_salary_profiles;
    const commissionRedeemRate = sp?.commission_redeem_rate ? Number(sp.commission_redeem_rate) : null;
    const commissionSalesRate = sp?.commission_sales_rate ? Number(sp.commission_sales_rate) : null;
    const commissionSgmRate = sp?.commission_sgm_rate ? Number(sp.commission_sgm_rate) : null;
    const rawSalesAmountRatePercent = sp?.sales_amount_rate_percent ? Number(sp.sales_amount_rate_percent) : null;
    const salesAmountRatePercent = rawSalesAmountRatePercent !== null && Number.isFinite(rawSalesAmountRatePercent) ? rawSalesAmountRatePercent : null;
    const commissionCustomTiers = normalizeCustomCommissionTiers(sp?.commission_custom_tiers ?? null);
    return {
      employeeCode: row.employee_code,
      nameZh: row.name_zh,
      nameEn: row.name_en,
      alias: row.alias,
      gender: row.gender ?? 'other',
      identityType: row.identity_type ?? 'hkid',
      identityNumber: row.identity_number,
      phone: row.phone,
      companyType: row.company_type,
      companyNameZh: normalizeLookupValue(row.company).nameZh,
      employmentType: row.employment_type,
      employmentStatus: row.employment_status,
      branchName: normalizeLookupValue(row.branch).nameZh,
      positionCode: Array.isArray(row.position) ? (row.position[0]?.code ?? null) : (row.position?.code ?? null),
      positionNameZh: Array.isArray(row.position) ? (row.position[0]?.name_zh ?? null) : (row.position?.name_zh ?? null),
      hireDate: row.hire_date,
      employmentEndDate: row.employment_end_date,
      dateOfBirth: row.date_of_birth,
      salaryType: sp?.salary_type ?? null,
      baseSalary: sp?.base_salary ? Number(sp.base_salary) : 0,
      packageCommissionAmount: sp?.package_commission_amount ? Number(sp.package_commission_amount) : 0,
      allowanceAmount: sp?.allowance_amount ? Number(sp.allowance_amount) : 0,
      attendanceBonusAmount: sp?.attendance_bonus_amount ? Number(sp.attendance_bonus_amount) : 0,
      transportAllowance: sp?.transport_allowance ? Number(sp.transport_allowance) : 0,
      briefingBonus: sp?.briefing_bonus ? Number(sp.briefing_bonus) : 0,
      bookingBonus: sp?.booking_bonus ? Number(sp.booking_bonus) : 0,
      officeJobAmount: sp?.office_job_amount ? Number(sp.office_job_amount) : 0,
      mpfEnabled: sp?.mpf_enabled ?? false,
      payDayPrimary: sp?.pay_day_primary ?? null,
      payDaySecondary: sp?.pay_day_secondary ?? null,
      commissionMethod: sp?.commission_method ?? null,
      commissionCustomName: normalizeCustomCommissionName(sp?.commission_custom_name ?? null),
      commissionCustomTiers: sp?.commission_method === 'custom' && commissionCustomTiers.length === 0
        ? createLegacyCustomCommissionTiers(commissionRedeemRate, commissionSalesRate, commissionSgmRate)
        : commissionCustomTiers,
      commissionRules: normalizeCommissionRules(sp?.commission_rules ?? null),
      commissionRedeemRate,
      commissionSalesRate,
      commissionSgmRate,
      salesAmountRatePercent,
      salesBonusEnabled: sp?.sales_bonus_enabled ?? false,
      salesBonusRate: sp?.sales_bonus_rate ? Number(sp.sales_bonus_rate) : null,
      salesBonusCustomName: sp?.sales_bonus_custom_name ?? null,
      salesBonusCustomTiers: normalizePayrollBonusTiers(sp?.sales_bonus_custom_tiers ?? null),
      redeemBonusEnabled: sp?.redeem_bonus_enabled ?? false,
      redeemBonusCustomName: sp?.redeem_bonus_custom_name ?? null,
      redeemBonusCustomTiers: normalizePayrollBonusTiers(sp?.redeem_bonus_custom_tiers ?? null),
      payrollBonusEnabled: sp?.payroll_bonus_enabled ?? false,
      payrollBonusScheme: sp?.payroll_bonus_scheme ?? null,
      streetPromoterEnabled: sp?.street_promoter_enabled ?? false,
      telesalesEnabled: sp?.telesales_enabled ?? false,
      shopBonusEnabled: sp?.shop_bonus_enabled ?? false,
      shopBonusCustomName: sp?.shop_bonus_custom_name ?? null,
      shopBonusCustomTiers: normalizeShopBonusTiers(sp?.shop_bonus_custom_tiers ?? null),
      shopBonusScheme: sp?.shop_bonus_scheme ?? null,
    };
  });
}

// ── Leave Management ──
// ── Commission Records ──

export type PackageNoPayHandling = 'no_package' | 'pro_rate';

export type MonthlyCommissionRecord = {
  employeeCode: string;
  yearMonth: string;
  mpfEeApplied: boolean;
  mpfEeDeductionMode: 'split' | 'month_end';
  mpfEeAmount: number;
  mpfEeManualOverride: boolean;
  mpfErApplied: boolean;
  mpfErAmount: number;
  mpfErManualOverride: boolean;
  workedDays: number;
  workedHours: number;
  redeemVolume: number;
  salesVolume: number;
  salesAmountTotal: number;
  salesAmountCommission: number;
  jobAmount: number;
  sgmVolume: number;
  streetPromoterHeadcount: number;
  streetPromoterCommissionAmount: number;
  telesalesHeadcount: number;
  telesalesCommissionAmount: number;
  briefingBonusApplied: boolean;
  briefingBonusAmount: number;
  attendanceBonusApplied: boolean;
  attendanceBonusAmount: number;
  bookingBonusApplied: boolean;
  bookingBonusAmount: number;
  officeJobApplied: boolean;
  officeJobAmount: number;
  manualBonusApplied: boolean;
  manualBonusAmount: number;
  manualBonusMpfIncluded: boolean;
  manualBonusPayout: 'primary' | 'month_end';
  manualBonusRemarks: string;
  manualDeductionApplied: boolean;
  manualDeductionAmount: number;
  manualDeductionMpfIncluded: boolean;
  manualDeductionPayout: 'primary' | 'month_end';
  manualDeductionRemarks: string;
  shopTargetAmount: number;
  shopActualSalesAmount: number;
  shopTargetPercent: number;
  shopBonusAmount: number;
  redeemCommission: number;
  salesCommission: number;
  sgmCommission: number;
  salesBonus: number;
  payrollBonus: number;
  redeemBonus: number;
  totalCommission: number;
  packageNoPayHandling: PackageNoPayHandling | null;
};

export type PayrollAttendanceRecord = {
  employeeCode: string;
  yearMonth: string;
  calendarDays: number;
  workedDays: number;
  workedHours: number;
  offDays: number;
  statutoryHolidayDays: number;
  birthdayLeaveDays: number;
  tb8Days: number;
  sickLeaveDays: number;
  maternityLeaveDays: number;
  rewardLeaveDays: number;
  annualLeaveDays: number;
  compassionateLeaveDays: number;
  sickNoPayDays: number;
  noPayLeaveDays: number;
  noPayStatutoryHolidayDays: number;
  noPayDays: number;
  lateDays: number;
  attendanceDeductionAmount: number;
  remainingDeductionAmount: number;
  proratedPackageCommission: number;
  actualCommissionAmount: number;
  effectiveCommissionAmount: number;
  packageNoPayHandling: PackageNoPayHandling | null;
  packageNoPaySelectionRequired: boolean;
};

export type RollingCommissionAverageRecord = {
  employeeCode: string;
  cutoffMonth: string;
  totalCommission: number;
  eligibleDays: number;
  dailyAverageCommission: number;
  source: 'seed' | 'seed_plus_payroll' | 'payroll' | 'none';
};

export type CommissionAverageAuditRecord = {
  employeeCode: string;
  displayName: string;
  branchName: string | null;
  salaryType: EmployeeDetailRecord['salaryType'];
  cutoffMonth: string;
  annualLeaveDays: number;
  statutoryHolidayDays: number;
  alShDays: number;
  totalCommission: number;
  eligibleDays: number;
  dailyAverageCommission: number;
  alShAverageCommissionPay: number;
  fixedDailyWage: number;
  legalDailyAverageWage: number;
  legalMinimumAlShTopUp: number;
  finalAlShAverageCommissionPay: number;
  complianceStatus: 'ok' | 'needs_review';
  complianceRemark: string | null;
  source: RollingCommissionAverageRecord['source'];
  seedTotalCommission: number;
  seedEligibleDays: number;
  monthlySourceCount: number;
  monthlySourceTotal: number;
  monthlySourceDays: number;
  mappingStatus: string | null;
  mappingSourceCode: string | null;
  mappingRemark: string | null;
};

function getPreviousYearMonth(yearMonth: string) {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return yearMonth;
  return `${month === 1 ? year - 1 : year}-${String(month === 1 ? 12 : month - 1).padStart(2, '0')}`;
}

function addYearMonths(yearMonth: string, offset: number) {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return yearMonth;
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getYearMonthStartDate(yearMonth: string) {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return null;
  return new Date(year, month - 1, 1);
}

function getYearMonthEndDate(yearMonth: string) {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return null;
  return new Date(year, month, 0);
}

function countInclusiveDays(start: Date, end: Date) {
  const startTime = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endTime = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(0, Math.floor((endTime - startTime) / 86400000) + 1);
}

function calculateSeedOverlap(seed: { total_commission: number | string | null; eligible_days: number | string | null; daily_average_commission?: number | string | null; period_start: string; period_end: string }, windowStartMonth: string, cutoffMonth: string) {
  const windowStart = getYearMonthStartDate(windowStartMonth);
  const cutoffEnd = getYearMonthEndDate(cutoffMonth);
  const seedStart = new Date(seed.period_start);
  const seedEnd = new Date(seed.period_end);
  if (!windowStart || !cutoffEnd || Number.isNaN(seedStart.getTime()) || Number.isNaN(seedEnd.getTime())) {
    return { total: 0, days: 0 };
  }

  const overlapStart = new Date(Math.max(windowStart.getTime(), seedStart.getTime()));
  const overlapEnd = new Date(Math.min(cutoffEnd.getTime(), seedEnd.getTime()));
  const overlapDays = countInclusiveDays(overlapStart, overlapEnd);
  if (overlapDays <= 0) {
    return { total: 0, days: 0 };
  }

  const seedDays = Number(seed.eligible_days ?? 0);
  const seedTotal = Number(seed.total_commission ?? 0);
  const dailyAverage = Number(seed.daily_average_commission ?? 0) || (seedDays > 0 ? seedTotal / seedDays : 0);
  const days = seedDays > 0 ? Math.min(overlapDays, seedDays) : overlapDays;
  return { total: dailyAverage * days, days };
}

export async function fetchRollingCommissionAverages(user: AppShellUser, selectedMonth: string, supabaseClient?: QuerySupabaseClient): Promise<Record<string, RollingCommissionAverageRecord>> {
  const employees = await fetchPayrollSummary(user, supabaseClient);
  if (employees.length === 0) return {};

  const employeeCodes = employees.map((employee) => employee.employeeCode);
  const cutoffMonth = getPreviousYearMonth(selectedMonth);
  const windowStartMonth = addYearMonths(cutoffMonth, -11);
  const supabase = supabaseClient ?? await createServerSupabaseClient();

  const [seedResult, monthlyResult] = await Promise.all([
    supabase
      .from('employee_commission_average_seed')
      .select('employee_code, total_commission, eligible_days, daily_average_commission, period_start, period_end')
      .in('employee_code', employeeCodes),
    supabase
      .from('employee_commission_average_monthly')
      .select('employee_code, year_month, average_commission_amount, eligible_days')
      .in('employee_code', employeeCodes)
      .gte('year_month', '2026-04')
      .gte('year_month', windowStartMonth)
      .lte('year_month', cutoffMonth),
  ]);

  if ((seedResult.error && !isMissingColumnError(seedResult.error.message)) || (monthlyResult.error && !isMissingColumnError(monthlyResult.error.message))) {
    console.warn('Failed to load rolling commission average sources:', seedResult.error?.message ?? monthlyResult.error?.message);
  }

  const seedRows = seedResult.error ? [] : ((seedResult.data ?? []) as Array<{ employee_code: string; total_commission: number | string | null; eligible_days: number | string | null; daily_average_commission: number | string | null; period_start: string; period_end: string }>);
  const monthlyRows = monthlyResult.error ? [] : ((monthlyResult.data ?? []) as Array<{ employee_code: string; year_month: string; average_commission_amount: number | string | null; eligible_days: number | string | null }>);
  const monthlyByCode = new Map<string, typeof monthlyRows>();
  for (const row of monthlyRows) {
    const list = monthlyByCode.get(row.employee_code) ?? [];
    list.push(row);
    monthlyByCode.set(row.employee_code, list);
  }
  const seedByCode = new Map(seedRows.map((row) => [row.employee_code, row]));

  return Object.fromEntries(employeeCodes.map((employeeCode) => {
    const seed = seedByCode.get(employeeCode);
    const monthly = monthlyByCode.get(employeeCode) ?? [];
    const monthlyTotal = monthly.reduce((sum, row) => sum + Number(row.average_commission_amount ?? 0), 0);
    const monthlyDays = monthly.reduce((sum, row) => sum + Number(row.eligible_days ?? 0), 0);
    const seedOverlap = seed ? calculateSeedOverlap(seed, windowStartMonth, cutoffMonth) : { total: 0, days: 0 };
    const seedTotal = seedOverlap.total;
    const seedDays = seedOverlap.days;
    const totalCommission = seedTotal + monthlyTotal;
    const eligibleDays = Math.min(365, seedDays + monthlyDays);
    const dailyAverageCommission = eligibleDays > 0 ? totalCommission / eligibleDays : 0;
    const source = seedTotal > 0 && monthlyTotal > 0 ? 'seed_plus_payroll' : seedTotal > 0 ? 'seed' : monthlyTotal > 0 ? 'payroll' : 'none';
    return [employeeCode, {
      employeeCode,
      cutoffMonth,
      totalCommission: Math.round(totalCommission * 100) / 100,
      eligibleDays,
      dailyAverageCommission: Math.round(dailyAverageCommission * 10000) / 10000,
      source,
    } satisfies RollingCommissionAverageRecord];
  }));
}

function roundAuditMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function getCalendarDaysForYearMonth(yearMonth: string) {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return 30;
  return new Date(year, month, 0).getDate();
}

export async function fetchCommissionAverageAuditRecords(user: AppShellUser, selectedMonth: string, supabaseClient?: QuerySupabaseClient): Promise<CommissionAverageAuditRecord[]> {
  const employees = await fetchPayrollSummary(user, supabaseClient);
  if (employees.length === 0) return [];

  const employeeCodes = employees.map((employee) => employee.employeeCode);
  const cutoffMonth = getPreviousYearMonth(selectedMonth);
  const windowStartMonth = addYearMonths(cutoffMonth, -11);
  const supabase = supabaseClient ?? await createServerSupabaseClient();

  const [rolling, attendance, seedResult, monthlyResult, mappingResult] = await Promise.all([
    fetchRollingCommissionAverages(user, selectedMonth, supabase),
    fetchPayrollAttendanceRecords(user, selectedMonth, supabase),
    supabase
      .from('employee_commission_average_seed')
      .select('employee_code, total_commission, eligible_days, source_file, source_row')
      .in('employee_code', employeeCodes),
    supabase
      .from('employee_commission_average_monthly')
      .select('employee_code, year_month, average_commission_amount, eligible_days')
      .in('employee_code', employeeCodes)
      .gte('year_month', '2026-04')
      .gte('year_month', windowStartMonth)
      .lte('year_month', cutoffMonth),
    supabase
      .from('commission_average_employee_mappings')
      .select('source_code, matched_employee_code, match_status, remark'),
  ]);

  if (seedResult.error && !isMissingColumnError(seedResult.error.message)) {
    console.warn('Failed to load commission average seed audit rows:', seedResult.error.message);
  }
  if (monthlyResult.error && !isMissingColumnError(monthlyResult.error.message)) {
    console.warn('Failed to load commission average monthly audit rows:', monthlyResult.error.message);
  }
  if (mappingResult.error && !isMissingColumnError(mappingResult.error.message)) {
    console.warn('Failed to load commission average mapping audit rows:', mappingResult.error.message);
  }

  const seedByCode = new Map(((seedResult.data ?? []) as Array<{ employee_code: string; total_commission: number | string | null; eligible_days: number | string | null }>).map((row) => [row.employee_code, row]));
  const monthlyByCode = new Map<string, Array<{ employee_code: string; average_commission_amount: number | string | null; eligible_days: number | string | null }>>();
  for (const row of (monthlyResult.data ?? []) as Array<{ employee_code: string; average_commission_amount: number | string | null; eligible_days: number | string | null }>) {
    const list = monthlyByCode.get(row.employee_code) ?? [];
    list.push(row);
    monthlyByCode.set(row.employee_code, list);
  }
  const mappingByCode = new Map<string, { source_code: string | null; match_status: string | null; remark: string | null }>();
  for (const row of (mappingResult.data ?? []) as Array<{ source_code: string | null; matched_employee_code: string | null; match_status: string | null; remark: string | null }>) {
    if (row.matched_employee_code && employeeCodes.includes(row.matched_employee_code)) {
      mappingByCode.set(row.matched_employee_code, row);
    }
  }

  return employees.map((employee) => {
    const average = rolling[employee.employeeCode] ?? {
      employeeCode: employee.employeeCode,
      cutoffMonth,
      totalCommission: 0,
      eligibleDays: 0,
      dailyAverageCommission: 0,
      source: 'none' as const,
    };
    const attendanceRecord = attendance[employee.employeeCode];
    const annualLeaveDays = Number(attendanceRecord?.annualLeaveDays ?? 0);
    const statutoryHolidayDays = Number(attendanceRecord?.statutoryHolidayDays ?? 0);
    const alShDays = annualLeaveDays + statutoryHolidayDays;
    const seed = seedByCode.get(employee.employeeCode);
    const monthlyRows = monthlyByCode.get(employee.employeeCode) ?? [];
    const monthlySourceTotal = monthlyRows.reduce((sum, row) => sum + Number(row.average_commission_amount ?? 0), 0);
    const monthlySourceDays = monthlyRows.reduce((sum, row) => sum + Number(row.eligible_days ?? 0), 0);
    const mapping = mappingByCode.get(employee.employeeCode);
    const calendarDays = attendanceRecord?.calendarDays && attendanceRecord.calendarDays > 0
      ? attendanceRecord.calendarDays
      : getCalendarDaysForYearMonth(selectedMonth);
    const fixedMonthlyWage = employee.baseSalary + employee.allowanceAmount + employee.transportAllowance + employee.attendanceBonusAmount + employee.briefingBonus + employee.bookingBonus + employee.officeJobAmount;
    const fixedDailyWage = calendarDays > 0 ? roundAuditMoney(fixedMonthlyWage / calendarDays) : 0;
    const legalDailyAverageWage = roundAuditMoney(fixedDailyWage + average.dailyAverageCommission);
    const legalMinimumAlShTopUp = roundAuditMoney(Math.max(0, (legalDailyAverageWage - fixedDailyWage) * alShDays));
    const alShAverageCommissionPay = roundAuditMoney(average.dailyAverageCommission * alShDays);
    const finalAlShAverageCommissionPay = roundAuditMoney(Math.max(alShAverageCommissionPay, legalMinimumAlShTopUp));
    const complianceRemark = alShDays > 0 && average.source === 'none'
      ? 'AL/SH 有日數但沒有 rolling 365 平均佣金 source，需人工確認。'
      : null;

    return {
      employeeCode: employee.employeeCode,
      displayName: employee.alias || employee.nameZh || employee.nameEn || employee.employeeCode,
      branchName: employee.branchName,
      salaryType: employee.salaryType,
      cutoffMonth: average.cutoffMonth,
      annualLeaveDays,
      statutoryHolidayDays,
      alShDays,
      totalCommission: average.totalCommission,
      eligibleDays: average.eligibleDays,
      dailyAverageCommission: average.dailyAverageCommission,
      alShAverageCommissionPay,
      fixedDailyWage,
      legalDailyAverageWage,
      legalMinimumAlShTopUp,
      finalAlShAverageCommissionPay,
      complianceStatus: complianceRemark ? 'needs_review' : 'ok',
      complianceRemark,
      source: average.source,
      seedTotalCommission: Number(seed?.total_commission ?? 0),
      seedEligibleDays: Number(seed?.eligible_days ?? 0),
      monthlySourceCount: monthlyRows.length,
      monthlySourceTotal: Math.round(monthlySourceTotal * 100) / 100,
      monthlySourceDays,
      mappingStatus: mapping?.match_status ?? null,
      mappingSourceCode: mapping?.source_code ?? null,
      mappingRemark: mapping?.remark ?? null,
    } satisfies CommissionAverageAuditRecord;
  }).filter((record, index) => {
    const employee = employees[index];
    return (
      Boolean(employee.commissionMethod && employee.commissionMethod !== 'none') ||
      employee.commissionRules.some((rule) => rule.enabled) ||
      (employee.salesAmountRatePercent ?? 0) > 0 ||
      employee.streetPromoterEnabled ||
      employee.telesalesEnabled ||
      employee.shopBonusEnabled ||
      employee.salaryType === 'package' ||
      employee.packageCommissionAmount > 0 ||
      record.source !== 'none'
    );
  });
}

export async function fetchPayrollAttendanceRecords(user: AppShellUser, yearMonth: string, supabaseClient?: QuerySupabaseClient): Promise<Record<string, PayrollAttendanceRecord>> {
  const supabase = supabaseClient ?? await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('payroll_attendance_records')
    .select('employee_code, year_month, calendar_days, worked_days, off_days, statutory_holiday_days, birthday_leave_days, tb8_days, sick_leave_days, maternity_leave_days, reward_leave_days, annual_leave_days, compassionate_leave_days, sick_no_pay_days, no_pay_leave_days, no_pay_statutory_holiday_days, no_pay_days, late_days, attendance_deduction_amount, remaining_deduction_amount, prorated_package_commission, actual_commission_amount, effective_commission_amount, package_no_pay_handling, package_no_pay_selection_required')
    .eq('year_month', yearMonth);

  if (error) {
    if (!isMissingColumnError(error.message)) {
      console.warn(`Failed to load payroll attendance records for ${yearMonth}:`, error.message);
    }
    return {};
  }

  let workedHoursByCode: Record<string, number> = {};
  const attendanceHoursResult = await supabase
    .from('monthly_attendance_records')
    .select('worked_hours, employees!inner(employee_code)')
    .eq('year_month', yearMonth);

  if (!attendanceHoursResult.error) {
    workedHoursByCode = Object.fromEntries(((attendanceHoursResult.data ?? []) as Array<{
      worked_hours: number | string | null;
      employees: { employee_code: string } | { employee_code: string }[] | null;
    }>).map((row) => {
      const employee = Array.isArray(row.employees) ? row.employees[0] : row.employees;
      return [employee?.employee_code ?? '', Number(row.worked_hours ?? 0)];
    }).filter(([employeeCode]) => Boolean(employeeCode)));
  } else if (!isMissingColumnError(attendanceHoursResult.error.message)) {
    console.warn(`Failed to load attendance worked hours for ${yearMonth}:`, attendanceHoursResult.error.message);
  }

  return Object.fromEntries(
    ((data ?? []) as Array<{
      employee_code: string;
      year_month: string;
      calendar_days: number | string | null;
      worked_days: number | string | null;
      off_days: number | string | null;
      statutory_holiday_days: number | string | null;
      birthday_leave_days: number | string | null;
      tb8_days: number | string | null;
      sick_leave_days: number | string | null;
      maternity_leave_days: number | string | null;
      reward_leave_days: number | string | null;
      annual_leave_days: number | string | null;
      compassionate_leave_days: number | string | null;
      sick_no_pay_days: number | string | null;
      no_pay_leave_days: number | string | null;
      no_pay_statutory_holiday_days: number | string | null;
      no_pay_days: number | string | null;
      late_days: number | string | null;
      attendance_deduction_amount: number | string | null;
      remaining_deduction_amount: number | string | null;
      prorated_package_commission: number | string | null;
      actual_commission_amount: number | string | null;
      effective_commission_amount: number | string | null;
      package_no_pay_handling: string | null;
      package_no_pay_selection_required: boolean | null;
    }>).map((row) => [
      row.employee_code,
      {
        employeeCode: row.employee_code,
        yearMonth: row.year_month,
        calendarDays: Number(row.calendar_days ?? 0),
        workedDays: Number(row.worked_days ?? 0),
        workedHours: workedHoursByCode[row.employee_code] ?? 0,
        offDays: Number(row.off_days ?? 0),
        statutoryHolidayDays: Number(row.statutory_holiday_days ?? 0),
        birthdayLeaveDays: Number(row.birthday_leave_days ?? 0),
        tb8Days: Number(row.tb8_days ?? 0),
        sickLeaveDays: Number(row.sick_leave_days ?? 0),
        maternityLeaveDays: Number(row.maternity_leave_days ?? 0),
        rewardLeaveDays: Number(row.reward_leave_days ?? 0),
        annualLeaveDays: Number(row.annual_leave_days ?? 0),
        compassionateLeaveDays: Number(row.compassionate_leave_days ?? 0),
        sickNoPayDays: Number(row.sick_no_pay_days ?? 0),
        noPayLeaveDays: Number(row.no_pay_leave_days ?? 0),
        noPayStatutoryHolidayDays: Number(row.no_pay_statutory_holiday_days ?? 0),
        noPayDays: Number(row.no_pay_days ?? 0),
        lateDays: Number(row.late_days ?? 0),
        attendanceDeductionAmount: Number(row.attendance_deduction_amount ?? 0),
        remainingDeductionAmount: Number(row.remaining_deduction_amount ?? 0),
        proratedPackageCommission: Number(row.prorated_package_commission ?? 0),
        actualCommissionAmount: Number(row.actual_commission_amount ?? 0),
        effectiveCommissionAmount: Number(row.effective_commission_amount ?? 0),
        packageNoPayHandling: row.package_no_pay_handling === 'no_package' || row.package_no_pay_handling === 'pro_rate'
          ? row.package_no_pay_handling
          : null,
        packageNoPaySelectionRequired: row.package_no_pay_selection_required ?? false,
      } satisfies PayrollAttendanceRecord,
    ]),
  );
}

/** Fetch saved commission records for a given year-month */
export async function fetchMonthlyCommissionRecords(yearMonth: string): Promise<MonthlyCommissionRecord[]> {
  const supabase = await createServerSupabaseClient();
  const officeJobResult = await supabase
    .from('monthly_commission_records')
    .select(MONTHLY_COMMISSION_RECORD_SELECT_WITH_OFFICE_JOB)
    .eq('year_month', yearMonth);

  const manualRemarksResult = officeJobResult.error && isMissingColumnError(officeJobResult.error.message)
    ? await supabase
      .from('monthly_commission_records')
      .select(MONTHLY_COMMISSION_RECORD_SELECT_WITH_MANUAL_REMARKS)
      .eq('year_month', yearMonth)
    : officeJobResult;

  const payoutResult = manualRemarksResult.error && isMissingColumnError(manualRemarksResult.error.message)
    ? await supabase
      .from('monthly_commission_records')
      .select(MONTHLY_COMMISSION_RECORD_SELECT_WITH_PAYOUT)
      .eq('year_month', yearMonth)
    : manualRemarksResult;

  const currentResult = payoutResult.error && isMissingColumnError(payoutResult.error.message)
    ? await supabase
    .from('monthly_commission_records')
    .select(MONTHLY_COMMISSION_RECORD_SELECT_CURRENT)
      .eq('year_month', yearMonth)
    : payoutResult;

  const result = currentResult.error && isMissingColumnError(currentResult.error.message)
    ? (console.warn(`Monthly commission schema drift detected for ${yearMonth}; falling back to legacy monthly commission fields.`), await supabase
      .from('monthly_commission_records')
      .select(MONTHLY_COMMISSION_RECORD_SELECT_LEGACY)
      .eq('year_month', yearMonth))
    : currentResult;

  if (result.error) {
    console.error(`Failed to load monthly commission records for ${yearMonth}:`, result.error.message);
    return [];
  }

  const { data } = result;

  return ((data ?? []) as unknown as {
    employee_id: string;
    year_month: string;
    mpf_ee_applied: boolean | null;
    mpf_ee_deduction_mode: 'split' | 'month_end' | null;
    mpf_ee_amount: number | string | null;
    mpf_ee_manual_override: boolean | null;
    mpf_er_applied: boolean | null;
    mpf_er_amount: number | string | null;
    mpf_er_manual_override: boolean | null;
    worked_days: number | string | null;
    worked_hours: number | string | null;
    redeem_volume: number | string;
    sales_volume: number | string;
    sales_amount_total: number | string | null;
    sales_amount_commission: number | string | null;
    job_amount: number | string;
    sgm_volume: number | string;
    street_promoter_headcount: number | string | null;
    street_promoter_commission_amount: number | string | null;
    telesales_headcount: number | string | null;
    telesales_commission_amount: number | string | null;
    briefing_bonus_applied: boolean | null;
    briefing_bonus_amount: number | string;
    attendance_bonus_applied: boolean | null;
    attendance_bonus_amount: number | string;
    booking_bonus_applied: boolean | null;
    booking_bonus_amount: number | string;
    office_job_applied?: boolean | null;
    office_job_amount?: number | string | null;
    manual_bonus_applied: boolean | null;
    manual_bonus_amount: number | string | null;
    manual_bonus_mpf_included: boolean | null;
    manual_bonus_payout?: 'primary' | 'month_end' | null;
    manual_bonus_remarks?: string | null;
    manual_deduction_applied: boolean | null;
    manual_deduction_amount: number | string | null;
    manual_deduction_mpf_included: boolean | null;
    manual_deduction_payout?: 'primary' | 'month_end' | null;
    manual_deduction_remarks?: string | null;
    shop_target_amount: number | string | null;
    shop_actual_sales_amount: number | string | null;
    shop_target_percent: number | string | null;
    shop_bonus_amount: number | string | null;
    redeem_commission: number | string;
    sales_commission: number | string;
    sgm_commission: number | string;
    sales_bonus: number | string;
    payroll_bonus: number | string;
    redeem_bonus_amount: number | string | null;
    total_commission: number | string;
    package_no_pay_handling: string | null;
    employees: { employee_code: string };
  }[]).map((r) => ({
    employeeCode: r.employees.employee_code,
    yearMonth: r.year_month,
    mpfEeApplied: r.mpf_ee_applied ?? false,
    mpfEeDeductionMode: r.mpf_ee_deduction_mode ?? 'split',
    mpfEeAmount: Number(r.mpf_ee_amount ?? 0),
    mpfEeManualOverride: r.mpf_ee_manual_override ?? false,
    mpfErApplied: r.mpf_er_applied ?? false,
    mpfErAmount: Number(r.mpf_er_amount ?? 0),
    mpfErManualOverride: r.mpf_er_manual_override ?? false,
    workedDays: Number(r.worked_days ?? 0),
    workedHours: Number(r.worked_hours ?? 0),
    redeemVolume: Number(r.redeem_volume),
    salesVolume: Number(r.sales_volume),
    salesAmountTotal: Number(r.sales_amount_total ?? 0),
    salesAmountCommission: Number(r.sales_amount_commission ?? 0),
    jobAmount: Number(r.job_amount),
    sgmVolume: Number(r.sgm_volume),
    streetPromoterHeadcount: Number(r.street_promoter_headcount ?? 0),
    streetPromoterCommissionAmount: Number(r.street_promoter_commission_amount ?? 0),
    telesalesHeadcount: Number(r.telesales_headcount ?? 0),
    telesalesCommissionAmount: Number(r.telesales_commission_amount ?? 0),
    briefingBonusApplied: r.briefing_bonus_applied ?? false,
    briefingBonusAmount: Number(r.briefing_bonus_amount),
    attendanceBonusApplied: r.attendance_bonus_applied ?? false,
    attendanceBonusAmount: Number(r.attendance_bonus_amount),
    bookingBonusApplied: r.booking_bonus_applied ?? false,
    bookingBonusAmount: Number(r.booking_bonus_amount),
    officeJobApplied: r.office_job_applied ?? false,
    officeJobAmount: Number(r.office_job_amount ?? 0),
    manualBonusApplied: r.manual_bonus_applied ?? false,
    manualBonusAmount: Number(r.manual_bonus_amount ?? 0),
    manualBonusMpfIncluded: r.manual_bonus_mpf_included ?? false,
    manualBonusPayout: r.manual_bonus_payout === 'primary' ? 'primary' : 'month_end',
    manualBonusRemarks: r.manual_bonus_remarks ?? '',
    manualDeductionApplied: r.manual_deduction_applied ?? false,
    manualDeductionAmount: Number(r.manual_deduction_amount ?? 0),
    manualDeductionMpfIncluded: r.manual_deduction_mpf_included ?? false,
    manualDeductionPayout: r.manual_deduction_payout === 'primary' ? 'primary' : 'month_end',
    manualDeductionRemarks: r.manual_deduction_remarks ?? '',
    shopTargetAmount: Number(r.shop_target_amount ?? 0),
    shopActualSalesAmount: Number(r.shop_actual_sales_amount ?? 0),
    shopTargetPercent: Number(r.shop_target_percent ?? 0),
    shopBonusAmount: Number(r.shop_bonus_amount ?? 0),
    redeemCommission: Number(r.redeem_commission),
    salesCommission: Number(r.sales_commission),
    sgmCommission: Number(r.sgm_commission),
    salesBonus: Number(r.sales_bonus),
    payrollBonus: Number(r.payroll_bonus),
    redeemBonus: Number(r.redeem_bonus_amount ?? 0),
    totalCommission: Number(r.total_commission),
    packageNoPayHandling: r.package_no_pay_handling === 'no_package' || r.package_no_pay_handling === 'pro_rate'
      ? r.package_no_pay_handling
      : null,
  }));
}

export async function fetchLatestMpfDeductionModesBeforeMonth(yearMonth: string): Promise<Record<string, 'split' | 'month_end'>> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('monthly_commission_records')
    .select('year_month, mpf_ee_deduction_mode, employees!inner(employee_code)')
    .lt('year_month', yearMonth)
    .not('mpf_ee_deduction_mode', 'is', null)
    .order('year_month', { ascending: false });

  if (error) {
    if (!isMissingColumnError(error.message)) {
      console.warn(`Failed to load previous MPF deduction modes before ${yearMonth}:`, error.message);
    }
    return {};
  }

  const modes: Record<string, 'split' | 'month_end'> = {};
  for (const row of (data ?? []) as Array<{
    year_month: string;
    mpf_ee_deduction_mode: 'split' | 'month_end' | null;
    employees: { employee_code: string } | { employee_code: string }[] | null;
  }>) {
    const employee = Array.isArray(row.employees) ? row.employees[0] : row.employees;
    const employeeCode = employee?.employee_code;
    if (!employeeCode || modes[employeeCode]) continue;
    if (row.mpf_ee_deduction_mode === 'split' || row.mpf_ee_deduction_mode === 'month_end') {
      modes[employeeCode] = row.mpf_ee_deduction_mode;
    }
  }

  return modes;
}

/** Fetch 365-day average commission per employee */
export async function fetchCommissionAverage365(): Promise<Record<string, number>> {
  const supabase = await createServerSupabaseClient();
  // Get last 12 months of records
  const now = new Date();
  const months: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const { data } = await supabase
    .from('monthly_commission_records')
    .select('total_commission, employees!inner(employee_code)')
    .in('year_month', months);

  const totals: Record<string, { sum: number; count: number }> = {};
  for (const r of (data ?? []) as unknown as { total_commission: number | string; employees: { employee_code: string } }[]) {
    const code = r.employees.employee_code;
    if (!totals[code]) totals[code] = { sum: 0, count: 0 };
    totals[code].sum += Number(r.total_commission);
    totals[code].count += 1;
  }

  const result: Record<string, number> = {};
  for (const [code, { sum, count }] of Object.entries(totals)) {
    // Average per day: total / (count months * ~30.4 days) * 365 ≈ monthly avg
    // Actually user wants "365天平均commission" = monthly average over last 12 months
    result[code] = Math.round((sum / Math.max(count, 1)) * 100) / 100;
  }
  return result;
}

// ── Leave Management ──

export type LeaveBalanceRecord = {
  leaveType: string;
  entitledDays: number;
  usedDays: number;
  pendingDays: number;
  carriedOver: number;
  remainingDays: number;
};

export type LeaveRequestRecord = {
  id: string;
  employeeCode: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  isHalfDay: boolean;
  halfDayPeriod: string | null;
  reason: string | null;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: string;
  reviewedAt: string | null;
  reviewNotes: string | null;
};

export type AttendanceManagementMonthlyRecord = {
  employeeId: string;
  employeeCode: string;
  yearMonth: string;
  salaryType: string | null;
  branchSection: string | null;
  calendarDays: number | null;
  workedDays: number | null;
  workedHours: number | null;
  offDays: number | null;
  statutoryHolidayDays: number | null;
  totalDays: number | null;
  birthdayLeaveDays: number | null;
  tb8Days: number | null;
  sickLeaveDays: number | null;
  maternityLeaveDays: number | null;
  rewardLeaveDays: number | null;
  annualLeaveDays: number | null;
  compassionateLeaveDays: number | null;
  sickNoPayDays: number | null;
  noPayLeaveDays: number | null;
  noPayStatutoryHolidayDays: number | null;
  noPayDays: number | null;
  deductionBase: number | null;
  deductionAmount: number | null;
  packageCommissionAmount: number | null;
  proratedPackageCommission: number | null;
  lateDays: number | null;
  prevMonthRemainingHours: number | null;
  makeupHours: number | null;
  overtimeHours: number | null;
  leaveToHoursConversion: number | null;
  accumulatedOtHours: number | null;
  remarks: string | null;
  updated_at?: string | null;
};

export type AttendanceDeductionBasis = {
  employeeId: string;
  employeeCode: string;
  salaryType: EmployeeDetailRecord['salaryType'];
  baseSalary: number;
  allowanceAmount: number;
  transportAllowance: number;
  bonusAmount: number;
  deductionBase: number;
};

export type AttendanceManagementOverview = {
  employees: EmployeeDirectoryRecord[];
  records: AttendanceManagementMonthlyRecord[];
  deductionBasisByEmployeeCode: Record<string, AttendanceDeductionBasis>;
  months: string[];
  defaultMonth: string;
  relationshipStrategy: {
    primary: 'employee_code';
    secondary: ['name_zh', 'name_en', 'alias'];
  };
};

export type LeaveOverview = {
  balances: { employeeCode: string; employeeName: string; records: LeaveBalanceRecord[] }[];
  requests: LeaveRequestRecord[];
  pendingCount: number;
};

export async function fetchAttendanceManagementOverview(user: AppShellUser): Promise<AttendanceManagementOverview> {
  const employees = (await fetchEmployeeDirectory(user)).filter((employee) => employee.employmentStatus === 'active');
  const currentMonth = new Date().toISOString().slice(0, 7);
  const defaultAttendanceMonth = getPreviousYearMonth(currentMonth);
  const payrollSummary = await fetchPayrollSummary(user);
  const deductionBasisByEmployeeCode = Object.fromEntries(
    payrollSummary.map((employee) => [
      employee.employeeCode,
      {
        employeeId: employees.find((entry) => entry.employeeCode === employee.employeeCode)?.id ?? '',
        employeeCode: employee.employeeCode,
        salaryType: employee.salaryType,
        baseSalary: employee.baseSalary,
        allowanceAmount: employee.allowanceAmount,
        transportAllowance: employee.transportAllowance,
        bonusAmount: employee.attendanceBonusAmount + employee.briefingBonus + employee.bookingBonus + employee.officeJobAmount,
        deductionBase: employee.baseSalary + employee.allowanceAmount + employee.transportAllowance + employee.attendanceBonusAmount + employee.briefingBonus + employee.bookingBonus + employee.officeJobAmount,
      },
    ]),
  );

  if (employees.length === 0) {
    return {
      employees: [],
      records: [],
      deductionBasisByEmployeeCode: {},
      months: [defaultAttendanceMonth, currentMonth],
      defaultMonth: defaultAttendanceMonth,
      relationshipStrategy: {
        primary: 'employee_code',
        secondary: ['name_zh', 'name_en', 'alias'],
      },
    };
  }

  const supabase = await createServerSupabaseClient();
  const employeeIds = employees.map((employee) => employee.id);
  const { data, error } = await supabase
    .from('attendance_management_records')
    .select('employee_id, employee_code, year_month, salary_type, branch_section, calendar_days, worked_days, off_days, statutory_holiday_days, total_days, birthday_leave_days, tb8_days, sick_leave_days, maternity_leave_days, reward_leave_days, annual_leave_days, compassionate_leave_days, sick_no_pay_days, no_pay_leave_days, no_pay_statutory_holiday_days, no_pay_days, late_days, deduction_base, deduction_amount, package_commission_amount, prorated_package_commission, prev_month_remaining_hours, makeup_hours, overtime_hours, leave_to_hours_conversion, accumulated_ot_hours, remarks, updated_at')
    .in('employee_id', employeeIds)
    .order('year_month', { ascending: false })
    .order('employee_code', { ascending: true });

  if (error) {
    if (!isMissingColumnError(error.message)) {
      console.warn('Failed to load attendance management records from Supabase:', error.message);
    }

    return {
      employees,
      records: [],
      deductionBasisByEmployeeCode,
      months: [defaultAttendanceMonth, currentMonth],
      defaultMonth: defaultAttendanceMonth,
      relationshipStrategy: {
        primary: 'employee_code',
        secondary: ['name_zh', 'name_en', 'alias'],
      },
    };
  }

  let workedHoursByEmployeeMonth: Record<string, number> = {};
  const workedHoursResult = await supabase
    .from('monthly_attendance_records')
    .select('employee_id, year_month, worked_hours')
    .in('employee_id', employeeIds);

  if (!workedHoursResult.error) {
    workedHoursByEmployeeMonth = Object.fromEntries(((workedHoursResult.data ?? []) as Array<{
      employee_id: string;
      year_month: string;
      worked_hours: number | string | null;
    }>).map((row) => [`${row.employee_id}:${row.year_month}`, Number(row.worked_hours ?? 0)]));
  } else if (!isMissingColumnError(workedHoursResult.error.message)) {
    console.warn('Failed to load attendance worked hours from Supabase:', workedHoursResult.error.message);
  }

  const records = ((data ?? []) as {
    employee_id: string;
    employee_code: string;
    year_month: string;
    salary_type: string | null;
    branch_section: string | null;
    calendar_days: number | string | null;
    worked_days: number | string | null;
    off_days: number | string | null;
    statutory_holiday_days: number | string | null;
    total_days: number | string | null;
    birthday_leave_days: number | string | null;
    tb8_days: number | string | null;
    sick_leave_days: number | string | null;
    maternity_leave_days: number | string | null;
    reward_leave_days: number | string | null;
    annual_leave_days: number | string | null;
    compassionate_leave_days: number | string | null;
    sick_no_pay_days: number | string | null;
    no_pay_leave_days: number | string | null;
    no_pay_statutory_holiday_days: number | string | null;
    no_pay_days: number | string | null;
    late_days: number | string | null;
    deduction_base: number | string | null;
    deduction_amount: number | string | null;
    package_commission_amount: number | string | null;
    prorated_package_commission: number | string | null;
    prev_month_remaining_hours: number | string | null;
    makeup_hours: number | string | null;
    overtime_hours: number | string | null;
    leave_to_hours_conversion: number | string | null;
    accumulated_ot_hours: number | string | null;
    remarks: string | null;
    updated_at: string | null;
  }[]).map((row) => ({
    employeeId: row.employee_id,
    employeeCode: row.employee_code,
    yearMonth: row.year_month,
    salaryType: row.salary_type,
    branchSection: row.branch_section,
    calendarDays: row.calendar_days === null ? null : Number(row.calendar_days),
    workedDays: row.worked_days === null ? null : Number(row.worked_days),
    workedHours: workedHoursByEmployeeMonth[`${row.employee_id}:${row.year_month}`] ?? null,
    offDays: row.off_days === null ? null : Number(row.off_days),
    statutoryHolidayDays: row.statutory_holiday_days === null ? null : Number(row.statutory_holiday_days),
    totalDays: row.total_days === null ? null : Number(row.total_days),
    birthdayLeaveDays: row.birthday_leave_days === null ? null : Number(row.birthday_leave_days),
    tb8Days: row.tb8_days === null ? null : Number(row.tb8_days),
    sickLeaveDays: row.sick_leave_days === null ? null : Number(row.sick_leave_days),
    maternityLeaveDays: row.maternity_leave_days === null ? null : Number(row.maternity_leave_days),
    rewardLeaveDays: row.reward_leave_days === null ? null : Number(row.reward_leave_days),
    annualLeaveDays: row.annual_leave_days === null ? null : Number(row.annual_leave_days),
    compassionateLeaveDays: row.compassionate_leave_days === null ? null : Number(row.compassionate_leave_days),
    sickNoPayDays: row.sick_no_pay_days === null ? null : Number(row.sick_no_pay_days),
    noPayLeaveDays: row.no_pay_leave_days === null ? null : Number(row.no_pay_leave_days),
    noPayStatutoryHolidayDays: row.no_pay_statutory_holiday_days === null ? null : Number(row.no_pay_statutory_holiday_days),
    noPayDays: row.no_pay_days === null ? null : Number(row.no_pay_days),
    lateDays: row.late_days === null ? null : Number(row.late_days),
    deductionBase: row.deduction_base === null ? null : Number(row.deduction_base),
    deductionAmount: row.deduction_amount === null ? null : Number(row.deduction_amount),
    packageCommissionAmount: row.package_commission_amount === null ? null : Number(row.package_commission_amount),
    proratedPackageCommission: row.prorated_package_commission === null ? null : Number(row.prorated_package_commission),
    prevMonthRemainingHours: row.prev_month_remaining_hours === null ? null : Number(row.prev_month_remaining_hours),
    makeupHours: row.makeup_hours === null ? null : Number(row.makeup_hours),
    overtimeHours: row.overtime_hours === null ? null : Number(row.overtime_hours),
    leaveToHoursConversion: row.leave_to_hours_conversion === null ? null : Number(row.leave_to_hours_conversion),
    accumulatedOtHours: row.accumulated_ot_hours === null ? null : Number(row.accumulated_ot_hours),
    remarks: row.remarks,
    updated_at: row.updated_at,
  }));

  const recordMonths = Array.from(new Set(records.map((record) => record.yearMonth))).sort((left, right) => right.localeCompare(left));
  const months = Array.from(new Set([...recordMonths, defaultAttendanceMonth, currentMonth])).sort((left, right) => right.localeCompare(left));

  return {
    employees,
    records,
    deductionBasisByEmployeeCode,
    months,
    defaultMonth: defaultAttendanceMonth,
    relationshipStrategy: {
      primary: 'employee_code',
      secondary: ['name_zh', 'name_en', 'alias'],
    },
  };
}

export async function fetchLeaveOverview(user: AppShellUser, year = new Date().getFullYear()): Promise<LeaveOverview> {
  const supabase = await createServerSupabaseClient();

  // Fetch balances with employee info
  const balQuery = supabase
    .from('leave_balances')
    .select('leave_type, entitled_days, used_days, pending_days, carried_over, employees!inner(employee_code, name_zh, alias, employment_status)')
    .eq('year', year)
    .eq('employees.employment_status', 'active');

  const { data: balData } = await balQuery;

  const balMap = new Map<string, { employeeCode: string; employeeName: string; records: LeaveBalanceRecord[] }>();
  for (const row of (balData ?? []) as unknown as { leave_type: string; entitled_days: number; used_days: number; pending_days: number; carried_over: number; employees: { employee_code: string; name_zh: string; alias: string | null } }[]) {
    const code = row.employees.employee_code;
    if (!balMap.has(code)) {
      balMap.set(code, { employeeCode: code, employeeName: row.employees.alias || row.employees.name_zh, records: [] });
    }
    const entitled = Number(row.entitled_days) + Number(row.carried_over);
    balMap.get(code)!.records.push({
      leaveType: row.leave_type,
      entitledDays: Number(row.entitled_days),
      usedDays: Number(row.used_days),
      pendingDays: Number(row.pending_days),
      carriedOver: Number(row.carried_over),
      remainingDays: entitled - Number(row.used_days) - Number(row.pending_days),
    });
  }

  // Fetch requests
  const reqQuery = supabase
    .from('leave_requests')
    .select('id, leave_type, start_date, end_date, days, is_half_day, half_day_period, reason, status, submitted_at, reviewed_at, review_notes, employees!inner(employee_code, name_zh, alias)')
    .order('submitted_at', { ascending: false })
    .limit(50);

  const { data: reqData } = await reqQuery;

  const requests: LeaveRequestRecord[] = ((reqData ?? []) as unknown as {
    id: string; leave_type: string; start_date: string; end_date: string; days: number;
    is_half_day: boolean; half_day_period: string | null; reason: string | null;
    status: LeaveRequestRecord['status']; submitted_at: string; reviewed_at: string | null; review_notes: string | null;
    employees: { employee_code: string; name_zh: string; alias: string | null };
  }[]).map((r) => ({
    id: r.id,
    employeeCode: r.employees.employee_code,
    employeeName: r.employees.alias || r.employees.name_zh,
    leaveType: r.leave_type,
    startDate: r.start_date,
    endDate: r.end_date,
    days: Number(r.days),
    isHalfDay: r.is_half_day,
    halfDayPeriod: r.half_day_period,
    reason: r.reason,
    status: r.status,
    submittedAt: r.submitted_at,
    reviewedAt: r.reviewed_at,
    reviewNotes: r.review_notes,
  }));

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return {
    balances: Array.from(balMap.values()).sort((a, b) => a.employeeCode.localeCompare(b.employeeCode)),
    requests,
    pendingCount,
  };
}
