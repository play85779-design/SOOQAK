const {test,expect}=require('@playwright/test');
for(const width of [330,390,790,1180]){
 test('V123 integrated photo covers and single product layout at '+width,async({page})=>{
 await page.setViewportSize({width,height:940});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v101/index.html#home');
 await page.locator('[data-hero-slide="1"]').click();const photo=page.locator('.hero-figure img');await expect(photo).toHaveAttribute('src','./assets/shopping-photo.jpg');await expect.poll(()=>photo.evaluate(x=>x.complete&&x.naturalWidth>=600)).toBeTruthy();
 await expect(page.locator('.hero h1')).toContainText('كل ما تحتاجه');
 await page.locator('[data-hero-slide="2"]').click();await expect(page.locator('.hero-figure img')).toHaveAttribute('src','./assets/home-store-photo.jpg');
 await page.goto('/v101/index.html#store/cars');const cover=page.locator('.store-cover');const img=cover.locator('img');await expect(img).toHaveCSS('position','absolute');await expect.poll(()=>img.evaluate(x=>x.complete&&x.naturalWidth>=600)).toBeTruthy();
 await expect(cover).toContainText('متجر تجريبي');await expect(page.locator('.card-grid .card')).toHaveCount(1);const dims=await page.locator('.card-grid').evaluate(el=>({grid:el.clientWidth,card:el.firstElementChild.getBoundingClientRect().width,overflow:document.documentElement.scrollWidth-innerWidth}));expect(dims.card).toBeGreaterThanOrEqual(dims.grid-3);expect(dims.overflow).toBeLessThanOrEqual(2);
 if(width>=600)await expect(page.locator('.card-grid .card')).toHaveCSS('display','grid');
 await page.locator('[data-detail="car"]').first().click();await expect(page.locator('.detail-primary-image')).toHaveCSS('object-fit','contain');
 });
}
