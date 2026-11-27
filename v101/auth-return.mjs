// Stable, same-origin return address for every email and OAuth confirmation.
// Supabase must separately allowlist the resulting URL in Auth > URL Configuration.
// No secret/token, arbitrary redirect target, or third-party host is accepted.
export function sooqakAuthReturnURL(currentLocation = location.href) {
  const current = new URL(currentLocation);
  const local = current.protocol === 'http:' &&
    (current.hostname === 'localhost' || current.hostname === '127.0.0.1');
  if (current.protocol !== 'https:' && !local) {
    throw new Error('افتح سوقك من رابط HTTPS الرسمي للتجربة قبل طلب رسالة البريد.');
  }
  // The callback must be site-root relative, even when auth starts on a nested URL.
  // './index.html' could incorrectly resolve to /nested/index.html and break email links.
  const target = new URL('/index.html', current);
  target.search = '';
  target.hash = '';
  target.username = '';
  target.password = '';
  return target.href;
}
