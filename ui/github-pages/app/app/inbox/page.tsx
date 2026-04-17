'use client';
import { useEffect, useState } from 'react';
import Inbox from '@/src/app/pages/Inbox';
import { useAuth } from '@/src/lib/hooks/useAuth';
import { fetchInboxReminders } from '@/src/lib/employees/queries';
export default function InboxPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<any>(null);
  useEffect(() => { if (user) fetchInboxReminders(user).then(setReminders).catch(console.error); }, [user]);
  if (!user || !reminders) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}><p>載入中…</p></div>;
  return <Inbox reminders={reminders} />;
}
