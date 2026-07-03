import type { Listing, PriceStats } from "@/lib/types";

interface ListingTableProps {
  title: string;
  listings: Listing[];
  accent: "facebook" | "ebay";
  stats?: PriceStats;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const accentStyles = {
  facebook: "border-blue-500/30 text-blue-300",
  ebay: "border-yellow-500/30 text-yellow-300",
};

export function ListingTable({
  title,
  listings,
  accent,
  stats,
}: ListingTableProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className={`text-lg font-semibold ${accentStyles[accent]}`}>
          {title}
        </h2>
        <span className="text-sm text-zinc-500">{listings.length} results</span>
      </div>

      {stats && stats.count > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div className="rounded-lg bg-black/20 p-2">
            <p className="text-zinc-500">Median</p>
            <p className="font-semibold">{formatCurrency(stats.median)}</p>
          </div>
          <div className="rounded-lg bg-black/20 p-2">
            <p className="text-zinc-500">Average</p>
            <p className="font-semibold">{formatCurrency(stats.average)}</p>
          </div>
          <div className="rounded-lg bg-black/20 p-2">
            <p className="text-zinc-500">Low</p>
            <p className="font-semibold">{formatCurrency(stats.min)}</p>
          </div>
          <div className="rounded-lg bg-black/20 p-2">
            <p className="text-zinc-500">High</p>
            <p className="font-semibold">{formatCurrency(stats.max)}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {listings.length === 0 ? (
          <p className="text-sm text-zinc-500">No listings found.</p>
        ) : (
          listings.map((listing) => (
            <a
              key={listing.id}
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-4 py-3 transition hover:bg-black/30"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-white">
                  {listing.title}
                </p>
                <p className="text-xs text-zinc-500">
                  {[listing.location, listing.condition]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <p className="shrink-0 font-semibold text-white">
                {formatCurrency(listing.price)}
              </p>
            </a>
          ))
        )}
      </div>
    </section>
  );
}
