create table if not exists public.system_field_configs (
  id uuid primary key default gen_random_uuid(),
  module_key text not null,
  field_key text not null,
  label_zh text not null,
  label_en text not null default '',
  group_key text not null default '',
  input_type text not null default 'text',
  is_active boolean not null default true,
  is_required boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (module_key, field_key)
);

alter table public.system_field_configs enable row level security;

drop policy if exists "Authenticated users can read system field configs" on public.system_field_configs;
create policy "Authenticated users can read system field configs"
on public.system_field_configs
for select
to authenticated
using (true);

drop trigger if exists set_system_field_configs_updated_at on public.system_field_configs;
create trigger set_system_field_configs_updated_at
before update on public.system_field_configs
for each row
execute function public.set_updated_at();

insert into public.system_field_configs (module_key, field_key, label_zh, label_en, group_key, input_type, is_active, is_required, sort_order)
values
  ('employee', 'employeeCode', '員工號碼', 'Employee Code', 'identity', 'text', true, true, 10),
  ('employee', 'companyType', '公司類型', 'Company Type', 'identity', 'select', true, true, 20),
  ('employee', 'nameZh', '中文姓名', 'Chinese Name', 'personal', 'text', true, true, 30),
  ('employee', 'nameEn', '英文姓名', 'English Name', 'personal', 'text', true, true, 40),
  ('employee', 'alias', '別名', 'Alias', 'personal', 'text', true, false, 50),
  ('employee', 'gender', '性別', 'Gender', 'personal', 'select', true, true, 60),
  ('employee', 'identityNumber', '身份證號碼', 'ID Number', 'personal', 'text', true, true, 70),
  ('employee', 'dateOfBirth', '出生日期', 'Date of Birth', 'personal', 'date', true, false, 80),
  ('employee', 'phone', '電話', 'Phone', 'personal', 'text', true, false, 90),
  ('employee', 'address', '地址', 'Address', 'personal', 'textarea', true, false, 100),
  ('employee', 'position', '職位', 'Position', 'employment', 'select', true, false, 110),
  ('employee', 'hireDate', '入職日期', 'Hire Date', 'employment', 'date', true, true, 120),
  ('employee', 'employmentType', '聘用類型', 'Employment Type', 'employment', 'select', true, true, 130),
  ('employee', 'status', '員工狀態', 'Status', 'employment', 'select', true, true, 140),
  ('employee', 'annualLeaveDays', '大假天數', 'Annual Leave Days', 'employment', 'number', true, false, 150),
  ('employee', 'probationMonths', '試用期(月)', 'Probation (Months)', 'employment', 'number', true, false, 160),
  ('employee', 'bank', '銀行', 'Bank', 'payroll', 'select', true, false, 170),
  ('employee', 'bankAccountNumber', '銀行戶口', 'Bank Account Number', 'payroll', 'text', true, false, 180),
  ('employee', 'paymentMethod', '出糧方法', 'Payment Method', 'payroll', 'select', true, false, 190)
on conflict (module_key, field_key) do update set
  label_zh = excluded.label_zh,
  label_en = excluded.label_en,
  group_key = excluded.group_key,
  input_type = excluded.input_type,
  is_active = excluded.is_active,
  is_required = excluded.is_required,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());