const { test, expect } = require('@playwright/test');

// SOOQAK first-pass: non-invasive localhost checks, no email, signup, DB writes or production calls.
const root = '/index.html';

test('01 registration has email, password, and explicit email-link option', async ({ page }) => {
  await page.goto(root + '?auth=signup', {waitUntil:'domcontentloaded'});
  await expect(page.locator('#cloudLoginForm')).toBeVisible();
  await expect(page.locator('#authEmail')).toHaveAttribute('type','email');
  await expect(page.locator('#authPassword')).toHaveAttribute('type','password');
  await page.locator('#authMethodLink').click();
  await expect(page.locator('#cloudLoginForm')).toHaveAttribute('data-auth-flow','link');
  await expect(page.locator('#authPassword')).toHaveCount(0);
});

test('02 password form validates locally without sending an email', async ({ page }) => {
  await page.goto(root + '?auth=signup', {waitUntil:'domcontentloaded'});
  await expect(page.locator('#cloudLoginForm')).toBeVisible();
  await expect(page.locator('#authPassword')).toHaveAttribute('minlength','6');
  await expect(page.locator('#authDisplayName')).toHaveAttribute('required','');
});

test('03 posting while signed out requests authentication', async ({ page }) => {
  await page.goto(root, {waitUntil:'domcontentloaded'});
  await page.locator('#postButton').click();
  await expect(page.locator('#cloudLoginForm')).toBeVisible();
});

test('04 visitors cannot see owner-only editing on demo adverts', async ({ page }) => {
  await page.goto(root, {waitUntil:'domcontentloaded'});
  const demo = page.locator('[data-open^="demo-"]').first();
  await expect(demo).toBeVisible();
  await demo.click();
  await expect(page.locator('#modalBackdrop')).toBeVisible();
  await expect(page.locator('#modalContent [data-act="edit"]')).toHaveCount(0);
  await expect(page.locator('#modalContent [data-act="delete"]')).toHaveCount(0);
});

test('05 search and reset work without external accounts', async ({ page }) => {
  await page.goto(root, {waitUntil:'domcontentloaded'});
  await page.locator('#searchInput').fill('sooqak-never-match-098732');
  await expect(page.locator('#emptyState')).toBeVisible();
  await page.locator('#emptyReset').click();
  await expect(page.locator('#searchInput')).toHaveValue('');
});

test('06 favorites page switches within the website', async ({ page }) => {
  await page.goto(root, {waitUntil:'domcontentloaded'});
  await page.locator('#favButton').click();
  await expect(page.locator('#resultsTitle')).toContainText('المفضلة');
});

test('07 services directory displays categories and hides admin entry', async ({ page }) => {
  await page.goto('/services.html', {waitUntil:'domcontentloaded'});
  await expect(page.locator('a[data-kind="workshop"]')).toBeVisible();
  await expect(page.locator('#addService')).toBeVisible();
  await expect(page.locator('#adminServices')).toBeHidden();
});

test('08 admin controls stay hidden for an unauthenticated visitor', async ({ page }) => {
  await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**', route => route.abort());
  await page.goto('/admin-services.html', {waitUntil:'domcontentloaded'});
  await expect(page.locator('#adminTools')).toBeHidden();
});

test('09 pricing clearly distinguishes future prices from enabled checkout', async ({ page }) => {
  await page.goto('/pricing.html', {waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toContainText('المستقبلية');
  await expect(page.locator('body')).toContainText('لا توجد بوابة مدفوعات');
  await expect(page.locator('form')).toHaveCount(0);
});

test('10 mobile navigation can focus search', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto(root, {waitUntil:'domcontentloaded'});
  await page.locator('.mobile-nav [data-nav="search"]').click();
  await expect(page.locator('#searchInput')).toBeFocused();
});

test('11 beta crawler restriction remains enabled', async ({ page, request }) => {
  const robots=await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toMatch(/Disallow:\s*\//i);
  await page.goto('/admin-services.html', {waitUntil:'domcontentloaded'});
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/i);
});

test('12 core static routes respond successfully', async ({ request }) => {
  const routes=['/index.html','/listing.html','/services.html','/service-detail.html','/admin-services.html','/privacy.html','/terms.html','/pricing.html','/content-policy.html'];
  for(const route of routes){const response=await request.get(route);expect(response.status(),route).toBe(200);}
});

test('typing into header search immediately hides hero and categories, showing results below header',async({page})=>{
 await page.goto(root,{waitUntil:'domcontentloaded'});
 await page.locator('#searchInput').fill('سيارة');
 await expect(page.locator('body')).toHaveClass(/sooqak-search-active/);
 await expect(page.locator('.hero')).toBeHidden();
 await expect(page.locator('.categories-section')).toBeHidden();
 await expect(page.locator('.service-callout')).toBeHidden();
 await expect(page.locator('#resultsTitle')).toContainText('نتائج البحث');
 await expect(page.locator('#listingGrid')).toContainText('سيارة سيدان');
 const distances=await page.evaluate(()=>({header:document.querySelector('.topbar').getBoundingClientRect().bottom,results:document.querySelector('.market-section').getBoundingClientRect().top}));
 expect(distances.results-distances.header).toBeLessThan(65);
 await page.locator('#searchInput').fill('');
 await expect(page.locator('.hero')).toBeVisible();
 await expect(page.locator('body')).not.toHaveClass(/sooqak-search-active/);
});

test('singular and plural Arabic car and land terms normalize consistently',async({page})=>{
 await page.goto(root,{waitUntil:'domcontentloaded'});
 const terms=await page.evaluate(()=>['أرض','أراضي','سيارة','سيارات'].map(normalizeSearchText));
 expect(terms).toEqual(['ارض','ارض','سياره','سياره']);
});

test('login accepts previously established short password and new signup allows six characters',async({page})=>{
 await page.goto(root+'?auth=signup',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#authPassword')).toHaveAttribute('minlength','6');
 await page.locator('#authLoginTab').click();
 await expect(page.locator('#authPassword')).toHaveAttribute('minlength','1');
});
