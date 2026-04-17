'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EmployeeProfile from '@/src/app/pages/EmployeeProfile';
import { useAuth } from '@/src/lib/hooks/useAuth';
import {
  fetchEmployeeDetailByCode,
  fetchEmployeeDirectoryOptions,
  fetchCommissionRateTiers,
  fetchSavedCommissionPresets,
  fetchSavedPayrollBonusPresets,
  fetchPayrollBonusConfigCatalog,
} from '@/src/lib/employees/queries';

export default function EmployeeProfileClient() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    Promise.all([
      fetchEmployeeDetailByCode(id, user),
      fetchEmployeeDirectoryOptions(user),
      fetchCommissionRateTiers(),
      fetchSavedCommissionPresets(),
      fetchSavedPayrollBonusPresets(),
      fetchPayrollBonusConfigCatalog(),
    ]).then(([employee, options, commissionTiers, savedCommissionPresets, savedPayrollBonusPresets, payrollBonusConfig]) => {
      if (!employee) { setNotFound(true); return; }
      setData({ employee, options, commissionTiers, savedCommissionPresets, savedPayrollBonusPresets, payrollBonusConfig });
    }).catch(console.error);
  }, [user, id]);

  if (notFound) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><p>找不到員工資料</p></div>;
  }

  if (!user || !data) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><p>載入中…</p></div>;
  }

  return (
    <EmployeeProfile
      employee={data.employee as any}
      options={data.options as any}
      commissionTiers={data.commissionTiers as any}
      savedCommissionPresets={data.savedCommissionPresets as any}
      savedPayrollBonusPresets={data.savedPayrollBonusPresets as any}
      payrollBonusConfig={data.payrollBonusConfig as any}
    />
  );
}
