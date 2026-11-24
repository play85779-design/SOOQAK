const {test,expect}=require('@playwright/test');
const devices=[{name:'fold-closed',w:330,h:760},{name:'phone',w:390,h:844},{name:'fold-open',w:790,h:940},{name:'desktop',w:1180,h:820}];
for(const d of devices){
 test('V101 responsive original design '+d.name,async({page})=>{
  await page.setViewportSize({width:d.w,height:d.h});
  const err=[];page.on('pageerror',e=>err.push(e.message));
  await page.goto('/v101/index.html#home',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.brand .wordmark-ar').first()).toHaveText('سوقك');
  await expect(page.locator('.hero')).toBeVisible();
  await expect(page.locator('.card')).toHaveCount(4);
  const g=await page.evaluate(()=>{
   const rr=s=>{const v=document.querySelector(s).getBoundingClientRect();return {left:v.left,right:v.right,top:v.top,bottom:v.bottom,width:v.width,height:v.height}};
   const logo=document.querySelector('.top .brand-mark');
   const car=document.querySelector('.hero-figure img');
   return {documentScroll:document.documentElement.scrollWidth,windowWidth:window.innerWidth,hero:rr('.hero'),copy:rr('.hero-copy'),car:rr('.hero-figure'),card:rr('.card'),logo:logo.complete&&logo.naturalWidth>0,carLoaded:car.complete&&car.naturalWidth>0,posterCrop:!!document.querySelector('img[src*="reference-poster"]')};
  });
  expect(g.logo,'logo SVG loaded').toBe(true);
  expect(g.carLoaded,'car native SVG loaded').toBe(true);
  expect(g.posterCrop,'no old composite raster crops').toBe(false);
  expect(g.documentScroll-g.windowWidth,'no sideways scrolling').toBeLessThanOrEqual(2);
  expect(g.copy.left,'copy and drawing do not overlap').toBeGreaterThanOrEqual(g.car.right-2);
  expect(g.card.top,'product cards not too far down').toBeLessThan(d.w<=390?1200:1120);
  expect(err).toEqual([]);
  const shot=await page.screenshot({type:'jpeg',quality:54,fullPage:false});
  console.log('V101_SCREEN_'+d.name+':'+shot.toString('base64'));
 });
}
test('V101 users can actually change country and city',async({page})=>{
 await page.goto('/v101/index.html#home',{waitUntil:'domcontentloaded'});
 await page.locator('#country').selectOption('البحرين');
 await expect(page.locator('#city')).toHaveValue('كل المدن');
 await expect(page.locator('.card')).toHaveCount(0);
 await page.locator('#country').selectOption('السعودية');
 await page.locator('#region').selectOption('المنطقة الشرقية');
 await page.locator('#city').selectOption('الخبر');
 await expect(page.locator('.card')).toHaveCount(1);
 await expect(page.locator('.card')).toContainText('كنب بيج');
});
test('V101 favorite heart only one per photo and toggles',async({page})=>{
 await page.goto('/v101/index.html#home',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.card-photo').first().locator('.card-heart')).toHaveCount(1);
 await page.locator('.card-heart').first().click();
 await expect(page.locator('.card-heart').first()).toHaveAttribute('aria-pressed','true');
 await page.locator('button[data-go="favorites"]:visible').first().click();
 await expect(page.locator('.card')).toHaveCount(1);
});
test('V103 search and editable local listing review',async({page})=>{
 await page.goto('/v101/index.html#home',{waitUntil:'domcontentloaded'});
 await page.locator('input[name="q"]').fill('هاتف');
 await page.locator('#search').getByRole('button').click();
 await expect(page.locator('.card')).toHaveCount(1);
 await page.locator('button[data-go="post"]:visible').first().click();
 const sample=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/9o8AAAAASUVORK5CYII=','base64');
 await page.locator('#preview-images').setInputFiles({name:'ad.png',mimeType:'image/png',buffer:sample});
 await page.locator('[data-post-next]').click();
 await page.locator('#post-title').fill('سيارة توضيحية للتجربة');
 await page.locator('#post-price').fill('65000');
 await page.locator('#post-region').selectOption('المنطقة الشرقية');
 await page.locator('[data-post-next]').click();
 await expect(page.locator('.wizard-summary-info')).toContainText('سيارة توضيحية للتجربة');
 await expect(page.locator('.wizard-summary-info')).toContainText('65,000');
 await page.locator('[data-post-preview]').click();
 await expect(page.getByRole('dialog')).toContainText('لم يُنشر للعامة');
});
test('V101 logo and all independent SVG illustrations exist',async({request})=>{
 for(const p of ['index.html','styles.css','app.js','assets/bag.svg','assets/hero-car.svg','assets/shop.svg','assets/sofa.svg','assets/laptop.svg','assets/phone.svg']){
  const r=await request.get('/v101/'+p);
  expect(r.status(),p).toBe(200);
 }
});
