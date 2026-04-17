do $$
begin
  if not exists (select 1 from pg_type where typname = 'employee_document_type_v2') then
    create type public.employee_document_type_v2 as enum ('certificate', 'contract');
  end if;
end
$$;

alter table public.employee_documents
  add column if not exists storage_folder text not null default '';

alter table public.employee_documents
  alter column document_type type public.employee_document_type_v2
  using (
    case
      when document_type::text = 'contract' then 'contract'
      else 'certificate'
    end
  )::public.employee_document_type_v2;

drop type if exists public.employee_document_type;
alter type public.employee_document_type_v2 rename to employee_document_type;

update public.employee_documents documents
set storage_folder = lower(concat_ws(
  '/',
  coalesce(employees.company_type::text, 'unknown-company'),
  coalesce(nullif(regexp_replace(coalesce(employees.branch_code, ''), '[^a-zA-Z0-9_-]+', '-', 'g'), ''), 'unassigned-branch'),
  coalesce(nullif(regexp_replace(coalesce(employees.employee_code, ''), '[^a-zA-Z0-9_-]+', '-', 'g'), ''), 'unknown-employee'),
  case when documents.document_type = 'contract' then 'contracts' else 'certificates' end
))
from public.employees
where employees.id = documents.employee_id;

create index if not exists employee_documents_expiry_date_idx on public.employee_documents (expiry_date);
create index if not exists employee_documents_document_type_idx on public.employee_documents (document_type);