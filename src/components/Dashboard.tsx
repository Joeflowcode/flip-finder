"use client";

import { useEffect, useState } from "react";
import type { ApiStatus, ComparisonResult } from "@/lib/types";
import { SearchForm } from "./SearchForm";
import { OpportunityList } from "./OpportunityList";
import { ListingTable } from "./ListingTable";
import { SetupGuide } from "./SetupGuide";

export function Dashboard() {
  const [results, setResults] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ApiStatus | null>(null);

  useEffect(() => {
    fetch("/api/search")
      .then((res) => res.json())
      .then((data) => setStatus(data as ApiStatus))
      .catch(() =>
        setStatus({
          ebay: false,
          facebook: false,
          ebayOptional: true,
          demoMode: true,
          deployTarget: "local",
          envLocation: ".env.local in the project root",
          missing: [],
        }),
      );
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Resale intelligence
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Flip Finder
        </h1>
        <p className="mx-auto max-w-2xl text-zinc-400">
          Search Facebook Marketplace for underpriced items, compare against eBay
          market prices, and spot flip opportunities before you buy.
        </p>
      </header>

      {status && (
        <div className="mb-6 flex flex-wrap justify-center gap-3 text-sm">
          <StatusBadge
            label="eBay API"
            active={status.ebay}
            activeText="Connected"
            inactiveText="Optional — not connected"
          />
          <StatusBadge
            label="Facebook"
            active={status.facebook}
            activeText="Apify connected"
            inactiveText="Demo mode"
          />
        </div>
      )}

      {status && <SetupGuide status={status} />}

      <div className="mb-10">
        <SearchForm onResults={setResults} onLoading={setLoading} />
      </div>

      {loading && (
        <div className="mb-8 flex items-center justify-center gap-3 text-zinc-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          Searching marketplaces…
        </div>
      )}

      {results && !loading && (
        <div className="space-y-8">
          {results.warnings.length > 0 && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="mb-2 text-sm font-medium text-red-200">
                Search issue
              </p>
              <ul className="space-y-1">
                {results.warnings.map((warning) => (
                  <li key={warning} className="text-sm text-red-100/80">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">
              Top flip opportunities
            </h2>
            <OpportunityList opportunities={results.opportunities} />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <ListingTable
              title="Facebook Marketplace"
              listings={results.facebookListings}
              accent="facebook"
            />
            <ListingTable
              title={
                results.ebayListings.length > 0
                  ? "eBay (Buy It Now)"
                  : "eBay (optional — not connected)"
              }
              listings={results.ebayListings}
              accent="ebay"
              stats={results.ebayStats.count > 0 ? results.ebayStats : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  label,
  active,
  activeText,
  inactiveText,
}: {
  label: string;
  active: boolean;
  activeText: string;
  inactiveText: string;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 ${
        active
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-zinc-700 bg-zinc-800/50 text-zinc-400"
      }`}
    >
      {label}: {active ? activeText : inactiveText}
    </span>
  );
}
