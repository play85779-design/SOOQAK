const { test, expect } = require('@playwright/test');

// Inert localhost tests: no actual Supabase requests, messages, or user creation.
test('auth return URL always points at this site index, without query or fragments',async({page})=>{
  await page.goto('/index.html',{waitUntil:'domcontentloaded'});
  const actual=await page.evaluate(async()=>{
    const {sooqakAuthReturnURL}=await import('/auth-return.mjs');
    return [
      sooqakAuthReturnURL('https://preview.example.org/index.html?auth=signup#access_token=example'),
      sooqakAuthReturnURL('https://preview.example.org/services.html?kind=workshop'),
      sooqakAuthReturnURL('http://127.0.0.1:4173/index.html?auth=login')
    ];
  });
  expect(actual).toEqual([
    'https://preview.example.org/index.html',
    'https://preview.example.org/index.html',
    'http://127.0.0.1:4173/index.html'
  ]);
});
test('refuse insecure origins rather than email links pointing to wrong places',async({page})=>{
  await page.goto('/index.html',{waitUntil:'domcontentloaded'});
  const result=await page.evaluate(async()=>{
    const {sooqakAuthReturnURL}=await import('/auth-return.mjs');
    return ['file:///tmp/index.html','http://example.com/index.html'].map(url=>{
      try{sooqakAuthReturnURL(url);return false}catch{return true}
    });
  });
  expect(result).toEqual([true,true]);
});
async function mockedAuth(page){
  await page.addInitScript(()=>{window.__SOOQAK_AUTH_TEST_CALLS=[]});
  // Stub the entire auth SDK at import time. No external signup/email calls.
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',async route=>{
    const sdk=`const q=new Proxy({}, {get:(o,k)=>k==='then'?(ok,bad)=>Promise.resolve({data:[],error:null,count:0}).then(ok,bad):()=>q});
      export function createClient(){
        return {
          from:()=>q,
          auth:{
            getUser:async()=>window.__TEST_LOGGED_IN?({data:{user:{id:'11111111-1111-4111-8111-111111111111',email:'buyer@example.invalid',email_confirmed_at:'2026-11-20T00:00:00Z',user_metadata:{full_name:'مستخدم تجريبي'}}},error:null}):({data:{user:null},error:{name:'AuthSessionMissingError'}}),
            onAuthStateChange:(cb)=>{window.__TEST_AUTH_CALLBACK=cb;return {data:{subscription:{unsubscribe(){}}}}},
            signUp:async value=>{window.__SOOQAK_AUTH_TEST_CALLS.push({method:'signup',value});return window.__TEST_AUTH_SERVER_REJECTS?{data:null,error:{message:'Email address not authorized',code:'email_address_not_authorized'}}:{data:{session:null},error:null}},
            signInWithOtp:async value=>{window.__SOOQAK_AUTH_TEST_CALLS.push({method:'otp',value});return {data:{},error:null}},
            signInWithOAuth:async value=>{window.__SOOQAK_AUTH_TEST_CALLS.push({method:'google',value});return {data:{},error:null}},
            resetPasswordForEmail:async (email,options)=>{window.__SOOQAK_AUTH_TEST_CALLS.push({method:'recovery-email',email,options});return {data:{},error:null}},
            updateUser:async value=>{window.__SOOQAK_AUTH_TEST_CALLS.push({method:'update-password',value});return {data:{user:null},error:null}},
            signInWithPassword:async()=>({data:{session:null},error:null})
          }
        };
      }`;
    await route.fulfill({status:200,contentType:'text/javascript',body:sdk});
  });
  await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',async route=>{
    if(route.request().url().includes('/auth/v1/settings')){
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({external:{google:false},disable_signup:false})});
    }else{await route.abort()}
  });
}
test('signup asks Supabase to return to index, not a search engine',async({page})=>{
  await mockedAuth(page);
  await page.goto('/index.html?auth=signup',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#cloudLoginForm')).toBeVisible();
  await page.locator('#authDisplayName').fill('Test Account');
  await page.locator('#authEmail').fill('nonexistent@example.invalid');
  await page.locator('#authPassword').fill('not-a-real-password-12345');
  await page.locator('#authEmailSubmit').click();
  await expect.poll(()=>page.evaluate(()=>window.__SOOQAK_AUTH_TEST_CALLS.length)).toBe(1);
  const payload=await page.evaluate(()=>window.__SOOQAK_AUTH_TEST_CALLS[0]);
  expect(payload.method).toBe('signup');
  expect(payload.value.options.emailRedirectTo).toBe('http://127.0.0.1:4173/index.html');
  expect(payload.value.options.emailRedirectTo).not.toMatch(/[?#]/);
});
test('magic email link uses the same reliable on-site callback',async({page})=>{
  await mockedAuth(page);
  await page.goto('/index.html?auth=login',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#cloudLoginForm')).toBeVisible();
  await page.locator('#authMethodLink').click();
  await page.locator('#authEmail').fill('nonexistent@example.invalid');
  await page.locator('#authEmailSubmit').click();
  await expect.poll(()=>page.evaluate(()=>window.__SOOQAK_AUTH_TEST_CALLS.length)).toBe(1);
  const payload=await page.evaluate(()=>window.__SOOQAK_AUTH_TEST_CALLS[0]);
  expect(payload.method).toBe('otp');
  expect(payload.value.options.emailRedirectTo).toBe('http://127.0.0.1:4173/index.html');
  expect(payload.value.options.shouldCreateUser).toBe(false);
});

test('forgot-password form sends on-site callback without real email',async({page})=>{
  await mockedAuth(page);
  await page.goto('/index.html?auth=login',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#cloudLoginForm')).toBeVisible();
  await page.locator('#authForgotPassword').click();
  await expect(page.locator('#sooqakForgotForm')).toBeVisible();
  await page.locator('#forgotEmail').fill('example@example.invalid');
  await page.locator('#sooqakForgotSubmit').click();
  await expect.poll(()=>page.evaluate(()=>window.__SOOQAK_AUTH_TEST_CALLS.length)).toBe(1);
  const payload=await page.evaluate(()=>window.__SOOQAK_AUTH_TEST_CALLS[0]);
  expect(payload.method).toBe('recovery-email');
  expect(payload.options.redirectTo).toBe('http://127.0.0.1:4173/index.html');
  await expect(page.locator('#modalTitle')).toContainText('تحقق من بريدك');
});
test('recovery callback prompts for a new password and updates it locally',async({page})=>{
  await page.addInitScript(()=>{window.__TEST_LOGGED_IN=true});
  await mockedAuth(page);
  await page.goto('/index.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#profileButton')).toBeVisible();
  await page.evaluate(()=>window.__TEST_AUTH_CALLBACK('PASSWORD_RECOVERY',{}));
  await expect(page.locator('#modalTitle')).toContainText('تعيين كلمة مرور جديدة');
  await page.locator('#passwordNew').fill('very-strong-passphrase-1234');
  await page.locator('#passwordConfirm').fill('very-strong-passphrase-1234');
  await page.locator('#setPasswordSubmit').click();
  await expect.poll(()=>page.evaluate(()=>window.__SOOQAK_AUTH_TEST_CALLS.some(x=>x.method==='update-password'))).toBe(true);
  const payload=await page.evaluate(()=>window.__SOOQAK_AUTH_TEST_CALLS.find(x=>x.method==='update-password'));
  expect(payload.value.password).toBe('very-strong-passphrase-1234');
});

test('sign up warns that the shared SMTP sender cannot guarantee delivery',async({page})=>{
 await mockedAuth(page);
 await page.goto('/index.html?auth=signup',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#authMailWarning')).toContainText('SMTP');
 await page.locator('#authDisplayName').fill('Test User');
 await page.locator('#authEmail').fill('nonexistent@example.invalid');
 await page.locator('#authPassword').fill('demoPassword1234');
 await page.locator('#authEmailSubmit').click();
 await expect(page.locator('#modalTitle')).toContainText('تحقق من بريدك');
 await expect(page.locator('#modalContent')).toContainText('ليس إثباتًا للإرسال أو وصول الرسالة');
});
test('password login remains available without SMTP configuration',async({page})=>{
 await mockedAuth(page);
 await page.goto('/index.html?auth=login',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#authMailWarning')).toHaveCount(0);
 await expect(page.locator('#authPassword')).toBeVisible();
});
test('unauthorized recipient displays meaningful SMTP guidance without pretending mail arrived',async({page})=>{
 await mockedAuth(page);
 await page.goto('/index.html?auth=signup',{waitUntil:'domcontentloaded'});
 await page.locator('#authDisplayName').fill('Test User');
 await page.locator('#authEmail').fill('nonexistent@example.invalid');
 await page.locator('#authPassword').fill('demoPassword1234');
 await page.evaluate(()=>{window.__TEST_AUTH_SERVER_REJECTS=true});
 await page.locator('#authEmailSubmit').click();
 await expect(page.locator('#toast')).toContainText('SMTP');
 await expect(page.locator('#cloudLoginForm')).toBeVisible();
 await expect(page.locator('#authEmailSubmit')).toBeEnabled();
});
