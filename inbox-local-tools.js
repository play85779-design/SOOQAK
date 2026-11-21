/* V64 — on-device chat archive and inbox title search.
 * Does not alter server messages/conversations or send search terms to a server.
 */
(function(){
'use strict';
const PREFIX='sooqak:chat-archive:v1:';
function normalized(value){
 return String(value||'').toLowerCase().normalize('NFKC')
 .replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا')
 .replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim();
}
function readArchive(userId){
 try{
  const rows=JSON.parse(localStorage.getItem(PREFIX+userId)||'[]');
  return new Set(Array.isArray(rows)?rows.filter(x=>typeof x==='string'&&x.length<=160):[]);
 }catch(_e){return new Set()}
}
function writeArchive(userId,ids){
 try{localStorage.setItem(PREFIX+userId,JSON.stringify([...ids].slice(-200)));return true}
 catch(_e){return false}
}
function attach(conversations,userId){
 if(!userId||!Array.isArray(conversations)||window.state?.account?.id&&window.state.account.id!==userId)return;
 // 'state' is declared in app.js; never attach to a different signed-in user's inbox.
 if(typeof state==='undefined'||state.account?.id!==userId)return;
 const root=document.querySelector('#modalContent .small-cards[role="list"]');
 if(!root||root.dataset.chatArchiveAttached==='true')return;
 const cards=[...root.children].filter(node=>node.classList?.contains('small-card')&&node.querySelector('[data-chat-id]'));
 if(!cards.length)return;
 root.dataset.chatArchiveAttached='true';
 const archived=readArchive(userId);
 const searchable=new Map(cards.map(node=>[node,normalized(node.textContent)]));
 const toolbar=document.createElement('div');toolbar.className='sooqak-inbox-tools';
 const field=document.createElement('input');field.type='search';field.id='sooqakInboxSearch';
 field.placeholder='ابحث باسم الإعلان في المحادثات المعروضة';field.maxLength=80;
 field.setAttribute('aria-label','بحث في عناوين المحادثات المحمّلة');
 field.setAttribute('autocomplete','off');
 const option=document.createElement('label');option.className='sooqak-inbox-archive-toggle';
 const check=document.createElement('input');check.type='checkbox';check.id='sooqakShowArchived';
 option.append(check,document.createTextNode('عرض المحادثات المؤرشفة على هذا الجهاز'));
 const note=document.createElement('small');note.className='sooqak-inbox-privacy';
 note.textContent='بحث محلي في العناوين المعروضة فقط. الأرشفة لا تحذف الرسائل أو تخفيها من الخادم.';
 const summary=document.createElement('p');summary.id='sooqakInboxFilterStatus';
 summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');
 toolbar.append(field,option,note,summary);root.parentNode.insertBefore(toolbar,root);
 const empty=document.createElement('p');empty.id='sooqakInboxNoMatch';empty.className='info';
 empty.textContent='ما فيه محادثات مطابقة. جرّب تغير البحث أو عرض المؤرشفة.';
 empty.hidden=true;root.insertAdjacentElement('afterend',empty);
 const buttons=new Map();
 for(const card of cards){
  const open=card.querySelector('[data-chat-id]'),id=open?.dataset.chatId;
  const action=document.createElement('button');action.type='button';
  action.className='btn btn-subtle btn-mini sooqak-chat-archive-action';
  action.setAttribute('aria-label','تغيير أرشفة المحادثة على هذا الجهاز');
  action.addEventListener('click',()=>{
   if(state.account?.id!==userId)return;
   const next=new Set(archived);
   if(next.has(id))next.delete(id);else next.add(id);
   if(!writeArchive(userId,next)){if(typeof notify==='function')notify('تعذر حفظ الأرشفة على الجهاز');return}
   archived.clear();for(const key of next)archived.add(key);
   render();
  });
  open.insertAdjacentElement('afterend',action);
  buttons.set(card,{id,action});
 }
 function render(){
  if(state.account?.id!==userId)return;
  const query=normalized(field.value);let shown=0;
  for(const [card,{id,action}] of buttons){
   const isArchived=archived.has(id);
   action.textContent=isArchived?'إلغاء الأرشفة':'أرشفة على جهازي';
   const matches=!query||searchable.get(card).includes(query);
   const visible=matches&&(check.checked?isArchived:!isArchived);
   card.hidden=!visible;if(visible)shown++;
  }
  empty.hidden=shown!==0;
  summary.textContent=shown+(check.checked?' محادثة مؤرشفة ظاهرة':' محادثة ظاهرة');
 }
 field.addEventListener('input',render);
 check.addEventListener('change',render);
 render();
}
window.SOOQAK_INBOX_LOCAL=Object.freeze({attach,normalized,readArchive});
})();