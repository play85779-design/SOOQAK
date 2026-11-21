const {test,expect}=require('@playwright/test');
async function setup(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V61 fixture'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{window.SOOQAK_CLOUD_ENABLED=false;reset()});
}
test('V61 unread cloud conversations appear first with accurate summary',async({page})=>{
 await setup(page);
 await page.evaluate(async()=>{
  window.SOOQAK_CLOUD_ENABLED=true;
  state.account={id:'user-me',email:'me@example.invalid',name:'المستخدم'};
  window.sooqakCloud={
   listConversations:async()=>[
    {id:'recent-read',listing_id:'demo-1',buyer_id:'user-me',created_at:'2026-11-21T13:00:00Z'},
    {id:'older-unread',listing_id:'demo-2',buyer_id:'user-me',created_at:'2026-11-18T13:00:00Z'},
    {id:'newer-unread',listing_id:'demo-3',buyer_id:'user-me',created_at:'2026-11-19T13:00:00Z'}
   ],
   unreadSummary:async()=>({conversations:[{id:'older-unread',unread:1},{id:'newer-unread',unread:2}]})
  };
  await openCloudChats();
 });
 await expect(page.locator('#sooqakInboxSummary')).toContainText('3 رسالة غير مقروءة');
 const order=await page.locator('#modalContent [data-chat-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.chatId));
 expect(order).toEqual(['newer-unread','older-unread','recent-read']);
 await expect(page.locator('#modalContent [role="listitem"]')).toHaveCount(3);
 await expect(page.locator('#modalContent [data-chat-id]')).toHaveCount(3);
});
test('V61 late inbox response does not reveal old-account conversations',async({page})=>{
 await setup(page);
 const data=await page.evaluate(async()=>{
  window.SOOQAK_CLOUD_ENABLED=true;
  state.account={id:'account-one',email:'one@example.invalid'};
  let resolveRows;const pendingRows=new Promise(resolve=>resolveRows=resolve);
  window.sooqakCloud={listConversations:()=>pendingRows,unreadSummary:async()=>({conversations:[]})};
  const load=openCloudChats();
  state.account={id:'account-two',email:'two@example.invalid'};
  resolveRows([{id:'private-old-account',listing_id:'demo-1',buyer_id:'account-one',created_at:'2026-11-21T13:00:00Z'}]);
  await load;
  return {modalVisible:!document.getElementById('modalBackdrop').hidden,oldPrivate:document.body.textContent.includes('private-old-account')};
 });
 expect(data).toEqual({modalVisible:false,oldPrivate:false});
});
test('V61 late message response after account switch never opens old-account chat',async({page})=>{
 await setup(page);
 const visible=await page.evaluate(async()=>{
  window.SOOQAK_CLOUD_ENABLED=true;
  state.account={id:'account-one',email:'one@example.invalid'};
  let resolveMsgs;const messages=new Promise(r=>resolveMsgs=r);
  window.sooqakCloud={
   listMessages:()=>messages,
   getConversationBlockStatus:async()=>({blocked:false,blockedByMe:false}),
   isConversationMuted:async()=>false
  };
  const loading=showCloudConversation({id:'v61-chat',listing_id:'demo-1'});
  state.account={id:'account-two',email:'two@example.invalid'};
  resolveMsgs([{id:'private-message',sender_id:'account-one',body:'private',created_at:'2026-11-21T13:00:00Z'}]);
  await loading;
  return !document.getElementById('modalBackdrop').hidden;
 });
 expect(visible).toBe(false);
});
