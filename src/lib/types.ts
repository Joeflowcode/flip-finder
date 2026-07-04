export type Marketplace = "facebook" | "ebay";

export interface Listing {
  id: string;
  marketplace: Marketplace;
  title: string;
  price: number;
  currency: string;
  url: string;
  imageUrl?: string;
  location?: string;
  condition?: string;
  shippingCost?: number;
}

export interface SearchParams {
  query: string;
  maxPrice?: number;
  minPrice?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  limit?: number;
}

export interface FlipOpportunity {
  listing: Listing;
  marketPrice: number;
  marketSource: "ebay" | "facebook";
  profitEstimate: number;
  marginPercent: number;
  flipScore: number;
  comparableCount: number;
  notes: string[];
}

export interface ComparisonResult {
  query: string;
  facebookListings: Listing[];
  ebayListings: Listing[];
  opportunities: FlipOpportunity[];
  ebayStats: PriceStats;
  searchedAt: string;
  warnings: string[];
}

export interface PriceStats {
  count: number;
  min: number;
  max: number;
  median: number;
  average: number;
}

export interface ApiStatus {
  ebay: boolean;
  facebook: boolean;
  demoMode: boolean;
  deployTarget: "vercel" | "local";
  envLocation: string;
  missing: Array<{
    key: string;
    label: string;
    description: string;
    signupUrl: string;
  }>;
}
