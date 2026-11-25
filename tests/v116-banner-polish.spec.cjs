const {test,expect}=require('@playwright/test');
for(const width of [330,390,790,1180]){
 test('V116 banners keep equal heights and visible actions '+width,async({page})=>{
  await page.setViewportSize({width,height:940});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/v101/index.html#home');
  const sizes=[];
  for(let i=0;i<3;i++){
   await page.locator('[data-hero-slide="'+i+'"]').click();
   const hero=page.locator('.hero');
   const r=await hero.evaluate(e=>{const b=e.getBoundingClientRect(),c=e.querySelector('.cta').getBoundingClientRect();return {height:b.height,contained:c.top>=b.top-1&&c.bottom<=b.bottom+1&&c.left>=b.left-1&&c.right<=b.right+1}});
   sizes.push(r.height);expect(r.contained).toBeTruthy();
   await expect(page.locator('.hero-copy')).toHaveCSS('animation-name','none');
  }
  expect(Math.max(...sizes)-Math.min(...sizes)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
 });
}
test('V116 search placeholder uses readable contrast',async({page})=>{
 await page.goto('/v101/index.html#home');
 await expect.poll(()=>page.locator('#search input').evaluate(e=>getComputedStyle(e,'::placeholder').color)).toBe('rgb(89, 104, 95)');
});
