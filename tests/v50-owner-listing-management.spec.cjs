const {test,expect}=require('@playwright/test');

// V50: tests only a fake owner-specific backend. No real database or user changes.
async function start(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// simulated backend'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{
  const uid='11111111-1111-4111-8111-111111111111';
  const today=Date.now();
  const date=days=>new Date(today+days*86400000).toISOString();
  const ids={active:'00000000-0000-4000-8000-000000000051',expired:'00000000-0000-4000-8000-000000000052',hidden:'00000000-0000-4000-8000-000000000053',sold:'00000000-0000-4000-8000-000000000054'};
  const rows=Object.entries(ids).map(([kind,id])=>({
   id,account_id:'33333333-3333-4333-8333-333333333333',
   seller_user_id:uid,seller_display_name:'بائع تجريبي',seller_kind:'personal',
   title:'إعلان '+kind,description:'وصف إعلان خاص بالاختبار فقط',
   category:'سيارات',city:'الجبيل',district:'',listing_kind:'sale',price:1000,
   price_mode:'fixed',status:kind==='sold'?'sold':'active',
   created_at:date(-5),expires_at:date(kind==='expired'?-1:50),
   hidden_at:kind==='hidden'?date(-1):null,
   bumped_at:null,reserved_until:null,renewed_at:null,renewal_count:0,photos:[],contact:null
  }));
  window.__V50={ids,rows,renewed:[],hidden:[]};
  window.sooqakCloud={
   loadPrivateProfile:async()=>({city:'الجبيل'}),
   fetchMyListings:async()=>rows,fetchListings:async()=>[],
   renewListing:async id=>{window.__V50.renewed.push(id);return true},
   removeListing:async id=>{window.__V50.hidden.push(id);return true}
  };
  state.account={id:uid,email:'tester@example.invalid',name:'مستخدم تجريبي'};
  state.cloudPledgeAcceptedAt=true;
  state.role='فردي';
 });
 await page.evaluate(()=>openCloudMyAds());
}
test('V50 owner library manages active and expired but preserves hidden and sold',async({page})=>{
 await start(page);
 await expect(page.locator('#sooqakMyAdsRows .sooqak-owned-listing')).toHaveCount(4);
 await expect(page.locator('[data-owner-status="active"] [data-act="edit"]')).toHaveCount(1);
 await expect(page.locator('[data-owner-status="active"] [data-act="delete"]')).toHaveCount(1);
 await expect(page.locator('[data-owner-status="expired"] [data-act="renew"]')).toHaveCount(1);
 await expect(page.locator('[data-owner-status="expired"] [data-act="edit"]')).toHaveCount(0);
 await expect(page.locator('[data-owner-status="hidden"] [data-act="edit"]')).toHaveCount(0);
 await expect(page.locator('[data-owner-status="hidden"] [data-act="renew"]')).toHaveCount(0);
 await expect(page.locator('[data-owner-status="sold"] [data-act="edit"]')).toHaveCount(0);
 await expect(page.locator('[data-owner-status="sold"] [data-act="renew"]')).toHaveCount(0);
});
test('V50 expired listing renews only after expiry; hidden item is never renewed',async({page})=>{
 await start(page);
 await page.locator('[data-owner-status="expired"] [data-act="renew"]').click();
 await expect.poll(()=>page.evaluate(()=>window.__V50.renewed.length)).toBe(1);
 const before=await page.evaluate(()=>window.__V50.renewed[0]);
 expect(before).toBe('00000000-0000-4000-8000-000000000052');
 await page.evaluate(()=>renewCloudAd(window.__V50.ids.hidden));
 expect(await page.evaluate(()=>window.__V50.renewed.length)).toBe(1);
});
test('V50 owner hide calls soft hide and never deletes the record',async({page})=>{
 page.on('dialog',d=>d.accept());
 await start(page);
 await page.locator('[data-owner-status="active"] [data-act="delete"]').click();
 await expect.poll(()=>page.evaluate(()=>window.__V50.hidden.length)).toBe(1);
 const result=await page.evaluate(()=>({
  id:window.__V50.hidden[0],
  retained:window.__V50.rows.length,
  hiddenInCache:sooqakOwnedAdCache.get(window.__V50.ids.active)?.hidden
 }));
 expect(result.id).toBe('00000000-0000-4000-8000-000000000051');
 expect(result.retained).toBe(4);
 expect(result.hiddenInCache).toBe(true);
});
