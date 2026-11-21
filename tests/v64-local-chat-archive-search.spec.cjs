const {test,expect}=require('@playwright/test');
async function setup(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V64 local inbox only'}));
 await page.goto('/index.html');
 await page.evaluate(async()=>{
  window.SOOQAK_CLOUD_ENABLED=true;
  state.account={id:'v64-user1',email:'one@example.invalid',name:'اختبار'};
  window.__v64Loads=0;
  window.sooqakCloud={
   listConversations:async()=>{window.__v64Loads++;return [
    {id:'v64-chat-car',listing_id:'demo-1',buyer_id:'v64-user1',created_at:'2026-11-21T12:00:00Z'},
    {id:'v64-chat-flat',listing_id:'demo-2',buyer_id:'v64-user1',created_at:'2026-11-20T12:00:00Z'}
   ]},
   unreadSummary:async()=>({conversations:[]})
  };
  await openCloudChats();
 });
}
test('V64 searches loaded chat titles on device without network calls',async({page})=>{
 await setup(page);
 await expect(page.locator('#sooqakInboxSearch')).toBeVisible();
 await page.locator('#sooqakInboxSearch').fill('سيارة');
 await expect(page.locator('#modalContent .small-card:visible')).toHaveCount(1);
 await expect(page.locator('#modalContent .small-card:visible')).toContainText('سيارة سيدان');
 await page.locator('#sooqakInboxSearch').fill('شقة');
 await expect(page.locator('#modalContent .small-card:visible')).toHaveCount(1);
 await expect(page.locator('#modalContent .small-card:visible')).toContainText('شقة للإيجار');
 expect(await page.evaluate(()=>window.__v64Loads)).toBe(1);
});
test('V64 archives and restores a conversation locally without deleting server data',async({page})=>{
 await setup(page);
 await page.locator('.small-card:has([data-chat-id="v64-chat-car"]) .sooqak-chat-archive-action').click();
 await expect(page.locator('.small-card:has([data-chat-id="v64-chat-car"])')).toBeHidden();
 await expect(page.locator('#modalContent .small-card:visible')).toHaveCount(1);
 await page.locator('#sooqakShowArchived').check();
 await expect(page.locator('.small-card:has([data-chat-id="v64-chat-car"])')).toBeVisible();
 await page.locator('.small-card:has([data-chat-id="v64-chat-car"]) .sooqak-chat-archive-action').click();
 await expect(page.locator('.small-card:has([data-chat-id="v64-chat-car"])')).toBeHidden();
 await page.locator('#sooqakShowArchived').uncheck();
 await expect(page.locator('#modalContent .small-card:visible')).toHaveCount(2);
 expect(await page.evaluate(()=>window.SOOQAK_INBOX_LOCAL.readArchive('v64-user1').size)).toBe(0);
});
test('V64 archives are isolated per account on the same browser',async({page})=>{
 await setup(page);
 await page.locator('.small-card:has([data-chat-id="v64-chat-car"]) .sooqak-chat-archive-action').click();
 await page.evaluate(async()=>{
  state.account={id:'v64-user2',email:'two@example.invalid'};
  await openCloudChats();
 });
 await expect(page.locator('.small-card:has([data-chat-id="v64-chat-car"])')).toBeVisible();
 const data=await page.evaluate(()=>({
  previous:[...window.SOOQAK_INBOX_LOCAL.readArchive('v64-user1')],
  current:[...window.SOOQAK_INBOX_LOCAL.readArchive('v64-user2')]
 }));
 expect(data).toEqual({previous:['v64-chat-car'],current:[]});
});
