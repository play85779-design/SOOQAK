const {test,expect}=require('@playwright/test');
for(const width of [330,390,790,1180]){
 test('V130 poster art and functional carousel '+width,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width,height:940});
  await page.goto('/v101/index.html#home');
  await expect(page).toHaveTitle(/V130/);
  await expect(page.locator('.hero-emerald img')).toHaveAttribute('src',/poster4-shopping\.svg/);
  await expect(page.locator('.catbar img')).toHaveCount(5);
  await expect(page.locator('.poster-store-grid button')).toHaveCount(4);
  await expect(page.locator('.hero-dots button')).toHaveCount(3);
  await page.getByRole('button',{name:'العرض التالي',exact:true}).click();
  await expect(page.locator('.hero-amber')).toBeVisible();
  await page.getByRole('button',{name:'العرض السابق',exact:true}).click();
  await expect(page.locator('.hero-emerald')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  await page.getByRole('button',{name:'متاجر التسوق',exact:true}).click();
  await expect(page.locator('.shops-page')).toBeVisible();
  await expect(page.locator('.shops-page .shop')).toHaveCount(3);
 });
}
