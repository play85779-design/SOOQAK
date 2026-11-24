const {test,expect}=require('@playwright/test');

test('V103 account separates guest, auth preview, my ads and messages without fake login',async({page})=>{
 await page.goto('/v101/index.html#account',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.account-hero')).toContainText('زائر');
 await expect(page.locator('.account-quick-card')).toHaveCount(4);
 await page.getByRole('button',{name:/استكشف تسجيل الدخول/}).first().click();
 await expect(page.locator('.auth-preview-card')).toBeVisible();
 await expect(page.locator('#auth-email-preview')).toBeEditable();
 await expect(page.locator('.auth-preview-card')).toContainText('هذه معاينة للتصميم فقط');
 await page.goto('/v101/index.html#my-ads');
 await expect(page.locator('.account-empty')).toContainText('لا توجد إعلانات مرتبطة بحساب حقيقي');
 await page.goto('/v101/index.html#messages');
 await expect(page.locator('.account-empty')).toContainText('المراسلة الحقيقية');
});

for(const width of [330,390,790,1180]){
 test('V103 account quick cards stay within screen at '+width,async({page})=>{
  await page.setViewportSize({width,height:800});
  await page.goto('/v101/index.html#account',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.account-quick-card')).toHaveCount(4);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(2);
 });
}
