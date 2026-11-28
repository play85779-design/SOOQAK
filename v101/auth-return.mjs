// Stable same-origin return address for the v101 deployment, including nested previews.
// Supabase must separately allowlist the resulting URL in Auth > URL Configuration.
// No secret/token, arbitrary redirect target, or third-party host is accepted.
export function sooqakAuthReturnURL(currentLocation = location.href) {
  const current = new URL(currentLocation);
  const local = current.protocol === 'http:' &&
    (current.hostname === 'localhost' || current.hostname === '127.0.0.1');
  if (current.protocol !== 'https:' && !local) {
    throw new Error('افتح سوقك من رابط HTTPS الرسمي للتجربة قبل طلب رسالة البريد.');
  }
  // v101 may be hosted at /v101/ or as the deployment root. Never send a
  // nested v101 preview to the legacy application at the repository root.
  const path = /^\/v101(?:\/|$)/.test(current.pathname) ? '/v101/index.html' : '/index.html';
  const target = new URL(path, current.origin);
  return target.href;
}
