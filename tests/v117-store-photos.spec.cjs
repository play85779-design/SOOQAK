const {test,expect}=require('@playwright/test');
for(const width of [390,790]){
 test('V117 category photography is distinct, loads locally and opens its own store '+width,async({page})=>{
  await page.setViewportSize({width,height:940});
  for(const [id,asset,product] of [['home','home-store-photo.jpg','sofa-photo.jpg'],['tech','tech-cover-photo.jpg','laptop-photo.jpg'],['cars','car-store-photo.jpg','car-photo.jpg']]){
   await page.goto('/v101/index.html#stores');
   const card=page.locator('[data-shop="'+id+'"]');
   await expect(card.locator('img')).toHaveAttribute('src','./assets/'+asset);
   await expect.poll(()=>card.locator('img').evaluate(x=>x.complete&&x.naturalWidth>=600)).toBeTruthy();
   await card.click();
   await expect(page.locator('.store-cover img')).toHaveAttribute('src','./assets/'+asset);
   await expect(page.locator('.card img[src="./assets/'+product+'"]')).toBeVisible();
   await expect(page.locator('.store-heading')).toContainText('ليست منتجات تاجر فعلي');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  }
 });
}
