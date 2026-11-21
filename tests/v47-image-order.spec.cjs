const {test,expect}=require('@playwright/test');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+nmqwAAAAASUVORK5CYII=','base64');
async function open(page){
 await page.route('**/cloud.js',r=>r.fulfill({status:200,contentType:'text/javascript',body:'// V47 offline'}));
 await page.goto('/index.html');
 await page.evaluate(async()=>{
  window.sooqakCloud={loadPrivateProfile:async()=>({city:'الجبيل'}),getAccountDraft:async()=>({}),hasAcceptedPledge:async()=>true};
  state.account={id:'11111111-1111-4111-8111-111111111111',name:'اختبار',email:'offline@invalid.example'};
  state.cloudPledgeAcceptedAt=true;
  await openPosting();
 });
}
test('V47 previews multiple images and retains user-selected reorder',async({page})=>{
 await open(page);
 await page.locator('#adImages').setInputFiles([
  {name:'first.png',mimeType:'image/png',buffer:png},
  {name:'second.png',mimeType:'image/png',buffer:png}
 ]);
 await expect(page.locator('.sooqak-new-photo')).toHaveCount(2);
 await page.locator('[data-new-photo-index="0"][data-new-photo-direction="1"]').click();
 const filenames=await page.evaluate(()=>document.getElementById('adImages').__sooqakSortedFiles.map(x=>x.name));
 expect(filenames).toEqual(['second.png','first.png']);
 await expect(page.locator('.sooqak-new-photo-name').first()).toContainText('second.png');
});
test('V47 rejects more than five new photos before upload',async({page})=>{
 await open(page);
 const files=Array.from({length:6},(_,i)=>({name:'p'+i+'.png',mimeType:'image/png',buffer:png}));
 await page.locator('#adImages').setInputFiles(files);
 await expect(page.locator('.sooqak-new-photo')).toHaveCount(0);
 const size=await page.evaluate(()=>document.getElementById('adImages').__sooqakSortedFiles.length);
 expect(size).toBe(0);
});
