export const APP_ROLES = [
  'super_admin',
  'boss',
  'hr_manager',
  'department_manager',
  'employee',
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type AppRouteKey =
  | 'dashboard'
  | 'inbox'
  | 'people'
  | 'people_detail'
  | 'payroll'
  | 'attendance'
  | 'leaves'
  | 'admin'
  | 'settings'
  | 'onboarding'
  | 'offboarding';

export type NavRouteKey = Exclude<AppRouteKey, 'people_detail' | 'settings' | 'onboarding' | 'offboarding'>;

const roleAliases: Record<string, AppRole> = {
  superadmin: 'super_admin',
  'super-admin': 'super_admin',
  'super admin': 'super_admin',
  systemadmin: 'super_admin',
  'system-admin': 'super_admin',
  'system admin': 'super_admin',
  boss: 'boss',
  老闆: 'boss',
  companyadmin: 'boss',
  'company-admin': 'boss',
  'company admin': 'boss',
  company_admin: 'boss',
  hr: 'hr_manager',
  hrmanager: 'hr_manager',
  'hr-manager': 'hr_manager',
  'hr manager': 'hr_manager',
  hrdirector: 'hr_manager',
  'hr-director': 'hr_manager',
  'hr director': 'hr_manager',
  payroll: 'hr_manager',
  payrollofficer: 'hr_manager',
  'payroll-officer': 'hr_manager',
  'payroll officer': 'hr_manager',
  payroll_officer: 'hr_manager',
  departmentmanager: 'department_manager',
  'department-manager': 'department_manager',
  'department manager': 'department_manager',
  branchmanager: 'department_manager',
  'branch-manager': 'department_manager',
  'branch manager': 'department_manager',
};

const routeAccessMap: Record<AppRouteKey, readonly AppRole[]> = {
  dashboard: APP_ROLES,
  inbox: ['super_admin', 'boss', 'hr_manager', 'department_manager', 'employee'],
  people: ['super_admin', 'boss', 'hr_manager', 'department_manager'],
  people_detail: ['super_admin', 'boss', 'hr_manager', 'department_manager'],
  payroll: ['super_admin', 'boss', 'hr_manager'],
  attendance: ['super_admin', 'boss', 'hr_manager', 'department_manager', 'employee'],
  leaves: APP_ROLES,
  admin: ['super_admin', 'boss', 'hr_manager'],
  settings: ['super_admin', 'boss', 'hr_manager'],
  onboarding: ['super_admin', 'boss', 'hr_manager'],
  offboarding: ['super_admin', 'boss', 'hr_manager'],
};

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  boss: 'Boss',
  hr_manager: 'HR Manager',
  department_manager: 'Branch Manager',
  employee: 'Employee',
};

export function normalizeRole(input?: string | null): AppRole {
  if (!input) {
    return 'employee';
  }

  const normalized = input.trim().toLowerCase().replace(/[_\s]+/g, '-');

  if (APP_ROLES.includes(normalized as AppRole)) {
    return normalized as AppRole;
  }

  return roleAliases[normalized.replace(/-/g, '')] ?? roleAliases[normalized] ?? 'employee';
}

export function getRoleLabel(role: AppRole) {
  return roleLabels[role];
}

export function canAccessRoute(role: AppRole, routeKey: AppRouteKey) {
  return routeAccessMap[routeKey].includes(role);
}

export function getDefaultRouteForRole(role: AppRole) {
  const routeOrder: AppRouteKey[] = ['dashboard', 'people', 'attendance', 'leaves', 'payroll', 'admin', 'settings', 'onboarding', 'offboarding'];

  for (const route of routeOrder) {
    if (canAccessRoute(role, route)) {
      return `/app/${route}`;
    }
  }

  return '/';
}