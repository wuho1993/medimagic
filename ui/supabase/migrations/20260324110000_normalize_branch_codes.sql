do $$
declare
  branches_code_constraint text;
begin
  select con.conname
  into branches_code_constraint
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'branches'
    and con.contype = 'u'
    and pg_get_constraintdef(con.oid) = 'UNIQUE (code)';

  if branches_code_constraint is not null then
    execute format('alter table public.branches drop constraint %I', branches_code_constraint);
  end if;
end
$$;

create unique index if not exists branches_company_id_code_uidx
  on public.branches (company_id, code);

update public.branches
set code = regexp_replace(code, '^(ASA|ASAS)-', '')
where code ~ '^(ASA|ASAS)-';

update public.employees
set branch_code = regexp_replace(branch_code, '^(ASA|ASAS)-', '')
where branch_code ~ '^(ASA|ASAS)-';

update public.branches
set code = 'HQ'
where code in ('ASA-HQ', 'ASAS-HQ');

update public.employees
set branch_code = 'HQ'
where branch_code in ('ASA-HQ', 'ASAS-HQ');