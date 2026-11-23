const {test,expect}=require('@playwright/test');

// No live Supabase requests: test the real cloud.js method against a mock
// preserving the actual production grants: INSERT/SELECT/DELETE, not UPDATE.
const mock=String.raw`
const uid='11111111-1111-4111-8111-111111111111';
window.__SOOQAK_FAV_INSERTS=[];
window.__SOOQAK_FAV_UPSERTS=0;
window.__SOOQAK_FAV_DUPLICATE=false;
const q={
 select:()=>q,eq:()=>q,is:()=>q,gt:()=>q,order:()=>q,limit:()=>q,range:()=>q,
 maybeSingle:async()=>({data:null,error:null}),
 then:(ok,bad)=>Promise.resolve({data:[],error:null}).then(ok,bad),
 insert:async row=>{
   window.__SOOQAK_FAV_INSERTS.push(row);
   return {error:window.__SOOQAK_FAV_DUPLICATE?{code:'23505',message:'duplicate key'}:null};
 },
 upsert:async()=>{
   window.__SOOQAK_FAV_UPSERTS++;
   return {error:{code:'42501',message:'permission denied for table sooqak_favorites'}};
 },
 delete:()=>q
};
export function createClient(){
 return {
   auth:{
     getUser:async()=>({data:{user:{id:uid,email:'buyer@example.invalid',email_confirmed_at:'2026-11-20T00:00:00Z',user_metadata:{full_name:'مستخدم تجريبي'}}},error:null}),
     onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})
   },
   from:()=>q,
   storage:{from:()=>({getPublicUrl:path=>({data:{publicUrl:'https://example.invalid/'+path}})})}
 };
}
`;
async function open(page){
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',route=>route.fulfill({status:200,contentType:'text/javascript',body:mock}));
 await page.route('https://zwbtiyqgrgjybwaguuyn.supabase.co/**',route=>route.abort());
 await page.goto('/index.html',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.sooqakCloud?.getUser()?.id)).toBe('11111111-1111-4111-8111-111111111111');
}
test('authenticated favorite creation uses INSERT; no UPDATE-only upsert privilege is requested',async({page})=>{
 await open(page);
 const row=await page.evaluate(async()=>{
   await window.sooqakCloud.setFavorite('00000000-0000-4000-8000-000000000099',true);
   return {rows:window.__SOOQAK_FAV_INSERTS,upserts:window.__SOOQAK_FAV_UPSERTS};
 });
 expect(row.rows).toEqual([{user_id:'11111111-1111-4111-8111-111111111111',listing_id:'00000000-0000-4000-8000-000000000099'}]);
 expect(row.upserts).toBe(0);
});
test('already-saved favorite duplicate is idempotent without extra database grants',async({page})=>{
 await open(page);
 const ok=await page.evaluate(async()=>{
   window.__SOOQAK_FAV_DUPLICATE=true;
   try{await window.sooqakCloud.setFavorite('00000000-0000-4000-8000-000000000099',true);return true}catch{return false}
 });
 expect(ok).toBe(true);
 expect(await page.evaluate(()=>window.__SOOQAK_FAV_UPSERTS)).toBe(0);
});
