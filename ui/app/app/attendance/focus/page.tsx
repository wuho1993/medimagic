'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AttendanceManagement from '@/src/app/pages/Leaves';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { fetchAttendanceManagementOverview } from '@/src/lib/employees/queries';

export default function AttendanceFocusPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [overview, setOverview] = useState<any>(null);

  const month = searchParams.get('month');
  const scale = Number(searchParams.get('scale'));

  useEffect(() => {
    if (user) {
      fetchAttendanceManagementOverview(user).then(setOverview).catch(console.error);
    }
  }, [user]);

  if (!user || !overview) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p>載入中...</p>
      </div>
    );
  }

  return (
    <AttendanceManagement
      overview={overview}
      focusMode
      initialMonth={month}
      initialScale={Number.isFinite(scale) ? scale : null}
    />
  );
}
