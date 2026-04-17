import Administration from '@/src/app/pages/Administration';
import { requireRouteAccess } from '@/src/lib/auth/authorize';
import { fetchSystemManagementData } from '@/src/lib/system-management/queries';
import UserManagementPanel from './UserManagementPanel';

export default async function AdministrationPage() {
  const user = await requireRouteAccess('admin');
  const systemManagementData = await fetchSystemManagementData();
  const canManageUsers = user.role === 'super_admin' || user.role === 'boss' || user.role === 'hr_manager';

  return (
    <Administration
      canManageUsers={canManageUsers}
      fieldConfigs={systemManagementData.fieldConfigs}
      payrollSettings={systemManagementData.payrollSettings}
      positions={systemManagementData.positions}
      banks={systemManagementData.banks}
      companies={systemManagementData.companies}
      branches={systemManagementData.branches}
    >
      {canManageUsers ? <UserManagementPanel companies={systemManagementData.companies} branches={systemManagementData.branches} /> : null}
    </Administration>
  );
}
