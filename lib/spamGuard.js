// Lightweight bot deterrent for the public apply/survey submit endpoints.
// Not a substitute for real rate limiting (this app has no shared store to
// rate-limit against on Vercel's serverless runtime) — this only catches the
// common case of scripted/headless-browser bots that fill every field and
// submit instantly.
const MIN_FILL_MS = 2000;

function isLikelyBot(body) {
  if (body?.website) return true; // honeypot field — real users never see or fill this
  const startedAt = Number(body?.startedAt);
  if (!startedAt || Number.isNaN(startedAt)) return true;
  return Date.now() - startedAt < MIN_FILL_MS;
}

export { isLikelyBot };
