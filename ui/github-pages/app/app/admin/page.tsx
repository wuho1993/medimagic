'use client';
import { useEffect, useState } from 'react';
import Administration from '@/src/app/pages/Administration';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { fetchSystemManagementData } from '@/src/lib/system-management/queries';

function StaticUserManagementNotice() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">系統登入用戶</h2>
      <p className="mt-2 text-sm text-slate-500">帳號管理功能需要伺服器端部署才能使用。請使用本機開發環境或 Render 部署版本來管理用戶帳號。</p>
      <p className="mt-1 text-sm text-slate-500">其他系統設定（Payroll 設定、員工欄位、主資料）可以喺呢度正常管理。</p>
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
