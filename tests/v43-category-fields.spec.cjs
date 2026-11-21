const {test,expect}=require('@playwright/test');
async function openDraft(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// offline V43 test'}));
 await page.goto('/index.html');
 await page.evaluate(async()=>{
  window.sooqakCloud={
   loadPrivateProfile:async()=>({city:'الجبيل'}),
   hasAcceptedPledge:async()=>true,
   getAccountDraft:async()=>({}),
   ensureAccount:async()=>({id:'00000000-0000-4000-8000-000000000111'}),
   saveListing:async data=>{window.__V43_SAVED_DATA=data;return '00000000-0000-4000-8000-000000000099';},
   saveListingContact:async()=>true,deleteAccountDraft:async()=>true,fetchListings:async()=>[],getUser:()=>null
  };
  state.account={id:'11111111-1111-4111-8111-111111111111',name:'اختبار فقط',email:'local@invalid.example'};
  state.cloudPledgeAcceptedAt=true;
  await openPosting();
 });
 await expect(page.locator('#adForm')).toBeVisible();
}
test('V43 custom form fields follow category without exposing irrelevant specs',async({page})=>{
 await openDraft(page);
 await expect(page.locator('[name="spec_make"]')).toBeVisible();
 await expect(page.locator('[name="spec_mileage"]')).toBeVisible();
 await page.locator('#adForm [name="category"]').selectOption('عقارات');
 await expect(page.locator('[name="spec_property"]')).toBeVisible();
 await expect(page.locator('[name="spec_area"]')).toBeVisible();
 await expect(page.locator('[name="spec_make"]')).toHaveCount(0);
});
test('V43 specs are saved in an existing description field and can be restored',async({page})=>{
 await openDraft(page);
 await page.locator('#adForm [name="title"]').fill('سيارة للاختبار فقط');
 await page.locator('#adForm [name="description"]').fill('سيارة للاختبار وبيانات تجريبية غير حقيقية');
 await page.locator('#adForm [name="price"]').fill('20000');
 await page.locator('#adForm [name="spec_make"]').fill('تويوتا');
 await page.locator('#adForm [name="spec_year"]').fill('2021');
 await page.locator('#adForm button[type="submit"]').click();
 const saved=await page.evaluate(()=>window.__V43_SAVED_DATA);
 expect(saved.description).toContain('الماركة: تويوتا');
 expect(saved.description).toContain('سنة الصنع: 2021');
 expect(saved).not.toHaveProperty('attributes');
 const parsed=await page.evaluate(()=>window.SOOQAK_CATEGORY_FIELDS.extract(window.__V43_SAVED_DATA.description,'سيارات'));
 expect(parsed.body).toBe('سيارة للاختبار وبيانات تجريبية غير حقيقية');
 expect(parsed.attributes).toMatchObject({make:'تويوتا',year:'2021'});
});
