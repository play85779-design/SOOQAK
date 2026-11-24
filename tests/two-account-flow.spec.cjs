const {test,expect}=require('@playwright/test');

// Two isolated verified browser accounts, sharing only a simulated in-memory backend.
// No live Supabase writes, outbound email, customer access or real payments.
const SELLER='11111111-1111-4111-8111-111111111111';
const BUYER='22222222-2222-4222-8222-222222222222';
const OUTSIDER='44444444-4444-4444-8444-444444444444';
const ID='00000000-0000-4000-8000-000000000099';
const CHAT='00000000-0000-4000-8000-000000000050';

function fakeCloud(user){
  const code=[
    'const me='+JSON.stringify(user)+';',
    'const api=(action,more={})=>window.__FAKE_BACKEND({action,uid:me.id,...more});',
    'window.sooqakCloud=Object.freeze({',
    'getUser:()=>me,',
    'fetchListings:async()=>api("list"),fetchFavoriteListings:async()=>[],',
    'fetchMyListings:async()=>api("mine"),listFavorites:async()=>[],',
    'getSales:async()=>api("sales"),getSaleCorrections:async()=>[],',
    'ensureAccount:async()=>({id:me.id}),loadPrivateProfile:async()=>({city:"الجبيل"}),',
    'hasAcceptedPledge:async()=>true,acceptPledge:async()=>true,',
    'getAccountDraft:async()=>({}),deleteAccountDraft:async()=>true,saveAccountDraft:async()=>true,',
    'saveListing:async(row,id)=>api("save",{row,id}),',
    'saveListingContact:async()=>true,uploadPhotos:async()=>true,',
    'removeListing:async id=>api("hide",{id}),reserve:async()=>true,bump:async()=>true,',
    'markSold:async(id,price)=>api("sold",{id,price}),',
    'openOrCreateConversation:async id=>api("conversation",{id}),',
    'listMessages:async id=>api("messages",{id}),',
    'sendMessage:async(id,body)=>api("send",{id,body}),',
    'listConversations:async()=>api("conversations"),',
    'getConversationBlockStatus:async()=>({blocked:false,blockedByMe:false}),',
    'isConversationMuted:async()=>false,markConversationRead:async()=>true,',
    'unreadSummary:async()=>({total:0,conversations:[]}),',
    'setConversationBlocked:async()=>true,setConversationMuted:async()=>true,',
    'submitReport:async()=>true,isAdmin:async()=>false',
    '});',
    'window.dispatchEvent(new Event("sooqak:cloud-ready"));',
    'window.dispatchEvent(new CustomEvent("sooqak:auth",{detail:{user:me}}));'
  ];
  return code.join('\n');
}

test('two separate accounts: seller posts, buyer chats, seller sells with 1% commission',async({browser})=>{
 const state={listings:[],conversations:[],messages:[],sales:[]};
 async function db({action,uid,...p}){
   const ad=state.listings.find(x=>x.id===(p.id||ID));
   if(action==='list')return state.listings.filter(x=>!x.hidden_at&&x.status!=='sold');
   if(action==='mine')return state.listings.filter(x=>x.seller_user_id===uid);
   if(action==='sales')return state.sales.filter(x=>state.listings.some(l=>l.id===x.listing_id&&l.seller_user_id===uid));
   if(action==='save'){
     if(p.id){if(!ad||ad.seller_user_id!==uid)throw Error('forbidden edit');Object.assign(ad,p.row);return p.id;}
     state.listings.push({
       ...p.row,id:ID,account_id:'33333333-3333-4333-8333-333333333333',seller_user_id:uid,
       seller_display_name:'بائع تجريبي',seller_kind:'personal',status:'active',
       created_at:new Date().toISOString(),expires_at:'2027-12-01T00:00:00Z',
       hidden_at:null,bumped_at:null,reserved_until:null,renewed_at:null,renewal_count:0,photos:[],contact:null
     });
     return ID;
   }
   if(action==='conversation'){
     if(!ad||ad.seller_user_id===uid)throw Error('forbidden');
     const item={id:CHAT,listing_id:p.id,buyer_id:uid,seller_id:ad.seller_user_id,created_at:new Date().toISOString()};
     if(!state.conversations.some(c=>c.id===CHAT))state.conversations.push(item);
     return state.conversations[0];
   }
   if(action==='conversations')return state.conversations.filter(c=>c.seller_id===uid||c.buyer_id===uid);
   if(action==='messages'){
     if(!state.conversations.some(c=>c.id===p.id&&(c.seller_id===uid||c.buyer_id===uid)))throw Error('forbidden read');
     return state.messages.filter(m=>m.conversation_id===p.id);
   }
   if(action==='send'){
     if(!state.conversations.some(c=>c.id===p.id&&(c.seller_id===uid||c.buyer_id===uid)))throw Error('forbidden send');
     state.messages.push({id:'msg-'+(state.messages.length+1),conversation_id:p.id,sender_id:uid,body:p.body,created_at:new Date().toISOString()});
     return true;
   }
   if(action==='sold'){
     if(!ad||ad.seller_user_id!==uid)throw Error('forbidden sale');
     ad.status='sold';
     state.sales.push({id:'00000000-0000-4000-8000-000000000090',listing_id:p.id,
       final_price:Number(p.price),commission:Number(p.price)/100,recorded_at:new Date().toISOString(),correction_count:0});
     return true;
   }
   if(action==='hide'){if(!ad||ad.seller_user_id!==uid)throw Error('forbidden hide');ad.hidden_at=new Date().toISOString();return true;}
   throw Error('unsupported action '+action);
 }
 const contexts=[await browser.newContext(),await browser.newContext()];
 const [sellerPage,buyerPage]=await Promise.all(contexts.map(c=>c.newPage()));
 async function setup(page,user){
   await page.exposeFunction('__FAKE_BACKEND',db);
   await page.route('**/cloud.js',r=>r.fulfill({status:200,contentType:'text/javascript',body:fakeCloud(user)}));
   await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',r=>r.abort());
   await page.goto('/index.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>Boolean(window.sooqakCloud?.getUser()));
 }
 try{
   await setup(sellerPage,{id:SELLER,email:'seller@example.invalid',email_confirmed_at:'2026-11-20T00:00:00Z',user_metadata:{full_name:'بائع تجريبي'}});
   await sellerPage.locator('#postButton').click();
   await sellerPage.locator('#adForm [name="title"]').fill('أرض تجريبية في الجبيل');
   await sellerPage.locator('#adForm [name="description"]').fill('إعلان تجريبي خاص بالاختبارات؛ لا توجد أرض للبيع');
   await sellerPage.locator('#adForm [name="price"]').fill('50000');
   await sellerPage.locator('#adForm button[type="submit"]').click();
   await expect(sellerPage.locator('#listingGrid [data-open="'+ID+'"]')).toBeVisible();
   expect(state.listings).toHaveLength(1);
   expect(state.listings[0].seller_user_id).toBe(SELLER);

   await setup(buyerPage,{id:BUYER,email:'buyer@example.invalid',email_confirmed_at:'2026-11-20T00:00:00Z',user_metadata:{full_name:'مشتري تجريبي'}});
   await buyerPage.locator('#searchInput').fill('أرض');
   await expect(buyerPage.locator('#listingGrid [data-open="'+ID+'"]')).toBeVisible();
   await buyerPage.locator('#listingGrid [data-open="'+ID+'"]').click();
   await expect(buyerPage.locator('#modalContent [data-act="edit"]')).toHaveCount(0);
   await buyerPage.locator('#modalContent [data-act="chat"]').click();
   await buyerPage.locator('#sooqakCloudMessageForm [name="message"]').fill('السلام عليكم هل الأرض متاحة؟');
   await buyerPage.locator('#sooqakCloudMessageForm button[type="submit"]').click();
   await expect(buyerPage.locator('#chatMessages')).toContainText('الأرض متاحة');
   expect(state.messages).toHaveLength(1);
   expect(state.messages[0].sender_id).toBe(BUYER);
   // Fixture contract only: the third identity cannot read or send in this conversation.
   expect(await db({action:'messages',uid:SELLER,id:CHAT})).toHaveLength(1);
   expect(await db({action:'conversations',uid:OUTSIDER})).toHaveLength(0);
   await expect(db({action:'messages',uid:OUTSIDER,id:CHAT})).rejects.toThrow('forbidden read');
   await expect(db({action:'send',uid:OUTSIDER,id:CHAT,body:'unauthorized'})).rejects.toThrow('forbidden send');
   expect(state.messages).toHaveLength(1);

   sellerPage.on('dialog',async dialog=>{if(dialog.type()==='prompt')await dialog.accept('42000');else await dialog.accept();});
   await sellerPage.locator('#listingGrid [data-open="'+ID+'"]').click();
   await sellerPage.locator('#modalContent [data-act="sold"]').click();
   await expect.poll(()=>state.sales.length).toBe(1);
   expect(state.sales[0].commission).toBe(420);
   expect(state.sales[0].final_price).toBe(42000);
 }finally{
   await Promise.all(contexts.map(c=>c.close()));
 }
});