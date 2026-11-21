# SOOQAK preview security headers — not deployed

Conservative static headers are defined in vercel.json, on development branch only. They require an explicitly reviewed Vercel Preview deployment to appear in real HTTPS responses. Existing Python localhost ZAP runner does **not** serve vercel.json headers; its medium notices are not automatically resolved by this file.

This configuration does not enforce a broad script-src/connect-src CSP because SOOQAK still relies on third-party Supabase SDK ESM and external image URLs. A full tested CSP should be configured before launch after reviewing network requests. The policy currently limits framing, base URLs and object embeds, plus basic browser MIME / referrer safeguards.

Never promote unreviewed changes to production. Keep the website closed to the public, and confirm Vercel SSO after future protected preview deployment.