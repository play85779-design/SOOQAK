const {test,expect}=require('@playwright/test');

// Fully mocked Auth/Data API in the browser: never calls or mutates a real account or table.
const userId='11111111-1111-4111-8111-111111111111';
const sellerId='22222222-2222-4222-8222-222222222222';
const mockedSdk=String.raw`
const userId='11111111-1111-4111-8111-111111111111';
const sellerId='22222222-2222-4222-8222-222222222222';
const ids=Array.from({length:70},(_,i)=>'00000000-0000-4000-8000-'+String(i+1).padStart(12,'0'));
const listings=ids.map((id,i)=>({
 id,account_id:'33333333-3333-4333-8333-333333333333',seller_user_id:sellerId,
 seller_display_name:'بائع تجريبي',seller_kind:'personal',
 title:'جهاز تجريبي رقم '+(i+1),description:'وصف جهاز للاختبار بدون معلومات شخصية',
 category:'إلكترونيات',city:'الجبيل',district:'الفناتير',
 listing_kind:'sale',price:100+i,price_mode:'fixed',status:'active',
 created_at:new Date(2026,10,21,0,0,70-i).toISOString(),
 expires_at:'2027-11-21T00:00:00Z',
 bumped_at:null,reserved_until:null,hidden_at:null,renewed_at:null,renewal_count:0
}));
window.__SOOQAK_TEST_IN_REQUESTS=[];
function makeQuery(table){
 let take=1000,skip=0,where=()=>true;
 const q={
   select:()=>q,
   eq:(col,value)=>{const prev=where;where=row=>prev(row)&&row[col]===value;return q;},
   in:(col,values)=>{const prev=where;where=row=>prev(row)&&values.includes(row[col]);if(table==='sooqak_listings')window.__SOOQAK_TEST_IN_REQUESTS.push([...values]);return q;},
   order:()=>q,limit:n=>{take=n;return q;},
   range:(start,end)=>{skip=start;take=end-start+1;return q;},
   then:(ok,bad)=>{
     const source=table==='sooqak_favorites'?ids.map(id=>({user_id:userId,listing_id:id})):table==='sooqak_listings'?listings:[];
     return Promise.resolve({data:source.filter(where).slice(skip,skip+take),error:null}).then(ok,bad);
   },
   maybeSingle:async()=>{
     const source=table==='sooqak_listings'?listings:[];
     return {data:source.find(where)||null,error:null};
   }
 };
 return q;
}
export function createClient(){
 return {
  auth:{getUser:async()=>({data:{user:{id:userId,email:'buyer@example.invalid',email_confirmed_at:'2026-01-01T00:00:00Z',user_metadata:{full_name:'مشتري تجريبي'}}},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},
  from:table=>makeQuery(table),
  storage:{from:()=>({getPublicUrl:path=>({data:{publicUrl:'https://example.invalid/'+path}})})}
 };
}
`;
async function installMock(page){
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',r=>r.fulfill({status:200,contentType:'text/javascript',body:mockedSdk}));
 await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',r=>r.abort());
 await page.goto('/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>Boolean(window.sooqakCloud?.getUser()));
}
test('saved favorites beyond the first 60 search results remain accessible',async({page})=>{
 await installMock(page);
 await page.locator('#favButton').click();
 await expect(page.locator('#listingGrid .listing-card')).toHaveCount(70);
 await expect(page.locator('#listingGrid')).toContainText('جهاز تجريبي رقم 70');
 const batches=await page.evaluate(()=>window.__SOOQAK_TEST_IN_REQUESTS);
 expect(batches.length).toBeGreaterThanOrEqual(2);
 expect(batches.every(x=>x.length<=40)).toBe(true);
});
test('switching home from favorites restores normal results without extra favorites API',async({page})=>{
 await installMock(page);
 await page.locator('#favButton').click();
 await expect(page.locator('#listingGrid .listing-card')).toHaveCount(70);
 await page.locator('#homeLink').click();
 await expect(page.locator('#resultsTitle')).toContainText('أحدث');
});

test('shared link opens an older advertisement outside the first 60 listings',async({page})=>{
 await installMock(page);
 const id='00000000-0000-4000-8000-000000000070';
 await page.goto('/index.html#ad-'+id,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#modalTitle')).toHaveText('تفاصيل الإعلان',{timeout:9000});
 await expect(page.locator('#modalContent')).toContainText('جهاز تجريبي رقم 70');
 await expect(page.locator('#modalContent')).toContainText('بائع تجريبي');
 await expect(page.locator('#listingGrid')).not.toContainText('جهاز تجريبي رقم 70');
});

test('the return-to-market link on a public detail opens the same older item',async({page})=>{
 await installMock(page);
 const id='00000000-0000-4000-8000-000000000070';
 await page.goto('/listing.html?id='+id,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#listingDetail')).toContainText('جهاز تجريبي رقم 70');
 await page.getByRole('link',{name:'العودة إلى السوق والتواصل مع البائع'}).click();
 await expect(page).toHaveURL(new RegExp('#ad-'+id+'$'));
 await expect(page.locator('#modalTitle')).toHaveText('تفاصيل الإعلان',{timeout:9000});
});

test('a deleted or inaccessible shared advertisement does not open a fake card',async({page})=>{
 await installMock(page);
 const id='99999999-9999-4999-8999-999999999999';
 await page.goto('/index.html#ad-'+id,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#toast')).toContainText('غير متاح',{timeout:9000});
 await expect(page.locator('#modalBackdrop')).toBeHidden();
});
