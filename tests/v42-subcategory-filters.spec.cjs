const {test,expect}=require('@playwright/test');
test('V42 subcategory filter switches with the main category',async({page})=>{
 await page.goto('/');
 await page.locator('#filterToggle').click();
 await expect(page.locator('#subcategoryFilterGroup')).toBeHidden();
 await page.locator('#categoryFilter').selectOption('سيارات');
 await expect(page.locator('#subcategoryFilterGroup')).toBeVisible();
 await expect(page.locator('#subcategoryFilter option')).toHaveCount(6);
 await page.locator('#subcategoryFilter').selectOption('سيدان');
 await expect(page.locator('#subcategoryFilter')).toHaveValue('سيدان');
 await page.locator('#categoryFilter').selectOption('عقارات');
 await expect(page.locator('#subcategoryFilter')).toHaveValue('');
 await expect(page.locator('#subcategoryFilter option')).toHaveCount(6);
});
test('V42 preserves old listing search by category-specific terms',async({page})=>{
 await page.goto('/');
 await page.locator('#filterToggle').click();
 await page.locator('#categoryFilter').selectOption('سيارات');
 await page.locator('#subcategoryFilter').selectOption('سيدان');
 await expect(page.locator('#listingGrid .listing-card')).toHaveCount(1);
 await page.locator('#resetFilters').click();
 await expect(page.locator('#subcategoryFilterGroup')).toBeHidden();
});
