'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Payroll from '@/src/app/pages/Payroll';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { fetchPayrollSummary, fetchCommissionRateTiers, fetchMonthlyCommissionRecords, fetchCommissionAverage365, fetchPayrollBonusConfigCatalog, fetchPayrollAttendanceRecords, fetchRollingCommissionAverages, fetchLatestMpfDeductionModesBeforeMonth } from '@/src/lib/employees/queries';
import { fetchPayrollSystemSettings } from '@/src/lib/system-management/queries';
import { fetchPayrollReviewAnswers } from './actions';
export default function PayrollPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const now = new Date();
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const defaultMonth = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const requestedMonth = searchParams?.get('month') ?? undefined;
  const selectedMonth = requestedMonth && /^\d{4}-\d{2}$/.test(requestedMonth) ? requestedMonth : defaultMonth;
  const payrollMonth = selectedMonth;

  useEffect(() => {
    if (!user) return;

    let active = true;
    const withFallback = async <T,>(label: string, promise: Promise<T>, fallback: T): Promise<T> => {
      try {
        return await promise;
      } catch (error) {
        console.error(`Failed to load payroll ${label}:`, error);
        return fallback;
      }
    };

    setData((current: any) => ({
      month: payrollMonth,
      employees: current?.employees ?? [],
      commissionTiers: current?.commissionTiers ?? [],
      savedRecords: [],
      commissionAvg: current?.commissionAvg ?? {},
      payrollBonusConfig: current?.payrollBonusConfig,
      attendanceRecords: {},
      defaultPackageNoPayHandling: current?.defaultPackageNoPayHandling ?? 'pro_rate',
      payrollReviewAnswers: {},
      previousMpfDeductionModes: {},
      rollingCommissionAverages: {},
    }));

    Promise.all([
      withFallback('summary', fetchPayrollSummary(user), []),
      withFallback('commission tiers', fetchCommissionRateTiers(), []),
      withFallback('saved records', fetchMonthlyCommissionRecords(payrollMonth), []),
      withFallback('365 average', fetchCommissionAverage365(), {}),
      withFallback('bonus config', fetchPayrollBonusConfigCatalog(), undefined),
      withFallback('attendance records', fetchPayrollAttendanceRecords(user, payrollMonth), {}),
      withFallback('system settings', fetchPayrollSystemSettings(), { packageNoPayDefaultHandling: 'pro_rate' as const }),
      withFallback('review answers', fetchPayrollReviewAnswers(payrollMonth), {}),
      withFallback('previous MPF modes', fetchLatestMpfDeductionModesBeforeMonth(payrollMonth), {}),
      withFallback('rolling averages', fetchRollingCommissionAverages(user, payrollMonth), {}),
    ]).then(([employees, commissionTiers, savedRecords, commissionAvg, payrollBonusConfig, attendanceRecords, sys, payrollReviewAnswers, previousMpfDeductionModes, rollingCommissionAverages]) => {
      if (!active) return;
      setData({
        month: payrollMonth,
        employees,
        commissionTiers,
        savedRecords,
        commissionAvg,
        payrollBonusConfig,
        attendanceRecords,
        defaultPackageNoPayHandling: sys.packageNoPayDefaultHandling,
        payrollReviewAnswers,
        previousMpfDeductionModes,
        rollingCommissionAverages,
      });
    });

    return () => { active = false; };
  }, [payrollMonth, user]);

  if (!user || !data || data.month !== payrollMonth) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}><p>載入中…</p></div>;
  return <Payroll employees={data.employees} commissionTiers={data.commissionTiers} savedRecords={data.savedRecords} commissionAvg={data.commissionAvg} selectedMonth={selectedMonth} attendanceMonth={payrollMonth} payrollBonusConfig={data.payrollBonusConfig} attendanceRecords={data.attendanceRecords} defaultPackageNoPayHandling={data.defaultPackageNoPayHandling} initialPayrollReviewAnswers={data.payrollReviewAnswers} previousMpfDeductionModes={data.previousMpfDeductionModes} rollingCommissionAverages={data.rollingCommissionAverages} />;
}
