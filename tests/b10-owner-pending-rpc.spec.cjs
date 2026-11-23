const { test, expect } = require('@playwright/test');

// Synthetic browser-only B10 regression. Does not exercise live Supabase or RLS.
async function stubOwnerRpc(page) {
  const source = [
    'export function createClient() {',
    '  let notify = () => {};',
    '  window.__b10RpcStarted = false;',
    '  window.__b10FinishRpc = null;',
    '  window.__b10AuthEvent = (event, user) => notify(event, { user });',
    '  return {',
    '    auth: {',
    '      getUser: async () => ({ data: { user: { id: "owner-fixture", email_confirmed_at: "2026-11-21" } }, error: null }),',
    '      onAuthStateChange: (callback) => { notify = callback; return { data: { subscription: { unsubscribe() {} } } }; }',
    '    },',
    '    rpc: async () => {',
    '      window.__b10RpcStarted = true;',
    '      await new Promise(resolve => { window.__b10FinishRpc = resolve; });',
    '      return { data: true, error: null };',
    '    }',
    '  };',
    '}'
  ].join('\\n');
  await page.route('https://cdn.jsdelivr.net/**', route =>
    route.fulfill({ contentType: 'text/javascript', body: source }));
}

for (const scenario of ['SIGNED_OUT', 'SIGNED_IN']) {
  test('B10: pending owner RPC cannot reopen panel after ' + scenario, async ({ page }) => {
    await stubOwnerRpc(page);
    await page.goto('/owner-center.html');
    await expect.poll(() => page.evaluate(() => window.__b10RpcStarted)).toBe(true);
    await page.evaluate(event => {
      const user = event === 'SIGNED_IN'
        ? { id: 'other-fixture', email_confirmed_at: '2026-11-21' }
        : null;
      window.__b10AuthEvent(event, user);
    }, scenario);
    await expect(page.locator('#ownerPanel')).toBeHidden();
    await page.evaluate(() => window.__b10FinishRpc());
    await expect(page.locator('#ownerPanel')).toBeHidden();
    await expect(page.locator('#ownerStatus')).toContainText('تغيرت الجلسة');
  });
}
