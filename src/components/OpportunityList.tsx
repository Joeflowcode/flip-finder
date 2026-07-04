import type { FlipOpportunity } from "@/lib/types";
import { isFacebookListingUrl } from "@/lib/facebook-url";

interface OpportunityListProps {
  opportunities: FlipOpportunity[];
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400 bg-emerald-500/15";
  if (score >= 45) return "text-amber-400 bg-amber-500/15";
  return "text-zinc-400 bg-white/5";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function OpportunityList({ opportunities }: OpportunityListProps) {
  if (opportunities.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-zinc-400">
        No flip opportunities found for this search. Try a broader keyword or
        higher max price.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {opportunities.map((opp) => (
        <article
          key={opp.listing.id}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-emerald-500/30"
        >
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white">{opp.listing.title}</h3>
              {opp.listing.location && (
                <p className="mt-1 text-sm text-zinc-500">
                  {opp.listing.location}
                </p>
              )}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-bold ${scoreColor(opp.flipScore)}`}
            >
              Score {opp.flipScore}
            </span>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xs text-zinc-500">Buy on FB</p>
              <p className="text-lg font-bold text-white">
                {formatCurrency(opp.listing.price)}
              </p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xs text-zinc-500">
                {opp.marketSource === "ebay" ? "eBay median" : "FB median"}
              </p>
              <p className="text-lg font-bold text-blue-300">
                {formatCurrency(opp.marketPrice)}
              </p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xs text-zinc-500">Est. profit</p>
              <p
                className={`text-lg font-bold ${opp.profitEstimate > 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {formatCurrency(opp.profitEstimate)}
              </p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xs text-zinc-500">Margin</p>
              <p className="text-lg font-bold text-amber-300">
                {opp.marginPercent}%
              </p>
            </div>
          </div>

          <ul className="mb-4 space-y-1">
            {opp.notes.map((note) => (
              <li key={note} className="text-sm text-zinc-400">
                • {note}
              </li>
            ))}
          </ul>

          <a
            href={opp.listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            {isFacebookListingUrl(opp.listing.url)
              ? "View listing on Facebook →"
              : "Browse similar listings on Facebook →"}
          </a>
        </article>
      ))}
    </div>
  );
}
