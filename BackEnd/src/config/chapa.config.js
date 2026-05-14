
function trimTrailingSlash(url) {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/\/+$/, '');
}

function getFrontendBaseUrl() {
  return trimTrailingSlash(process.env.FRONTEND_URL || 'http://localhost:5173');
}

/** HTTPS origin of this API, reachable by Chapa (no trailing slash). */
function getPublicBackendBaseUrl() {
  const fromEnv =
    process.env.BACKEND_PUBLIC_URL ||
    process.env.API_PUBLIC_URL ||
    process.env.RENDER_EXTERNAL_URL;
  return trimTrailingSlash(fromEnv || '');
}

function buildChapaReturnUrl(txRef) {
  const base = getFrontendBaseUrl();
  return `${base}/payment/verify?tx_ref=${encodeURIComponent(txRef)}`;
}

function buildChapaWebhookUrl() {
  const base = getPublicBackendBaseUrl();
  if (!base) return null;
  return `${base}/api/payments/chapa/webhook`;
}

function logChapaSetupHints() {
  const frontend = getFrontendBaseUrl();
  const webhook = buildChapaWebhookUrl();
  console.log(`[Chapa] return_url base (FRONTEND_URL): ${frontend}/payment/verify?tx_ref=<txRef>`);
  if (webhook) {
    console.log(`[Chapa] Webhook URL (paste in Chapa → Webhooks): ${webhook}`);
  } else {
    console.log('[Chapa] Set BACKEND_PUBLIC_URL (or RENDER_EXTERNAL_URL on Render) so the webhook URL can be used in the Chapa dashboard.');
  }
}

module.exports = {
  getFrontendBaseUrl,
  getPublicBackendBaseUrl,
  buildChapaReturnUrl,
  buildChapaWebhookUrl,
  logChapaSetupHints,
};
