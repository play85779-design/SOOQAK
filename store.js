import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const api=createClient('https://zwbtiyqgrgjybwaguuyn.supabase.co','sb_publishable_42t2ty_ID8MfKoxQkw3CkA_3p1GG4kr');
const id=new URLSearchParams(location.search).get('id');
const more=document.getElementById('more');
const summary=document.getElementById('summary');
const products=document.getElementById('products');
const size=24;
let offset=0;
const shown=new Set();
async function load(){
 more.disabled=true;
 try{
  const {data,count,error}=await api.from('sooqak_listings')
   .select('id,title,city,seller_display_name,status',{count:'exact'})
   .eq('account_id',id).eq('seller_kind','business').eq('listing_kind','sale')
   .in('status',['active','reserved']).is('hidden_at',null).gt('expires_at',new Date().toISOString())
   .order('created_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+size-1);
  if(error)throw error;
  for(const row of data){
   if(shown.has(row.id))continue;
   shown.add(row.id);
   const card=document.createElement('article');
   card.className='card';
   const link=document.createElement('a');
   link.className='service-title';
   link.href='./listing.html?id='+encodeURIComponent(row.id);
   link.textContent=row.title;
   const meta=document.createElement('p');
   meta.textContent=[row.city,row.status==='reserved'?'محجوز':'متاح'].filter(Boolean).join(' · ');
   card.append(link,meta);products.append(card);
  }
  if(!offset && data.length)document.getElementById('storeName').textContent=data[0].seller_display_name||'منتجات المتجر';
  offset+=data.length;
  summary.textContent=count?'عرض '+shown.size+' من '+count+' إعلان بيع للمتجر':'لا توجد إعلانات بيع منشورة لهذا المتجر.';
  more.textContent='عرض المزيد';more.hidden=data.length<size||offset>=count;
 }catch{
  summary.textContent='تعذر تحميل منتجات المتجر.';more.hidden=false;more.textContent='إعادة المحاولة';
 }finally{more.disabled=false}
}
more.onclick=load;
if(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id||''))load();
else summary.textContent='رابط المتجر غير صحيح.';
