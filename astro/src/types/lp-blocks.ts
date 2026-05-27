export type LPSymptomChecklist = {
  title: string;
  intro?: string;
  items: string[];
  cta?: { label: string; href: string };
};

export type LPEpiphanyStory = {
  label?: string;
  title: string;
  body: string;
  quote?: string;
  attribution?: string;
  image?: string;
  imageAlt?: string;
};

export type LPOfferStack = {
  title: string;
  intro?: string;
  items: { icon?: string; title: string; description: string }[];
  priceFrom?: string;
  priceNote?: string;
  cta?: { label: string; href: string };
};

export type LPRiskReversal = {
  title?: string;
  intro?: string;
  guarantees: { icon?: string; title: string; description: string }[];
};

export type LPBlocks = {
  symptomChecklist?: LPSymptomChecklist;
  epiphanyStory?: LPEpiphanyStory;
  offerStack?: LPOfferStack;
  riskReversal?: LPRiskReversal;
};
