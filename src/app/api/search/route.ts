import { NextResponse } from "next/server";
import { ebayConfigured } from "@/lib/ebay";
import { facebookConfigured } from "@/lib/facebook";
import { runComparison } from "@/lib/comparison";
import type { SearchParams } from "@/lib/types";

export async function GET() {
  return NextResponse.json({
    ebay: ebayConfigured(),
    facebook: facebookConfigured(),
    demoMode: !ebayConfigured() || !facebookConfigured(),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchParams & {
      mode?: "compare" | "flip";
    };

    if (!body.query?.trim()) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 },
      );
    }

    const result = await runComparison(
      {
        query: body.query.trim(),
        maxPrice: body.maxPrice,
        minPrice: body.minPrice,
        location: body.location,
        latitude: body.latitude,
        longitude: body.longitude,
        radiusKm: body.radiusKm,
        limit: body.limit ?? 24,
      },
      body.mode ?? "compare",
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Search failed unexpectedly",
      },
      { status: 500 },
    );
  }
}
