alter table public.employee_salary_profiles
  add column if not exists commission_custom_name text,
  add column if not exists commission_custom_tiers jsonb;

alter table public.employee_salary_profiles
  drop constraint if exists employee_salary_profiles_commission_custom_name_check,
  drop constraint if exists employee_salary_profiles_commission_custom_tiers_check;

alter table public.employee_salary_profiles
  add constraint employee_salary_profiles_commission_custom_name_check
  check (
    commission_custom_name is null
    or length(btrim(commission_custom_name)) > 0
  ),
  add constraint employee_salary_profiles_commission_custom_tiers_check
  check (
    commission_custom_tiers is null
    or jsonb_typeof(commission_custom_tiers) = 'array'
  );

update public.employee_salary_profiles
set
  commission_custom_name = coalesce(nullif(btrim(commission_custom_name), ''), '指定佣金'),
  commission_custom_tiers = (
    select jsonb_agg(
      jsonb_build_object(
        'commissionType', tier.commission_type,
        'minAmount', 0,
        'maxAmount', null,
        'rate', tier.rate
      )
      order by tier.sort_order
    )
    from (
      values
        ('redeem', coalesce(commission_redeem_rate, 0::numeric), 1),
        ('sales', coalesce(commission_sales_rate, 0::numeric), 2),
        ('sgm', coalesce(commission_sgm_rate, 0::numeric), 3)
    ) as tier(commission_type, rate, sort_order)
  )
where commission_method = 'custom'
  and commission_custom_tiers is null;

comment on column public.employee_salary_profiles.commission_custom_name is 'Editable display name for custom commission scheme.';
comment on column public.employee_salary_profiles.commission_custom_tiers is 'Custom commission tiers in JSON array format: [{"commissionType":"redeem|sales|sgm","minAmount":number,"maxAmount":number|null,"rate":number}]';