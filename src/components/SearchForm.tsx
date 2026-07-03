"use client";

import { useState } from "react";
import type { ComparisonResult } from "@/lib/types";

type SearchMode = "compare" | "flip";

interface SearchFormProps {
  onResults: (results: ComparisonResult) => void;
  onLoading: (loading: boolean) => void;
}

export function SearchForm({ onResults, onLoading }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("portland");
  const [mode, setMode] = useState<SearchMode>("flip");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;

    setError(null);
    onLoading(true);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          location: location.trim() || undefined,
          mode,
          limit: 24,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Search failed");
      }

      onResults(data as ComparisonResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      onLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
    >
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("flip")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            mode === "flip"
              ? "bg-emerald-500 text-white"
              : "bg-white/5 text-zinc-300 hover:bg-white/10"
          }`}
        >
          FB Flip Finder
        </button>
        <button
          type="button"
          onClick={() => setMode("compare")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            mode === "compare"
              ? "bg-blue-500 text-white"
              : "bg-white/5 text-zinc-300 hover:bg-white/10"
          }`}
        >
          Price Compare
        </button>
      </div>

      <label className="mb-2 block text-sm font-medium text-zinc-300">
        What are you looking for?
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. Nintendo Switch, power tools, vintage camera"
        className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
        required
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Max FB price ($)
          </label>
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="100"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            FB location slug
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="portland"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
          />
        </div>
      </div>

      <p className="mb-4 text-xs text-zinc-500">
        {mode === "flip"
          ? "Finds underpriced Facebook Marketplace listings you can re-list for profit."
          : "Compares Facebook and eBay prices side by side."}
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 font-semibold text-white transition hover:from-emerald-400 hover:to-teal-400"
      >
        Search for deals
      </button>
    </form>
  );
}
