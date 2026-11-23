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
 {id:'sofa',title:'كنب بيج ثلاثي',price:2900,city:'الخبر',section:'المنزل',image:'sofa.svg',alt:'رسم أصلي لأريكة منزلية بيج',note:'نموذج بصري للكنب البيج، وليس إعلانًا حقيقيًا'},
 {id:'laptop',title:'لابتوب فضي',price:3990,city:'الدمام',section:'إلكترونيات',image:'laptop.svg',alt:'رسم أصلي لحاسوب محمول فضي',note:'نموذج بصري لحاسوب، وليس إعلان بيع حقيقي'},
 {id:'phone',title:'هاتف ذكي بنفسجي',price:2499,city:'جدة',section:'إلكترونيات',image:'phone.svg',alt:'رسم أصلي لهاتف ذكي بنفسجي',note:'نموذج بصري لهاتف، وليس إعلان بيع حقيقي'}
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
const routes=new Set(['welcome','role','home','listings','stores','store','post','favorites','account','detail','create-store','services']);
const saved=()=>{try{return new Set(JSON.parse(sessionStorage.getItem('sooqak-v101-fav')||'[]'))}catch{return new Set()}};
const state={route:'home',country:'السعودية',region:'كل المناطق',city:'كل المدن',filter:'الكل',term:'',favorites:saved(),item:'car',form:{},searchFocus:false,photoUrls:[]};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const brand=(className='')=>'<button class="brand '+className+'" data-go="home" aria-label="سوقك الرئيسية"><img class="brand-mark" src="./assets/bag.svg" alt=""><span class="wordmark"><span class="wordmark-ar">سوقك</span><span class="wordmark-en">SOOQAK</span></span></button>';
const countryOpts=()=>Object.keys(countries).map(x=>'<option value="'+x+'" '+(x===state.country?'selected':'')+'>'+({السعودية:'🇸🇦',البحرين:'🇧🇭',الإمارات:'🇦🇪'}[x]||'')+' '+x+'</option>').join('');

const cityForRegion=()=>state.region==='كل المناطق'?[]:((locationMap[state.country]||{})[state.region]||[]);

const header=()=>'<header class="top"><div class="top-inner">'+brand()+'<div class="top-actions"><div class="locale"><span class="country-flag" aria-hidden="true">'+esc(countryFlag[state.country]||'')+'</span><label class="visually-hidden" for="country">الدولة</label><select id="country" class="locale-field country" aria-label="الدولة">'+countryOpts()+'</select></div><button class="round-btn" data-action="notifications" aria-label="التنبيهات">'+ic('bell')+'</button></div></div></header>';
const locationPicker=()=>'<div class="location-picker" aria-label="تحديد موقع البحث"><div class="location-box"><label for="region">المنطقة</label><select id="region" aria-label="المنطقة"></select></div><div class="location-box"><label for="city">المدينة <span>اختياري</span></label><select id="city" aria-label="المدينة"></select></div></div>';
const side=()=>'<aside class="side">'+brand()+'<div>'+tabs.map(t=>'<button class="side-item '+(state.route===t.id?'active':'')+'" data-go="'+t.id+'">'+ic(t.icon)+t.label+'</button>').join('')+'<button class="side-item" data-go="listings">'+ic('grid')+'الإعلانات</button></div><div class="side-hint">سوقك — تصميم V101<br>عناصر مستقلة قابلة للتعديل، بدون قص أي جزء من البوستر. بيانات المنتجات هنا أمثلة فقط.</div></aside>';
const nav=()=>'<nav class="bottom" aria-label="التنقل">'+tabs.map(t=>'<button class="nav '+(state.route===t.id?'active':'')+(t.id==='post'?' add':'')+'" data-go="'+t.id+'" aria-label="'+t.label+'">'+(t.id==='post'?'<span class="add-ring">'+ic(t.icon)+'</span>':ic(t.icon))+'<span>'+t.label+'</span></button>').join('')+'</nav>';
const notice=()=>'<div class="notice">'+ic('shield')+' <span>هذه <strong>معاينة تصميمية</strong>؛ الصور والمنتجات أمثلة وليست عروضًا حقيقية.</span></div>';
const search=()=>'<form class="search" id="search"><button type="submit" aria-label="تنفيذ البحث">'+ic('search')+'</button><input name="q" aria-label="ابحث في سوقك" placeholder="ابحث عن منتج أو إعلان أو متجر..." value="'+esc(state.term)+'" autocomplete="off"></form>';
const hero=()=>'<div class="hero"><div class="hero-copy"><span class="hero-chip">عروض تستحق الاكتشاف ✨</span><h1>سيارات مميزة<br><span>بأفضل الأسعار</span></h1><p>اكتشف إعلانات متنوعة في سوقك</p><button class="cta" data-action="cars">تصفح الآن '+ic('arrow')+'</button></div><div class="hero-figure"><span class="hero-spark" aria-hidden="true">✦</span><span class="hero-swoosh" aria-hidden="true"></span><img src="./assets/hero-car.svg" alt="تصميم متجهي أصلي لسيارة بيضاء"></div></div><div class="hero-dots"><b class="active"></b><b></b><b></b></div>';
const catbar=()=>'<div class="catbar">'+categories.map(c=>'<button class="cat '+(state.filter===c.id&&state.route==='listings'?'active':'')+'" data-category="'+c.id+'"><span class="cat-icon">'+ic(c.icon)+'</span><b>'+c.label+'</b></button>').join('')+'</div>';
const title=(head,small,moreRoute)=>'<div class="section-head"><div class="title-wrap">'+(small?'<span class="side-text">'+small+'</span>':'')+'<h2>'+head+'</h2></div>'+(moreRoute?'<button class="more" data-go="'+moreRoute+'">عرض الكل '+ic('arrow')+'</button>':'')+'</div>';
const shops=()=>'<div class="shop-grid">'+[{name:'متجر التقنية',tone:'blue'},{name:'متجر المنزل',tone:'cream'},{name:'متجر السيارات',tone:'mint'}].map((s,i)=>'<button class="shop" data-go="store"><div class="shop-figure" style="background:'+['#e8f4ff','#fff2df','#e9f9ed'][i]+'"><img src="./assets/'+['laptop.svg','shop.svg','hero-car.svg'][i]+'" alt=""></div><strong>'+s.name+'</strong><small>متجر توضيحي</small></button>').join('')+'</div>';
function eligible(){if(state.country!=='السعودية')return[];const allowed=state.region==='كل المناطق'?null:(locationMap[state.country][state.region]||[]);return items.filter(x=>(!allowed||allowed.includes(x.city))&&(state.city==='كل المدن'||x.city===state.city)&&(state.filter==='الكل'||x.section===state.filter)&&(!state.term||(x.title+' '+x.city+' '+x.section).includes(state.term)))}
const formatted=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:0});
const card=x=>'<article class="card"><div class="card-photo"><button data-detail="'+x.id+'" aria-label="عرض '+esc(x.title)+'" style="display:block;width:100%;height:100%;padding:0"><img class="vector" src="./assets/'+x.image+'" alt="'+esc(x.alt)+'" loading="lazy"></button><button class="card-heart" data-fav="'+x.id+'" aria-label="'+(state.favorites.has(x.id)?'إزالة من المفضلة':'إضافة إلى المفضلة')+'" aria-pressed="'+state.favorites.has(x.id)+'">'+ic('heart')+'</button></div><button class="card-content" data-detail="'+x.id+'" style="width:100%;display:block"><strong>'+esc(x.title)+'</strong><div class="price">'+formatted(x.price)+' <small>ر.س</small></div><div class="card-meta"><span>'+ic('pin')+' '+x.city+'</span><span class="demo-note">مثال تجريبي</span></div></button></article>';
const cards=(data)=>data.length?'<div class="card-grid" data-count="'+Math.min(data.length,4)+'">'+data.map(card).join('')+'</div>':'<div class="empty"><h3>ما فيه نتائج هنا حاليًا</h3><p>جرب تغيّر المدينة أو القسم أو كلمات البحث.</p><button class="more" data-action="reset">عرض كل الأمثلة '+ic('arrow')+'</button></div>';
const filters=()=>'<div class="filter-bar" aria-label="فلترة الإعلانات">'+[{id:'الكل',label:'الكل'},...categories.filter(c=>c.id!=='الكل')].map(c=>'<button class="filter '+(state.filter===c.id?'active':'')+'" data-filter="'+c.id+'">'+c.label+'</button>').join('')+'</div>';
const home=()=>'<div class="shell">'+search()+locationPicker()+notice()+hero()+catbar()+title('متاجر سوقك','تسوّق من المتاجر','stores')+shops()+title('أحدث الإعلانات','اكتشف اللي يناسبك','listings')+cards(eligible())+'</div>';
const listings=()=>'<div class="shell"><div class="screen-title"><h1>الإعلانات</h1><button data-go="home" aria-label="العودة">'+ic('back')+'</button></div>'+search()+locationPicker()+notice()+filters()+'<div class="feed-head"><h2>إعلانات قريبة منك</h2><span class="subtext">'+eligible().length+' أمثلة</span></div>'+cards(eligible())+'</div>';
const storePage=()=>'<div class="shell shops-page"><div class="screen-title"><h1>متاجر سوقك</h1><button data-go="home" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+title('تسوّق من المتاجر','واجهة تجريبية')+shops()+'<div class="inline-alert">المتاجر هنا تصميم توضيحي. لا توجد شارات توثيق أو تقييمات أو عمليات بيع حقيقية في هذه المعاينة.</div><button class="cta" data-go="create-store">أنشئ متجرك '+ic('store')+'</button></div>';
const photoGallery=()=>state.photoUrls.length?'<div class="upload-previews" role="list" aria-label="صور الإعلان المختارة">'+state.photoUrls.map((p,i)=>'<div class="upload-thumb" role="listitem"><img src="'+p.url+'" alt="الصورة المختارة '+(i+1)+'"><span class="upload-count">'+(i+1)+'</span><button type="button" aria-label="حذف الصورة '+(i+1)+'" data-photo-remove="'+i+'">×</button></div>').join('')+'</div>':'';
const post=()=>'<div class="shell"><div class="screen-title"><h1>إضافة إعلان</h1><button data-go="home" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+'<div class="post-intro"><span class="post-eyebrow">إعلانك يبدأ هنا</span><h2>اعرض منتجك بطريقة أجمل</h2><p>أضف الصور، ثم البيانات والموقع، وبعدها راجع إعلانك قبل النشر.</p></div><div class="post-steps"><span><b>1</b> صور الإعلان</span><span><b>2</b> تفاصيل المنتج</span><span><b>3</b> المراجعة</span></div><form class="form-card" id="post-form" novalidate><label class="upload" for="preview-images">'+ic('camera')+'<span id="upload-label">أضف صور الإعلان</span><small>اختيار محلي فقط — 10 صور كحد أعلى</small></label><input id="preview-images" type="file" accept="image/*" multiple hidden><div id="upload-previews">'+photoGallery()+'</div><div class="field" style="margin-top:18px"><label for="post-title">عنوان الإعلان *</label><input id="post-title" name="title" required maxlength="100" placeholder="مثلاً: سيارة سيدان بحالة ممتازة"></div><div class="field"><label for="post-desc">الوصف</label><textarea id="post-desc" name="description" placeholder="صف المنتج بوضوح..."></textarea></div><div class="field"><label for="post-price">السعر بالريال السعودي *</label><input id="post-price" name="price" required min="1" type="number" placeholder="مثلاً: 68,000" inputmode="numeric"></div><div class="field"><label for="post-cat">القسم</label><select id="post-cat" name="section"><option>سيارات</option><option>إلكترونيات</option><option>المنزل</option><option>خدمات</option><option>أخرى</option></select></div><div class="field"><label for="post-region">المنطقة *</label><select id="post-region" name="region" required></select></div><div class="field"><label for="post-city">المدينة (اختياري)</label><select id="post-city" name="city"><option value="">اختر المنطقة أولًا</option></select></div><div class="inline-alert">يمكنك مراجعة شكل الإعلان، لكن لن يُنشر أو يُرسل أي شيء إلى قاعدة البيانات.</div><div class="form-actions"><button class="cta" type="submit">مراجعة الإعلان '+ic('arrow')+'</button></div></form></div>';
const account=()=>'<div class="shell"><div class="screen-title"><h1>حسابي</h1><button data-go="home" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+'<div class="profile"><span class="profile-avatar">'+ic('user')+'</span><div><h2>حساب المعاينة</h2><small>نسخة تصميمية — لم يتم تسجيل دخول حقيقي</small></div></div><div class="profile-grid"><div class="profile-stat"><b>—</b>إعلاناتي</div><div class="profile-stat"><b>—</b>طلباتي</div><div class="profile-stat"><b>'+state.favorites.size+'</b>المفضلة</div></div><div class="profile-list">'+[['store','إدارة متجري','create-store'],['grid','إعلاناتي','post'],['heart','المفضلة','favorites'],['message','الرسائل','demo'],['settings','الإعدادات','demo'],['grid','تعرّف على سوقك','welcome']].map(([i,name,go])=>'<button class="profile-row" '+(go==='demo'?'data-action="demo"':'data-go="'+go+'"')+'><span class="item">'+ic(i)+name+'</span>'+ic('arrow')+'</button>').join('')+'</div></div>';
const favorites=()=>'<div class="shell"><div class="screen-title"><h1>المفضلة</h1><button data-go="home" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+cards(items.filter(x=>state.favorites.has(x.id)))+'</div>';
const detail=()=>{const x=items.find(x=>x.id===state.item)||items[0];return '<div class="shell detail"><div class="screen-title"><h1>تفاصيل الإعلان</h1><button data-go="listings" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+'<div class="detail-hero"><img src="./assets/'+x.image+'" alt="'+esc(x.alt)+'"></div><div class="detail-box"><h2>'+x.title+'</h2><div class="price">'+formatted(x.price)+' <small>ر.س</small></div><div class="subtext">'+ic('pin')+' '+x.city+'</div><p>'+esc(x.note)+'</p><div class="detail-actions"><button class="cta" data-action="demo">مراسلة البائع '+ic('message')+'</button><button class="more" data-fav="'+x.id+'">'+ic('heart')+' حفظ</button></div></div></div>'};
const createStore=()=>'<div class="shell"><div class="screen-title"><h1>أنشئ متجرك</h1><button data-go="stores" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+'<div class="form-card" style="text-align:center"><img src="./assets/shop.svg" alt="رسم متجر أصلي" style="width:min(100%,340px);margin:0 auto"><h2 style="font:800 29px var(--round);color:var(--green)">متجرك في سوقك</h2><p class="subtext">واجهة متجر احترافية، تعرض منتجاتك بإتقان.</p><div class="detail-actions"><button class="cta" style="width:100%" data-action="demo">أنشئ متجرك الآن '+ic('store')+'</button></div><div class="inline-alert">إنشاء متجر حقيقي غير مفعّل في المعاينة.</div></div></div>';
const services=()=>'<div class="shell"><div class="screen-title"><h1>دليل الخدمات</h1><button data-go="home" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+'<div class="empty"><h3>خدمات مدينتك</h3><p>يظهر هنا مقدمو الخدمات بعد ربط البيانات الحقيقية.</p></div></div>';
const welcome=()=>'<div class="onboard-wrap"><div class="onboard-brand"><img src="./assets/bag.svg" alt="حقيبة سوقك"><div><strong>سوقك</strong><small>SOOQAK</small></div></div><div class="onboard-card"><span class="onboard-kicker">تسوّق واكتشف من مكان واحد</span><h1>منصة البيع والشراء<br>والمتاجر والخدمات</h1><div class="onboard-scene"><img src="./assets/shop.svg" alt="رسم أصلي لمتجر سوقك"></div><p>بيع وشراء، متاجر وخدمات، بتجربة عربية سهلة وحيوية.</p><button class="cta" data-go="role">ابدأ الآن '+ic('arrow')+'</button><span class="onboard-disclaimer">معاينة للهوية فقط — لا تسجيل أو بيع حقيقي</span></div></div>';
const role=()=>'<div class="onboard-wrap"><div class="onboard-brand"><img src="./assets/bag.svg" alt="حقيبة سوقك"><div><strong>سوقك</strong><small>SOOQAK</small></div></div><div class="onboard-card"><h1>اختر طريقة استخدامك</h1><p>حساب واحد، ويمكنك تفعيل متجرك لاحقًا دون إنشاء حساب آخر.</p><button class="role-choice" data-go="home"><span class="role-icon">'+ic('user')+'</span><span><b>مستخدم عادي</b><small>تصفح الإعلانات واحفظ المفضلة</small></span>'+ic('check')+'</button><button class="role-choice" data-go="create-store"><span class="role-icon orange">'+ic('store')+'</span><span><b>صاحب متجر</b><small>شاهد تصور متجر سوقك</small></span>'+ic('arrow')+'</button><span class="onboard-disclaimer">هذه خيارات استعراضية؛ لا تنشئ حسابات فعلية</span></div></div>';
const store=()=>'<div class="shell store-preview"><div class="screen-title"><h1>متجر سوقك</h1><button data-go="stores" aria-label="العودة">'+ic('back')+'</button></div>'+notice()+'<div class="store-cover"><div><span>متجر تجريبي</span><h2>متجر التقنية</h2><p>واجهة مستقلة للعرض فقط</p></div><img src="./assets/shop.svg" alt="رسم متجر"></div><div class="store-heading"><span class="store-badge">'+ic('store')+'</span><div><b>منتجات المتجر</b><small>أمثلة تصميمية — ليست منتجات تاجر فعلي</small></div></div>'+cards(items.slice(2,4))+'<div class="inline-alert">صفحة تجريبية. لا توجد تقييمات أو متابعون أو عمليات شراء حقيقية.</div></div>';
const views={welcome,role,home,listings,stores:storePage,store,post,account,favorites,detail,'create-store':createStore,services};
function hydrateLocationFields(){
 const region=$('#region'),city=$('#city');
 if(region){const map=locationMap[state.country]||{};region.replaceChildren(...['كل المناطق',...Object.keys(map)].map(x=>new Option(x,x)));region.value=state.region;}
 if(city){city.replaceChildren(...['كل المدن',...cityForRegion()].map(x=>new Option(x,x)));city.value=state.city;city.disabled=state.region==='كل المناطق';}
 const postRegion=$('#post-region');
 if(postRegion)postRegion.replaceChildren(new Option('اختر المنطقة',''),...Object.keys(locationMap['السعودية']).map(x=>new Option(x,x)));
}
function render(preserve=false){
 const y=window.scrollY;
 $('#app').innerHTML='<div class="site'+(['welcome','role'].includes(state.route)?' onboarding':'')+'">'+side()+header()+'<main class="main">'+(views[state.route]||home)()+'</main>'+nav()+'</div>';
 hydrateLocationFields();
 document.title='سوقك — '+({welcome:'أهلا بك',role:'نوع الحساب',store:'متجر',home:'الرئيسية',listings:'الإعلانات',stores:'المتاجر',post:'إضافة إعلان',account:'حسابي',favorites:'المفضلة',detail:'تفاصيل الإعلان','create-store':'إنشاء متجر',services:'الخدمات'}[state.route]||'SOOQAK');
 if(preserve)window.scrollTo({top:y,behavior:'instant'});else window.scrollTo({top:0,behavior:'instant'});
}
function go(route,push=true){state.route=routes.has(route)?route:'home';if(push)history.pushState({},'',location.pathname+'#'+state.route);render()}
let timer=0;function toast(msg){const el=$('#toast');el.textContent=msg;el.hidden=false;clearTimeout(timer);timer=setTimeout(()=>el.hidden=true,3000)}
function dialog(title,text){$('#dialog-root').innerHTML='<div class="dialog-backdrop"><section class="dialog-card" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><button class="dialog-close" aria-label="إغلاق" data-action="close">×</button><h3>'+esc(title)+'</h3><p>'+text+'</p><button class="cta" data-action="close">فهمت</button></section></div>';}
function action(a){if(a==='reset'){state.city='كل المدن';state.region='كل المناطق';state.country='السعودية';state.filter='الكل';state.term='';go('listings');return}if(a==='cars'){state.filter='سيارات';go('listings');return}if(a==='close'){$('#dialog-root').innerHTML='';return}dialog(a==='notifications'?'التنبيهات':'الميزة قيد الربط','هذه تجربة تصميمية تفاعلية. لا توجد رسائل أو طلبات أو حسابات أو معاملات فعلية في هذه النسخة.');}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.go){go(b.dataset.go);return}
 if(b.dataset.category){if(b.dataset.category==='خدمات'){go('services');return}state.filter=b.dataset.category;go('listings');return}
 if(b.dataset.filter){state.filter=b.dataset.filter;render(true);return}
 if(b.dataset.detail){state.item=b.dataset.detail;go('detail');return}
 if(b.dataset.fav){let id=b.dataset.fav;if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);sessionStorage.setItem('sooqak-v101-fav',JSON.stringify([...state.favorites]));render(true);toast(state.favorites.has(id)?'حُفظ في المفضلة التجريبية':'أزيل من المفضلة');return}
 if(b.dataset.photoRemove!==undefined){const i=Number(b.dataset.photoRemove);if(Number.isInteger(i)&&state.photoUrls[i]){URL.revokeObjectURL(state.photoUrls[i].url);state.photoUrls.splice(i,1);const frame=$('#upload-previews');if(frame)frame.innerHTML=photoGallery();const label=$('#upload-label');if(label)label.textContent=state.photoUrls.length?'تم اختيار '+state.photoUrls.length+' صور — يمكنك إضافة المزيد':'أضف صور الإعلان';}return}
 if(b.dataset.action){action(b.dataset.action);return}
});
document.addEventListener('change',e=>{
 if(e.target.id==='country'){state.country=e.target.value;state.region='كل المناطق';state.city='كل المدن';render(true);toast('تم اختيار '+state.country+' — بيانات المعاينة محلية فقط');return}
 if(e.target.id==='region'){state.region=e.target.value;state.city='كل المدن';render(true);toast('المنطقة: '+state.region);return}
  if(e.target.id==='city'){state.city=e.target.value;render(true);toast('الموقع: '+state.city);return}
 if(e.target.id==='post-region'){const city=$('#post-city');if(city){const options=(locationMap['السعودية'][e.target.value]||[]);city.replaceChildren(new Option('المدينة اختيارية',''),...options.map(x=>new Option(x,x)));}return}
  if(e.target.id==='preview-images'){const files=Array.from(e.target.files||[]);if(files.length+state.photoUrls.length>10){toast('الحد الأقصى 10 صور');e.target.value='';return}if(files.some(f=>!f.type.startsWith('image/')||f.size>8*1024*1024)){toast('الصور يجب أن تكون أقل من 8 ميجابايت');e.target.value='';return}for(const f of files)state.photoUrls.push({url:URL.createObjectURL(f),name:f.name});const frame=$('#upload-previews');if(frame)frame.innerHTML=photoGallery();const label=$('#upload-label');if(label)label.textContent=state.photoUrls.length?'تم اختيار '+state.photoUrls.length+' صور — يمكنك إضافة المزيد':'أضف صور الإعلان';e.target.value='';return}
});
document.addEventListener('submit',e=>{
 if(e.target.id==='search'){e.preventDefault();state.term=String(new FormData(e.target).get('q')||'').trim().slice(0,70);state.filter='الكل';go('listings');return}
 if(e.target.id==='post-form'){e.preventDefault();const d=new FormData(e.target),name=String(d.get('title')||'').trim(),price=Number(d.get('price'));if(name.length<6){toast('اكتب عنوانًا من 6 أحرف على الأقل');return}if(!Number.isFinite(price)||price<=0){toast('السعر يجب أن يكون أكبر من صفر');return}if(!d.get('region')){toast('اختر المنطقة');return}dialog('مراجعة الإعلان','<strong>'+esc(name)+'</strong><br>السعر: '+formatted(price)+' ر.س<br>هذا مجرد عرض للمراجعة. عدد الصور المختارة: '+state.photoUrls.length+'<br>لم يُنشر الإعلان، ولم تُرسل بياناته لأي خادم.');return}
});
window.addEventListener('popstate',()=>{const r=location.hash.slice(1);state.route=routes.has(r)?r:'home';render()});
window.addEventListener('hashchange',()=>{const r=location.hash.slice(1);if(routes.has(r)&&r!==state.route){state.route=r;render()}});
const hash=location.hash.slice(1);if(routes.has(hash))state.route=hash;else history.replaceState({},'',location.pathname+'#home');
render();
window.SOOQAK_V101={version:'V101',getState:()=>({route:state.route,country:state.country,city:state.city,filter:state.filter,saved:state.favorites.size,previewOnly:true})};
})();
