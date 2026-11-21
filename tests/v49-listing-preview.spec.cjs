const {test,expect}=require('@playwright/test');
async function start(page){
 await page.route('**/cloud.js',r=>r.fulfill({status:200,contentType:'text/javascript',body:'// V49 offline'}));
 await page.goto('/index.html');
 await page.evaluate(async()=>{
  window.__V49_WRITES=0;
  window.sooqakCloud={loadPrivateProfile:async()=>({city:'الجبيل'}),getAccountDraft:async()=>({}),hasAcceptedPledge:async()=>true,saveAccountDraft:async()=>true,saveListing:async()=>{window.__V49_WRITES++}};
  state.account={id:'11111111-1111-4111-8111-111111111111',email:'test@invalid.example',name:'اختبار'};
  state.cloudPledgeAcceptedAt=true;
  await openPosting();
 });
}
test('V49 preview shows current information but never publishes',async({page})=>{
 await start(page);
 await page.locator('[name="title"]').fill('سيارة تجريبية معاينة');
 await page.locator('#adForm [name="description"]').fill('وصف صحيح من تجربة محلية فقط');
 await page.locator('[name="price"]').fill('27000');
 await page.locator('#previewAdButton').click();
 await expect(page.locator('#sooqakAdPreview')).toBeVisible();
 await expect(page.locator('#sooqakAdPreview')).toContainText('سيارة تجريبية معاينة');
 await expect(page.locator('#sooqakAdPreview')).toContainText('27');
 expect(await page.evaluate(()=>window.__V49_WRITES)).toBe(0);
 await expect(page.locator('#adForm')).toBeVisible();
});
test('V49 suspicious title is rendered as text, never parsed as markup',async({page})=>{
 await start(page);
 const literal='<img src=x onerror=alert(1)> إعلان تجريبي';
 await page.locator('[name="title"]').fill(literal);
 await page.locator('#previewAdButton').click();
 await expect(page.locator('#sooqakAdPreview h4')).toHaveText(literal);
 await expect(page.locator('#sooqakAdPreview img')).toHaveCount(0);
});
