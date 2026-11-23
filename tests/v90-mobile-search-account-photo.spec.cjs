const { test, expect } = require('@playwright/test');

// Browser-only UX regression: no real Supabase users, emails, payments, or writes.
async function openOffline(page,url='/index.html'){
  await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// offline UX fixture'}));
  await page.goto(url,{waitUntil:'domcontentloaded'});
}

test('typing and submitting an Arabic search makes matching ads immediately accessible',async({page})=>{
  await openOffline(page);
  await page.locator('#searchInput').fill('أرض');
  await expect(page.locator('body')).toHaveClass(/sooqak-search-active/);
  await expect(page.locator('.hero')).toBeHidden();
  await page.locator('#searchButton').click();
  await expect(page.locator('#resultsTitle')).toBeVisible();
  await expect.poll(()=>page.locator('.market-section').evaluate(el=>Math.round(el.getBoundingClientRect().top))).toBeLessThan(250);
  await page.locator('#searchInput').fill('');
  await expect(page.locator('.hero')).toBeVisible();
});

test('enter key submits search as well as clicking Search',async({page})=>{
  await openOffline(page);
  await page.locator('#searchInput').fill('أرض');
  await page.locator('#searchInput').press('Enter');
  await expect(page.locator('#resultsTitle')).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/sooqak-search-active/);
});

test('the golden س opens account and brand label still returns home',async({page})=>{
  await openOffline(page);
  await expect(page.locator('#brandAccountButton')).toHaveAttribute('aria-label','حسابي وإعداداتي');
  await page.locator('#brandAccountButton').click();
  await expect(page.locator('#modalTitle')).toHaveText('حسابي');
  await expect(page.locator('#modalContent')).toContainText('تصفح الإعلانات دون تسجيل');
  await page.locator('#modalClose').click();
  await page.locator('#searchInput').fill('أرض');
  await page.locator('#homeLink').click();
  await expect(page.locator('#searchInput')).toHaveValue('');
});

test('anonymous favorites are stored on device without a raw database error',async({page})=>{
  await openOffline(page);
  await expect(page.locator('[data-fav]').first()).toBeVisible();
  await page.locator('[data-fav]').first().click();
  await expect(page.locator('#toast')).toContainText('على جهازك');
  await expect(page.locator('#toast')).not.toContainText('permission denied');
});

test('a rejected remote favorite clearly warns that only local selection succeeded',async({page})=>{
  await openOffline(page);
  await page.evaluate(async()=>{
    state.account={id:'11111111-1111-4111-8111-111111111111',name:'اختبار',email:'test@example.invalid'};
    window.sooqakCloud={setFavorite:async()=>{const e=new Error('permission denied for table sooqak_favorites');e.code='42501';throw e;}};
    await toggleFav('00000000-0000-4000-8000-000000000099');
  });
  await expect(page.locator('#toast')).toContainText('على هذا الجهاز فقط');
  await expect(page.locator('#toast')).not.toContainText('sooqak_favorites');
});

test('photo step offers both the native camera and gallery without paid AI',async({page})=>{
  await openOffline(page);
  await page.evaluate(async()=>{
    state.account={id:'11111111-1111-4111-8111-111111111111',name:'اختبار',email:'test@example.invalid'};
    state.cloudPledgeAcceptedAt=true;
    window.sooqakCloud={loadPrivateProfile:async()=>({city:'الجبيل'}),hasAcceptedPledge:async()=>true,getAccountDraft:async()=>({})};
    await openPosting();
  });
  await expect(page.locator('#openCamera')).toContainText('صوّر الآن');
  await expect(page.locator('#openGallery')).toContainText('الاستوديو');
  await expect(page.locator('#adCamera')).toHaveAttribute('capture','environment');
  await expect(page.locator('#sooqakSuggestCopy')).toContainText('أكتب وصفًا أجمل');
  await page.locator('#adCamera').setInputFiles({name:'camera.jpg',mimeType:'image/jpeg',buffer:Buffer.from([0xff,0xd8,0xff,0xd9])});
  await expect(page.locator('#newPhotoPreview')).toContainText('camera.jpg');
  const count=await page.locator('#adImages').evaluate(el=>el.files.length);
  expect(count).toBe(1);
});

test('legacy recovery callback goes directly to dedicated Arabic password-reset page',async({page})=>{
  // Existing emailed callbacks target /index.html. Their fragments must survive
  // the same-origin redirect until the Auth SDK on the reset page can consume them.
  await openOffline(page,'/index.html#type=recovery&access_token=DO_NOT_USE');
  await expect.poll(()=>page.url()).toContain('/reset-password.html#type=recovery&access_token=DO_NOT_USE');
  await expect(page.locator('h1')).toHaveText('تعيين كلمة مرور جديدة');
  await expect(page.locator('#recoveryForm')).toBeHidden();
});
