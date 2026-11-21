const {test,expect}=require('@playwright/test');

test('private command view distinguishes zero, missing data and denied access',async({page})=>{
 await page.route('**/cloud.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
 await page.goto('/index.html');
 await page.evaluate(async()=>{
  state.account={id:'fixture'};
  window.sooqakCloud={ownerCommandSnapshot:async()=>({scopes:['finance'],metrics:[{scope:'finance',metric:'cash',value:0,source:'كشف تجريبي',observed_at:'2026-01-01'}]})};
  await openOwnerCommand();
 });
 await expect(page.locator('#modalContent')).toContainText('0 · كشف تجريبي');
 await expect(page.locator('#modalContent')).toContainText('غير متاح');
 await expect(page.locator('#modalContent')).not.toContainText('النشطون اليوم');
 await page.evaluate(async()=>{
  window.sooqakCloud.ownerCommandSnapshot=async()=>{throw {code:'42501'}};
  await openOwnerCommand();
 });
 await expect(page.locator('#modalContent')).toContainText('لا يملك صلاحية');
 await expect(page.locator('#modalContent')).not.toContainText('كشف تجريبي');
});

test('email provider failure cannot trigger immediate repeated sends; invalid photo batch makes no storage calls',async({page})=>{
 await page.route('**/v91-fixture.html',r=>r.fulfill({contentType:'text/html',body:'<script>window.SOOQAK_CLOUD_ENABLED=true;window.SOOQAK_SUPABASE={};window.emailCalls=0;window.dbCalls=0</script><script type="module" src="/cloud.js"></script>'}));
 await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:`
 export function createClient(){return {auth:{
  onAuthStateChange:()=>{},getUser:async()=>({data:{user:{id:'fixture',email_confirmed_at:'now'}}}),
  signInWithOtp:async()=>{window.emailCalls++;return {error:new Error('offline')}}
 },from:()=>{window.dbCalls++;throw Error('unexpected database access')}}}
 `}));
 await page.goto('/v91-fixture.html');
 await page.waitForFunction(()=>window.sooqakCloud?.getUser());
 const result=await page.evaluate(async()=>{
  const api=window.sooqakCloud;
  const sends=await Promise.allSettled(Array.from({length:4},()=>api.signInEmail('test@example.invalid')));
  const batch=await Promise.allSettled([api.uploadPhotos('fixture',[new Blob(['photo'],{type:'image/jpeg'}),new Blob(['text'],{type:'text/plain'})])]);
  return [sends.map(x=>x.status),emailCalls,dbCalls,batch[0].status];
 });
 expect(result).toEqual([Array(4).fill('rejected'),1,0,'rejected']);
});
