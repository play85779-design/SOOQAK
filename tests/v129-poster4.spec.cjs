const {test,expect}=require('@playwright/test');
for(const width of [330,390,790,1180]){
 test('V129 poster foundation and retained actions '+width,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width,height:940});
  await page.goto('/v101/index.html#home');
  await expect(page.locator('.top .wordmark-ar')).toHaveCSS('color','rgb(255, 255, 255)');
  await expect(page.locator('.top .header-auth-btn')).toBeVisible();
  await expect(page.locator('.home-activity .notice')).toBeVisible();
  await expect(page.locator('.catbar .cat')).toHaveCount(5);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  await page.getByRole('button',{name:'التنبيهات',exact:true}).click();
  await expect(page.locator('#dialog-root')).toContainText('لا توجد تنبيهات حقيقية');
 });
}
