const {test,expect}=require('@playwright/test');
const {join}=require('path');
/* V100 tests are scoped strictly to clean-room app /v100, not legacy markup.
   Real backend intentionally absent from visual acceptance stage. */
const sizes=[
 {name:'fold-closed',width:330,height:760},
 {name:'phone',width:390,height:844},
 {name:'fold-open',width:790,height:950},
 {name:'desktop',width:1180,height:810}
];
async function start(page,route='home'){
 await page.goto('/v100/index.html#'+route,{waitUntil:'domcontentloaded'});
 await page.locator('#app .main-layout').waitFor({state:'attached'});
}
for(const size of sizes){
 test('V100 poster-responsive: '+size.name,async({page})=>{
  await page.setViewportSize({width:size.width,height:size.height});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await start(page);
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page.locator('body')).toHaveCSS('font-family',/Tajawal/);
  await expect(page.locator('.hero-banner')).toBeVisible();
  await expect(page.locator('.category-strip .category-item')).toHaveCount(5);
  await expect(page.locator('.shop-mini')).toHaveCount(3);
  await expect(page.locator('.product-card')).toHaveCount(4);
  await expect(page.locator('.preview-ribbon')).toContainText('معاينة تصميمية');
  const data=await page.evaluate(()=>{
   const c=s=>{const r=document.querySelector(s).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,height:r.height}};
   return {width:innerWidth,scroll:document.documentElement.scrollWidth,
    hero:c('.hero-banner'),cards:c('.product-card'),logo:document.querySelector('.brand-crop img').naturalWidth,
    fonts:getComputedStyle(document.body).fontFamily,grid:getComputedStyle(document.querySelector('.product-grid')).gridTemplateColumns};
  });
  expect(data.scroll-data.width,'horizontal overflow').toBeLessThanOrEqual(2);
  expect(data.hero.height,'compact hero').toBeLessThan(300);
  expect(data.cards.top,'show products early').toBeLessThan(size.width<400?1050:980);
  expect(data.logo,'exact poster logo asset loaded').toBeGreaterThan(0);
  expect(errors,'no browser errors').toEqual([]);
 });
}
test('V100 onboarding matches reference and is navigable',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/v100/index.html#welcome',{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:/منصة البيع والشراء/})).toBeVisible();
 await page.getByRole('button',{name:/ابدأ الآن/}).click();
 await expect(page.getByRole('heading',{name:'اختر نوع حسابك'})).toBeVisible();
 await page.getByRole('button',{name:/تاجر \/ صاحب متجر/}).click();
 await expect(page.locator('.role-card.selected')).toContainText('تاجر / صاحب متجر');
 await page.getByRole('button',{name:/متابعة/}).click();
 await expect(page.locator('.hero-banner')).toBeVisible();
});
test('V100 listings have real filters, safe sample numbers and favorites',async({page})=>{
 await page.goto('/v100/index.html#listings',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.product-card')).toHaveCount(4);
 await page.getByRole('button',{name:'سيارات',exact:true}).first().click();
 await expect(page.locator('.product-card')).toHaveCount(1);
 await expect(page.locator('.product-card')).toContainText('45,000');
 await page.locator('.favorite-heart').first().click();
 await expect(page.locator('.favorite-heart').first()).toHaveAttribute('aria-pressed','true');
 await page.locator('button[data-go="favorites"]:visible').first().click();
 await expect(page.locator('.product-card')).toHaveCount(1);
});
test('V100 search flows to results without backend',async({page})=>{
 await start(page);
 await page.locator('input[name="q"]').fill('HP');
 await page.locator('#search-form').getByRole('button').click();
 await expect(page.locator('.product-card')).toHaveCount(1);
 await expect(page.locator('.product-card')).toContainText('لابتوب');
});
test('V100 add listing uses local-only review, never publishes',async({page})=>{
 await page.goto('/v100/index.html#post',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#listing-form')).toBeVisible();
 await page.locator('#ad-title').fill('سيارة تجريبية للمعاينة فقط');
 await page.locator('#ad-price').fill('45000');
 await page.getByRole('button',{name:/معاينة الإعلان/}).click();
 await expect(page.getByRole('dialog')).toContainText('لم يُرفع الإعلان');
 await expect(page.getByRole('dialog')).toContainText('45,000');
});
test('V100 preview-only action guards remain truthful',async({page})=>{
 await page.goto('/v100/index.html#create-store',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:/أنشئ متجرك الآن/}).click();
 await expect(page.getByRole('dialog')).toContainText('لن ننشئ حسابًا');
 await page.getByRole('button',{name:'فهمت'}).click();
 await page.goto('/v100/index.html#store',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:/مراسلة/}).click();
 await expect(page.getByRole('dialog')).toContainText('لا توجد حسابات');
});
test('V100 all preview images have correct MIME, real bytes and decode in browser',async({page,request})=>{
 const assets=['logo.webp','hero.webp','car.webp','sofa.webp','laptop.webp','phone.webp','shop-car.webp','shop-home.webp','shop-tech.webp','store-cover.webp','store-illustration.webp','welcome.webp','headphones.webp','reference-poster.webp'];
 for(const path of ['v100/index.html','v100/styles.css','v100/app.js']){
  const response=await request.get('/'+path);
  expect(response.status(),path).toBe(200);
 }
 for(const name of assets){
  const response=await request.get('/v100/assets/'+name);
  expect(response.status(),name).toBe(200);
  expect(response.headers()['content-type'],name).toMatch(/image\\/webp/);
  const bytes=await response.body();
  expect(bytes.subarray(0,4).toString('ascii'),name).toBe('RIFF');
  expect(bytes.subarray(8,12).toString('ascii'),name).toBe('WEBP');
 }
 for(const route of ['home','stores','store','listings','details','welcome','role','post','create-store','account']){
  await page.goto('/v100/index.html#'+route,{waitUntil:'domcontentloaded'});
  const images=await page.evaluate(async()=>{
   const imgs=[...document.querySelectorAll('img')];
   for(const img of imgs)img.loading='eager';
   return Promise.all(imgs.map(async img=>{
    try{await img.decode()}catch(err){}
    return {path:new URL(img.src).pathname,width:img.naturalWidth,height:img.naturalHeight};
   }));
  });
  expect(images.length,route).toBeGreaterThan(0);
  const broken=images.filter(img=>img.width===0||img.height===0);
  expect(broken,route+' has broken visible image assets').toEqual([]);
 }
});
test('V100 all eight poster screens and supporting routes render semantically',async({page})=>{
 for(const route of ['welcome','role','home','listings','store','post','create-store','account','favorites','details','services','stores']){
  await page.goto('/v100/index.html#'+route,{waitUntil:'domcontentloaded'});
  await expect(page.locator('#app')).toBeVisible();
  expect(await page.locator('body').innerText(),route).not.toContain('undefined');
  expect(await page.locator('body').innerText(),route).not.toContain('NaN');
 }
});
