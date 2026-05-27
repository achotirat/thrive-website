import pricingData from '../config/pricing.json';

export type ServicePricing = {
  from: string;
  note: string;
  updatedAt: string;
  draft?: boolean;
};

export function getServicePricing(slug: string): ServicePricing | undefined {
  const entry = (pricingData as Record<string, unknown>)[slug];
  if (!entry || typeof entry !== 'object') return undefined;
  return entry as ServicePricing;
}
