const {test,expect}=require('@playwright/test');
test('V114 carousel autoplay, pause, and manual selection',async({page})=>{
 await page.setViewportSize({width:790,height:940});
 await page.goto('/v101/index.html#home');
 await page.mouse.move(1,1);
 await expect(page.locator('[data-hero-slide="1"]')).toHaveAttribute('aria-pressed','true',{timeout:8000});
 await page.locator('[data-hero-pause]').click();
 await expect(page.locator('[data-hero-pause]')).toHaveAttribute('aria-label','تشغيل العروض');
 await page.waitForTimeout(5200);
 await expect(page.locator('[data-hero-slide="1"]')).toHaveAttribute('aria-pressed','true');
 await page.locator('[data-hero-slide="2"]').click();
 await expect(page.locator('.hero-figure img')).toHaveAttribute('src','./assets/sofa-photo.jpg');
});
test('V114 reduced motion and horizontal swipe',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/v101/index.html#home');
 await expect(page.locator('[data-hero-pause]')).toHaveAttribute('aria-label','تشغيل العروض');
 await page.locator('.hero').evaluate(el=>{const p={clientX:30,clientY:90};el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[new Touch({identifier:1,target:el,...p})]}));el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[new Touch({identifier:1,target:el,clientX:130,clientY:92})]}));});
 await expect(page.locator('[data-hero-slide="1"]')).toHaveAttribute('aria-pressed','true');
});
test('V114 sofa sample photo is complete in listing and home store',async({page})=>{
 await page.goto('/v101/index.html#detail/sofa');
 await expect(page.locator('.detail-primary-image')).toHaveAttribute('src','./assets/sofa-photo.jpg');
 await expect.poll(()=>page.locator('.detail-primary-image').evaluate(x=>x.complete&&x.naturalWidth>600)).toBeTruthy();
 await expect(page.locator('.detail-primary-image')).toHaveCSS('object-fit','contain');
 await page.goto('/v101/index.html#store/home');
 await expect(page.locator('.store-cover img')).toHaveAttribute('src','./assets/sofa-photo.jpg');
});
