import { ebayConfigured } from "./ebay";
import { facebookConfigured } from "./facebook";

export type DeployTarget = "vercel" | "local";

export interface SetupRequirement {
  key: string;
  label: string;
  description: string;
  signupUrl: string;
  required: boolean;
}

const SETUP_REQUIREMENTS: SetupRequirement[] = [
  {
    key: "APIFY_TOKEN",
    label: "Apify API Token",
    description: "Powers live Facebook Marketplace search results.",
    signupUrl: "https://console.apify.com/account/integrations",
    required: true,
  },
  {
    key: "EBAY_CLIENT_ID",
    label: "eBay Client ID",
    description: "Optional — adds nationwide eBay price comparisons.",
    signupUrl: "https://developer.ebay.com/my/keys",
    required: false,
  },
  {
    key: "EBAY_CLIENT_SECRET",
    label: "eBay Client Secret",
    description: "Optional — pairs with your eBay Client ID.",
    signupUrl: "https://developer.ebay.com/my/keys",
    required: false,
  },
];

export function getDeployTarget(): DeployTarget {
  return process.env.VERCEL ? "vercel" : "local";
}

export function getMissingRequiredEnvVars(): SetupRequirement[] {
  return SETUP_REQUIREMENTS.filter(
    (req) => req.required && !process.env[req.key],
  );
}

export function getSetupStatus() {
  const ebay = ebayConfigured();
  const facebook = facebookConfigured();
  const missingRequired = getMissingRequiredEnvVars();
  const deployTarget = getDeployTarget();

  return {
    ebay,
    facebook,
    ebayOptional: !ebay,
    demoMode: !facebook,
    deployTarget,
    missing: missingRequired,
    envLocation:
      deployTarget === "vercel"
        ? "Vercel → Project → Settings → Environment Variables"
        : ".env.local in the project root",
  };
}

export type SetupStatus = ReturnType<typeof getSetupStatus>;
