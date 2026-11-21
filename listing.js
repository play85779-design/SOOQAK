import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const api=createClient('https://zwbtiyqgrgjybwaguuyn.supabase.co','sb_publishable_42t2ty_ID8MfKoxQkw3CkA_3p1GG4kr');
const container=document.getElementById('listingDetail');
const id=new URLSearchParams(location.search).get('id');
const valid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const el=(tag,text)=>{const x=document.createElement(tag);if(text!=null)x.textContent=text;return x};
async function load(){
 if(!id||!valid.test(id)){container.textContent='رابط الإعلان غير صحيح.';return}
 try{
  const {data,error}=await api.from('sooqak_listings').select('id,title,description,category,city,district,price,price_mode,status,created_at,hidden_at,expires_at,listing_kind').eq('id',id).maybeSingle();
  if(error)throw error;
  if(!data||data.hidden_at || data.status==='sold' || new Date(data.expires_at).getTime()<=Date.now()){
    container.textContent='الإعلان غير متاح أو انتهت صلاحيته.';return;
  }
  container.replaceChildren();document.title=data.title+' | سوقك';
  container.append(el('h1',data.title));
  const meta=el('p',[data.category,data.city,data.district,data.listing_kind==='wanted'?'مطلوب':'للبيع'].filter(Boolean).join(' • '));meta.className='detail-meta';container.append(meta);
  const price=el('h2',data.price_mode==='contact'||data.price==null?'تواصل للسعر':Number(data.price).toLocaleString('ar-SA')+' ر.س');container.append(price);
  const desc=el('p',data.description||'');desc.className='detail-description';container.append(desc);
  const photos=await api.from('sooqak_listing_photos').select('storage_path,position,confirmed').eq('listing_id',id).eq('confirmed',true).order('position',{ascending:true}).limit(5);
  if(photos.error)throw photos.error;
  const gallery=el('div');gallery.className='detail-photos';
  for(const photo of photos.data||[]){const img=el('img');img.src=api.storage.from('sooqak-listing-photos').getPublicUrl(photo.storage_path).data.publicUrl;img.alt='صورة للإعلان';img.loading='lazy';gallery.append(img)}
  container.append(gallery);
  const actions=el('div');actions.style.marginTop='20px';
  const go=el('a','العودة إلى السوق والتواصل مع البائع');go.href='./index.html#ad-'+encodeURIComponent(id);go.style.color='#245d89';actions.append(go);container.append(actions);
 }catch(e){container.textContent='تعذر تحميل الإعلان، حاول إعادة فتح الصفحة.'}
}
load();
