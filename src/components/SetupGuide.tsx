import type { ApiStatus } from "@/lib/types";

interface SetupGuideProps {
  status: ApiStatus;
}

export function SetupGuide({ status }: SetupGuideProps) {
  if (!status.demoMode) return null;

  const ebayMissing = !status.ebay;
  const facebookMissing = !status.facebook;

  return (
    <section className="mb-8 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-amber-100">
          Connect live data to remove demo mode
        </h2>
        <p className="mt-1 text-sm text-amber-100/75">
          Results are sample data until these keys are added in{" "}
          <span className="font-medium text-amber-50">{status.envLocation}</span>
          , then redeployed.
        </p>
      </div>

      <div className="space-y-4">
        {ebayMissing && (
          <SetupBlock
            title="eBay prices"
            steps={[
              "Create a free account at developer.ebay.com",
              "Create a Production keyset (Client ID + Client Secret)",
              `Add EBAY_CLIENT_ID and EBAY_CLIENT_SECRET in ${status.envLocation}`,
            ]}
            linkHref="https://developer.ebay.com/my/keys"
            linkLabel="Open eBay Developer Keys"
          />
        )}

        {facebookMissing && (
          <SetupBlock
            title="Facebook Marketplace listings"
            steps={[
              "Create a free Apify account",
              "Copy your API token from Apify Integrations",
              `Add APIFY_TOKEN in ${status.envLocation}`,
            ]}
            linkHref="https://console.apify.com/account/integrations"
            linkLabel="Open Apify Token Page"
          />
        )}
      </div>

      {status.deployTarget === "vercel" && (
        <p className="mt-4 rounded-xl bg-black/20 px-4 py-3 text-sm text-amber-100/80">
          After saving variables in Vercel, open{" "}
          <strong className="text-amber-50">Deployments → Redeploy</strong> so
          the app picks them up.
        </p>
      )}
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
