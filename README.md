# Flip Finder

Search **Facebook Marketplace** for underpriced items, compare prices against **eBay**, and score flip opportunities so you can buy low and resell high.

## What it does

- **FB Flip Finder** — Searches Facebook Marketplace (by keyword, location, max price) and flags listings priced below eBay market value
- **Price Compare** — Side-by-side view of Facebook and eBay listings with median/average stats
- **Profit scoring** — Estimates profit after eBay fees (~13%) and ranks deals by margin and confidence

## Quick start

```bash
git clone https://github.com/Joeflowcode/flip-finder.git
cd flip-finder
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs in **demo mode** without API keys so you can explore the UI immediately.

## Use on iPhone

1. Deploy to [Vercel](https://vercel.com) (import this repo — root directory is `./`, preset **Next.js**)
2. Open your Vercel URL in **Safari**
3. Tap **Share → Add to Home Screen** for an app-like shortcut

## API setup

### eBay (official API — free tier available)

1. Join the [eBay Developers Program](https://developer.ebay.com)
2. Create a **Production** keyset (Client ID + Client Secret)
3. Add to `.env.local`:
   ```
   EBAY_CLIENT_ID=...
   EBAY_CLIENT_SECRET=...
   ```

The app uses the [Browse API](https://developer.ebay.com/api-docs/buy/browse/overview.html) with OAuth client credentials.

### Facebook Marketplace (via Apify)

Facebook has **no public Marketplace API**. This app uses [Apify's Facebook Marketplace Search actor](https://apify.com/dtrungtin/facebook-marketplace-search) to fetch live listings.

1. Sign up at [Apify](https://apify.com)
2. Copy your API token from [Integrations](https://console.apify.com/account/integrations)
3. Add to `.env.local`:
   ```
   APIFY_TOKEN=...
   ```

> **Note:** Scraping Facebook may violate their Terms of Service. Use responsibly and be aware of account/IP risks. Apify handles proxies and browser automation on their platform.

## How flip scoring works

For each Facebook listing, the app:

1. Finds similar eBay listings by title keyword overlap
2. Calculates eBay median price (including shipping)
3. Estimates resale price at ~95% of median (conservative)
4. Subtracts purchase price and ~13% eBay seller fees
5. Scores 0–100 based on margin %, number of comps, and price gap

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- eBay Browse API + Apify REST API

## Project structure

```
flip-finder/
├── src/
│   ├── app/
│   │   ├── api/search/route.ts   # Search endpoint
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/               # UI components
│   └── lib/
│       ├── ebay.ts               # eBay API client
│       ├── facebook.ts           # Apify FB integration
│       ├── comparison.ts         # Flip scoring engine
│       └── types.ts
└── .env.example
```

## Deploy to Vercel

1. Create a new project at [vercel.com](https://vercel.com)
2. Import this repo (`Joeflowcode/flip-finder`)
3. Leave **Root Directory** as `./` (default)
4. Set preset to **Next.js**
5. Add environment variables (`EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `APIFY_TOKEN`)
6. Deploy

Works on Netlify or any Node.js host too.

```bash
npm run build
npm start
```
