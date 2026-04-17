'use client';
import { useEffect, useState } from 'react';
import People from '@/src/app/pages/People';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { fetchEmployeeDirectory, fetchEmployeeDirectoryOptions } from '@/src/lib/employees/queries';
export default function PeoplePage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  useEffect(() => { if (!user) return; Promise.all([fetchEmployeeDirectory(user), fetchEmployeeDirectoryOptions(user)]).then(([e, o]) => setData({ employees: e, ...o })).catch(console.error); }, [user]);
  if (!user || !data) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}><p>載入中…</p></div>;
  return <People employees={data.employees} positions={data.positions} banks={data.banks} companies={data.companies} branches={data.branches} />;
}
