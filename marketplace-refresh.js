
/* Read-only public shop discovery. No fake sellers, ratings or new accounts. */
(()=>{
'use strict';
const grid=document.getElementById('sooqakShopsGrid');
if(!grid)return;
const validId=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const state=(message)=>{grid.replaceChildren();const p=document.createElement('p');p.className='sooqak-shop-state';p.textContent=message;grid.append(p);grid.setAttribute('aria-busy','false');};
function createStoreCard(row){
 const a=document.createElement('a');a.className='sooqak-shop-card';a.href='./store.html?id='+encodeURIComponent(row.account_id);
 const icon=document.createElement('span');icon.className='sooqak-shop-icon';icon.setAttribute('aria-hidden','true');icon.textContent='🏪';
 const name=document.createElement('strong');name.className='sooqak-shop-title';name.textContent=String(row.seller_display_name||'متجر سوقك').slice(0,60);
 const desc=document.createElement('span');desc.className='sooqak-shop-meta';desc.textContent=[row.city||'', 'عرض منتجات المتجر'].filter(Boolean).join(' · ');
 a.append(icon,name,desc);return a;
}
async function readStores(){
 const config=window.SOOQAK_SUPABASE||{};
 if(!window.SOOQAK_CLOUD_ENABLED||!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.url||'')||!/^sb_publishable_/.test(config.publishableKey||'')){state('دليل المتاجر غير متاح في المعاينة المحلية.');return;}
 try{
  const qs=new URLSearchParams({
   select:'account_id,seller_display_name,city',seller_kind:'eq.business',listing_kind:'eq.sale',
   status:'in.(active,reserved)',hidden_at:'is.null',expires_at:'gt.'+new Date().toISOString(),
   order:'created_at.desc',limit:'24'
  });
  const response=await fetch(config.url.replace(/\/$/,'')+'/rest/v1/sooqak_listings?'+qs,{headers:{apikey:config.publishableKey,Accept:'application/json'}});
  if(!response.ok)throw Error('Public feed unavailable');
  const data=await response.json();if(!Array.isArray(data))throw Error('Invalid data');
  const seen=new Set(),rows=[];
  for(const row of data){if(!validId.test(row.account_id||'')||seen.has(row.account_id))continue;seen.add(row.account_id);rows.push(row);if(rows.length===4)break;}
  if(!rows.length){state('لا توجد متاجر لديها إعلانات بيع منشورة حاليًا.');return;}
  grid.replaceChildren(...rows.map(createStoreCard));grid.setAttribute('aria-busy','false');
 }catch(_e){state('تعذّر عرض المتاجر الآن. يمكنك مواصلة تصفح الإعلانات بشكل طبيعي.');}
}
function openStoreSetup(){
 // Existing account modal owns login and business-account creation with RLS.
 const account=document.getElementById('brandAccountButton');
 if(!account)return;account.click();
 const business=document.getElementById('businessTab');
 if(business){business.focus();business.click();}
}
for(const id of ['sooqakCreateStore','sooqakCreateStoreSecondary']){
 document.getElementById(id)?.addEventListener('click',openStoreSetup);
}
document.addEventListener('DOMContentLoaded',readStores,{once:true});
})();
