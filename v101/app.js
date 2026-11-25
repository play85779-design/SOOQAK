(()=>{'use strict';
const $=s=>document.querySelector(s);
const iconPath={
 home:'<path d="m3 11 9-8 9 8v10h-6v-7H9v7H3z"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
 plus:'<path d="M12 4v16M4 12h16"/>',
 heart:'<path d="M20.8 4.8a5.7 5.7 0 0 0-8.1 0l-.7.7-.7-.7a5.7 5.7 0 1 0-8.1 8L12 21l8.8-8.2a5.7 5.7 0 0 0 0-8z"/>',
 store:'<path d="M3 9 5 4h14l2 5v4q-3 3-6 0-3 3-6 0-3 3-6 0z"/><path d="M5 15v6h14v-6M9 21v-5h6v5"/>',
 user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2c0-4 3-6 8-6s8 2 8 6v2"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
 car:'<path d="M5 11 7 5h10l2 6M3 11h18v8H3zM7 19v2m10-2v2"/><circle cx="7" cy="15" r="1.6"/><circle cx="17" cy="15" r="1.6"/>',
 tools:'<path d="m14 5 5 5-9 9-5-5 9-9ZM4 4l6 6M8 4H4v4"/>',
 laptop:'<rect x="4" y="4" width="16" height="12" rx="2"/><path d="M2 20h20l-3-4H5z"/>',
 house:'<path d="m3 11 9-8 9 8v10H3zM9 21v-7h6v7"/>',
 pin:'<path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
 arrow:'<path d="m15 5-7 7 7 7"/>',
 back:'<path d="M18 12H6m6-6-6 6 6 6"/>',
 bell:'<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 21h4"/>',
 filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
 check:'<path d="m5 12 5 5L20 7"/>',
 camera:'<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="14" r="4"/>',
 shield:'<path d="m12 2 9 4v6c0 5-4 9-9 10C7 21 3 17 3 12V6z"/><path d="m8 12 3 3 5-6"/>',
 message:'<path d="M3 4h18v14H9l-6 3zM7 10h10"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2m0-14-2 2M7 17l-2 2"/>'
};
const ic=(n)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(iconPath[n]||iconPath.grid)+'</svg>';
const items=[
 {id:'car',title:'سيارة سيدان بيضاء',price:68000,city:'الرياض',section:'سيارات',image:'hero-car.svg',alt:'رسم أصلي لسيارة سيدان بيضاء',note:'نموذج بصري لعرض سيارة، وليس إعلان بيع حقيقي'},
 {id:'sofa',title:'كنب جلدي بني',price:2900,city:'الخبر',section:'المنزل',image:'sofa-photo.jpg',alt:'صورة توضيحية لكنب جلدي بني في غرفة معيشة',note:'صورة توضيحية لكنب جلدي بني، ليست إعلانًا حقيقيًا'},
 {id:'laptop',title:'لابتوب فضي',price:3990,city:'الدمام',section:'إلكترونيات',image:'laptop-photo.jpg',alt:'صورة توضيحية لحاسوب محمول فضي',note:'نموذج بصري لحاسوب، وليس إعلان بيع حقيقي'},
 {id:'phone',title:'هاتف ذكي أبيض',price:2499,city:'جدة',section:'إلكترونيات',image:'phone-photo.jpg',alt:'صورة توضيحية لهاتف أبيض على مكتب',note:'نموذج بصري لهاتف، وليس إعلان بيع حقيقي'}
];
const countries={'السعودية':['كل المدن','الرياض','جدة','مكة','المدينة المنورة','الدمام','الخبر','الجبيل','الأحساء','بريدة','أبها'],'البحرين':['كل المدن','المنامة','المحرق','الرفاع'],'الإمارات':['كل المدن','دبي','أبوظبي','الشارقة']};
const locationMap={
 'السعودية':{
  'منطقة الرياض':['الرياض','الخرج'],
  'منطقة مكة المكرمة':['جدة','مكة','الطائف'],
  'منطقة المدينة المنورة':['المدينة المنورة','ينبع'],
  'المنطقة الشرقية':['الدمام','الخبر','الجبيل','الأحساء','القطيف'],
  'منطقة القصيم':['بريدة','عنيزة'],
  'منطقة عسير':['أبها','خميس مشيط'],
  'منطقة تبوك':['تبوك'],
  'منطقة حائل':['حائل'],
  'منطقة جازان':['جازان'],
  'منطقة نجران':['نجران'],
  'منطقة الباحة':['الباحة'],
  'منطقة الجوف':['سكاكا'],
  'منطقة الحدود الشمالية':['عرعر']
 },
 'البحرين':{
  'محافظة العاصمة':['المنامة'],'محافظة المحرق':['المحرق'],
  'المحافظة الشمالية':['مدينة حمد','سار'],'المحافظة الجنوبية':['الرفاع']
 },
 'الإمارات':{
  'إمارة أبوظبي':['أبوظبي','العين'],'إمارة دبي':['دبي'],'إمارة الشارقة':['الشارقة'],
  'إمارة عجمان':['عجمان'],'إمارة أم القيوين':['أم القيوين'],
  'إمارة رأس الخيمة':['رأس الخيمة'],'إمارة الفجيرة':['الفجيرة']
 }
};
const countryFlag={'السعودية':'🇸🇦','البحرين':'🇧🇭','الإمارات':'🇦🇪'};
const categories=[{id:'سيارات',label:'السيارات',icon:'car'},{id:'إلكترونيات',label:'إلكترونيات',icon:'laptop'},{id:'المنزل',label:'المنزل',icon:'house'},{id:'خدمات',label:'الخدمات',icon:'tools'},{id:'الكل',label:'المزيد',icon:'grid'}];
const tabs=[{id:'home',label:'الرئيسية',icon:'home'},{id:'stores',label:'المتاجر',icon:'store'},{id:'post',label:'أضف إعلان',icon:'plus'},{id:'favorites',label:'المفضلة',icon:'heart'},{id:'account',label:'حسابي',icon:'user'}];
const routes=new Set(['welcome','role','home','listings','stores','store','post','favorites','account','auth','my-ads','messages','detail','create-store','services']);
const saved=()=>{try{return new Set(JSON.parse(sessionStorage.getItem('sooqak-v101-fav')||'[]'))}catch{return new Set()}};
const state={postStep:1,postDraft:{title:'',description:'',price:'',section:'سيارات',region:'',city:''},route:'home',country:'السعودية',region:'كل المناطق',city:'كل المدن',filter:'الكل',term:'',favorites:saved(),item:'car',detailIndex:0,authMode:'login',form:{},searchFocus:false,photoUrls:[],storeId:'tech',adsFilter:'all',heroSlide:0,heroPaused:matchMedia('(prefers-reduced-motion: reduce)').matches};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const brand=(className='')=>'<button class="brand '+className+'" data-go="home" aria-label="سوقك الرئيسية"><img class="brand-mark" src="./assets/bag.svg" alt=""><span class="wordmark"><span class="wordmark-ar">سوقك</span><span class="wordmark-en">SOOQAK</span></span></button>';
const countryOpts=()=>Object.keys(countries).map(x=>'<option value="'+x+'" '+(x===state.country?'selected':'')+'>'+esc(x)+'</option>').join('');

const cityForRegion=()=>state.region==='كل المناطق'?[]:((locationMap[state.country]||{})[state.region]||[]);

const header=()=>'<header class="top"><div class="top-inner">'+brand()+'<div class="top-actions"><div class="locale"><span class="country-flag" aria-hidden="true">'+esc(countryFlag[state.country]||'')+'</span><label class="visually-hidden" for="country">الدولة</label><select id="country" class="locale-field country" aria-label="الدولة">'+countryOpts()+'</select></div><button class="header-quick header-messages" data-go="messages" aria-label="الرسائل">'+ic('message')+'<span>الرسائل</span></button><button class="header-quick header-notifications" data-action="notifications" aria-label="التنبيهات">'+ic('bell')+'<span>التنبيهات</span></button><button class="header-auth-btn" type="button" data-go="auth" aria-label="دخول أو إنشاء حساب">'+ic('user')+'<span class="auth-long">دخول / تسجيل</span><span class="auth-short">دخول</span></button></div></div></header>';
const locationPicker=()=>'<div class="location-picker" aria-label="تحديد موقع البحث"><div class="location-box"><label for="region">'+ic('pin')+' المنطقة</label><select id="region" aria-label="المنطقة"></select></div><div class="location-box"><label for="city">المدينة <span>اختياري</span></label><select id="city" aria-label="المدينة"></select></div></div>';
const side=()=>'<aside class="side">'+brand()+'<div>'+tabs.map(t=>'<button class="side-item '+(state.route===t.id?'active':'')+'" data-go="'+t.id+'">'+ic(t.icon)+t.label+'</button>').join('')+'<button class="side-item" data-go="listings">'+ic('grid')+'الإعلانات</button></div><div class="side-hint">سوقك — معاينة V114<br>عناصر مستقلة قابلة للتعديل، بدون قص أي جزء من البوستر. بيانات المنتجات هنا أمثلة فقط.</div></aside>';
const nav=()=>'<nav class="bottom" aria-label="التنقل">'+tabs.map(t=>'<button class="nav '+(state.route===t.id?'active':'')+(t.id==='post'?' add':'')+'" data-go="'+t.id+'" aria-label="'+t.label+'">'+(t.id==='post'?'<span class="add-ring">'+ic(t.icon)+'</span>':ic(t.icon))+'<span>'+t.label+'</span></button>').join('')+'</nav>';
const notice=()=>'<div class="notice">'+ic('shield')+' <span>هذه <strong>معاينة تصميمية</strong>؛ الصور والمنتجات أمثلة وليست عروضًا حقيقية.</span></div>';
const search=()=>'<div class="search-row"><form class="search" id="search"><button type="submit" aria-label="تنفيذ البحث">'+ic('search')+'</button><input name="q" aria-label="ابحث في سوقك" placeholder="وش تدور عليه اليوم؟" value="'+esc(state.term)+'" autocomplete="off"></form><button type="button" class="search-filter-btn" data-action="focus-filter" aria-label="فلاتر الموقع">'+ic('filter')+'<span>الفلاتر</span></button></div>';
const heroSlides=[{theme:'violet',chip:'اكتشف السيارات',first:'سيارات مميزة',second:'تستحق الاكتشاف',desc:'تصفح نماذج السيارات في سوقك',img:'hero-car.svg',alt:'رسم سيارة بيضاء',cat:'سيارات'},{theme:'emerald',chip:'تسوّق بذكاء',first:'كل ما تحتاجه',second:'في مكان واحد',desc:'اكتشف المتاجر والأقسام بسهولة',img:'shopping-scene.svg',alt:'رسم مجسم لسلة تسوق وحقائب',cat:'الكل'},{theme:'amber',chip:'جدّد منزلك',first:'لمسات لمنزلك',second:'بأسلوبك الخاص',desc:'تصفح نماذج الأثاث واحتياجات المنزل',img:'sofa-photo.jpg',alt:'صورة توضيحية لأثاث غرفة معيشة',cat:'المنزل'}];
const heroContent=()=>{const h=heroSlides[state.heroSlide]||heroSlides[0];return '<div class="hero hero-'+h.theme+'" aria-roledescription="عرض شرائح" aria-label="عروض سوقك"><div class="hero-copy"><span class="hero-chip">✦ '+h.chip+'</span><h1>'+h.first+'<br><span>'+h.second+'</span></h1><p>'+h.desc+'</p><button class="cta" data-hero-category="'+h.cat+'"'+(h.cat==='سيارات'?' data-action="cars"':'')+'>تصفح الآن '+ic('arrow')+'</button></div><div class="hero-figure '+(h.img.endsWith('.jpg')?'hero-photo-figure':'')+'"><span class="hero-spark" aria-hidden="true">✦</span><span class="hero-swoosh" aria-hidden="true"></span><img src="./assets/'+h.img+'" alt="'+h.alt+'"></div></div><div class="hero-dots" role="group" aria-label="عروض سوقك">'+heroSlides.map((slide,i)=>'<button type="button" data-hero-slide="'+i+'" class="'+(i===state.heroSlide?'active':'')+'" aria-label="'+slide.chip+'" aria-pressed="'+(i===state.heroSlide)+'"></button>').join('')+'</div><div class="hero-play-control"><button class="hero-pause" data-hero-pause aria-label="'+(state.heroPaused?'تشغيل العروض':'إيقاف العروض')+'" title="'+(state.heroPaused?'تشغيل العروض':'إيقاف العروض')+'">'+(state.heroPaused?'▶':'Ⅱ')+'</button></div>';};
const hero=()=>'<div id="hero-carousel">'+heroContent()+'</div>';
let heroTimer=0,heroTouch=null,heroSwipeUntil=0;
function scheduleHero(){clearTimeout(heroTimer);if(state.route!=='home'||state.heroPaused||document.hidden)return;heroTimer=setTimeout(()=>{const el=$('#hero-carousel');if(el&&state.route==='home'&&!state.heroPaused&&!document.hidden){const rect=el.getBoundingClientRect();if(!el.contains(document.activeElement)&&!el.matches(':hover')&&rect.bottom>0&&rect.top<innerHeight)selectHero(state.heroSlide+1,false);else scheduleHero();}},5000);}
function selectHero(i,focus=false){const el=$('#hero-carousel');if(!el)return;state.heroSlide=(i+heroSlides.length)%heroSlides.length;el.innerHTML=heroContent();if(focus)el.querySelector('[data-hero-slide="'+state.heroSlide+'"]').focus({preventScroll:true});scheduleHero();}
document.addEventListener('visibilitychange',scheduleHero);
document.addEventListener('touchstart',e=>{if(e.target.closest('#hero-carousel .hero')&&e.touches.length===1)heroTouch={x:e.touches[0].clientX,y:e.touches[0].clientY};else heroTouch=null;},{passive:true});
document.addEventListener('touchend',e=>{if(!heroTouch)return;const start=heroTouch;heroTouch=null;const p=e.changedTouches[0];if(!p)return;const dx=p.clientX-start.x,dy=p.clientY-start.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){heroSwipeUntil=Date.now()+400;selectHero(state.heroSlide+(dx>0?1:-1));}},{passive:true});
document.addEventListener('touchcancel',()=>{heroTouch=null;},{passive:true});

const catbar=()=>'<div class="catbar">'+categories.map(c=>'<button class="cat '+(state.filter===c.id&&state.route==='listings'?'active':'')+'" data-category="'+c.id+'"><span class="cat-icon">'+ic(c.icon)+'</span><b>'+c.label+'</b></button>').join('')+'</div>';
const title=(head,small,moreRoute)=>'<div class="section-head"><div class="title-wrap">'+(small?'<span class="side-text">'+small+'</span>':'')+'<h2>'+head+'</h2></div>'+(moreRoute?'<button class="more" data-go="'+moreRoute+'">عرض الكل '+ic('arrow')+'</button>':'')+'</div>';
const shopData=[{id:'tech',name:'متجر التقنية',section:'إلكترونيات',img:'tech-photo.jpg',color:'#e8f4ff',desc:'أجهزة وإلكترونيات'},{id:'home',name:'متجر المنزل',section:'المنزل',img:'sofa-photo.jpg',color:'#fff2df',desc:'أثاث واحتياجات المنزل'},{id:'cars',name:'متجر السيارات',section:'سيارات',img:'hero-car.svg',color:'#e9f9ed',desc:'سيارات ومركبات'}];
const shops=()=>'<div class="shop-grid">'+shopData.map(s=>'<button class="shop" data-shop="'+s.id+'" data-go="store"><div class="shop-figure '+(s.img.endsWith('.jpg')?'photo-figure':'')+'" style="background:'+s.color+'"><img src="./assets/'+s.img+'" alt=""></div><strong>'+s.name+'</strong><small>'+s.desc+' · نموذج</small><span class="shop-open">استكشف المتجر '+ic('arrow')+'</span></button>').join('')+'</div>';
const normalizeSearch=x=>String(x??'').normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').toLowerCase().trim();
function eligible(){
 if(state.country!=='السعودية')return[];
 const allowed=state.region==='كل المناطق'?null:(locationMap[state.country][state.region]||[]);
 const words=normalizeSearch(state.term).split(/\s+/).filter(Boolean);
 return items.filter(x=>(!allowed||(x.local?x.region===state.region:allowed.includes(x.city)))&&(state.city==='كل المدن'||x.city===state.city)&&(state.filter==='الكل'||x.section===state.filter)&&words.every(w=>normalizeSearch([x.title,x.city,x.section,x.note].join(' ')).includes(w))).sort((a,b)=>Number(Boolean(b.local))-Number(Boolean(a.local)));
}
const imageSrc=(x,p)=>x.local?p:'./assets/'+p;
const formatted=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
const card=x=>'<article class="card"><div class="card-photo"><button data-detail="'+x.id+'" aria-label="عرض '+esc(x.title)+'" style="display:block;width:100%;height:100%;padding:0"><img class="'+(x.local?'local-product':x.image.endsWith('.jpg')?'stock-photo':'vector')+'" src="'+esc(imageSrc(x,x.image))+'" alt="'+esc(x.alt)+'" loading="lazy"></button><button class="card-heart" data-fav="'+x.id+'" aria-label="'+(state.favorites.has(x.id)?'إزالة من المفضلة':'إضافة إلى المفضلة')+'" aria-pressed="'+state.favorites.has(x.id)+'">'+ic('heart')+'</button></div><button class="card-content" data-detail="'+x.id+'" style="width:100%;display:block"><strong>'+esc(x.title)+'</strong><div class="price">'+formatted(x.price)+' <small>ر.س</small></div><div class="card-meta"><span>'+ic('pin')+' '+esc(x.city||x.region||'')+'</span><span class="demo-note">'+(x.local?'إعلانك التجريبي':'مثال تجريبي')+'</span></div></button></article>';
const cards=(data)=>data.length?'<div class="card-grid" data-count="'+data.length+'">'+data.map(card).join('')+'</div>':'<div class="empty empty-search"><span class="empty-search-art">'+ic('search')+'<i>✦</i></span><h3>ما لقينا نتائج مطابقة</h3><p>جرّب كلمة أخرى أو وسّع نطاق البحث. الإعلانات التي تضيفها في المعاينة تبقى حتى تحديث الصفحة.</p><div class="empty-actions"><button class="more" data-action="reset">إلغاء الفلاتر وعرض الكل '+ic('arrow')+'</button><button class="more empty-post" data-go="post">أضف إعلانًا تجريبيًا '+ic('plus')+'</button></div></div>';
const filters=()=>'<div class="filter-bar" aria-label="فلترة الإعلانات">'+[{id:'الكل',label:'الكل'},...categories.filter(c=>c.id!=='الكل')].map(c=>'<button class="filter '+(state.filter===c.id?'active':'')+'" data-filter="'+c.id+'">'+c.label+'</button>').join('')+'</div>';
const home=()=>'<div class="shell">'+search()+locationPicker()+notice()+hero()+catbar()+title('متاجر سوقك','تسوّق من المتاجر','stores')+shops()+title('أحدث الإعلانات','اكتشف اللي يناسبك','listings')+cards(eligible())+'</div>';
const listings=()=>'<div class="shell"><div class="screen-title"><h1>الإعلانات</h1><button data-go="home" aria-label="العودة">'+ic('back')+'</button></div>'+search()+locationPicker()+notice()+filters()+'<div class="feed-head"><h2>'+(state.term?'نتائج البحث عن: '+esc(state.term):'إعلانات قريبة منك')+'</h2><span class="subtext">'+eligible().length+' نتيجة</span></div>'+cards(eligible())+'</div>';
const storePage=()=>'<div class="shell shops-page"><div class="screen-title"><h1>متاجر سوقك</h1><button data-go="home" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+title('تسوّق من المتاجر','واجهة تجريبية')+shops()+'<div class="inline-alert">المتاجر هنا تصميم توضيحي. لا توجد شارات توثيق أو تقييمات أو عمليات بيع حقيقية في هذه المعاينة.</div><button class="cta" data-go="create-store">أنشئ متجرك '+ic('store')+'</button></div>';
const photoGallery=()=>state.photoUrls.length?'<div class="upload-previews" role="list" aria-label="صور الإعلان المختارة">'+state.photoUrls.map((p,i)=>'<div class="upload-thumb" role="listitem"><img src="'+p.url+'" alt="الصورة المختارة '+(i+1)+'"><span class="upload-count">'+(i===0?'رئيسية':i+1)+'</span>'+(i>0?'<button type="button" class="upload-main" aria-label="تعيين الصورة '+(i+1)+' رئيسية" data-photo-main="'+i+'">اجعلها رئيسية</button>':'')+'<button type="button" aria-label="حذف الصورة '+(i+1)+'" data-photo-remove="'+i+'">×</button></div>').join('')+'</div>':'';
const post=()=>{
 const d=state.postDraft,step=state.postStep;
 const labels=['صور الإعلان','تفاصيل المنتج','المراجعة'];
 const progress='<div class="wizard-steps" role="navigation" aria-label="خطوات إضافة الإعلان">'+labels.map((label,i)=>'<button type="button" class="wizard-step '+(step===i+1?'active':step>i+1?'done':'')+'" data-post-step="'+(i+1)+'" aria-current="'+(step===i+1?'step':'false')+'"><span class="wizard-number">'+(i+1)+'</span><span>'+label+'</span></button>').join('')+'</div>';
 const photo='<section class="wizard-panel" data-wizard-panel="1"><div class="wizard-panel-header"><span class="wizard-icon">'+ic('camera')+'</span><div><h2>صور إعلانك</h2><p>الصورة الأولى هي الرئيسية، ويمكن ترتيب الصور بعد اختيارها</p></div></div><label class="upload wizard-upload" for="preview-images">'+ic('camera')+'<span id="upload-label">'+(state.photoUrls.length?'تم اختيار '+state.photoUrls.length+' صور':'أضف صور الإعلان')+'</span><small>اختيار محلي للمعاينة — حتى 10 صور</small></label><input id="preview-images" type="file" accept="image/*" multiple hidden><div id="upload-previews">'+photoGallery()+'</div></section>';
 const details='<section class="wizard-panel" data-wizard-panel="2"><div class="wizard-panel-header"><span class="wizard-icon">'+ic('grid')+'</span><div><h2>تفاصيل الإعلان</h2><p>معلومات واضحة تساعد المشتري يفهم عرضك بسهولة</p></div></div><div class="wizard-fields"><div class="field"><label for="post-title">عنوان الإعلان *</label><input id="post-title" name="title" required maxlength="100" placeholder="مثلاً: سيارة سيدان بحالة ممتازة" value="'+esc(d.title)+'"></div><div class="field"><label for="post-desc">الوصف</label><textarea id="post-desc" name="description" maxlength="2000" placeholder="الحالة والمواصفات وأهم التفاصيل">'+esc(d.description)+'</textarea></div><div class="field"><label for="post-price">السعر بالريال السعودي *</label><input id="post-price" name="price" required min="1" type="number" placeholder="مثلاً: 68,000" inputmode="numeric" value="'+esc(d.price)+'"></div><div class="field"><label for="post-cat">القسم</label><select id="post-cat" name="section">'+['سيارات','إلكترونيات','المنزل','خدمات','أخرى'].map(x=>'<option '+(d.section===x?'selected':'')+'>'+x+'</option>').join('')+'</select></div><div class="field"><label for="post-region">المنطقة *</label><select id="post-region" name="region" required></select></div><div class="field"><label for="post-city">المدينة (اختياري)</label><select id="post-city" name="city"></select></div></div></section>';
 const review='<section class="wizard-panel" data-wizard-panel="3"><div class="wizard-panel-header"><span class="wizard-icon">'+ic('check')+'</span><div><h2>راجع إعلانك</h2><p>تأكد من التفاصيل قبل الإكمال</p></div></div><div class="wizard-summary"><div class="wizard-summary-photo">'+(state.photoUrls.length?'<img src="'+state.photoUrls[0].url+'" alt="الصورة الرئيسية للإعلان">':ic('camera'))+'</div><div class="wizard-summary-info"><strong>'+esc(d.title||'عنوان الإعلان')+'</strong><span class="wizard-summary-price">'+(d.price?formatted(d.price)+' ر.س':'السعر غير محدد')+'</span><small>'+esc(d.section)+' · '+esc(d.region)+(d.city?' · '+esc(d.city):'')+'</small></div></div><p class="wizard-description">'+esc(d.description||'لا يوجد وصف إضافي')+'</p><div class="inline-alert">سيظهر إعلانك في البحث وإعلاناتي خلال هذه الجلسة فقط. لن تُرسل الصور أو البيانات إلى خادم، ويزول الإعلان عند تحديث الصفحة.</div></section>';
 const panel=step===1?photo:step===2?details:review;
 const footer='<div class="wizard-actions">'+(step>1?'<button type="button" class="wizard-back" data-post-prev>'+ic('back')+' السابق</button>':'')+(step<3?'<button type="button" class="cta wizard-next" data-post-next>التالي '+ic('arrow')+'</button>':'<button type="button" class="cta wizard-preview" data-post-preview>إضافة الإعلان للتجربة '+ic('check')+'</button>')+'</div>';
 return '<div class="shell wizard-page"><div class="screen-title"><h1>إضافة إعلان</h1><button data-go="home" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+'<div class="post-intro"><span class="post-eyebrow">إعلانك يبدأ هنا</span><h2>إعلانك في ثلاث خطوات</h2><p>صور، تفاصيل، ثم مراجعة.</p></div>'+progress+'<div class="wizard-card">'+panel+footer+'</div></div>';
};
const account=()=>'<div class="shell account-page"><div class="screen-title"><h1>حسابي</h1><button data-go="home" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+'<div class="profile account-hero"><span class="profile-avatar">'+ic('user')+'</span><div class="account-hero-content"><h2>مرحبًا بك في سوقك</h2><small>تتصفح الآن كزائر — سجّل الدخول لاستكمال حسابك</small><button class="account-login" data-go="auth">تسجيل الدخول '+ic('arrow')+'</button></div></div><div class="account-quick"><button data-go="my-ads" class="account-quick-card purple"><span>'+ic('grid')+'</span><b>إعلاناتي</b><small>'+items.filter(x=>x.local).length+' إعلان محلي</small></button><button data-go="create-store" class="account-quick-card orange"><span>'+ic('store')+'</span><b>متجري</b><small>ابدأ مشروعك</small></button><button data-go="favorites" class="account-quick-card pink"><span>'+ic('heart')+'</span><b>المفضلة</b><small>'+state.favorites.size+' محفوظ محليًا</small></button><button data-go="messages" class="account-quick-card green"><span>'+ic('message')+'</span><b>رسائلي</b><small>المراسلة غير مفعلة</small></button></div><div class="account-section-head">الخدمات والإعدادات</div><div class="profile-list">'+[['grid','إعلاناتي','my-ads'],['store','إدارة متجري','create-store'],['heart','المفضلة','favorites'],['message','الرسائل','messages'],['settings','الإعدادات','demo'],['grid','تعرف على سوقك','welcome']].map(([i,name,go])=>'<button class="profile-row" '+(go==='demo'?'data-action="demo"':'data-go="'+go+'"')+'><span class="item">'+ic(i)+name+'</span>'+ic('arrow')+'</button>').join('')+'</div></div>';
const favorites=()=>'<div class="shell"><div class="screen-title"><h1>المفضلة</h1><button data-go="home" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+cards(items.filter(x=>state.favorites.has(x.id)))+'</div>';
const detailImages=x=>(Array.isArray(x.images)&&x.images.length?x.images:[x.image]).filter(p=>typeof p==='string'&&(x.local?p.startsWith('blob:'):/\.(svg|jpg)$/i.test(p)&&/^[a-z0-9.-]+$/i.test(p)));
const detail=()=>{
 const x=items.find(v=>v.id===state.item)||items[0];
 const imgs=detailImages(x),idx=Math.min(Math.max(0,state.detailIndex),Math.max(0,imgs.length-1));
 const main=imgs[idx]||x.image,saved=state.favorites.has(x.id);
 const thumb=imgs.map((p,i)=>'<button type="button" class="detail-thumb '+(i===idx?'active':'')+'" data-detail-image="'+i+'" aria-label="عرض صورة '+(i+1)+' للإعلان" aria-pressed="'+(i===idx)+'"><img src="'+esc(imageSrc(x,p))+'" alt="صورة '+(i+1)+' من الإعلان"></button>').join('');
 return '<div class="shell detail"><div class="screen-title"><h1>تفاصيل الإعلان</h1><button data-go="listings" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+'<div class="detail-gallery"><div class="detail-hero"><img src="'+esc(imageSrc(x,main))+'" alt="'+esc(x.alt)+'" class="detail-primary-image"><span class="detail-counter">'+(idx+1)+' / '+imgs.length+'</span></div><div class="detail-thumbnail-strip" role="group" aria-label="صور الإعلان">'+thumb+'</div></div><div class="detail-box"><span class="detail-category">'+esc(x.section)+'</span><h2>'+esc(x.title)+'</h2><div class="price">'+formatted(x.price)+' <small>ر.س</small></div><div class="detail-location">'+ic('pin')+'<span>'+esc(x.city||x.region||'')+'</span></div><p>'+esc(x.note)+'</p><div class="detail-actions"><button class="cta" data-go="messages">استكشف المراسلة '+ic('message')+'</button><button type="button" class="detail-fav '+(saved?'is-saved':'')+'" data-fav="'+x.id+'" aria-label="'+(saved?'إزالة من المفضلة':'حفظ في المفضلة')+'" aria-pressed="'+saved+'">'+ic('heart')+'<span>'+(saved?'محفوظ':'حفظ')+'</span></button></div><p class="detail-demo-note">المراسلة والإعلان الحقيقيان غير مفعّلين في هذه المعاينة.</p></div></div>';
};
const createStore=()=>'<div class="shell create-store-page"><div class="screen-title"><h1>أنشئ متجرك</h1><button data-go="stores" aria-label="العودة">'+ic('back')+'</button></div><div class="store-start"><div><span class="ads-kicker">خطوتك الأولى نحو التجارة</span><h2>متجرك في سوقك</h2><p>تعرّف على طريقة عرض منتجاتك وتنظيم متجرك.</p><button class="cta" data-shop="tech" data-go="store">شاهد نموذج متجر '+ic('arrow')+'</button></div><img src="./assets/shopping-scene.svg" alt="رسم مجسم لسلة التسوق والحقائب"></div><div class="store-benefits"><div>'+ic('grid')+'<b>اعرض منتجاتك</b><small>صفحة تجمع منتجاتك</small></div><div>'+ic('store')+'<b>هوية متجرك</b><small>واجهة خاصة بتجارتك</small></div><div>'+ic('user')+'<b>حساب واحد</b><small>تصفح وإدارة من مكان واحد</small></div></div><p class="inline-alert">فتح متجر فعلي غير متاح في المعاينة؛ يمكنك استكشاف نموذج متجر الآن.</p></div>';
const services=()=>'<div class="shell"><div class="screen-title"><h1>دليل الخدمات</h1><button data-go="home" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+'<div class="empty"><h3>خدمات مدينتك</h3><p>يظهر هنا مقدمو الخدمات بعد ربط البيانات الحقيقية.</p></div></div>';
const welcome=()=>'<div class="onboard-wrap"><div class="onboard-brand"><img src="./assets/bag.svg" alt="حقيبة سوقك"><div><strong>سوقك</strong><small>SOOQAK</small></div></div><div class="onboard-card"><span class="onboard-kicker">تسوّق واكتشف من مكان واحد</span><h1>منصة البيع والشراء<br>والمتاجر والخدمات</h1><div class="onboard-scene"><img src="./assets/shopping-scene.svg" alt="رسم مجسم لسلة التسوق والحقائب"></div><p>بيع وشراء، متاجر وخدمات، بتجربة عربية سهلة وحيوية.</p><button class="cta" data-go="role">ابدأ الآن '+ic('arrow')+'</button><span class="onboard-disclaimer">معاينة للهوية فقط — لا تسجيل أو بيع حقيقي</span></div></div>';
const role=()=>'<div class="onboard-wrap"><div class="onboard-brand"><img src="./assets/bag.svg" alt="حقيبة سوقك"><div><strong>سوقك</strong><small>SOOQAK</small></div></div><div class="onboard-card"><h1>اختر طريقة استخدامك</h1><p>حساب واحد، ويمكنك تفعيل متجرك لاحقًا دون إنشاء حساب آخر.</p><button class="role-choice" data-go="home"><span class="role-icon">'+ic('user')+'</span><span><b>مستخدم عادي</b><small>تصفح الإعلانات واحفظ المفضلة</small></span>'+ic('check')+'</button><button class="role-choice" data-go="create-store"><span class="role-icon orange">'+ic('store')+'</span><span><b>صاحب متجر</b><small>شاهد تصور متجر سوقك</small></span>'+ic('arrow')+'</button><span class="onboard-disclaimer">هذه خيارات استعراضية؛ لا تنشئ حسابات فعلية</span></div></div>';
const store=()=>{const shop=shopData.find(x=>x.id===state.storeId)||shopData[0];return '<div class="shell store-preview"><div class="screen-title"><h1>'+shop.name+'</h1><button data-go="stores" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+'<div class="store-cover"><div><span>متجر تجريبي</span><h2>'+shop.name+'</h2><p>'+shop.desc+'</p></div><img src="./assets/'+shop.img+'" class="'+(shop.img.endsWith('.jpg')?'store-photo':'')+'" alt=""></div><div class="store-heading"><span class="store-badge">'+ic('store')+'</span><div><b>منتجات المتجر</b><small>أمثلة تصميمية — ليست منتجات تاجر فعلي</small></div></div>'+cards(items.filter(x=>!x.local&&x.section===shop.section))+'<div class="inline-alert">صفحة تجريبية. لا توجد تقييمات أو متابعون أو عمليات شراء حقيقية.</div></div>';};
const auth=()=>{
 const sign=state.authMode==='signup',restore=state.authMode==='restore';
 const heading=sign?'إنشاء حساب سوقك':restore?'استعادة كلمة المرور':'تسجيل الدخول إلى سوقك';
 const tabs='<div class="auth-tabs" role="group" aria-label="نوع الدخول"><button type="button" class="'+(state.authMode==='login'?'active':'')+'" data-auth-mode="login" aria-pressed="'+(state.authMode==='login')+'">تسجيل الدخول</button><button type="button" class="'+(sign?'active':'')+'" data-auth-mode="signup" aria-pressed="'+sign+'">إنشاء حساب</button></div>';
 return '<div class="shell auth-preview-page"><div class="screen-title"><h1>'+heading+'</h1><button data-go="home" aria-label="العودة">'+ic('back')+'</button></div><div class="auth-intro"><div class="auth-intro-copy"><span class="auth-kicker">سوقك أقرب إليك</span><h2>كل ما تحتاجه في مكان واحد</h2><p>إعلانات، متاجر وخدمات بين يديك.</p></div><img src="./assets/bag.svg" alt="" class="auth-illustration"></div><div class="auth-preview-card">'+(restore?'<button type="button" class="more" data-auth-mode="login">'+ic('back')+' العودة لتسجيل الدخول</button>':tabs)+'<div class="auth-disabled-label" id="auth-demo-note">معاينة فقط: لا تدخل بياناتك الحقيقية. لن تُرسل أو تُحفظ المدخلات، ولا يُنشأ حساب أو يُرسل بريد.</div><form id="auth-demo-form" autocomplete="off" novalidate><label for="auth-email-preview">البريد الإلكتروني</label><input id="auth-email-preview" type="email" dir="ltr" inputmode="email" maxlength="100" placeholder="أدخل بريدك الإلكتروني" autocomplete="off" aria-describedby="auth-demo-note">'+(!restore?'<label for="auth-password-preview">كلمة المرور</label><div class="auth-password-wrap"><input id="auth-password-preview" type="password" dir="ltr" maxlength="64" placeholder="أدخل كلمة المرور" autocomplete="new-password" aria-describedby="auth-demo-note"><button type="button" class="auth-password-toggle" data-action="demo-password" aria-label="إظهار كلمة المرور التجريبية">إظهار</button></div>':'')+'<button type="button" class="auth-sample" data-action="auth-sample">تعبئة بيانات اختبار جاهزة</button><p id="auth-demo-error" class="auth-demo-error" role="status"></p><button class="cta auth-explain" type="submit">'+(sign?'معاينة إنشاء حساب':restore?'معاينة استعادة كلمة المرور':'معاينة تسجيل الدخول')+' '+ic('arrow')+'</button></form>'+(!restore?'<button type="button" class="auth-recovery" data-auth-mode="restore">نسيت كلمة المرور؟</button>':'')+'<button class="more auth-guest" data-go="home">المتابعة كزائر '+ic('arrow')+'</button></div></div>';
};
const managedCard=x=>'<div class="managed-unit">'+card(x)+'<div class="managed-actions"><span class="local-status">محلي • غير منشور</span><button data-detail="'+x.id+'">معاينة</button><button data-edit-local="'+x.id+'">تعديل</button><button class="remove-local" data-delete-local="'+x.id+'">حذف</button></div></div>';
function editLocal(id){
 const x=items.find(v=>v.local&&v.id===id);if(!x)return;
 $('#dialog-root').innerHTML='<div class="dialog-backdrop"><section class="dialog-card" role="dialog" aria-modal="true" aria-label="تعديل الإعلان"><h3>تعديل الإعلان</h3><form id="edit-local-form" data-id="'+x.id+'"><label for="edit-title">العنوان</label><input id="edit-title" required minlength="3" maxlength="100" value="'+esc(x.title)+'"><label for="edit-price">السعر بالريال</label><input id="edit-price" type="number" required min="1" max="999999999" step="0.01" value="'+esc(x.price)+'"><label for="edit-note">الوصف</label><textarea id="edit-note" maxlength="2000">'+esc(x.note)+'</textarea><button class="cta" type="submit">حفظ التعديل</button><button type="button" class="more" data-action="close">إلغاء</button></form></section></div>';
 $('#edit-title').focus();
}
function confirmDeleteLocal(id){
 const x=items.find(v=>v.local&&v.id===id);if(!x)return;
 $('#dialog-root').innerHTML='<div class="dialog-backdrop"><section class="dialog-card" role="dialog" aria-modal="true" aria-label="حذف الإعلان"><h3>حذف الإعلان؟</h3><p>سيحذف من المعاينة والبحث والمفضلة في هذه الصفحة.</p><button type="button" class="cta" data-confirm-local="'+x.id+'">تأكيد الحذف</button><button type="button" class="more" data-action="close">إلغاء</button></section></div>';
}
const myAds=()=>{
 const local=items.filter(x=>x.local), draft=Boolean(state.postDraft.title.trim()||state.photoUrls.length);
 return '<div class="shell my-ads-page"><div class="screen-title"><h1>إعلاناتي</h1><button data-go="account" aria-label="العودة">'+ic('back')+'</button></div><div class="ads-dashboard"><div><span class="ads-kicker">مركز إدارة الإعلانات</span><h2>كل إعلاناتك في مكان واحد</h2><p>تابع إعلاناتك واستكمل مسودتك بسهولة.</p></div><button data-go="post" class="cta">إضافة إعلان '+ic('plus')+'</button></div><div class="ads-stats" aria-label="حالة إعلانات هذه الجلسة"><div><span>'+ic('grid')+' إعلاناتي</span><strong>'+local.length+'</strong></div><div><span>'+ic('camera')+' مسوداتي</span><strong>'+(draft?1:0)+'</strong></div><div><span>'+ic('shield')+' النشر الفعلي</span><strong>0</strong></div></div><p class="inline-alert ads-preview-note">معاينة محلية: إعلانات هذه الجلسة غير منشورة للعامة وتزول عند تحديث الصفحة.</p><div class="section-head"><h2>إعلاناتك الحالية</h2></div>'+(local.length?'<div class="ads-managed-list">'+local.map(managedCard).join('')+'</div>':'<div class="account-empty ads-empty">'+ic('grid')+'<h2>ابدأ بإعلانك الأول</h2><p>أضف صورة وتفاصيل منتجك وشاهد كيف يظهر إعلانك.</p><button data-go="post" class="cta">إضافة إعلان '+ic('plus')+'</button></div>')+'</div>';
};
const messages=()=>'<div class="shell"><div class="screen-title"><h1>رسائلي</h1><button data-go="account" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+'<div class="account-empty">'+ic('message')+'<h2>تواصل بثقة</h2><p>المراسلة الحقيقية مرتبطة بالحسابات والبائعين بعد التحقق من أمان البيانات.</p><button data-go="auth" class="cta">استكشف تسجيل الدخول '+ic('arrow')+'</button></div></div>';const views={welcome,role,home,listings,stores:storePage,store,post,account,auth,myAds:myAds,'my-ads':myAds,messages,favorites,detail,'create-store':createStore,services};
function hydrateLocationFields(){
 const region=$('#region'),city=$('#city');
 if(region){const map=locationMap[state.country]||{};region.replaceChildren(...['كل المناطق',...Object.keys(map)].map(x=>new Option(x,x)));region.value=state.region;}
 if(city){city.replaceChildren(...['كل المدن',...cityForRegion()].map(x=>new Option(x,x)));city.value=state.city;city.disabled=state.region==='كل المناطق';}
 const postRegion=$('#post-region');
 if(postRegion){postRegion.replaceChildren(new Option('اختر المنطقة',''),...Object.keys(locationMap['السعودية']).map(x=>new Option(x,x)));postRegion.value=state.postDraft.region;}
 const postCity=$('#post-city');if(postCity){postCity.replaceChildren(new Option('المدينة اختيارية',''),...(locationMap['السعودية'][state.postDraft.region]||[]).map(x=>new Option(x,x)));postCity.value=state.postDraft.city;}
}
function render(preserve=false){
 const y=window.scrollY;
 $('#app').innerHTML='<div class="site'+(['welcome','role'].includes(state.route)?' onboarding':'')+'">'+side()+header()+'<main class="main">'+(views[state.route]||home)()+'</main>'+nav()+'</div>';
 hydrateLocationFields();scheduleHero();
 document.title='سوقك — '+({welcome:'أهلا بك',role:'نوع الحساب',store:'متجر',home:'الرئيسية',listings:'الإعلانات',stores:'المتاجر',post:'إضافة إعلان',account:'حسابي',auth:'تسجيل الدخول','my-ads':'إعلاناتي',messages:'الرسائل',favorites:'المفضلة',detail:'تفاصيل الإعلان','create-store':'إنشاء متجر',services:'الخدمات'}[state.route]||'SOOQAK');
 if(preserve)window.scrollTo({top:y,behavior:'instant'});else window.scrollTo({top:0,behavior:'instant'});
}
// Store only known fixture identifiers in the URL. Legacy #detail remains readable.
function routeFromHash(){
 const hash=location.hash.slice(1);
 if(hash.startsWith('store/')){const id=hash.slice(6);return shopData.some(x=>x.id===id)?{route:'store',storeId:id}:{route:'stores'};}
 if(hash==='detail')return {route:'detail',item:items[0].id};
 if(hash.startsWith('detail/')){
  const id=hash.slice(7);
  return items.some(x=>x.id===id)?{route:'detail',item:id}:{route:'listings'};
 }
 return {route:routes.has(hash)?hash:'home'};
}
function syncRoute(initial=false){
 const next=routeFromHash();
 const changed=state.route!==next.route||(next.route==='detail'&&state.item!==next.item)||(next.route==='store'&&next.storeId&&state.storeId!==next.storeId);
 state.route=next.route;if(next.storeId)state.storeId=next.storeId;
 if(next.route==='detail'){if(state.item!==next.item)state.detailIndex=0;state.item=next.item;}
 if(initial||changed)render();
}
function go(route,push=true){state.route=routes.has(route)?route:'home';if(push)history.pushState({},'',location.pathname+location.search+'#'+(state.route==='detail'?'detail/'+state.item:state.route==='store'?'store/'+state.storeId:state.route));render()}
let timer=0;function toast(msg){const el=$('#toast');el.textContent=msg;el.hidden=false;clearTimeout(timer);timer=setTimeout(()=>el.hidden=true,3000)}
function dialog(title,text){$('#dialog-root').innerHTML='<div class="dialog-backdrop"><section class="dialog-card" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><button class="dialog-close" aria-label="إغلاق" data-action="close">×</button><h3>'+esc(title)+'</h3><p>'+text+'</p><button class="cta" data-action="close">فهمت</button></section></div>';}
function action(a){if(a==='focus-filter'){const el=$('#region');if(el){el.focus();el.scrollIntoView({block:'nearest'});}return}if(a==='notifications'){dialog('التنبيهات','لا توجد تنبيهات حقيقية في المعاينة. تظهر هنا تنبيهات حسابك بعد الربط الآمن.');return}if(a==='auth-sample'){const email=$('#auth-email-preview'),password=$('#auth-password-preview');if(email)email.value='demo@example.invalid';if(password)password.value='Demo1234';$('#auth-demo-error').textContent='';return}if(a==='demo-password'){const p=$('#auth-password-preview'),b=$('.auth-password-toggle');if(p&&b){p.type=p.type==='password'?'text':'password';b.textContent=p.type==='password'?'إظهار':'إخفاء';b.setAttribute('aria-label',p.type==='password'?'إظهار كلمة المرور التجريبية':'إخفاء كلمة المرور التجريبية')}return}if(a==='reset'){state.city='كل المدن';state.region='كل المناطق';state.country='السعودية';state.filter='الكل';state.term='';go('listings');return}if(a==='cars'){state.filter='سيارات';go('listings');return}if(a==='close'){$('#dialog-root').innerHTML='';return}if(a==='auth-unavailable'){dialog('التسجيل غير مفعل في المعاينة','هذه نسخة لتجربة التصميم فقط. لم نربط حسابات حقيقية أو نطلب معلومات حساسة. يجري تجهيز الربط مع نظام سوقك الموجود بعد مراجعة الأمان.');return}dialog(a==='notifications'?'التنبيهات':'الميزة قيد الربط','هذه تجربة تصميمية تفاعلية. لا توجد رسائل أو طلبات أو حسابات أو معاملات فعلية في هذه النسخة.');}
let nextDemoId=0;
function addLocalListing(){
 if(state.postStep!==3||!validatePostDraft()||!state.photoUrls.length)return;
 if(items.filter(x=>x.local).length>=5){toast('يمكن تجربة خمسة إعلانات في الجلسة. حدّث الصفحة لبدء جلسة جديدة.');return}
 const d=state.postDraft,id='local-'+(++nextDemoId),images=state.photoUrls.map(p=>p.url);
 items.push({id,title:d.title.trim(),price:Number(d.price),city:d.city,region:d.region,section:d.section,image:images[0],images,alt:'صورة إعلانك التجريبي',note:d.description,local:true});
 // Keep object URLs alive until the page closes; no uploads or persistent storage.
 state.photoUrls=[];state.postStep=1;state.postDraft={title:'',description:'',price:'',section:'سيارات',region:'',city:''};
 state.country='السعودية';state.region='كل المناطق';state.city='كل المدن';state.filter='الكل';state.term='';
 go('my-ads');dialog('أضيف إعلانك للتجربة','تقدر تشوف إعلانك في إعلاناتي وتبحث عنه الآن. لم يُنشر للعامة، ويزول عند تحديث الصفحة.');
}
function changePostStep(target){
 if(!Number.isInteger(target)||target<1||target>3)return;
 if(target>state.postStep){
  if(state.postStep===1&&target>1&&state.photoUrls.length===0){toast('اختر صورة واحدة على الأقل للمتابعة');return}
  if(target===3&&!validatePostDraft()){return}
 }
 state.postStep=target;render(); 
}
function validatePostDraft(){
 const d=state.postDraft,price=Number(d.price);
 if(d.title.trim().length<3){toast('اكتب عنوانًا واضحًا من 3 أحرف على الأقل');return false}
 if(!Number.isFinite(price)||price<=0||price>999999999){toast('أدخل سعرًا صحيحًا أكبر من صفر');return false}
 if(!d.region){toast('اختر المنطقة');return false}
 return true;
}
document.addEventListener('input',e=>{
 const key={'post-title':'title','post-desc':'description','post-price':'price'}[e.target.id];
 if(key)state.postDraft[key]=String(e.target.value).slice(0,key==='description'?2000:100);
});
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.postStep){changePostStep(Number(b.dataset.postStep));return}
 if(b.hasAttribute('data-post-next')){changePostStep(state.postStep+1);return}
 if(b.hasAttribute('data-post-prev')){changePostStep(state.postStep-1);return}
 if(b.hasAttribute('data-post-preview')){addLocalListing();return}
 if(b.dataset.detailImage!==undefined){
  const idx=Number(b.dataset.detailImage);
  const x=items.find(v=>v.id===state.item)||items[0];
  if(Number.isInteger(idx)&&idx>=0&&idx<detailImages(x).length){state.detailIndex=idx;render(true);}
  return;
 }
 if(b.hasAttribute('data-hero-pause')){state.heroPaused=!state.heroPaused;const el=$('#hero-carousel');if(el){el.innerHTML=heroContent();el.querySelector('[data-hero-pause]').focus({preventScroll:true});}scheduleHero();return}
 if(b.dataset.heroSlide!==undefined){const i=Number(b.dataset.heroSlide);if(Number.isInteger(i)&&heroSlides[i])selectHero(i,true);return}
 if(b.dataset.heroCategory){if(Date.now()<heroSwipeUntil)return;state.term='';state.filter=b.dataset.heroCategory;go('listings');return}
 if(b.dataset.editLocal){editLocal(b.dataset.editLocal);return}
 if(b.dataset.deleteLocal){confirmDeleteLocal(b.dataset.deleteLocal);return}
 if(b.dataset.confirmLocal){const i=items.findIndex(x=>x.local&&x.id===b.dataset.confirmLocal);if(i>=0){const x=items.splice(i,1)[0];for(const url of x.images||[])URL.revokeObjectURL(url);state.favorites.delete(x.id);action('close');render(true);toast('حُذف الإعلان من المعاينة');}return}
 if(b.dataset.authMode){state.authMode=b.dataset.authMode;render(true);return}
 if(b.dataset.shop){state.storeId=b.dataset.shop;go('store');return}
 if(b.dataset.go){go(b.dataset.go);return}
 if(b.dataset.category){if(b.dataset.category==='خدمات'){go('services');return}state.filter=b.dataset.category;go('listings');return}
 if(b.dataset.filter){state.filter=b.dataset.filter;render(true);return}
 if(b.dataset.detail){state.item=b.dataset.detail;state.detailIndex=0;go('detail');return}
 if(b.dataset.fav){let id=b.dataset.fav;if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);try{sessionStorage.setItem('sooqak-v101-fav',JSON.stringify([...state.favorites].filter(id=>!id.startsWith('local-'))))}catch{}render(true);toast(state.favorites.has(id)?'حُفظ في المفضلة التجريبية':'أزيل من المفضلة');return}
 if(b.dataset.photoMain!==undefined){
  const i=Number(b.dataset.photoMain);
  if(Number.isInteger(i)&&i>0&&i<state.photoUrls.length){
   const chosen=state.photoUrls.splice(i,1)[0];
   state.photoUrls.unshift(chosen);
   const frame=$('#upload-previews');
   if(frame)frame.innerHTML=photoGallery();
   toast('تم تعيين الصورة الرئيسية');
  }
  return;
 }
 if(b.dataset.photoRemove!==undefined){const i=Number(b.dataset.photoRemove);if(Number.isInteger(i)&&state.photoUrls[i]){URL.revokeObjectURL(state.photoUrls[i].url);state.photoUrls.splice(i,1);const frame=$('#upload-previews');if(frame)frame.innerHTML=photoGallery();const label=$('#upload-label');if(label)label.textContent=state.photoUrls.length?'تم اختيار '+state.photoUrls.length+' صور — يمكنك إضافة المزيد':'أضف صور الإعلان';}return}
 if(b.dataset.action){action(b.dataset.action);return}
});
document.addEventListener('change',e=>{
 if(e.target.id==='country'){state.country=e.target.value;state.region='كل المناطق';state.city='كل المدن';render(true);toast('تم اختيار '+state.country+' — بيانات المعاينة محلية فقط');return}
 if(e.target.id==='region'){state.region=e.target.value;state.city='كل المدن';render(true);toast('المنطقة: '+state.region);return}
  if(e.target.id==='city'){state.city=e.target.value;render(true);toast('الموقع: '+state.city);return}
 if(e.target.id==='post-region'){state.postDraft.region=e.target.value;state.postDraft.city='';const city=$('#post-city');if(city){const options=(locationMap['السعودية'][e.target.value]||[]);city.replaceChildren(new Option('المدينة اختيارية',''),...options.map(x=>new Option(x,x)));}return}if(e.target.id==='post-city'){state.postDraft.city=e.target.value;return}if(e.target.id==='post-cat'){state.postDraft.section=e.target.value;return}
  if(e.target.id==='preview-images'){const files=Array.from(e.target.files||[]);if(files.length+state.photoUrls.length>10){toast('الحد الأقصى 10 صور');e.target.value='';return}if(files.some(f=>!['image/jpeg','image/png','image/webp','image/gif'].includes(f.type)||f.size>8*1024*1024)){toast('اختر صور JPG أو PNG أو WEBP أو GIF، حتى 8 ميجابايت للصورة');e.target.value='';return}for(const f of files)state.photoUrls.push({url:URL.createObjectURL(f),name:f.name});const frame=$('#upload-previews');if(frame)frame.innerHTML=photoGallery();const label=$('#upload-label');if(label)label.textContent=state.photoUrls.length?'تم اختيار '+state.photoUrls.length+' صور — يمكنك إضافة المزيد':'أضف صور الإعلان';e.target.value='';return}
});
document.addEventListener('submit',e=>{
 if(e.target.id==='edit-local-form'){e.preventDefault();const x=items.find(v=>v.local&&v.id===e.target.dataset.id),title=$('#edit-title').value.trim(),price=Number($('#edit-price').value);if(!x||title.length<3||!Number.isFinite(price)||price<=0||price>999999999){toast('راجع العنوان والسعر');return}x.title=title;x.price=price;x.note=$('#edit-note').value;action('close');render(true);toast('تم حفظ التعديل محليًا');return}
 if(e.target.id==='auth-demo-form'){e.preventDefault();const email=$('#auth-email-preview'),p=$('#auth-password-preview'),error=$('#auth-demo-error');const valid=/^[a-z0-9._+-]+@example\.invalid$/i.test(email.value.trim())&&(!p||p.value.length>=8);if(!valid){e.target.reset();if(p){p.type='password';const toggle=$('.auth-password-toggle');toggle.textContent='إظهار';toggle.setAttribute('aria-label','إظهار كلمة المرور التجريبية');}error.textContent='اضغط على «تعبئة بيانات اختبار جاهزة» ثم جرّب مرة أخرى. لا تستخدم بياناتك الحقيقية.';return}e.target.reset();error.textContent='';action('auth-unavailable');return}

 if(e.target.id==='search'){e.preventDefault();state.term=String(new FormData(e.target).get('q')||'').trim().slice(0,70);state.filter='الكل';go('listings');return}
 // V103 wizard has interactive step controls and an honest preview instead of mock publishing.
});
window.addEventListener('popstate',()=>syncRoute());
window.addEventListener('hashchange',()=>syncRoute());
const initialRoute=routeFromHash();state.route=initialRoute.route;if(initialRoute.item)state.item=initialRoute.item;if(initialRoute.storeId)state.storeId=initialRoute.storeId;
if(!location.hash)history.replaceState({},'',location.pathname+location.search+'#home');
render();
window.SOOQAK_V101={version:'V114',getState:()=>({route:state.route,country:state.country,city:state.city,filter:state.filter,saved:state.favorites.size,previewOnly:true})};
})();
