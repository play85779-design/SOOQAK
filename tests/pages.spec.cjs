const { test, expect } = require('@playwright/test');
test('main site has Arabic document and recognizable title', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('lang', /ar/i);
  await expect(page).toHaveTitle(/سوقك|SOOQAK/i);
});
for (const route of ['/services.html', '/listing.html', '/privacy.html', '/terms.html']) {
  test(route + ' serves a page without HTTP error', async ({ page }) => {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response && response.status()).toBe(200);
  });
}
test('moderation page does not reveal admin tools before authorization', async ({ page }) => {
  await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**', route => route.abort());
  await page.goto('/admin-services.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#adminTools')).toBeHidden();
});
