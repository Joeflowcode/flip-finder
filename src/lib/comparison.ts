import type {
  ComparisonResult,
  FlipOpportunity,
  Listing,
  PriceStats,
  SearchParams,
} from "./types";
import { calculatePriceStats } from "./ebay";
import {
  facebookConfigured,
  getDemoFacebookListings,
  searchFacebook,
} from "./facebook";
import { ebayConfigured, searchEbay } from "./ebay";

const EBAY_FEE_RATE = 0.13;
const FB_RESALE_BUFFER = 0.05;

function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(
    a
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
  const wordsB = new Set(
    b
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let overlap = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) overlap += 1;
  }

  return overlap / Math.max(wordsA.size, wordsB.size);
}

function estimateResalePrice(
  listing: Listing,
  marketStats: PriceStats,
): number {
  if (marketStats.median > 0) {
    return marketStats.median * (1 - FB_RESALE_BUFFER);
  }
  return listing.price;
}

function scoreOpportunity(
  marginPercent: number,
  comparableCount: number,
  buyPrice: number,
  marketMedian: number,
): number {
  if (marketMedian <= 0 || buyPrice <= 0) return 0;

  const marginScore = Math.min(marginPercent / 50, 1) * 50;
  const confidenceScore = Math.min(comparableCount / 10, 1) * 30;
  const gapScore = Math.min((marketMedian - buyPrice) / marketMedian, 1) * 20;

  return Math.round(marginScore + confidenceScore + gapScore);
}

export function findFlipOpportunities(
  facebookListings: Listing[],
  ebayListings: Listing[],
  ebayStats: PriceStats,
  mode: "compare" | "flip" = "compare",
  useEbay = true,
): FlipOpportunity[] {
  const opportunities: FlipOpportunity[] = [];

  for (const fbListing of facebookListings) {
    const useEbayComps = useEbay && ebayListings.length > 0;
    let marketStats: PriceStats;
    let marketSource: "ebay" | "facebook";
    let compPrices: number[];
    let similarCount: number;
    const notes: string[] = [];

    if (useEbayComps) {
      const similarEbay = ebayListings.filter(
        (ebay) => titleSimilarity(fbListing.title, ebay.title) >= 0.25,
      );

      compPrices =
        similarEbay.length > 0
          ? similarEbay.map((item) => item.price + (item.shippingCost ?? 0))
          : ebayListings.map((item) => item.price + (item.shippingCost ?? 0));

      marketStats =
        compPrices.length > 0
          ? calculatePriceStats(compPrices)
          : ebayStats;
      marketSource = "ebay";
      similarCount = similarEbay.length;

      if (similarEbay.length === 0) {
        notes.push("No close eBay title matches; used overall eBay median.");
      } else {
        notes.push(`${similarEbay.length} similar eBay listing(s) found.`);
      }
    } else {
      const similarFb = facebookListings.filter(
        (other) =>
          other.id !== fbListing.id &&
          titleSimilarity(fbListing.title, other.title) >= 0.25,
      );

      compPrices =
        similarFb.length > 0
          ? similarFb.map((item) => item.price)
          : facebookListings
              .filter((item) => item.id !== fbListing.id)
              .map((item) => item.price);

      marketStats = calculatePriceStats(compPrices);
      marketSource = "facebook";
      similarCount = similarFb.length;

      if (similarFb.length === 0) {
        notes.push(
          "Compared against other Facebook listings in this search.",
        );
      } else {
        notes.push(`${similarFb.length} similar Facebook listing(s) found.`);
      }
      notes.push(
        "FB-to-FB flip estimate — add eBay keys for nationwide price comps.",
      );
    }

    if (marketStats.median <= 0) continue;

    const resalePrice = estimateResalePrice(fbListing, marketStats);
    const fees = marketSource === "ebay" ? resalePrice * EBAY_FEE_RATE : 0;
    const profitEstimate = resalePrice - fbListing.price - fees;
    const marginPercent =
      fbListing.price > 0 ? (profitEstimate / fbListing.price) * 100 : 0;

    const flipScore = scoreOpportunity(
      marginPercent,
      compPrices.length,
      fbListing.price,
      marketStats.median,
    );

    if (marginPercent >= 40) {
      notes.push("Strong margin — worth a closer look.");
    }
    if (fbListing.price < marketStats.median * 0.5) {
      notes.push("Priced well below market median.");
    }

    const minMargin = mode === "flip" ? 15 : 0;
    if (marginPercent < minMargin && mode === "flip") continue;

    opportunities.push({
      listing: fbListing,
      marketPrice: marketStats.median,
      marketSource,
      profitEstimate: Math.round(profitEstimate * 100) / 100,
      marginPercent: Math.round(marginPercent * 10) / 10,
      flipScore,
      comparableCount: compPrices.length,
      notes,
    });
  }

  return opportunities.sort((a, b) => b.flipScore - a.flipScore);
}

export function getDemoEbayListings(query: string): Listing[] {
  return [
    {
      id: "ebay-demo-1",
      marketplace: "ebay",
      title: `${query} - Certified Refurbished`,
      price: 149.99,
      currency: "USD",
      url: "https://www.ebay.com/",
      condition: "Certified - Refurbished",
      shippingCost: 12.99,
    },
    {
      id: "ebay-demo-2",
      marketplace: "ebay",
      title: `Used ${query} - Free Shipping`,
      price: 119.0,
      currency: "USD",
      url: "https://www.ebay.com/",
      condition: "Used",
      shippingCost: 0,
    },
    {
      id: "ebay-demo-3",
      marketplace: "ebay",
      title: `${query} Lot of 2`,
      price: 189.5,
      currency: "USD",
      url: "https://www.ebay.com/",
      condition: "Used",
      shippingCost: 8.5,
    },
    {
      id: "ebay-demo-4",
      marketplace: "ebay",
      title: `Open Box ${query}`,
      price: 134.0,
      currency: "USD",
      url: "https://www.ebay.com/",
      condition: "Open box",
      shippingCost: 0,
    },
    {
      id: "ebay-demo-5",
      marketplace: "ebay",
      title: `${query} - Buy It Now`,
      price: 99.99,
      currency: "USD",
      url: "https://www.ebay.com/",
      condition: "Used",
      shippingCost: 6.99,
    },
    {
      id: "ebay-demo-6",
      marketplace: "ebay",
      title: `Premium ${query} with case`,
      price: 165.0,
      currency: "USD",
      url: "https://www.ebay.com/",
      condition: "Used",
      shippingCost: 0,
    },
  ];
}

export async function runComparison(
  params: SearchParams,
  mode: "compare" | "flip" = "compare",
): Promise<ComparisonResult> {
  const warnings: string[] = [];
  let facebookListings: Listing[] = [];
  let ebayListings: Listing[] = [];
  let demoMode = false;
  let useEbay = ebayConfigured();

  if (useEbay) {
    try {
      ebayListings = await searchEbay(params);
    } catch (error) {
      warnings.push(
        `eBay search failed: ${error instanceof Error ? error.message : "Unknown error"}. Using Facebook-only price comps.`,
      );
      useEbay = false;
      ebayListings = [];
    }
  }

  if (facebookConfigured()) {
    try {
      facebookListings = await searchFacebook(params);
    } catch (error) {
      warnings.push(
        `Facebook search failed: ${error instanceof Error ? error.message : "Unknown error"}. Using demo data.`,
      );
      facebookListings = getDemoFacebookListings(
        params.query,
        params.location,
        params.maxPrice,
      );
      demoMode = true;
    }
  } else {
    facebookListings = getDemoFacebookListings(
      params.query,
      params.location,
      params.maxPrice,
    );
    demoMode = true;
  }

  if (params.maxPrice !== undefined) {
    facebookListings = facebookListings.filter(
      (item) => item.price <= params.maxPrice!,
    );
  }

  const ebayPrices = ebayListings.map(
    (item) => item.price + (item.shippingCost ?? 0),
  );
  const ebayStats = calculatePriceStats(ebayPrices);

  const opportunities = findFlipOpportunities(
    facebookListings,
    ebayListings,
    ebayStats,
    mode,
    useEbay,
  );

  return {
    query: params.query,
    facebookListings,
    ebayListings,
    opportunities,
    ebayStats,
    searchedAt: new Date().toISOString(),
    warnings,
  };
}
