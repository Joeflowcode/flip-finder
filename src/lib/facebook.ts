import type { Listing, SearchParams } from "./types";
import {
  resolveFacebookListingUrl,
} from "./facebook-url";

const APIFY_BASE = "https://api.apify.com/v2";

function isConfigured(): boolean {
  return Boolean(process.env.APIFY_TOKEN);
}

export function buildMarketplaceSearchUrl(
  query: string,
  location?: string,
  maxPrice?: number,
): string {
  const slug = (location ?? "portland").toLowerCase().replace(/\s+/g, "-");
  const params = new URLSearchParams({ query });
  if (maxPrice !== undefined) {
    params.set("maxPrice", String(maxPrice));
  }
  return `https://www.facebook.com/marketplace/${slug}/search?${params}`;
}

interface ApifyListing {
  id?: string | number;
  listingId?: string | number;
  title?: string;
  name?: string;
  price?: number | string;
  priceText?: string;
  url?: string;
  listingUrl?: string;
  link?: string;
  itemUrl?: string;
  facebookUrl?: string;
  imageUrl?: string;
  primaryPhoto?: { image?: { uri?: string } };
  location?: string;
  locationText?: string;
}

function parsePrice(value: number | string | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const digits = String(value).replace(/[^0-9.]/g, "");
  return Number(digits) || 0;
}

function normalizeApifyListing(
  item: ApifyListing,
  fallbackSearchUrl: string,
): Listing {
  const id = String(item.listingId ?? item.id ?? crypto.randomUUID());
  const title = item.title ?? item.name ?? "Untitled listing";
  const url = resolveFacebookListingUrl({
    listingUrl: item.listingUrl,
    link: item.link,
    itemUrl: item.itemUrl,
    url: item.url,
    listingId: item.listingId,
    id: item.id,
    fallbackSearchUrl,
  });

  return {
    id,
    marketplace: "facebook",
    title,
    price: parsePrice(item.price ?? item.priceText),
    currency: "USD",
    url,
    imageUrl:
      item.imageUrl ?? item.primaryPhoto?.image?.uri ?? undefined,
    location: item.location ?? item.locationText,
  };
}

async function runApifyActor(
  actorId: string,
  input: Record<string, unknown>,
): Promise<ApifyListing[]> {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new Error("Apify token is not configured");
  }

  const runResponse = await fetch(
    `${APIFY_BASE}/acts/${actorId}/runs?token=${token}&waitForFinish=120`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );

  if (!runResponse.ok) {
    const body = await runResponse.text();
    throw new Error(`Apify run failed (${runResponse.status}): ${body}`);
  }

  const run = (await runResponse.json()) as {
    data: { defaultDatasetId: string };
  };

  const datasetResponse = await fetch(
    `${APIFY_BASE}/datasets/${run.data.defaultDatasetId}/items?token=${token}`,
  );

  if (!datasetResponse.ok) {
    const body = await datasetResponse.text();
    throw new Error(`Apify dataset fetch failed: ${body}`);
  }

  return (await datasetResponse.json()) as ApifyListing[];
}

export async function searchFacebook(
  params: SearchParams,
): Promise<Listing[]> {
  const actorId =
    process.env.APIFY_FACEBOOK_ACTOR ?? "dtrungtin~facebook-marketplace-search";

  const searchUrl = buildMarketplaceSearchUrl(
    params.query,
    params.location,
    params.maxPrice,
  );

  const items = await runApifyActor(actorId, {
    startUrls: [{ url: searchUrl }],
    maxItems: params.limit ?? 24,
    ...(params.maxPrice !== undefined && { maxPrice: params.maxPrice }),
    ...(params.minPrice !== undefined && { minPrice: params.minPrice }),
  });

  return items
    .map((item) => normalizeApifyListing(item, searchUrl))
    .filter((item) => item.price > 0);
}

export function facebookConfigured(): boolean {
  return isConfigured();
}

export function getDemoFacebookListings(
  query: string,
  location?: string,
  maxPrice?: number,
): Listing[] {
  const base = query.toLowerCase();
  const searchUrl = buildMarketplaceSearchUrl(query, location, maxPrice);
  const demoItems = [
    {
      id: "1000000000000001",
      title: `${query} - local pickup, great condition`,
      price: 45,
      location: "Portland, OR",
      condition: "Used - Good",
    },
    {
      id: "1000000000000002",
      title: `${query} bundle deal`,
      price: 75,
      location: "Beaverton, OR",
      condition: "Used - Like New",
    },
    {
      id: "1000000000000003",
      title: `Vintage ${base} - must go today`,
      price: 25,
      location: "Gresham, OR",
      condition: "Used - Fair",
    },
    {
      id: "1000000000000004",
      title: `${query} with accessories`,
      price: 120,
      location: "Hillsboro, OR",
      condition: "Used - Good",
    },
    {
      id: "1000000000000005",
      title: `Barely used ${query}`,
      price: 55,
      location: "Salem, OR",
      condition: "Used - Like New",
    },
  ];

  return demoItems.map((item) => ({
    id: item.id,
    marketplace: "facebook" as const,
    title: item.title,
    price: item.price,
    currency: "USD",
    url: searchUrl,
    location: item.location,
    condition: item.condition,
  }));
}
