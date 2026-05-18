create table if not exists public.ai_memories (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid(),
  module_key text not null default 'payroll',
  memory_type text not null default 'preference',
  title text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint ai_memories_module_key_check check (module_key in ('payroll', 'people', 'leaves', 'attendance', 'admin', 'dashboard', 'general')),
  constraint ai_memories_memory_type_check check (memory_type in ('preference', 'terminology', 'business_rule', 'workflow', 'note'))
);

create index if not exists ai_memories_owner_module_idx
  on public.ai_memories (owner_user_id, module_key, is_active, updated_at desc);

drop trigger if exists trg_ai_memories_updated_at on public.ai_memories;
create trigger trg_ai_memories_updated_at
before update on public.ai_memories
for each row
execute function public.set_updated_at();

alter table public.ai_memories enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_memories'
      and policyname = 'Users can read own AI memories'
  ) then
    create policy "Users can read own AI memories"
      on public.ai_memories for select
      to authenticated
      using (owner_user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_memories'
      and policyname = 'Users can create own AI memories'
  ) then
    create policy "Users can create own AI memories"
      on public.ai_memories for insert
      to authenticated
      with check (owner_user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_memories'
      and policyname = 'Users can update own AI memories'
  ) then
    create policy "Users can update own AI memories"
      on public.ai_memories for update
      to authenticated
      using (owner_user_id = auth.uid())
      with check (owner_user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_memories'
      and policyname = 'Users can delete own AI memories'
  ) then
    create policy "Users can delete own AI memories"
      on public.ai_memories for delete
      to authenticated
      using (owner_user_id = auth.uid());
  end if;
end
$$;
