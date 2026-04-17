import Inbox from '@/src/app/pages/Inbox';
import { requireRouteAccess } from '@/src/lib/auth/authorize';
import { fetchInboxReminders } from '@/src/lib/employees/queries';

export default async function InboxPage() {
  const user = await requireRouteAccess('inbox');
  const reminders = await fetchInboxReminders(user);
  return <Inbox reminders={reminders} />;
}
