// Twin Studio — Cloudflare Workers AI img2img proxy.
// The browser cannot call Cloudflare's API directly (no CORS), so this
// Vercel function makes the call with the token from env vars.
// Env vars (set in Vercel, Settings -> Environment Variables, Production):
//   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN
// Model: SDXL base 1.0. Cloudflare plans to retire it 2026-11-20 —
// when that happens, swap MODEL below for the replacement img2img model.
const MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) {
    return res.status(503).json({ error: "cloudflare-not-connected", message: "Cloudflare is not connected yet. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in Vercel, then redeploy." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: "bad-json" }); }
  }
  const prompt = (body && body.prompt) || "";
  const imageB64 = (body && body.imageB64) || "";
  const strength = (body && typeof body.strength === "number") ? Math.min(0.95, Math.max(0.1, body.strength)) : 0.65;
  if (!prompt || !imageB64) return res.status(400).json({ error: "need prompt and imageB64" });

  const url = "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/ai/run/" + MODEL;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        image_b64: imageB64,
        strength: strength,
        guidance: 7.5,
        num_steps: 15,
        negative_prompt: "blurry, low quality, distorted face, extra fingers, deformed hands, bad anatomy"
      }),
      signal: AbortSignal.timeout(9500)
    });
    if (!r.ok) {
      let detail = "HTTP " + r.status;
      try {
        const j = await r.json();
        detail = (j.errors && j.errors[0] && j.errors[0].message) || j.message || detail;
      } catch (e) {}
      return res.status(r.status).json({ error: "cloudflare-error", message: String(detail).slice(0, 400) });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    return res.status(200).json({ image: "data:image/png;base64," + buf.toString("base64"), model: "sdxl", engine: "cloudflare" });
  } catch (e) {
    return res.status(502).json({ error: "cloudflare-unreachable", message: String((e && e.message) || e).slice(0, 300) });
  }
};
