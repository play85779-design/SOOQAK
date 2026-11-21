const {test,expect}=require('@playwright/test');
async function setup(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V51 local filters only'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{window.SOOQAK_CLOUD_ENABLED=false;reset()});
 // Filter inputs are inside a modal drawer, so open the drawer before interacting.
 await page.locator('#filterToggle').click();
 await expect(page.locator('#filterDrawer')).toHaveAttribute('aria-hidden','false');
}
test('V51 combination of filters is visible and chips remove only their own filter',async({page})=>{
 await setup(page);
 await page.locator('#cityFilter').selectOption('الجبيل');
 await page.locator('#minPrice').fill('1000');
 await page.locator('#filterClose').click();
 await expect(page.locator('[data-remove-filter="city"]')).toContainText('الجبيل');
 await expect(page.locator('[data-remove-filter="min"]')).toContainText('1000');
 await page.locator('[data-remove-filter="city"]').click();
 expect(await page.locator('#cityFilter').inputValue()).toBe('');
 expect(await page.locator('#minPrice').inputValue()).toBe('1000');
 await page.locator('[data-remove-filter="clear"]').click();
 await expect(page.locator('#activeSearchFilters')).toBeHidden();
 expect(await page.locator('#minPrice').inputValue()).toBe('');
});
test('V51 invalid price boundaries provide useful error without claiming empty inventory',async({page})=>{
 await setup(page);
 await page.locator('#minPrice').fill('90000');
 await page.locator('#maxPrice').fill('1000');
 await expect(page.locator('#resultsCount')).toContainText('أقل سعر');
 await expect(page.locator('#listingGrid .listing-card')).toHaveCount(0);
 await expect(page.locator('#emptyState')).toContainText('عدّل حد السعر');
 await page.locator('#maxPrice').fill('99999');
 // Make the corrected range include the test fixture's prices before expecting results.
 await page.locator('#minPrice').fill('1000');
 await expect(page.locator('#resultsCount')).not.toContainText('أقل سعر');
 await expect(page.locator('#listingGrid .listing-card')).not.toHaveCount(0);
});
test('V51 choosing a subcategory shows removable parent and child filters',async({page})=>{
 await setup(page);
 await page.locator('#categoryFilter').selectOption('سيارات');
 await expect(page.locator('#subcategoryFilter')).toBeVisible();
 const sub=await page.locator('#subcategoryFilter option').nth(1).getAttribute('value');
 await page.locator('#subcategoryFilter').selectOption(sub);
 await page.locator('#filterClose').click();
 await expect(page.locator('[data-remove-filter="category"]')).toContainText('سيارات');
 await expect(page.locator('[data-remove-filter="subcategory"]')).toContainText(sub);
 await page.locator('[data-remove-filter="category"]').click();
 await expect(page.locator('#subcategoryFilterGroup')).toBeHidden();
 expect(await page.locator('#subcategoryFilter').inputValue()).toBe('');
});
