# Twin Studio — Yules's AI twin

Your AI twin, for pics, try-ons, and fun. Non-explicit only.

Single-file static app (`index.html`, vanilla JS, no CDN deps) + one Vercel serverless function (`api/cf-img2img.js`).

## How it works

1. Add your reference photo in the app — it is downscaled to 1024px and kept in your browser's localStorage. It never leaves your browser except in the generate call.
2. Pick an engine: **Cloudflare** (default) or **Gemini** (backup).
3. Pick an outfit, scene, shot, hair, expression (defaults follow your keeper formula: neutral, mouth closed). The "how much changes" slider (Cloudflare only) controls how far the picture moves from your photo — 0.4 keeps your face, 0.85 changes more.
4. Generate. Download the ones you like — images are not saved anywhere.

## Engines

- **Cloudflare (default):** the app calls `/api/cf-img2img` on this same Vercel project, which calls Cloudflare Workers AI (SDXL img2img) with the token from Vercel env vars. Free tier, about 200 pics a day. The model (SDXL) is scheduled for retirement on Nov 20, 2026 — it works until then; swap the `MODEL` constant in `api/cf-img2img.js` when it goes.
- **Gemini (backup):** calls `gemini-2.5-flash-image:generateContent` direct from the browser with the key you paste in. Free-tier image quota is 0 for the keys tested (two keys, both HTTP 429 limit 0) — so Gemini is the backup, not the main engine.

## Cloudflare setup (one time, by hand)

1. Free Cloudflare account at dash.cloudflare.com (no card).
2. API token: My Profile → API Tokens → Create Token → Workers AI template (or custom: Account / Workers AI / Edit). Copy the token.
3. Account ID: on the Cloudflare dashboard, right sidebar.
4. In Vercel (project yules-twin-studio → Settings → Environment Variables, Production): add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. Redeploy (Deployments → ⋯ → Redeploy, or push).
5. In the app, pick the Cloudflare engine and generate. Until the token is set, the app says plainly "Cloudflare is not connected yet."

## Deploy

Vercel project `yules-twin-studio`, production domain https://yules-twin-studio.vercel.app. Deploys from `main` on push. The `api/` folder is picked up as serverless functions automatically.
