# Create the Flip Finder GitHub repo

Flip Finder is meant to live in its own repo: **Joeflowcode/flip-finder**

## Option A — iPhone (GitHub app / Safari)

1. Open [github.com/new](https://github.com/new) on your phone
2. **Repository name:** `flip-finder`
3. **Owner:** `Joeflowcode`
4. Leave **Add a README** unchecked (empty repo)
5. Tap **Create repository**

Then on a computer (or ask Cursor to run this):

```bash
git clone https://github.com/Joeflowcode/co-web-design.git temp-flip-export
cd temp-flip-export
git fetch origin flip-finder-main
git checkout flip-finder-main
git remote set-url origin https://github.com/Joeflowcode/flip-finder.git
git push -u origin flip-finder-main:main
```

## Option B — One command (if you have GitHub CLI)

```bash
gh repo create Joeflowcode/flip-finder --public --source=. --remote=origin --push
```

(Run from a fresh clone of the `flip-finder-main` branch.)

## Deploy on Vercel

1. Import **Joeflowcode/flip-finder**
2. Root Directory: `./` (default)
3. Framework: **Next.js**
4. Add env vars from `.env.example`
5. Deploy → open URL on iPhone → Add to Home Screen
