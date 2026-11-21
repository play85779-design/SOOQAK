const {test,expect}=require('@playwright/test');
async function setup(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V63 mocked messenger'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{window.SOOQAK_CLOUD_ENABLED=false;reset();state.account={id:'v63-me',email:'me@example.invalid'};sooqakUnreadBaseline=null});
}
test('V63 unread badge announces only increases after first baseline',async({page})=>{
 await setup(page);
 await page.evaluate(async()=>{
  let unread=2;
  window.sooqakCloud={unreadSummary:async()=>({total:unread,conversations:[]})};
  await refreshUnreadMessages(true);
  unread=3;
  await refreshUnreadMessages(true);
 });
 await expect(page.locator('#chatUnreadBadge')).toHaveText('3');
 await expect(page.locator('#toast')).toContainText('عندك 3 رسائل غير مقروءة');
 await expect(page.locator('#chatButton')).toHaveAttribute('aria-label',/3 رسالة/);
});
test('V63 out-of-order unread responses never roll back newer badge',async({page})=>{
 await setup(page);
 const stateAfter=await page.evaluate(async()=>{
  const resolvers=[];
  window.sooqakCloud={unreadSummary:()=>new Promise(resolve=>resolvers.push(resolve))};
  const first=refreshUnreadMessages(false);
  const second=refreshUnreadMessages(false);
  resolvers[1]({total:8,conversations:[]});await second;
  resolvers[0]({total:1,conversations:[]});await first;
  return {badge:document.getElementById('chatUnreadBadge').textContent,baseline:sooqakUnreadBaseline};
 });
 expect(stateAfter).toEqual({badge:'8',baseline:8});
});
test('V63 delayed reply after signout cannot show unread of former account',async({page})=>{
 await setup(page);
 const result=await page.evaluate(async()=>{
  let resolveRequest;
  window.sooqakCloud={unreadSummary:()=>new Promise(resolve=>resolveRequest=resolve)};
  const promise=refreshUnreadMessages(true);
  state.account=null;sooqakUnreadFetchSeq++;setChatUnreadBadge(0);sooqakUnreadBaseline=null;
  resolveRequest({total:9,conversations:[]});await promise;
  return {hidden:document.getElementById('chatUnreadBadge').hidden,baseline:sooqakUnreadBaseline};
 });
 expect(result).toEqual({hidden:true,baseline:null});
});
