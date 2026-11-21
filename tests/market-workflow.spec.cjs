const {test,expect}=require('@playwright/test');

// Only a local fake service responds. No live Supabase API or email is contacted.
const fakeCloud=`
const uid='11111111-1111-4111-8111-111111111111';
const other='22222222-2222-4222-8222-222222222222';
const me={id:uid,email:'buyer@example.invalid',email_confirmed_at:'2026-11-21T01:00:00Z',user_metadata:{full_name:'مستخدم تجريبي'}};
const oldId='00000000-0000-4000-8000-000000000001';
const newId='00000000-0000-4000-8000-000000000099';
const all=[{
 id:oldId,account_id:'33333333-3333-4333-8333-333333333333',
 seller_user_id:other,seller_display_name:'بائع آخر',seller_kind:'personal',
 title:'سيارة البائع الآخر',description:'وصف تجريبي لإعلان البائع الآخر',
 category:'سيارات',city:'الجبيل',district:'',listing_kind:'sale',price:10000,
 price_mode:'fixed',status:'active',created_at:'2026-11-20T01:00:00Z',expires_at:'2027-11-20T01:00:00Z',
 hidden_at:null,bumped_at:null,reserved_until:null,renewed_at:null,renewal_count:0,photos:[],contact:null
}];
const messages=[],reports=[],sales=[],history=[];
window.__SOOQAK_FAKE={all,messages,reports,sales,history};
const getListing=id=>all.find(row=>row.id===id);
window.sooqakCloud=Object.freeze({
 getUser:()=>me,
 fetchListings:async()=>all.filter(x=>!x.hidden_at),
 fetchFavoriteListings:async()=>[],
 fetchMyListings:async()=>all.filter(x=>x.seller_user_id===uid),
 listFavorites:async()=>[],getSales:async()=>sales,getSaleCorrections:async()=>[],
 ensureAccount:async()=>({id:'33333333-3333-4333-8333-333333333333'}),
 loadPrivateProfile:async()=>({city:'الجبيل'}),
 hasAcceptedPledge:async()=>true,
 acceptPledge:async()=>true,
 getAccountDraft:async()=>({}),
 deleteAccountDraft:async()=>true,
 saveAccountDraft:async()=>true,
 saveListing:async(data,id)=>{
  if(id){const row=getListing(id);if(!row||row.seller_user_id!==uid)throw Error('Not authorized');Object.assign(row,data);history.push({kind:'edit',id});return id;}
  const row={...all[0],id:newId,seller_user_id:uid,seller_display_name:'مستخدم تجريبي',seller_kind:'personal',...data,status:'active',created_at:new Date().toISOString(),photos:[],contact:null};
  all.unshift(row);history.push({kind:'create',id:newId});return newId;
 },
 saveListingContact:async()=>true,
 uploadPhotos:async()=>true,
 removeListing:async id=>{const row=getListing(id);if(row?.seller_user_id===uid)row.hidden_at=new Date().toISOString();else throw Error('Not authorized');history.push({kind:'hide',id});return true;},
 reserve:async()=>true,bump:async()=>true,
 markSold:async(id,price)=>{const row=getListing(id);if(!row||row.seller_user_id!==uid)throw Error('Not authorized');row.status='sold';sales.push({id:'00000000-0000-4000-8000-000000000090',listing_id:id,final_price:price,commission:price/100,recorded_at:new Date().toISOString(),correction_count:0});history.push({kind:'sold',id});return true},
 openOrCreateConversation:async id=>({id:'00000000-0000-4000-8000-000000000050',listing_id:id,buyer_id:uid,seller_id:other,created_at:new Date().toISOString()}),
 listMessages:async()=>messages,
 sendMessage:async(id,body)=>{messages.push({id:'msg-'+(messages.length+1),conversation_id:id,body,sender_id:uid,created_at:new Date().toISOString()});history.push({kind:'message'});return true},
 getConversationBlockStatus:async()=>({blocked:false,blockedByMe:false}),
 isConversationMuted:async()=>false,
 markConversationRead:async()=>true,
 unreadSummary:async()=>({total:0,conversations:[]}),
 setConversationBlocked:async()=>true,setConversationMuted:async()=>true,
 listConversations:async()=>[],
 submitReport:async(id,reason,details)=>{reports.push({id,reason,details});history.push({kind:'report'});return true},
 getAdminDashboard:async()=>({summary:{},reports:[],audit:[]}),
 isAdmin:async()=>false
});
window.dispatchEvent(new Event('sooqak:cloud-ready'));
window.dispatchEvent(new CustomEvent('sooqak:auth',{detail:{user:me}}));
`;
async function start(page){
 await page.route('**/cloud.js',r=>r.fulfill({status:200,contentType:'text/javascript',body:fakeCloud}));
 await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',r=>r.abort());
 await page.goto('/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>Boolean(window.sooqakCloud?.getUser()));
}
test('verified user publishes and updates an ad in simulated data service',async({page})=>{
 await start(page);
 await page.locator('#postButton').click();
 await expect(page.locator('#adForm')).toBeVisible();
 await page.locator('#adForm [name="title"]').fill('سيارة تجريبية للبيع');
 await page.locator('#adForm [name="description"]').fill('إعلان تجريبي للمراجعة ولا يمثل سيارة حقيقية');
 await page.locator('#adForm [name="price"]').fill('25000');
 await page.locator('#adForm button[type="submit"]').click();
 await expect(page.locator('#listingGrid')).toContainText('سيارة تجريبية للبيع');
 const created=await page.evaluate(()=>window.__SOOQAK_FAKE.history.some(x=>x.kind==='create'));
 expect(created).toBe(true);
 await page.locator('#listingGrid [data-open="00000000-0000-4000-8000-000000000099"]').click();
 await page.locator('#modalContent [data-act="edit"]').click();
 await expect(page.locator('#adForm')).toBeVisible();
 await page.locator('#adForm [name="title"]').fill('سيارة تجريبية بعد التعديل');
 await page.locator('#adForm button[type="submit"]').click();
 await expect(page.locator('#listingGrid')).toContainText('سيارة تجريبية بعد التعديل');
 expect(await page.evaluate(()=>window.__SOOQAK_FAKE.history.some(x=>x.kind==='edit'))).toBe(true);
});
test('buyer can send chat message and file report, but cannot edit another listing',async({page})=>{
 await start(page);
 await page.locator('#listingGrid [data-open="00000000-0000-4000-8000-000000000001"]').click();
 await expect(page.locator('#modalContent [data-act="edit"]')).toHaveCount(0);
 await page.locator('#modalContent [data-act="chat"]').click();
 await expect(page.locator('#sooqakCloudMessageForm')).toBeVisible();
 await page.locator('#sooqakCloudMessageForm [name="message"]').fill('مرحبًا، هل السيارة متاحة؟');
 await page.locator('#sooqakCloudMessageForm button[type="submit"]').click();
 await expect(page.locator('#chatMessages')).toContainText('هل السيارة متاحة');
 expect(await page.evaluate(()=>window.__SOOQAK_FAKE.messages.length)).toBe(1);
 await page.locator('#modalClose').click();
 await page.locator('#listingGrid [data-open="00000000-0000-4000-8000-000000000001"]').click();
 await page.locator('#modalContent [data-act="report"]').click();
 await expect(page.locator('#sooqakReportForm')).toBeVisible();
 await page.locator('#sooqakReportForm [name="reason"]').selectOption({label:'احتيال محتمل'});
 await page.locator('#sooqakReportForm button[type="submit"]').click();
 expect(await page.evaluate(()=>window.__SOOQAK_FAKE.reports.length)).toBe(1);
});
test('sold action records exactly 1 percent in simulated ledger',async({page})=>{
 page.on('dialog',async dialog=>{if(dialog.type()==='prompt')await dialog.accept('20000');else await dialog.accept()});
 await start(page);
 await page.locator('#postButton').click();
 await page.locator('#adForm [name="title"]').fill('سيارة للاختبار');
 await page.locator('#adForm [name="description"]').fill('سجل اختبار بيع دون أي مبالغ مالية حقيقية');
 await page.locator('#adForm [name="price"]').fill('25000');
 await page.locator('#adForm button[type="submit"]').click();
 await expect(page.locator('#listingGrid [data-open="00000000-0000-4000-8000-000000000099"]')).toBeVisible();
 await page.locator('#listingGrid [data-open="00000000-0000-4000-8000-000000000099"]').click();
 await page.locator('#modalContent [data-act="sold"]').click();
 await expect.poll(()=>page.evaluate(()=>window.__SOOQAK_FAKE.sales.length)).toBe(1);
 const record=await page.evaluate(()=>window.__SOOQAK_FAKE.sales[0]);
 expect(record.final_price).toBe(20000);expect(record.commission).toBe(200);
});
test('service never exposes live payment checkout controls',async({page})=>{
 await start(page);
 await page.goto('/pricing.html',{waitUntil:'domcontentloaded'});
 await expect(page.locator('h1')).toContainText('المستقبلية');
 await expect(page.locator('form')).toHaveCount(0);
});
