// V57 — isolated recovery page. No credentials or tokens are written to logs,
// browser storage or URLs; Supabase Auth remains the authority for the session.
const projectUrl='https://zwbtiyqgrgjybwaguuyn.supabase.co';
const publishableKey='sb_publishable_42t2ty_ID8MfKoxQkw3CkA_3p1GG4kr';
const el=id=>document.getElementById(id);
const form=el('recoveryForm'),status=el('recoveryStatus'),save=el('resetSave');
const success=el('recoverySuccess'),emailInput=el('recoveryEmail');
let allowedUserId=null,checkRevision=0,finished=false,client=null;
const setStatus=text=>{status.textContent=text;};
const hideForm=()=>{allowedUserId=null;form.hidden=true;save.disabled=true;};
function safeClearURL(){
  // Supabase must process the callback before stripping a code or hash.
  history.replaceState(null,'',location.pathname);
}
function hasProviderError(){
  const query=new URLSearchParams(location.search);
  const hash=new URLSearchParams(location.hash.slice(1));
  return ['error','error_code'].some(key=>query.has(key)||hash.has(key));
}
function readyForRecovery(user){
  allowedUserId=user.id;
  emailInput.value=user.email||'';
  form.hidden=false;save.disabled=false;
  setStatus('تم التحقق من رابط الاستعادة. أدخل كلمة مرور جديدة لحسابك أدناه.');
  safeClearURL();
}
async function verifyRecoverySession(session,revision){
  // Never let the query string alone grant permission to change a password.
  // Get the authoritative user from Auth, not from URL/email input.
  try{
    const {data,error}=await client.auth.getUser();
    if(revision!==checkRevision||finished)return;
    if(error||!data?.user?.id||data.user.id!==session.user.id){
      hideForm();setStatus('لم نتمكن من التحقق من جلسة الاستعادة. اطلب رابطًا جديدًا من صفحة الدخول.');
      return;
    }
    readyForRecovery(data.user);
  }catch(_error){
    if(revision!==checkRevision||finished)return;
    hideForm();setStatus('تعذر التحقق من رابط الاستعادة. حاول فتح أحدث رابط أو اطلب رابطًا جديدًا.');
  }
}
async function start(){
  hideForm();
  if(hasProviderError()){
    safeClearURL();
    setStatus('رابط الاستعادة منتهي الصلاحية أو غير صالح. اطلب رابطًا جديدًا من صفحة الدخول.');
    return;
  }
  try{
    const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    client=createClient(projectUrl,publishableKey,{auth:{persistSession:true,detectSessionInUrl:true,autoRefreshToken:true}});
    client.auth.onAuthStateChange((event,session)=>{
      if(finished)return;
      if(event==='PASSWORD_RECOVERY'&&session?.user?.id&&session.access_token){
        const revision=++checkRevision;
        // Avoid awaiting Auth calls inside the Supabase onAuthStateChange callback.
        setTimeout(()=>void verifyRecoverySession(session,revision),0);
      }else if(event==='SIGNED_OUT'){
        ++checkRevision;hideForm();
        setStatus('انتهت جلسة الاستعادة. اطلب رابطًا جديدًا من صفحة الدخول.');
      }
      // INITIAL_SESSION/SIGNED_IN + ?type=recovery is never sufficient.
    });
    setTimeout(()=>{
      if(!allowedUserId&&!finished&&form.hidden){
        setStatus('إذا لم تفتح شاشة تعيين كلمة المرور، فقد انتهى الرابط أو تعذر التحقق منه. اطلب رابطًا جديدًا من صفحة الدخول.');
      }
    },12000);
  }catch(_error){
    hideForm();setStatus('خدمة الحسابات غير متاحة حاليًا. أعد فتح الرابط عند عودة الاتصال.');
  }
}
form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!allowedUserId||!client||finished)return;
  const password=el('newPassword').value;
  if(password.length<8){setStatus('اختر كلمة مرور لا تقل عن 8 خانات.');return;}
  if(password!==el('confirmPassword').value){setStatus('كلمتا المرور غير متطابقتين.');return;}
  const expectedUser=allowedUserId;
  save.disabled=true;setStatus('جاري حفظ كلمة المرور الجديدة بشكل آمن…');
  try{
    const {data,error}=await client.auth.getUser();
    if(error||!data?.user?.id||data.user.id!==expectedUser||expectedUser!==allowedUserId){
      hideForm();setStatus('تغيرت الجلسة أو انتهت صلاحيتها. اطلب رابط استعادة جديدًا.');return;
    }
    const updated=await client.auth.updateUser({password});
    if(updated.error)throw updated.error;
    finished=true;allowedUserId=null;
    el('newPassword').value='';el('confirmPassword').value='';
    hideForm();success.hidden=false;
    safeClearURL();
    setStatus('نجح تعيين كلمة المرور الجديدة.');
    try{await client.auth.signOut();}catch(_error){
      setStatus('تم تغيير كلمة المرور، لكن تعذر تسجيل الخروج تلقائيًا. أغلق الصفحة قبل تسجيل الدخول مرة أخرى.');
    }
  }catch(_error){
    if(expectedUser!==allowedUserId||finished)return;
    setStatus('تعذر تغيير كلمة المرور. قد يكون الرابط منتهيًا أو كلمة المرور غير مقبولة. جرّب كلمة أقوى أو اطلب رابطًا جديدًا.');
    save.disabled=false;
  }
});
void start();
