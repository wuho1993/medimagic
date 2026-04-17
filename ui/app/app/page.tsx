import { redirect } from 'next/navigation';
import { getDefaultRouteForRole } from '@/src/lib/auth/roles';
import { getCurrentUser } from '@/src/lib/auth/session';

export default async function AppIndexPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  redirect(getDefaultRouteForRole(user.role));
}
