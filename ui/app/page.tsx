import { redirect } from 'next/navigation';
import Login from '@/src/app/pages/Login';
import { getDefaultRouteForRole } from '@/src/lib/auth/roles';
import { getCurrentUser } from '@/src/lib/auth/session';

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getDefaultRouteForRole(user.role));
  }

  return <Login />;
}
