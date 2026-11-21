const { test, expect } = require('@playwright/test');

// Test feed filtering before pagination, with a fake SDK and zero real DB requests.
const sdk = `
const buyerId='11111111-1111-4111-8111-111111111111';
const now=new Date();
function record(i,status,hidden,expired){
 return {
  id:'00000000-0000-4000-8000-'+String(i+1).padStart(12,'0'),
  account_id:'33333333-3333-4333-8333-333333333333',
  seller_user_id:'22222222-2222-4222-8222-222222222222',
  seller_display_name:'بائع تجريبي',seller_kind:'personal',
  title:i===130?'الإعلان النشط الفريد':'إعلان '+i,
  description:'وصف وهمي للاختبار الآلي فقط',
  category:'سيارات',city:'الجبيل',district:'',
  listing_kind:'sale',price:5000,price_mode:'fixed',status,
  created_at:new Date(now.getTime()-(i*60000)).toISOString(),
  expires_at:expired?'2020-01-01T00:00:00Z':'2027-11-21T00:00:00Z',
  bumped_at:null,reserved_until:null,hidden_at:hidden?'2026-11-20T00:00:00Z':null,
  renewed_at:null,renewal_count:0
 };
}
// The real sale ad comes after 130 older inaccessible/sold entries.
const data=[
 ...Array.from({length:70},(_,i)=>record(i,'sold',false,false)),
 ...Array.from({length:30},(_,i)=>record(i+70,'active',true,false)),
 ...Array.from({length:30},(_,i)=>record(i+100,'active',false,true)),
 record(130,'active',false,false)
];
function query(table){
 let filters=[],start=0,count=1000;
 const q={
  select:()=>q,
  in:(key,values)=>{filters.push(v=>values.includes(v[key]));return q;},
  eq:(key,value)=>{filters.push(v=>v[key]===value);return q;},
  is:(key,value)=>{filters.push(v=>v[key]===value);return q;},
  gt:(key,value)=>{filters.push(v=>v[key]!=null&&String(v[key])>String(value));return q;},
  order:()=>q,
  range:(s,e)=>{start=s;count=e-s+1;return q;},
  limit:n=>{count=n;return q;},
  then:(ok,bad)=>{
   const rows=(table==='sooqak_listings'?data:[]).filter(v=>filters.every(fn=>fn(v)));
   return Promise.resolve({data:rows.slice(start,start+count),error:null}).then(ok,bad);
  }
 };
 return q;
}
export function createClient(){
 return {
  auth:{getUser:async()=>({data:{user:null},error:{name:'AuthSessionMissingError'}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},
  from:table=>query(table),
  storage:{from:()=>({getPublicUrl:p=>({data:{publicUrl:'https://example.invalid/'+p}})})}
 };
}
`;
test('public feed excludes sold, hidden and expired listings before applying 60-item pagination', async ({page})=>{
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',r=>r.fulfill({status:200,contentType:'text/javascript',body:sdk}));
 await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',r=>r.abort());
 await page.goto('/index.html',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#listingGrid')).toContainText('الإعلان النشط الفريد',{timeout:9000});
 await expect(page.locator('#listingGrid')).not.toContainText('إعلان 1');
 await expect(page.locator('#listingGrid .listing-card')).toHaveCount(7);
});
