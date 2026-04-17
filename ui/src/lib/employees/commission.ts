import type { CommissionRateTier } from './queries';

/**
 * Get the applicable tier for a given volume from tiered brackets.
 * Whole-volume rate — the entire volume is multiplied by the matched rate.
 */
function getTieredRate(volume: number, tiers: CommissionRateTier[]): CommissionRateTier | null {
  const sorted = [...tiers].sort((a, b) => a.minAmount - b.minAmount);
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (volume >= sorted[i].minAmount) {
      return sorted[i];
    }
  }
  return sorted[0] ?? null;
}

/** Filter tiers by type (and optional staff group) */
function filterTiers(allTiers: CommissionRateTier[], type: string, staffGroup: string = 'default'): CommissionRateTier[] {
  return allTiers
    .filter((t) => t.commissionType === type && t.staffGroup === staffGroup)
    .sort((a, b) => a.minAmount - b.minAmount);
}

/** Calculate REDEEM commission (tiered: 1% / 1.2% / 1.6% / 2%) */
export function calculateRedeemCommission(
  volume: number,
  tiers: CommissionRateTier[],
): { amount: number; rate: number } {
  const redeemTiers = filterTiers(tiers, 'redeem');
  if (redeemTiers.length === 0 || volume <= 0) return { amount: 0, rate: 0 };
  const matched = getTieredRate(volume, redeemTiers);
  if (!matched) return { amount: 0, rate: 0 };
  return { amount: Math.round(volume * matched.rate * 100) / 100, rate: matched.rate };
}

/** Calculate SALES commission (tiered: 3% / 3.2% / 3.5% / 3.8% / 4%) */
export function calculateSalesCommission(
  volume: number,
  tiers: CommissionRateTier[],
): { amount: number; rate: number } {
  const salesTiers = filterTiers(tiers, 'sales');
  if (salesTiers.length === 0 || volume <= 0) return { amount: 0, rate: 0 };
  const matched = getTieredRate(volume, salesTiers);
  if (!matched) return { amount: 0, rate: 0 };
  return { amount: Math.round(volume * matched.rate * 100) / 100, rate: matched.rate };
}

/** Calculate SGM commission (flat 5%) */
export function calculateSgmCommission(
  volume: number,
  tiers: CommissionRateTier[],
): { amount: number; rate: number } {
  const sgmTiers = filterTiers(tiers, 'sgm');
  if (sgmTiers.length === 0 || volume <= 0) return { amount: 0, rate: 0 };
  const rate = sgmTiers[0].rate;
  return { amount: Math.round(volume * rate * 100) / 100, rate };
}

export function calculateStreetPromoterCommission(headcount: number): number {
  if (headcount >= 30 && headcount <= 40) {
    return 5000;
  }

  if (headcount >= 41 && headcount <= 50) {
    return 7000;
  }

  if (headcount >= 51 && headcount <= 60) {
    return 9000;
  }

  return 0;
}

export function calculateTelesalesCommission(headcount: number): { amount: number; ratePerHead: number } {
  if (headcount <= 0) {
    return { amount: 0, ratePerHead: 0 };
  }

  const ratePerHead = headcount <= 40
    ? 40
    : headcount <= 80
      ? 50
      : 60;

  return {
    amount: headcount * ratePerHead,
    ratePerHead,
  };
}

/** Calculate total commission across redeem + sales + sgm.
 *  Job commission is NOT calculated here (no formula; from external system). */
export function calculateTotalCommission(
  volumes: { redeem: number; sales: number; sgm: number },
  tiers: CommissionRateTier[],
) {
  const redeem = calculateRedeemCommission(volumes.redeem, tiers);
  const sales = calculateSalesCommission(volumes.sales, tiers);
  const sgm = calculateSgmCommission(volumes.sgm, tiers);
  return {
    redeem,
    sales,
    sgm,
    total: Math.round((redeem.amount + sales.amount + sgm.amount) * 100) / 100,
  };
}
