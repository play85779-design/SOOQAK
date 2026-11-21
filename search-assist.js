/* V53 — small, private-on-device search suggestions and single-edit typo help.
 * Existing app search remains the only search transport. This module makes NO network calls.
 */
(function(){
'use strict';
const PANEL_ID='sooqakSearchHints';
const MAX_TERMS=5;
const text=v=>String(v??'');
function normalize(value){
 return text(value).toLowerCase().normalize('NFKC')
  .replace(/[\u064b-\u065f\u0670\u0640]/g,'')
  .replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')
  .replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[^\p{L}\p{N}\s]/gu,' ')
  .replace(/\s+/g,' ').trim();
}
function oneEditAway(a,b){
 if(a===b||Math.abs(a.length-b.length)>1||a.length<2)return false;
 let i=0,j=0,edits=0;
 if(a.length===b.length){
  const mismatches=[];
  for(let k=0;k<a.length;k++)if(a[k]!==b[k])mismatches.push(k);
  if(mismatches.length===1)return true;
  return mismatches.length===2 && mismatches[1]===mismatches[0]+1 &&
   a[mismatches[0]]===b[mismatches[1]] && a[mismatches[1]]===b[mismatches[0]];
 }
 while(i<a.length&&j<b.length){
  if(a[i]===b[j]){i++;j++;continue}
  if(++edits>1)return false;
  if(a.length>b.length)i++;else j++;
 }
 return true;
}
function terms(){
 const pool=[];
 const add=value=>{
  const parts=normalize(value).split(' ');
  for(const original of text(value).split(/[\s،,.:!?()[\]{}]+/u)){
   const key=normalize(original);
   if(key.length>=3&&key.length<=28&&parts.includes(key))pool.push({label:original,key});
  }
 };
 const ads=typeof allAds==='function'?allAds():[];
 for(const ad of ads.slice(0,250)){
  if(ad.hidden||ad.status==='مباع'||ad.status==='منتهي'||(typeof active==='function'&&!active(ad)))continue;
  add(ad.title);add(ad.category);add(ad.city);add(ad.subcategory);
 }
 for(const category of (window.SOOQAK_CATEGORY_TREE||[])){
  add(category.name);
  for(const child of category.subcategories||[])add(child.ar);
 }
 const city=document.getElementById('cityFilter');
 if(city)for(const option of city.options)if(option.value)add(option.value);
 const found=new Map();
 for(const term of pool)if(!found.has(term.key))found.set(term.key,term.label);
 return found;
}
function suggestions(query){
 const trimmed=text(query).trim().slice(0,100);
 const parts=trimmed.split(/\s+/);
 const original=parts.pop()||'';
 const wanted=normalize(original);
 if(wanted.length<2||wanted.length>28)return [];
 const prefix=parts.join(' '),items=[];
 for(const [key,label] of terms()){
  if(key===wanted)continue;
  const type=key.startsWith(wanted)?'prefix':wanted.length>=3&&oneEditAway(wanted,key)?'correction':null;
  if(!type)continue;
  items.push({label,value:(prefix?prefix+' ':'')+label,type,key});
 }
 items.sort((a,b)=>(a.type===b.type?0:a.type==='prefix'?-1:1)||a.key.length-b.key.length||a.key.localeCompare(b.key,'ar'));
 const used=new Set();
 return items.filter(x=>{const key=normalize(x.value);if(used.has(key))return false;used.add(key);return true}).slice(0,MAX_TERMS);
}
function init(){
 const input=document.getElementById('searchInput');
 if(!input||document.getElementById(PANEL_ID))return;
 const host=input.closest('.header-search');
 if(!host)return;
 const panel=document.createElement('div');
 panel.id=PANEL_ID;panel.className='sooqak-search-hints';
 panel.setAttribute('role','listbox');panel.setAttribute('aria-label','اقتراحات البحث');
 panel.hidden=true;host.appendChild(panel);
 input.setAttribute('aria-controls',PANEL_ID);
 input.setAttribute('aria-autocomplete','list');
 input.setAttribute('aria-expanded','false');
 let current=[],selected=-1;
 const close=()=>{panel.hidden=true;input.setAttribute('aria-expanded','false');selected=-1;input.removeAttribute('aria-activedescendant')};
 function choose(index){
  const item=current[index];if(!item)return;
  input.value=item.value;
  close();input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();
 }
 function highlight(){
  for(const [index,node] of [...panel.children].entries()){
   node.setAttribute('aria-selected',String(index===selected));
   node.classList.toggle('is-active',index===selected);
  }
  if(selected<0)input.removeAttribute('aria-activedescendant');
  else input.setAttribute('aria-activedescendant',PANEL_ID+'-option-'+selected);
 }
 function update(){
  current=suggestions(input.value);selected=-1;panel.replaceChildren();
  for(const [index,item] of current.entries()){
   const button=document.createElement('button');
   button.type='button';button.id=PANEL_ID+'-option-'+index;
   button.className='sooqak-search-hint';button.setAttribute('role','option');
   button.setAttribute('aria-selected','false');
   const kind=document.createElement('small');
   kind.textContent=item.type==='correction'?'هل تقصد':'اقتراح';
   const value=document.createElement('span');value.textContent=item.value;
   button.append(kind,value);
   button.addEventListener('pointerdown',event=>event.preventDefault());
   button.addEventListener('click',()=>choose(index));
   panel.appendChild(button);
  }
  panel.hidden=current.length===0;
  input.setAttribute('aria-expanded',String(!panel.hidden));
 }
 input.addEventListener('input',update);
 input.addEventListener('focus',update);
 input.addEventListener('keydown',event=>{
  if(event.key==='Escape'){close();return}
  if(panel.hidden)return;
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();selected=(selected+(event.key==='ArrowDown'?1:current.length-1))%current.length;highlight();
  }else if(event.key==='Enter'&&selected>=0){event.preventDefault();choose(selected)}
 });
 input.addEventListener('blur',()=>setTimeout(close,150));
 document.addEventListener('pointerdown',event=>{if(!host.contains(event.target))close()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
window.SOOQAK_SEARCH_ASSIST=Object.freeze({normalize,oneEditAway,suggestions});
})();