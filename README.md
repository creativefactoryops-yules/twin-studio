# Twin Studio — Yules's AI twin

Your AI twin, for pics, try-ons, and fun. Non-explicit only.

Single-file static app (`index.html`, vanilla JS, no CDN deps, no server).

## How it works

1. Add your reference photo in the app — it is downscaled to 1024px and kept in your browser's localStorage. It never leaves your browser except in the generate call to Google.
2. Add your Gemini API key — saved in localStorage, same pattern as Della.
3. Pick an outfit, scene, shot, hair, expression (defaults follow your keeper formula: neutral, mouth closed).
4. Generate. The app calls `gemini-2.5-flash-image:generateContent` with your photo + a prompt built from your picks, and shows the picture. Download the ones you like — images are not saved anywhere.

## Honest limits

- The picture comes from Google's `gemini-2.5-flash-image` model. If it answers 429/quota, the key has no free image quota — the app shows the exact error.
- The key check (ListModels) shows models a key can SEE, not ones it can CALL.
- History is session-only. Download what you want to keep.
- Twin Studio is for try-on, portraits, and fun — non-explicit only.

## Deploy

Static site. Vercel project `twin-studio`, production domain https://twin-studio.vercel.app. Deploys from `main` on push.
