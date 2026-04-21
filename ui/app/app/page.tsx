'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { getDefaultRouteForRole } from '@/src/lib/auth/roles';
export default function AppIndexPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading) { if (!user) router.replace('/'); else router.replace(getDefaultRouteForRole(user.role)); } }, [user, loading, router]);
  return null;
}
