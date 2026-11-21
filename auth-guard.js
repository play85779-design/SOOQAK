/* SOOQAK V37 - limited email-send protection; does NOT change Supabase limits. */
(()=>{
  'use strict';
  const KEY='sooqak:email-request-pause:v1';
  const THROTTLE_MS=15*60*1000;
  const now=()=>Date.now();
  const pauseUntil=()=>{try{return Math.max(0,Number(sessionStorage.getItem(KEY)||0)||0)}catch{return 0}};
  const setPause=()=>{try{sessionStorage.setItem(KEY,String(now()+THROTTLE_MS))}catch{}};
  function message(){
    const minutes=Math.max(1,Math.ceil((pauseUntil()-now())/60000));
    return `خدمة البريد وصلت حد الإرسال مؤقتًا. لا تكرر المحاولة الآن؛ يمكنك المحاولة بعد حوالي ${minutes} دقيقة، وقد يستمر حد مزود البريد لفترة أطول. حسابك الحالي لم يُحذف.`;
  }
  function showPause(){
    const form=document.getElementById('cloudLoginForm');
    if(!form)return;
    const btn=document.getElementById('authEmailSubmit');
    let hint=document.getElementById('sooqakEmailPause');
    if(!hint){hint=document.createElement('p');hint.id='sooqakEmailPause';hint.setAttribute('role','status');hint.setAttribute('aria-live','polite');hint.className='auth-security-note';form.appendChild(hint)}
    const active=pauseUntil()>now();
    hint.hidden=!active;
    if(active){if(hint.textContent!==message())hint.textContent=message();if(btn && form.dataset.authFlow!=='password-login'){btn.disabled=true;btn.setAttribute('aria-describedby',hint.id)}}
    else if(btn){btn.removeAttribute('aria-describedby')}
  }
  document.addEventListener('submit',e=>{
    if(e.target?.id!=='cloudLoginForm')return;
    if(e.target?.dataset?.authFlow==='password-login')return;
    if(pauseUntil()>now()){
      e.preventDefault();e.stopImmediatePropagation();showPause();
    }
  },true);
  // Observe only the response status, not auth content/tokens or email addresses.
  const originalFetch=window.fetch;
  if(typeof originalFetch==='function'){
    window.fetch=function(input,init){
      const url=typeof input==='string'?input:(input?.url||'');
      const isAuthSend=/\/auth\/v1\/(otp|signup)(?:[?#]|$)/.test(url);
      return originalFetch.apply(this,arguments).then(response=>{
        if(isAuthSend && response.status===429){setPause();queueMicrotask(showPause)}
        return response;
      });
    };
  }
  const obs=new MutationObserver(()=>{
    if(document.getElementById('cloudLoginForm') && pauseUntil()>now())showPause();
  });
  if(document.body)obs.observe(document.body,{childList:true,subtree:true});
  else document.addEventListener('DOMContentLoaded',()=>obs.observe(document.body,{childList:true,subtree:true}),{once:true});
})();
