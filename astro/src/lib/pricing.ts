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
    const reviewer = pricing.priceReviewRequiredBy ?? 'apanit-pueng';
    return {
      ...pricing,
      from: undefined,
      note: `ราคากำลังรอ review โดย @${reviewer} ก่อนเผยแพร่`,
    };
  }

  return pricing;
}
