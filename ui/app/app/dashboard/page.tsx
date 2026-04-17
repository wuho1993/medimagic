import Dashboard from '@/src/app/pages/Dashboard';
import { requireRouteAccess } from '@/src/lib/auth/authorize';
import { fetchDashboardData } from '@/src/lib/employees/queries';

export default async function DashboardPage() {
  const user = await requireRouteAccess('people');
  const data = await fetchDashboardData(user);
  return <Dashboard data={data} userName={user.fullName} />;
}
