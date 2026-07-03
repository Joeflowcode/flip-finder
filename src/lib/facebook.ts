import type { Listing, SearchParams } from "./types";

const APIFY_BASE = "https://api.apify.com/v2";

function isConfigured(): boolean {
  return Boolean(process.env.APIFY_TOKEN);
}

function buildMarketplaceUrl(
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
  id?: string;
  listingId?: string;
  title?: string;
  name?: string;
  price?: number | string;
  priceText?: string;
  url?: string;
  listingUrl?: string;
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

function normalizeApifyListing(item: ApifyListing): Listing {
  const id = item.id ?? item.listingId ?? crypto.randomUUID();
  const title = item.title ?? item.name ?? "Untitled listing";
  const url =
    item.url ??
    item.listingUrl ??
    `https://www.facebook.com/marketplace/item/${id}`;

  return {
    id: String(id),
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

  const searchUrl = buildMarketplaceUrl(
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

  return items.map(normalizeApifyListing).filter((item) => item.price > 0);
}

export function facebookConfigured(): boolean {
  return isConfigured();
}

export function getDemoFacebookListings(query: string): Listing[] {
  const base = query.toLowerCase();
  return [
    {
      id: "fb-demo-1",
      marketplace: "facebook",
      title: `${query} - local pickup, great condition`,
      price: 45,
      currency: "USD",
      url: "https://www.facebook.com/marketplace/",
      location: "Portland, OR",
      condition: "Used - Good",
    },
    {
      id: "fb-demo-2",
      marketplace: "facebook",
      title: `${query} bundle deal`,
      price: 75,
      currency: "USD",
      url: "https://www.facebook.com/marketplace/",
      location: "Beaverton, OR",
      condition: "Used - Like New",
    },
    {
      id: "fb-demo-3",
      marketplace: "facebook",
      title: `Vintage ${base} - must go today`,
      price: 25,
      currency: "USD",
      url: "https://www.facebook.com/marketplace/",
      location: "Gresham, OR",
      condition: "Used - Fair",
    },
    {
      id: "fb-demo-4",
      marketplace: "facebook",
      title: `${query} with accessories`,
      price: 120,
      currency: "USD",
      url: "https://www.facebook.com/marketplace/",
      location: "Hillsboro, OR",
      condition: "Used - Good",
    },
    {
      id: "fb-demo-5",
      marketplace: "facebook",
      title: `Barely used ${query}`,
      price: 55,
      currency: "USD",
      url: "https://www.facebook.com/marketplace/",
      location: "Salem, OR",
      condition: "Used - Like New",
    },
  ];
}
