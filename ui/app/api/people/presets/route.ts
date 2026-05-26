import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeCustomCommissionName } from '@/src/lib/employees/custom-commission';
import { normalizeCommissionRules } from '@/src/lib/employees/commission-rules';
import { normalizePayrollBonusCustomName } from '@/src/lib/employees/payroll-bonus';

function createServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase config.');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function upsertByName(table: 'saved_commission_presets' | 'saved_shop_commission_presets', name: string, payload: Record<string, unknown>) {
  const supabase = createServiceClient();
  const { data: existing, error: lookupError } = await supabase
    .from(table)
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (lookupError) throw new Error(lookupError.message);

  if (existing?.id) {
    const { data, error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', existing.id)
      .select('id')
      .maybeSingle();
    if (error || !data?.id) throw new Error(error?.message ?? 'Failed to update preset.');
    return data.id as string;
  }

  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('id')
    .maybeSingle();
  if (error || !data?.id) throw new Error(error?.message ?? 'Failed to create preset.');
  return data.id as string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { type?: unknown; name?: unknown; commissionRules?: unknown };
    const type = body.type === 'shop' ? 'shop' : body.type === 'commission' ? 'commission' : null;
    if (!type) return NextResponse.json({ error: 'Invalid preset type.' }, { status: 400 });

    const name = type === 'shop'
      ? normalizePayrollBonusCustomName(typeof body.name === 'string' ? body.name : null)
      : normalizeCustomCommissionName(typeof body.name === 'string' ? body.name : null);
    if (!name) return NextResponse.json({ error: 'Missing preset name.' }, { status: 400 });

    const rules = normalizeCommissionRules(body.commissionRules)
      .filter((rule) => type === 'shop' ? rule.metric === 'shop' : rule.metric !== 'shop');
    if (rules.length === 0) return NextResponse.json({ error: 'No rules to save.' }, { status: 400 });

    const table = type === 'shop' ? 'saved_shop_commission_presets' : 'saved_commission_presets';
    const payload = type === 'shop' ? { name, rules } : { name, tiers: rules };
    const id = await upsertByName(table, name, payload);
    return NextResponse.json({ id, name, rules });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save preset.' }, { status: 500 });
  }
}
