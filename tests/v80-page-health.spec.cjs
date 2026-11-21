const {test,expect}=require('@playwright/test');

// Count failures without persisting messages, stack traces or visitor activity.
for(const path of ['/index.html','/services.html','/store.html','/service-detail.html']){
 test('V80 local page health '+path,async({page})=>{
  let errors=0;
  page.on('pageerror',()=>errors++);
  await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({
   contentType:'text/javascript',
   body:`export function createClient(){
    const q=new Proxy({},{get:(_,key)=>key==='then'?(ok)=>Promise.resolve({data:[],count:0}).then(ok):()=>q});
    return {from:()=>q,auth:{getUser:async()=>({data:{user:null}}),onAuthStateChange:()=>({})}};
   }`
  }));
  await page.route('**/cloud.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
  const response=await page.goto(path);
  expect(response.status()).toBe(200);
  if(path==='/services.html')await expect(page.locator('#count')).toContainText('عرض');
  if(path==='/store.html')await expect(page.locator('#summary')).toContainText('رابط');
  if(path==='/service-detail.html')await expect(page.locator('#detail')).toContainText('رابط');
  if(path==='/index.html')await expect(page.locator('#categoryCards button').first()).toBeVisible();
  expect(errors).toBe(0);
 });
}
