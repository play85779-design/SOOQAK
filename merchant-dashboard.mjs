import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const api=createClient('https://zwbtiyqgrgjybwaguuyn.supabase.co','sb_publishable_42t2ty_ID8MfKoxQkw3CkA_3p1GG4kr');
const $=id=>document.getElementById(id),gate=$('dashGate'),panel=$('dashPanel');
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function deny(message,allowLogin=false){panel.hidden=true;gate.hidden=false;gate.replaceChildren();const p=document.createElement('p');p.textContent=message;gate.append(p);if(allowLogin){const a=document.createElement('a');a.href='./index.html?auth=login';a.textContent='دخول / إنشاء حساب';gate.append(a)}}
async function open(){
 deny('جاري التأكد من هوية صاحب الحساب…');
 try{
  const first=await api.auth.getUser(),user=first.data?.user;
  if(first.error||!user||!user.email_confirmed_at){deny('سجّل دخولك ببريد مؤكّد لعرض لوحة متجرك.',true);return}
  const accountResp=await api.from('sooqak_accounts').select('id,kind,display_name')
   .eq('owner_id',user.id).eq('kind','business').maybeSingle();
  if(accountResp.error)throw accountResp.error;
  const account=accountResp.data;
  if(!account||account.kind!=='business'||!uuid.test(account.id||'')){deny('ما عندك حساب متجر مفعّل بعد. افتح حسابك في سوقك واختر حساب المتجر.',true);return}
  const resp=await api.from('sooqak_listings').select('id,title,status,city,price,created_at',{count:'exact'})
   .eq('account_id',account.id).eq('seller_user_id',user.id).eq('seller_kind','business')
   .order('created_at',{ascending:false}).limit(50);
  if(resp.error)throw resp.error;
  const check=await api.auth.getUser();
  if(check.error||check.data?.user?.id!==user.id)throw Error('Session changed');
  $('dashStoreName').textContent=account.display_name||'متجري';
  $('dashPublicStore').href='./store.html?id='+encodeURIComponent(account.id);
  const rows=Array.isArray(resp.data)?resp.data:[];
  $('dashTotal').textContent=String(resp.count??rows.length);
  $('dashActive').textContent=String(rows.filter(x=>['active','reserved'].includes(x.status)).length);
  $('dashSold').textContent=String(rows.filter(x=>x.status==='sold').length);
  const list=$('dashListings');list.replaceChildren();
  if(!rows.length){const p=document.createElement('p');p.textContent='لا توجد إعلانات تابعة لهذا المتجر بعد.';list.append(p)}
  for(const item of rows){
   const row=document.createElement('div');row.className='so-dash-row';
   const info=document.createElement('div'),title=document.createElement('strong'),small=document.createElement('small');
   title.textContent=String(item.title||'إعلان بدون عنوان').slice(0,160);
   small.textContent=[item.city,Number.isFinite(Number(item.price))&&item.price!==null?Number(item.price).toLocaleString('ar-SA')+' ر.س':''].filter(Boolean).join(' · ');
   info.append(title,small);
   const status=document.createElement('span');status.className='so-dash-badge';status.textContent=({active:'نشط',reserved:'محجوز',sold:'مباع',expired:'منتهي',hidden:'مخفي'})[item.status]||'غير منشور';
   row.append(info,status);list.append(row);
  }
  gate.hidden=true;panel.hidden=false;
 }catch(_e){deny('تعذّر التحقق من صلاحيات المتجر أو تحميل بياناته. حاول مجددًا من حسابك.')}
}
api.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT')deny('تم تسجيل الخروج. سجّل الدخول للعرض.',true)});
open();