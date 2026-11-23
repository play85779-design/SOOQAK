import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const api=createClient('https://zwbtiyqgrgjybwaguuyn.supabase.co','sb_publishable_42t2ty_ID8MfKoxQkw3CkA_3p1GG4kr');
const id=new URLSearchParams(location.search).get('id');
const more=document.getElementById('more');
const summary=document.getElementById('summary');
const products=document.getElementById('products');
const size=24;
let offset=0;
const shown=new Set();
const visualFor=category=>({'سيارات':'🚗','عقارات':'🏠','إلكترونيات':'📱','أثاث ومنزل':'🛋️','أثاث وديكور':'🛋️','أزياء':'👕','مستلزمات شخصية':'🛍️'}[category]||'📦');

/* Read only confirmed first photos of public seller listings. Fail closed to category icon. */
async function photoByListing(rows){
 const ids=(rows||[]).map(r=>r.id).filter(x=>typeof x==='string');
 const found=new Map();
 if(!ids.length)return found;
 try{
  const response=await api.from('sooqak_listing_photos')
   .select('listing_id,storage_path,position').in('listing_id',ids)
   .eq('confirmed',true).order('position',{ascending:true}).limit(150);
  if(response?.error||!Array.isArray(response?.data))return found;
  for(const image of response.data){
   if(!ids.includes(image.listing_id)||found.has(image.listing_id)||typeof image.storage_path!=='string')continue;
   if(!image.storage_path||image.storage_path.length>400)continue;
   const publicUrl=api.storage?.from('sooqak-listing-photos')?.getPublicUrl(image.storage_path)?.data?.publicUrl;
   if(typeof publicUrl!=='string')continue;
   const url=new URL(publicUrl);
   if(url.origin!=='https://zwbtiyqgrgjybwaguuyn.supabase.co'||!url.pathname.startsWith('/storage/v1/object/public/sooqak-listing-photos/'))continue;
   found.set(image.listing_id,url.href);
  }
 }catch(_error){/* Public photos may be unavailable; retain safe icon fallback. */}
 return found;
}

async function load(){
 more.disabled=true;more.hidden=true;
 try{
  const {data,count,error}=await api.from('sooqak_listings')
   .select('id,title,city,category,price,price_mode,seller_display_name,status',{count:'exact'})
   .eq('account_id',id).eq('seller_kind','business').eq('listing_kind','sale')
   .in('status',['active','reserved']).is('hidden_at',null).gt('expires_at',new Date().toISOString())
   .order('created_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+size-1);
  if(error)throw error;
  const images=await photoByListing(data||[]);
  for(const row of (data||[])){
   if(shown.has(row.id))continue;shown.add(row.id);
   const card=document.createElement('article');card.className='sooqak-store-item';
   const visual=document.createElement('div');visual.className='sooqak-store-item-visual';visual.textContent=visualFor(row.category);
   const photoUrl=images.get(row.id);
   if(photoUrl){
    const img=document.createElement('img');img.src=photoUrl;img.loading='lazy';img.decoding='async';img.alt='صورة المنتج: '+String(row.title||'').slice(0,120);
    img.onerror=()=>{img.remove();visual.textContent=visualFor(row.category)};
    visual.replaceChildren(img);
   }else visual.setAttribute('aria-hidden','true');
   const link=document.createElement('a');link.href='./listing.html?id='+encodeURIComponent(row.id);link.textContent=row.title;
   const meta=document.createElement('p');meta.className='sooqak-store-item-meta';meta.textContent=[row.city,row.status==='reserved'?'محجوز':'متاح'].filter(Boolean).join(' · ');
   const price=document.createElement('strong');price.className='sooqak-store-item-price';price.textContent=Number.isFinite(Number(row.price))&&row.price!==null?Number(row.price).toLocaleString('ar-SA')+' ر.س':'استفسر عن السعر';
   card.append(visual,link,meta,price);products.append(card);
  }
  if(!offset && (data||[]).length){document.getElementById('storeName').textContent=data[0].seller_display_name||'منتجات المتجر';document.title=document.getElementById('storeName').textContent+' | سوقك SOOQAK';}
  offset+=(data||[]).length;
  summary.textContent=count?'عرض '+shown.size+' من '+count+' إعلان بيع للمتجر':'لا توجد إعلانات بيع منشورة لهذا المتجر.';
  more.textContent='عرض المزيد';more.hidden=(data||[]).length<size||offset>=count;
 }catch{
  summary.textContent='تعذر تحميل منتجات المتجر.';more.hidden=false;more.textContent='إعادة المحاولة';
 }finally{more.disabled=false}
}
more.onclick=load;
if(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id||''))load();
else summary.textContent='رابط المتجر غير صحيح.';
