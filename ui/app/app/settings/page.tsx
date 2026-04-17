import { redirect } from 'next/navigation';
import { requireRouteAccess } from '@/src/lib/auth/authorize';

export default async function SystemSettingsPage() {
  await requireRouteAccess('settings');
  redirect('/app/admin');
}
