const {test,expect} = require('@playwright/test');

async function mockOwnerClient(page, {user=null, allowed=false, fail=false, delayed=false} = {}) {
  const body = [
    'export function createClient() {',
    '  let onChange=()=>{};',
    '  window.__ownerRpcCalls=0;',
    '  window.__ownerRpcStarted=false;',
    '  window.__changeSession=(user)=>onChange("SIGNED_OUT", {user});',
    '  return {',
    '    auth:{',
    '      getUser:async()=>({data:{user:' + JSON.stringify(user) + '}}),',
    '      onAuthStateChange:(cb)=>{onChange=cb;return {data:{subscription:{unsubscribe(){}}}};}',
    '    },',
    '    rpc:async(name)=>{',
    '      window.__ownerRpcCalls++; window.__ownerRpcStarted=true;',
    '      if(name!=="sooqak_is_owner")return {data:false,error:{message:"invalid role check"}};',
    delayed ? '      await new Promise(resolve=>{window.__finishOwnerRpc=resolve;});' : '',
    '      return {data:' + JSON.stringify(allowed) + ',error:' + (fail ? '{message:"not available"}' : 'null') + '};',
    '    }',
    '  };',
    '}'
  ].filter(Boolean).join('\n');
  await page.route('https://cdn.jsdelivr.net/**', route=>route.fulfill({contentType:'text/javascript',body}));
}

test('B09: signed-out visitors cannot view owner panel', async({page})=>{
  await mockOwnerClient(page);
  await page.goto('/owner-center.html');
  await expect(page.locator('#ownerStatus')).toContainText('الدخول محظور');
  await expect(page.locator('#ownerPanel')).toBeHidden();
  expect(await page.evaluate(()=>window.__ownerRpcCalls)).toBe(0);
});

test('B09: verified non-owners cannot view owner panel', async({page})=>{
  await mockOwnerClient(page,{user:{id:'other-account',email_confirmed_at:'2026-11-21'},allowed:false});
  await page.goto('/owner-center.html');
  await expect(page.locator('#ownerStatus')).toContainText('صلاحية المالك');
  await expect(page.locator('#ownerPanel')).toBeHidden();
});

test('B09: role server errors are denied, not treated as permission', async({page})=>{
  await mockOwnerClient(page,{user:{id:'owner-test',email_confirmed_at:'2026-11-21'},allowed:true,fail:true});
  await page.goto('/owner-center.html');
  await expect(page.locator('#ownerPanel')).toBeHidden();
  await expect(page.locator('#ownerStatus')).toContainText('غير متحق');
});

test('B09: verified owner sees unknown-source placeholders, never fake income', async({page})=>{
  await mockOwnerClient(page,{user:{id:'owner-test',email_confirmed_at:'2026-11-21'},allowed:true});
  await page.goto('/owner-center.html');
  await expect(page.locator('#ownerPanel')).toBeVisible();
  await expect(page.locator('[data-financial-value]')).toHaveCount(4);
  await expect(page.locator('[data-financial-value]')).toHaveText(['غير متحقق منه','غير متحقق منه','غير متحقق منه','غير متحقق منه']);
});

test('B09: switching accounts while role check is pending fails closed', async({page})=>{
  await mockOwnerClient(page,{user:{id:'owner-test',email_confirmed_at:'2026-11-21'},allowed:true,delayed:true});
  await page.goto('/owner-center.html');
  await expect.poll(()=>page.evaluate(()=>window.__ownerRpcStarted)).toBe(true);
  await page.evaluate(()=>window.__changeSession({id:'different-user'}));
  await page.evaluate(()=>window.__finishOwnerRpc());
  await expect(page.locator('#ownerPanel')).toBeHidden();
  await expect(page.locator('#ownerStatus')).toContainText('تغيرت الجلسة');
});
