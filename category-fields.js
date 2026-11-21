/* SOOQAK V43 — compact optional attribute forms, no schema migration required. */
(function(root){
'use strict';
const marker='\n\n[مواصفات سوقك]\n';
const config={
 'سيارات':[['make','الماركة','text'],['model','الموديل','text'],['year','سنة الصنع','number',1900,2035],['mileage','الممشى بالكيلومتر','number',0,3000000]],
 'عقارات':[['property','نوع العقار','select',['أرض','شقة','فيلا','عمارة','محل','مزرعة']],['area','المساحة بالمتر المربع','number',1,100000000],['rooms','عدد الغرف','number',0,1000]],
 'إلكترونيات':[['brand','العلامة التجارية','text'],['model','الموديل','text'],['condition','الحالة','select',['جديد','مستعمل','بحالة ممتازة','بحاجة لصيانة']]],
 'أثاث ومنزل':[['item','نوع القطعة','text'],['condition','الحالة','select',['جديد','مستعمل','بحالة ممتازة','بحاجة لصيانة']]],
 'خدمات':[['specialty','نوع الخدمة','text'],['availability','التوفر','select',['حسب الموعد','يوميًا','عند الطلب']]],
 'حيوانات':[['animal','نوع الحيوان','text'],['quantity','العدد','number',1,999999]],
 'مستلزمات شخصية':[['brand','العلامة التجارية','text'],['condition','الحالة','select',['جديد','مستعمل','بحالة ممتازة']]],
 'معدات وآليات':[['machine','نوع المعدة','text'],['year','سنة الصنع','number',1900,2035],['condition','الحالة','select',['جديد','مستعمل','بحالة ممتازة','بحاجة لصيانة']]],
 'أخرى':[['detail','نوع السلعة','text']]
};
const catalog=Object.freeze(Object.fromEntries(Object.entries(config).map(([category,items])=>[category,Object.freeze(items.map(([key,label,type,min,max])=>Object.freeze({key,label,type,min,max})))])));
function extract(description,category){
 const raw=String(description||'');const index=raw.lastIndexOf(marker);
 if(index<0)return {body:raw,attributes:{}};
 const lines=raw.slice(index+marker.length).split('\n').filter(Boolean);
 const specs=catalog[category]||[],known=new Map(specs.map(x=>[x.label,x.key]));
 if(!lines.length||lines.some(line=>!line.includes(': ')||!known.has(line.slice(0,line.indexOf(': '))))){
  return {body:raw,attributes:{}};
 }
 const attributes={};
 for(const line of lines){const pos=line.indexOf(': ');attributes[known.get(line.slice(0,pos))]=line.slice(pos+2).slice(0,80);}
 return {body:raw.slice(0,index),attributes};
}
function serialize(body,category,attributes){
 const text=String(body||'').trim(),lines=[];
 for(const field of catalog[category]||[]){
  const value=String(attributes?.[field.key]||'').replace(/[\r\n]+/g,' ').trim().slice(0,80);
  if(value)lines.push(field.label+': '+value);
 }
 return text+(lines.length?marker+lines.join('\n'):'');
}
root.SOOQAK_CATEGORY_FIELDS=Object.freeze({catalog,extract,serialize,marker});
})(typeof window!=='undefined'?window:globalThis);
