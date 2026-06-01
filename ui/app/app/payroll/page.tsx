'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Payroll from '@/src/app/pages/Payroll';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { createLegacyPayrollBonusConfigCatalog } from '@/src/lib/employees/payroll-bonus';
import { fetchPayrollSummary, fetchCommissionRateTiers, fetchMonthlyCommissionRecords, fetchCommissionAverage365, fetchPayrollBonusConfigCatalog, fetchPayrollAttendanceRecords, fetchRollingCommissionAverages, fetchLatestMpfDeductionModesBeforeMonth } from '@/src/lib/employees/queries';
import { fetchPayrollSystemSettings } from '@/src/lib/system-management/queries';
import { fetchPayrollReviewAnswers } from './actions';

type PayrollLoadStatus = 'loading' | 'ready' | 'error';

export default function PayrollPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loadStatus, setLoadStatus] = useState<PayrollLoadStatus>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const now = new Date();
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const defaultMonth = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const requestedMonth = searchParams?.get('month') ?? undefined;
  const selectedMonth = requestedMonth && /^\d{4}-\d{2}$/.test(requestedMonth) ? requestedMonth : defaultMonth;
  const payrollMonth = selectedMonth;

  useEffect(() => {
    if (!user) {
      setLoadStatus('loading');
      setLoadError(null);
      setData(null);
      return;
    }

    let active = true;
    const withOptionalFallback = async <T,>(label: string, promise: Promise<T>, fallback: T): Promise<T> => {
      try {
        return await promise;
      } catch (error) {
        console.warn(`Optional payroll ${label} failed; using fallback:`, error);
        return fallback;
      }
    };

    setLoadStatus('loading');
    setLoadError(null);
    setData(null);

    Promise.all([
      fetchPayrollSummary(user),
      fetchMonthlyCommissionRecords(payrollMonth),
      fetchPayrollAttendanceRecords(user, payrollMonth),
      withOptionalFallback('commission tiers', fetchCommissionRateTiers(), []),
      withOptionalFallback('365 average', fetchCommissionAverage365(), {}),
      withOptionalFallback('bonus config', fetchPayrollBonusConfigCatalog(), createLegacyPayrollBonusConfigCatalog()),
      withOptionalFallback('system settings', fetchPayrollSystemSettings(), { packageNoPayDefaultHandling: 'pro_rate' as const }),
      withOptionalFallback('review answers', fetchPayrollReviewAnswers(payrollMonth), {}),
      withOptionalFallback('previous MPF modes', fetchLatestMpfDeductionModesBeforeMonth(payrollMonth), {}),
      withOptionalFallback('rolling averages', fetchRollingCommissionAverages(user, payrollMonth), {}),
    ])
      .then(([employees, savedRecords, attendanceRecords, commissionTiers, commissionAvg, payrollBonusConfig, sys, payrollReviewAnswers, previousMpfDeductionModes, rollingCommissionAverages]) => {
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
        setLoadStatus('ready');
      })
      .catch((error) => {
        if (!active) return;
        console.error(`Failed to load critical payroll data for ${payrollMonth}:`, error);
        setData(null);
        setLoadError(error instanceof Error ? error.message : String(error));
        setLoadStatus('error');
      });

    return () => { active = false; };
  }, [payrollMonth, user]);

  if (loadStatus === 'error') {
    return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',padding:'24px' }}><div style={{ maxWidth: '560px', border: '1px solid #fecdd3', borderRadius: '16px', background: '#fff1f2', padding: '20px', color: '#be123c' }}><p style={{ fontWeight: 700, marginBottom: '8px' }}>未能載入 {payrollMonth} Payroll 資料</p><p style={{ fontSize: '14px' }}>{loadError ?? '請稍後重試。'}</p></div></div>;
  }

  if (!user || loadStatus === 'loading' || !data || data.month !== payrollMonth) {
    return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}><p>載入中…</p></div>;
  }

  return <Payroll employees={data.employees} commissionTiers={data.commissionTiers} savedRecords={data.savedRecords} commissionAvg={data.commissionAvg} selectedMonth={selectedMonth} attendanceMonth={payrollMonth} payrollBonusConfig={data.payrollBonusConfig} attendanceRecords={data.attendanceRecords} defaultPackageNoPayHandling={data.defaultPackageNoPayHandling} initialPayrollReviewAnswers={data.payrollReviewAnswers} previousMpfDeductionModes={data.previousMpfDeductionModes} rollingCommissionAverages={data.rollingCommissionAverages} isDataReady={loadStatus === 'ready'} />;
}
