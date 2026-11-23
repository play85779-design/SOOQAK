/* V92 progressive UI enrichment.
 * No new accounts, products, records, payment actions or cloud calls.
 * Existing event bindings and real data remain unchanged. */
(()=>{
'use strict';
const $=selector=>document.querySelector(selector);
function mountNoticeToggle(){
 const notice=document.querySelector('body > .demo-banner:not(#v12OfflineBanner)');
 if(!notice||notice.querySelector('.v92-notice-toggle'))return;
 const button=document.createElement('button');
 button.type='button';
 button.className='v92-notice-toggle';
 button.textContent=notice.classList.contains('v92-expanded')?'أقل':'التفاصيل';
 button.setAttribute('aria-label','عرض تفاصيل تنبيه النسخة التجريبية');
 button.setAttribute('aria-expanded',String(notice.classList.contains('v92-expanded')));
 button.addEventListener('click',()=>{
  const expanded=notice.classList.toggle('v92-expanded');
  button.textContent=expanded?'إخفاء':'التفاصيل';
  button.setAttribute('aria-expanded',String(expanded));
 });
 notice.append(button);
}
const paths={
 home:'<path d="m3 10 9-7 9 7v10h-6v-6H9v6H3z"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
 favorites:'<path d="M20.8 4.6c-2.3-2.3-6.1-2.3-8.4 0L12 5l-.4-.4a5.93 5.93 0 0 0-8.4 8.4L12 21l8.8-8a5.93 5.93 0 0 0 0-8.4z"/>',
 account:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2c0-4 3.4-6 8-6s8 2 8 6v2"/>',
 post:'<circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/>'
};
function upgradeNav(){
 for(const button of document.querySelectorAll('.mobile-nav [data-nav]')){
  const icon=paths[button.dataset.nav];
  const span=button.querySelector('span');
  if(!icon||!span||span.querySelector('svg'))continue;
  span.innerHTML='<svg class="v92-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+icon+'</svg>';
 }
}
function upgradeCategories(){
 // Keep original buttons and click handlers; only mark the category strip for keyboard users.
 const categories=$('#categoryCards');
 if(!categories)return;
 categories.setAttribute('aria-label','تصفح أقسام سوقك');
 categories.setAttribute('role','group');
}
function init(){
 document.body.classList.add('v92-joyful');
 upgradeNav();
 upgradeCategories();
 mountNoticeToggle();
 const banner=document.querySelector('body > .demo-banner:not(#v12OfflineBanner)');
 if(banner){
  // The existing app occasionally refreshes the safety banner text after login.
  const observer=new MutationObserver(()=>mountNoticeToggle());
  observer.observe(banner,{childList:true});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
