import Payroll from '@/src/app/pages/Payroll';
import { requireRouteAccess } from '@/src/lib/auth/authorize';
import { fetchPayrollSummary, fetchCommissionRateTiers, fetchMonthlyCommissionRecords, fetchCommissionAverage365, fetchPayrollBonusConfigCatalog, fetchPayrollAttendanceRecords } from '@/src/lib/employees/queries';
import { fetchPayrollSystemSettings } from '@/src/lib/system-management/queries';

export default async function PayrollPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string }>;
}) {
  const user = await requireRouteAccess('payroll');
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedMonth = resolvedSearchParams?.month;
  const selectedMonth = requestedMonth && /^\d{4}-\d{2}$/.test(requestedMonth) ? requestedMonth : currentMonth;
  const [employees, commissionTiers, savedRecords, commissionAvg, payrollBonusConfig, attendanceRecords, payrollSystemSettings] = await Promise.all([
    fetchPayrollSummary(user),
    fetchCommissionRateTiers(),
    fetchMonthlyCommissionRecords(selectedMonth),
    fetchCommissionAverage365(),
    fetchPayrollBonusConfigCatalog(),
    fetchPayrollAttendanceRecords(user, selectedMonth),
    fetchPayrollSystemSettings(),
  ]);
  return <Payroll employees={employees} commissionTiers={commissionTiers} savedRecords={savedRecords} commissionAvg={commissionAvg} selectedMonth={selectedMonth} payrollBonusConfig={payrollBonusConfig} attendanceRecords={attendanceRecords} defaultPackageNoPayHandling={payrollSystemSettings.packageNoPayDefaultHandling} />;
}
