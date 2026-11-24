const {test,expect}=require('@playwright/test');
for(const v of [{name:'phone',width:390,height:844},{name:'foldopen',width:790,height:950},{name:'desktop',width:1180,height:810}]){
 test('V100 capture browser layout '+v.name,async({page})=>{
  await page.setViewportSize({width:v.width,height:v.height});
  await page.goto('/v100/index.html#home',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.product-card').first()).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  const rects=await page.evaluate(()=>Object.fromEntries(['.mobile-header','.hero-banner','.category-strip','.shop-strip','.product-grid'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return[s,{top:r.top,height:r.height,bottom:r.bottom,width:r.width}]})));
  console.log('V100_RECTS_'+v.name+':'+JSON.stringify(rects));
  const shot=await page.screenshot({type:'jpeg',quality:56,fullPage:false});
  console.log('V100_SCREEN_'+v.name+':'+shot.toString('base64'));
 });
}
