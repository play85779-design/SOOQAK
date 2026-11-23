const {test,expect}=require('@playwright/test');

// These tests deliberately run without a live Supabase session or live data writes.
async function offline(page){
  await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// offline test — no network auth'}));
  await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',route=>route.abort());
  await page.goto('/index.html',{waitUntil:'domcontentloaded'});
}

test('pressing search for أرض opens matching results rather than the services introduction',async({page})=>{
  await offline(page);
  await page.locator('#searchInput').fill('أرض');
  await page.locator('#searchButton').click();
  await expect(page.locator('body')).toHaveClass(/sooqak-search-active/);
  await expect(page.locator('.hero')).toBeHidden();
  await expect.poll(()=>page.evaluate(()=>window.scrollY),{timeout:6000}).toBeGreaterThan(100);
  await expect(page.locator('#resultsTitle')).toBeVisible();
});

test('golden S on the header opens My Account, and dialogs display SOOQAK branding',async({page})=>{
  await offline(page);
  await page.locator('#brandAccountButton').click();
  await expect(page.locator('#modalTitle')).toHaveText('حسابي');
  await expect(page.locator('.sooqak-modal-brand')).toContainText('سوقك');
  await expect(page.locator('.sooqak-modal-brand')).toContainText('SOOQAK');
});

test('anonymous visitors can favorite a sample locally without server permission errors',async({page})=>{
  await offline(page);
  await page.locator('[data-fav="demo-1"]').first().click();
  await expect(page.locator('#toast')).toContainText('على جهازك');
  await expect(page.locator('[data-fav="demo-1"]').first()).toHaveAttribute('aria-pressed','true');
});

test('new listing provides mobile camera and gallery buttons and combines a captured image',async({page})=>{
  await offline(page);
  await page.evaluate(async()=>{
    state.account={id:'11111111-1111-4111-8111-111111111111',email:'owner@example.invalid',name:'تجربة سوقك'};
    state.cloudPledgeAcceptedAt=true;
    await openPosting();
  });
  await expect(page.locator('#openCamera')).toBeVisible();
  await expect(page.locator('#openGallery')).toBeVisible();
  await expect(page.locator('#adCamera')).toHaveAttribute('capture','environment');
  await expect(page.locator('#sooqakSuggestCopy')).toContainText('ساعدني أكتب وصفًا');
  const tinyPng=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/hZsAAAAASUVORK5CYII=','base64');
  await page.locator('#adCamera').setInputFiles({name:'picture.png',mimeType:'image/png',buffer:tinyPng});
  await expect.poll(()=>page.evaluate(()=>document.getElementById('adImages')?.files?.length||0)).toBe(1);
  await expect(page.locator('#newPhotoPreview .sooqak-new-photo')).toHaveCount(1);
});

test('invalid password-recovery return reports a safe Arabic error instead of a raw link token',async({page})=>{
  await offline(page);
  await page.evaluate(()=>{
    history.replaceState(null,'','/index.html?error=access_denied&error_description=expired');
    showAuthRedirectFailure();
  });
  await expect(page.locator('#modalTitle')).toContainText('رابط الدخول غير صالح');
  await expect(page).not.toHaveURL(/error_description=/);
});
