const {test,expect}=require('@playwright/test');
test('Arabic interface ignores a saved old English preference and stays RTL',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('sooqak:global-preview:v1',JSON.stringify({country:'SA',language:'en'})));
 await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',r=>r.abort());
 await page.goto('/index.html',{waitUntil:'domcontentloaded'});
 await expect(page.locator('html')).toHaveAttribute('lang','ar');
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await expect(page.locator('#sooqakHeroTitle')).toContainText('بيع واشتري بكل سهولة');
 await expect(page.locator('#globalLanguage')).toHaveText('العربية');
 await expect(page.locator('#searchButton')).toHaveText('بحث');
 await expect(page.locator('#sooqakCreateStore')).toContainText('افتح متجرك');
 await expect(page.locator('body')).not.toContainText('One marketplace for everyone');
});
test('Arabic stays selected when browsing and reloading without an English toggle',async({page})=>{
 await page.goto('/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('#globalCountry').selectOption('SA');
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await expect(page.locator('#globalLanguage')).toHaveText('العربية');
 await expect(page.locator('#globalLanguage')).not.toHaveAttribute('role','button');
 await expect(page.locator('button')).not.toContainText(['English']);
});
test('merchant storefront and dashboard headings are Arabic',async({page})=>{
 await page.goto('/store.html',{waitUntil:'domcontentloaded'});
 await expect(page.locator('html')).toHaveAttribute('lang','ar');
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await expect(page.locator('#storeProductsHeading')).toHaveText('منتجات المتجر');
 await page.goto('/merchant-dashboard.html',{waitUntil:'domcontentloaded'});
 await expect(page.locator('html')).toHaveAttribute('lang','ar');
 await expect(page.locator('.so-dash-hero h1')).toHaveText('لوحة إدارة متجري');
});

test('public service pages and policies retain Arabic titles and RTL structure',async({page})=>{
 for(const [route,heading] of [['/services.html','دليل الورش'],['/service-detail.html','تفاصيل النشاط'],['/privacy.html','سياسة الخصوصية'],['/terms.html','شروط استخدام سوقك'],['/content-policy.html','سياسة الإعلانات']]){
  await page.goto(route,{waitUntil:'domcontentloaded'});
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page).toHaveTitle(new RegExp(heading));
 }
});
