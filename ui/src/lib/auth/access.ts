import type { AppRole } from './roles';

export type UserAccessScope = {
  allCompanies: boolean;
  allBranches: boolean;
  companyIds: string[];
  branchIds: string[];
};

export const DEFAULT_ACCESS_SCOPE: UserAccessScope = {
  allCompanies: true,
  allBranches: true,
  companyIds: [],
  branchIds: [],
};

function normalizeUuidList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
}

export function normalizeAccessScope(input: unknown, _role?: AppRole): UserAccessScope {
  if (!input || typeof input !== 'object') {
    return DEFAULT_ACCESS_SCOPE;
  }

  const scope = input as {
    all_companies?: boolean;
    allCompanies?: boolean;
    all_branches?: boolean;
    allBranches?: boolean;
    company_ids?: unknown;
    companyIds?: unknown;
    branch_ids?: unknown;
    branchIds?: unknown;
  };

  return {
    allCompanies: scope.all_companies ?? scope.allCompanies ?? true,
    allBranches: scope.all_branches ?? scope.allBranches ?? true,
    companyIds: normalizeUuidList(scope.company_ids ?? scope.companyIds),
    branchIds: normalizeUuidList(scope.branch_ids ?? scope.branchIds),
  };
}

export function serializeAccessScope(scope: UserAccessScope) {
  return {
    all_companies: scope.allCompanies,
    all_branches: scope.allBranches,
    company_ids: scope.companyIds,
    branch_ids: scope.branchIds,
  };
}

export function buildAccessScopeFromFormData(formData: FormData): UserAccessScope {
  const companyIds = formData
    .getAll('companyIds')
    .map((value) => String(value).trim())
    .filter(Boolean);
  const branchIds = formData
    .getAll('branchIds')
    .map((value) => String(value).trim())
    .filter(Boolean);
  const allCompanies = formData.get('allCompanies') === 'true';
  const allBranches = formData.get('allBranches') === 'true';

  if (!allCompanies && !allBranches && companyIds.length === 0 && branchIds.length === 0) {
    throw new Error('Please select at least one company or branch for scoped access.');
  }

  return {
    allCompanies,
    allBranches,
    companyIds,
    branchIds,
  };
}

export function hasCompanyAccess(scope: UserAccessScope, companyId: string | null | undefined) {
  if (!companyId) {
    return scope.allCompanies;
  }

  return scope.allCompanies || scope.companyIds.includes(companyId);
}

export function hasBranchAccess(scope: UserAccessScope, branchId: string | null | undefined) {
  if (!branchId) {
    return scope.allBranches;
  }

  return scope.allBranches || scope.branchIds.includes(branchId);
}

export function describeAccessScope(scope: UserAccessScope) {
  if (scope.allCompanies && scope.allBranches) {
    return '全部公司及分店';
  }

  const companyText = scope.allCompanies ? '全部公司' : `${scope.companyIds.length} 間公司`;
  const branchText = scope.allBranches ? '全部分店' : `${scope.branchIds.length} 間分店`;
  return `${companyText} / ${branchText}`;
}