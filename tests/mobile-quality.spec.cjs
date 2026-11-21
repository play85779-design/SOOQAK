const {test,expect}=require('@playwright/test');

for(const [width,height] of [[320,700],[390,844],[768,1024],[1280,900]]){
 test('homepage avoids document horizontal overflow at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height});
  await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',r=>r.abort());
  await page.goto('/index.html',{waitUntil:'domcontentloaded'});
  const actual=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,page:document.documentElement.scrollWidth}));
  expect(actual.page).toBeLessThanOrEqual(actual.viewport+2);
 });
}
for(const path of ['/services.html','/service-detail.html','/pricing.html']){
 test(path+' avoids document horizontal overflow at 320px',async({page})=>{
  await page.setViewportSize({width:320,height:700});
  await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',r=>r.abort());
  await page.goto(path,{waitUntil:'domcontentloaded'});
  const actual=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,page:document.documentElement.scrollWidth}));
  expect(actual.page).toBeLessThanOrEqual(actual.viewport+2);
 });
}
test('login modal closes on Escape and returns keyboard focus',async({page})=>{
 await page.goto('/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('#signupButton').focus();
 await page.locator('#signupButton').press('Enter');
 await expect(page.locator('#cloudLoginForm')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('#modalBackdrop')).toBeHidden();
 await expect(page.locator('#signupButton')).toBeFocused();
});
