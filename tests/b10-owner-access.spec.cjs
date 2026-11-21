const {test,expect}=require('@playwright/test');
// B10 browser *mock* tests; these are NOT a real Supabase RLS or production audit.
async function client(page,{user=null,allowed=false,authDelayed=false,authThrows=false,rpcThrows=false}={}) {
  const content=[
    'export function createClient(){',
    ' window.__b10Rpc=0;window.__b10ReadStarted=false;',
    ' let listener=()=>{};',
    ' window.__b10Session=(event,user)=>listener(event,{user});',
    ' return {auth:{',
    '  getUser:async()=>{window.__b10ReadStarted=true;',
    authDelayed?'   await new Promise(resolve=>window.__b10FinishAuth=resolve);':'',
    authThrows?'   throw new Error("synthetic auth failure");':'',
    '   return {data:{user:'+JSON.stringify(user)+'},error:null};},',
    '  onAuthStateChange:(cb)=>{listener=cb;return {data:{subscription:{unsubscribe(){}}}};}', 
    ' },',
    ' rpc:async(name)=>{window.__b10Rpc++;',
    rpcThrows?' throw new Error("synthetic rpc failure");':'',
    '  return {data:'+JSON.stringify(allowed)+',error:null};}',
    ' };',
    '}'
  ].filter(Boolean).join('\n');
  await page.route('https://cdn.jsdelivr.net/**',route=>route.fulfill({contentType:'text/javascript',body:content}));
}
const owner={id:'owner-fixture',email_confirmed_at:'2026-11-21T10:00:00Z'};
test('B10: logout before pending auth resolves does not allow stale owner response',async({page})=>{
  await client(page,{user:owner,allowed:true,authDelayed:true});
  await page.goto('/owner-center.html');
  await expect.poll(()=>page.evaluate(()=>window.__b10ReadStarted)).toBe(true);
  await page.evaluate(()=>window.__b10Session('SIGNED_OUT',null));
  await page.evaluate(()=>window.__b10FinishAuth());
  await expect(page.locator('#ownerPanel')).toBeHidden();
  await expect(page.locator('#ownerStatus')).toContainText('تغيرت الجلسة');
  expect(await page.evaluate(()=>window.__b10Rpc)).toBe(0);
});
test('B10: switching account before pending getUser response fails closed',async({page})=>{
  await client(page,{user:owner,allowed:true,authDelayed:true});
  await page.goto('/owner-center.html');
  await expect.poll(()=>page.evaluate(()=>window.__b10ReadStarted)).toBe(true);
  await page.evaluate(()=>window.__b10Session('SIGNED_IN',{id:'other-fixture',email_confirmed_at:'2026-11-21'}));
  await page.evaluate(()=>window.__b10FinishAuth());
  await expect(page.locator('#ownerPanel')).toBeHidden();
  expect(await page.evaluate(()=>window.__b10Rpc)).toBe(0);
});
test('B10: sign-out after owner panel unlock immediately hides content',async({page})=>{
  await client(page,{user:owner,allowed:true});
  await page.goto('/owner-center.html');
  await expect(page.locator('#ownerPanel')).toBeVisible();
  await page.evaluate(()=>window.__b10Session('SIGNED_OUT',null));
  await expect(page.locator('#ownerPanel')).toBeHidden();
});
test('B10: string "true" from server is not accepted as true permission',async({page})=>{
  await client(page,{user:owner,allowed:'true'});
  await page.goto('/owner-center.html');
  await expect(page.locator('#ownerPanel')).toBeHidden();
  await expect(page.locator('#ownerStatus')).toContainText('غير متحق');
});
test('B10: auth and RPC rejection both fail closed',async({page})=>{
  await client(page,{user:owner,allowed:true,authThrows:true});
  await page.goto('/owner-center.html');
  await expect(page.locator('#ownerStatus')).toContainText('تعذر التحقق');
  await expect(page.locator('#ownerPanel')).toBeHidden();
});
test('B10: unverified email cannot reach owner RPC',async({page})=>{
  await client(page,{user:{id:'owner-fixture',email_confirmed_at:null},allowed:true});
  await page.goto('/owner-center.html');
  await expect(page.locator('#ownerPanel')).toBeHidden();
  expect(await page.evaluate(()=>window.__b10Rpc)).toBe(0);
});
test('B10: role backend failure does not disclose financial or owner panel',async({page})=>{
  await client(page,{user:owner,allowed:true,rpcThrows:true});
  await page.goto('/owner-center.html');
  await expect(page.locator('#ownerStatus')).toContainText('تعذر التحقق');
  await expect(page.locator('#ownerPanel')).toBeHidden();
  await expect(page.locator('[data-financial-value]')).toHaveText(
    ['غير متحقق منه','غير متحقق منه','غير متحقق منه','غير متحقق منه']);
});
