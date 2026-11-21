const {test,expect}=require('@playwright/test');
async function open(page){
 await page.route('**/cloud.js',r=>r.fulfill({status:200,contentType:'text/javascript',body:'// V46 offline'}));
 await page.goto('/index.html');
 await page.evaluate(async()=>{
  window.sooqakCloud={loadPrivateProfile:async()=>({city:'الجبيل'}),getAccountDraft:async()=>({}),hasAcceptedPledge:async()=>true};
  state.account={id:'11111111-1111-4111-8111-111111111111',name:'اختبار',email:'offline@invalid.example'};
  state.cloudPledgeAcceptedAt=true;
  await openPosting();
 });
}
test('V46 guided posting displays four navigable stages and focuses target input',async({page})=>{
 await open(page);
 await expect(page.locator('#sooqakPostSteps [data-post-step]')).toHaveCount(4);
 await page.locator('[data-post-step="3"]').click();
 await expect(page.locator('#adForm [name="description"]')).toBeFocused();
 await page.locator('[data-post-step="1"]').click();
 await expect(page.locator('#adForm [name="title"]')).toBeFocused();
});
test('V46 posting step readiness updates without hiding existing fields',async({page})=>{
 await open(page);
 await expect(page.locator('#sooqakPostProgress')).toContainText('من 4 خطوات');
 await expect(page.locator('#adForm [name="description"]')).toBeVisible();
 await page.locator('#adForm [name="title"]').fill('إعلان تجريبي');
 await page.locator('#adForm [name="description"]').fill('وصف صالح للتجربة بدون بيانات حقيقية');
 await page.locator('#adForm [name="price"]').fill('500');
 await expect(page.locator('#sooqakPostProgress')).toContainText('4 من 4');
});
