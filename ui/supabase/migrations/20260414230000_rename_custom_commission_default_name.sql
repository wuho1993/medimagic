update employee_salary_profiles
set commission_custom_name = case
  when commission_custom_name = '指定佣金' then '自訂佣金'
  when commission_custom_name = '指定佣金名稱' then '自訂佣金'
  when commission_custom_name = '指定佣金名称' then '自定义佣金'
  else commission_custom_name
end
where commission_custom_name in ('指定佣金', '指定佣金名稱', '指定佣金名称');
