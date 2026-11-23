const {test, expect} = require('@playwright/test');

/**
 * Approved SOOQAK visual acceptance smoke checks.
 * These verify the real marketplace DOM, never a static fake storefront.
 * Product content stays driven by the existing app / cloud, and preview demos remain labeled.
 */
const widths = [
 {name:'fold closed',width:330,height:760},
 {name:'phone',width:390,height:844},
 {name:'fold open',width:790,height:1010},
 {name:'desktop',width:1180,height:820},
];

async function isolated(page) {
 await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',r=>r.abort());
 await page.route('https://fonts.googleapis.com/**',r=>r.abort());
 await page.route('https://fonts.gstatic.com/**',r=>r.abort());
}

for (const v of widths) {
 test('poster UI stays RTL and functional: '+v.name,async({page})=>{
  await page.setViewportSize({width:v.width,height:v.height});
  await isolated(page);
  await page.goto('/index.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page.locator('#sooqakHeroTitle')).toContainText('متجرك');
  await expect(page.locator('#heroPost')).toBeAttached();
  await expect(page.locator('#sooqakCreateStore')).toBeAttached();
  await expect(page.locator('#categoryCards')).toBeAttached();
  await expect(page.locator('#listingGrid')).toBeAttached();
  await expect(page.locator('.brand-mark')).toBeVisible();
  await expect(page.locator('.marketplace-quicktabs')).toBeVisible();
  const horizontalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(horizontalOverflow,'no unwanted horizontal scrolling on '+v.name).toBeLessThanOrEqual(2);
  const backgrounds=await page.locator('.sooqak-store-art').evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(backgrounds).toContain('sooqak-market.svg');
  const font=await page.locator('body').evaluate(el=>getComputedStyle(el).fontFamily);
  expect(font).toContain('Tajawal');
  if(v.width<=390)await expect(page.locator('.mobile-nav')).toBeVisible();
  if(v.width>=790)await expect(page.locator('.categories')).toBeVisible();
 });
}

test('approved assets are loadable and prices use Western numerals',async({page})=>{
 await isolated(page);
 await page.goto('/index.html',{waitUntil:'domcontentloaded'});
 for (const asset of ['assets/icon.svg','assets/sooqak-bag.svg','assets/sooqak-market.svg','poster-ui.css']) {
  const response=await page.request.get('/'+asset);
  expect(response.status(),asset).toBe(200);
 }
 await expect(page.locator('#listingGrid .listing-card').first()).toBeAttached();
 const price=await page.locator('#listingGrid .listing-price').first().innerText();
 expect(price).toMatch(/[0-9]/);
 expect(price).not.toMatch(/[٠-٩]/);
 await expect(page.locator('.demo-banner:visible')).toContainText('إعلانات الأمثلة غير حقيقية');
});

test('approved identity is shared by real store, merchant dashboard and service directory',async({page})=>{
 await isolated(page);
 for(const path of ['/store.html','/merchant-dashboard.html','/services.html']){
  await page.goto(path,{waitUntil:'domcontentloaded'});
  const styles=await page.locator('link[rel="stylesheet"]').evaluateAll(xs=>xs.map(x=>x.getAttribute('href')));
  expect(styles,path).toContain('./poster-ui.css');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 }
});
