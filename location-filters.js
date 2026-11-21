/* V54 — Saudi city selection and optional public-neighborhood hints. No geolocation. */
(function(){
'use strict';
const EXTRA_CITIES=[
 'القطيف','الظهران','صفوى','رأس تنورة','الخفجي','حفر الباطن',
 'بريدة','عنيزة','حائل','تبوك','الطائف','ينبع','جازان','نجران',
 'الباحة','خميس مشيط','سكاكا','عرعر','بيشة','الرس','رابغ',
 'القنفذة','النعيرية','العلا','القريات'
];
const LIST_ID='sooqakDistrictSuggestions';
function availableNeighborhoods(selectedCity){
 const ads=typeof allAds==='function'?allAds():[];
 const found=new Set();
 for(const ad of ads.slice(0,500)){
  if(ad.hidden||ad.status==='مباع'||ad.status==='منتهي')continue;
  if(typeof active==='function'&&!active(ad))continue;
  if(selectedCity&&ad.city!==selectedCity)continue;
  const name=String(ad.district||'').trim();
  if(name.length>=2&&name.length<=70)found.add(name);
 }
 return [...found].sort((a,b)=>a.localeCompare(b,'ar')).slice(0,50);
}
function init(){
 const city=document.getElementById('cityFilter');
 const district=document.getElementById('districtFilter');
 if(!city||!district||document.getElementById(LIST_ID))return;
 const existing=new Set([...city.options].map(option=>option.value));
 for(const name of EXTRA_CITIES){
  if(existing.has(name))continue;
  const option=document.createElement('option');option.value=name;option.textContent=name;
  city.appendChild(option);existing.add(name);
 }
 const list=document.createElement('datalist');list.id=LIST_ID;
 district.setAttribute('list',LIST_ID);
 district.setAttribute('aria-describedby','sooqakDistrictHelp');
 district.insertAdjacentElement('afterend',list);
 const info=document.createElement('small');
 info.id='sooqakDistrictHelp';info.className='sooqak-district-hint';
 info.textContent='اكتب أي حي؛ الاقتراحات من الإعلانات العامة فقط، ولا نطلب موقعك الدقيق.';
 list.insertAdjacentElement('afterend',info);
 function refresh(){
  const suggestions=availableNeighborhoods(city.value);
  list.replaceChildren();
  for(const name of suggestions){
   const option=document.createElement('option');
   option.value=name;list.appendChild(option);
  }
 }
 let lastCity=city.value;
 city.addEventListener('change',()=>{
  const changed=lastCity!==city.value;lastCity=city.value;
  if(changed&&district.value){
   district.value='';
   district.dispatchEvent(new Event('input',{bubbles:true}));
  }
  refresh();
 });
 district.addEventListener('focus',refresh);
 window.addEventListener('sooqak:cloud-ready',refresh);
 refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
window.SOOQAK_LOCATION_FILTERS=Object.freeze({availableNeighborhoods,EXTRA_CITIES:[...EXTRA_CITIES]});
})();