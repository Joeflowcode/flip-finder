const ITEM_URL_PATTERN = /facebook\.com\/marketplace\/item\/(\d+)/i;

export function isFacebookListingUrl(url: string): boolean {
  return ITEM_URL_PATTERN.test(url);
}

export function toFacebookListingUrl(
  listingId: string | number | undefined,
): string | null {
  if (listingId === undefined || listingId === null) return null;
  const id = String(listingId).replace(/\D/g, "");
  if (!id) return null;
  return `https://www.facebook.com/marketplace/item/${id}`;
}

export function normalizeFacebookUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("/")) {
    return `https://www.facebook.com${trimmed}`;
  }
  return trimmed;
}

export function extractListingIdFromUrl(url: string): string | null {
  const normalized = normalizeFacebookUrl(url);
  const match = normalized.match(ITEM_URL_PATTERN);
  return match?.[1] ?? null;
}

export function resolveFacebookListingUrl(input: {
  listingUrl?: string;
  url?: string;
  link?: string;
  itemUrl?: string;
  facebookUrl?: string;
  id?: string | number;
  listingId?: string | number;
  fallbackSearchUrl?: string;
}): string {
  const candidates = [
    input.listingUrl,
    input.link,
    input.itemUrl,
    input.url,
    toFacebookListingUrl(input.listingId),
    toFacebookListingUrl(input.id),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const normalized = normalizeFacebookUrl(candidate);
    const listingId = extractListingIdFromUrl(normalized);
    if (listingId) {
      return toFacebookListingUrl(listingId)!;
    }
  }

  if (input.fallbackSearchUrl) {
    return input.fallbackSearchUrl;
  }

  return "https://www.facebook.com/marketplace/";
}
