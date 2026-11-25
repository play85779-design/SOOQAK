const {test,expect}=require('@playwright/test');
for(const width of [390,790]){
 test('V115 sparse search retains exact count and provides useful navigation '+width,async({page})=>{
  await page.setViewportSize({width,height:940});await page.goto('/v101/index.html#listings');
  await page.locator('#search input').fill('سيارة');await page.locator('#search button').click();
  await expect(page.locator('.card')).toHaveCount(1);await expect(page.locator('.feed-head [role="status"]')).toHaveText('1 نتيجة');
  await expect(page.locator('.search-discovery')).toBeVisible();
  await page.locator('[data-clear-search="term"]').click();await expect(page.locator('.card')).toHaveCount(4);
  await page.locator('#search input').fill('لا يوجد هذا المنتج');await page.locator('#search button').click();
  await expect(page.locator('.card')).toHaveCount(0);await expect(page.locator('.empty-search')).toBeVisible();
  await page.locator('[data-discover="إلكترونيات"]').click();await expect(page.locator('.card')).toHaveCount(2);
  await expect(page.locator('[data-clear-search="category"]')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
 });
}
test('V115 clearing region removes dependent city and preserves country',async({page})=>{
 await page.goto('/v101/index.html#listings');await page.locator('#region').selectOption('المنطقة الشرقية');await page.locator('#city').selectOption('الخبر');
 await expect(page.locator('.card')).toHaveCount(1);await page.locator('[data-clear-search="region"]').click();
 await expect(page.locator('#region')).toHaveValue('كل المناطق');await expect(page.locator('#city')).toHaveValue('كل المدن');
 await page.locator('#country').selectOption('البحرين');await page.locator('#search input').fill('سيارة');await page.locator('#search button').click();
 await page.locator('.clear-search-all').click();await expect(page.locator('#country')).toHaveValue('البحرين');await expect(page.locator('.card')).toHaveCount(0);
});
