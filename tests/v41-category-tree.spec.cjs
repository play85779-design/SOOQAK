const {test,expect}=require('@playwright/test');
test('V41 category tree keeps all nine legacy parent categories',async({page})=>{
 await page.goto('/');
 const details=await page.evaluate(()=>window.SOOQAK_CATEGORY_TREE.map(x=>({name:x.name,ids:x.subcategories.map(s=>s.id)})));
 expect(details).toHaveLength(9);
 for(const item of details){expect(item.ids).toHaveLength(5);expect(new Set(item.ids).size).toBe(5);}
 await expect(page.locator('#categoryCards [data-category]')).toHaveCount(9);
});
test('V41 clicking main category shows subcategories; choosing subcategory searches safely',async({page})=>{
 await page.goto('/');
 await page.locator('#categoryCards [data-category="سيارات"]').click();
 await expect(page.locator('#subcategoryPreview')).toBeVisible();
 await expect(page.locator('#subcategoryPreview .subcategory-chip')).toHaveCount(5);
 await page.locator('[data-subcategory-search="سيدان"]').click();
 await expect(page.locator('#categoryFilter')).toHaveValue('سيارات');
 await expect(page.locator('#searchInput')).toHaveValue('سيدان');
});
test('V41 reset hides the preview and preserves legacy categories',async({page})=>{
 await page.goto('/');
 await page.locator('#categoryCards [data-category="عقارات"]').click();
 await expect(page.locator('#subcategoryPreview')).toBeVisible();
 await page.locator('#showAllCats').click();
 await expect(page.locator('#subcategoryPreview')).toBeHidden();
 await expect(page.locator('#categoryFilter')).toHaveValue('');
});
