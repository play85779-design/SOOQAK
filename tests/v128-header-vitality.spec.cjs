const {test,expect}=require('@playwright/test');
for(const width of [330,390,790,1180]){
 test('V128 header vitality and truthful local filters at '+width,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width,height:940});
  await page.goto('/v101/index.html#home');
  await expect(page.locator('.top .header-auth-btn')).toBeVisible();
  await expect(page.locator('.home-activity .activity-link')).toHaveText(/إعلانات المعاينة: \d+/);
  const count=await page.locator('.shell .card-grid').getAttribute('data-count');
  await expect(page.locator('.activity-link')).toContainText(count);
  await expect(page.locator('.top .header-auth-btn')).toHaveCSS('transition-duration','0s');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  await page.locator('#region').selectOption({label:'الشرقية'});
  await expect(page.locator('.active-search-chips')).toContainText('الشرقية');
  await page.locator('[data-clear-search="region"]').click();
  await expect(page.locator('#region')).toHaveValue('كل المناطق');
  await expect(page.locator('#city')).toBeDisabled();
  await page.getByRole('button',{name:'التنبيهات',exact:true}).click();
  await expect(page.locator('#dialog-root')).toContainText('لا توجد تنبيهات حقيقية');
 });
}
