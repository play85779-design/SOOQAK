const {test,expect}=require('@playwright/test');

// All fixtures are illustrative; no backend or external account is used.
test('V106 selected listing survives reload and direct preview link',async({page})=>{
 await page.goto('/v101/index.html?preview=1#home',{waitUntil:'domcontentloaded'});
 await page.locator('[data-detail="laptop"]').first().click();
 await expect(page).toHaveURL(/\?preview=1#detail\/laptop$/);
 await expect(page.locator('.detail-primary-image')).toHaveAttribute('src','./assets/laptop.svg');
 await page.locator('.detail-fav').click();
 await page.reload();
 await expect(page.locator('.detail-primary-image')).toHaveAttribute('src','./assets/laptop.svg');
 await expect(page.locator('.detail-fav')).toHaveAttribute('aria-pressed','true');
 await page.goto('/v101/index.html#detail/phone');
 await expect(page.locator('.detail-primary-image')).toHaveAttribute('src','./assets/phone.svg');
 await expect(page.locator('.detail-fav')).toHaveAttribute('aria-pressed','false');
});

test('V106 browser history restores the correct product for each detail entry',async({page})=>{
 await page.goto('/v101/index.html#home');
 await page.locator('[data-detail="laptop"]').first().click();
 await page.locator('.screen-title button[data-go="listings"]').click();
 await page.locator('[data-detail="phone"]').first().click();
 await expect(page.locator('.detail-primary-image')).toHaveAttribute('src','./assets/phone.svg');
 await page.goBack();
 await expect(page.locator('.detail-primary-image')).toHaveCount(0);
 await page.goBack();
 await expect(page.locator('.detail-primary-image')).toHaveAttribute('src','./assets/laptop.svg');
 await page.goForward();
 await page.goForward();
 await expect(page.locator('.detail-primary-image')).toHaveAttribute('src','./assets/phone.svg');
});

test('V106 unknown listing identifier never substitutes an unrelated product',async({page})=>{
 await page.goto('/v101/index.html#detail/unknown');
 await expect(page.locator('.detail-primary-image')).toHaveCount(0);
 await expect(page.locator('.card')).not.toHaveCount(0);
 await page.goto('/v101/index.html#detail');
 await expect(page.locator('.detail-primary-image')).toHaveAttribute('src','./assets/hero-car.svg');
});

test('V106 favorite still responds if browser storage writes are blocked',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.setItem=function(){throw new Error('storage blocked')}});
 await page.goto('/v101/index.html#detail/laptop');
 await page.locator('.detail-fav').click();
 await expect(page.locator('.detail-fav')).toHaveAttribute('aria-pressed','true');
 await page.locator('.detail-fav').click();
 await expect(page.locator('.detail-fav')).toHaveAttribute('aria-pressed','false');
});
