export const COMMISSION_RULE_METRICS = ['redeem', 'sales', 'salesAmountTotal', 'shop', 'job', 'sgm'] as const;

export type CommissionRuleMetric = typeof COMMISSION_RULE_METRICS[number];

export type CommissionRuleType = 'rate' | 'bar';

export type CommissionRuleTier = {
  minAmount: number;
  maxAmount: number | null;
  rate: number | null;
  amount: number | null;
};

export type CommissionRule = {
  code: string;
  name: string;
  type: CommissionRuleType;
  metric: CommissionRuleMetric;
  enabled: boolean;
  stackable: boolean;
  tiers: CommissionRuleTier[];
};

export type CommissionRuleVolumes = Record<CommissionRuleMetric, number>;

export type CommissionRuleCalculationItem = {
  code: string;
  name: string;
  type: CommissionRuleType;
  metric: CommissionRuleMetric;
  volume: number;
  amount: number;
  rate: number;
};

const METRICS = new Set<CommissionRuleMetric>(COMMISSION_RULE_METRICS);
const TYPES = new Set<CommissionRuleType>(['rate', 'bar']);

function normalizeText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

export function normalizeCommissionRules(value: unknown): CommissionRule[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const raw = entry as Record<string, unknown>;
      const code = normalizeText(raw.code);
      const name = normalizeText(raw.name) ?? code;
      const metric = raw.metric as CommissionRuleMetric;
      const type = raw.type as CommissionRuleType;
      if (!code || !name || !METRICS.has(metric) || !TYPES.has(type)) return null;

      const tiers = (Array.isArray(raw.tiers) ? raw.tiers : [])
        .map((tier) => {
          if (!tier || typeof tier !== 'object') return null;
          const tierRaw = tier as Record<string, unknown>;
          const minAmount = Number(tierRaw.minAmount ?? tierRaw.minSales);
          const rawMaxAmount = tierRaw.maxAmount;
          const maxAmount = rawMaxAmount === null || rawMaxAmount === '' || typeof rawMaxAmount === 'undefined'
            ? null
            : Number(rawMaxAmount);
          const rate = tierRaw.rate === null || typeof tierRaw.rate === 'undefined' || tierRaw.rate === '' ? null : Number(tierRaw.rate);
          const amount = tierRaw.amount === null || typeof tierRaw.amount === 'undefined' || tierRaw.amount === '' ? null : Number(tierRaw.amount);
          if (!Number.isFinite(minAmount)) return null;
          if (maxAmount !== null && !Number.isFinite(maxAmount)) return null;
          if (rate !== null && !Number.isFinite(rate)) return null;
          if (amount !== null && !Number.isFinite(amount)) return null;

          return {
            minAmount: Math.max(0, minAmount),
            maxAmount: maxAmount === null ? null : Math.max(Math.max(0, minAmount), maxAmount),
            rate: rate === null ? null : Math.max(0, rate),
            amount: amount === null ? null : Math.max(0, amount),
          } satisfies CommissionRuleTier;
        })
        .filter((tier): tier is CommissionRuleTier => tier !== null)
        .filter((tier) => (type === 'rate' ? tier.rate !== null : tier.amount !== null))
        .sort((left, right) => left.minAmount - right.minAmount || (left.maxAmount ?? Number.MAX_SAFE_INTEGER) - (right.maxAmount ?? Number.MAX_SAFE_INTEGER));

      return {
        code,
        name,
        type,
        metric,
        enabled: raw.enabled !== false,
        stackable: raw.stackable === true,
        tiers,
      } satisfies CommissionRule;
    })
    .filter((entry): entry is CommissionRule => entry !== null && entry.tiers.length > 0);
}

function matchedTier(volume: number, tiers: CommissionRuleTier[]) {
  for (let index = tiers.length - 1; index >= 0; index -= 1) {
    const tier = tiers[index];
    if (volume >= tier.minAmount && (tier.maxAmount === null || volume <= tier.maxAmount)) return tier;
  }
  return null;
}

export function calculateCommissionRules(volumes: CommissionRuleVolumes, rules: CommissionRule[]) {
  const items = normalizeCommissionRules(rules)
    .filter((rule) => rule.enabled)
    .map((rule) => {
      const volume = volumes[rule.metric] ?? 0;
      if (volume <= 0) return null;
      const tier = matchedTier(volume, rule.tiers);
      if (!tier) return null;
      const rate = rule.type === 'rate' ? (tier.rate ?? 0) : 0;
      const amount = rule.type === 'rate'
        ? Math.round(volume * rate * 100) / 100
        : Math.round((tier.amount ?? 0) * 100) / 100;
      if (amount <= 0) return null;
      return { code: rule.code, name: rule.name, type: rule.type, metric: rule.metric, volume, amount, rate } satisfies CommissionRuleCalculationItem;
    })
    .filter((item): item is CommissionRuleCalculationItem => item !== null);

  const total = Math.round(items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
  return { items, total };
}

export function getCommissionRuleConflictMessages(rules: CommissionRule[]) {
  const enabled = normalizeCommissionRules(rules).filter((rule) => rule.enabled);
  const messages: string[] = [];
  const nonStackableByMetric = new Map<CommissionRuleMetric, CommissionRule[]>();
  for (const rule of enabled) {
    if (!rule.stackable) {
      nonStackableByMetric.set(rule.metric, [...(nonStackableByMetric.get(rule.metric) ?? []), rule]);
    }
  }
  for (const [metric, metricRules] of nonStackableByMetric) {
    if (metricRules.length > 1) {
      messages.push(`${metric} 有 ${metricRules.length} 個不可疊加佣金規則：${metricRules.map((rule) => rule.name).join('、')}`);
    }
  }
  return messages;
}

export function createYanLyBarCommissionRules(): CommissionRule[] {
  return normalizeCommissionRules([
    { code: 'sales_bar_commission', name: 'Sales BAR Commission', type: 'bar', metric: 'sales', enabled: true, stackable: false, tiers: [
      { minAmount: 150000, amount: 1500 }, { minAmount: 200000, amount: 2000 }, { minAmount: 250000, amount: 2500 },
      { minAmount: 300000, amount: 3000 }, { minAmount: 350000, amount: 3500 }, { minAmount: 400000, amount: 4000 },
    ] },
    { code: 'redeem_bar_commission', name: 'Redeem BAR Commission', type: 'bar', metric: 'redeem', enabled: true, stackable: false, tiers: [
      { minAmount: 105000, amount: 1500 }, { minAmount: 140000, amount: 2000 }, { minAmount: 175000, amount: 2500 },
      { minAmount: 210000, amount: 3000 }, { minAmount: 245000, amount: 3500 }, { minAmount: 280000, amount: 4000 },
    ] },
  ]);
}

export function createMoonIrisTaiWaiShopCommissionRules(): CommissionRule[] {
  return normalizeCommissionRules([
    {
      code: 'shop_rate_commission',
      name: 'Moon and Iris 大圍鋪數方案',
      type: 'rate',
      metric: 'shop',
      enabled: true,
      stackable: false,
      tiers: [
        { minAmount: 0, maxAmount: 800000, rate: 0.03 },
        { minAmount: 800000, maxAmount: 1000000, rate: 0.032 },
        { minAmount: 1000000, maxAmount: 1200000, rate: 0.034 },
        { minAmount: 1200000, maxAmount: 1400000, rate: 0.036 },
        { minAmount: 1400000, maxAmount: 1600000, rate: 0.038 },
        { minAmount: 1600000, maxAmount: null, rate: 0.04 },
      ],
    },
  ]);
}

export function serializeCommissionRules(rules: CommissionRule[]) {
  return JSON.stringify(normalizeCommissionRules(rules), null, 2);
}

export function createCommissionRulesFromLegacyCustomTiers(
  name: string | null,
  tiers: Array<{ commissionType: 'redeem' | 'sales' | 'sgm'; minAmount: number; maxAmount: number | null; rate: number }>,
): CommissionRule[] {
  const labelMap = {
    redeem: 'Redeem',
    sales: 'Sales',
    sgm: 'SGM',
  } as const;

  return normalizeCommissionRules(
    (['redeem', 'sales', 'sgm'] as const).map((metric) => {
      const metricTiers = tiers.filter((tier) => tier.commissionType === metric && tier.rate > 0);
      if (metricTiers.length === 0) return null;
      return {
        code: `${metric}_rate_commission`,
        name: `${name || 'Custom'} ${labelMap[metric]} Rate`,
        type: 'rate',
        metric,
        enabled: true,
        stackable: false,
        tiers: metricTiers.map((tier) => ({
          minAmount: tier.minAmount,
          maxAmount: tier.maxAmount,
          rate: tier.rate,
        })),
      };
    }).filter(Boolean),
  );
}
