import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Layout from '@/src/app/components/Layout';
import { getCurrentUser } from '@/src/lib/auth/session';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  return <Layout user={user}>{children}</Layout>;
}
