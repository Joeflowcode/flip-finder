import { ebayConfigured } from "./ebay";
import { facebookConfigured } from "./facebook";

export type DeployTarget = "vercel" | "local";

export interface SetupRequirement {
  key: string;
  label: string;
  description: string;
  signupUrl: string;
}

const SETUP_REQUIREMENTS: SetupRequirement[] = [
  {
    key: "EBAY_CLIENT_ID",
    label: "eBay Client ID",
    description: "From your eBay Developers production keyset.",
    signupUrl: "https://developer.ebay.com/my/keys",
  },
  {
    key: "EBAY_CLIENT_SECRET",
    label: "eBay Client Secret",
    description: "The secret paired with your eBay Client ID.",
    signupUrl: "https://developer.ebay.com/my/keys",
  },
  {
    key: "APIFY_TOKEN",
    label: "Apify API Token",
    description: "Powers live Facebook Marketplace search results.",
    signupUrl: "https://console.apify.com/account/integrations",
  },
];

export function getDeployTarget(): DeployTarget {
  return process.env.VERCEL ? "vercel" : "local";
}

export function getMissingEnvVars(): SetupRequirement[] {
  return SETUP_REQUIREMENTS.filter((req) => !process.env[req.key]);
}

export function getSetupStatus() {
  const ebay = ebayConfigured();
  const facebook = facebookConfigured();
  const missing = getMissingEnvVars();
  const deployTarget = getDeployTarget();

  return {
    ebay,
    facebook,
    demoMode: !ebay || !facebook,
    deployTarget,
    missing,
    envLocation:
      deployTarget === "vercel"
        ? "Vercel → Project → Settings → Environment Variables"
        : ".env.local in the project root",
  };
}

export type SetupStatus = ReturnType<typeof getSetupStatus>;
