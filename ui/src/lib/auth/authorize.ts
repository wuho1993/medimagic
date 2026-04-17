import 'server-only';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/session';
import { canAccessRoute, getDefaultRouteForRole, type AppRouteKey } from './roles';

export async function requireRouteAccess(routeKey: AppRouteKey) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  if (!canAccessRoute(user.role, routeKey)) {
    redirect(getDefaultRouteForRole(user.role));
  }

  return user;
}