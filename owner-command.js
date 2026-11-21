// A single, explicit snapshot read. No credentials, billing SDK or private values in this asset.
const commandMetrics={
 finance:{
  receipts_day:'المحصل اليوم', receipts_month:'المحصل هذا الشهر',receipts_year:'المحصل هذه السنة',
  paid:'المصروف المدفوع',due:'المصروف المستحق',net_cash:'صافي التدفق النقدي',cash:'السيولة المتاحة',
  reserve:'احتياطي التشغيل',budget_pct:'استهلاك الميزانية (%)',break_even:'مبيعات التعادل (ريال)',
  runway_months:'مدة بقاء السيولة (شهر)',covers_costs:'تغطية التشغيل بالمحصل (%)',
  vercel_cost:'تكلفة Vercel',supabase_cost:'تكلفة Supabase',github_cost:'تكلفة GitHub'
 },
 growth:{registered:'المسجلون',dau:'النشطون اليوم',mau:'النشطون خلال الشهر',sellers:'البائعون',buyers:'المشترون',
  published:'الإعلانات المنشورة',active:'الإعلانات النشطة',featured:'الإعلانات المميزة',declared:'الصفقات المعلنة',
  confirmed:'الصفقات المثبتة',paid_commission:'العمولة المحصلة',due_commission:'العمولة المستحقة',
  growth_pct:'نمو المستخدمين (%)',conversion_pct:'تحويل الزائر إلى مشترٍ (%)'},
 risk:{storage_bytes:'التخزين (بايت)',egress_bytes:'نقل البيانات (بايت)',errors:'الأخطاء المؤثرة',
  signup_limited:'طلبات التسجيل المقيّدة',messages_limited:'طلبات الإرسال المقيّدة',near_limit:'الخدمات القريبة من حدها',unverified:'خدمات بفوترة غير متحققة'}
};
async function openOwnerCommand(){
 const viewer=state.account?.id;
 if(!viewer)return openCloudLogin();
 showModal('SOOQAK Command Center | مركز قيادة سوقك','<p role="status">جاري التحقق من الصلاحية…</p>');
 const revision=modalRevision;
 const current=()=>modalRevision===revision && state.account?.id===viewer;
 try{
  const snapshot=await window.sooqakCloud.ownerCommandSnapshot();
  if(!current())return;
  const headings={finance:'الوضع المالي',growth:'النمو والتشغيل',risk:'المخاطر'};
  const content=document.createDocumentFragment();
  for(const scope of snapshot.scopes){
   const metrics=commandMetrics[scope];
   if(!metrics)continue;
   const section=document.createElement('section');
   const title=document.createElement('h3');title.textContent=headings[scope];section.append(title);
   const list=document.createElement('dl');
   for(const [key,label] of Object.entries(metrics)){
    const entry=snapshot.metrics.find(m=>m.scope===scope && m.metric===key);
    const term=document.createElement('dt');term.textContent=label;
    const detail=document.createElement('dd');
    detail.textContent=entry && entry.value!=null && entry.source && entry.observed_at
     ? entry.value+' · '+entry.source+' · '+new Date(entry.observed_at).toLocaleString('ar-SA',{timeZone:'Asia/Riyadh'})
     :'غير متاح — بانتظار مصدر متحقق منه';
    list.append(term,detail);
   }
   section.append(list);content.append(section);
  }
  $('modalContent').replaceChildren(content);
 }catch(error){
  if(current())$('modalContent').textContent=error?.code==='42501'?'هذا الحساب لا يملك صلاحية عرض المركز.':'تعذر التحقق من صلاحية المركز أو تحميل بياناته.';
 }
}
