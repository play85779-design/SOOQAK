const {test,expect}=require('@playwright/test');
const uuid='44444444-4444-4444-8444-444444444444';
test('approved design keeps original marketplace functions, adds individual and merchant routes',async({page})=>{
 await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',r=>r.abort());
 await page.goto('/index.html',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#sooqakHeroTitle')).toContainText('متجرك');
 await expect(page.locator('#heroPost')).toBeVisible();
 await expect(page.locator('#sooqakCreateStore')).toBeVisible();
 await expect(page.locator('#sooqakShopsGrid')).toBeVisible();
 await expect(page.locator('#listingGrid')).toBeAttached();
 await expect(page.locator('#categoryCards')).toBeAttached();
});
test('create-store uses existing single-account gate instead of fake merchant registration',async({page})=>{
 await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',r=>r.abort());
 await page.goto('/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('#sooqakCreateStore').click();
 await expect(page.locator('#modalBackdrop')).toBeVisible();
 await expect(page.locator('#modalContent')).toContainText('دخول');
});
test('public merchant directory displays only real returned business listings and no invented certification',async({page})=>{
 await page.route('https://cdn.jsdelivr.net/**',r=>r.abort());
 await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',r=>r.abort());
 await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/rest/v1/sooqak_listings**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{account_id:uuid,seller_display_name:'متجر التجربة',city:'الجبيل'},{account_id:uuid,seller_display_name:'متجر التجربة',city:'الجبيل'}])}));
 await page.goto('/index.html',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.sooqak-shop-card')).toHaveCount(1);
 await expect(page.locator('.sooqak-shop-card')).toHaveAttribute('href','./store.html?id='+uuid);
 await expect(page.locator('.sooqak-shop-card')).toContainText('متجر التجربة');
 await expect(page.locator('.sooqak-shop-card')).not.toContainText('موثّق');
});
test('public store interface presents product price without fabricated order count or badge',async({page})=>{
 await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:String.raw`export function createClient(){return {from:()=>{const q=new Proxy({},{get:(_,k)=>(...a)=>k==='range'?Promise.resolve({data:[{id:'item',title:'لابتوب تجريبي',seller_display_name:'التقنية',city:'الجبيل',price:2599,status:'active',category:'إلكترونيات'}],count:1}):q});return q}}}`}));
 await page.goto('/store.html?id='+uuid);
 await expect(page.locator('#storeName')).toHaveText('التقنية');
 await expect(page.locator('.sooqak-store-item-price')).toContainText('ر.س');
 await expect(page.locator('#products a')).toHaveAttribute('href','./listing.html?id=item');
 await expect(page.locator('.sooqak-store-heading')).not.toContainText('4.9');
});
