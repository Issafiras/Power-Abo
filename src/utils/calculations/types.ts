export interface Plan {
  id: string;
  provider: string;
  name: string;
  data: string;
  price: number;
  earnings?: number;
  earningsAdditional?: number;
  features: string[];
  familyDiscount?: boolean;
  color?: string;
  logo?: string;
  streaming?: string[];
  business?: boolean;
  priceVatExcluded?: boolean;
  mostPopular?: boolean;
  introPrice?: number;
  introMonths?: number;
  originalPrice?: number;
  campaignPrice?: number;
  campaignExpiresAt?: string;
  campaign?: boolean;
  cbbMixAvailable?: boolean;
  cbbMixPricing?: { [key: number]: number };
  expiresAt?: string;
  availableFrom?: string;
  type?: string;
  streamingCount?: number;
}

export interface CartItem {
  plan: Plan;
  quantity: number;
  cbbMixEnabled?: boolean;
  cbbMixCount?: number;
  // Add other properties if CartItem has them, e.g. from local storage
}

export interface CustomerTotal {
    monthly: number;
    sixMonth: number;
}

export interface OurOfferTotal {
    monthly: number;
    sixMonth: number;
    telenorDiscount: number;
}

export interface StreamingService {
  id: string;
  name: string;
  price: number;
  coveredValue?: number;
  logo?: string;
  logoText?: string;
  color?: string;
  bgColor?: string;
  category?: string;
  cbbMixExcluded?: boolean;
  cbbMixOnly?: boolean;
  cbbMixVariant?: boolean;
}

export interface CoverageResult {
  included: string[];
  notIncluded: string[];
}

export interface CBBMixCoverageResult extends CoverageResult {
  cbbMixSlots: number;
}
