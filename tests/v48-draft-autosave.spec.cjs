const {test,expect}=require('@playwright/test');
async function start(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V48 local fake backend'}));
 await page.goto('/index.html');
 await page.evaluate(async()=>{
   window.__V48_DRAFTS=[];
   window.sooqakCloud={loadPrivateProfile:async()=>({city:'الجبيل'}),getAccountDraft:async()=>({}),hasAcceptedPledge:async()=>true,saveAccountDraft:async(kind,draft)=>{window.__V48_DRAFTS.push({kind,draft});return true;}};
   state.account={id:'11111111-1111-4111-8111-111111111111',email:'test@invalid.example',name:'اختبار'};
   state.cloudPledgeAcceptedAt=true;
   await openPosting();
 });
}
test('V48 cloud draft autosaves text without phone or image data',async({page})=>{
 await start(page);
 await page.locator('#adForm [name="title"]').fill('إعلان مسودة محفوظة');
 await page.locator('#adForm [name="description"]').fill('وصف اختبار حفظ مسودة بدون بيانات حساسة');
 await page.locator('#adForm [name="whatsapp"]').fill('0555555555');
 await expect.poll(()=>page.evaluate(()=>window.__V48_DRAFTS.length),{timeout:9000}).toBeGreaterThan(0);
 const saved=await page.evaluate(()=>window.__V48_DRAFTS.at(-1));
 expect(saved.kind).toBe('personal');
 expect(saved.draft.title).toBe('إعلان مسودة محفوظة');
 expect(saved.draft.description).toContain('وصف اختبار');
 expect(saved.draft).not.toHaveProperty('whatsapp');
 expect(saved.draft).not.toHaveProperty('images');
 await expect(page.locator('#sooqakDraftStatus')).toContainText('حُفظت مسودتك تلقائيًا');
});
test('V48 closing the form cancels a pending autosave',async({page})=>{
 await start(page);
 await page.locator('#adForm [name="title"]').fill('مغلق قبل اكتمال الحفظ');
 await page.locator('#modalClose').click();
 await page.waitForTimeout(2300);
 expect(await page.evaluate(()=>window.__V48_DRAFTS.length)).toBe(0);
});
