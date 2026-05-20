


import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { getCurrentUser } from '@/src/lib/auth/session';
import { canAccessRoute } from '@/src/lib/auth/roles';
import type { PackageNoPayHandling, PayrollEmployeeSummary } from '@/src/lib/employees/queries';
import { createLegacyCustomCommissionTiers, normalizeCustomCommissionName, normalizeCustomCommissionTiers } from '@/src/lib/employees/custom-commission';
import { calculateShopTargetPercent } from '@/src/lib/employees/payroll-bonus';
import { normalizePayrollBonusTiers, normalizeShopBonusTiers, type PayrollBonusScheme, type ShopBonusScheme } from '@/src/lib/employees/payroll-bonus';
import { normalizeCommissionRules } from '@/src/lib/employees/commission-rules';

function isMissingColumnError(message: string | null | undefined) {
  return typeof message === 'string' && (
    message.includes('does not exist') ||
    message.includes('schema cache') ||
    message.includes('Could not find the')
  );
}

type CommissionEntry = {
  employeeCode: string;
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
  manualBonusApplied: boolean;
  manualBonusAmount: number;
  manualBonusMpfIncluded: boolean;
  manualDeductionApplied: boolean;
  manualDeductionAmount: number;
  manualDeductionMpfIncluded: boolean;
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

type LatestPayrollEmployeeDefaults = Partial<PayrollEmployeeSummary> & {
  employeeCode: string;
  streetPromoterEnabled?: boolean;
  telesalesEnabled?: boolean;
};

export type PayrollReviewEntry = {
  issueKey: string;
  employeeCode: string;
  issueType: string;
  reason: string;
  action?: string | null;
  detail?: Record<string, unknown>;
};


export async function fetchLatestPayrollEmployeeDefaults(employeeCode: string): Promise<{ success: true; employee: LatestPayrollEmployeeDefaults } | { error: string }> {
  const user = await getCurrentUser();
  if (!user || !canAccessRoute(user.role, 'payroll')) {
    return { error: 'Unauthorized' };
  }

  const normalizedCode = employeeCode.trim();
  if (!normalizedCode) {
    return { error: 'Missing employee code' };
  }

  const supabase = createSupabaseAdminClient();
  const legacyProfileSelect = 'salary_type, base_salary, allowance_amount, attendance_bonus_amount, transport_allowance, briefing_bonus, booking_bonus, mpf_enabled, pay_day_primary, pay_day_secondary, commission_method, commission_custom_name, commission_custom_tiers, commission_redeem_rate, commission_sales_rate, commission_sgm_rate, sales_bonus_enabled, sales_bonus_rate, sales_bonus_custom_name, sales_bonus_custom_tiers, payroll_bonus_enabled, payroll_bonus_scheme, street_promoter_enabled, telesales_enabled, shop_bonus_enabled, shop_bonus_custom_name, shop_bonus_custom_tiers, shop_bonus_scheme';
  const currentProfileSelect = `${legacyProfileSelect}, package_commission_amount, sales_amount_rate_percent, commission_rules, redeem_bonus_enabled, redeem_bonus_custom_name, redeem_bonus_custom_tiers`;
  const buildQuery = (profileSelect: string) => supabase
    .from('employees')
    .select(`employee_code, name_zh, alias, hire_date, date_of_birth, position:positions(code, name_zh), branch:branches(name_zh), employee_salary_profiles(${profileSelect})`)
    .eq('employee_code', normalizedCode)
    .maybeSingle();
  const currentResult = await buildQuery(currentProfileSelect);
  const { data, error } = currentResult.error && isMissingColumnError(currentResult.error.message)
    ? await buildQuery(legacyProfileSelect)
    : currentResult;

  if (error) {
    return { error: error.message };
  }

  if (!data) {
    return { error: 'Employee not found' };
  }

  const row = data as unknown as {
    employee_code: string;
    name_zh: string;
    alias: string | null;
    hire_date: string;
    date_of_birth: string | null;
    position: { code: string | null; name_zh: string | null } | { code: string | null; name_zh: string | null }[] | null;
    branch: { name_zh: string | null } | { name_zh: string | null }[] | null;
    employee_salary_profiles: {
      salary_type: PayrollEmployeeSummary['salaryType'];
      base_salary: number | string | null;
      package_commission_amount: number | string | null;
      allowance_amount: number | string | null;
      attendance_bonus_amount: number | string | null;
      transport_allowance: number | string | null;
      briefing_bonus: number | string | null;
      booking_bonus: number | string | null;
      mpf_enabled: boolean | null;
      pay_day_primary: number | null;
      pay_day_secondary: number | null;
      commission_method: string | null;
      commission_custom_name: string | null;
      commission_custom_tiers: unknown | null;
      commission_rules: unknown | null;
      commission_redeem_rate: number | string | null;
      commission_sales_rate: number | string | null;
      commission_sgm_rate: number | string | null;
      sales_amount_rate_percent: number | string | null;
      sales_bonus_enabled: boolean | null;
      sales_bonus_rate: number | string | null;
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
    } | null;
  };

  const profile = row.employee_salary_profiles;
  const commissionRedeemRate = profile?.commission_redeem_rate ? Number(profile.commission_redeem_rate) : null;
  const commissionSalesRate = profile?.commission_sales_rate ? Number(profile.commission_sales_rate) : null;
  const commissionSgmRate = profile?.commission_sgm_rate ? Number(profile.commission_sgm_rate) : null;
  const salesAmountRatePercent = profile?.sales_amount_rate_percent ? Number(profile.sales_amount_rate_percent) : null;
  const commissionCustomTiers = normalizeCustomCommissionTiers(profile?.commission_custom_tiers ?? null);
  const branchName = Array.isArray(row.branch) ? (row.branch[0]?.name_zh ?? null) : (row.branch?.name_zh ?? null);
  const positionCode = Array.isArray(row.position) ? (row.position[0]?.code ?? null) : (row.position?.code ?? null);
  const positionNameZh = Array.isArray(row.position) ? (row.position[0]?.name_zh ?? null) : (row.position?.name_zh ?? null);

  return {
    success: true,
    employee: {
      employeeCode: row.employee_code,
      nameZh: row.name_zh,
      alias: row.alias,
      branchName,
      positionCode,
      positionNameZh,
      hireDate: row.hire_date,
      dateOfBirth: row.date_of_birth,
      salaryType: profile?.salary_type ?? null,
      baseSalary: profile?.base_salary ? Number(profile.base_salary) : 0,
      packageCommissionAmount: profile?.package_commission_amount ? Number(profile.package_commission_amount) : 0,
      allowanceAmount: profile?.allowance_amount ? Number(profile.allowance_amount) : 0,
      attendanceBonusAmount: profile?.attendance_bonus_amount ? Number(profile.attendance_bonus_amount) : 0,
      transportAllowance: profile?.transport_allowance ? Number(profile.transport_allowance) : 0,
      briefingBonus: profile?.briefing_bonus ? Number(profile.briefing_bonus) : 0,
      bookingBonus: profile?.booking_bonus ? Number(profile.booking_bonus) : 0,
      mpfEnabled: profile?.mpf_enabled ?? false,
      payDayPrimary: profile?.pay_day_primary ?? null,
      payDaySecondary: profile?.pay_day_secondary ?? null,
      commissionMethod: profile?.commission_method ?? null,
      commissionCustomName: normalizeCustomCommissionName(profile?.commission_custom_name ?? null),
      commissionCustomTiers: profile?.commission_method === 'custom' && commissionCustomTiers.length === 0
        ? createLegacyCustomCommissionTiers(commissionRedeemRate, commissionSalesRate, commissionSgmRate)
        : commissionCustomTiers,
      commissionRules: normalizeCommissionRules(profile?.commission_rules ?? null),
      commissionRedeemRate,
      commissionSalesRate,
      commissionSgmRate,
      salesAmountRatePercent,
      salesBonusEnabled: profile?.sales_bonus_enabled ?? false,
      salesBonusRate: profile?.sales_bonus_rate ? Number(profile.sales_bonus_rate) : null,
      salesBonusCustomName: profile?.sales_bonus_custom_name ?? null,
      salesBonusCustomTiers: normalizePayrollBonusTiers(profile?.sales_bonus_custom_tiers ?? null),
      redeemBonusEnabled: profile?.redeem_bonus_enabled ?? false,
      redeemBonusCustomName: profile?.redeem_bonus_custom_name ?? null,
      redeemBonusCustomTiers: normalizePayrollBonusTiers(profile?.redeem_bonus_custom_tiers ?? null),
      payrollBonusEnabled: profile?.payroll_bonus_enabled ?? false,
      payrollBonusScheme: profile?.payroll_bonus_scheme ?? null,
      streetPromoterEnabled: profile?.street_promoter_enabled ?? false,
      telesalesEnabled: profile?.telesales_enabled ?? false,
      shopBonusEnabled: profile?.shop_bonus_enabled ?? false,
      shopBonusCustomName: profile?.shop_bonus_custom_name ?? null,
      shopBonusCustomTiers: normalizeShopBonusTiers(profile?.shop_bonus_custom_tiers ?? null),
      shopBonusScheme: profile?.shop_bonus_scheme ?? null,
    },
  };
}

export async function saveMonthlyCommission(yearMonth: string, entries: CommissionEntry[]) {
  const user = await getCurrentUser();
  if (!user || !canAccessRoute(user.role, 'payroll')) {
    return { error: 'Unauthorized' };
  }

  if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
    return { error: 'Invalid year-month format' };
  }

  const nonEmpty = entries.filter((e) => (
    e.mpfEeApplied ||
    e.mpfErApplied ||
    e.mpfEeDeductionMode !== 'split' ||
    e.mpfEeAmount > 0 ||
    e.mpfErAmount > 0 ||
    e.mpfEeManualOverride ||
    e.mpfErManualOverride ||
    e.workedDays > 0 ||
    e.workedHours > 0 ||
    e.redeemVolume > 0 ||
    e.salesVolume > 0 ||
    e.salesAmountTotal > 0 ||
    e.salesAmountCommission > 0 ||
    e.jobAmount > 0 ||
    e.sgmVolume > 0 ||
    e.streetPromoterHeadcount > 0 ||
    e.streetPromoterCommissionAmount > 0 ||
    e.telesalesHeadcount > 0 ||
    e.telesalesCommissionAmount > 0 ||
    e.briefingBonusApplied ||
    e.attendanceBonusApplied ||
    e.bookingBonusApplied ||
    e.manualBonusApplied ||
    e.manualBonusAmount > 0 ||
    e.manualBonusMpfIncluded ||
    e.manualDeductionApplied ||
    e.manualDeductionAmount > 0 ||
    e.manualDeductionMpfIncluded ||
    e.shopTargetAmount > 0 ||
    e.shopActualSalesAmount > 0 ||
    e.shopTargetPercent > 0 ||
    e.shopBonusAmount > 0 ||
    e.redeemCommission > 0 ||
    e.salesCommission > 0 ||
    e.sgmCommission > 0 ||
    e.salesBonus > 0 ||
    e.payrollBonus > 0 ||
    e.redeemBonus > 0 ||
    e.totalCommission > 0
  ));
  if (nonEmpty.length === 0) {
    return { error: 'No commission data to save' };
  }

  const supabase = createSupabaseAdminClient();

  // Resolve employee_code -> employee_id
  const codes = nonEmpty.map((e) => e.employeeCode);
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('id, employee_code')
    .in('employee_code', codes);

  if (empError || !employees) {
    return { error: empError?.message ?? 'Failed to resolve employees' };
  }

  const codeToId = new Map(employees.map((e) => [e.employee_code, e.id]));

  const rows = nonEmpty
    .filter((e) => codeToId.has(e.employeeCode))
    .map((e) => {
      const shopTargetAmount = e.shopTargetAmount > 0 ? e.shopTargetAmount : 0;
      const shopActualSalesAmount = e.shopActualSalesAmount > 0 ? e.shopActualSalesAmount : 0;
      const shopTargetPercent = calculateShopTargetPercent(shopTargetAmount, shopActualSalesAmount) || e.shopTargetPercent;

      return {
        employee_id: codeToId.get(e.employeeCode)!,
        year_month: yearMonth,
        mpf_ee_applied: e.mpfEeApplied,
        mpf_ee_deduction_mode: e.mpfEeApplied ? e.mpfEeDeductionMode : 'split',
        mpf_ee_amount: e.mpfEeApplied ? e.mpfEeAmount : 0,
        mpf_ee_manual_override: e.mpfEeManualOverride,
        mpf_er_applied: e.mpfErApplied,
        mpf_er_amount: e.mpfErApplied ? e.mpfErAmount : 0,
        mpf_er_manual_override: e.mpfErManualOverride,
        worked_days: e.workedDays,
        worked_hours: e.workedHours,
        redeem_volume: e.redeemVolume,
        sales_volume: e.salesVolume,
        sales_amount_total: e.salesAmountTotal,
        sales_amount_commission: e.salesAmountCommission,
        job_amount: e.jobAmount,
        sgm_volume: e.sgmVolume,
        street_promoter_headcount: e.streetPromoterHeadcount,
        street_promoter_commission_amount: e.streetPromoterCommissionAmount,
        telesales_headcount: e.telesalesHeadcount,
        telesales_commission_amount: e.telesalesCommissionAmount,
        briefing_bonus_applied: e.briefingBonusApplied,
        briefing_bonus_amount: e.briefingBonusApplied ? e.briefingBonusAmount : 0,
        attendance_bonus_applied: e.attendanceBonusApplied,
        attendance_bonus_amount: e.attendanceBonusApplied ? e.attendanceBonusAmount : 0,
        booking_bonus_applied: e.bookingBonusApplied,
        booking_bonus_amount: e.bookingBonusApplied ? e.bookingBonusAmount : 0,
        manual_bonus_applied: e.manualBonusApplied,
        manual_bonus_amount: e.manualBonusApplied ? e.manualBonusAmount : 0,
        manual_bonus_mpf_included: e.manualBonusApplied ? e.manualBonusMpfIncluded : false,
        manual_deduction_applied: e.manualDeductionApplied,
        manual_deduction_amount: e.manualDeductionApplied ? e.manualDeductionAmount : 0,
        manual_deduction_mpf_included: e.manualDeductionApplied ? e.manualDeductionMpfIncluded : false,
        shop_target_amount: shopTargetAmount,
        shop_actual_sales_amount: shopActualSalesAmount,
        shop_target_percent: shopTargetPercent,
        shop_bonus_amount: e.shopBonusAmount,
        redeem_commission: e.redeemCommission,
        sales_commission: e.salesCommission,
        sgm_commission: e.sgmCommission,
        sales_bonus: e.salesBonus,
        payroll_bonus: e.payrollBonus,
        redeem_bonus_amount: e.redeemBonus,
        total_commission: e.totalCommission,
        package_no_pay_handling: e.packageNoPayHandling,
        updated_at: new Date().toISOString(),
      };
    });

  const currentResult = await supabase
    .from('monthly_commission_records')
    .upsert(rows, { onConflict: 'employee_id,year_month' });

  const upsertError = currentResult.error && isMissingColumnError(currentResult.error.message)
    ? (console.warn('Monthly commission schema drift detected while saving payroll; falling back to legacy shop bonus snapshot fields.'), (
      await supabase
        .from('monthly_commission_records')
        .upsert(
          rows.map(({ shop_target_amount, shop_actual_sales_amount, street_promoter_headcount, street_promoter_commission_amount, telesales_headcount, telesales_commission_amount, manual_deduction_applied, manual_deduction_amount, manual_bonus_mpf_included, manual_deduction_mpf_included, mpf_ee_deduction_mode, worked_days, worked_hours, sales_amount_total, sales_amount_commission, package_no_pay_handling, redeem_bonus_amount, ...row }) => ({
            ...row,
            job_amount: Number(row.job_amount ?? 0) + Number(street_promoter_commission_amount ?? 0) + Number(telesales_commission_amount ?? 0),
          })),
          { onConflict: 'employee_id,year_month' },
        )
    ).error)
    : currentResult.error;

  if (upsertError) {
    return { error: upsertError.message };
  }

  if (yearMonth >= '2026-04') {
    const averageRows = nonEmpty
      .filter((entry) => codeToId.has(entry.employeeCode))
      .map((entry) => ({
        employee_code: entry.employeeCode,
        year_month: yearMonth,
        average_commission_amount: entry.totalCommission > 0 ? entry.totalCommission : 0,
        source: 'payroll',
        updated_at: new Date().toISOString(),
      }));

    if (averageRows.length > 0) {
      const averageResult = await supabase
        .from('employee_commission_average_monthly')
        .upsert(averageRows, { onConflict: 'employee_code,year_month,source' });

      if (averageResult.error && !isMissingColumnError(averageResult.error.message)) {
        return { error: averageResult.error.message };
      }
    }
  }

  return { success: true, count: rows.length };
}

export async function fetchPayrollReviewAnswers(yearMonth: string): Promise<Record<string, string>> {
  const user = await getCurrentUser();
  if (!user || !canAccessRoute(user.role, 'payroll')) {
    return {};
  }

  if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
    return {};
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('payroll_submission_reviews')
    .select('issue_key, reason')
    .eq('year_month', yearMonth);

  if (error) {
    if (isMissingColumnError(error.message) || error.message.includes('does not exist')) {
      console.warn('Payroll review table is not available yet:', error.message);
      return {};
    }
    console.error('Failed to load payroll review answers:', error.message);
    return {};
  }

  return Object.fromEntries((data ?? []).map((row) => [String(row.issue_key), String(row.reason)]));
}

export async function savePayrollReviewAnswers(yearMonth: string, entries: PayrollReviewEntry[]) {
  const user = await getCurrentUser();
  if (!user || !canAccessRoute(user.role, 'payroll')) {
    return { error: 'Unauthorized' };
  }

  if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
    return { error: 'Invalid year-month format' };
  }

  const filteredEntries = entries.filter((entry) => entry.issueKey && entry.employeeCode && entry.issueType && entry.reason);
  if (filteredEntries.length === 0) {
    return { success: true, saved: 0 };
  }

  const supabase = createSupabaseAdminClient();
  const payload = filteredEntries.map((entry) => ({
    year_month: yearMonth,
    employee_code: entry.employeeCode,
    issue_key: entry.issueKey,
    issue_type: entry.issueType,
    reason: entry.reason,
    action: entry.action ?? null,
    detail: entry.detail ?? {},
    updated_by: null,
    created_by: null,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('payroll_submission_reviews')
    .upsert(payload, { onConflict: 'year_month,issue_key' });

  if (error) {
    if (isMissingColumnError(error.message) || error.message.includes('does not exist')) {
      console.warn('Payroll review table is not available yet:', error.message);
      return { success: true, saved: 0, warning: 'Payroll review table is not available yet.' };
    }
    return { error: error.message };
  }

  return { success: true, saved: payload.length };
}
