'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Payroll from '@/src/app/pages/Payroll';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { fetchPayrollSummary, fetchCommissionRateTiers, fetchMonthlyCommissionRecords, fetchCommissionAverage365, fetchPayrollBonusConfigCatalog, fetchPayrollAttendanceRecords } from '@/src/lib/employees/queries';
import { fetchPayrollSystemSettings } from '@/src/lib/system-management/queries';
export default function PayrollPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const requestedMonth = searchParams?.get('month') ?? undefined;
  const selectedMonth = requestedMonth && /^\d{4}-\d{2}$/.test(requestedMonth) ? requestedMonth : currentMonth;
  const [year, month] = selectedMonth.split('-').map(Number);
  const salaryDate = new Date(year, month - 2, 1);
  const salaryMonth = `${salaryDate.getFullYear()}-${String(salaryDate.getMonth() + 1).padStart(2, '0')}`;
  useEffect(() => { if (!user) return; Promise.all([fetchPayrollSummary(user), fetchCommissionRateTiers(), fetchMonthlyCommissionRecords(salaryMonth), fetchCommissionAverage365(), fetchPayrollBonusConfigCatalog(), fetchPayrollAttendanceRecords(user, salaryMonth), fetchPayrollSystemSettings()]).then(([employees, commissionTiers, savedRecords, commissionAvg, payrollBonusConfig, attendanceRecords, sys]) => { setData({ employees, commissionTiers, savedRecords, commissionAvg, payrollBonusConfig, attendanceRecords, defaultPackageNoPayHandling: sys.packageNoPayDefaultHandling }); }).catch(console.error); }, [user, salaryMonth]);
  if (!user || !data) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}><p>載入中…</p></div>;
  return <Payroll employees={data.employees} commissionTiers={data.commissionTiers} savedRecords={data.savedRecords} commissionAvg={data.commissionAvg} selectedMonth={selectedMonth} payrollBonusConfig={data.payrollBonusConfig} attendanceRecords={data.attendanceRecords} defaultPackageNoPayHandling={data.defaultPackageNoPayHandling} />;
}
