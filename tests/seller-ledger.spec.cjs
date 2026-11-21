const {test,expect}=require('@playwright/test');

// Closed-beta local SDK simulation. No real account, email, charge or DB write.
const sdk=`
const uid='11111111-1111-4111-8111-111111111111';
const other='22222222-2222-4222-8222-222222222222';
const makeId=i=>'00000000-0000-4000-8000-'+String(i+1).padStart(12,'0');
const now=Date.now();
function listing(i,owner){
 return {
  id:makeId(i),account_id:'44444444-4444-4444-8444-444444444444',
  seller_user_id:owner,seller_display_name:owner===uid?'حساب تجريبي':'بائع آخر',
  seller_kind:'personal',title:'سلعة رقم '+(i+1),description:'إعلان تجريبي للاختبار الآلي فقط',
  category:'سيارات',city:'الجبيل',district:'الفناتير',listing_kind:'sale',
  price:1000+i,price_mode:'fixed',status:owner===uid&&i%2===0?'sold':'active',
  created_at:new Date(now-i*3600000).toISOString(),
  expires_at:'2027-11-21T00:00:00Z',bumped_at:null,reserved_until:null,
  hidden_at:owner===uid&&i%3===0?'2026-11-20T00:00:00Z':null,
  renewed_at:null,renewal_count:0
 };
}
const outsiders=Array.from({length:100},(_,i)=>listing(i,other));
const owned=Array.from({length:45},(_,i)=>listing(100+i,uid));
const collections={
 sooqak_listings:[...outsiders,...owned],
 sooqak_sales:[{id:makeId(900),listing_id:owned[44].id,final_price:5000,commission:50,recorded_at:'2026-11-20T12:00:00Z',account_id:'44444444-4444-4444-8444-444444444444',corrected_at:null,correction_count:0,seller_user_id:uid}],
 sooqak_sale_corrections:[],sooqak_favorites:[],sooqak_listing_photos:[],sooqak_listing_contacts:[]
};
function query(table){
 let clauses=[],sortBy=null,asc=false,start=0,size=1000,head=false;
 const obj={
  select:(columns,options)=>{head=options?.head===true;return obj},
  eq:(key,value)=>{clauses.push(v=>v[key]===value);return obj},
  in:(key,values)=>{clauses.push(v=>values.includes(v[key]));return obj},
  is:(key,value)=>{clauses.push(v=>v[key]===value);return obj},
  gt:(key,value)=>{clauses.push(v=>v[key]!=null&&String(v[key])>String(value));return obj},
  order:(key,options)=>{if(!sortBy){sortBy=key;asc=options?.ascending===true}return obj},
  limit:n=>{size=n;return obj},
  range:(s,e)=>{start=s;size=e-s+1;return obj},
  maybeSingle:async()=>({data:null,error:null}),
  then:(ok,bad)=>{
    let rows=(collections[table]||[]).filter(row=>clauses.every(fn=>fn(row)));
    if(sortBy)rows.sort((a,b)=>{let x=String(a[sortBy]),y=String(b[sortBy]);return asc?x.localeCompare(y):y.localeCompare(x)});
    return Promise.resolve({data:head?null:rows.slice(start,start+size),count:rows.length,error:null}).then(ok,bad);
  }
 };
 return obj;
}
export function createClient(){
 return {
  auth:{getUser:async()=>({data:{user:{id:uid,email:'seller@example.invalid',email_confirmed_at:'2026-11-20T00:00:00Z',user_metadata:{full_name:'معلن تجريبي'}}},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},
  from:table=>query(table),
  storage:{from:()=>({getPublicUrl:path=>({data:{publicUrl:'https://example.invalid/'+path}})})}
 };
}
`;
async function start(page){
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',r=>r.fulfill({status:200,contentType:'text/javascript',body:sdk}));
 await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',r=>r.abort());
 await page.goto('/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>Boolean(window.sooqakCloud?.getUser()));
}
test('seller library loads sold/hidden/old listings beyond first public page',async({page})=>{
 await start(page);
 await page.locator('#profileButton').click();
 await page.locator('[data-act="myads"]').click();
 await expect(page.locator('#sooqakMyAdsRows .small-card')).toHaveCount(40);
 await expect(page.locator('#sooqakMyAdsMore')).toBeVisible();
 await page.locator('#sooqakMyAdsMore').click();
 await expect(page.locator('#sooqakMyAdsRows .small-card')).toHaveCount(45);
 await expect(page.locator('#sooqakMyAdsMore')).toBeHidden();
 await page.locator('#sooqakMyAdsRows [data-open]').last().click();
 await expect(page.locator('#modalTitle')).toContainText('تفاصيل الإعلان');
 await expect(page.locator('#modalContent')).toContainText('سلعة رقم 145');
});
test('commission ledger includes sale from listing absent from current public feed',async({page})=>{
 await start(page);
 await page.locator('#profileButton').click();
 await page.locator('[data-act="commissions"]').click();
 await expect(page.locator('#modalTitle')).toContainText('عمولتي');
 await expect(page.locator('#modalContent')).toContainText('سعر البيع المبلغ عنه');
 await expect(page.locator('#modalContent')).toContainText('عمولة 1%');
 const summary=await page.locator('#modalContent .count-card strong').first().textContent();
 const western=summary.replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-0x660)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-0x6f0));
 expect(western).toContain('50');
});

test('profile count includes old, sold and hidden own ads',async({page})=>{
 await start(page);
 await page.locator('#profileButton').click();
 await expect(page.locator('#sooqakOwnListingCount')).toHaveText('45');
});

test('V83 seller can open a correction for an older sale outside the public feed',async({page})=>{
 await start(page);
 await page.locator('#profileButton').click();
 await page.locator('[data-act="commissions"]').click();
 await page.locator('[data-correct-sale]').click();
 await expect(page.locator('#correctSaleForm [name="price"]')).toHaveValue('5000');
});

test('V84 switching accounts while fetching the ledger discards old sales',async({page})=>{
 await page.route('**/cloud.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
 await page.goto('/index.html');
 await page.evaluate(async()=>{
  state.account={id:'old'};
  let resolveSales;
  window.sooqakCloud={getSales:()=>new Promise(resolve=>resolveSales=resolve),getSaleCorrections:async()=>[]};
  const pending=openCloudCommissions();
  state.account={id:'new'};
  resolveSales([{id:'old-sale',final_price:1234,commission:12.34}]);
  await pending;
 });
 await expect(page.locator('.commission-sale')).toHaveCount(0);
});

test('V81 repeated sale confirmation only submits one sale while pending',async({page})=>{
 await page.route('**/cloud.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
 await page.goto('/index.html');
 const sent=await page.evaluate(async()=>{
  window.SOOQAK_CLOUD_ENABLED=true;
  state.account={id:'seller'};state.ads=[{id:'one',ownerId:'seller',role:state.role,status:'متاح',price:150.50}];
  let calls=0,release;
  window.sooqakCloud={markSold:()=>{calls++;return new Promise(resolve=>release=resolve)}};
  window.prompt=()=>'150.50';window.confirm=()=>true;
  const first=sellCloud('one');
  await sellCloud('one');
  state.account=null;
  release();await first;
  return calls;
 });
 expect(sent).toBe(1);
});
