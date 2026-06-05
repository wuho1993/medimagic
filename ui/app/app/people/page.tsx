'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import People from '@/src/app/pages/People';
import EmployeeProfile from '@/src/app/pages/EmployeeProfile';
import { useAuth } from '@/src/lib/hooks/useAuth';
import {
  fetchEmployeeDirectory,
  fetchEmployeeDirectoryOptions,
  fetchEmployeeIr56bExportRecords,
  fetchEmployeeDetailByCode,
  fetchCommissionRateTiers,
  fetchSavedCommissionPresets,
  fetchSavedPayrollBonusPresets,
  fetchSavedShopCommissionPresets,
  fetchPayrollBonusConfigCatalog,
} from '@/src/lib/employees/queries';

export default function PeoplePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const employeeId = searchParams?.get('id') ?? null;
  const today = new Date();
  const defaultIr56bAssessmentYear = today.getMonth() + 1 >= 4 ? today.getFullYear() + 1 : today.getFullYear();
  const [ir56bAssessmentYear, setIr56bAssessmentYear] = useState(defaultIr56bAssessmentYear);
  const [listData, setListData] = useState<any>(null);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Load employee list
  useEffect(() => {
    if (!user || employeeId) return;
    let cancelled = false;
    setListData(null);
    Promise.all([fetchEmployeeDirectory(user), fetchEmployeeDirectoryOptions(user), fetchEmployeeIr56bExportRecords(user, ir56bAssessmentYear)])
      .then(([e, o, ir56bExportRecords]) => { if (!cancelled) setListData({ employees: e, ir56bExportRecords, ...o }); })
      .catch((error) => { if (!cancelled) console.error(error); });
    return () => { cancelled = true; };
  }, [user, employeeId, ir56bAssessmentYear]);

  // Load single employee profile when ?id= is present
  useEffect(() => {
    if (!user || !employeeId) return;
    let cancelled = false;
    setProfileData(null);
    setNotFound(false);
    setListData(null);
    Promise.all([
      fetchEmployeeDetailByCode(employeeId, user),
      fetchEmployeeDirectoryOptions(user),
      fetchCommissionRateTiers(),
      fetchSavedCommissionPresets(),
      fetchSavedPayrollBonusPresets(),
      fetchSavedShopCommissionPresets(),
      fetchPayrollBonusConfigCatalog(),
    ]).then(([employee, options, commissionTiers, savedCommissionPresets, savedPayrollBonusPresets, savedShopCommissionPresets, payrollBonusConfig]) => {
      if (cancelled) return;
      if (!employee) { setNotFound(true); return; }
      setProfileData({ employee, options, commissionTiers, savedCommissionPresets, savedPayrollBonusPresets, savedShopCommissionPresets, payrollBonusConfig });
    }).catch(console.error);
    return () => { cancelled = true; };
  }, [user, employeeId]);

  if (!user) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}><p>載入中…</p></div>;

  // Employee profile view
  if (employeeId) {
    if (notFound) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}><p>找不到員工資料</p></div>;
    if (!profileData) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}><p>載入中…</p></div>;
    return (
      <EmployeeProfile
        employee={profileData.employee as any}
        options={profileData.options as any}
        commissionTiers={profileData.commissionTiers as any}
        savedCommissionPresets={profileData.savedCommissionPresets as any}
        savedPayrollBonusPresets={profileData.savedPayrollBonusPresets as any}
        savedShopCommissionPresets={profileData.savedShopCommissionPresets as any}
        payrollBonusConfig={profileData.payrollBonusConfig as any}
      />
    );
  }

  // Employee list view
  if (!listData) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}><p>載入中…</p></div>;
  return <People employees={listData.employees} ir56bExportRecords={listData.ir56bExportRecords} ir56bAssessmentYear={ir56bAssessmentYear} onIr56bAssessmentYearChange={setIr56bAssessmentYear} positions={listData.positions} banks={listData.banks} companies={listData.companies} branches={listData.branches} />;
}
