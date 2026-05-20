'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AttendanceManagement from '@/src/app/pages/Leaves';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { fetchAttendanceManagementOverview } from '@/src/lib/employees/queries';
export default function LeavesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [overview, setOverview] = useState<any>(null);
  const month = searchParams.get('month');
  useEffect(() => { if (user) fetchAttendanceManagementOverview(user).then(setOverview).catch(console.error); }, [user]);
  if (!user || !overview) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}><p>載入中…</p></div>;
  return <AttendanceManagement overview={overview} initialMonth={month} />;
}
