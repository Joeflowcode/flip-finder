import type { Listing, PriceStats, SearchParams } from "./types";

const EBAY_TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_SEARCH_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";

let cachedToken: { value: string; expiresAt: number } | null = null;

function isConfigured(): boolean {
  return Boolean(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET);
}

async function getAccessToken(): Promise<string> {
  if (!isConfigured()) {
    throw new Error("eBay API credentials are not configured");
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const credentials = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(EBAY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`eBay auth failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

interface EbayItemSummary {
  itemId: string;
  title: string;
  price?: { value: string; currency: string };
  itemWebUrl: string;
  image?: { imageUrl: string };
  condition?: string;
  shippingOptions?: Array<{ shippingCost?: { value: string } }>;
}

export async function searchEbay(params: SearchParams): Promise<Listing[]> {
  const token = await getAccessToken();
  const limit = Math.min(params.limit ?? 20, 50);

  const query = new URLSearchParams({
    q: params.query,
    limit: String(limit),
    sort: "price",
  });

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const min = params.minPrice ?? 0;
    const max = params.maxPrice ?? "";
    query.set("filter", `price:[${min}..${max}],priceCurrency:USD`);
  }

  const response = await fetch(`${EBAY_SEARCH_URL}?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID":
        process.env.EBAY_MARKETPLACE_ID ?? "EBAY_US",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`eBay search failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { itemSummaries?: EbayItemSummary[] };

  return (data.itemSummaries ?? []).map((item) => ({
    id: item.itemId,
    marketplace: "ebay" as const,
    title: item.title,
    price: Number(item.price?.value ?? 0),
    currency: item.price?.currency ?? "USD",
    url: item.itemWebUrl,
    imageUrl: item.image?.imageUrl,
    condition: item.condition,
    shippingCost: item.shippingOptions?.[0]?.shippingCost?.value
      ? Number(item.shippingOptions[0].shippingCost.value)
      : undefined,
  }));
}

export function calculatePriceStats(prices: number[]): PriceStats {
  if (prices.length === 0) {
    return { count: 0, min: 0, max: 0, median: 0, average: 0 };
  }

  const sorted = [...prices].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, price) => acc + price, 0);
  const mid = Math.floor(sorted.length / 2);

  return {
    count: sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median:
      sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid],
    average: sum / sorted.length,
  };
}

export function ebayConfigured(): boolean {
  return isConfigured();
}
