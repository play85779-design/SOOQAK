const {test,expect}=require('@playwright/test');
for(const width of [330,390,790,1180]){
 test('V110 natural auth and truthful empty management at '+width,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/v101/index.html#auth');
  await expect(page.locator('label[for="auth-email-preview"]')).toHaveText('البريد الإلكتروني');
  await expect(page.locator('#auth-email-preview')).toHaveAttribute('placeholder','أدخل بريدك الإلكتروني');
  await expect(page.locator('label[for="auth-password-preview"]')).toHaveText('كلمة المرور');
  await expect(page.locator('#auth-demo-note')).toContainText('لن تُرسل أو تُحفظ');
  await expect(page.locator('.auth-guest')).toContainText('المتابعة كزائر');
  await page.goto('/v101/index.html#my-ads');
  await expect(page.locator('.ads-stats strong')).toHaveText(['0','0','0']);
  await expect(page.locator('.ads-empty')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
 });
}
