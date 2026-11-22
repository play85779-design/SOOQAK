// SOOQAK V26 – paged directory, owner manager, safe sharing.
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const api=createClient('https://zwbtiyqgrgjybwaguuyn.supabase.co','sb_publishable_42t2ty_ID8MfKoxQkw3CkA_3p1GG4kr',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
const labels={workshop:'الورش',plumbing:'محلات السباكة',delivery:'مناديب التوصيل'};
const specialties={workshop:['ميكانيكا سيارات','كهرباء سيارات','سمكرة وبوية','إطارات','زيوت','تكييف سيارات','حدادة','نجارة','ألمنيوم','صيانة وتكييف'],plumbing:['أدوات صحية','مواسير ووصلات','خلاطات','مستلزمات سباكة','قطع غيار'],delivery:['توصيل طرود','توصيل طلبات','توصيل داخل المدينة','توصيل بين المدن','نقل خفيف']};
const cities=['الرياض','جدة','الدمام','الخبر','الجبيل','الأحساء','القطيف','الظهران','مكة','المدينة','الطائف','أبها','خميس مشيط','تبوك','حائل','بريدة','عنيزة','جازان','نجران','ينبع','الخرج','حفر الباطن','عرعر','سكاكا','الباحة','بيشة','القنفذة','صبيا','محايل عسير','رفحاء','الخفجي','رأس تنورة','بقيق','النعيرية','شرورة','وادي الدواسر'];
const p=new URLSearchParams(location.search), kind=labels[p.get('kind')]?p.get('kind'):'all';
const cols='id,owner_id,kind,name,city,district,specialty,description,phone_e164,phone_public,address_text,hours_text,map_url,status,moderation_state,created_at';
const pageSize=24;
let user=null,canWrite=false,entries=[],page=0,total=0,busy=false,requestId=0,mineMode=p.get('mine')==='1',filterTimer=null,loadFailed=false;
const el=(tag,cls='',value)=>{let n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
function feedback(msg,error=false){$('feedback').textContent=msg;$('feedback').hidden=!msg;$('feedback').classList.toggle('error',error)}
function toast(msg){const n=$('toast');n.textContent=msg;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),3500)}
function validPhone(raw){let s=String(raw||'').trim().replace(/[^+\d]/g,'');if(/^05\d{8}$/.test(s))s='+966'+s.slice(1);if(/^5\d{8}$/.test(s))s='+966'+s;if(/^9665\d{8}$/.test(s))s='+'+s;return /^\+[1-9]\d{7,14}$/.test(s)?s:null}
function safeSearch(raw){return String(raw||'').replace(/[,().*%_\\"']/g,' ').replace(/\s+/g,' ').trim().slice(0,70)}
function closeDialog(){$('dialog').hidden=true;$('modalBody').replaceChildren();document.body.style.overflow='';}
function showDialog(title){$('modalTitle').textContent=title;$('modalBody').replaceChildren();$('dialog').hidden=false;document.body.style.overflow='hidden';$('close').focus()}
function entryHref(d){return './service-detail.html?id='+encodeURIComponent(d.id)}
function authLink(){const params=new URLSearchParams();if(kind!=='all')params.set('kind',kind);if(mineMode)params.set('mine','1');const next='./services.html'+(params.size?'?'+params.toString():'');try{sessionStorage.setItem('sooqak_return_to',next);sessionStorage.setItem('sooqak_return_at',String(Date.now()))}catch{}const u=new URL('./index.html',location.href);u.searchParams.set('auth','signup');return u.href}
function selectOptions(name){return name==='kind'?Object.keys(labels).map(k=>[k,labels[k]]):(specialties[name]||[]).map(s=>[s,s])}
function allowedMapUrl(text){if(!text)return '';try{const u=new URL(text);const h=u.hostname.toLowerCase();return u.protocol==='https:'&&(h==='maps.app.goo.gl'||h==='goo.gl'&&u.pathname.startsWith('/maps/')||['maps.google.com','maps.google.com.sa'].includes(h)||['www.google.com','www.google.com.sa','google.com','google.com.sa'].includes(h)&&u.pathname.startsWith('/maps/'))?u.href:''}catch{return ''}}
function buildFilter(){const q=$('search').value.trim(),city=$('city').value,sp=$('specialty').value;return{q,city,sp}}
function cardFor(d){
 const card=el('article','card');card.dataset.serviceId=d.id;
 const title=el('h3');const link=el('a','service-title',d.name);link.href=entryHref(d);title.append(link);card.append(title);
 card.append(el('p','meta',[labels[d.kind],d.specialty,d.city,d.district].filter(Boolean).join(' • ')));
 if(d.moderation_state==='suspended')card.append(el('p','notice','النشاط موقوف من الإدارة؛ لا يمكن إعادة نشره حتى المراجعة.'));else if(d.moderation_state==='pending')card.append(el('p','notice','النشاط بانتظار مراجعة الإدارة؛ لا يظهر للزوار حاليًا. يمكنك تعديل بياناته.'));else if(d.status==='hidden')card.append(el('p','muted','هذا النشاط مخفي عن الزوار'));
 if(d.description)card.append(el('p','',d.description.length>175?d.description.slice(0,175)+'…':d.description));
 card.append(el('p','meta',['📍 '+(d.address_text||d.city),d.hours_text?'⏰ '+d.hours_text:''].filter(Boolean).join(' | ')));
 const actions=el('div','actions');const detail=el('a','btn','عرض التفاصيل');detail.href=entryHref(d);actions.append(detail);
 if(d.status==='active'&&d.map_url&&allowedMapUrl(d.map_url)){const map=el('a','btn','الموقع على الخريطة');map.href=allowedMapUrl(d.map_url);map.target='_blank';map.rel='noopener noreferrer';actions.append(map)}
 if(d.status==='active'&&d.phone_public&&d.phone_e164){const tel=el('a','btn dark','اتصال');tel.href='tel:'+d.phone_e164;actions.append(tel);const wa=el('a','btn','واتساب');wa.href='https://wa.me/'+d.phone_e164.replace(/\D/g,'');wa.target='_blank';wa.rel='noopener noreferrer';actions.append(wa)}
 if(user&&d.owner_id===user.id){const edit=el('button','btn','تعديل');edit.type='button';edit.onclick=()=>openEditor(d);actions.append(edit);const toggle=el('button','btn',d.status==='active'?'إخفاء':'إعادة النشر');toggle.type='button';toggle.disabled=d.moderation_state==='suspended';toggle.title=toggle.disabled?'نشاط موقوف من الإدارة':'';toggle.onclick=()=>toggleVisibility(d);actions.append(toggle)}
 else if(user&&d.status==='active'){const report=el('button','btn','إبلاغ');report.type='button';report.onclick=()=>openReport(d);actions.append(report)}
 card.append(actions);card.append(el('p','meta','البيانات يضيفها صاحب النشاط، وليست اعتمادًا رسميًا من سوقك.'));
 return card;
}
function render(){
 $('cards').replaceChildren(...entries.map(cardFor));
 const shown=entries.length,ownWithoutLogin=mineMode&&!user;
 const showEmpty=shown===0&&!busy&&!loadFailed;
 $('empty').hidden=!showEmpty;
 if(showEmpty){
  const f=buildFilter(),filtered=Boolean(f.q||f.city||f.sp||kind!=='all');
  $('emptyTitle').textContent=ownWithoutLogin?'سجّل الدخول لإدارة أنشطتك':mineMode?'ما عندك أنشطة مضافة حاليًا':filtered?'ما لقينا أنشطة تطابق بحثك':'ما فيه أنشطة منشورة حاليًا';
  $('emptyDescription').textContent=ownWithoutLogin?'بعد تسجيل الدخول تقدر تتابع أنشطتك المنشورة والمخفية والمنتظرة للمراجعة.':mineMode?'أضف نشاطك الأول، وبتلقى هنا حالة نشره ومراجعته.':filtered?'جرّب تغيير المدينة أو التخصص، أو اضغط مسح الفلاتر.':'كن أول من يضيف نشاطًا حقيقيًا إلى الدليل.';
  $('emptyLogin').hidden=!ownWithoutLogin;
  if(ownWithoutLogin)$('emptyLogin').href=authLink();
 }
 $('count').textContent=busy?'جاري التحميل…':ownWithoutLogin?'سجّل الدخول لعرض أنشطتك':`عرض ${shown} من ${total} نشاط${mineMode?' خاص بك':''}`;
 $('loadMore').hidden=shown>=total||busy||ownWithoutLogin;
 $('loadMore').disabled=busy;
 $('mineButton').textContent=mineMode?'عرض جميع الأنشطة':'إدارة أنشطتي';
 $('mineButton').setAttribute('aria-pressed',String(mineMode));
}
async function loadPage(reset=false){
 if(busy&&!reset)return;
 const current=++requestId;busy=true;
 if(reset){entries=[];page=0;total=0;}
 loadFailed=false;render();feedback('');$('retryLoad').hidden=true;
 if(mineMode&&!user){busy=false;render();return}
 const f=buildFilter(),start=page*pageSize;
 $('clearFilters').hidden=!(f.q||f.city||f.sp);
 const url=new URL(location.href);
 for(const [key,value] of [['city',f.city],['specialty',f.sp]]){
  if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);
 }
 history.replaceState(null,'',url);
 let q=api.from('sooqak_service_directory').select(cols,{count:'exact'}).order('created_at',{ascending:false}).order('id',{ascending:false}).range(start,start+pageSize-1);
 if(mineMode)q=q.eq('owner_id',user.id);else q=q.eq('status','active').eq('moderation_state','approved');
 if(kind!=='all')q=q.eq('kind',kind);
 if(f.city)q=q.ilike('city','%'+safeSearch(f.city)+'%');
 if(f.sp)q=q.eq('specialty',f.sp);
 const search=safeSearch(f.q);
 if(search)q=q.or(`name.ilike.%${search}%,description.ilike.%${search}%,specialty.ilike.%${search}%,district.ilike.%${search}%`);
 try{const {data,count,error}=await q;if(error)throw error;if(current!==requestId)return;entries=reset?[...(data||[])]:entries.concat(data||[]);total=count??entries.length;page++;}
 catch(e){if(current!==requestId)return;loadFailed=true;feedback('تعذر تحميل النتائج. تحقق من الاتصال ثم اضغط إعادة المحاولة.',true);$('retryLoad').hidden=false;}
 finally{if(current===requestId){busy=false;render();}}
}
function debounceReload(){clearTimeout(filterTimer);filterTimer=setTimeout(()=>loadPage(true),260)}
function openEditor(existing=null){
 if(!canWrite){showDialog('تسجيل نشاطك');$('modalBody').append(el('p','notice','إضافة النشاط تحتاج حسابًا حقيقيًا وبريدًا مؤكدًا. بعد الدخول ترجع إلى قسمك تلقائيًا.'));const link=el('a','btn gold','إنشاء حساب أو تسجيل الدخول');link.href=authLink();$('modalBody').append(link);return}
 const k=existing?.kind||(kind==='all'?'workshop':kind);showDialog(existing?'تعديل النشاط':k==='workshop'?'أضف ورشتك':k==='plumbing'?'أضف محلك':'سجّل خدمة التوصيل');
 const f=el('form','form-grid');f.id='serviceForm';const fields=[['kind','نوع النشاط','select',k],['name','اسم النشاط','text',existing?.name||''],['city','المدينة','text',existing?.city||''],['district','الحي (اختياري)','text',existing?.district||''],['specialty','التخصص','select',existing?.specialty||''],['address_text','وصف الموقع (اختياري)','text',existing?.address_text||''],['map_url','رابط موقع Google Maps (اختياري)','url',existing?.map_url||''],['hours_text','أوقات العمل (اختيارية)','text',existing?.hours_text||''],['phone_e164','رقم التواصل (اختياري)','tel',existing?.phone_e164||''],['description','نبذة الخدمات','textarea',existing?.description||'']];
 const refs={};for(const [name,label,type,val]of fields){const labelEl=el('label',name==='description'?'full':'');labelEl.append(el('span','',label));let input=el(type==='select'?'select':type==='textarea'?'textarea':'input');if(type==='select'){(name==='kind'?Object.entries(labels):specialties[k].map(v=>[v,v])).forEach(([value,label])=>input.append(new Option(label,value)))}else {if(type==='textarea')input.rows=4;else input.type=type;input.value=val;}input.name=name;if(name==='kind'&&existing)input.disabled=true;if(type==='select'&&val)input.value=val;if(['name','city','specialty'].includes(name))input.required=true;input.maxLength={name:100,city:70,district:70,specialty:140,address_text:160,map_url:550,hours_text:140,description:1500,phone_e164:18}[name]||1500;if(name==='city'){input.setAttribute('list','cityOptions');input.placeholder='مثال: الجبيل'}labelEl.append(input);f.append(labelEl);refs[name]=input;}
 const dl=el('datalist');dl.id='cityOptions';cities.forEach(c=>dl.append(new Option(c,c)));f.append(dl);
 refs.kind.onchange=()=>{refs.specialty.replaceChildren(...(specialties[refs.kind.value]||[]).map(s=>new Option(s,s)))};
 if(!existing)refs.kind.onchange();
 const consent=el('label','full check'),check=el('input');check.type='checkbox';check.checked=Boolean(existing?.phone_public);consent.append(check,el('span','','أوافق على نشر رقم التواصل للعامة (غير موثّق من سوقك)'));f.append(consent);
 const row=el('div','row'),save=el('button','btn gold','حفظ النشاط');save.type='submit';row.append(save);f.append(row);
 f.onsubmit=async e=>{e.preventDefault();if(!f.reportValidity())return;const v=Object.fromEntries(new FormData(f).entries());const ph=v.phone_e164?validPhone(v.phone_e164):null;if(v.phone_e164&&!ph)return toast('رقم التواصل غير صالح');if(!v.name?.trim()||!v.city?.trim()||!v.specialty)return toast('الاسم والمدينة والتخصص مطلوبة');if(v.map_url&&!allowedMapUrl(v.map_url))return toast('أدخل رابط Google Maps صحيحًا يبدأ بـ https');const record={kind:existing?existing.kind:v.kind,name:v.name.trim(),city:v.city.trim(),district:v.district.trim(),specialty:v.specialty,description:v.description.trim(),phone_e164:ph&&check.checked?ph:null,phone_public:Boolean(ph&&check.checked),address_text:v.address_text.trim(),map_url:allowedMapUrl(v.map_url),hours_text:v.hours_text.trim(),updated_at:new Date().toISOString()};save.disabled=true;try{let request=existing?api.from('sooqak_service_directory').update(record).eq('id',existing.id).eq('owner_id',user.id).select('id').single():api.from('sooqak_service_directory').insert({...record,owner_id:user.id}).select('id').single();const {error}=await request;if(error)throw error;closeDialog();if(!existing){mineMode=true;const u=new URL(location.href);u.searchParams.set('mine','1');history.replaceState(null,'',u)}toast(existing?'تم حفظ التعديلات. تابع حالة نشاطك من إدارة أنشطتي.':'تم حفظ نشاطك. تابعه من إدارة أنشطتي؛ ولن يظهر للزوار حتى المراجعة.');$('search').value='';$('specialty').value='';$('city').value='';await loadPage(true)}catch(error){toast('تعذر الحفظ: '+(error.message||'خطأ غير معروف'));save.disabled=false;}};
 $('modalBody').append(f);
}
async function toggleVisibility(d){if(!user||d.owner_id!==user.id)return toast('يجب تسجيل الدخول بحساب صاحب النشاط لإدارته');if(d.moderation_state==='suspended')return toast('هذا النشاط موقوف من الإدارة ولا يمكن نشره دون مراجعة');const status=d.status==='active'?'hidden':'active';if(status==='active'&&!confirm('إعادة إظهار النشاط للزوار؟'))return;const {error}=await api.from('sooqak_service_directory').update({status,updated_at:new Date().toISOString()}).eq('id',d.id).eq('owner_id',user.id).select('id').single();if(error)return toast('تعذر تغيير الحالة: '+error.message);toast(status==='hidden'?'تم إخفاء نشاطك عن الزوار':(d.moderation_state==='pending'?'تم تفعيل النشاط في حسابك، وسيبقى غير ظاهر للزوار حتى الاعتماد':'تمت إعادة إظهار نشاطك')); await loadPage(true)}
function openReport(d){if(!user)return toast('تسجيل الدخول مطلوب للإبلاغ');showDialog('إبلاغ عن نشاط');const f=el('form','form-grid');const reason=el('select');reason.name='reason';['معلومات غير صحيحة','احتيال محتمل','محتوى غير مناسب','سبب آخر'].forEach(s=>reason.append(new Option(s,s)));const info=el('textarea');info.maxLength=500;info.placeholder='اشرح المشكلة بدون معلومات شخصية';const labelR=el('label','full');labelR.append(el('span','','سبب البلاغ'),reason);const labelI=el('label','full');labelI.append(el('span','','التفاصيل (اختيارية)'),info);const save=el('button','btn gold','إرسال البلاغ');save.type='submit';f.append(labelR,labelI,save);f.onsubmit=async e=>{e.preventDefault();save.disabled=true;const {error}=await api.from('sooqak_service_reports').insert({service_id:d.id,reporter_id:user.id,reason:reason.value,details:info.value.trim()});if(error){toast(error.code==='23505'?'لديك بلاغ مفتوح عن هذا النشاط؛ لا تحتاج إلى إرسال بلاغ آخر.':'تعذر إرسال البلاغ');save.disabled=false}else{closeDialog();toast('تم استلام البلاغ للمراجعة')}};$('modalBody').append(f)}
async function init(){
 document.querySelectorAll('[data-kind]').forEach(a=>a.classList.toggle('active',a.dataset.kind===kind));$('sectionTitle').textContent=kind==='all'?'جميع الخدمات':labels[kind];$('addService').textContent=kind==='workshop'?'＋ أضف ورشتك':kind==='plumbing'?'＋ أضف محلك':kind==='delivery'?'＋ سجّل خدمة التوصيل':'＋ أضف نشاطك';
 cities.forEach(v=>$('cityFilterOptions').append(new Option(v,v)));
 [...new Set(kind==='all'?Object.values(specialties).flat():specialties[kind])].forEach(s=>$('specialty').append(new Option(s,s)));
 $('city').value=(p.get('city')||'').slice(0,70);
 $('specialty').value=p.get('specialty')||'';
 $('clearFilters').onclick=()=>{
  clearTimeout(filterTimer);
  for(const key of ['search','city','specialty'])$(key).value='';
  loadPage(true);
 };
 ['search','city'].forEach(id=>$(id).addEventListener('input',debounceReload));$('specialty').addEventListener('change',()=>loadPage(true));
 $('addService').onclick=()=>openEditor();$('loadMore').onclick=()=>loadPage();$('retryLoad').onclick=()=>loadPage(true);
 $('mineButton').onclick=()=>{mineMode=!mineMode;const u=new URL(location.href);if(mineMode)u.searchParams.set('mine','1');else u.searchParams.delete('mine');history.replaceState(null,'',u);loadPage(true)};
 $('close').onclick=closeDialog;$('dialog').onclick=e=>{if(e.target===$('dialog'))closeDialog()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDialog()});
 try{const {data,error}=await api.auth.getUser();if(error&&error.name!=='AuthSessionMissingError')throw error;user=data?.user||null;canWrite=Boolean(user?.email_confirmed_at)}catch(e){feedback('تعذر قراءة جلسة الحساب. يمكن تصفح الدليل بدون تسجيل.',true)}
 await loadPage(true);
 if(user){api.rpc('sooqak_is_admin').then(({data,error})=>{if(data===true&&!error)$('adminServices').hidden=false}).catch(()=>{})}
}
init();
