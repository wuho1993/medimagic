export const EMPLOYEE_EMPLOYMENT_TYPES = ['全職', '兼職', '自僱人士'] as const;

export type EmployeeEmploymentType = (typeof EMPLOYEE_EMPLOYMENT_TYPES)[number];

type DateParts = {
  year: number;
  monthIndex: number;
  day: number;
};

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function parseIsoDate(value: string | null | undefined): DateParts | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || !Number.isInteger(day)) {
    return null;
  }

  return { year, monthIndex, day };
}

function toUtcDate(parts: DateParts) {
  return new Date(Date.UTC(parts.year, parts.monthIndex, parts.day));
}

function normalizeReferenceDate(referenceDate: Date) {
  return new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate()));
}

function parseProbationMonths(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.max(0, Math.trunc(parsed));
}

export function calculateProbationEndDate(hireDate: string | null | undefined, probationMonths: number | string | null | undefined) {
  const months = parseProbationMonths(probationMonths);
  if (!hireDate || months === null) {
    return null;
  }

  const parts = parseIsoDate(hireDate);
  if (!parts) {
    return null;
  }

  const { year, monthIndex, day } = parts;
  const targetMonthIndex = monthIndex + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonthIndex = ((targetMonthIndex % 12) + 12) % 12;
  const targetDay = Math.min(day, getDaysInMonth(targetYear, normalizedMonthIndex));

  return `${targetYear.toString().padStart(4, '0')}-${(normalizedMonthIndex + 1).toString().padStart(2, '0')}-${targetDay.toString().padStart(2, '0')}`;
}

export function calculateAge(dateOfBirth: string | null | undefined, referenceDate: Date = new Date()) {
  const birth = parseIsoDate(dateOfBirth);
  if (!birth) {
    return null;
  }

  const refYear = referenceDate.getUTCFullYear();
  const refMonthIndex = referenceDate.getUTCMonth();
  const refDay = referenceDate.getUTCDate();

  let age = refYear - birth.year;
  if (refMonthIndex < birth.monthIndex || (refMonthIndex === birth.monthIndex && refDay < birth.day)) {
    age -= 1;
  }

  return age;
}

export function calculateDaysEmployed(hireDate: string | null | undefined, referenceDate: Date = new Date()) {
  const hire = parseIsoDate(hireDate);
  if (!hire) {
    return null;
  }

  const startDate = toUtcDate(hire);
  const endDate = normalizeReferenceDate(referenceDate);
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.floor(diffMs / 86400000);
}

export function getMonthEndDate(yearMonth: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (!Number.isInteger(year) || !Number.isInteger(monthIndex)) {
    return null;
  }

  return new Date(Date.UTC(year, monthIndex + 1, 0));
}

export function isMpfContributionEligible(
  mpfEnabled: boolean,
  dateOfBirth: string | null | undefined,
  hireDate: string | null | undefined,
  referenceDate: Date = new Date()
) {
  if (!mpfEnabled) {
    return false;
  }

  const age = calculateAge(dateOfBirth, referenceDate);
  if (age !== null && age > 65) {
    return false;
  }

  const employedDays = calculateDaysEmployed(hireDate, referenceDate);
  if (employedDays !== null && employedDays < 60) {
    return false;
  }

  return true;
}