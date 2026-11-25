const {test,expect}=require('@playwright/test');
for(const width of [330,390,790,1180]){
 test('V120 banners and category photography remain intact at '+width,async({page})=>{
 await page.setViewportSize({width,height:940}); await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/v101/index.html#home');
 for(const [i,asset] of [[0,'car-photo.jpg'],[1,'shopping-photo.jpg'],[2,'home-store-photo.jpg']]){await page.locator('[data-hero-slide="'+i+'"]').click();const img=page.locator('.hero-figure img');await expect(img).toHaveAttribute('src','./assets/'+asset);await expect.poll(()=>img.evaluate(x=>x.complete&&x.naturalWidth>0)).toBeTruthy();expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);}
 await page.goto('/v101/index.html#detail/car');await expect(page.locator('.detail-primary-image')).toHaveAttribute('src','./assets/car-photo.jpg');await expect(page.locator('.detail-primary-image')).toHaveCSS('object-fit','contain');
 await page.goto('/v101/index.html#stores'); for(const id of ['cars','home','tech'])await expect(page.locator('[data-shop="'+id+'"] img')).toBeVisible();
 });
}
