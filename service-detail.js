// Public service detail: intentionally no use of service_role or private credentials.
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const api=createClient('https://zwbtiyqgrgjybwaguuyn.supabase.co','sb_publishable_42t2ty_ID8MfKoxQkw3CkA_3p1GG4kr',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const params=new URLSearchParams(location.search),id=params.get('id');
const $=n=>document.getElementById(n);
function node(tag,text,cls=''){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const labels={workshop:'ورشة',plumbing:'محل سباكة',delivery:'مندوب توصيل'};
async function start(){
 const body=$('detail');if(!id||!uuid.test(id)){body.textContent='رابط النشاط غير صحيح.';return}
 try{
  const {data,error}=await api.from('sooqak_service_directory').select('id,name,kind,city,district,specialty,description,phone_e164,phone_public,address_text,hours_text,map_url,status,moderation_state,created_at').eq('id',id).maybeSingle();
  if(error)throw error;if(!data||data.status!=='active'||data.moderation_state!=='approved'){body.textContent='هذا النشاط غير منشور أو غير متاح حاليًا.';return}
  body.className='';body.replaceChildren();document.title=data.name+' | سوقك';
  $('back').href='./services.html?kind='+encodeURIComponent(data.kind);
  body.append(node('p',labels[data.kind]||'نشاط خدمي','tagline'),node('h1',data.name));
  const rows=node('div',undefined,'rows');
  for(const [key,val] of [['المدينة',data.city],['الحي',data.district],['التخصص',data.specialty],['الموقع',data.address_text],['ساعات العمل',data.hours_text]]){
   if(!val)continue;const item=node('div');item.append(node('strong',key),node('span',val));rows.append(item)
  }
  body.append(rows);if(data.description){body.append(node('h2','الخدمات والتفاصيل'));body.append(node('p',data.description,'description'))}
  const actions=node('div',undefined,'actions');
  if(data.map_url){try{const m=new URL(data.map_url);if(m.protocol==='https:'&&(m.hostname==='maps.app.goo.gl'||m.hostname==='goo.gl'&&m.pathname.startsWith('/maps/')||['maps.google.com','maps.google.com.sa'].includes(m.hostname)||['www.google.com','www.google.com.sa','google.com','google.com.sa'].includes(m.hostname)&&m.pathname.startsWith('/maps/'))){const a=node('a','افتح موقع النشاط على الخريطة','btn');a.href=m.href;a.target='_blank';a.rel='noopener noreferrer';actions.append(a)}}catch{}}
  if(data.phone_public&&data.phone_e164){const call=node('a','اتصال','btn dark');call.href='tel:'+data.phone_e164;actions.append(call);
   const whatsapp=node('a','مراسلة واتساب','btn gold');whatsapp.href='https://wa.me/'+data.phone_e164.replace(/\D/g,'');whatsapp.target='_blank';whatsapp.rel='noopener noreferrer';actions.append(whatsapp);
   const quote=node('a','طلب عرض سعر عبر واتساب','btn');
   const draft=new URL(whatsapp.href);
   draft.searchParams.set('text','السلام عليكم، وجدت '+data.name+' في سوقك وأرغب في عرض سعر لخدمة '+data.specialty+'.');
   quote.href=draft.href;quote.target='_blank';quote.rel='noopener noreferrer';actions.append(quote);
  }
  const share=node('button','مشاركة رابط النشاط','btn');share.type='button';share.onclick=async()=>{try{if(navigator.share)await navigator.share({title:data.name,url:location.href});else if(navigator.clipboard){await navigator.clipboard.writeText(location.href);share.textContent='تم نسخ الرابط'}else share.textContent='انسخ الرابط من شريط العنوان'}catch(e){if(e.name!=='AbortError')share.textContent='انسخ الرابط من شريط العنوان'}};actions.append(share);body.append(actions);
  body.append(node('p','هذا النشاط أضافه صاحبه، ولا يعني نشره أنه معتمد أو مرخص من سوقك.','muted'));
 }catch(error){body.className='error';body.textContent='تعذر تحميل بيانات النشاط. حاول مرة ثانية لاحقًا.'}
}
start();
