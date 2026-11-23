const {test,expect}=require('@playwright/test');

test('V102 country flags are visible and region then optional city are hierarchical',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/v101/index.html#home',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.country-flag')).toContainText('🇸🇦');
 await expect(page.locator('#city')).toBeDisabled();
 await page.locator('#region').selectOption('المنطقة الشرقية');
 await expect(page.locator('#city')).toBeEnabled();
 await page.locator('#city').selectOption('الخبر');
 await expect(page.locator('.card')).toHaveCount(1);
 await page.locator('#country').selectOption('البحرين');
 await expect(page.locator('.country-flag')).toContainText('🇧🇭');
 await expect(page.locator('#region')).toHaveValue('كل المناطق');
 await expect(page.locator('#city')).toBeDisabled();
 await page.locator('#country').selectOption('الإمارات');
 await expect(page.locator('.country-flag')).toContainText('🇦🇪');
});

test('V102 poster-based welcome and account roles are functional previews',async({page})=>{
 await page.goto('/v101/index.html#welcome',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.onboard-card h1')).toContainText('منصة البيع والشراء');
 await expect(page.locator('.site')).toHaveClass(/onboarding/);
 await page.getByRole('button',{name:/ابدأ الآن/}).click();
 await expect(page.locator('.role-choice')).toHaveCount(2);
 await expect(page.locator('.onboard-card')).toContainText('حساب واحد');
 await page.getByRole('button',{name:/مستخدم عادي/}).click();
 await expect(page.locator('.hero')).toBeVisible();
});

test('V102 shop cards open a sample store without invented sales or ratings',async({page})=>{
 await page.goto('/v101/index.html#home',{waitUntil:'domcontentloaded'});
 await page.locator('.shop').first().click();
 await expect(page.locator('.store-cover')).toBeVisible();
 await expect(page.locator('.store-preview')).toContainText('متجر تجريبي');
 await expect(page.locator('.card')).toHaveCount(2);
 await expect(page.locator('.store-preview')).toContainText('لا توجد تقييمات أو متابعون');
});

test('V102 posting form has three visual steps and requires a region before local review',async({page})=>{
 await page.goto('/v101/index.html#post',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.post-steps span')).toHaveCount(3);
 await expect(page.locator('#post-city')).toHaveValue('');
 await page.locator('#post-title').fill('سيارة نموذجية جذابة');
 await page.locator('#post-price').fill('45000');
 await page.locator('#post-form').getByRole('button',{name:/مراجعة الإعلان/}).click();
 await expect(page.locator('#toast')).toContainText('اختر المنطقة');
 await page.locator('#post-region').selectOption('المنطقة الشرقية');
 await page.locator('#post-city').selectOption('الدمام');
 await page.locator('#post-form').getByRole('button',{name:/مراجعة الإعلان/}).click();
 await expect(page.getByRole('dialog')).toContainText('لم يُنشر الإعلان');
});

for(const width of [330,390,790,1180]){
 test('V102 layout remains scroll-safe with hierarchy and poster typography at '+width,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/v101/index.html#home',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.country-flag')).toBeVisible();
  await expect(page.locator('#region')).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow,'no horizontal overflow at '+width).toBeLessThanOrEqual(2);
 });
}
