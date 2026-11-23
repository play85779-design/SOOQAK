const {test,expect}=require('@playwright/test');

/* V92 regression: real rendered CSS/layout, rather than a count of DOM nodes.
   Uses the site's existing demo records only. No accounts/payments/DB mutations. */
const sizes=[
 {name:'fold-closed',w:330,h:760},
 {name:'phone',w:390,h:844},
 {name:'fold-open',w:790,h:940},
 {name:'desktop',w:1180,h:800}
];
async function isolate(page){
 await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',route=>route.abort());
 await page.route('https://fonts.googleapis.com/**',route=>route.abort());
 await page.route('https://fonts.gstatic.com/**',route=>route.abort());
}
for(const v of sizes){
 test('V92 vivid responsive real page: '+v.name,async({page})=>{
  await page.setViewportSize({width:v.w,height:v.h});
  await isolate(page);
  await page.goto('/index.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#sooqakHeroTitle')).toContainText('في سوقك');
  await expect(page.locator('#listingGrid .listing-card').first()).toBeVisible();
  await expect(page.locator('.v92-stall-img')).toBeVisible();
  await expect(page.locator('.categories .category-card').first()).toBeVisible();
  const result=await page.evaluate(()=>{
   const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
   const hero=rect('.sooqak-hero-v68');
   const copy=rect('.sooqak-hero-v68 .hero-copy');
   const art=rect('.sooqak-hero-v68 .sooqak-store-art');
   const firstCard=rect('.listing-grid .listing-card');
   const img=document.querySelector('.v92-stall-img');
   const demo=document.querySelector('.listing-card[data-open="demo-1"] .listing-media');
   return {hero,copy,art,firstCard,overflow:document.documentElement.scrollWidth-window.innerWidth,
     artLoaded:img.complete&&img.naturalWidth>0,
     demoIllustration:demo?getComputedStyle(demo).backgroundImage:'none'};
  });
  expect(result.overflow,'horizontal scroll: '+v.name).toBeLessThanOrEqual(2);
  expect(result.copy.width,'copy too small: '+v.name).toBeGreaterThan(100);
  expect(result.art.width,'art too small: '+v.name).toBeGreaterThan(70);
  expect(result.copy.left,'copy overlaps illustrated area: '+v.name).toBeGreaterThanOrEqual(result.art.right-3);
  expect(result.artLoaded,'market stall artwork loaded: '+v.name).toBe(true);
  expect(result.demoIllustration).toContain('v92-example-car.svg');
  if(v.w<400){
   expect(result.hero.height,'too-tall mobile banner').toBeLessThan(340);
   expect(result.firstCard.top,'products pushed too far below fold').toBeLessThan(930);
   await expect(page.locator('.mobile-nav')).toBeVisible();
   await expect(page.locator('.mobile-nav .v92-icon')).toHaveCount(5);
  }else{
   expect(result.firstCard.top,'Fold/desktop must expose products early').toBeLessThan(850);
  }
  if(process.env.SOOQAK_V92_CAPTURE==='1'){
   const binary=await page.screenshot({type:'jpeg',quality:52,fullPage:false});
   console.log('SOOQAK_V92_IMAGE_'+v.name+':'+binary.toString('base64'));
  }
 });
}
test('preview safety remains accessible after compacting the warning',async({page})=>{
 await isolate(page);
 await page.goto('/index.html',{waitUntil:'domcontentloaded'});
 const banner=page.locator('body > .demo-banner:visible');
 const toggle=page.locator('body > .demo-banner:visible .v92-notice-toggle');
 await expect(toggle).toBeVisible();
 await expect(banner).toContainText('غير حقيقية');
 const before=await banner.evaluate(el=>el.getBoundingClientRect().height);
 await toggle.click();
 await expect(toggle).toHaveAttribute('aria-expanded','true');
 const after=await banner.evaluate(el=>el.getBoundingClientRect().height);
 expect(after).toBeGreaterThan(before);
});
test('merchant, listing and services retain working routes and refreshed style',async({page})=>{
 await isolate(page);
 for(const path of ['/store.html','/merchant-dashboard.html','/listing.html','/services.html','/service-detail.html']){
  await page.goto(path,{waitUntil:'domcontentloaded'});
  const sheets=await page.locator('link[rel="stylesheet"]').evaluateAll(xs=>xs.map(x=>x.getAttribute('href')));
  expect(sheets,path).toContain('./joyful-v92.css');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 }
});
