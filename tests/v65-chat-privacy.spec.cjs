const {test,expect}=require('@playwright/test');

test('V65 repeated submit sends once and a late send cannot reopen a closed chat',async({page})=>{
 await page.route('**/cloud.js',route=>route.fulfill({contentType:'text/javascript',body:''}));
 await page.goto('/index.html');
 await page.evaluate(async()=>{
  state.account={id:'sender'};
  window.sent=0;
  window.sooqakCloud={
   listMessages:async()=>[],getConversationBlockStatus:async()=>({blocked:false}),
   isConversationMuted:async()=>false, markConversationRead:async()=>{},
   unreadSummary:async()=>({total:0}),
   sendMessage:()=>{window.sent++;return new Promise(resolve=>window.finishSend=resolve)}
  };
  await showCloudConversation({id:'chat-1'});
 });
 await page.locator('[name="message"]').fill('رسالة واحدة');
 await page.evaluate(()=>{
  const form=document.querySelector('#sooqakCloudMessageForm');
  form.requestSubmit();form.requestSubmit();
  closeModal();window.finishSend();
 });
 await expect(page.locator('#modalBackdrop')).toBeHidden();
 expect(await page.evaluate(()=>window.sent)).toBe(1);
});
