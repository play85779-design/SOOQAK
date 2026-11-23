/* SOOQAK V100 — new clean-room frontend.
 * Never import legacy CSS or app.js. Poster is the visual authority.
 * Preview is interactive but intentionally NOT a live commerce service.
 */
(()=>{'use strict';
const POSTER='./assets/logo.webp';
const $=(sel,root=document)=>root.querySelector(sel);
const $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:0});
const ICON={
 home:'<path d="m3 11 9-8 9 8v9H3z"/><path d="M9 20v-6h6v6"/>',
 search:'<circle cx="10.8" cy="10.8" r="6.9"/><path d="m16 16 5 5"/>',
 heart:'<path d="M20.8 4.9a5.8 5.8 0 0 0-8.2 0l-.6.7-.6-.7a5.8 5.8 0 0 0-8.2 8.2L12 21l8.8-7.9a5.8 5.8 0 0 0 0-8.2Z"/>',
 user:'<circle cx="12" cy="7.1" r="4"/><path d="M4.3 21v-1c0-4.8 3-7.3 7.7-7.3s7.7 2.5 7.7 7.3v1"/>',
 plus:'<path d="M12 4v16M4 12h16"/>',
 store:'<path d="M3 10 5.1 4h13.8L21 10v3c-1.7 1.8-3.6 1.8-5.1.3-1.5 1.5-4 1.5-5.5 0-1.5 1.5-3.4 1.5-5 0C3.9 14.8 2 14.8 3 13z"/><path d="M5 14v6h14v-6M9 20v-5h6v5"/>',
 back:'<path d="M17 12H5m6-6-6 6 6 6"/>',
 filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
 pin:'<path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.4"/>',
 check:'<path d="m5 12 4.5 4.5L19 7"/>',
 badge:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
 camera:'<path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13.5" r="3.5"/>',
 cart:'<path d="M2 4h2l2.7 12h11.6L21 7H5"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
 bag:'<path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
 tools:'<path d="m13 7 4 4-8 8-4-4 8-8ZM14 4l6 6M9 19l-3 3"/><path d="M5 4h5v5H5z"/>',
 phone:'<rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M11 18h2"/>',
 laptop:'<rect x="5" y="4" width="14" height="11" rx="1"/><path d="M2 19h20l-3-4H5Z"/>',
 house:'<path d="m3 11 9-8 9 8v10H3z"/><path d="M9 21v-8h6v8"/>',
 grid:'<rect x="4" y="4" width="6" height="6" rx="2"/><rect x="14" y="4" width="6" height="6" rx="2"/><rect x="4" y="14" width="6" height="6" rx="2"/><rect x="14" y="14" width="6" height="6" rx="2"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h1M3 12h1M3 18h1"/>',
 shield:'<path d="m12 2 9 4v6c0 5-4.5 9-9 10-4.5-1-9-5-9-10V6z"/><path d="m8 12 3 3 5-6"/>',
 trend:'<path d="m3 18 6-7 4 3 8-10"/><path d="M15 4h6v6"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M2 12h3M19 12h3M4.9 19.1l2.2-2.2M16.9 7.1l2.2-2.2"/>',
 message:'<path d="M3 5h18v12H9l-6 4z"/><path d="M7 10h10"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 close:'<path d="m5 5 14 14M19 5 5 19"/>',
 bell:'<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5z"/><path d="M10 21h4"/>',
 edit:'<path d="M4 20h5l11-11-5-5L4 15z"/>',
 arrow:'<path d="m14 5-7 7 7 7"/>',
 share:'<circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5m-8 7 8 5"/>',
 eye:'<path d="M2 12q10-12 20 0-10 12-20 0z"/><circle cx="12" cy="12" r="3"/>',
 trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v7M14 11v7"/>',
 logout:'<path d="M14 4h6v16h-6M12 12H3m5-5-5 5 5 5"/>',
 warning:'<path d="m12 3 10 18H2z"/><path d="M12 9v5m0 3h.01"/>',
 star:'<path d="m12 2 3.1 6.3 7 .9-5 4.9 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5-4.9 7-.9z"/>',
 truck:'<path d="M3 5h11v12H3zM14 9h4l3 4v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="2"/><path d="m3 17 6-6 4 4 3-3 5 5"/>'
};
const icon=(name,size=20)=>'<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICON[name]||ICON.grid)+'</svg>';
const crops={
 logo:{x:27,y:139},
 welcome:{x:319,y:267},
 banner:{x:889,y:153},
 car:{x:1189,y:200},
 sofa:{x:1325,y:200},
 laptop:{x:1189,y:365},
 phone:{x:1325,y:365},
 storeCover:{x:310,y:560},
 shopTech:{x:891,y:406},
 shopHome:{x:979,y:406},
 shopCar:{x:1067,y:406},
 storeArt:{x:884,y:636},
 headphone:{x:452,y:840}
};
const CROPPED_ASSETS=Object.freeze({logo:'logo',welcome:'welcome',banner:'hero',car:'car',sofa:'sofa',laptop:'laptop',phone:'phone',storeCover:'store-cover',shopTech:'shop-tech',shopHome:'shop-home',shopCar:'shop-car',storeArt:'store-illustration',headphone:'headphones'});
const crop=(name,variant='poster-photo')=>{
 const asset=CROPPED_ASSETS[name]||'car';
 return '<div class="'+escape(variant)+' crop-'+escape(name)+'"><img src="./assets/'+asset+'.webp" alt="" decoding="async" '+(name==='banner'?'fetchpriority="high"':'loading="lazy"')+' draggable="false"></div>'
};
const DEMO_PRODUCTS=[
 {id:'car',category:'سيارات',title:'تويوتا كامري 2023',price:45000,city:'الرياض',image:'car',description:'مثال تصميمي لبطاقة سيارة. ليست هناك سيارة معروضة للبيع عبر هذه المعاينة.'},
 {id:'sofa',category:'أثاث ومنزل',title:'طقم كنب فاخر',price:2900,city:'الخبر',image:'sofa',description:'مثال تصميمي لعرض أثاث منزلي. لا توجد عملية بيع حقيقية.'},
 {id:'laptop',category:'إلكترونيات',title:'لابتوب HP حديث',price:3990,city:'الدمام',image:'laptop',description:'مثال تصميمي لجهاز محمول. لا توجد عملية بيع حقيقية.'},
 {id:'phone',category:'إلكترونيات',title:'هاتف ذكي 128GB',price:2499,city:'جدة',image:'phone',description:'مثال تصميمي لهاتف. لا توجد عملية بيع حقيقية.'}
];
const DEMO_STORES=[
 {id:'tech',name:'متجر التقنية',image:'shopTech',type:'إلكترونيات',icon:'laptop'},
 {id:'home',name:'متجر المنزل',image:'shopHome',type:'أثاث ومنزل',icon:'house'},
 {id:'cars',name:'متجر السيارات',image:'shopCar',type:'سيارات',icon:'car'}
];
const CATS=[
 {id:'all',name:'الكل',icon:'grid'},
 {id:'سيارات',name:'سيارات',icon:'truck'},
 {id:'إلكترونيات',name:'إلكترونيات',icon:'laptop'},
 {id:'المنزل',name:'المنزل',icon:'house'},
 {id:'خدمات',name:'الخدمات',icon:'tools'},
 {id:'متاجر',name:'المزيد',icon:'grid'}
];
const TABS=[
 {id:'home',label:'الرئيسية',icon:'home'},
 {id:'stores',label:'المتاجر',icon:'store'},
 {id:'post',label:'أضف إعلان',icon:'plus'},
 {id:'favorites',label:'المفضلة',icon:'heart'},
 {id:'account',label:'حسابي',icon:'user'}
];
const VALID_ROUTES=new Set(['welcome','role','home','listings','store','post','create-store','account','favorites','services','details','stores']);
const readSet=()=>{
 try{return new Set(JSON.parse(sessionStorage.getItem('sooqak-v100-favorites')||'[]').filter(x=>DEMO_PRODUCTS.some(p=>p.id===x)))}catch{return new Set()}
};
const currentHash=()=>{const raw=decodeURIComponent(location.hash.slice(1)).split('?')[0];return VALID_ROUTES.has(raw)?raw:null};
const state={
 route:currentHash()||(sessionStorage.getItem('sooqak-v100-introduced')?'home':'welcome'),
 role:sessionStorage.getItem('sooqak-v100-role')||'personal',
 category:'all',query:'',favorites:readSet(),activeProduct:'car',activeStore:'tech',
 selectedImages:[],storeTab:'ads',showMore:false,formError:'',scrolled:false,
 draft:{title:'',description:'',price:'',category:'سيارات',city:'الرياض',phone:''}
};
const app=$('#app');
const header=()=>'<header class="mobile-header"><div class="header-start"><button data-go="home" class="brand-link" aria-label="العودة للرئيسية"><span class="brand-crop" aria-hidden="true"><img src="'+POSTER+'" alt=""></span></button></div><div class="header-actions"><button data-action="information" class="action-icon" aria-label="معلومات المعاينة">'+icon('warning',21)+'</button><button data-action="notifications" class="action-icon" aria-label="التنبيهات">'+icon('bell',21)+'</button><span class="header-flag">🇸🇦 السعودية</span></div></header>';
const nav=()=>'<nav class="nav-tabs" aria-label="التنقل الرئيسي">'+TABS.map(t=>'<button class="nav-item '+(state.route===t.id?'active':'')+' '+(t.id==='post'?'nav-post':'')+'" data-go="'+t.id+'" aria-label="'+t.label+'" '+(state.route===t.id?'aria-current="page"':'')+'>'+(t.id==='post'?'<span class="plus-disc">'+icon('plus')+'</span>':icon(t.icon))+'<span>'+t.label+'</span></button>').join('')+'</nav>';
const aside=()=>'<aside class="desktop-side" aria-label="قائمة سطح المكتب"><div class="side-brand"><span class="brand-crop"><img src="'+POSTER+'" alt="سوقك"></span></div><nav class="side-nav">'+TABS.map(t=>'<button class="side-link '+(state.route===t.id?'active':'')+'" data-go="'+t.id+'">'+icon(t.icon)+' '+t.label+'</button>').join('')+'<button class="side-link" data-go="listings">'+icon('grid')+' الإعلانات</button><button class="side-link" data-go="services">'+icon('tools')+' دليل الخدمات</button></nav><p class="side-note">معاينة التصميم V100<br>لا توجد عمليات بيع أو حسابات حقيقية في هذه النسخة. المرجع البصري هو البوستر المعتمد.</p></aside>';
const notice=(small=false)=>'<div class="preview-ribbon" role="note">'+icon('warning',16)+'<span><span class="ribbon-strong">معاينة تصميمية فقط.</span> الصور والأسعار والمتاجر أمثلة من البوستر ولا تمثل عروضًا حقيقية.</span></div>';
const title=(head,action)=>'<div class="section-title"><h2>'+head+'</h2>'+(action||'')+'</div>';
const btn=(text,route,style='btn-orange')=>'<button class="'+style+'" data-go="'+route+'">'+text+'</button>';
const search=()=>'<form class="home-search" id="search-form" role="search"><button class="search-submit" type="submit" aria-label="ابحث">'+icon('search')+'</button><input class="search-input" type="search" name="q" aria-label="البحث في سوقك" placeholder="ابحث عن منتج أو إعلان أو متجر..." value="'+escape(state.query)+'" autocomplete="off"></form>';
const product=(p)=>'<article class="product-card" data-product="'+p.id+'"><div class="product-visual"><button class="favorite-heart '+(state.favorites.has(p.id)?'saved':'')+'" data-favorite="'+p.id+'" aria-label="'+(state.favorites.has(p.id)?'إزالة من المفضلة':'إضافة إلى المفضلة')+'" aria-pressed="'+state.favorites.has(p.id)+'">'+icon('heart')+'</button><button data-detail="'+p.id+'" style="background:transparent;width:100%;height:100%;padding:0;display:block" aria-label="تفاصيل '+escape(p.title)+'">'+crop(p.image)+'</button></div><div class="product-info"><button data-detail="'+p.id+'" style="background:transparent;text-align:right;padding:0;width:100%;color:inherit"><strong>'+escape(p.title)+'</strong></button><span class="price">'+money(p.price)+' <small>ر.س</small></span><div class="meta">'+icon('pin',12)+' '+escape(p.city)+' <span style="margin-inline-start:auto">تصميم تجريبي</span></div></div></article>';
const filtered=()=>{
 let items=DEMO_PRODUCTS;
 if(state.category!=='all'&&state.category!=='المنزل'){
  items=items.filter(x=>x.category===state.category);
 }else if(state.category==='المنزل'){items=items.filter(x=>x.category==='أثاث ومنزل')}
 if(state.query)items=items.filter(x=>(x.title+' '+x.category+' '+x.city).toLowerCase().includes(state.query.toLowerCase()));
 return items
};
const products=(arr)=>arr.length?'<div class="product-grid">'+arr.map(product).join('')+'</div>':'<div class="status-empty"><div class="empty-graphic">📦</div><h3>ما لقينا إعلانات مطابقة</h3><p>جرّب قسمًا آخر أو غيّر كلمات البحث.</p><button class="btn-soft" data-action="reset-search" style="margin-top:14px">عرض جميع الأمثلة</button></div>';
const shop=(p)=>'<button class="shop-mini" data-store="'+p.id+'"><div class="shop-cover">'+crop(p.image,'shop-crop')+'</div><strong>'+escape(p.name)+'</strong><small>'+icon('check',12)+' متجر توضيحي</small></button>';
const chips=()=>'<div class="listing-filters" role="group" aria-label="تصفية حسب القسم">'+CATS.filter(c=>c.id!=='متاجر').map(c=>'<button class="filter-chip '+(state.category===c.id?'active':'')+'" data-cat="'+c.id+'" aria-pressed="'+(state.category===c.id)+'">'+c.name+'</button>').join('')+'</div>';
function welcome(){
 return '<section class="promo-screen"><div class="promo-logo"><span class="brand-crop"><img src="'+POSTER+'" alt="سوقك SOOQAK"></span></div><h1 class="promo-copy">منصة البيع والشراء<br>والمتاجر والخدمات</h1><div class="promo-art">'+crop('welcome','promo-art')+'</div><div class="step-dots promo-dots"><span class="active"></span><span></span><span></span><span></span></div><div class="promo-actions"><button class="btn-orange btn-block" data-go="role">ابدأ الآن '+icon('arrow',18)+'</button><div class="hint">لديك حساب بالفعل؟ <button data-action="not-ready">تسجيل الدخول</button></div><div class="tiny muted" style="text-align:center">معاينة تصميمية — ليست تسجيلًا حقيقيًا</div></div></section>';
}
function roles(){
 return '<section class="role-screen"><div class="role-logo"><div class="brand-crop" style="transform:scale(1.5);transform-origin:top right"><img src="'+POSTER+'" alt="سوقك"></div></div><h1>اختر نوع حسابك</h1><div class="role-cards">'+
 '<button class="role-card '+(state.role==='personal'?'selected':'')+'" data-role="personal"><span class="role-icon">'+icon('user',37)+'</span><span><strong>مستخدم عادي</strong><small>للبيع والشراء وتصفح الإعلانات</small></span><span class="radio-state">'+(state.role==='personal'?icon('check',15):'')+'</span></button>'+
 '<button class="role-card '+(state.role==='business'?'selected':'')+'" data-role="business"><span class="role-icon" style="color:#fc9200">'+icon('store',37)+'</span><span><strong>تاجر / صاحب متجر</strong><small>أنشئ متجرك في سوقك وأدر منتجاتك وطلباتك عند توفر الخدمة</small></span><span class="radio-state">'+(state.role==='business'?icon('check',15):'')+'</span></button></div>'+
 '<div class="role-extras"><div class="role-extra"><span>'+icon('store',25)+'</span>متجر احترافي</div><div class="role-extra"><span>'+icon('trend',25)+'</span>إدارة سهلة</div><div class="role-extra"><span>'+icon('shield',25)+'</span>بيع وشراء آمن</div></div>'+
 '<button class="btn-orange btn-block" data-action="complete-onboarding">متابعة '+icon('arrow')+'</button><p class="tiny muted" style="text-align:center;margin-top:12px">الاختيار للتجربة البصرية فقط — لا يُنشئ حسابًا.</p></section>';
}
function home(){
 return '<section class="view section-view home-view">'+search()+notice(true)+
 '<div class="hero-banner"><div class="banner-art">'+crop('banner','poster-art')+'</div><div class="banner-extra"><h2>سوقك... كل اللي تبيه</h2><p>سيارات وإلكترونيات ومتاجر وخدمات في مكان واحد</p><button data-action="car-offers" class="btn-orange">تصفح الإعلانات '+icon('arrow')+'</button></div><button class="banner-hit" data-action="car-offers" aria-label="تصفح إعلانات السيارات التجريبية"></button><span class="banner-caption">عرض بصري من البوستر المعتمد</span></div><div class="hero-dots"><span></span><span></span><span></span></div>'+
 '<div class="category-strip">'+CATS.filter(c=>c.id!=='all').map(c=>'<button class="category-item" data-shortcut="'+c.id+'"><span class="category-icon">'+icon(c.icon,25)+'</span><span>'+c.name+'</span></button>').join('')+'</div>'+
 title('🏬 متاجر سوقك','<button class="text-link" data-go="stores">عرض الكل ‹</button>')+
 '<div class="shop-strip">'+DEMO_STORES.map(shop).join('')+'</div>'+
 title('✨ أحدث الإعلانات','<button class="text-link" data-go="listings">عرض الكل ‹</button>')+
 products(DEMO_PRODUCTS)+
 '<div class="mini-panel" style="text-align:center"><strong style="color:#08763f">سوقك يجمعك بالفرص</strong><div class="tiny">بيع واشتري واستكشف المتاجر والخدمات بسهولة.</div><button class="btn-orange" data-go="create-store" style="margin-top:10px">أنشئ متجرك</button></div></section>';
}
function listings(){
 return '<section class="view section-view"><div class="page-topbar"><button class="back-btn" data-go="home" aria-label="العودة">'+icon('back')+'</button><h1>الإعلانات</h1><span class="location-chip">'+icon('pin',14)+' الرياض</span></div>'+notice()+
 chips()+title('إعلانات قريبة منك <span class="kicker">◎</span>','<span class="tiny muted">'+filtered().length+' أمثلة</span>')+products(filtered())+'</section>';
}
function stores(){
 return '<section class="view section-view"><div class="page-topbar"><button class="back-btn" data-go="home" aria-label="العودة">'+icon('back')+'</button><h1>متاجر سوقك</h1><span></span></div>'+notice()+title('تسوق من المتاجر','')+'<div class="shop-strip" style="margin-top:14px">'+DEMO_STORES.map(shop).join('')+'</div><div class="mini-panel">عرض المتاجر هنا جزء من التصميم التجريبي فقط. لا تظهر شارة توثيق فعلية دون تحقق رسمي.</div><button class="btn-orange btn-block" data-go="create-store">أنشئ متجرك في سوقك</button></section>';
}
function store(){
 const s=DEMO_STORES.find(x=>x.id===state.activeStore)||DEMO_STORES[0];
 const displayed=DEMO_PRODUCTS.filter(x=>s.id==='tech'?['laptop','phone'].includes(x.id):s.id==='home'?x.id==='sofa':x.id==='car');
 return '<section class="view section-view"><div class="page-topbar"><button class="back-btn" data-go="stores" aria-label="العودة">'+icon('back')+'</button><h1>المتجر</h1><button class="back-btn" data-action="share">'+icon('share')+'</button></div>'+
 '<div class="store-profile-cover">'+crop('storeCover','store-cover-photo')+'</div><div class="store-identity"><div class="store-profile-heading"><div class="store-avatar">'+icon(s.icon,37)+'</div><div><h1>'+escape(s.name)+'</h1><span class="verified">'+icon('check',13)+' مثال متجر من البوستر</span></div></div>'+
 '<div class="store-stats"><div class="store-stat"><strong>—</strong>متابع</div><div class="store-stat"><strong>—</strong>التقييم</div><div class="store-stat"><strong>'+displayed.length+'</strong>منتج توضيحي</div></div>'+
 '<div class="store-action-row"><button class="btn-orange" data-action="follow">+ متابعة</button><button class="btn-outline" data-action="message">'+icon('message')+' مراسلة</button></div>'+
 '<div class="store-tabs"><button class="store-tab '+(state.storeTab==='ads'?'active':'')+'" data-store-tab="ads">الإعلانات</button><button class="store-tab '+(state.storeTab==='reviews'?'active':'')+'" data-store-tab="reviews">التقييمات</button><button class="store-tab '+(state.storeTab==='about'?'active':'')+'" data-store-tab="about">معلومات المتجر</button></div>'+
 (state.storeTab==='ads'?products(displayed):state.storeTab==='reviews'?'<div class="status-empty">لا توجد تقييمات حقيقية في المعاينة.</div>':'<div class="mini-panel">متجر توضيحي يستخدم صور البوستر المعتمد. لم يتم توثيق أي تاجر أو نشاط تجاري.</div>')+'</div></section>'
}
function post(){
 return '<section class="view section-view"><div class="page-topbar"><button class="back-btn" data-go="home" aria-label="العودة">'+icon('back')+'</button><h1>إضافة إعلان</h1><span></span></div>'+notice()+
 '<form class="form-card" id="listing-form" novalidate><div class="upload-row"><label class="upload-area" for="listing-photos">'+icon('camera',30)+'<strong>أضف صور الإعلان</strong><span>حتى 10 صور — معاينة محلية</span></label><input type="file" id="listing-photos" accept="image/*" multiple hidden><div class="upload-preview" id="image-preview">'+(state.selectedImages[0]?'<img src="'+state.selectedImages[0]+'" alt="معاينة صورة الإعلان">':crop('car','poster-photo'))+'</div></div>'+
 '<div class="field"><label for="ad-title">عنوان الإعلان <span class="required">*</span></label><input id="ad-title" name="title" maxlength="85" placeholder="مثال: تويوتا كامري 2023 بحالة ممتازة" value="'+escape(state.draft.title)+'" required></div>'+
 '<div class="field"><label for="ad-desc">الوصف</label><textarea id="ad-desc" name="description" rows="3" placeholder="اكتب وصفًا واضحًا للمنتج...">'+escape(state.draft.description)+'</textarea></div>'+
 '<div class="field"><label for="ad-price">السعر (ر.س) <span class="required">*</span></label><input id="ad-price" name="price" inputmode="numeric" type="number" min="1" max="99999999" placeholder="45,000" value="'+escape(state.draft.price)+'" required></div>'+
 '<div class="field"><label for="ad-category">القسم <span class="required">*</span></label><select id="ad-category" name="category">'+['سيارات','عقارات','إلكترونيات','أثاث ومنزل','خدمات','أخرى'].map(c=>'<option '+(state.draft.category===c?'selected':'')+'>'+c+'</option>').join('')+'</select></div>'+
 '<div class="field"><label for="ad-city">المدينة <span class="required">*</span></label><select id="ad-city" name="city">'+['الرياض','الدمام','الخبر','الجبيل','جدة','مكة','المدينة المنورة','الأحساء','أخرى'].map(c=>'<option '+(state.draft.city===c?'selected':'')+'>'+c+'</option>').join('')+'</select></div>'+
 '<p class="inline-alert">'+icon('warning',14)+' هذا نموذج تجريبي. زر المتابعة يعرض مراجعة فقط، ولا ينشر الإعلان أو يرفع الصور لأي خادم.</p>'+
 '<div id="form-error" class="field-error">'+escape(state.formError)+'</div><div class="form-actions"><button class="btn-primary btn-block" type="submit">معاينة الإعلان '+icon('arrow')+'</button></div></form></section>';
}
function createStore(){
 return '<section class="view section-view"><div class="page-topbar"><button class="back-btn" data-go="home" aria-label="العودة">'+icon('back')+'</button><h1>أنشئ متجرك</h1><span></span></div>'+
 '<div class="promo-store"><h1>أنشئ متجرك</h1><div class="store-art">'+crop('storeArt','poster-photo store-photo')+'</div><h1 style="margin-top:0">متجرك في سوقك</h1><p class="subhead">واجهة متجر احترافية بنفس الهوية التي اخترتها.</p>'+
 '<div class="promo-benefits">'+['واجهة متجر احترافية','إدارة المنتجات والإعلانات','إحصاءات موثوقة عند توفر بيانات فعلية','بناء علامتك التجارية'].map(t=>'<div class="promo-benefit"><span class="check">'+icon('check',14)+'</span>'+t+'</div>').join('')+'</div><button class="btn-orange btn-block" data-action="create-store">أنشئ متجرك الآن '+icon('store')+'</button><div class="inline-alert">هذه معاينة لشكل إنشاء المتجر؛ إنشاء متجر حقيقي يحتاج حسابًا وصلاحيات مفعلة.</div></div></section>'
}
function account(){
 return '<section class="view section-view"><div class="page-topbar"><button class="back-btn" data-go="home" aria-label="العودة">'+icon('back')+'</button><h1>حسابي</h1><button class="back-btn" data-action="settings" aria-label="الإعدادات">'+icon('settings')+'</button></div>'+notice()+
 '<div class="account-top"><div class="account-avatar">'+icon('user',34)+'</div><div><h2>حساب تجريبي</h2><small>واجهة توضيحية — لا يوجد تسجيل دخول حقيقي</small><div class="verified">'+icon('warning',13)+' غير موثق</div></div></div>'+
 '<div class="account-counters"><div class="account-count"><strong>—</strong>إعلاناتي</div><div class="account-count"><strong>—</strong>طلباتي</div><div class="account-count"><strong>'+state.favorites.size+'</strong>المفضلة</div></div>'+
 '<div class="account-list">'+[
 ['store','إدارة متجري','create-store'],['edit','إعلاناتي','post'],['bag','طلباتي','not-ready'],['star','التقييمات والمراجعات','not-ready'],['message','الرسائل','not-ready'],['settings','الإعدادات','settings']
 ].map(([i,label,go])=>'<button class="account-row" '+(go==='not-ready'||go==='settings'?'data-action="'+go+'"':'data-go="'+go+'"')+'><span class="right">'+icon(i,18)+label+'</span><span class="chevron">'+icon('arrow',17)+'</span></button>').join('')+'</div>'+
 '<button class="btn-soft btn-block" data-go="welcome" style="margin-top:19px">'+icon('logout')+' عرض شاشة البداية</button></section>'
}
function favorites(){
 const arr=DEMO_PRODUCTS.filter(x=>state.favorites.has(x.id));
 return '<section class="view section-view"><div class="page-topbar"><button class="back-btn" data-go="home" aria-label="العودة">'+icon('back')+'</button><h1>المفضلة</h1><span class="tiny muted">'+arr.length+' عناصر</span></div>'+notice()+products(arr.length?arr:[])+'</section>';
}
function services(){
 return '<section class="view section-view"><div class="page-topbar"><button class="back-btn" data-go="home" aria-label="العودة">'+icon('back')+'</button><h1>دليل الخدمات</h1><span></span></div>'+notice()+'<div class="mini-panel">هذه واجهة دليل الخدمات بتصميم سوقك الجديد. الربط بمقدمي الخدمات الحقيقيين مرحلة منفصلة عن هذه المعاينة.</div>'+
 '<div class="category-strip" style="grid-template-columns:repeat(3,1fr)">'+['ورَش','تنظيف','نقل'].map((x,i)=>'<button class="category-item" data-action="not-ready"><span class="category-icon">'+icon(['tools','shield','truck'][i],24)+'</span>'+x+'</button>').join('')+'</div>'+
 '<div class="status-empty"><div class="empty-graphic">🧰</div><h3>خدمات مدينتك</h3><p>ستظهر هنا الجهات التي لديها إعلانات منشورة فعلًا.</p></div></section>';
}
function details(){
 const p=DEMO_PRODUCTS.find(x=>x.id===state.activeProduct)||DEMO_PRODUCTS[0];
 return '<section class="view section-view"><div class="page-topbar"><button class="back-btn" data-go="listings" aria-label="العودة">'+icon('back')+'</button><h1>تفاصيل الإعلان</h1><div class="aux"><button class="back-btn" data-favorite="'+p.id+'" aria-label="إضافة إلى المفضلة">'+icon('heart')+'</button></div></div>'+notice()+
 '<div class="gallery">'+crop(p.image,'gallery-photo')+'</div><div class="detail-overview"><h1 class="detail-title">'+escape(p.title)+'</h1><div class="detail-price">'+money(p.price)+' <small>ر.س</small></div><div class="detail-meta"><span>'+icon('pin',14)+' '+escape(p.city)+'</span><span>'+icon('badge',14)+' مثال من البوستر</span></div><div class="divider"></div><h3 style="font-size:15px">وصف الإعلان</h3><p class="detail-copy">'+escape(p.description)+'</p><div class="detail-actions"><button class="btn-orange" data-action="contact">مراسلة البائع '+icon('message')+'</button><button class="btn-outline" data-action="contact">اتصال '+icon('phone')+'</button></div><div class="detail-warning">⚠️ هذا عرض توضيحي للتصميم فقط. لا تحوّل أي أموال أو تتواصل مع أرقام افتراضية.</div></div></section>'
}
function view(){
 switch(state.route){
 case 'welcome':return welcome();
 case 'role':return roles();
 case 'home':return home();
 case 'listings':return listings();
 case 'stores':return stores();
 case 'store':return store();
 case 'post':return post();
 case 'create-store':return createStore();
 case 'account':return account();
 case 'favorites':return favorites();
 case 'services':return services();
 case 'details':return details();
 default:return home();
 }
}
function render({scroll=true}={}){
 const onboarding=state.route==='welcome'||state.route==='role';
 app.innerHTML=onboarding?'<main>'+view()+'</main>':'<div class="app-shell"><div class="main-layout">'+aside()+header()+'<main class="main-content">'+view()+'</main>'+nav()+'</div></div>';
 document.title='سوقك | '+({home:'الرئيسية',listings:'الإعلانات',store:'المتجر',post:'إضافة إعلان',account:'حسابي',role:'نوع حسابك',welcome:'مرحبًا',stores:'المتاجر',favorites:'المفضلة',services:'الخدمات',details:'تفاصيل الإعلان','create-store':'إنشاء متجر'}[state.route]||'SOOQAK');
 if(scroll)window.scrollTo({top:0,behavior:'instant'});
}
function go(route,{push=true}={}){
 if(!VALID_ROUTES.has(route))route='home';
 state.route=route;
 if(push)history.pushState({v100:true,route},'',location.pathname+location.search+'#'+encodeURIComponent(route));
 render();
}
let toastHandle=0;
function notify(message){
 const el=$('#toast');el.textContent=message;el.hidden=false;
 clearTimeout(toastHandle);toastHandle=setTimeout(()=>{el.hidden=true},3500);
}
function modal(title,body,actions=''){
 $('#modal-root').innerHTML='<div class="overlay" data-action="overlay"><section role="dialog" aria-modal="true" aria-label="'+escape(title)+'" class="modal-card"><button class="modal-close" data-action="close-modal" aria-label="إغلاق">'+icon('close',20)+'</button><h2>'+escape(title)+'</h2><div>'+body+'</div><div style="display:flex;gap:8px;margin-top:16px">'+(actions||'<button data-action="close-modal" class="btn-primary btn-block">فهمت</button>')+'</div></section></div>';
 document.body.classList.add('no-scroll');
}
function closeModal(){ $('#modal-root').innerHTML='';document.body.classList.remove('no-scroll') }
function handleFavorite(id){
 if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);
 sessionStorage.setItem('sooqak-v100-favorites',JSON.stringify([...state.favorites]));
 render({scroll:false});notify(state.favorites.has(id)?'تمت الإضافة إلى المفضلة التجريبية':'تمت الإزالة من المفضلة');
}
function action(name){
 if(name==='information'){
  modal('حول هذه النسخة','<p>هذه نسخة تصميم V100 مطابقة الاتجاه المعتمد في البوستر. كل المنتجات والمتاجر والأسعار أمثلة بصرية؛ لا تُنشئ معاملات، ولا تحتوي على بيانات عملاء أو حسابات حقيقية.</p><p>الموقع الحقيقي الحالي لم يتغير. هذه تجربة منفصلة للمراجعة والاختبار.</p>');return;
 }
 if(name==='complete-onboarding'){
  sessionStorage.setItem('sooqak-v100-role',state.role);
  sessionStorage.setItem('sooqak-v100-introduced','1');
  go('home');return;
 }
 if(name==='car-offers'){state.category='سيارات';go('listings');return}
 if(name==='reset-search'){state.category='all';state.query='';go('listings');return}
 if(name==='create-store'){
  modal('إنشاء متجر','<p>رأيت الآن شاشة إنشاء المتجر كما في البوستر المعتمد. هذه النسخة تصميمية فقط، لذلك لن ننشئ حسابًا أو متجرًا على قاعدة البيانات قبل اكتمال الأمان والربط.</p>');return
 }
 if(['message','follow','contact','not-ready','notifications','settings'].includes(name)){
  modal('ميزة قيد الربط','<p>هذه الواجهة تعمل كتجربة تفاعلية فقط. لا توجد حسابات أو رسائل أو اتصالات أو تقييمات حقيقية في نسخة المعاينة.</p>');return
 }
 if(name==='share'){
  if(navigator.share)navigator.share({title:'سوقك V100 — معاينة',url:location.href}).catch(()=>{});
  else if(navigator.clipboard)navigator.clipboard.writeText(location.href).then(()=>notify('تم نسخ رابط المعاينة')).catch(()=>notify('انسخ الرابط من شريط العنوان'));
  return
 }
 if(name==='close-modal'){closeModal();return}
 if(name==='overlay'){closeModal();return}
}
document.addEventListener('click',e=>{
 const t=e.target.closest('button');if(!t)return;
 if(t.dataset.go){go(t.dataset.go);return}
 if(t.dataset.role){state.role=t.dataset.role;render({scroll:false});return}
 if(t.dataset.cat){state.category=t.dataset.cat;go('listings');return}
 if(t.dataset.shortcut){
  if(t.dataset.shortcut==='متاجر'){go('stores');return}
  if(t.dataset.shortcut==='خدمات'){go('services');return}
  state.category=t.dataset.shortcut==='المنزل'?'المنزل':t.dataset.shortcut;
  go('listings');return
 }
 if(t.dataset.store){state.activeStore=t.dataset.store;state.storeTab='ads';go('store');return}
 if(t.dataset.storeTab){state.storeTab=t.dataset.storeTab;render({scroll:false});return}
 if(t.dataset.detail){state.activeProduct=t.dataset.detail;go('details');return}
 if(t.dataset.favorite){handleFavorite(t.dataset.favorite);return}
 if(t.dataset.action){action(t.dataset.action);return}
});
document.addEventListener('submit',e=>{
 if(e.target.id==='search-form'){
  e.preventDefault();state.query=String(new FormData(e.target).get('q')||'').trim().slice(0,100);
  state.category='all';go('listings');return;
 }
 if(e.target.id==='listing-form'){
  e.preventDefault();
  const data=new FormData(e.target);
  const title=String(data.get('title')||'').trim(),price=Number(data.get('price'));
  if(title.length<6){state.formError='عنوان الإعلان يجب أن يتكون من 6 أحرف على الأقل.';$('#form-error').textContent=state.formError;$('#ad-title')?.focus();return}
  if(!Number.isFinite(price)||price<=0){state.formError='اكتب سعرًا صحيحًا أكبر من صفر.';$('#form-error').textContent=state.formError;$('#ad-price')?.focus();return}
  state.formError='';
  for(const k of ['title','description','price','category','city'])state.draft[k]=String(data.get(k)||'');
  modal('مراجعة الإعلان قبل النشر','<p><strong>'+escape(title)+'</strong></p><p>السعر: <strong>'+money(price)+' ر.س</strong></p><p>القسم: '+escape(state.draft.category)+' — المدينة: '+escape(state.draft.city)+'</p><div class="inline-alert">هذه مراجعة محلية فقط. لم يُرفع الإعلان أو صوره إلى أي خادم، ولم يُنشر للزوار.</div>');
 }
});
document.addEventListener('change',e=>{
 if(e.target.id==='listing-photos'){
  const input=e.target;const files=Array.from(input.files||[]);
  if(files.length>10){notify('الحد الأعلى 10 صور');input.value='';return}
  if(files.some(f=>!f.type.startsWith('image/')||f.size>8*1024*1024)){notify('اختر صورًا أصغر من 8 ميجابايت');input.value='';return}
  state.selectedImages.forEach(url=>URL.revokeObjectURL(url));
  state.selectedImages=files.map(f=>URL.createObjectURL(f));
  const frame=$('#image-preview');
  if(frame)frame.innerHTML=state.selectedImages.length?'<img src="'+state.selectedImages[0]+'" alt="معاينة صورة الإعلان">':'<div class="upload-placeholder">📷</div>';
  notify('تم اختيار '+files.length+' صورة للمعاينة المحلية');
 }
});
window.addEventListener('popstate',()=>{
 state.route=currentHash()||'home';
 render();
});
window.addEventListener('hashchange',()=>{
 const route=currentHash();
 if(route&&route!==state.route){state.route=route;render()}
});
let lastSize=window.innerWidth;
window.addEventListener('resize',()=>{
 const now=window.innerWidth;
 if(Math.abs(now-lastSize)<28)return;
 lastSize=now;
 const y=window.scrollY;
 render({scroll:false});
 requestAnimationFrame(()=>window.scrollTo({top:y,behavior:'instant'}));
},{passive:true});
if(!currentHash())history.replaceState({v100:true,route:state.route},'',location.pathname+location.search+'#'+state.route);
render();
window.__SOOQAK_V100__={getState:()=>({route:state.route,category:state.category,query:state.query,favorites:state.favorites.size,previewOnly:true}),go};
})();
