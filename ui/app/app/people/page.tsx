import People from '@/src/app/pages/People';
import { requireRouteAccess } from '@/src/lib/auth/authorize';
import { fetchEmployeeDirectory, fetchEmployeeDirectoryOptions } from '@/src/lib/employees/queries';

export default async function PeoplePage() {
  const user = await requireRouteAccess('people');
  const [employees, options] = await Promise.all([fetchEmployeeDirectory(user), fetchEmployeeDirectoryOptions(user)]);

  return (
    <People
      employees={employees}
      positions={options.positions}
      banks={options.banks}
      companies={options.companies}
      branches={options.branches}
    />
  );
}
