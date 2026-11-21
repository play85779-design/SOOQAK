// Moderation: gated by server RPC and DB RLS; no secret key in the browser.
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const api=createClient('https://zwbtiyqgrgjybwaguuyn.supabase.co','sb_publishable_42t2ty_ID8MfKoxQkw3CkA_3p1GG4kr',{auth:{persistSession:true,detectSessionInUrl:true,autoRefreshToken:true}});
const $=id=>document.getElementById(id);
const el=(tag,value,cls='')=>{const x=document.createElement(tag);if(value!==undefined)x.textContent=value;if(cls)x.className=cls;return x};
let admin=false,reportRequest=0;

// New/edited service entries stay invisible until a verified administrator approves.
async function refreshPending(){
 if(!admin)return;
 $('pendingStatus').textContent='جاري تحميل طلبات الاعتماد…';$('pendingServices').replaceChildren();
 const r=await api.from('sooqak_service_directory')
  .select('id,name,kind,city,district,specialty,description,created_at,updated_at,moderation_state')
  .eq('moderation_state','pending').order('updated_at',{ascending:true}).limit(100);
 if(r.error){$('pendingStatus').textContent='تعذر تحميل الطلبات: '+r.error.message;return}
 if(!admin)return;
 const rows=r.data||[];
 $('pendingStatus').textContent=rows.length?`يوجد ${rows.length} طلب اعتماد${rows.length===100?' (تعرض أول 100 فقط)':''}.`:'لا توجد طلبات اعتماد معلقة.';
 for(const svc of rows){
  const article=el('article');
  article.append(el('h2',svc.name),el('p',[svc.city,svc.kind,svc.specialty].filter(Boolean).join(' • '),'muted'));
  if(svc.description)article.append(el('p',svc.description));
  article.append(el('p','آخر تعديل: '+new Date(svc.updated_at).toLocaleString('ar-SA'),'muted'));
  const actions=el('div',undefined,'actions');
  const approve=el('button','اعتماد ونشر النشاط','btn');approve.type='button';
  approve.onclick=()=>decideService(svc,'approved');actions.append(approve);
  const suspend=el('button','رفض وإيقاف النشاط','btn danger');suspend.type='button';
  suspend.onclick=()=>decideService(svc,'suspended');actions.append(suspend);
  article.append(actions);$('pendingServices').append(article);
 }
}
async function decideService(svc,decision){
 if(!admin||!['approved','suspended'].includes(decision))return;
 const question=decision==='approved'?`هل راجعت بيانات «${svc.name}» وتريد اعتمادها للعرض العام؟`:`هل تريد إيقاف طلب «${svc.name}»؟ لن يظهر للزوار.`;
 if(!confirm(question))return;
 $('pendingStatus').textContent='جارٍ حفظ قرار المراجعة…';
 const r=await api.from('sooqak_service_directory')
  .update({moderation_state:decision})
  .eq('id',svc.id).eq('moderation_state','pending').select('id').single();
 if(r.error){$('pendingStatus').textContent='تعذر اعتماد القرار: '+r.error.message;return}
 await refreshPending();
}

async function refresh(){
 if(!admin)return;
 $('status').textContent='جاري جلب البلاغات…';$('reports').replaceChildren();
 const state=$('statusFilter').value,request=++reportRequest;
 const r=await api.from('sooqak_service_reports').select('id,service_id,reason,details,status,created_at,sooqak_service_directory(name,city,kind,status,moderation_state)').eq('status',state).order('created_at',{ascending:false}).limit(100);
 if(!admin||request!==reportRequest)return;
 if(r.error){$('status').textContent='تعذر جلب البلاغات: '+r.error.message;return;}
 const rows=r.data||[];$('status').textContent=rows.length?`تم عرض ${rows.length} بلاغًا (${state==='pending'?'مفتوح':'مغلق'}).`:'لا توجد بلاغات في هذا التصنيف.';
 for(const d of rows){
  const article=el('article');
  const svc=d.sooqak_service_directory||{};
  article.append(el('h2',svc.name||'نشاط غير متاح'),el('p',[svc.city,svc.kind,d.reason].filter(Boolean).join(' • '),'muted'));
  if(d.details)article.append(el('p',d.details));
  article.append(el('p','تاريخ البلاغ: '+new Date(d.created_at).toLocaleString('ar-SA'),'muted'));
  const actions=el('div',undefined,'actions');
  if(svc.status==='active'&&svc.moderation_state==='approved'){
   const a=el('a','فتح صفحة النشاط','btn');a.href='./service-detail.html?id='+encodeURIComponent(d.service_id);a.target='_blank';a.rel='noopener noreferrer';actions.append(a);
  }
  if(state==='pending'){
   const close=el('button','إغلاق البلاغ بعد المراجعة','btn');close.type='button';close.onclick=()=>moderate(d,false);actions.append(close);
   if(svc.status==='active'&&svc.moderation_state==='approved'){
    const hide=el('button','إخفاء النشاط وإغلاق البلاغ','btn danger');hide.type='button';hide.onclick=()=>moderate(d,true);actions.append(hide);
   }
  }
  article.append(actions);$('reports').append(article)
 }
}
async function moderate(d,hide){
 if(!admin)return;
 if(!confirm(hide?'تأكيد إخفاء النشاط عن الزوار مع إغلاق البلاغ؟':'تأكيد إغلاق البلاغ دون إخفاء النشاط؟'))return;
 $('status').textContent='جارٍ حفظ قرار المراجعة…';
 try{
  if(hide){const x=await api.from('sooqak_service_directory').update({moderation_state:'suspended',updated_at:new Date().toISOString()}).eq('id',d.service_id).select('id').single();if(x.error)throw x.error;}
  const y=await api.from('sooqak_service_reports').update({status:'closed'}).eq('id',d.id).select('id').single();if(y.error)throw y.error;
  await refresh();
 }catch(e){$('status').textContent='تعذر حفظ القرار: '+(e.message||'خطأ مؤقت')}
}
(async()=>{try{
 const u=await api.auth.getUser();if(u.error||!u.data?.user?.email_confirmed_at){$('status').textContent='يلزم تسجيل الدخول بحساب موثّق قبل فتح لوحة الإدارة.';return}
 let sessionChanged=false;
 api.auth.onAuthStateChange?.((event,session)=>{
  if(session?.user?.id===u.data.user.id)return;
  sessionChanged=true;admin=false;++reportRequest;
  $('adminTools').hidden=true;
  $('pendingServices').replaceChildren();$('reports').replaceChildren();
  $('status').textContent='تغيّر الحساب. أعد فتح الصفحة للتحقق من صلاحيات الحساب الحالي.';
 });
 const r=await api.rpc('sooqak_is_admin');if(sessionChanged)return;if(r.error||r.data!==true){$('status').textContent='هذه الصفحة للمشرفين المصرح لهم فقط.';return}
 admin=true;$('adminTools').hidden=false;$('statusFilter').onchange=refresh;$('reload').onclick=refresh;$('pendingReload').onclick=refreshPending;await Promise.all([refreshPending(),refresh()]);
 }catch(e){$('status').textContent='تعذر التحقق من صلاحيات الإدارة. حاول لاحقًا.'}})();
