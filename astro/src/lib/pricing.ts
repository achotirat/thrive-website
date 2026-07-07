import pricingData from '../config/pricing.json';

export type ServicePricing = {
  from?: string;
  note?: string;
  updatedAt: string;
  draft?: boolean;
  priceReviewRequiredBy?: string;
};

export function getServicePricing(slug: string): ServicePricing | undefined {
  const entry = (pricingData as Record<string, unknown>)[slug];
  if (!entry || typeof entry !== 'object') return undefined;
  const pricing = entry as ServicePricing;

  if (pricing.draft) {
    // Draft prices must never surface internal review workflow to visitors —
    // show a customer-facing "ask us" line instead (same pattern as mental-health).
    return {
      ...pricing,
      from: 'สอบถามราคา',
      note: 'สอบถามราคาและโปรโมชันปัจจุบันได้ทาง LINE ทีมงานตอบไวภายในวันเดียวกัน',
    };
  }

  return pricing;
}
