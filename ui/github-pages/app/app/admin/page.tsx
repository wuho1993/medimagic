'use client';
import { useEffect, useState } from 'react';
import Administration from '@/src/app/pages/Administration';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { fetchSystemManagementData } from '@/src/lib/system-management/queries';
export default function AdministrationPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetchSystemManagementData().then(setData).catch(console.error); }, []);
  if (!user || !data) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}><p>載入中…</p></div>;
  const canManageUsers = user.role === 'super_admin' || user.role === 'boss' || user.role === 'hr_manager';
  return <Administration canManageUsers={canManageUsers} fieldConfigs={data.fieldConfigs} payrollSettings={data.payrollSettings} positions={data.positions} banks={data.banks} companies={data.companies} branches={data.branches}>{null}</Administration>;
}
