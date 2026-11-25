const {test,expect}=require('@playwright/test');
for(const width of [330,390,790,1180]){
 test('V112 header controls are visible and do not overflow at '+width,async({page})=>{
  await page.setViewportSize({width,height:940});
  await page.goto('/v101/index.html#home');
  for(const sel of ['.top .brand','.top .locale','.header-messages','.header-notifications','.header-auth-btn','.search-filter-btn'])await expect(page.locator(sel)).toBeVisible();
  const m=await page.evaluate(()=>{const r=document.querySelector('.top-inner').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-innerWidth,within:[...document.querySelectorAll('.top-inner .brand,.top-actions>*')].every(e=>{const b=e.getBoundingClientRect();return b.left>=r.left-1&&b.right<=r.right+1}),height:r.height}});
  expect(m.overflow).toBeLessThanOrEqual(2);expect(m.within).toBeTruthy();expect(m.height).toBeLessThanOrEqual(85);
  await page.locator('.search-filter-btn').click();
  await expect(page.locator('#region')).toBeFocused();
 });
}
test('V112 interactive promotions and honest quick access',async({page})=>{
 await page.goto('/v101/index.html#home');
 await expect(page.locator('.hero-dots button')).toHaveCount(3);
 await page.locator('[data-hero-slide="1"]').click();
 await expect(page.locator('.hero')).toHaveClass(/hero-emerald/);
 await expect(page.locator('.hero-figure img')).toHaveAttribute('src','./assets/shopping-photo.jpg');
 await expect.poll(()=>page.locator('.hero-figure img').evaluate(x=>x.complete&&x.naturalWidth>0)).toBeTruthy();
 await page.locator('[data-hero-slide="2"]').click();
 await expect(page.locator('.hero')).toHaveClass(/hero-amber/);
 await page.locator('[data-hero-category]').click();
 await expect(page.locator('.card')).toHaveCount(1);
 await expect(page.locator('.card')).toContainText('كنب');
 await page.locator('.header-notifications').click();
 await expect(page.getByRole('dialog')).toContainText('لا توجد تنبيهات حقيقية');
 await page.getByRole('button',{name:'فهمت'}).click();
 await page.locator('.header-messages').click();
 await expect(page.locator('.screen-title h1')).toHaveText('رسائلي');
});
