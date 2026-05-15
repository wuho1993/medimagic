'use client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Layout from '@/src/app/components/Layout';
import { useAuth } from '@/src/lib/hooks/useAuth';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => { if (!loading && !user) router.replace('/'); }, [user, loading, router]);
  if (loading || !user) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh' }}><p>載入中…</p></div>;
  if (pathname.startsWith('/app/attendance/focus')) return <>{children}</>;
  return <Layout user={user}>{children}</Layout>;
}
