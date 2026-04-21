'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from '@/src/app/pages/Login';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { getDefaultRouteForRole } from '@/src/lib/auth/roles';
export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && user) router.replace(getDefaultRouteForRole(user.role)); }, [user, loading, router]);
  if (loading || user) return null;
  return <Login />;
}
