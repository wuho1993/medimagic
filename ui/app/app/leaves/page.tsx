import AttendanceManagement from '@/src/app/pages/Leaves';
import { requireRouteAccess } from '@/src/lib/auth/authorize';
import { fetchAttendanceManagementOverview } from '@/src/lib/employees/queries';

export default async function LeavesPage() {
  const user = await requireRouteAccess('leaves');
  const overview = await fetchAttendanceManagementOverview(user);
  return <AttendanceManagement overview={overview} />;
}
