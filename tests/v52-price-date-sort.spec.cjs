const {test,expect}=require('@playwright/test');
async function setup(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V52 local only'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{window.SOOQAK_CLOUD_ENABLED=false;reset()});
 await page.locator('#filterToggle').click();
}
test('V52 can show oldest listings first and restore newest ordering',async({page})=>{
 await setup(page);
 await page.locator('#sortFilter').selectOption('old');
 await expect(page.locator('#listingGrid .listing-card').first()).toContainText('مستلزمات تربية حيوانات');
 await page.locator('#filterClose').click();
 await expect(page.locator('[data-remove-filter="sort"]')).toContainText('الأقدم أولًا');
 await page.locator('[data-remove-filter="sort"]').click();
 await expect(page.locator('#listingGrid .listing-card').first()).toContainText('سيارة سيدان عائلية');
 expect(await page.locator('#sortFilter').inputValue()).toBe('new');
});
test('V52 ascending and descending price leave unpriced ads last',async({page})=>{
 await setup(page);
 await page.locator('#sortFilter').selectOption('cheap');
 await expect(page.locator('#listingGrid .listing-card').first()).toContainText('مستلزمات تربية حيوانات');
 await expect(page.locator('#listingGrid .listing-card').last()).toContainText('مطلوب معدات ورشة');
 await page.locator('#sortFilter').selectOption('expensive');
 await expect(page.locator('#listingGrid .listing-card').first()).toContainText('سيارة سيدان عائلية');
 await expect(page.locator('#listingGrid .listing-card').last()).toContainText('مطلوب معدات ورشة');
});
test('V52 price sort stays compatible with city filter',async({page})=>{
 await setup(page);
 await page.locator('#cityFilter').selectOption('الجبيل');
 await page.locator('#sortFilter').selectOption('cheap');
 await expect(page.locator('#listingGrid .listing-card')).toHaveCount(1);
 await expect(page.locator('#listingGrid .listing-card').first()).toContainText('طقم كنب');
});
