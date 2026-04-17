'use client';
import { useEffect, useState } from 'react';
import Administration from '@/src/app/pages/Administration';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { fetchSystemManagementData } from '@/src/lib/system-management/queries';

function StaticUserManagementNotice() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">系統登入用戶</h2>
      <p className="mt-2 text-sm text-slate-500">帳號管理可以直接喺 Supabase Dashboard 操作：</p>
      <a
        href="https://supabase.com/dashboard/project/tudqrvisnmpschkqkzvz/auth/users"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
        打開 Supabase 用戶管理
      </a>
    </section>
  );
}

export default function AdministrationPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetchSystemManagementData().then(setData).catch(console.error); }, []);
  if (!user || !data) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}><p>載入中…</p></div>;
  const canManageUsers = user.role === 'super_admin' || user.role === 'boss' || user.role === 'hr_manager';
  return (
    <Administration canManageUsers={canManageUsers} fieldConfigs={data.fieldConfigs} payrollSettings={data.payrollSettings} positions={data.positions} banks={data.banks} companies={data.companies} branches={data.branches}>
      {canManageUsers ? <StaticUserManagementNotice /> : null}
    </Administration>
  );
}
