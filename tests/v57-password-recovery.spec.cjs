const {test,expect}=require('@playwright/test');
// Pure browser fixtures. No real Supabase accounts, tokens, emails or writes.
async function openMock(page,{event='PASSWORD_RECOVERY',url='/reset-password.html?type=recovery'}={}){
  await page.addInitScript(eventName=>{
    window.__v57Event=eventName;
    window.__v57Calls=[];
    window.__v57User={id:'11111111-1111-4111-8111-111111111111',email:'safe@example.invalid'};
  },event);
  const sdk=`export function createClient(){
    return {auth:{
      onAuthStateChange:cb=>{
        window.__v57Fire=cb;
        setTimeout(()=>cb(window.__v57Event,{user:window.__v57User,access_token:'synthetic-never-a-real-token'}),15);
        return {data:{subscription:{unsubscribe(){}}}};
      },
      getUser:async()=>({data:{user:window.__v57User},error:null}),
      updateUser:async attrs=>{window.__v57Calls.push({method:'updateUser',attrs});return {data:{user:window.__v57User},error:null}},
      signOut:async()=>{window.__v57Calls.push({method:'signOut'});return {error:null}}
    }};
  }`;
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',route=>
    route.fulfill({status:200,contentType:'text/javascript',body:sdk}));
  await page.goto(url,{waitUntil:'domcontentloaded'});
}
test('V57: Arabic recovery form unlocks only after server-verified recovery session',async({page})=>{
  await openMock(page,{url:'/reset-password.html#access_token=synthetic&type=recovery'});
  await expect(page.locator('#recoveryForm')).toBeVisible();
  await expect(page.locator('#recoveryEmail')).toHaveValue('safe@example.invalid');
  await expect(page.locator('#recoveryEmail')).toHaveAttribute('readonly','');
  await expect(page).toHaveURL(/\/reset-password\.html$/);
  await expect(page.locator('#recoveryStatus')).toContainText('تم التحقق');
});
test('V57: valid recovery changes password once then signs out and offers login',async({page})=>{
  await openMock(page);
  await expect(page.locator('#recoveryForm')).toBeVisible();
  await page.locator('#newPassword').fill('not-short-enough-1234');
  await page.locator('#confirmPassword').fill('not-short-enough-1234');
  await page.locator('#resetSave').click();
  await expect(page.locator('#recoverySuccess')).toBeVisible();
  const calls=await page.evaluate(()=>window.__v57Calls);
  expect(calls.map(x=>x.method)).toEqual(['updateUser','signOut']);
  expect(calls[0].attrs.password).toBe('not-short-enough-1234');
  await expect(page.locator('#recoveryForm')).toBeHidden();
  await expect(page.locator('#recoveryLogin')).toHaveAttribute('href','./index.html?auth=login');
});
test('V57: type=recovery alone or a regular signed-in event cannot authorize changing password',async({page})=>{
  await openMock(page,{event:'SIGNED_IN',url:'/reset-password.html?type=recovery'});
  await expect(page.locator('#recoveryForm')).toBeHidden();
  expect(await page.evaluate(()=>window.__v57Calls)).toEqual([]);
});
test('V57: mismatched passwords cannot reach Auth updateUser',async({page})=>{
  await openMock(page);
  await expect(page.locator('#recoveryForm')).toBeVisible();
  await page.locator('#newPassword').fill('a-really-strong-password');
  await page.locator('#confirmPassword').fill('another-strong-password');
  await page.locator('#resetSave').click();
  await expect(page.locator('#recoveryStatus')).toContainText('غير متطابقتين');
  expect(await page.evaluate(()=>window.__v57Calls)).toEqual([]);
});
test('V57: logout before form submission blocks a stale recovery session',async({page})=>{
  await openMock(page);
  await expect(page.locator('#recoveryForm')).toBeVisible();
  await page.evaluate(()=>window.__v57Fire('SIGNED_OUT',null));
  await expect(page.locator('#recoveryForm')).toBeHidden();
  expect(await page.evaluate(()=>window.__v57Calls)).toEqual([]);
});
test('V57: account switch before submit is rejected by fresh Auth getUser',async({page})=>{
  await openMock(page);
  await expect(page.locator('#recoveryForm')).toBeVisible();
  await page.locator('#newPassword').fill('a-safe-password-123');
  await page.locator('#confirmPassword').fill('a-safe-password-123');
  await page.evaluate(()=>{window.__v57User={id:'22222222-2222-4222-8222-222222222222',email:'other@example.invalid'}});
  await page.locator('#resetSave').click();
  await expect(page.locator('#recoveryForm')).toBeHidden();
  await expect(page.locator('#recoveryStatus')).toContainText('تغيرت الجلسة');
  expect(await page.evaluate(()=>window.__v57Calls)).toEqual([]);
});
test('V57: expired recovery link fails closed and does not import Auth',async({page})=>{
  await page.goto('/reset-password.html?error_code=otp_expired&error=access_denied',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#recoveryStatus')).toContainText('منتهي الصلاحية');
  await expect(page.locator('#recoveryForm')).toBeHidden();
  await expect(page).toHaveURL(/\/reset-password\.html$/);
});
