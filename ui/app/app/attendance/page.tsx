'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AttendanceManagement from '@/src/app/pages/Leaves';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { fetchAttendanceManagementOverview } from '@/src/lib/employees/queries';
export default function AttendancePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [overview, setOverview] = useState<any>(null);
  const month = searchParams.get('month');
  useEffect(() => { if (!user) return; let active = true; setOverview(null); fetchAttendanceManagementOverview(user).then((nextOverview) => { if (active) setOverview(nextOverview); }).catch((error) => { if (active) console.error(error); }); return () => { active = false; }; }, [user]);
  if (!user || !overview) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}><p>載入中…</p></div>;
  return <AttendanceManagement overview={overview} initialMonth={month} />;
}
