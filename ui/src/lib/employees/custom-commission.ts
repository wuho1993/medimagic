export const CUSTOM_COMMISSION_TYPES = ['redeem', 'sales', 'sgm'] as const;

export type CustomCommissionType = typeof CUSTOM_COMMISSION_TYPES[number];

export type CustomCommissionTier = {
  commissionType: CustomCommissionType;
  minAmount: number;
  maxAmount: number | null;
  rate: number;
};

const TYPE_ORDER: Record<CustomCommissionType, number> = {
  redeem: 0,
  sales: 1,
  sgm: 2,
};

const LEGACY_DEFAULT_NAME_MAP: Record<string, string> = {
  '指定佣金': '自訂佣金',
  '指定佣金名稱': '自訂佣金',
  '指定佣金名称': '自定义佣金',
};

export function normalizeCustomCommissionName(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return null;
  }

  return LEGACY_DEFAULT_NAME_MAP[normalized] ?? normalized;
}

export function normalizeCustomCommissionTiers(value: unknown): CustomCommissionTier[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const commissionType = (entry as { commissionType?: unknown }).commissionType as CustomCommissionType;
      if (!CUSTOM_COMMISSION_TYPES.includes(commissionType)) {
        return null;
      }

      const minAmount = Number((entry as { minAmount?: unknown }).minAmount);
      const rawMaxAmount = (entry as { maxAmount?: unknown }).maxAmount;
      const maxAmount = rawMaxAmount === null || rawMaxAmount === '' || typeof rawMaxAmount === 'undefined'
        ? null
        : Number(rawMaxAmount);
      const rate = Number((entry as { rate?: unknown }).rate);

      if (!Number.isFinite(minAmount) || !Number.isFinite(rate)) {
        return null;
      }

      if (maxAmount !== null && !Number.isFinite(maxAmount)) {
        return null;
      }

      return {
        commissionType,
        minAmount: Math.max(0, minAmount),
        maxAmount: maxAmount === null ? null : Math.max(Math.max(0, minAmount), maxAmount),
        rate: Math.max(0, rate),
      } satisfies CustomCommissionTier;
    })
    .filter((entry): entry is CustomCommissionTier => entry !== null)
    .sort((left, right) => TYPE_ORDER[left.commissionType] - TYPE_ORDER[right.commissionType] || left.minAmount - right.minAmount || (left.maxAmount ?? Number.MAX_SAFE_INTEGER) - (right.maxAmount ?? Number.MAX_SAFE_INTEGER));
}

export function createLegacyCustomCommissionTiers(
  redeemRate: number | null,
  salesRate: number | null,
  sgmRate: number | null,
): CustomCommissionTier[] {
  return normalizeCustomCommissionTiers([
    { commissionType: 'redeem', minAmount: 0, maxAmount: null, rate: redeemRate ?? 0 },
    { commissionType: 'sales', minAmount: 0, maxAmount: null, rate: salesRate ?? 0 },
    { commissionType: 'sgm', minAmount: 0, maxAmount: null, rate: sgmRate ?? 0 },
  ]);
}

function getMatchedTier(volume: number, tiers: CustomCommissionTier[], commissionType: CustomCommissionType) {
  const matches = tiers.filter((tier) => tier.commissionType === commissionType).sort((left, right) => left.minAmount - right.minAmount);
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const tier = matches[index];
    if (volume >= tier.minAmount && (tier.maxAmount === null || volume <= tier.maxAmount)) {
      return tier;
    }
  }

  return matches[0] ?? null;
}

export function calculateCustomCommissionByType(
  volume: number,
  tiers: CustomCommissionTier[],
  commissionType: CustomCommissionType,
): { amount: number; rate: number } {
  if (volume <= 0) {
    return { amount: 0, rate: 0 };
  }

  const matched = getMatchedTier(volume, tiers, commissionType);
  if (!matched) {
    return { amount: 0, rate: 0 };
  }

  return {
    amount: Math.round(volume * matched.rate * 100) / 100,
    rate: matched.rate,
  };
}

export function calculateCustomCommission(
  volumes: { redeem: number; sales: number; sgm: number },
  tiers: CustomCommissionTier[],
) {
  const normalized = normalizeCustomCommissionTiers(tiers);
  const redeem = calculateCustomCommissionByType(volumes.redeem, normalized, 'redeem');
  const sales = calculateCustomCommissionByType(volumes.sales, normalized, 'sales');
  const sgm = calculateCustomCommissionByType(volumes.sgm, normalized, 'sgm');

  return {
    redeem,
    sales,
    sgm,
    total: Math.round((redeem.amount + sales.amount + sgm.amount) * 100) / 100,
  };
}