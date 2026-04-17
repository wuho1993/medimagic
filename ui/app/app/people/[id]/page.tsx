import EmployeeProfile from '@/src/app/pages/EmployeeProfile';
import { requireRouteAccess } from '@/src/lib/auth/authorize';
import {
  fetchCommissionRateTiers,
  fetchEmployeeDetailByCode,
  fetchEmployeeDirectoryOptions,
  fetchPayrollBonusConfigCatalog,
  fetchSavedCommissionPresets,
  fetchSavedPayrollBonusPresets,
} from '@/src/lib/employees/queries';
import { notFound } from 'next/navigation';

export default async function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRouteAccess('people_detail');
  const { id } = await params;
  const [employee, options, commissionTiers, savedCommissionPresets, savedPayrollBonusPresets, payrollBonusConfig] = await Promise.all([
    fetchEmployeeDetailByCode(id, user),
    fetchEmployeeDirectoryOptions(user),
    fetchCommissionRateTiers(),
    fetchSavedCommissionPresets(),
    fetchSavedPayrollBonusPresets(),
    fetchPayrollBonusConfigCatalog(),
  ]);

  if (!employee) {
    notFound();
  }

  return (
    <EmployeeProfile
      employee={employee}
      options={options}
      commissionTiers={commissionTiers}
      savedCommissionPresets={savedCommissionPresets}
      savedPayrollBonusPresets={savedPayrollBonusPresets}
      payrollBonusConfig={payrollBonusConfig}
    />
  );
}
