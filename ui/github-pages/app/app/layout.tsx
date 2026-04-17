'use client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/src/app/components/Layout';
import { useAuth } from '@/src/lib/hooks/useAuth';
export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace('/'); }, [user, loading, router]);
  if (loading || !user) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh' }}><p>載入中…</p></div>;
  return <Layout user={user}>{children}</Layout>;
}
