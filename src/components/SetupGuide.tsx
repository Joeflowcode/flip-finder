import type { ApiStatus } from "@/lib/types";

interface SetupGuideProps {
  status: ApiStatus;
}

export function SetupGuide({ status }: SetupGuideProps) {
  if (!status.demoMode) {
    if (status.ebayOptional) {
      return (
        <section className="mb-8 rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-5">
          <h2 className="text-sm font-medium text-zinc-300">
            eBay comparison is optional
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Flip scores use Facebook Marketplace comps. Add{" "}
            <code className="text-zinc-400">EBAY_CLIENT_ID</code> and{" "}
            <code className="text-zinc-400">EBAY_CLIENT_SECRET</code> in{" "}
            {status.envLocation} anytime for nationwide eBay price data.
          </p>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="mb-8 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-amber-100">
          One key needed for live Facebook listings
        </h2>
        <p className="mt-1 text-sm text-amber-100/75">
          Add <strong className="text-amber-50">APIFY_TOKEN</strong> in{" "}
          {status.envLocation}, then redeploy. You do{" "}
          <strong className="text-amber-50">not</strong> need an eBay developer
          account to start flipping.
        </p>
      </div>

      <SetupBlock
        title="Facebook Marketplace (required)"
        steps={[
          "Create a free Apify account",
          "Copy your API token from Apify Integrations",
          `Add APIFY_TOKEN in ${status.envLocation}`,
          "Redeploy on Vercel",
        ]}
        linkHref="https://console.apify.com/account/integrations"
        linkLabel="Open Apify Token Page"
      />

      <p className="mt-4 rounded-xl bg-black/20 px-4 py-3 text-sm text-amber-100/80">
        <strong className="text-amber-50">No eBay account?</strong> That&apos;s
        fine. The app compares Facebook listings against each other to spot
        underpriced local deals you can re-list on Facebook.
      </p>
    </section>
  );
}

function SetupBlock({
  title,
  steps,
  linkHref,
  linkLabel,
}: {
  title: string;
  steps: string[];
  linkHref: string;
  linkLabel: string;
}) {
  return (
    <div className="rounded-xl bg-black/20 p-4">
      <h3 className="mb-2 font-medium text-white">{title}</h3>
      <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-amber-100/80">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <a
        href={linkHref}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
      >
        {linkLabel} →
      </a>
    </div>
  );
}
