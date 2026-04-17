import { NextResponse } from 'next/server';
import { canAccessRoute, normalizeRole } from '@/src/lib/auth/roles';
import { getCurrentUser } from '@/src/lib/auth/session';

export const MASTER_DATA_TABLES = ['positions', 'banks', 'companies', 'branches'] as const;

export type MasterDataTable = (typeof MASTER_DATA_TABLES)[number];

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function requireAdminApiAccess() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !canAccessRoute(currentUser.role, 'admin')) {
    throw new ApiError('You do not have permission to access this API.', 403);
  }

  return currentUser;
}

export function parseBoolean(value: unknown, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value === 'true';
  }

  return fallback;
}

export function parseString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function parseNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseMasterDataTable(value: unknown): MasterDataTable {
  const table = parseString(value);

  if (!MASTER_DATA_TABLES.includes(table as MasterDataTable)) {
    throw new ApiError('Invalid master data table.', 400);
  }

  return table as MasterDataTable;
}

export function normalizeApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: 'Unknown server error.' }, { status: 500 });
}

export function normalizeApiRole(value: unknown) {
  return normalizeRole(parseString(value));
}