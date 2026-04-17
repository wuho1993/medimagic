export type PayrollBonusScheme = 'bonus_1' | 'bonus_2' | 'custom';

export type PresetPayrollBonusScheme = Exclude<PayrollBonusScheme, 'custom'>;

export type PayrollBonusTier = {
  minSales: number;
  amount: number;
};

export type ShopBonusScheme = 'standard' | 'custom';

export type ShopBonusTier = {
  minPercent: number;
  amount: number;
};

export type StandardPayrollBonusSchemes = Record<PresetPayrollBonusScheme, PayrollBonusTier[]>;

export type PayrollBonusConfigCatalog = {
  payrollBonusSchemes: StandardPayrollBonusSchemes;
  shopBonusStandardTiers: ShopBonusTier[];
};

export const LEGACY_PAYROLL_BONUS_SCHEMES: StandardPayrollBonusSchemes = {
  bonus_1: [
    { minSales: 280000, amount: 1000 },
    { minSales: 350000, amount: 2000 },
    { minSales: 430000, amount: 3000 },
  ],
  bonus_2: [
    { minSales: 280000, amount: 500 },
    { minSales: 380000, amount: 800 },
    { minSales: 480000, amount: 1200 },
    { minSales: 580000, amount: 1500 },
    { minSales: 680000, amount: 2000 },
    { minSales: 780000, amount: 2500 },
  ],
};

export const LEGACY_SHOP_BONUS_STANDARD_TIERS: ShopBonusTier[] = [
  { minPercent: 70, amount: 500 },
  { minPercent: 80, amount: 800 },
  { minPercent: 90, amount: 1200 },
  { minPercent: 100, amount: 1500 },
  { minPercent: 110, amount: 2000 },
  { minPercent: 120, amount: 2500 },
];

export function createLegacyPayrollBonusConfigCatalog(): PayrollBonusConfigCatalog {
  return {
    payrollBonusSchemes: {
      bonus_1: LEGACY_PAYROLL_BONUS_SCHEMES.bonus_1.map((tier) => ({ ...tier })),
      bonus_2: LEGACY_PAYROLL_BONUS_SCHEMES.bonus_2.map((tier) => ({ ...tier })),
    },
    shopBonusStandardTiers: LEGACY_SHOP_BONUS_STANDARD_TIERS.map((tier) => ({ ...tier })),
  };
}

export function normalizePayrollBonusCustomName(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function normalizePayrollBonusTiers(value: unknown): PayrollBonusTier[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const minSales = Number((entry as { minSales?: unknown }).minSales);
      const amount = Number((entry as { amount?: unknown }).amount);
      if (!Number.isFinite(minSales) || !Number.isFinite(amount)) {
        return null;
      }

      return {
        minSales: Math.max(0, minSales),
        amount: Math.max(0, amount),
      };
    })
    .filter((entry): entry is PayrollBonusTier => entry !== null)
    .sort((left, right) => left.minSales - right.minSales || left.amount - right.amount);
}

export function normalizeShopBonusTiers(value: unknown): ShopBonusTier[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const minPercent = Number((entry as { minPercent?: unknown }).minPercent);
      const amount = Number((entry as { amount?: unknown }).amount);
      if (!Number.isFinite(minPercent) || !Number.isFinite(amount)) {
        return null;
      }

      return {
        minPercent: Math.max(0, minPercent),
        amount: Math.max(0, amount),
      };
    })
    .filter((entry): entry is ShopBonusTier => entry !== null)
    .sort((left, right) => left.minPercent - right.minPercent || left.amount - right.amount);
}

export function calculatePayrollBonusFromTiers(salesVolume: number, tiers: PayrollBonusTier[]): number {
  if (salesVolume <= 0 || tiers.length === 0) {
    return 0;
  }

  let amount = 0;
  for (const tier of tiers) {
    if (salesVolume >= tier.minSales) {
      amount = tier.amount;
    }
  }

  return amount;
}

export function calculateShopBonusFromTiers(targetPercent: number, tiers: ShopBonusTier[]): number {
  if (targetPercent <= 0 || tiers.length === 0) {
    return 0;
  }

  let amount = 0;
  for (const tier of tiers) {
    if (targetPercent >= tier.minPercent) {
      amount = tier.amount;
    }
  }

  return amount;
}

export function getPayrollBonusTiers(
  scheme: PayrollBonusScheme | null,
  customTiers: PayrollBonusTier[] = [],
  standardSchemes: StandardPayrollBonusSchemes = LEGACY_PAYROLL_BONUS_SCHEMES,
): PayrollBonusTier[] {
  if (!scheme) {
    return [];
  }

  if (scheme === 'custom') {
    return normalizePayrollBonusTiers(customTiers);
  }

  return standardSchemes[scheme] ?? [];
}

export function getShopBonusTiers(
  scheme: ShopBonusScheme | null,
  customTiers: ShopBonusTier[] = [],
  standardTiers: ShopBonusTier[] = LEGACY_SHOP_BONUS_STANDARD_TIERS,
): ShopBonusTier[] {
  if (!scheme) {
    return [];
  }

  if (scheme === 'custom') {
    return normalizeShopBonusTiers(customTiers);
  }

  return normalizeShopBonusTiers(standardTiers);
}

export function calculatePayrollBonus(
  salesVolume: number,
  enabled: boolean,
  scheme: PayrollBonusScheme | null,
  customTiers: PayrollBonusTier[] = [],
  standardSchemes: StandardPayrollBonusSchemes = LEGACY_PAYROLL_BONUS_SCHEMES,
): number {
  if (!enabled || !scheme || salesVolume <= 0) {
    return 0;
  }

  return calculatePayrollBonusFromTiers(salesVolume, getPayrollBonusTiers(scheme, customTiers, standardSchemes));
}

export function calculateShopTargetPercent(targetAmount: number, actualSalesAmount: number): number {
  if (targetAmount <= 0 || actualSalesAmount <= 0) {
    return 0;
  }

  return Math.round((actualSalesAmount / targetAmount) * 10000) / 100;
}

export function calculateShopBonus(
  targetPercent: number,
  enabled: boolean,
  scheme: ShopBonusScheme | null,
  customTiers: ShopBonusTier[] = [],
  standardTiers: ShopBonusTier[] = LEGACY_SHOP_BONUS_STANDARD_TIERS,
): number {
  if (!enabled || !scheme || targetPercent <= 0) {
    return 0;
  }

  return calculateShopBonusFromTiers(targetPercent, getShopBonusTiers(scheme, customTiers, standardTiers));
}