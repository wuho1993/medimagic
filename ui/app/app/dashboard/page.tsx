'use client';
import { useEffect, useState } from 'react';
import Dashboard from '@/src/app/pages/Dashboard';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { fetchDashboardData } from '@/src/lib/employees/queries';
export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  useEffect(() => { if (!user) return; let active = true; setData(null); fetchDashboardData(user).then((nextData) => { if (active) setData(nextData); }).catch((error) => { if (active) console.error(error); }); return () => { active = false; }; }, [user]);
  if (!user || !data) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}><p>載入中…</p></div>;
  return <Dashboard data={data} userName={user.fullName} />;
}
