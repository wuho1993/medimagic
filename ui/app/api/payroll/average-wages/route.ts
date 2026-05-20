import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/src/lib/auth/session';
import { canAccessRoute } from '@/src/lib/auth/roles';
import { fetchCommissionAverageAuditRecords } from '@/src/lib/employees/queries';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canAccessRoute(user.role, 'payroll')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') ?? '';
  const selectedMonth = /^\d{4}-\d{2}$/.test(month)
    ? month
    : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const records = await fetchCommissionAverageAuditRecords(user, selectedMonth);
  return NextResponse.json({ records });
}
