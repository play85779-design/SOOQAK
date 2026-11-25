const {test,expect}=require('@playwright/test');
for(const width of [390,790]){
 test('V113 real sample photos load locally and details preserve the full image '+width,async({page})=>{
  await page.setViewportSize({width,height:940});await page.goto('/v101/index.html#home');
  for(const name of ['laptop','phone']){
   const card=page.locator('.card-photo button[data-detail="'+name+'"]');
   await card.scrollIntoViewIfNeeded();
   await expect.poll(()=>card.locator('img').evaluate(x=>x.complete&&x.naturalWidth>=600)).toBeTruthy();
   await card.click();
   await expect(page.locator('.detail-primary-image')).toHaveAttribute('src','./assets/'+name+'-photo.jpg');
   await expect.poll(()=>page.locator('.detail-primary-image').evaluate(x=>x.complete&&x.naturalWidth>=600)).toBeTruthy();
   await expect(page.locator('.detail-primary-image')).toHaveCSS('object-fit','contain');
   await page.goto('/v101/index.html#home');
  }
  await page.locator('[data-shop="tech"]').click();
  await expect(page.locator('.store-cover img')).toHaveAttribute('src','./assets/tech-photo.jpg');
  await expect.poll(()=>page.locator('.store-cover img').evaluate(x=>x.complete&&x.naturalWidth>=600)).toBeTruthy();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
 });
}
test('V113 original dimensional shopping artwork on welcome and store start',async({page})=>{
 await page.goto('/v101/index.html#welcome');
 await expect(page.locator('.onboard-scene img')).toHaveAttribute('src','./assets/shopping-scene.svg');
 await page.goto('/v101/index.html#create-store');
 await expect(page.locator('.store-start img')).toHaveAttribute('src','./assets/shopping-scene.svg');
});
