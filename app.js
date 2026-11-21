
/* سوقك | SOOQAK — واجهة تجريبية متصلة بقاعدة البيانات عند تفعيل Supabase. */
'use strict';
const STORAGE_KEY='sooqak:local-demo:v1';
const categories=[['سيارات','🚗'],['عقارات','🏠'],['إلكترونيات','📱'],['أثاث ومنزل','🛋️'],['خدمات','🛠️'],['حيوانات','🐪'],['مستلزمات شخصية','👜'],['معدات وآليات','🚜'],['أخرى','📦']];
const demos=[
{id:'demo-1',title:'سيارة سيدان عائلية — مثال تجريبي',category:'سيارات',emoji:'🚘',color:'blue',city:'الرياض',price:68000,priceType:'قابل للتفاوض',kind:'بيع',description:'إعلان للعرض واختبار واجهة سوقك فقط. لا توجد سيارة معروضة فعليًا.',seller:'بائع تجريبي',createdAt:'2026-11-20T08:00:00Z',status:'متاح',demo:true},
{id:'demo-2',title:'شقة للإيجار — مثال تجريبي',category:'عقارات',emoji:'🏡',color:'sand',city:'الدمام',price:28000,priceType:'ثابت',kind:'بيع',description:'إعلان تجريبي لا يمثل عقارًا حقيقيًا أو عرضًا متاحًا.',seller:'بائع تجريبي',createdAt:'2026-11-20T07:00:00Z',status:'متاح',demo:true},
{id:'demo-3',title:'جوال ذكي حديث — مثال تجريبي',category:'إلكترونيات',emoji:'📱',color:'lavender',city:'جدة',price:2400,priceType:'قابل للتفاوض',kind:'بيع',description:'صورة ورقم توضيحيان لتجربة عرض الإعلان فقط.',seller:'بائع تجريبي',createdAt:'2026-11-20T06:00:00Z',status:'متاح',demo:true},
{id:'demo-4',title:'طقم كنب للمجلس — مثال تجريبي',category:'أثاث ومنزل',emoji:'🛋️',color:'peach',city:'الجبيل',price:3500,priceType:'ثابت',kind:'بيع',description:'مثال تجريبي للديكور والأثاث.',seller:'بائع تجريبي',createdAt:'2026-11-19T20:00:00Z',status:'متاح',demo:true},
{id:'demo-5',title:'مطلوب معدات ورشة — مثال تجريبي',category:'خدمات',emoji:'🛠️',color:'mint',city:'الأحساء',price:null,priceType:'تواصل للسعر',kind:'مطلوب',description:'مثال للإعلانات من نوع مطلوب داخل الأقسام.',seller:'مستخدم تجريبي',createdAt:'2026-11-19T18:00:00Z',status:'متاح',demo:true},
{id:'demo-6',title:'مستلزمات تربية حيوانات — مثال تجريبي',category:'حيوانات',emoji:'🐪',color:'sand',city:'مكة',price:900,priceType:'قابل للتفاوض',kind:'بيع',description:'عرض تجريبي لواجهة سوقك؛ ليس إعلانًا حقيقيًا.',seller:'بائع تجريبي',createdAt:'2026-11-19T17:00:00Z',status:'متاح',demo:true}
];
const readStore=()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{}}catch{return {}}};
const initial=readStore();
let state={account:initial.account||null,role:initial.role||'فردي',ads:Array.isArray(initial.ads)?initial.ads:[],favorites:Array.isArray(initial.favorites)?initial.favorites:[],draft:initial.draft||{},chats:initial.chats||{},reports:Array.isArray(initial.reports)?initial.reports:[],payments:Array.isArray(initial.payments)?initial.payments:[],sales:Array.isArray(initial.sales)?initial.sales:[],contactPrefs:initial.contactPrefs||null,pledgeAcceptedAt:initial.pledgeAcceptedAt||null,cloudPledgeAcceptedAt:null,view:initial.view||'grid',savedSearch:initial.savedSearch||null,sellerProfiles:initial.sellerProfiles||{}};
let selectedCat='',onlyFavorites=false,modalId=null,toastTimer=null;
const cloudEnabled=()=>Boolean(window.SOOQAK_CLOUD_ENABLED);
let sooqakAuthResolved=!cloudEnabled();
if(cloudEnabled()){state.account=null;state.ads=[];state.chats={};state.reports=[];state.sales=[];state.payments=[];}
const cloudError=e=>{const raw=String(e?.message||e);const message=/Signups not allowed for otp|signup.*disabled/i.test(raw)?'إنشاء الحساب عبر البريد غير متاح في إعدادات المشروع حاليًا.':/Unsupported provider|provider is not enabled/i.test(raw)?'Google غير مفعّل في إعدادات تسجيل الدخول.':/rate limit|too many requests|over_email_send_rate_limit/i.test(raw)?'بلغ البريد حد الإرسال المؤقت. إذا سبق إعداد كلمة مرور، استخدمها بدل طلب رابط جديد.':/Invalid login credentials|invalid.*password/i.test(raw)?'البريد أو كلمة المرور غير صحيحة. إذا لم تُنشئ كلمة مرور سابقًا، استخدم الدخول برابط البريد.':/weak_password|password.*(least|short|weak)/i.test(raw)?'كلمة المرور ضعيفة. اختر كلمة مرور أقوى من 12 حرفًا على الأقل.':/email.*not confirmed/i.test(raw)?'تأكد من بريدك الإلكتروني أولًا.':/network|Failed to fetch/i.test(raw)?'تعذر الاتصال بخدمة الحسابات. تحقق من الإنترنت.':/invalid.*(otp|token)|expired/i.test(raw)?'رابط أو رمز الدخول غير صالح أو انتهت صلاحيته.':'تعذر إكمال الطلب في سوقك حاليًا. حاول مرة أخرى.';notify('تعذر إكمال العملية: '+message.slice(0,240))};
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const todayRiyadh=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const money=n=>new Intl.NumberFormat('ar-SA',{maximumFractionDigits:2}).format(Number(n)||0);
const save=()=>{try{const value=cloudEnabled()?{view:state.view,favorites:state.favorites,role:state.role,savedSearch:state.savedSearch}:state;localStorage.setItem(STORAGE_KEY,JSON.stringify(value))}catch(e){alert('امتلأ التخزين المحلي. جرّب استخدام صور أقل أو أصغر.') }};
const allAds=()=>[...state.ads,...demos];
const mine=ad=>!ad.demo&&state.account&&ad.role===state.role&&(cloudEnabled()?ad.ownerId===state.account.id:ad.owner===state.account.email);
// Owner library is cached separately so old/hidden ads never pollute the public feed.
const sooqakOwnedAdCache=new Map();
const byId=id=>allAds().find(a=>a.id===id)||sooqakOwnedAdCache.get(String(id));
const effectiveDate=ad=>ad.bumpAt||ad.createdAt;

// Stage 9: optional market/language preview. Demo data remains strictly Saudi.
const GCOUNTRIES={SA:['🇸🇦 السعودية','🇸🇦 Saudi Arabia'],AE:['🇦🇪 الإمارات','🇦🇪 United Arab Emirates'],KW:['🇰🇼 الكويت','🇰🇼 Kuwait'],QA:['🇶🇦 قطر','🇶🇦 Qatar'],BH:['🇧🇭 البحرين','🇧🇭 Bahrain'],OM:['🇴🇲 عُمان','🇴🇲 Oman']};
const CATEGORIES_EN={'سيارات':'Cars','عقارات':'Real Estate','إلكترونيات':'Electronics','أثاث ومنزل':'Home & Furniture','خدمات':'Services','حيوانات':'Animals','مستلزمات شخصية':'Personal Items','معدات وآليات':'Equipment & Machinery','أخرى':'Other'};
const CITIES_EN={'الرياض':'Riyadh','جدة':'Jeddah','الدمام':'Dammam','الجبيل':'Jubail','الأحساء':'Al Ahsa','مكة':'Makkah','المدينة':'Madinah','الخبر':'Khobar','أبها':'Abha'};
const DEMOS_EN={'demo-1':'Family sedan — demo listing','demo-2':'Apartment for rent — demo listing','demo-3':'Modern smartphone — demo listing','demo-4':'Living room sofa set — demo listing','demo-5':'Workshop equipment wanted — demo listing','demo-6':'Animal care accessories — demo listing'};
const GLOBAL_STORAGE='sooqak:global-preview:v1';
let marketCountry='SA',marketLanguage='ar';
try{const p=JSON.parse(localStorage.getItem(GLOBAL_STORAGE)||'{}');if(Object.hasOwn(GCOUNTRIES,p.country))marketCountry=p.country;if(['ar','en'].includes(p.language))marketLanguage=p.language}catch(e){}
function storeGlobalPreview(){try{localStorage.setItem(GLOBAL_STORAGE,JSON.stringify({country:marketCountry,language:marketLanguage}))}catch(e){}}
function setDirectText(selector,value){const el=document.querySelector(selector);if(el)el.textContent=value}
function setLabelText(el,value){if(!el)return;const n=Array.from(el.childNodes).find(n=>n.nodeType===Node.TEXT_NODE);if(n)n.textContent=value}
function refreshGlobalUI(){
 const en=marketLanguage==='en';document.documentElement.lang=en?'en':'ar';document.documentElement.dir=en?'ltr':'rtl';
 if($('globalCountry'))$('globalCountry').value=marketCountry;
 setDirectText('#globalTitle',en?'SOOQAK starts in Saudi Arabia — with a global vision':'سوقك يبدأ من السعودية... ويتطلع للعالم');
 setDirectText('#globalSubtitle',en?'Explore future Gulf markets. Only Saudi sample listings are available for this preview.':'استكشف أسواق الخليج القادمة؛ النسخة الحالية تعرض أمثلة من السعودية فقط.');
 setDirectText('#globalCountryLabel',en?'Country':'الدولة');setDirectText('#globalLanguage',en?'العربية':'English');
 document.querySelectorAll('#globalCountry option').forEach(o=>{if(GCOUNTRIES[o.value])o.textContent=GCOUNTRIES[o.value][en?1:0]});
 const note=$('globalCountryNotice');if(note){note.hidden=marketCountry==='SA';if(!note.hidden)note.textContent=en?`${GCOUNTRIES[marketCountry][1]} is a future expansion market, not a live marketplace. No listings or verified sellers are available there yet. Select Saudi Arabia to explore sample ads.`:`${GCOUNTRIES[marketCountry][0]} ضمن خطة التوسع المستقبلية، وليست سوقًا مفتوحة حاليًا. لا توجد إعلانات أو بائعون موثقون لهذه الدولة. اختر السعودية لاستعراض الإعلانات التجريبية.`;}
 $('cityFilter').disabled=marketCountry!=='SA';
 $('cityFilter').title=marketCountry!=='SA'?(en?'City browsing is currently available for Saudi sample listings only':'تصفح المدن متاح حاليًا لأمثلة السعودية فقط'):'';
 setDirectText('.demo-banner',en?'🧪 RESTRICTED DATABASE BETA — Sample ads are fictitious. Posted photos and ads may be public. Do not share sensitive information or send money.':'🧪 اختبار محدود متصل بقاعدة بيانات: الإعلانات التجريبية خيالية. لا تُدخل بيانات حساسة ولا تحوّل أي أموال.');
 setDirectText('#searchButton',en?'Search':'بحث');$('searchInput').placeholder=en?'Search for cars, phones, property...':'وش تدور عليه اليوم؟ سيارة، جوال، عقار...';
 setDirectText('#postButton',en?'＋ Post Ad':'＋ أضف إعلان');$('favButton').title=en?'Favorites':'المفضلة';$('chatButton').title=en?'Messages':'المحادثات';if(!state.account)setDirectText('#profileLabel',en?'My Account':'حسابي');setDirectText('#signupButton',en?'Create account':'إنشاء حساب جديد');setDirectText('#loginButton',en?'Sign in / Join':'دخول / حساب جديد');setDirectText('#welcomeSignup',en?'Create account':'إنشاء حساب جديد');setDirectText('#welcomeLogin',en?'Sign in':'تسجيل الدخول');setDirectText('#authWelcomeTitle',en?'New to SOOQAK?':'جديد في سوقك؟');setDirectText('#authWelcomeDesc',en?'Create a free account or sign in on phone and desktop.':'سوّ حسابك مجانًا، أو سجّل دخولك من جوالك والكمبيوتر.');
 setDirectText('.hero-tag',en?'Your market. Your opportunity.':'السوق لك... والفرصة لك');document.querySelector('.hero h1').innerHTML=en?'Find it all <span>on SOOQAK</span>':'كل اللي تحتاجه، <span>في سوقك</span>';
 setDirectText('.hero-copy p',en?'Buy, sell and connect directly. Listings are free; our planned commission is 1% only after a completed sale.':'بيع واشتري وتواصل بشكل مباشر. إعلانك مجانًا، وعمولتنا فقط عند إتمام البيع.');
 document.querySelector('.hero-points').innerHTML=en?'<span>◉ Free listings</span><span>◉ Direct contact</span><span>◉ 1% after a sale</span>':'<span>◉ نشر مجاني</span><span>◉ تواصل مباشر</span><span>◉ عمولة 1% بعد البيع</span>';
 setDirectText('#heroPost',en?'Post an ad for free':'اعرض سلعتك مجانًا ←');
 const eyebrows=document.querySelectorAll('.section-head .eyebrow');if(eyebrows[0])eyebrows[0].textContent=en?'Explore at your pace':'تصفح على راحتك';if(eyebrows[1])eyebrows[1].textContent=en?'Recently added':'آخر المعروض';
 setDirectText('.categories-section h2',en?'Browse Categories':'أقسام سوقك');setDirectText('#showAllCats',en?'All categories →':'جميع الأقسام ←');
 document.querySelectorAll('#categoryCards [data-category]').forEach(el=>setLabelText(el,en?CATEGORIES_EN[el.dataset.category]:el.dataset.category));
 document.querySelectorAll('#categoryFilter option').forEach(o=>o.textContent=o.value?(en?(CATEGORIES_EN[o.value]||o.value):o.value):(en?'All categories':'جميع الأقسام'));
 document.querySelectorAll('#cityFilter option').forEach(o=>o.textContent=o.value?(en?(CITIES_EN[o.value]||o.value):o.value):(en?'All Saudi Arabia':'كل السعودية'));
 const fs=document.querySelectorAll('.filters>label');const fsEn=['Category','City','District','Listing type','Sort by'];const fsAr=['القسم','المدينة','الحي (اختياري)','نوع الإعلان','الترتيب'];fs.forEach((el,i)=>setLabelText(el,(en?fsEn:fsAr)[i]||''));
 setDirectText('.filters h3',en?'Filter Results':'تصفية النتائج');const pr=document.querySelectorAll('.filters .price-row label');if(pr[0])setLabelText(pr[0],en?'Min (SAR)':'من (ر.س)');if(pr[1])setLabelText(pr[1],en?'Max (SAR)':'إلى (ر.س)');
 $('maxPrice').placeholder=en?'No limit':'بدون حد';setDirectText('#resetFilters',en?'Clear filters':'مسح الفلاتر');setDirectText('.filter-note',en?'🔒 We do not require your precise location. City selection is optional.':'🔒 لا نطلب موقعك الدقيق. اختيار المدينة اختياري في البحث.');
 const fType=$('typeFilter');if(fType){const d=en?{'':'Buy & Wanted','بيع':'For sale','مطلوب':'Wanted'}:{'':'بيع ومطلوب','بيع':'للبيع','مطلوب':'مطلوب'};for(const o of fType.options)o.textContent=d[o.value]||o.textContent}
 const sf=$('sortFilter');if(sf){const d=en?{new:'Newest first',cheap:'Lowest price',expensive:'Highest price'}:{new:'الأحدث أولًا',cheap:'الأرخص أولًا',expensive:'الأغلى أولًا'};for(const o of sf.options)o.textContent=d[o.value]||o.textContent}
 setDirectText('.feed-note',en?'Demo examples only — no real offers yet':'أمثلة تجريبية واضحة إلى حين نشر إعلانات حقيقية');
 setDirectText('#resultsTitle',en?(onlyFavorites?'Your favorites':$('categoryFilter').value?`${CATEGORIES_EN[$('categoryFilter').value]||$('categoryFilter').value} listings`:'Latest listings'):(onlyFavorites?'إعلاناتك المفضلة':$('categoryFilter').value?`إعلانات ${$('categoryFilter').value}`:'أحدث الإعلانات'));
 const listed=$('listingGrid').querySelectorAll('.listing-card');setDirectText('#resultsCount',en?`${listed.length} listing(s) (includes samples)`:`${listed.length} إعلانًا (تشمل أمثلة تجريبية)`);setDirectText('#feedLabel',en?(onlyFavorites?'Favorites':marketCountry==='SA'?'Listings in Saudi Arabia':'Future market preview'):(onlyFavorites?'المفضلة':marketCountry==='SA'?'إعلانات متنوعة من السعودية':'سوق مستقبلي قيد التخطيط'));
 setDirectText('#emptyState h3',en?'No matching listings':'ما لقينا إعلانات مطابقة');setDirectText('#emptyState p',en?(marketCountry==='SA'?'Try another category, city or price range.':'This market has no listings yet. Return to Saudi Arabia to explore the demo.'):(marketCountry==='SA'?'جرّب تغير المدينة أو القسم أو نطاق السعر.':'لا توجد إعلانات لهذه الدولة بعد. اختر السعودية للعودة للأمثلة التجريبية.'));setDirectText('#emptyReset',en?'Show all sample listings':'عرض جميع الإعلانات');
 document.querySelectorAll('#listingGrid .listing-card').forEach(el=>{const a=byId(el.dataset.open);if(!a)return;const name=en&&a.demo?DEMOS_EN[a.id]:a.title;const nameEl=el.querySelector('.listing-title');if(nameEl)nameEl.textContent=name;const cityEl=el.querySelector('.listing-meta span');if(cityEl)cityEl.textContent='⌖ '+(en?(CITIES_EN[a.city]||a.city):a.city);const tag=el.querySelector('.media-tag');if(tag)tag.textContent=en?'DEMO':'إعلان تجريبي';const price=el.querySelector('.listing-price');if(price){if(a.price===null||a.priceType==='تواصل للسعر')price.textContent=en?'Contact for price':'تواصل للسعر';else{const small=price.querySelector('small');if(small)small.textContent=en?'SAR':'ر.س'}}});
 const trusts=document.querySelectorAll('.trust-row>div');const headings=en?['Privacy first','Direct contact','Organized platform']:['خصوصيتك أولًا','تواصل مباشر','منصة منظمة'];const details=en?['Seller contact details are optional.','Buyers and sellers agree directly.','Reports and moderation are planned.']:['بيانات اتصال البائع لا تظهر إلا باختياره.','الاتفاق والبيع بين البائع والمشتري.','الإبلاغ عن الإعلانات وإدارة البلاغات.'];trusts.forEach((el,i)=>{setDirectTextIn(el,'strong',headings[i]);setDirectTextIn(el,'small',details[i])});
 setDirectText('.footer-brand p',en?'Small beginnings. Global ambition.':'بداية بسيطة لسوق كبير.');setDirectText('.footer-inner>div:nth-child(2)',en?'Private demo — 2026':'معاينة تجريبية خاصة — 2026');setDirectText('#aboutButton',en?'About the demo':'عن تجربة سوقك');
 const nav=document.querySelectorAll('.mobile-nav button');const texts=en?['Home','Search','Post','Favorites','Account']:['الرئيسية','بحث','إعلان','المفضلة','حسابي'];nav.forEach((el,i)=>{const nodes=Array.from(el.childNodes).filter(x=>x.nodeType===Node.TEXT_NODE);if(nodes.length)nodes[nodes.length-1].textContent=texts[i]});
}
function setDirectTextIn(el,selector,value){const x=el.querySelector(selector);if(x)x.textContent=value}
function setupGlobalPreview(){const sel=$('globalCountry');sel.value=marketCountry;sel.addEventListener('change',()=>{if(!Object.hasOwn(GCOUNTRIES,sel.value))return;marketCountry=sel.value;$('cityFilter').value='';storeGlobalPreview();render()});$('globalLanguage').addEventListener('click',()=>{marketLanguage=marketLanguage==='en'?'ar':'en';storeGlobalPreview();render()});}

function notify(s){const el=$('toast');el.textContent=s;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3300)}
let sooqakPhotoObjectUrls=[];function clearPhotoPreviewUrls(){sooqakPhotoObjectUrls.forEach(url=>URL.revokeObjectURL(url));sooqakPhotoObjectUrls=[];}
function showModal(title,html){closeFilterDrawer(false);clearPhotoPreviewUrls();if($('modalBackdrop').hidden)sooqakPreviousFocus=document.activeElement;$('modalTitle').textContent=title;$('modalContent').innerHTML=html;$('modalBackdrop').hidden=false;document.body.style.overflow='hidden';$('modalClose').focus();}
function closeModal(){sooqakActiveChatId=null;clearPhotoPreviewUrls();$('modalBackdrop').hidden=true;$('modalContent').innerHTML='';document.body.style.overflow='';modalId=null;if(sooqakPreviousFocus?.isConnected)sooqakPreviousFocus.focus();sooqakPreviousFocus=null;}
function cardPrice(ad){return ad.priceType==='تواصل للسعر'||ad.price===null?'تواصل للسعر':`${money(ad.price)} <small>ر.س</small>`}
function cardMedia(ad){return ad.images?.[0]?`<img src="${esc(ad.images[0])}" alt="صورة ${esc(ad.title)}" loading="lazy" decoding="async"/>`:`<span class="item-emoji">${esc(ad.emoji||'📦')}</span>`}
function card(ad){const favorite=state.favorites.includes(ad.id);const date=new Date(ad.createdAt).toLocaleDateString('ar-SA',{year:'numeric',month:'short',day:'numeric'});return `<article class="listing-card" data-open="${esc(ad.id)}" role="button" tabindex="0" aria-label="عرض ${esc(ad.title)}"><div class="listing-media" data-color="${esc(ad.color||'blue')}">${cardMedia(ad)}${ad.demo?'<span class="media-tag">إعلان تجريبي</span>':''}${ad.status==='مباع'?'<span class="sold-tag">تم البيع</span>':ad.status==='محجوز'?'<span class="sold-tag">محجوز مؤقتًا</span>':''}<button class="heart ${favorite?'active':''}" data-fav="${esc(ad.id)}" aria-label="${favorite?'إزالة من المفضلة':'إضافة للمفضلة'}" aria-pressed="${favorite?'true':'false'}">${favorite?'♥':'♡'}</button></div><div class="listing-body"><h3 class="listing-title">${esc(ad.title)}</h3><div class="listing-price">${cardPrice(ad)}</div><div class="listing-meta"><span>⌖ ${esc(ad.city)}</span><span>${esc(date)}</span></div></div></article>`}
function normalizeSearchText(text){return String(text||'').toLowerCase().normalize('NFKC').replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-0x660)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-0x6f0)).replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim()}
function filters(){return {q:$('searchInput').value.trim().toLowerCase(),category:$('categoryFilter').value,city:$('cityFilter').value,kind:$('typeFilter').value,district:$('districtFilter').value.trim().toLowerCase(),min:$('minPrice').value,max:$('maxPrice').value,sort:$('sortFilter').value}}
let remoteQueryTimer=null,remoteQuerySeq=0;
function scheduleRemoteSearch(){
 if(!cloudEnabled()||!window.sooqakCloud||marketCountry!=='SA')return;
 clearTimeout(remoteQueryTimer);
 remoteQueryTimer=setTimeout(()=>refreshCloudAds(),400);
}

function active(ad){if(ad.hidden)return false;if(ad.status==='محجوز'&&ad.reservedUntil&&new Date(ad.reservedUntil).getTime()<=Date.now()){if(cloudEnabled())return !ad.expiresAt||new Date(ad.expiresAt).getTime()>Date.now();ad.status='متاح';delete ad.reservedUntil;save()}return (ad.status==='متاح'||ad.status==='محجوز')&&(!ad.expiresAt||new Date(ad.expiresAt).getTime()>Date.now());}
function render(){const f=filters();updateFilterBadge();let ads=allAds().filter(ad=>active(ad));ads=ads.filter(ad=>(ad.country||'SA')===marketCountry);if(onlyFavorites)ads=ads.filter(ad=>state.favorites.includes(ad.id));if(f.q){const terms=normalizeSearchText(f.q).split(' ').filter(Boolean);ads=ads.filter(ad=>{const haystack=[ad.title,ad.description,ad.city,ad.category,DEMOS_EN[ad.id]||'',CATEGORIES_EN[ad.category]||'',CITIES_EN[ad.city]||''].map(normalizeSearchText).join(' ');return terms.every(term=>haystack.includes(term))})}if(f.category)ads=ads.filter(ad=>ad.category===f.category);if(f.city)ads=ads.filter(ad=>ad.city===f.city);if(f.district)ads=ads.filter(ad=>normalizeSearchText(ad.district||'').includes(normalizeSearchText(f.district)));if(f.kind)ads=ads.filter(ad=>ad.kind===f.kind);if(f.min!=='')ads=ads.filter(ad=>ad.price!==null&&Number(ad.price)>=Number(f.min));if(f.max!=='')ads=ads.filter(ad=>ad.price!==null&&Number(ad.price)<=Number(f.max));if(f.sort==='cheap')ads.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));else if(f.sort==='expensive')ads.sort((a,b)=>(b.price??-Infinity)-(a.price??-Infinity));else ads.sort((a,b)=>new Date(effectiveDate(b))-new Date(effectiveDate(a)));
$('listingGrid').innerHTML=ads.map(card).join('');renderV12LoadMore();$('listingGrid').className='listing-grid'+(state.view==='list'?' list-view':'');$('emptyState').hidden=ads.length>0;$('resultsTitle').textContent=onlyFavorites?'إعلاناتك المفضلة':f.category?`إعلانات ${f.category}`:'أحدث الإعلانات';$('resultsCount').textContent=`${ads.length} إعلانًا ${demos.length?'(تشمل أمثلة تجريبية)':''}`;$('feedLabel').textContent=onlyFavorites?'المفضلة':'إعلانات متنوعة من السعودية';$('favBadge').hidden=!state.favorites.length;$('favBadge').textContent=state.favorites.length;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));document.querySelectorAll('[data-category]').forEach(b=>b.classList.toggle('active',b.dataset.category===f.category));refreshGlobalUI();}

// Preview usability: working deep-links, accessible dialogs, mobile sharing.
let sooqakPreviousFocus=null;
function sooqakListingURL(id){
  const link=new URL(location.href);
  const ad=byId(id);
  if(ad && !ad.demo && /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(String(id))){
    const detail=new URL('./listing.html',location.href);detail.searchParams.set('id',String(id));return detail.toString();
  }
  link.hash='ad-'+encodeURIComponent(String(id));return link.toString();
}
function shareListing(id){
 const ad=byId(id);if(!ad)return notify('هذا الإعلان غير موجود');
 if(!ad.demo&&!cloudEnabled())return showModal('مشاركة الإعلان',`<div class="warning">هذا الإعلان محفوظ على هذا الجهاز فقط، ولا يفتح عند شخص آخر. للمشاركة برابط عام تحتاج نشره من حساب حقيقي في نسخة الاختبار المتصلة بقاعدة البيانات.</div><button class="btn btn-outline" data-act="account">العودة لحسابي</button>`);
 const url=sooqakListingURL(id),title=ad.title;
 const text='شاهد هذا الإعلان في سوقك: '+title+' '+url;
 const wa='https://wa.me/?text='+encodeURIComponent(text);
 const fb='https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url);
 const tg='https://t.me/share/url?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(title);
 const x='https://twitter.com/intent/tweet?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(title);
 const li='https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(url);
 const email='mailto:?subject='+encodeURIComponent('إعلان في سوقك: '+title)+'&body='+encodeURIComponent(text);
 showModal('مشاركة الإعلان — '+title,`<p class="info">اختر التطبيق المناسب أو انسخ الرابط وأرسله لمن تريد.</p><div class="share-grid"><button type="button" class="btn btn-gold" data-share-native="${esc(id)}">📤 مشاركة عبر تطبيقات الجوال</button><button type="button" class="btn btn-outline" data-share-copy="${esc(id)}">🔗 نسخ رابط الإعلان</button><a class="btn btn-outline" href="${esc(wa)}" target="_blank" rel="noopener noreferrer">🟢 واتساب</a><a class="btn btn-outline" href="${esc(fb)}" target="_blank" rel="noopener noreferrer">🔵 فيسبوك</a><a class="btn btn-outline" href="${esc(tg)}" target="_blank" rel="noopener noreferrer">✈️ تلغرام</a><a class="btn btn-outline" href="${esc(x)}" target="_blank" rel="noopener noreferrer">𝕏 منصة X</a><a class="btn btn-outline" href="${esc(li)}" target="_blank" rel="noopener noreferrer">in لينكدإن</a><a class="btn btn-outline" href="${esc(email)}">✉️ البريد الإلكتروني</a></div><div class="share-link-field"><input aria-label="رابط الإعلان" readonly value="${esc(url)}" id="shareLinkInput"/><button class="btn btn-subtle" type="button" data-share-copy="${esc(id)}">نسخ</button></div><p class="seller-contact-small">إنستغرام وسناب شات: جرب زر «مشاركة عبر تطبيقات الجوال»؛ ظهورهما يعتمد على تطبيقات جهازك ودعم استقبال روابط الويب. الروابط التجريبية المؤقتة قد تنتهي، ولا تُنشر الصور تلقائيًا كمنشور في أي منصة.</p>`);
}
async function shareViaDevice(id){
 const ad=byId(id);if(!ad)return;
 const url=sooqakListingURL(id);
 if(!navigator.share)return notify('مشاركة النظام غير متاحة في هذا المتصفح. استخدم خيارات المشاركة أو نسخ الرابط.');
 try{await navigator.share({title:ad.title,text:'شاهد هذا الإعلان في سوقك',url})}
 catch(e){if(e?.name!=='AbortError')notify('لم تكتمل المشاركة. تقدر تختار تطبيقًا آخر أو تنسخ الرابط.');}
}
async function copyListingLink(id){
 const url=sooqakListingURL(id);
 try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);notify('تم نسخ رابط الإعلان');return;}}catch(e){}
 const input=$('shareLinkInput');if(input){input.select();try{if(document.execCommand('copy')){notify('تم نسخ رابط الإعلان');return}}catch(e){}}
 notify('يمكنك تحديد الرابط في الحقل ونسخه يدويًا');
}

function openListingFromLink(){
  if(!location.hash.startsWith('#ad-'))return;
  let id='';try{id=decodeURIComponent(location.hash.slice(4));}catch(e){return;}
  if(!/^[a-zA-Z0-9_-]{1,90}$/.test(id))return;
  const ad=byId(id);
  if(ad){if($('modalBackdrop').hidden)openAd(id);}
  else if(!cloudEnabled())notify('الإعلان غير موجود في هذه النسخة. الإعلانات المحلية لا تنتقل بين الأجهزة.');
}
function sooqakTrapFocus(e){
  if(e.key!=='Tab'||$('modalBackdrop').hidden)return;
  const nodes=Array.from($('modalBackdrop').querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])')).filter(x=>x.getClientRects().length);
  if(!nodes.length){e.preventDefault();return;}
  if(e.shiftKey && document.activeElement===nodes[0]){e.preventDefault();nodes[nodes.length-1].focus();}
  else if(!e.shiftKey && document.activeElement===nodes[nodes.length-1]){e.preventDefault();nodes[0].focus();}
}
function sooqakViewRoadmap(){window.open('./roadmap.html','_blank','noopener,noreferrer');}

function initialize(){setupFilterDrawer();const c=$('categoryCards');c.innerHTML=categories.map(([name,icon])=>`<button class="category-card" data-category="${esc(name)}"><span class="cat-icon">${icon}</span>${esc(name)}</button>`).join('');$('categoryFilter').innerHTML='<option value="">جميع الأقسام</option>'+categories.map(([c])=>`<option>${esc(c)}</option>`).join('');$('searchButton').onclick=()=>{onlyFavorites=false;render();document.querySelector('.market-section').scrollIntoView({behavior:'smooth'})};$('searchInput').oninput=()=>{render();scheduleRemoteSearch()};['categoryFilter','cityFilter','districtFilter','typeFilter','sortFilter','minPrice','maxPrice'].forEach(id=>$(id).addEventListener('input',()=>{onlyFavorites=false;render();scheduleRemoteSearch()}));$('resetFilters').onclick=$('emptyReset').onclick=reset;$('showAllCats').onclick=()=>{selectedCat='';$('categoryFilter').value='';render();scheduleRemoteSearch()};$('homeLink').onclick=e=>{e.preventDefault();reset();window.scrollTo({top:0,behavior:'smooth'})};$('favButton').onclick=showFavorites;$('chatButton').onclick=openChats;$('profileButton').onclick=openProfile;$('signupButton').onclick=()=>openCloudLogin('signup');$('loginButton').onclick=()=>openCloudLogin('login');$('postButton').onclick=openPosting;$('heroPost').onclick=openPosting;$('aboutButton').onclick=about;$('saveSearchButton').onclick=saveCurrentSearch;$('savedSearchesButton').onclick=openSavedSearches;$('modalClose').onclick=closeModal;$('modalBackdrop').onclick=e=>{if(e.target.id==='modalBackdrop')closeModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('filterDrawer')?.classList.contains('is-open'))closeFilterDrawer();else closeModal();}if(e.key==='Enter'&&e.target.dataset.open)openAd(e.target.dataset.open)});document.addEventListener('click',handleClick);document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;save();render()});document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>mobileNav(b.dataset.nav));setupGlobalPreview();render();refreshAuthEntry();openListingFromLink();window.addEventListener('hashchange',openListingFromLink);document.addEventListener('keydown',sooqakTrapFocus);if(cloudEnabled()){window.addEventListener('sooqak:cloud-ready',onCloudReady);window.addEventListener('sooqak:auth',onCloudAuth);window.addEventListener('sooqak:cloud-error',e=>{sooqakAuthResolved=true;refreshAuthEntry();notify(e.detail.message);});if(window.sooqakCloud)onCloudReady();}if(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'){if('serviceWorker'in navigator)Promise.resolve()}}
function reset(){marketCountry='SA';storeGlobalPreview();selectedCat='';onlyFavorites=false;['searchInput','categoryFilter','cityFilter','districtFilter','typeFilter','minPrice','maxPrice'].forEach(id=>$(id).value='');$('sortFilter').value='new';render();scheduleRemoteSearch()}
function showFavorites(){onlyFavorites=true;selectedCat='';$('categoryFilter').value='';render();if(cloudEnabled()&&window.sooqakCloud)refreshCloudAds();closeModal();document.querySelector('.market-section').scrollIntoView({behavior:'smooth'})}
function mobileNav(n){if(n==='home'){reset();window.scrollTo({top:0,behavior:'smooth'})}if(n==='search'){$('searchInput').focus();window.scrollTo({top:0,behavior:'smooth'})}if(n==='post')openPosting();if(n==='favorites')showFavorites();if(n==='account')openProfile()}
function handleClick(e){
 const native=e.target.closest('[data-share-native]');if(native){shareViaDevice(native.dataset.shareNative);return;}
 const copy=e.target.closest('[data-share-copy]');if(copy){copyListingLink(copy.dataset.shareCopy);return;}
const cat=e.target.closest('[data-category]');if(cat){selectedCat=cat.dataset.category;$('categoryFilter').value=selectedCat;onlyFavorites=false;render();scheduleRemoteSearch();document.querySelector('.market-section').scrollIntoView({behavior:'smooth'});return}const heart=e.target.closest('[data-fav]');if(heart){e.stopPropagation();toggleFav(heart.dataset.fav);return}const el=e.target.closest('[data-open]');if(el){openAd(el.dataset.open);return}const act=e.target.closest('[data-act]');if(act)onAction(act.dataset.act,act.dataset.id||'')}
async function toggleFav(id){
  const i=state.favorites.indexOf(id);
  if(cloudEnabled()&&!String(id).startsWith('demo-')){
    if(!state.account)return openCloudLogin();
    try{await window.sooqakCloud.setFavorite(id,i<0)}catch(e){return cloudError(e)}
  }
  if(i>=0)state.favorites.splice(i,1);else state.favorites.push(id);
  save();render();notify(i>=0?'أزلنا الإعلان من المفضلة':'حُفظ الإعلان في المفضلة'+(cloudEnabled()&&!String(id).startsWith('demo-')?' بحسابك':' على جهازك'));
}
function currentSearchPayload(){
  const f=filters();return {search_query:f.q.slice(0,100),category:f.category||'',city:f.city||'',listing_kind:f.kind||'',min_price:f.min===''?null:Number(f.min),max_price:f.max===''?null:Number(f.max)};
}
function applySearchPayload(f){
  $('searchInput').value=f.search_query||'';$('categoryFilter').value=f.category||'';$('cityFilter').value=f.city||'';$('typeFilter').value=f.listing_kind||'';
  $('minPrice').value=f.min_price??'';$('maxPrice').value=f.max_price??'';marketCountry='SA';storeGlobalPreview();onlyFavorites=false;render();scheduleRemoteSearch();closeModal();document.querySelector('.market-section').scrollIntoView({behavior:'smooth'});
}
async function saveCurrentSearch(){
  const q=currentSearchPayload();if(!q.search_query&&!q.category&&!q.city&&!q.listing_kind&&q.min_price===null&&q.max_price===null)return notify('اختر كلمة بحث أو قسمًا أو مدينة أو سعرًا أولًا');
  if(q.min_price!==null&&q.max_price!==null&&q.min_price>q.max_price)return notify('أقل سعر أكبر من أعلى سعر');
  if(cloudEnabled()){
    if(!state.account)return openCloudLogin();
    try{await window.sooqakCloud.addSavedSearch(q);notify('حُفظ بحثك في حسابك، بدون إرسال إشعارات تلقائية')}catch(e){cloudError(e)}
  }else{
    const rows=Array.isArray(state.savedSearch)?state.savedSearch:state.savedSearch?[state.savedSearch]:[];
    rows.unshift({...q,id:'demo-search-'+Date.now()});state.savedSearch=rows.slice(0,20);save();notify('حُفظ البحث على هذا الجهاز فقط');
  }
}
async function openSavedSearches(){
  if(cloudEnabled()&&!state.account)return openCloudLogin();
  let rows=Array.isArray(state.savedSearch)?state.savedSearch:state.savedSearch?[state.savedSearch]:[];
  if(cloudEnabled())try{rows=await window.sooqakCloud.listSavedSearches()}catch(e){return cloudError(e)}
  const rowHtml=rows.map(x=>{const label=[x.search_query||'',x.category||'',x.city||'',x.min_price!=null?'من '+x.min_price+' ر.س':'',x.max_price!=null?'إلى '+x.max_price+' ر.س':''].filter(Boolean).join(' · ');
    return '<div class="saved-search-row"><div><b>'+esc(label||'بحث محفوظ')+'</b><small>يمكنك تطبيق هذا البحث الآن؛ التنبيهات الآلية لم تُفعّل بعد.</small></div><div class="saved-actions"><button class="btn btn-outline btn-mini" data-search-apply="'+esc(x.id)+'">تطبيق</button><button class="btn btn-subtle btn-mini" data-search-delete="'+esc(x.id)+'">حذف</button></div></div>';}).join('');
  showModal('بحوثي المحفوظة',rows.length?rowHtml:'<div class="info">ما عندك بحوث محفوظة حتى الآن. ابحث عن سلعة ثم اضغط «حفظ البحث».</div>');
  document.querySelectorAll('[data-search-apply]').forEach(b=>b.onclick=()=>{const row=rows.find(x=>String(x.id)===b.dataset.searchApply);if(row)applySearchPayload(row)});
  document.querySelectorAll('[data-search-delete]').forEach(b=>b.onclick=async()=>{
    try{if(cloudEnabled())await window.sooqakCloud.deleteSavedSearch(b.dataset.searchDelete);else{state.savedSearch=rows.filter(x=>String(x.id)!==b.dataset.searchDelete);save()}await openSavedSearches();notify('حُذف البحث المحفوظ')}
    catch(e){cloudError(e)}
  });
}

function openAd(id){const ad=byId(id);if(!ad)return;modalId=id;if(mine(ad)){ad.views=(ad.views||0)+1;save()}const isMine=mine(ad);const photosBlock=ad.images?.length?`<div class="photo-strip">${ad.images.map((url,i)=>`<img src="${esc(url)}" alt="صورة ${i+1} للإعلان" loading="lazy"/>`).join('')}</div>`:'';
  const details=`<div class="detail-visual">${cardMedia(ad)}</div>${photosBlock}<h3>${esc(ad.title)}</h3><div class="detail-price">${cardPrice(ad)}</div><div class="detail-meta"><span class="tag">${esc(ad.category)}</span><span class="tag">${esc(ad.city)}${ad.district?' — '+esc(ad.district):''}</span><span class="tag">${esc(ad.kind)}</span><span class="tag">${esc(ad.priceType)}</span><span class="tag">${esc(ad.status)}</span></div><p>${esc(ad.description||'لا يوجد وصف.')}</p><div class="line"></div><p><strong>المعلن:</strong> ${esc(ad.seller||'مستخدم')} ${ad.demo?'<span class="tag">مثال تجريبي</span>':''}</p><button class="seller-link" data-act="seller" data-id="${esc(id)}">♙ عرض ملف البائع وإعلاناته</button>${ad.demo?'<div class="warning">هذا مثال مصمم لاختبار الواجهة. لا توجد سلعة حقيقية أو بائع يمكنك التواصل معه.</div>':''}${!isMine?sellerContactPanel(ad,false):''}<div class="detail-actions">${isMine?(ad.hidden?'<div class="warning">هذا الإعلان مخفي، ولا يظهر للمشترين.</div>':`${ad.status==='منتهي'?`<button class="btn btn-gold" data-act="renew" data-id="${esc(id)}">تجديد الإعلان 60 يومًا</button>`:''}${ad.status!=='مباع'?`<button class="btn btn-outline" data-act="edit" data-id="${esc(id)}">تعديل</button><button class="btn btn-outline" data-act="reserve" data-id="${esc(id)}">حجز</button><button class="btn btn-outline" data-act="bump" data-id="${esc(id)}">رفع الإعلان</button><button class="btn btn-outline" data-act="sold" data-id="${esc(id)}">تم البيع</button>`:''}<button class="btn btn-outline" data-act="delete" data-id="${esc(id)}">إخفاء الإعلان</button>`):`<button class="btn btn-outline" data-act="report" data-id="${esc(id)}">إبلاغ عن الإعلان</button>`}<button class="btn btn-subtle" data-act="share" data-id="${esc(id)}">مشاركة</button></div>`;showModal('تفاصيل الإعلان',details)}
function onAction(act,id){if(act==='seller')return openSellerProfile(id);if(act==='mypublic')return openMySellerProfile();if(act==='editpublic')return editSellerProfile();if(act==='savedsearch')return openSavedSearches();if(act==='browseralerts')return openV12BrowserAlerts();if(act==='share')return shareListing(id);if(act==='chat')return openConversation(id);if(act==='report')return openReport(id);if(act==='edit')return openPosting(id);if(act==='sold')return markSold(id);if(act==='reserve')return reserve(id);if(act==='bump')return bump(id);if(act==='renew')return renewAd(id);if(act==='delete')return deleteAd(id);if(act==='commissions')return openCommissions();if(act==='bank')return openBankInfo();if(act==='notify')return openNotificationSettings();if(act==='myads')return openMyAds();if(act==='setpassword')return openSetPassword();if(act==='logout')return logout();if(act==='account')return openProfile();if(act==='privateprofile')return openPrivateProfile();if(act==='myservices'){location.assign('./services.html?mine=1');return;}if(act==='post')return openPosting();if(act==='login')return openLogin();if(act==='chats')return openChats();if(act==='admin')return openCloudAdminDashboard();if(act==='fav')return showFavorites();if(act==='draft')return openPosting();}
function openLogin(){if(cloudEnabled())return openCloudLogin();showModal('حسابك التجريبي',`<div class="warning"><strong>تنبيه مهم:</strong> هذا تسجيل محلي تجريبي فقط ولا يتحقق من البريد أو Google، ولا يحمي حسابًا حقيقيًا. تسجيل الدخول الفعلي سنربطه بخدمة آمنة قبل إطلاق الموقع للجمهور.</div><form id="loginForm" class="form-grid"><label class="wide">الاسم المعروض<input name="name" required maxlength="40" placeholder="اسم البائع" value="${esc(state.account?.name||'')}" /></label><label class="wide">البريد الإلكتروني (محلي للتجربة فقط)<input name="email" type="email" autocomplete="email" required placeholder="you@example.com" value="${esc(state.account?.email||'')}" /></label><div class="form-actions"><button class="btn btn-gold" type="submit">فتح الحساب التجريبي</button></div></form>`);$('loginForm').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);state.account={name:String(d.get('name')).trim(),email:String(d.get('email')).trim().toLowerCase()};save();closeModal();notify('تم فتح حساب تجريبي محلي — ليس تسجيلًا حقيقيًا');openProfile()}}
function logout(){if(cloudEnabled()){window.sooqakCloud?.signOut().catch(cloudError);closeModal();return}state.account=null;state.role='فردي';save();closeModal();notify('خرجت من الجلسة التجريبية')}
function openProfile(){if(cloudEnabled())return openCloudProfile();if(!state.account){showModal('حسابي',`<p>يمكنك تصفح الإعلانات دون تسجيل. لإنشاء إعلان تجريبي افتح حسابًا محليًا مؤقتًا على جهازك.</p><div class="warning">التوثيق الفعلي بحساب Google أو البريد الإلكتروني المؤكد لم يُربط بعد.</div><button class="btn btn-gold" data-act="login">تجربة الحساب</button>`);return}const my=state.ads.filter(mine),activeCount=my.filter(active).length;showModal('حسابي',`<h3>حياك الله، ${esc(state.account.name)}</h3><p class="muted">${esc(state.account.email)} — تجربة محلية فقط</p><div class="account-tabs"><button id="personalTab" class="${state.role==='فردي'?'active':''}">الحساب الشخصي</button><button id="businessTab" class="${state.role==='متجر'?'active':''}">حساب المتجر</button></div><div class="count-card"><span>إعلاناتك النشطة في هذا الحساب</span><strong>${activeCount}</strong></div><div class="count-card"><span>إجمالي الإعلانات في هذا الحساب</span><strong>${my.length}</strong></div><div class="button-row"><button class="btn btn-gold" data-act="post">＋ إعلان جديد</button><button class="btn btn-gold" data-act="mypublic">ملفي العام</button><button class="btn btn-outline" data-act="editpublic">تعديل البروفايل</button><button class="btn btn-outline" data-act="privateprofile">بيانات حسابي الخاصة</button><button class="btn btn-outline" data-act="myads">إعلاناتي</button><button class="btn btn-outline" data-act="commissions">عمولتي</button><button class="btn btn-outline" data-act="bank">العمولة والسداد</button><button class="btn btn-outline" data-act="notify">رقم الجوال والتنبيهات</button><button class="btn btn-outline" data-act="savedsearch">بحوثي المحفوظة</button><button class="btn btn-outline" data-act="chats">المحادثات</button><button class="btn btn-subtle" data-act="logout">خروج</button></div><div class="info">الحساب الفردي والمتجر منفصلان في تجربة العرض. الربط الآمن والصلاحيات الحقيقية يحتاجان خلفية خادم.</div>`);$('personalTab').onclick=()=>{state.role='فردي';save();openProfile()};$('businessTab').onclick=()=>{state.role='متجر';save();openProfile()}}


/* V9 — private seller settings and safe public seller cards. No phone or email is exposed. */
const sellerProfileKey=()=>state.account?state.account.email+'::'+state.role:'';
function setupFilterDrawer(){
 const toggle=$('filterToggle'),drawer=$('filterDrawer'),overlay=$('filterOverlay');
 if(!toggle||!drawer)return;
 toggle.addEventListener('click',openFilterDrawer);
 $('filterClose').addEventListener('click',()=>closeFilterDrawer());
 overlay.addEventListener('click',()=>closeFilterDrawer());
 $('filterApply').addEventListener('click',()=>{closeFilterDrawer();document.querySelector('.market-section').scrollIntoView({behavior:'smooth'});});
}
function openFilterDrawer(){const d=$('filterDrawer');if(!d)return;$('filterOverlay').hidden=false;d.classList.add('is-open');d.setAttribute('aria-hidden','false');$('filterToggle').setAttribute('aria-expanded','true');document.body.style.overflow='hidden';$('filterClose').focus();}
function closeFilterDrawer(restoreFocus=true){const d=$('filterDrawer');if(!d||!d.classList.contains('is-open'))return;d.classList.remove('is-open');d.setAttribute('aria-hidden','true');$('filterOverlay').hidden=true;$('filterToggle').setAttribute('aria-expanded','false');document.body.style.overflow='';if(restoreFocus)$('filterToggle').focus();}
function updateFilterBadge(){const f=filters(),num=Number(!!f.category)+Number(!!f.city)+Number(!!f.kind)+Number(f.min!=='')+Number(f.max!=='')+Number(f.sort!=='new');const el=$('activeFilterCount');if(el){el.hidden=num===0;el.textContent=String(num)}}
function sellerListings(ad){return allAds().filter(x=>{if(x.demo||ad.demo)return Boolean(ad.demo&&x.demo&&x.seller===ad.seller);return cloudEnabled()?Boolean(ad.accountId&&x.accountId===ad.accountId):Boolean(ad.owner&&x.owner===ad.owner&&x.role===ad.role)}).filter(active)}
function profileBanner(name,city,about,number,isDemo){const initial=(String(name||'س').trim()[0]||'س').toUpperCase();return `<div class="seller-public-head"><div class="seller-avatar" aria-hidden="true">${esc(initial)}</div><div><h3>${esc(name||'بائع سوقك')}</h3><p>${city?'📍 '+esc(city)+' · ':''}${isDemo?'مثال تجريبي · ':''}${number} إعلان متاح</p></div></div>${about?`<p class="seller-bio">${esc(about)}</p>`:'<p class="seller-bio muted">لم يضف البائع نبذة بعد.</p>'}`;}
async function openSellerProfile(adId){const ad=byId(adId);if(!ad)return;let info=null;if(!ad.demo){if(cloudEnabled()&&ad.accountId){try{info=await window.sooqakCloud.getPublicSellerProfile(ad.accountId)}catch(err){return cloudError(err)}}else if(mine(ad)){info=state.sellerProfiles?.[sellerProfileKey()]||null}}const own=mine(ad);drawSellerProfile(ad,info,own);}
function sellerContactPanel(ad, own=false, compact=false){
 if(ad.demo)return '<div class="seller-contact-panel"><h4>التواصل مع البائع</h4><div class="contact-options"><button class="btn btn-gold" type="button" disabled>✉ راسل البائع (تجريبي)</button><button class="btn btn-outline" type="button" disabled>🟢 واتساب (غير متاح)</button><button class="btn btn-outline" type="button" disabled>📞 اتصال (غير متاح)</button></div><p class="seller-contact-small">هذا بائع نموذجي لعرض التصميم فقط. لا يوجد رقم أو محادثة فعلية.</p></div>';
 if(own)return '<div class="seller-contact-panel"><h4>التواصل معك</h4><div class="contact-options"><button class="btn btn-gold" type="button" disabled>✉ راسل البائع — يظهر للمشتري</button></div><p class="seller-contact-small">هذه معاينة ملفك أنت؛ لا يمكنك مراسلة نفسك. زر الاتصال وواتساب لا يظهران للمشتري إلا إذا فعّلتهما في الإعلان.</p>'+sellerPhoneButtons(ad)+sellerPhoneSummary(ad)+'</div>'; 
 const phone=sellerPhoneButtons(ad);
 return `<div class="seller-contact-panel"><h4>تواصل مع البائع</h4><div class="contact-options"><button type="button" class="btn btn-gold" data-act="chat" data-id="${esc(ad.id)}">✉ راسل البائع داخل سوقك</button>${phone}</div>${sellerPhoneSummary(ad)}<div class="seller-contact-small">المراسلة تتطلب حسابًا مسجّلًا؛ رقم الاتصال اختياري ويُعرض فقط بموافقة البائع. الرقم غير موثّق من سوقك حاليًا.</div></div>`;
}
function sellerPhoneSummary(ad){
 const digits=String(ad.whatsapp||'').replace(/\D/g,'');
 if(!/^[1-9][0-9]{7,14}$/.test(digits)||(!ad.allowCall&&ad.showWhatsapp===false)||!active(ad)||ad.demo)return '';
 const visible=digits.startsWith('9665')&&digits.length===12?'0'+digits.slice(3):'+'+digits;
 return `<div class="seller-contact-small">📱 جوال البائع المنشور باختياره: <strong dir="ltr">${esc(visible)}</strong></div>`;
}
function sellerPhoneButtons(ad){
 const digits=String(ad.whatsapp||'').replace(/\D/g,'');
 if(!/^[1-9][0-9]{7,14}$/.test(digits)||ad.demo||!active(ad))return '';
 const phone='+'+digits;
 let buttons='';
 if(ad.showWhatsapp!==false)buttons+=`<a class="btn btn-outline" href="https://wa.me/${digits}?text=${encodeURIComponent('السلام عليكم، أتواصل معك بخصوص إعلانك في سوقك: '+ad.title)}" target="_blank" rel="noopener noreferrer" aria-label="مراسلة رقم البائع على واتساب">🟢 واتساب البائع</a>`;
 if(ad.allowCall)buttons+=`<a class="btn btn-outline" href="tel:${phone}" aria-label="الاتصال برقم البائع">📞 اتصال مباشر</a>`;
 return buttons;
}

function drawSellerProfile(ad,info,own){
 const rows=sellerListings(ad),name=info?.display_name||ad.seller||'بائع سوقك';
 let html=profileBanner(name,info?.city||ad.city,info?.about||'',rows.length,!!ad.demo);
 if(own)html+='<div class="profile-owner-actions"><button class="btn btn-gold" data-act="editpublic">تعديل البروفايل</button><button class="btn btn-outline" data-act="myads">إعلاناتي</button></div>';
 if(rows.length)html+=sellerContactPanel(rows[0],own);
 else html+='<div class="seller-contact-panel"><h4>التواصل مع البائع</h4><button class="btn btn-gold" type="button" disabled>✉ راسل البائع — يظهر مع إعلان نشط</button><p class="muted">لا توجد إعلانات نشطة لهذا الحساب حاليًا. أضف إعلانًا ليتاح التواصل عبره.</p></div>';
 html+='<h3>إعلانات البائع المتاحة</h3>';
 html+=rows.length?rows.slice(0,20).map(x=>`<button class="seller-listing" data-open="${esc(x.id)}"><span class="seller-thumb">${cardMedia(x)}</span><span><b>${esc(x.title)}</b><small>${esc(x.city)} · ${cardPrice(x)}</small></span></button>`).join(''):'<p class="info">ما عنده إعلانات متاحة حاليًا.</p>';
 showModal(own?'ملفي العام — كيف يراني المشترون':'ملف البائع',html);
}
async function openMySellerProfile(){if(!state.account)return openLogin();let info=null,ad=null;const ownAds=state.ads.filter(mine);ad=ownAds[0];if(cloudEnabled()){
 try{const account=await window.sooqakCloud.ensureAccount(state.role==='متجر'?'business':'personal',state.account.name);info=await window.sooqakCloud.getPublicSellerProfile(account.id);ad=ad||{accountId:account.id,seller:state.account.name,city:'',role:state.role,demo:false};}catch(err){return cloudError(err)}
 }else{info=state.sellerProfiles?.[sellerProfileKey()]||null;ad=ad||{owner:state.account.email,role:state.role,seller:state.account.name,city:'',demo:false}}
 drawSellerProfile(ad,info,true);
}
async function editSellerProfile(){if(!state.account)return openLogin();let info=null;if(cloudEnabled()){try{const a=await window.sooqakCloud.ensureAccount(state.role==='متجر'?'business':'personal',state.account.name);info=await window.sooqakCloud.getPublicSellerProfile(a.id)}catch(err){return cloudError(err)}}else info=state.sellerProfiles?.[sellerProfileKey()]||null;
 showModal('تعديل ملف البائع العام',`<div class="seller-privacy">هذه المعلومات ستظهر للمشترين عند فتح ملفك العام. لا تكتب رقم جوالك أو بريدك الإلكتروني في النبذة؛ التواصل داخل سوقك.</div><form id="sellerProfileForm" class="form-grid"><label class="wide">اسم العرض للبائع<input name="display_name" required minlength="2" maxlength="60" value="${esc(info?.display_name||state.account.name)}" placeholder="اسم البائع أو المتجر" /></label><label class="wide">المدينة (اختياري)<input name="city" maxlength="70" value="${esc(info?.city||'')}" placeholder="مثال: الجبيل" /></label><label class="wide">نبذة مختصرة عنك<textarea name="about" maxlength="350" rows="4" placeholder="وش تبيع؟ وش يميزك؟">${esc(info?.about||'')}</textarea></label><div class="form-actions"><button class="btn btn-gold" type="submit">حفظ البروفايل العام</button></div></form>`);
 $('sellerProfileForm').onsubmit=async ev=>{ev.preventDefault();const d=new FormData(ev.currentTarget),name=String(d.get('display_name')||'').trim(),city=String(d.get('city')||'').trim(),about=String(d.get('about')||'').trim();if(name.length<2||name.length>60||city.length>70||about.length>350)return notify('تحقق من طول الاسم والنبذة');const item={display_name:name,city,about,is_visible:true};try{
 if(cloudEnabled())await window.sooqakCloud.savePublicSellerProfile(state.role==='متجر'?'business':'personal',item);
 else{const key=sellerProfileKey();state.sellerProfiles=state.sellerProfiles||{};state.sellerProfiles[key]=item;const email=state.account.email;state.ads.forEach(a=>{if(a.owner===email&&a.role===state.role)a.seller=name});state.account.name=name;save();render()}
 notify('تم حفظ ملف البائع'+(cloudEnabled()?' في قاعدة البيانات':' على هذا الجهاز فقط'));await openMySellerProfile();
 }catch(err){cloudError(err)}};
}

// رقم الجوال خاص بصاحبه؛ طلب استقبال الرسائل لا يعني إرسالها. يلزم تأكيد الرقم وتفعيل مزود SMS أولًا.
function openBankInfo(){showModal('عمولة سوقك وطريقة السداد',`<div class="legal-note"><strong>إعلانك مجاني.</strong> عمولة سوقك المقررة 1% من السعر النهائي الفعلي عند إتمام بيع خاضع للعمولة وفق الشروط، ولا تستحق إذا أعلنت المنصة إعفاءً ترويجيًا ساريًا.</div><div class="count-card"><span>مثال: عند بيع سلعة بـ 2,000 ريال</span><strong>20 ريال عمولة</strong></div><h3>بيانات الحساب البنكي</h3><div class="warning"><strong>غير مفعّلة حتى الآن.</strong> لم نعتمد اسم المستفيد أو البنك أو رقم الآيبان الرسمي لسوقك. لا تحول أي مبلغ إلى أي حساب بناءً على هذه النسخة التجريبية. بعد التفعيل سنعرض البيانات الموثقة داخل صفحة السداد.</div><p class="muted">الإيصالات البنكية والتحقق من التحويلات والرسائل النصية ليست خدمات مفعّلة في هذه المعاينة.</p><button class="btn btn-gold" data-act="commissions">عرض سجل العمولة التجريبي</button>`)}
async function openNotificationSettings(){
  if(!state.account)return openLogin();
  let current=state.contactPrefs||{};
  if(cloudEnabled()){
    try{current=await window.sooqakCloud.getContactPrefs()||{};}catch(err){return cloudError(err)}
  }
  const inSaudi=(!current.phone_e164||String(current.phone_e164).startsWith('+9665'));
  const initialPhone=inSaudi?saudiPhoneDisplay(current.phone_e164):internationalPhoneDisplay(current.phone_e164);
  showModal('رقم الجوال والتنبيهات',`<div class="info">بيانات تواصلك خاصة بك؛ لا تظهر في الإعلانات. في الحساب الحقيقي تُحفظ في قاعدة البيانات المحمية، وفي النسخة المحلية تُحفظ على هذا الجهاز.</div><form id="contactSettings" class="form-grid"><label class="wide">بلد رقم الجوال<select name="phoneCountry"><option value="SA" ${inSaudi?'selected':''}>🇸🇦 السعودية — ابدأ بـ 05</option><option value="INT" ${!inSaudi?'selected':''}>دولة أخرى — أدخل مفتاح الدولة</option></select></label><label class="wide"><span id="phoneLabel">رقم الجوال</span><input name="phone" type="tel" dir="ltr" inputmode="tel" autocomplete="tel" placeholder="05xxxxxxxx" maxlength="21" value="${esc(initialPhone)}" /></label><div class="contact-form-note"><label class="pledge-check"><input name="serviceOptIn" type="checkbox" ${current.service_opt_in?'checked':''}/><span>أوافق على استقبال رسائل SMS تتعلق بحسابي وإعلاناتي عند تفعيل الخدمة وبعد تأكيد الرقم.</span></label><label class="pledge-check"><input name="marketingOptIn" type="checkbox" ${current.marketing_opt_in?'checked':''}/><span>أوافق بشكل منفصل على الرسائل التسويقية والعروض، ويمكنني إلغاؤها متى أردت.</span></label></div><p class="contact-note wide">لا تُرسل أي رسائل SMS الآن، ولا يوجد مزود مدفوع مربوط. رقم الجوال يحتاج تأكيدًا قبل أي إرسال. يمكنك إلغاء الموافقة أو مسح الرقم من هنا.</p><div class="form-actions"><button class="btn btn-gold" type="submit">حفظ تفضيلاتي</button></div></form>`);
  const form=$('contactSettings');
  updateContactField(form);
  form.querySelector('[name="phoneCountry"]').addEventListener('change',()=>updateContactField(form));
  form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(form);const raw=String(fd.get('phone')||'').trim();
    let phone='';if(raw){const value=normalizeWhatsappPhone(raw,fd.get('phoneCountry')||'SA');if(value.error)return notify(value.error);phone='+'+value.phone;}
    const prefs={phone_e164:phone||null,service_opt_in:!!phone&&fd.get('serviceOptIn')==='on',marketing_opt_in:!!phone&&fd.get('marketingOptIn')==='on'};
    if(cloudEnabled()){try{await window.sooqakCloud.saveContactPrefs(prefs)}catch(err){return cloudError(err)}}else{state.contactPrefs=prefs;save()}
    closeModal();notify('حفظنا رقم الجوال وتفضيلاتك، ولم يتم إرسال رسائل SMS');
  };
}
function updateContactField(form){const field=form.querySelector('[name="phone"]');const label=form.querySelector('#phoneLabel');const sa=form.querySelector('[name="phoneCountry"]').value==='SA';field.placeholder=sa?'05xxxxxxxx':'+971501234567';if(label)label.textContent=sa?'رقم الجوال السعودي (05xxxxxxxx)':'رقم الجوال مع مفتاح الدولة (+...)';}
function pledgeMarkup(required){return required?`<section class="pledge-card" aria-label="ميثاق الأمانة والوفاء بالعهد"><h3>ميثاق الأمانة والوفاء بالعهد</h3><div class="ayah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ<br>﴿وَأَوْفُوا بِعَهْدِ اللَّهِ إِذَا عَاهَدْتُمْ وَلَا تَنْقُضُوا الْأَيْمَانَ بَعْدَ تَوْكِيدِهَا وَقَدْ جَعَلْتُمُ اللَّهَ عَلَيْكُمْ كَفِيلًا﴾<small>من سورة النحل، الآية 91</small></div><p>في سوقك، نؤمن أن الأمانة أساس البيع والشراء، وأن الوفاء بالحقوق سبب للبركة والثقة بين الناس.</p><p><strong>أتعهد بالصدق في إعلاناتي وتعاملاتي، وبسداد عمولة منصة سوقك البالغة 1% من قيمة البيع الفعلية عند إتمام عملية بيع خاضعة للعمولة، وفق شروط المنصة.</strong> وأعلم أن نشر الإعلان مجاني ضمن الحدود المعتمدة، وأن عمولة البيع لا تستحق خلال فترة الإعفاء الترويجي إن كان ساريًا.</p><label class="pledge-check"><input type="checkbox" name="pledgeAccept" value="yes" required><span>أوافق على ميثاق الأمانة وشروط العمولة.</span></label><p class="contact-note">يظهر هذا التعهد كاملًا عند أول إعلان فقط، ثم تذكير مختصر لاحقًا.</p></section>`:`<div class="info wide">تذكير بميثاق الأمانة الذي وافقت عليه: الإعلان يجب أن يكون صادقًا، وعمولة سوقك 1% من البيع الفعلي عند استحقاقها. <button type="button" class="btn btn-subtle" data-act="bank">تفاصيل العمولة والسداد</button></div>`;}

function ownAdCard(ad){return `<div class="small-card"><div class="details"><strong>${esc(ad.title)}</strong><small>${esc(ad.status)} — ${esc(ad.city)} — ${ad.price==null?'تواصل للسعر':money(ad.price)+' ر.س'}</small></div><button type="button" data-open="${esc(ad.id)}">إدارة</button></div>`}
function openMyAds(){
 if(!state.account)return openLogin();
 if(cloudEnabled())return openCloudMyAds();
 const ads=state.ads.filter(mine);
 showModal('إعلاناتي',`<div class="small-cards">${ads.length?ads.map(ownAdCard).join(''):'<p>ما نشرت إعلانًا في هذا الحساب بعد.</p>'}</div><div class="line"></div><button class="btn btn-gold" data-act="post">أضف إعلان</button>`);
}
async function openCloudMyAds(){
 if(!state.account||!window.sooqakCloud)return openLogin();
 const kind=state.role==='متجر'?'business':'personal';
 showModal('إعلاناتي','<p id="sooqakMyAdsStatus" class="muted" role="status">جاري تحميل إعلانات حسابك...</p><div id="sooqakMyAdsRows" class="small-cards"></div><button type="button" id="sooqakMyAdsMore" class="btn btn-outline" hidden>عرض 40 إعلانًا إضافيًا</button><div class="line"></div><button type="button" class="btn btn-gold" data-act="post">أضف إعلان</button>');
 let offset=0,busy=false,finished=false;
 const more=$('sooqakMyAdsMore'),holder=$('sooqakMyAdsRows'),status=$('sooqakMyAdsStatus');
 const next=async()=>{
  if(busy||finished||!holder.isConnected)return;
  busy=true;more.disabled=true;status.textContent='جاري تحميل إعلانات حسابك...';
  try{
    const rows=await window.sooqakCloud.fetchMyListings(offset,40,kind);
    if(!holder.isConnected)return;
    const ads=rows.map(convertCloudAd);
    for(const ad of ads)sooqakOwnedAdCache.set(String(ad.id),ad);
    holder.insertAdjacentHTML('beforeend',ads.map(ownAdCard).join(''));
    offset+=ads.length;finished=ads.length<40;
    more.hidden=finished;
    status.textContent=offset?`تم تحميل ${offset} إعلانًا من حسابك`:'ما نشرت إعلانًا في هذا الحساب بعد.';
  }catch(err){if(holder.isConnected){status.textContent='تعذر تحميل إعلانات حسابك. جرّب مرة أخرى.';cloudError(err)}}
  finally{busy=false;if(more.isConnected)more.disabled=false}
 };
 more.onclick=next;
 await next();
}
// Normalize phone numbers for WhatsApp links without forcing Saudi users to type +966.
function saudiPhoneDisplay(value){
  const digits=String(value||'').replace(/[^0-9]/g,'');
  if(/^9665\d{8}$/.test(digits))return '0'+digits.slice(3);
  if(/^5\d{8}$/.test(digits))return '0'+digits;
  return String(value||'');
}
function internationalPhoneDisplay(value){
  const raw=String(value||'').trim();
  if(!raw)return '';
  if(raw.startsWith('+'))return raw;
  if(raw.startsWith('00'))return '+'+raw.slice(2);
  if(/^[1-9]\d{7,14}$/.test(raw))return '+'+raw;
  return raw;
}
function guessPhoneCountry(data){
  if(data.phoneCountry==='INT')return 'INT';
  if(data.phoneCountry==='SA')return 'SA';
  const v=String(data.whatsapp||'').trim();
  if(v && !/^(?:\+?9665\d{8}|05\d{8}|5\d{8})$/.test(v))return 'INT';
  return 'SA';
}
function normalizeWhatsappPhone(value,country){
  const raw=String(value||'').trim()
    .replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632))
    .replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776))
    .replace(/[\s()\-]/g,'');
  if(country==='SA'){
    let digits=raw.replace(/^\+/,'');
    if(/^05\d{8}$/.test(digits))digits='966'+digits.slice(1);
    else if(/^5\d{8}$/.test(digits))digits='966'+digits;
    if(!/^9665\d{8}$/.test(digits))return {error:'رقم الجوال السعودي يجب أن يبدأ بـ 05 ويتكون من 10 أرقام، مثل 05xxxxxxxx'};
    return {phone:digits};
  }
  const international=raw.startsWith('00')?'+'+raw.slice(2):raw;
  if(!/^\+[1-9]\d{7,14}$/.test(international))return {error:'للرقم الأجنبي، أدخل مفتاح الدولة مثل +971501234567'};
  return {phone:international.slice(1)};
}
function updatePhoneForm(form){
  const select=form.querySelector('[name="phoneCountry"]');
  const phone=form.querySelector('[name="whatsapp"]');
  const title=form.querySelector('#phoneLabel');
  if(!select||!phone)return;
  const isSaudi=select.value==='SA';
  phone.placeholder=isSaudi?'05xxxxxxxx':'+971501234567';
  phone.maxLength=isSaudi?16:21;
  if(title)title.textContent=isSaudi?'رقم الجوال السعودي (05xxxxxxxx)':'رقم دولي مع مفتاح الدولة (مثل +971...)';
}


function suggestListingCopy(form){
 const title=form.querySelector('[name="title"]'),detail=form.querySelector('[name="description"]'),cat=form.querySelector('[name="category"]'),city=form.querySelector('[name="city"]');
 if(!title||!detail)return;
 const name=title.value.trim(),place=city?.value||'';if(!name||name.length<5)return notify('اكتب اسم السلعة أو عنوان الإعلان أولًا (5 أحرف على الأقل)');
 if(!confirm('نقترح وصفًا محليًا اعتمادًا على العنوان والقسم والمدينة، دون إرسال صور أو نصوص لأي مزوّد ذكاء اصطناعي. هل تود إدراج الوصف؟'))return;
 const parts=[name+'.',cat?.value?'القسم: '+cat.value+'.':'',place?'المدينة: '+place+'.':'','اذكر الحالة الفعلية والمواصفات والعيوب إن وجدت، وأضف صورًا حقيقية وسعرًا مناسبًا.','التواصل عبر خيارات الإعلان في سوقك.'];
 if(!detail.value.trim())detail.value=parts.filter(Boolean).join('\n');else detail.value=detail.value.trim()+'\n'+parts.filter(Boolean).join(' ');
 detail.dispatchEvent(new Event('input',{bubbles:true}));notify('أضفنا مسودة وصف قابلة للتعديل؛ راجع جميع التفاصيل قبل النشر');
}

function draftSave(form){const d=new FormData(form);const out={};for(const [k,v]of d.entries()){if(k!=='images'&&typeof v==='string')out[k]=v}state.draft=out;save()}
async function openPosting(editId=''){if(typeof editId!=='string')editId='';if(!state.account)return openLogin();if(cloudEnabled()&&!await requirePrivateCity())return;if(cloudEnabled()&&state.cloudPledgeAcceptedAt===null){try{state.cloudPledgeAcceptedAt=await window.sooqakCloud.hasAcceptedPledge()}catch(err){return cloudError(err)}}if(cloudEnabled()&&!editId&&!state.draft?.title){try{state.draft=await window.sooqakCloud.getAccountDraft(state.role==='متجر'?'business':'personal')||{};}catch(e){notify('تعذر استعادة المسودة السحابية مؤقتًا')}}
 const needsPledge=!editId&&!(cloudEnabled()?state.cloudPledgeAcceptedAt:state.pledgeAcceptedAt);const ad=editId?byId(editId):null;if(ad&&!mine(ad))return notify('لا تملك صلاحية تعديل هذا الإعلان');if(cloudEnabled()&&ad&&(ad.hidden||ad.status==='مباع'))return notify('لا يمكن تعديل إعلان مخفي أو مباع');const d=ad||state.draft||{};const photosPreview=cloudEnabled()&&ad?.photoRecords?.length?`<div class="wide"><strong>صور الإعلان الحالية (${ad.photoRecords.length}/5)</strong><div class="existing-photos">${ad.photoRecords.map((p,i)=>`<div class="photo-thumb"><img src="${esc(p.url)}" alt="صورة الإعلان" loading="lazy"/><div class="button-row"><button type="button" class="btn btn-outline btn-mini" data-photo-move="${esc(p.id)}" data-photo-direction="-1" data-photo-ad="${esc(ad.id)}" ${i===0?'disabled':''}>تقديم الصورة</button><button type="button" class="btn btn-outline btn-mini" data-photo-move="${esc(p.id)}" data-photo-direction="1" data-photo-ad="${esc(ad.id)}" ${i===ad.photoRecords.length-1?'disabled':''}>تأخير الصورة</button></div><button type="button" data-photo-remove="${esc(p.id)}" data-photo-path="${esc(p.storage_path)}" data-photo-ad="${esc(ad.id)}">حذف الصورة</button></div>`).join('')}</div></div>`:'';const opts=categories.map(([c])=>`<option value="${esc(c)}" ${d.category===c?'selected':''}>${esc(c)}</option>`).join('');const cities=['الرياض','جدة','الدمام','الجبيل','الأحساء','مكة','المدينة','الخبر','أبها'];const cityOptions=cities.map(c=>`<option ${d.city===c?'selected':''}>${c}</option>`).join('');showModal(ad?'تعديل الإعلان':'أضف إعلانًا مجانًا',`<div class="info">${cloudEnabled()?'النسخة متصلة بقاعدة بيانات سوقك التجريبية. الصور متاحة للاختبار ومكشوفة للعامة عند النشر؛ لا ترفع مستندات أو بيانات حساسة. لا تزال لوحة الإدارة والاختبارات الشاملة قيد العمل.':'نموذج محلي تجريبي: إعلاناتك لن تظهر للأشخاص الآخرين. عند الإطلاق الحقيقي سيكون نشر الإعلان متاحًا بعد تأكيد البريد الإلكتروني.'}</div><div class="info"><button id="sooqakSuggestCopy" class="btn btn-outline" type="button">✨ مساعد صياغة الإعلان</button><small style="display:block;margin-top:6px">اقتراحات تلقائية محلية قابلة للتعديل؛ ليست تحليل صور أو خدمة ذكاء اصطناعي خارجية.</small></div><form id="adForm" class="form-grid"><label class="wide">عنوان الإعلان<input name="title" required minlength="5" maxlength="110" placeholder="مثال: سيارة للبيع بحالة ممتازة" value="${esc(d.title||'')}"/></label><label>نوع الإعلان<select name="kind"><option ${d.kind==='بيع'?'selected':''}>بيع</option><option ${d.kind==='مطلوب'?'selected':''}>مطلوب</option></select></label><label>القسم<select name="category">${opts}</select></label><label>المدينة<select name="city">${cityOptions}</select></label><label>الحي (اختياري)<input name="district" maxlength="60" placeholder="مثال: الفناتير" value="${esc(d.district||'')}" /></label><label>السعر بالريال<input name="price" type="number" min="0" max="999999999" step="1" placeholder="اختياري عند التواصل للسعر" value="${d.price??''}"/></label><label>طريقة السعر<select name="priceType"><option ${d.priceType==='ثابت'?'selected':''}>ثابت</option><option ${d.priceType==='قابل للتفاوض'?'selected':''}>قابل للتفاوض</option><option ${d.priceType==='تواصل للسعر'?'selected':''}>تواصل للسعر</option></select></label><label class="wide">وصف الإعلان<textarea name="description" required minlength="10" maxlength="4000" placeholder="صف السلعة بوضوح، ولا تضع بيانات شخصية حساسة">${esc(d.description||'')}</textarea></label>${photosPreview}<label class="wide">صور الإعلان (حتى 5، JPEG/PNG/WEBP؛ ضغط تلقائي، حجم الصورة بعد الضغط 1.5MB)<input id="adImages" name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple/></label><div class="wide" id="newPhotoPreview" role="status" aria-live="polite"></div><label class="wide" style="display:flex;flex-direction:row;align-items:center"><input type="checkbox" name="showWhatsapp" value="yes" style="width:20px;height:20px" ${d.showWhatsapp===true||d.showWhatsapp==='yes'||(d.whatsapp&&d.showWhatsapp!==false&&!d.allowCall)?'checked':''}/> إظهار زر واتساب اختياريًا للمشترين</label><label class="wide" style="display:flex;flex-direction:row;align-items:center"><input type="checkbox" name="allowCall" value="yes" style="width:20px;height:20px" ${d.allowCall?'checked':''}/> إظهار زر اتصال مباشر برقم الجوال (اختياري)</label><label class="wide">بلد رقم التواصل<select name="phoneCountry" id="phoneCountry"><option value="SA" ${guessPhoneCountry(d)==='SA'?'selected':''}>السعودية — رقم محلي يبدأ بـ 05</option><option value="INT" ${guessPhoneCountry(d)==='INT'?'selected':''}>دولة أخرى — أكتب مفتاح الدولة</option></select></label><label class="wide"><span id="phoneLabel">رقم الجوال السعودي (05xxxxxxxx)</span><input name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" maxlength="21" value="${esc(guessPhoneCountry(d)==='SA'?saudiPhoneDisplay(d.whatsapp):internationalPhoneDisplay(d.whatsapp))}" placeholder="05xxxxxxxx"/><small style="color:#72869a;font-weight:normal">اختياري. لن يظهر للمشترين إلا إذا فعّلت واتساب أو الاتصال أعلاه. تأكد أنك تملك الرقم وتوافق على عرضه للزوار؛ الرقم غير موثّق.</small></label>${pledgeMarkup(needsPledge)}<div class="form-actions"><button class="btn btn-outline" type="button" id="saveDraftButton">حفظ مسودة</button><button class="btn btn-gold" type="submit">${ad?'حفظ التعديل':'نشر تجريبي مجانًا'}</button></div></form>`);const form=$('adForm');$('sooqakSuggestCopy').onclick=()=>suggestListingCopy(form);updatePhoneForm(form);form.querySelector('#phoneCountry').addEventListener('change',()=>updatePhoneForm(form));form.querySelector('#adImages').addEventListener('change',e=>{
 clearPhotoPreviewUrls();const target=$('newPhotoPreview');target.replaceChildren();
 const list=[...e.target.files];const already=cloudEnabled()?(ad?.photoRecords?.length||0):0;
 if(list.length+already>5){e.target.value='';notify('حد الصور خمس، اختر صورًا أقل');return}
 const allowed=['image/jpeg','image/png','image/webp'];
 for(const file of list){
  if(!allowed.includes(file.type)||file.size>12*1024*1024){e.target.value='';target.replaceChildren();clearPhotoPreviewUrls();notify('اختر JPEG أو PNG أو WEBP، حتى 12MB للصورة');return}
  const pic=document.createElement('img');pic.alt='معاينة قبل رفع '+file.name;pic.loading='lazy';pic.width=104;pic.height=90;pic.style.cssText='width:104px;height:90px;object-fit:cover;border-radius:10px;border:1px solid #e1e7ed';
  const url=URL.createObjectURL(file);sooqakPhotoObjectUrls.push(url);pic.src=url;target.append(pic);
 }
 if(list.length)target.insertAdjacentHTML('beforeend','<p class="contact-note">معاينة فقط؛ لن يتم رفع الصور قبل الضغط على نشر الإعلان.</p>');
 });document.querySelectorAll('[data-photo-remove]').forEach(b=>b.onclick=()=>removeCloudPhoto(b.dataset.photoRemove,b.dataset.photoPath,b.dataset.photoAd));document.querySelectorAll('[data-photo-move]').forEach(b=>b.onclick=()=>moveV12Photo(b.dataset.photoAd,b.dataset.photoMove,Number(b.dataset.photoDirection)));form.addEventListener('input',()=>{if(!ad)draftSave(form)});$('saveDraftButton').onclick=async()=>{draftSave(form);if(cloudEnabled()){try{await window.sooqakCloud.saveAccountDraft(state.role==='متجر'?'business':'personal',state.draft);notify('حُفظت المسودة النصية في حسابك دون الصور أو أرقام التواصل')}catch(e){cloudError(e)}}else notify('حفظنا المسودة على جهازك')};form.onsubmit=async e=>{e.preventDefault();await publishAd(form,ad)}}
async function compressImage(file){return new Promise((resolve,reject)=>{if(file.size>12*1024*1024)return reject(Error('الصورة أكبر من 12 ميجابايت'));const reader=new FileReader();reader.onerror=()=>reject(Error('تعذرت قراءة الصورة'));reader.onload=()=>{const img=new Image();img.onerror=()=>reject(Error('صيغة الصورة غير مدعومة'));img.onload=()=>{const scale=Math.min(1,1100/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.68))};img.src=reader.result};reader.readAsDataURL(file)})}
async function compressCloudPhoto(file){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('يرجى اختيار JPEG أو PNG أو WEBP');
  if(!file.size||file.size>12*1024*1024)throw Error('الصورة الأصلية يجب ألا تزيد عن 12 ميجابايت');
  const url=URL.createObjectURL(file);
  try{
    const image=new Image();
    await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('الصورة غير صالحة'));image.src=url});
    const ratio=Math.min(1,1100/Math.max(image.naturalWidth,image.naturalHeight));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));
    canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));
    const context=canvas.getContext('2d');
    if(!context)throw Error('تعذر تجهيز الصورة');
    context.drawImage(image,0,0,canvas.width,canvas.height);
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('تعذر ضغط الصورة')),'image/jpeg',0.72));
    if(blob.size>1572864)throw Error('الصورة كبيرة بعد الضغط؛ اختر صورة أصغر');
    return blob;
  } finally {URL.revokeObjectURL(url)}
}
async function publishAd(form,old){if(cloudEnabled())return publishCloudAd(form,old);const d=new FormData(form);if(!old&&!state.pledgeAcceptedAt&&d.get('pledgeAccept')!=='yes')return notify('يجب الموافقة على ميثاق الأمانة عند نشر أول إعلان');const title=String(d.get('title')||'').trim(),desc=String(d.get('description')||'').trim(),priceType=String(d.get('priceType')),priceStr=String(d.get('price')||'').trim();if(title.length<5||desc.length<10)return notify('تأكد من كتابة عنوان ووصف واضحين');if(priceType!=='تواصل للسعر'&&!priceStr)return notify('أدخل السعر أو اختر تواصل للسعر');if(priceStr!==''&&(!Number.isFinite(+priceStr)||+priceStr<0))return notify('السعر غير صالح');let wa='';if(d.get('showWhatsapp')==='yes'||d.get('allowCall')==='yes'){if(!String(d.get('whatsapp')||'').trim())return notify('أدخل رقم الجوال أو ألغِ خيار إظهار التواصل');const normalized=normalizeWhatsappPhone(d.get('whatsapp'),d.get('phoneCountry')||'SA');if(normalized.error)return notify(normalized.error);wa=normalized.phone;}const category=String(d.get('category'));const duplicate=state.ads.some(a=>a.id!==old?.id&&mine(a)&&active(a)&&a.category===category&&a.title.trim().toLowerCase()===title.toLowerCase());if(duplicate)return notify('عندك إعلان مماثل منشور. عدّل الإعلان الحالي بدل تكراره');const today=todayRiyadh(),limit=state.role==='متجر'?20:5;const used=state.ads.filter(a=>a.owner===state.account.email&&a.role===state.role&&a.postedDay===today).length;if(!old&&used>=limit)return notify(`وصلت الحد اليومي (${limit}) للإعلانات التجريبية`);const files=$('adImages').files;if(files.length>5)return notify('الحد الأقصى 5 صور');let images=old?.images||[];try{if(files.length)images=await Promise.all([...files].map(compressImage))}catch(err){return notify(err.message)}const now=new Date();const payload={id:old?.id||`my-${Date.now()}`,title,description:desc,price:priceStr?Number(priceStr):null,priceType,category,city:String(d.get('city')),district:String(d.get('district')||'').trim(),kind:String(d.get('kind')),whatsapp:wa,showWhatsapp:d.get('showWhatsapp')==='yes',allowCall:d.get('allowCall')==='yes',images,emoji:categories.find(x=>x[0]===category)?.[1]||'📦',color:'blue',seller:state.account.name,owner:state.account.email,role:state.role,createdAt:old?.createdAt||now.toISOString(),postedDay:old?.postedDay||today,status:old?.status||'متاح',expiresAt:old?.expiresAt||new Date(now.getTime()+60*86400000).toISOString(),bumpAt:old?.bumpAt||null,demo:false};if(old)state.ads=state.ads.map(a=>a.id===old.id?payload:a);else state.ads.push(payload);if(!state.pledgeAcceptedAt)state.pledgeAcceptedAt=new Date().toISOString();state.draft={};save();closeModal();reset();notify(old?'تم تعديل إعلانك التجريبي':'تم نشر إعلان محلي على هذا الجهاز فقط')}
function reserve(id){if(cloudEnabled())return reserveCloud(id);const ad=byId(id);if(!ad||!mine(ad))return;const hours=prompt('كم مدة الحجز بالساعات؟ اختر 24 أو 48 أو 72','24');if(hours===null)return;if(!['24','48','72'].includes(hours))return notify('اختر 24 أو 48 أو 72 ساعة');ad.reservedUntil=new Date(Date.now()+Number(hours)*3600000).toISOString();ad.status='محجوز';save();openAd(id);notify('تم حجز الإعلان محليًا')}
function renewAd(id){if(!cloudEnabled())return notify('التجديد الآمن متاح فقط للحسابات الموثّقة');return renewCloudAd(id)}
function deleteAd(id){if(cloudEnabled())return deleteCloud(id);const ad=byId(id);if(!ad||!mine(ad))return;if(!confirm('حذف هذا الإعلان التجريبي؟'))return;state.ads=state.ads.filter(a=>a.id!==id);save();closeModal();render();notify('تم حذف الإعلان التجريبي')}
function bump(id){if(cloudEnabled())return bumpCloud(id);const ad=byId(id);if(!ad||!mine(ad))return;const last=ad.bumpAt||ad.createdAt;const remain=24*3600000-(Date.now()-new Date(last).getTime());if(ad.bumpAt&&remain>0)return notify(`يمكن رفع الإعلان بعد ${Math.ceil(remain/3600000)} ساعة`);ad.bumpAt=new Date().toISOString();save();closeModal();render();notify('رفعنا الإعلان التجريبي')}
function markSold(id){if(cloudEnabled())return sellCloud(id);const ad=byId(id);if(!ad||!mine(ad)||ad.status==='مباع')return;const value=prompt('كم السعر النهائي الفعلي الذي تم البيع عليه بالريال؟ (تجربة محلية فقط)',String(ad.price||''));if(value===null)return;const price=Number(value);if(!Number.isFinite(price)||price<=0)return notify('أدخل قيمة بيع صحيحة أكبر من صفر');if(!confirm(`عمولة سوقك 1% = ${money(price*.01)} ريال. هل تسجّل البيع تجريبيًا؟`))return;ad.status='مباع';ad.salePrice=price;ad.soldAt=new Date().toISOString();state.sales.push({adId:id,owner:ad.owner,role:ad.role,amount:price,commission:+(price*.01).toFixed(2),at:ad.soldAt});save();closeModal();render();notify('سجلنا البيع والعمولة محليًا')}
function openCommissions(){if(cloudEnabled())return openCloudCommissions();if(!state.account)return openLogin();const sales=state.sales.filter(s=>s.owner===state.account.email&&s.role===state.role);const total=sales.reduce((n,s)=>n+s.commission,0);const payments=state.payments.filter(p=>p.owner===state.account.email&&p.role===state.role);const paid=payments.filter(p=>p.approved).reduce((n,p)=>n+p.amount,0);showModal('عمولتي — تجربة محلية',`<div class="warning">لا يوجد حساب بنكي مفعّل ولا موظف يستلم الإيصالات هنا. لا تحول أي أموال بناءً على هذه النسخة التجريبية.</div><button class="btn btn-outline" data-act="bank">تفاصيل العمولة وحالة الحساب البنكي</button><div class="count-card"><span>إجمالي العمولة 1%</span><strong>${money(total)} ر.س</strong></div><div class="count-card"><span>المدفوع والمؤكد</span><strong>${money(paid)} ر.س</strong></div><div class="count-card"><span>المستحق</span><strong>${money(Math.max(0,total-paid))} ر.س</strong></div><h3>سجل المبيعات التجريبي</h3><div class="small-cards">${sales.length?sales.map(s=>`<div class="small-card"><div class="details"><strong>${esc(byId(s.adId)?.title||'إعلان محذوف')}</strong><small>قيمة البيع ${money(s.amount)} ريال</small></div><strong>${money(s.commission)} ر.س</strong></div>`).join(''):'<p>لا توجد عمليات بيع مسجلة في هذا الحساب.</p>'}</div><div class="line"></div><button class="btn btn-outline" id="demoReceipt">تجربة إرفاق إيصال (دون إرسال)</button>`);$('demoReceipt').onclick=()=>{const el=document.createElement('input');el.type='file';el.accept='image/*,application/pdf';el.onchange=()=>notify(el.files?.[0]?`تم اختيار ${el.files[0].name} محليًا، ولم يُرسل أو يُعتمد`: 'لم تختر ملفًا');el.click()}}
function openConversation(adId){if(cloudEnabled())return openCloudConversation(adId);if(!state.account)return openLogin();const ad=byId(adId);if(!ad)return;if(ad.demo)return showModal('محادثة تجريبية',`<div class="warning">هذا الإعلان مجرد مثال ولا يوجد بائع حقيقي، لذلك لا يمكن مراسلته. لم تُفعّل مراسلة المستخدمين عبر الإنترنت بعد.</div><button class="btn btn-outline" data-act="post">جرّب نشر إعلانك</button>`);if(mine(ad))return notify('لا يمكنك مراسلة نفسك');const key=[adId,state.account.email].join('::');state.chats[key]??=[];const messages=state.chats[key];showModal('محادثة محلية — '+ad.title,`<div class="warning">رسائلك هنا محفوظة في هذا المتصفح فقط، ولا تُرسل إلى صاحب الإعلان. هذه محاكاة لاختبار الواجهة.</div><div id="chatMessages">${messages.map(m=>`<div class="chat-bubble mine">${esc(m.text)}<div class="chat-time">${esc(m.at)}</div></div>`).join('')||'<p class="muted">لا توجد رسائل حتى الآن.</p>'}</div><form id="sendDemoMessage" class="form-grid"><label class="wide">رسالة تجريبية<input name="message" maxlength="1000" required placeholder="اكتب هنا..."/></label><button class="btn btn-gold" type="submit">حفظ الرسالة محليًا</button></form>`);$('sendDemoMessage').onsubmit=e=>{e.preventDefault();const text=new FormData(e.target).get('message').trim();if(!text)return;messages.push({text,at:new Date().toLocaleString('ar-SA')});save();openConversation(adId);notify('الرسالة محفوظة محليًا، ولم تصل إلى البائع')}}
function openChats(){if(cloudEnabled())return openCloudChats();if(!state.account)return openLogin();const keys=Object.keys(state.chats).filter(k=>k.endsWith('::'+state.account.email));showModal('المحادثات المحلية',`<div class="warning">المراسلة الحقيقية لم تُربط بخادم بعد. هذه مجرد بيانات محفوظة على جهازك.</div>${keys.length?keys.map(k=>{const id=k.split('::')[0],ad=byId(id);return `<div class="small-card"><div class="details"><strong>${esc(ad?.title||'إعلان')}</strong><small>${state.chats[k].length} رسالة تجريبية</small></div><button data-act="chat" data-id="${esc(id)}">فتح</button></div>`}).join(''):'<p>ما فيه محادثات تجريبية حتى الآن.</p>'}`)}
function openReport(id){if(cloudEnabled())return openCloudReport(id);if(!state.account)return openLogin();showModal('الإبلاغ عن إعلان',`<div class="info">لا تُرسل البلاغات إلى إدارة حقيقية الآن؛ ستُحفظ على هذا الجهاز لاختبار التدفق.</div><form id="reportForm" class="form-grid"><label class="wide">سبب البلاغ<select name="reason"><option>إعلان مخالف</option><option>احتيال محتمل</option><option>إعلان مكرر</option><option>محتوى غير مناسب</option><option>سبب آخر</option></select></label><label class="wide">تفاصيل إضافية (اختياري)<textarea name="details" maxlength="1000"></textarea></label><button class="btn btn-gold" type="submit">حفظ البلاغ التجريبي</button></form>`);$('reportForm').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);state.reports.push({adId:id,reason:d.get('reason'),details:d.get('details'),at:new Date().toISOString()});save();closeModal();notify('حُفظ البلاغ محليًا، ولم يصل إلى إدارة حقيقية')}}
function about(){showModal('عن سوقك',`<p><strong>سوقك | SOOQAK</strong> مشروع منصة إعلانات مبوبة سعودية. هذه نسخة واجهات وسلوك محلي للتجربة وليست خدمة عامة.</p><div class="info"><strong>المتاح للتجربة:</strong> البحث والأقسام والفلاتر والمفضلة ونشر إعلان محلي ومسوّدة وعرض الإعلانات وإدارة بعض الحالات وحساب عمولة 1%.</div><div class="warning"><strong>غير متاح بعد:</strong> توثيق Google لم يُفعّل بعد، ولا توجد لوحة مشرف أو إيصالات بنكية أو اختبار أمان شامل أو إطلاق عام. الإعلانات والصور والمحادثات متصلة بقاعدة بيانات سوقك عند تهيئة تسجيل الدخول؛ لم يتم اختبارها بحسابين فعليين. لا تستخدم بيانات شخصية حساسة.</div><p>خطتنا: إكمال الخدمات الآمنة واختبارها، ثم إطلاق مغلق، وبعدها 100 إعلان حقيقي و1000 مستخدم.</p>`)}

// === V11: private chat read receipts and lightweight 30-second inbox refresh ===
let sooqakActiveChatId=null,sooqakUnreadBaseline=null,sooqakHeartbeatStarted=false,sooqakHeartbeatBusy=false;
function setChatUnreadBadge(amount){
  const badge=$('chatUnreadBadge');if(!badge)return;
  const n=Math.max(0,Number(amount)||0);badge.hidden=n===0;badge.textContent=n>99?'99+':String(n);
  $('chatButton').setAttribute('aria-label',n?`المحادثات — ${n} رسالة غير مقروءة`:'المحادثات');
}
async function refreshUnreadMessages(announce=false){
  const cloud=window.sooqakCloud;const id=state.account?.id;
  if(!cloud||!id){setChatUnreadBadge(0);sooqakUnreadBaseline=null;return null}
  const summary=await cloud.unreadSummary();
  if(state.account?.id!==id)return null;
  const count=Math.max(0,Number(summary?.total)||0);
  setChatUnreadBadge(count);
  if(announce&&sooqakUnreadBaseline!==null&&count>sooqakUnreadBaseline&&sooqakActiveChatId===null){
    notify(count===1?'وصلتك رسالة جديدة في سوقك':`عندك ${count} رسائل غير مقروءة في سوقك`);
    v12NotifyUnread(count-sooqakUnreadBaseline);
  }
  sooqakUnreadBaseline=count;
  return summary;
}
async function pollActiveCloudConversation(){
  const id=sooqakActiveChatId;
  if(!id||$('modalBackdrop').hidden||!$('modalTitle').textContent.startsWith('محادثة — '))return;
  const log=$('chatMessages');if(!log)return;
  const messages=await window.sooqakCloud.listMessages(id);
  if(sooqakActiveChatId!==id||!$('chatMessages'))return;
  const latest=messages.length?messages[messages.length-1].id:'';
  if(log.dataset.latestId===latest)return;
  const nearBottom=log.scrollTop+log.clientHeight+45>=log.scrollHeight;
  const me=state.account?.id;
  log.innerHTML=messages.length?messages.map(m=>`<div class="chat-bubble ${m.sender_id===me?'mine':''}">${esc(m.body)}<div class="chat-time">${esc(new Date(m.created_at).toLocaleString('ar-SA'))}</div></div>`).join(''):'<p class="muted">لا توجد رسائل بعد.</p>';
  log.dataset.latestId=latest;
  if(nearBottom)log.scrollTop=log.scrollHeight;
  await window.sooqakCloud.markConversationRead(id);
}
function startCloudInboxHeartbeat(){
 if(sooqakHeartbeatStarted)return;sooqakHeartbeatStarted=true;
 const heartbeat=async()=>{
  if(document.hidden||!state.account?.id||!window.sooqakCloud||sooqakHeartbeatBusy)return;
  sooqakHeartbeatBusy=true;
  try{await pollActiveCloudConversation();await refreshUnreadMessages(true)}
  catch(e){console.warn('تعذر تحديث صندوق الرسائل مؤقتًا')}
  finally{sooqakHeartbeatBusy=false}
 };
 window.setInterval(heartbeat,30000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)heartbeat()});
}

// === طبقة الربط الاختيارية: تعمل فقط بعد وضع مفاتيح النشر العامة الخاصة بـ Supabase ===
function onCloudReady(){
  const u=window.sooqakCloud?.getUser();if(u)onCloudAuth({detail:{user:u}});
  document.querySelector('.demo-banner').textContent='بيئة تطوير لسوقك — الإعلانات والصور والمحادثات والبلاغات متصلة للتجربة؛ العمولة سجل تجريبي فقط، ولوحة الإدارة محصورة بالمشرفين، ولا توجد خدمة مدفوعات مفعلة. لا تستخدم معلومات حساسة.';
  refreshCloudAds();
}
function onCloudAuth(e){
  const user=e.detail?.user||null;
  const previousId=state.account?.id||null;
  const nextId=user?.id||null;
  // Never infer authentication from cached UI state: only validated Supabase users enter here.
  const knownName=String(user?.user_metadata?.full_name||'').trim();
  const fallback=user?.email?.split('@')[0]||'مستخدم سوقك';
  const name=(knownName||fallback).slice(0,60);
  const changed=previousId!==nextId;
  state.account=user?{id:user.id,email:user.email,name}:null;
  sooqakAuthResolved=true;
  if(changed){
    sooqakOwnedAdCache.clear();
    state.ads=[];state.cloudPledgeAcceptedAt=null;state.favorites=[];
    sooqakUnreadBaseline=null;sooqakActiveChatId=null;setChatUnreadBadge(0);
  }
  save();
  render();
  refreshAuthEntry();
  if(user && changed){
    startCloudInboxHeartbeat();refreshUnreadMessages(false).catch(()=>{});
    const expectedId=user.id;
    window.sooqakCloud?.listFavorites().then(ids=>{
      if(state.account?.id===expectedId){state.favorites=ids;save();render();refreshAuthEntry()}
    }).catch(cloudError);
  }
  if(changed)refreshCloudAds();
  if(!user)showAuthRedirectFailure();
  // If a login link came from mail, close the email-check screen and restore the market.
  if(user && !$('modalBackdrop').hidden && ['تسجيل الدخول','إنشاء حساب جديد','تحقق من بريدك'].includes($('modalTitle').textContent))closeModal();
  if(user && changed){
    try{
      const dest=sessionStorage.getItem('sooqak_return_to')||'';
      const when=Number(sessionStorage.getItem('sooqak_return_at')||0);
      if(/^\.\/services\.html(?:\?kind=(?:workshop|plumbing|delivery))?$/.test(dest) &&
         when>0 && Date.now()-when<30*60*1000){
        sessionStorage.removeItem('sooqak_return_to');sessionStorage.removeItem('sooqak_return_at');
        location.assign(dest);return;
      }
      if(dest && Date.now()-when>=30*60*1000){sessionStorage.removeItem('sooqak_return_to');sessionStorage.removeItem('sooqak_return_at');}
    }catch(_e){}
  }
}
function showAuthRedirectFailure(){
  // Show only a generic message; never echo OAuth fragments or session credentials.
  const fragment=new URLSearchParams(location.hash.startsWith('#')?location.hash.slice(1):'');
  const query=new URLSearchParams(location.search);
  if(!(fragment.has('error')||fragment.has('error_code')||query.has('error')||query.has('error_code')))return;
  try{
    const clean=new URL(location.href);
    for(const key of ['error','error_code','error_description'])clean.searchParams.delete(key);
    if(fragment.has('error')||fragment.has('error_code'))clean.hash='';
    history.replaceState(null,'',clean.pathname+clean.search+clean.hash);
  }catch(_e){}
  showModal('رابط الدخول غير صالح أو انتهت صلاحيته',
    '<p class="warning">يبدو أن رابط البريد المستخدم قديم، أو استُخدم من قبل، أو لم يكتمل فتحه داخل المتصفح.</p><p>ادخل ببريدك المسجل واطلب رابط دخول جديد، ثم افتح أحدث رسالة تصلك. لا تحتاج إنشاء حساب جديد.</p><button class="btn btn-gold" id="sooqakAuthRetry" type="button">طلب رابط دخول جديد</button>');
  const button=$('sooqakAuthRetry');if(button)button.onclick=()=>openCloudLogin('login');
}
function convertCloudAd(a){
  const cat=categories.find(([n])=>n===a.category);
  return {id:a.id,accountId:a.account_id,ownerId:a.seller_user_id,owner:'',role:a.seller_kind==='business'?'متجر':'فردي',
    seller:a.seller_display_name,title:a.title,description:a.description,category:a.category,emoji:cat?.[1]||'📦',color:'blue',
    city:a.city,district:a.district,kind:a.listing_kind==='wanted'?'مطلوب':'بيع',price:a.price===null?null:Number(a.price),
    priceType:a.price_mode==='fixed'?'ثابت':a.price_mode==='contact'?'تواصل للسعر':'قابل للتفاوض',
    status:a.hidden_at?'مخفي':a.status==='sold'?'مباع':new Date(a.expires_at).getTime()<=Date.now()?'منتهي':a.status==='reserved'&&new Date(a.reserved_until).getTime()>Date.now()?'محجوز':'متاح',
    createdAt:a.created_at,expiresAt:a.expires_at,bumpAt:a.bumped_at,reservedUntil:a.reserved_until,
    hidden:Boolean(a.hidden_at),renewedAt:a.renewed_at,renewalCount:a.renewal_count||0,
    images:(a.photos||[]).map(photo=>photo.url),photoRecords:a.photos||[],whatsapp:a.contact?.phone_e164||'',showWhatsapp:Boolean(a.contact?.show_whatsapp),allowCall:Boolean(a.contact?.show_call),demo:false};
}
async function refreshCloudAds(){
 if(!window.sooqakCloud)return;
 const request=++remoteQuerySeq,criteria=filters();
 try{
  const favoritesOnly=onlyFavorites;
  const rows=favoritesOnly?await window.sooqakCloud.fetchFavoriteListings():await window.sooqakCloud.fetchListings(0,60,criteria);
  if(request!==remoteQuerySeq)return;
  v12CloudLoaded=rows.length;v12HasMoreListings=!favoritesOnly&&rows.length===60;
  state.ads=rows.map(convertCloudAd);render();openListingFromLink();
 }catch(e){if(request===remoteQuerySeq)cloudError(e)}
}
function refreshAuthEntry(){
  const signed=Boolean(state.account?.id);
  const pending=cloudEnabled()&&!sooqakAuthResolved;
  for(const id of ['signupButton','loginButton']){const el=$(id);if(el)el.hidden=signed||pending;}
  const busy=$('authBusy');if(busy)busy.hidden=!pending;
  const profile=$('profileButton');if(profile){
    profile.hidden=!signed;
    const full=String(state.account?.name||'').trim();
    const display=full||'حسابي';
    const label=$('profileLabel');
    if(label)label.textContent=full?(marketLanguage==='en'?'Hi, ':'مرحبًا، ')+display:(marketLanguage==='en'?'My Account':'حسابي');
    profile.title=signed?('حسابي — '+display):'حسابي';
    profile.setAttribute('aria-label',signed?'فتح حساب '+display:'حسابي');
  }
}
// SOOQAK brand signature for user-facing authentication only.
const sooqakAuthWordmark='<span class="sooqak-auth-wordmark" aria-label="سوقك | SOOQAK"><span lang="ar">سوقك</span><span class="sooqak-auth-bar" aria-hidden="true">|</span><span lang="en" dir="ltr">SOOQAK</span></span>';
const sooqakAuthLogo=()=>'<div class="sooqak-auth-wordmark-block">'+sooqakAuthWordmark+'</div>';
function openCloudLogin(mode='login',method='password',emailPreset=''){
  mode=mode==='signup'?'signup':'login';
  method=method==='link'?'link':'password';
  if(state.account)return openProfile();
  const isNew=mode==='signup';
  const isLink=method==='link';
  const actionLabel=isLink?(isNew?'إرسال رابط إنشاء الحساب':'إرسال رابط تسجيل الدخول'):(isNew?'إنشاء حساب بكلمة مرور':'تسجيل الدخول بكلمة مرور');
  showModal(isNew?'إنشاء حساب جديد':'تسجيل الدخول',`
    <div class="auth-tabs" role="tablist" aria-label="نوع الدخول">
      <button id="authSignupTab" type="button" role="tab" aria-selected="${isNew}" aria-controls="cloudLoginForm">إنشاء حساب جديد</button>
      <button id="authLoginTab" type="button" role="tab" aria-selected="${!isNew}" aria-controls="cloudLoginForm">تسجيل الدخول</button>
    </div>
    ${sooqakAuthLogo()}
    <p class="auth-modal-lead">${isNew?'أنشئ حسابك في '+sooqakAuthWordmark+'، ثم أكّد بريدك الإلكتروني.':'أهلًا بك في '+sooqakAuthWordmark+'! اختر طريقة الدخول.'}</p>
    <div class="auth-method-tabs" role="group" aria-label="طريقة الدخول">
      <button id="authMethodPassword" type="button" class="${!isLink?'active':''}" aria-pressed="${!isLink}">كلمة مرور</button>
      <button id="authMethodLink" type="button" class="${isLink?'active':''}" aria-pressed="${isLink}">رابط بالبريد</button>
    </div>
    <form id="cloudLoginForm" class="auth-screen-form" data-auth-flow="${isLink?'link':isNew?'signup':'password-login'}">
      ${isNew?'<label for="authDisplayName">الاسم المعروض<input id="authDisplayName" name="name" autocomplete="name" maxlength="60" minlength="2" placeholder="اسمك أو اسم متجرك" required dir="auto" style="direction:auto;text-align:start"/></label>':''}
      <label for="authEmail">البريد الإلكتروني<input id="authEmail" type="email" name="email" autocomplete="email" inputmode="email" placeholder="you@example.com" maxlength="254" value="${esc(emailPreset)}" required /></label>
      ${!isLink?`<label for="authPassword">كلمة المرور<input id="authPassword" type="password" name="password" autocomplete="${isNew?'new-password':'current-password'}" minlength="12" maxlength="128" placeholder="12 حرفًا على الأقل" required /></label>`:''}
      <button id="authEmailSubmit" class="btn btn-gold auth-form-submit" type="submit">${actionLabel}</button>
    </form>
    ${isLink?'<p class="auth-security-note">رسائل البريد محدودة في النسخة التجريبية. لا تكرر الضغط عند بلوغ حد الإرسال.</p>':isNew?'<p class="auth-security-note">يلزم تأكيد البريد قبل تفعيل حسابك. كلمة المرور لا تتجاوز مرحلة التحقق.</p>':'<p class="auth-security-note">إذا أنشأت حسابك سابقًا برابط البريد ولم تضبط كلمة مرور، اختر «رابط بالبريد» مرة واحدة ثم اضبط كلمة مرور من «حسابي».</p>'}
    <div class="line"></div>
    <button id="cloudGoogle" class="btn btn-outline auth-social" type="button" disabled>تسجيل Google — التحقق من الجاهزية…</button>
    <p id="authProviderStatus" class="auth-security-note" role="status" aria-live="polite"></p>
    <p class="auth-security-note">التسجيل مجاني. لا تشارك كلمة المرور أو رمز الدخول مع أي شخص. لم نفعل التسجيل بالجوال حتى الآن.</p>
  `);
  const currentEmail=()=>String($('authEmail')?.value||'').trim();
  $('authSignupTab').onclick=()=>openCloudLogin('signup',method,currentEmail());
  $('authLoginTab').onclick=()=>openCloudLogin('login',method,currentEmail());
  $('authMethodPassword').onclick=()=>openCloudLogin(mode,'password',currentEmail());
  $('authMethodLink').onclick=()=>openCloudLogin(mode,'link',currentEmail());
  $('cloudLoginForm').onsubmit=async e=>{
    e.preventDefault();
    const email=currentEmail().toLowerCase();
    const displayName=isNew?String($('authDisplayName').value||'').trim():'';
    const password=!isLink?String($('authPassword').value||''):'';
    if(isNew&&displayName.length<2)return notify('أدخل اسمًا من حرفين على الأقل');
    if(!isLink&&password.length<12)return notify('كلمة المرور يجب أن تكون 12 حرفًا على الأقل');
    if(!window.sooqakCloud)return notify('خدمة تسجيل الحسابات لم تكتمل بعد. أعد تحميل الصفحة وجرّب مجددًا.');
    const submit=$('authEmailSubmit');submit.disabled=true;
    submit.textContent=isLink?'جاري إرسال رابط البريد...':'جاري التحقق من الحساب...';
    try{
      if(isLink){await window.sooqakCloud.signInEmail(email,{createAccount:isNew,displayName});}
      else if(isNew){
        const signedIn=await window.sooqakCloud.signUpPassword(email,password,displayName);
        if(signedIn){closeModal();notify('أُنشئ الحساب، جاري التحقق من الجلسة');return;}
      }else{
        await window.sooqakCloud.signInPassword(email,password);
        closeModal();notify('نجح تسجيل الدخول، جاري تحميل حسابك');return;
      }
      showModal('تحقق من بريدك',`${sooqakAuthLogo()}<div class="info">${isNew?'طلبنا إرسال رسالة تأكيد البريد لإنشاء حسابك في ':'طلبنا إرسال رابط الدخول إلى بريدك من '}${sooqakAuthWordmark}. إذا وصلتك رسالة جديدة، افتحها وأكمل التأكيد.</div><p class="muted">التأكيد مطلوب عند إنشاء الحساب، وقد يتأخر البريد بسبب حدود الإرسال التجريبية. لا تشارك رابط الدخول مع أحد.</p><button type="button" id="authRetry" class="btn btn-outline">العودة إلى ${isNew?'إنشاء الحساب':'الدخول'}</button>`);
      $('authRetry').onclick=()=>openCloudLogin(mode,method,email);
    }catch(err){cloudError(err);if(submit.isConnected){submit.disabled=false;submit.textContent=actionLabel;}}
  };
  // Keep the OAuth button disabled unless the server explicitly confirms that the provider is active.
  fetch(window.SOOQAK_SUPABASE.url+'/auth/v1/settings',{headers:{apikey:window.SOOQAK_SUPABASE.publishableKey}})
    .then(r=>{if(!r.ok)throw Error('auth settings unavailable');return r.json()})
    .then(flags=>{
      const google=$('cloudGoogle'),hint=$('authProviderStatus');if(!google||!hint)return;
      if(flags.external?.google===true){google.disabled=false;google.textContent='المتابعة باستخدام Google';hint.textContent='';}
      else {google.disabled=true;google.textContent='تسجيل Google — غير مفعّل حاليًا';hint.textContent='تسجيل Google غير متاح حاليًا؛ استخدم بريدك الإلكتروني.';}
      if(flags.disable_signup===true){
        const signup=$('authSignupTab');if(signup){signup.disabled=true;signup.textContent='إنشاء حساب (بانتظار التفعيل)';}
        if(isNew){const submit=$('authEmailSubmit');if(submit)submit.disabled=true;hint.textContent+=' إنشاء حسابات جديدة متوقف حاليًا.';}
      }
    })
    .catch(()=>{const btn=$('cloudGoogle'),hint=$('authProviderStatus');if(btn){btn.disabled=true;btn.textContent='Google — تعذر التحقق من الجاهزية'}if(hint)hint.textContent='التحقق من خيارات الدخول متعذر مؤقتًا. جرّب البريد أو إعادة تحميل الصفحة.';});
  $('cloudGoogle').onclick=async()=>{
    if(!window.sooqakCloud)return notify('خدمة حساب Google لم تكتمل بعد؛ جرب تحميل الصفحة مرة ثانية');
    const btn=$('cloudGoogle');btn.disabled=true;btn.textContent='جاري التحويل إلى Google...';
    try{await window.sooqakCloud.signInGoogle();}
    catch(err){cloudError(err);if(btn.isConnected){btn.disabled=true;btn.textContent='Google — تعذر الاتصال، أعد فتح شاشة الدخول';}}
  };
}
function openSetPassword(){
  if(!cloudEnabled()||!state.account)return openLogin();
  showModal('كلمة مرور الحساب',`${sooqakAuthLogo()}<div class="info">يمكنك ضبط كلمة مرور لحسابك المؤكد، حتى تدخل لاحقًا بدون طلب رسالة بريد كل مرة. لا تشاركها مع أحد.</div><form id="setPasswordForm" class="auth-screen-form"><label for="passwordNew">كلمة مرور جديدة (12 حرفًا على الأقل)<input id="passwordNew" type="password" name="newPassword" autocomplete="new-password" minlength="12" maxlength="128" required /></label><label for="passwordConfirm">تأكيد كلمة المرور<input id="passwordConfirm" type="password" name="confirmPassword" autocomplete="new-password" minlength="12" maxlength="128" required /></label><button class="btn btn-gold auth-form-submit" type="submit" id="setPasswordSubmit">حفظ كلمة المرور</button></form><p class="auth-security-note">قد تطلب الخدمة إعادة تسجيل الدخول إذا انتهت فترة التحقق الأخيرة. لا يتم حفظ كلمة المرور على جهازك بواسطة سوقك.</p>`);
  $('setPasswordForm').onsubmit=async e=>{
    e.preventDefault();
    const pw=String($('passwordNew').value||'');
    if(pw.length<12)return notify('كلمة المرور يجب أن تكون 12 حرفًا على الأقل');
    if(pw!==String($('passwordConfirm').value||''))return notify('كلمتا المرور غير متطابقتين');
    const btn=$('setPasswordSubmit');btn.disabled=true;btn.textContent='جاري الحفظ...';
    try{await window.sooqakCloud.setAccountPassword(pw);closeModal();notify('تم ضبط كلمة المرور. يمكنك استخدامها في الدخول القادم بدون بريد.');}
    catch(err){cloudError(err);if(btn.isConnected){btn.disabled=false;btn.textContent='حفظ كلمة المرور';}}
  };
}
async function switchCloudRole(kind){
  if(!state.account)return openCloudLogin();
  try{await window.sooqakCloud.ensureAccount(kind,state.account.name);state.role=kind==='business'?'متجر':'فردي';save();openCloudProfile()}
  catch(err){cloudError(err)}
}
function openCloudProfile(){
  if(!state.account)return showModal('حسابي','<p>يمكنك تصفح الإعلانات دون تسجيل.</p><button class="btn btn-gold" data-act="login">دخول / حساب جديد</button>');
  const my=state.ads.filter(mine);
  showModal('حسابي',`<h3>حياك الله، ${esc(state.account.name)}</h3><p class="muted">${esc(state.account.email)} — بريد إلكتروني مؤكد</p><div class="account-tabs"><button id="personalTab" class="${state.role==='فردي'?'active':''}">الحساب الفردي</button><button id="businessTab" class="${state.role==='متجر'?'active':''}">حساب المتجر</button></div><div class="count-card"><span>إعلاناتك في هذا الحساب</span><strong>${my.length}</strong></div><div class="button-row"><button class="btn btn-gold" data-act="post">إعلان جديد</button><button class="btn btn-gold" data-act="mypublic">ملفي العام</button><button class="btn btn-outline" data-act="editpublic">تعديل البروفايل</button><button class="btn btn-outline" data-act="privateprofile">بياناتي الخاصة</button><button class="btn btn-outline" data-act="setpassword">تعيين أو تغيير كلمة المرور</button><button class="btn btn-outline" data-act="myservices">محلاتي وورشي</button><button class="btn btn-outline" data-act="myads">إعلاناتي</button><button class="btn btn-outline" data-act="commissions">عمولتي</button><button class="btn btn-outline" data-act="bank">العمولة والسداد</button><button class="btn btn-outline" data-act="notify">رقم الجوال والتنبيهات</button><button class="btn btn-outline" data-act="savedsearch">بحوثي المحفوظة</button><button class="btn btn-outline" data-act="browseralerts">تنبيهات المتصفح</button><button class="btn btn-outline" data-act="chats">✉ المحادثات</button><button class="btn btn-subtle" data-act="logout">تسجيل الخروج</button></div><div class="warning">المحادثات والبلاغات محفوظة في قاعدة البيانات. لوحة الإدارة متاحة فقط للمشرف الموثّق والمعتمد في الخادم. الإيصالات البنكية لم تُفعّل بعد.</div>`);
  $('personalTab').onclick=()=>switchCloudRole('personal');
  $('businessTab').onclick=()=>switchCloudRole('business');
  const accountId=state.account.id;
  window.sooqakCloud?.isAdmin().then(canManage=>{
    if(!canManage || state.account?.id!==accountId || $('modalBackdrop').hidden || $('modalTitle').textContent!=='حسابي')return;
    const area=$('modalContent').querySelector('.button-row');
    if(area && !area.querySelector('[data-act="admin"]'))area.insertAdjacentHTML('beforeend','<button class="btn btn-outline" data-act="admin">لوحة مراجعة البلاغات</button>');
  }).catch(()=>{});
}

async function requirePrivateCity(){
 if(!cloudEnabled()||!state.account)return true;
 try{
  const profile=await window.sooqakCloud.loadPrivateProfile();
  if(profile?.city?.trim())return true;
  notify('أكمل المدينة في بيانات حسابك الخاصة قبل نشر إعلان.');
  await openPrivateProfile();
  return false;
 }catch(error){cloudError(error);return false}
}
async function openPrivateProfile(){
 if(!state.account)return openCloudLogin('login');
 if(!cloudEnabled())return notify('الحساب الخاص يحتاج تسجيلًا حقيقيًا، وليس تجربة محلية');
 try{
  const old=await window.sooqakCloud.loadPrivateProfile()||{};
  showModal('بيانات حسابي الخاصة',`<p class="info">المدينة مطلوبة عند حفظ الملف. الحي وسنة الميلاد اختياريان. لن تظهر سنة الميلاد للآخرين، ولا تُعرض هذه الحقول في الملف العام.</p><form id="sPrivateForm" class="form-grid"><label class="wide">الاسم المعروض<input name="display_name" maxlength="60" minlength="2" required value="${esc(state.account.name)}"></label><label class="wide">المدينة (مطلوبة)<input name="city" maxlength="70" list="sSaudiCities" required value="${esc(old.city||'')}" placeholder="مثال: الجبيل"></label><datalist id="sSaudiCities"><option value="الجبيل"><option value="الدمام"><option value="الخبر"><option value="الأحساء"><option value="الرياض"><option value="جدة"><option value="مكة"><option value="المدينة"><option value="أبها"><option value="الطائف"><option value="تبوك"><option value="حائل"><option value="بريدة"><option value="جازان"><option value="نجران"></datalist><label class="wide">الحي (اختياري)<input name="district" maxlength="70" value="${esc(old.district||'')}"></label><label class="wide">سنة الميلاد (اختيارية وخاصة)<input name="birth_year" type="number" min="1900" max="2100" value="${esc(old.birth_year??'')}" placeholder="اتركها فارغة"></label><div class="form-actions"><button class="btn btn-gold" type="submit">حفظ البيانات الخاصة</button></div></form>`);
  $('sPrivateForm').onsubmit=async e=>{e.preventDefault();const form=e.target;const data=new FormData(form);const name=String(data.get('display_name')||'').trim(), city=String(data.get('city')||'').trim(), district=String(data.get('district')||'').trim(),year=String(data.get('birth_year')||'');if(name.length<2||!city||city.length>70||district.length>70)return notify('تحقق من الاسم والمدينة والحي');if(year&&(Number(year)<1900||Number(year)>new Date().getFullYear()))return notify('سنة الميلاد غير صحيحة');const b=form.querySelector('[type=submit]');b.disabled=true;try{await window.sooqakCloud.savePrivateProfile({display_name:name,city,district,birth_year:year?Number(year):null});if(state.account){state.account.name=name;refreshAuthEntry()}closeModal();notify('تم حفظ بياناتك الخاصة');}catch(err){cloudError(err);b.disabled=false}};
 }catch(err){cloudError(err)}
}

async function publishCloudAd(form,old){
  if(!state.account)return openCloudLogin();
  const service=window.sooqakCloud;
  if(!service)return notify('تعذر تحميل خدمة سوقك حاليًا');
  const d=new FormData(form);const title=String(d.get('title')||'').trim();const description=String(d.get('description')||'').trim();
  const priceMode=String(d.get('priceType'));const priceRaw=String(d.get('price')||'').trim();
  if(title.length<5||description.length<10)return notify('اكتب عنوانًا لا يقل عن خمسة أحرف ووصفًا لا يقل عن عشرة');
  if(priceMode!=='تواصل للسعر'&&priceRaw==='')return notify('أدخل السعر أو اختر تواصل للسعر');
  if(priceRaw!==''&&(!Number.isFinite(Number(priceRaw))||Number(priceRaw)<0||Number(priceRaw)>999999999))return notify('السعر غير صالح');
  const files=[...$('adImages').files];
  const currentCount=old?.photoRecords?.length||0;
  if(files.length+currentCount>5)return notify('الحد الأقصى 5 صور للإعلان، احذف صورة قديمة أولًا');
  let photos=[];
  try{photos=await Promise.all(files.map(compressCloudPhoto))}catch(e){return cloudError(e)}
  const wantsWA=d.get('showWhatsapp')==='yes',wantsCall=d.get('allowCall')==='yes';
  let optinPhone='';
  if(wantsWA||wantsCall){
    const raw=String(d.get('whatsapp')||'').trim();
    if(!raw)return notify('أدخل رقم الجوال الذي توافق على إظهاره للزوار');
    const validated=normalizeWhatsappPhone(raw,d.get('phoneCountry')||'SA');
    if(validated.error)return notify(validated.error);
    optinPhone='+'+validated.phone;
  }
  const data={title,description,category:String(d.get('category')),city:String(d.get('city')),
    district:String(d.get('district')||'').trim(),listing_kind:d.get('kind')==='مطلوب'?'wanted':'sale',
    price:priceRaw===''?null:Number(priceRaw),price_mode:priceMode==='ثابت'?'fixed':priceMode==='تواصل للسعر'?'contact':'negotiable'};
  try{
    if(!old){const account=await service.ensureAccount(state.role==='متجر'?'business':'personal',state.account.name);data.account_id=account.id}
    if(!old&&!state.cloudPledgeAcceptedAt){if(d.get('pledgeAccept')!=='yes')return notify('يجب الموافقة على ميثاق الأمانة قبل أول إعلان');await service.acceptPledge();state.cloudPledgeAcceptedAt=true;}
    const listingId=await service.saveListing(data,old?.id||null);
    let contactIssue=null;
    try{await service.saveListingContact(listingId,{phone_e164:optinPhone,show_whatsapp:wantsWA,show_call:wantsCall})}
    catch(e){contactIssue=e;}
    let photoIssue=null;
    if(photos.length){try{await service.uploadPhotos(listingId,photos)}catch(err){photoIssue=err}}
    if(!photoIssue){state.draft={};save();try{await service.deleteAccountDraft(state.role==='متجر'?'business':'personal')}catch(_e){}}closeModal();await refreshCloudAds();
    notify(contactIssue?'حُفظ الإعلان، لكن تعذر تفعيل التواصل؛ راجع الموافقة والرقم: '+String(contactIssue.message||contactIssue):photoIssue?'حُفظ الإعلان، لكن لم تكتمل جميع الصور: '+String(photoIssue.message||photoIssue):old?'تم تحديث الإعلان والصور':'تم حفظ الإعلان والصور في قاعدة البيانات التجريبية')
  }catch(e){cloudError(e)}
}
async function deleteCloud(id){if(!mine(byId(id)))return notify('غير مسموح');if(!confirm('إخفاء الإعلان من النتائج مع الاحتفاظ بالمحادثات وسجل البيع؟'))return;try{await window.sooqakCloud.removeListing(id);closeModal();await refreshCloudAds();notify('تم إخفاء الإعلان من نتائج المشترين')}catch(e){cloudError(e)}}
async function renewCloudAd(id){if(!mine(byId(id)))return notify('غير مسموح');try{await window.sooqakCloud.renewListing(id);closeModal();await refreshCloudAds();notify('تم تجديد الإعلان 60 يومًا دون تغيير ترتيبه')}catch(e){cloudError(e)}}
async function moveV12Photo(listingId,photoId,direction){const ad=byId(listingId);if(!ad||!mine(ad)||!ad.photoRecords?.length)return;
    const ids=ad.photoRecords.map(p=>p.id),from=ids.indexOf(photoId),to=from+direction;
    if(from<0||to<0||to>=ids.length)return;[ids[from],ids[to]]=[ids[to],ids[from]];
    try{await window.sooqakCloud.reorderListingPhotos(listingId,ids);await refreshCloudAds();await openPosting(listingId);notify('تم تحديث ترتيب الصور')}
    catch(e){cloudError(e)}
  }
  async function removeCloudPhoto(id,path,listingId){if(!mine(byId(listingId)))return notify('غير مسموح');if(!confirm('حذف هذه الصورة من الإعلان؟'))return;try{await window.sooqakCloud.removePhoto(id,path);await refreshCloudAds();openPosting(listingId);notify('حُذفت الصورة')}catch(e){cloudError(e)}}
async function reserveCloud(id){if(!mine(byId(id)))return notify('غير مسموح');const hours=prompt('مدة الحجز بالساعات: 24 أو 48 أو 72','24');if(hours===null)return;if(!['24','48','72'].includes(hours))return notify('اختر 24 أو 48 أو 72');try{await window.sooqakCloud.reserve(id,Number(hours));await refreshCloudAds();openAd(id);notify('تم تسجيل الحجز')}catch(e){cloudError(e)}}
async function bumpCloud(id){if(!mine(byId(id)))return notify('غير مسموح');try{await window.sooqakCloud.bump(id);closeModal();await refreshCloudAds();notify('تم رفع الإعلان')}catch(e){cloudError(e)}}
async function sellCloud(id){const ad=byId(id);if(!mine(ad)||ad.status==='مباع')return;const raw=prompt('كم السعر النهائي الفعلي الذي تم البيع عليه؟',String(ad.price||''));if(raw===null)return;const amount=Number(raw);if(!Number.isFinite(amount)||amount<=0||amount>999999999)return notify('أدخل قيمة بيع صحيحة');if(!confirm(`ستُسجل عمولة 1% بمبلغ ${money(Math.round(amount*100)/100*.01)} ريال ضمن حسابك التجريبي. متأكد؟`))return;try{await window.sooqakCloud.markSold(id,amount);closeModal();await refreshCloudAds();notify('سُجل البيع والعمولة في قاعدة البيانات')}catch(e){cloudError(e)}}
async function openCloudCommissions(){
  if(!state.account)return openCloudLogin();
  try{
    const service=window.sooqakCloud;
    const [rows,corrections]=await Promise.all([service.getSales(),service.getSaleCorrections()]);
    // sooqak_sales is already restricted by the server's owner RLS. Do not filter
    // against the first 60 visible ads: old and sold listings must remain in the ledger.
    const mineRows=rows;
    const history=corrections.filter(c=>mineRows.some(r=>r.id===c.sale_id));
    const total=mineRows.reduce((n,r)=>n+Number(r.commission),0);
    showModal('عمولتي — سجل إلكتروني تجريبي',`<div class="warning">هذه مبالغ محسوبة على مبيعات مُبلّغ عنها، وليست تأكيدًا بوجود حوالات. لم نفعّل استقبال التحويلات أو الإيصالات أو اعتماد السداد. لا تحول أي مبلغ بناءً على هذا النموذج.</div><button class="btn btn-outline" data-act="bank">تفاصيل العمولة وحالة الحساب البنكي</button><div class="count-card"><span>إجمالي العمولة المحتسبة (1%)</span><strong>${money(total)} ر.س</strong></div><h3>سجل المبيعات والتصحيحات</h3><div class="small-cards">${mineRows.length?mineRows.map(r=>{
      const count=Number(r.correction_count)||0;
      const past=history.filter(c=>c.sale_id===r.id);
      return `<div class="small-card commission-sale"><div class="details"><strong>${esc(byId(r.listing_id)?.title||'إعلان مباع')}</strong><small>سعر البيع المبلغ عنه: ${money(r.final_price)} ر.س</small><small>عمولة 1%: ${money(r.commission)} ر.س</small>${count?`<small>عدد التصحيحات: ${count} من 3</small>`:''}${past.length?`<details class="sale-history"><summary>سجل تصحيحات هذا البيع (${past.length})</summary>${past.map(c=>`<div><small>${esc(new Date(c.created_at).toLocaleString('ar-SA'))}: من ${money(c.old_price)} إلى ${money(c.new_price)} ر.س — ${esc(c.reason)}</small></div>`).join('')}</details>`:''}</div>${count<3?`<button type="button" data-correct-sale="${esc(r.id)}">تصحيح السعر</button>`:'<span class="muted">للتصحيح التالي راجع الإدارة</span>'}</div>`;
    }).join(''):'<p>لا توجد مبيعات مسجلة في الحساب الحالي.</p>'}</div>`);
    $('modalContent').querySelectorAll('[data-correct-sale]').forEach(b=>b.onclick=()=>openCloudSaleCorrection(b.dataset.correctSale));
  }catch(e){cloudError(e)}
}
async function openCloudSaleCorrection(saleId){
  if(!state.account)return openCloudLogin();
  try{
    const rows=await window.sooqakCloud.getSales();
    const sale=rows.find(r=>r.id===saleId && state.ads.some(a=>a.id===r.listing_id&&mine(a)));
    if(!sale)return notify('هذه العملية لا تخص حسابك الحالي');
    if(Number(sale.correction_count)>=3)return notify('وصلت الحد الأقصى للتصحيحات');
    showModal('تصحيح سعر بيع مسجل',`<div class="info">المبلغ الحالي ${money(sale.final_price)} ريال، والعمولة ${money(sale.commission)} ريال. أي تعديل سيُحفظ في سجل غير قابل للمحو بواسطة البائع.</div><form id="correctSaleForm" class="form-grid"><label class="wide">السعر النهائي الصحيح (ر.س)<input name="price" type="number" min="0.01" max="999999999.99" step="0.01" value="${Number(sale.final_price)}" required></label><label class="wide">سبب التصحيح (من 10 إلى 300 حرف)<textarea name="reason" maxlength="300" minlength="10" required placeholder="مثال: تم الاتفاق على خصم موثّق في سعر البيع النهائي"></textarea></label><div class="form-actions"><button type="button" class="btn btn-outline" data-act="commissions">رجوع</button><button type="submit" class="btn btn-gold">توثيق التصحيح</button></div></form>`);
    $('correctSaleForm').onsubmit=async event=>{
      event.preventDefault();const form=event.currentTarget;
      const data=new FormData(form);const amount=Number(data.get('price'));
      const reason=String(data.get('reason')||'').trim();
      if(!Number.isFinite(amount)||amount<=0||amount>999999999.99)return notify('أدخل سعرًا صحيحًا');
      if(reason.length<10||reason.length>300)return notify('السبب يجب أن يكون من 10 إلى 300 حرف');
      if(Math.abs(amount-Number(sale.final_price))<0.0001)return notify('السعر لم يتغير');
      const expected=Math.round(amount*0.01*100)/100;
      if(!confirm(`تغيير السعر النهائي إلى ${money(amount)} ريال والعمولة إلى ${money(expected)} ريال؟ سيبقى السعر السابق والسبب في سجل التصحيحات.`))return;
      const button=form.querySelector('button[type="submit"]');button.disabled=true;
      try{await window.sooqakCloud.correctSalePrice(saleId,amount,reason);notify('تم تعديل السعر وإعادة حساب العمولة مع حفظ السبب');await openCloudCommissions();}
      catch(err){button.disabled=false;cloudError(err)};
    };
  }catch(e){cloudError(e)}
}

// === المرحلة الرابعة: محادثات خاصة وبلاغات محفوظة في Supabase ===
async function openCloudConversation(adId) {
  if(!state.account)return openCloudLogin();
  const ad=byId(adId);
  if(!ad || ad.demo)return notify('هذا الإعلان غير متاح للمراسلة');
  if(mine(ad))return notify('لا يمكنك مراسلة نفسك');
  try {
    const conversation=await window.sooqakCloud.openOrCreateConversation(adId);
    await showCloudConversation(conversation);
  } catch(e) { cloudError(e); }
}
async function showCloudConversation(conversation) {
  if(!state.account)return openCloudLogin();
  try {
    const service=window.sooqakCloud;
    const [messages,block,muted]=await Promise.all([
      service.listMessages(conversation.id),service.getConversationBlockStatus(conversation.id),service.isConversationMuted(conversation.id)
    ]);
    const ad=byId(conversation.listing_id);
    const heading=ad?.title||'محادثة خاصة';
    const me=state.account.id;
    const blockNotice=block.blocked
      ?'<div class="warning" role="status">الإرسال في هذه المحادثة متوقف بسبب الحظر. تبقى الرسائل السابقة متاحة للطرفين.</div>'
      :'<div class="info">هذه محادثة نصية خاصة بين طرفي الإعلان. لا ترسل معلومات حساسة أو تحوّل مبالغ قبل التحقق من الطرف الآخر.</div>';
    const composer=block.blocked?'':`<form id="sooqakCloudMessageForm" class="form-grid"><label class="wide">رسالتك<input name="message" minlength="1" maxlength="1000" required autocomplete="off" placeholder="اكتب رسالتك..."/></label><button type="submit" class="btn btn-gold">إرسال الرسالة</button></form>`;
    const actionLabel=block.blockedByMe?'إلغاء حظر هذا المستخدم':'حظر هذا المستخدم';
    showModal('محادثة — '+heading,`${blockNotice}<div class="chat-log" id="chatMessages" aria-live="polite">${messages.length?messages.map(m=>`<div class="chat-bubble ${m.sender_id===me?'mine':''}">${esc(m.body)}<div class="chat-time">${esc(new Date(m.created_at).toLocaleString('ar-SA'))}</div></div>`).join(''):'<p class="muted">لا توجد رسائل بعد.</p>'}</div>${composer}<div class="button-row"><button type="button" class="btn btn-outline" id="sooqakRefreshMessages">↻ تحديث الرسائل</button><button type="button" class="btn btn-outline" id="sooqakBlockButton">${actionLabel}</button><button type="button" class="btn btn-outline" id="v12MuteChat">${muted?'إلغاء كتم المحادثة':'كتم تنبيهات المحادثة'}</button><button type="button" class="btn btn-subtle" id="sooqakInboxBack">جميع المحادثات</button></div>`);
    sooqakActiveChatId=conversation.id;
    const firstLog=$('chatMessages');if(firstLog)firstLog.dataset.latestId=messages.length?messages[messages.length-1].id:'';
    try{await service.markConversationRead(conversation.id);await refreshUnreadMessages(false)}catch(e){console.warn('تعذر تأكيد قراءة المحادثة')};
    const form=$('sooqakCloudMessageForm');
    if(form)form.onsubmit=async e=>{
      e.preventDefault();const value=String(new FormData(form).get('message')||'').trim();
      if(!value)return;
      const button=form.querySelector('button[type="submit"]');button.disabled=true;
      try {await service.sendMessage(conversation.id,value);await showCloudConversation(conversation)}
      catch(err){cloudError(err);button.disabled=false;}
    };
    $('sooqakBlockButton').onclick=async()=>{
      const next=!block.blockedByMe;
      if(next&&!confirm('هل تريد حظر المستخدم؟ لن يستطيع أي طرف إرسال رسائل جديدة، وستبقى الرسائل السابقة محفوظة.'))return;
      const button=$('sooqakBlockButton');button.disabled=true;
      try{await service.setConversationBlocked(conversation.id,next);await showCloudConversation(conversation);
        notify(next?'تم حظر المستخدم ومنع الرسائل الجديدة':'أزلنا الحظر من جهتك. قد يبقى الإرسال متوقفًا إن كان الطرف الآخر حاظرك');}
      catch(err){button.disabled=false;cloudError(err)}
    };
    $('v12MuteChat').onclick=async()=>{try{await service.setConversationMuted(conversation.id,!muted);await showCloudConversation(conversation);notify(muted?'تم إلغاء الكتم':'تم كتم المحادثة')}catch(e){cloudError(e)}};
    $('sooqakInboxBack').onclick=openCloudChats;
    $('sooqakRefreshMessages').onclick=async()=>{try{await pollActiveCloudConversation();await refreshUnreadMessages(false);notify('تم فحص الرسائل الجديدة')}catch(err){cloudError(err)}};
    const log=$('chatMessages');if(log)log.scrollTop=log.scrollHeight;
  }catch(e){cloudError(e)}
}
async function openCloudChats() {
  if(!state.account)return openCloudLogin();
  try {
    const [conversations,readSummary]=await Promise.all([window.sooqakCloud.listConversations(),window.sooqakCloud.unreadSummary()]);
    const unreadBy=new Map((readSummary?.conversations||[]).map(c=>[c.id,Number(c.unread)||0]));
    showModal('محادثاتي',`<p class="muted">المحادثات تخص أطراف الإعلانات فقط، ولا تظهر للآخرين. اضغط على أي محادثة لقراءة الرسائل. تُحدَّث المحادثات المفتوحة دوريًا.</p><button type="button" class="btn btn-outline" id="sooqakInboxRefresh">↻ تحديث صندوق الرسائل</button><div class="small-cards">${conversations.length?conversations.map(c=>`<div class="small-card"><div class="details"><strong>${esc(byId(c.listing_id)?.title||'إعلان سابق')}</strong><small>${c.buyer_id===state.account.id?'أنت المشتري':'أنت البائع'} — ${esc(new Date(c.created_at).toLocaleDateString('ar-SA'))}</small>${unreadBy.get(c.id)?`<span class="chat-unread-pill">${unreadBy.get(c.id)} جديد</span>`:''}</div><button type="button" data-chat-id="${esc(c.id)}">فتح</button></div>`).join(''):'<p>ما عندك محادثات حاليًا.</p>'}</div>`);
    $('sooqakInboxRefresh').onclick=()=>openCloudChats();
    $('modalContent').querySelectorAll('[data-chat-id]').forEach(button=>button.onclick=()=>{
      const c=conversations.find(row=>row.id===button.dataset.chatId);
      if(c)showCloudConversation(c);
    });
  }catch(e){cloudError(e)}
}
function openCloudReport(adId) {
  if(!state.account)return openCloudLogin();
  const ad=byId(adId);
  if(!ad || ad.demo)return notify('لا يمكنك الإبلاغ عن إعلان تجريبي');
  if(mine(ad))return notify('لا يمكنك الإبلاغ عن إعلانك');
  showModal('الإبلاغ عن إعلان',`<div class="info">سيُحفظ البلاغ في قاعدة البيانات ليتمكن المشرف المعتمد من مراجعته. لا ترسل معلومات شخصية حساسة.</div><form id="sooqakReportForm" class="form-grid"><label class="wide">سبب البلاغ<select name="reason"><option>إعلان مخالف</option><option>احتيال محتمل</option><option>إعلان مكرر</option><option>محتوى غير مناسب</option><option>سبب آخر</option></select></label><label class="wide">تفاصيل إضافية (اختياري)<textarea name="details" maxlength="1000"></textarea></label><button class="btn btn-gold" type="submit">إرسال البلاغ إلى السجل التجريبي</button></form>`);
  const form=$('sooqakReportForm');
  form.onsubmit=async e=>{
    e.preventDefault();
    const data=new FormData(form);const button=form.querySelector('button[type="submit"]');button.disabled=true;
    try {await window.sooqakCloud.submitReport(adId,data.get('reason'),data.get('details'));closeModal();notify('تم حفظ البلاغ في سجل قاعدة البيانات التجريبية')}
    catch(err){button.disabled=false;cloudError(err)}
  };
}


// Stage 7: admin-only moderation UI; authorization is enforced by Supabase RPCs.
async function openCloudAdminDashboard(status='pending') {
  if(!cloudEnabled() || !state.account || !window.sooqakCloud)return openCloudLogin();
  showModal('لوحة إدارة البلاغات','<p class="muted">جارٍ التحقق من صلاحية المشرف وتحميل البلاغات...</p>');
  try {
    const service=window.sooqakCloud;
    const dashboard=await service.getAdminDashboard(status);
    if($('modalTitle').textContent!=='لوحة إدارة البلاغات')return;
    const summary=dashboard?.summary||{};
    const reports=Array.isArray(dashboard?.reports)?dashboard.reports:[];
    const audit=Array.isArray(dashboard?.audit)?dashboard.audit:[];
    const statuses={'pending':'جديد','reviewing':'تحت المراجعة','closed':'مغلق'};
    const options=[['pending','الجديدة'],['reviewing','تحت المراجعة'],['closed','المغلقة'],['all','جميع البلاغات']];
    const summaryBlock=`<div class="admin-stats"><div><small>جديدة</small><strong>${Number(summary.pending)||0}</strong></div><div><small>تحت المراجعة</small><strong>${Number(summary.reviewing)||0}</strong></div><div><small>مغلقة</small><strong>${Number(summary.closed)||0}</strong></div><div><small>إعلانات مخفية</small><strong>${Number(summary.hidden_listings)||0}</strong></div></div>`;
    const rows=reports.map(r=>`<section class="admin-report" data-report-item="${esc(r.id)}"><div class="admin-report-head"><strong>${esc(r.listing_title||'إعلان')}</strong><span class="tag">${esc(statuses[r.status]||r.status)}</span></div><p class="muted">${esc(r.listing_city||'')} | ${esc(r.listing_category||'')} | ${esc(new Date(r.created_at).toLocaleString('ar-SA'))}</p><p><b>سبب البلاغ:</b> ${esc(r.reason)}</p>${r.details?`<p><b>التفاصيل:</b> ${esc(r.details)}</p>`:''}<p class="muted">البائع: ${esc(r.seller_name||'غير معروف')} — ${r.hidden?'<strong>الإعلان مخفي حاليًا</strong>':'الإعلان ظاهر (إذا كان نشطًا)'}</p><label>تغيير حالة البلاغ<select data-admin-next><option value="pending" ${r.status==='pending'?'selected':''}>جديد</option><option value="reviewing" ${r.status==='reviewing'?'selected':''}>تحت المراجعة</option><option value="closed" ${r.status==='closed'?'selected':''}>مغلق</option></select></label><label>سبب القرار (يُحفظ في سجل الإدارة)<textarea data-admin-note maxlength="500" rows="2" placeholder="دوّن سبب القرار، دون بيانات شخصية أو معلومات حساسة"></textarea></label><div class="button-row"><button class="btn btn-outline" data-admin-review="${esc(r.id)}">حفظ حالة البلاغ</button>${r.hidden?'':`<button class="btn btn-danger" data-admin-hide="${esc(r.id)}">إخفاء الإعلان المخالف</button>`}</div></section>`).join('');
    const auditBlock=audit.length?`<details class="admin-audit"><summary>آخر القرارات الإدارية (${audit.length})</summary>${audit.map(a=>`<div><b>${a.action==='hide_reported_listing'?'إخفاء إعلان':'مراجعة بلاغ'}</b> — ${esc(a.reason)} <small>${esc(new Date(a.created_at).toLocaleString('ar-SA'))}</small></div>`).join('')}</details>`:'';
    $('modalContent').innerHTML=`<div class="warning">مراجعة داخلية تجريبية. لا تشارك بيانات البلاغات خارج فريق الإدارة. كل قرار محفوظ في سجل مراجعة لا يمكن تعديله من واجهة المستخدم.</div>${summaryBlock}<label>عرض البلاغات<select id="sooqakAdminStatusFilter">${options.map(([v,label])=>`<option value="${v}" ${status===v?'selected':''}>${label}</option>`).join('')}</select></label><p class="muted">عرض آخر 50 بلاغًا كحد أقصى حسب التاريخ.</p>${rows||'<div class="info">لا توجد بلاغات في هذه الحالة.</div>'}${auditBlock}`;
    if (typeof service.getAdminSaleCorrections==='function') {
      service.getAdminSaleCorrections().then(entries=>{
        if($('modalTitle').textContent!=='لوحة إدارة البلاغات')return;
        const content=$('modalContent');if(!content)return;
        const list=Array.isArray(entries)?entries:[];
        const section=document.createElement('details');section.className='admin-audit';
        section.innerHTML=`<summary>مراجعة تصحيحات المبيعات (${list.length} الأخيرة)</summary>${list.length?list.map(c=>`<div><b>${esc(c.listing_title||'إعلان')}</b> — من ${money(c.old_price)} إلى ${money(c.new_price)} ر.س، العمولة ${money(c.new_commission)} ر.س<br><small>${esc(c.reason)} — ${esc(new Date(c.created_at).toLocaleString('ar-SA'))}</small></div>`).join(''):'<p class="muted">لم تُسجّل تصحيحات مبيعات حتى الآن.</p>'}`;
        content.appendChild(section);
      }).catch(()=>{});
    }
    $('sooqakAdminStatusFilter').onchange=e=>openCloudAdminDashboard(e.target.value);
    $('modalContent').querySelectorAll('[data-admin-review]').forEach(button=>button.onclick=async()=>{
      const panel=button.closest('[data-report-item]');
      const next=panel.querySelector('[data-admin-next]').value;
      const note=panel.querySelector('[data-admin-note]').value.trim();
      if(note.length<3){notify('اكتب سبب القرار، ثلاثة أحرف على الأقل');return;}
      button.disabled=true;
      try{await service.adminReviewReport(button.dataset.adminReview,next,note);notify('حُفظ القرار في سجل الإدارة');await openCloudAdminDashboard(status)}
      catch(err){button.disabled=false;cloudError(err)}
    });
    $('modalContent').querySelectorAll('[data-admin-hide]').forEach(button=>button.onclick=async()=>{
      const panel=button.closest('[data-report-item]');
      const note=panel.querySelector('[data-admin-note]').value.trim();
      if(note.length<10){notify('سبب الإخفاء يجب أن يكون 10 أحرف على الأقل');return;}
      if(!confirm('هل تريد إخفاء الإعلان المرتبط بهذا البلاغ؟ سيختفي من نتائج المشترين مع بقاء سجلات المحادثة والقرار.'))return;
      button.disabled=true;
      try{await service.adminHideReportedListing(button.dataset.adminHide,note);await refreshCloudAds();notify('تم إخفاء الإعلان وتوثيق القرار');await openCloudAdminDashboard(status)}
      catch(err){button.disabled=false;cloudError(err)}
    });
  }catch(err){
    if($('modalTitle').textContent==='لوحة إدارة البلاغات')$('modalContent').innerHTML='<div class="warning">هذه اللوحة متاحة للمشرفين الموثقين فقط. لم يُفعّل أي مشرف تلقائيًا.</div><button class="btn btn-outline" data-act="account">العودة إلى الحساب</button>';
    cloudError(err);
  }
}


// V12: progressively load real listings, never invent a larger result count.
let v12CloudLoaded=0,v12HasMoreListings=false,v12Loading=false;
function renderV12LoadMore(){const el=$('sooqakMoreArea');if(!el)return;el.hidden=!cloudEnabled()||!v12HasMoreListings||marketCountry!=='SA'||onlyFavorites;}
async function loadV12MoreListings(){if(!cloudEnabled()||!window.sooqakCloud||v12Loading||!v12HasMoreListings)return;
 const button=$('sooqakMoreListings');v12Loading=true;if(button)button.disabled=true;
 try{const rows=await window.sooqakCloud.fetchListings(v12CloudLoaded,60,filters());v12CloudLoaded+=rows.length;v12HasMoreListings=rows.length===60;
   const seen=new Set(state.ads.map(x=>x.id));const fresh=rows.map(convertCloudAd).filter(x=>!seen.has(x.id));state.ads.push(...fresh);render();
   if(!rows.length)notify('وصلت إلى آخر الإعلانات');
 }catch(err){cloudError(err)}finally{v12Loading=false;if(button)button.disabled=false}}
function v12SetOnlineStatus(){let banner=$('v12OfflineBanner');if(!banner){banner=document.createElement('div');banner.id='v12OfflineBanner';banner.className='demo-banner';banner.setAttribute('role','status');document.body.prepend(banner)}
 banner.hidden=navigator.onLine;banner.textContent='الاتصال بالإنترنت منقطع؛ قد لا تُحفظ العمليات السحابية. يمكنك مراجعة البيانات المعروضة مسبقًا.';
}
// Opt-in browser alerts while the page remains open. This is not background push or SMS.
const V12_ALERT_KEY='sooqak:browser-alerts:v12';
let v12AlertsEnabled=false;
try{v12AlertsEnabled=localStorage.getItem(V12_ALERT_KEY)==='yes'}catch(_e){}
async function openV12BrowserAlerts(){const supported=('Notification' in window)&&location.protocol==='https:';
 showModal('تنبيهات المتصفح',`<div class="info">تنبيهات اختيارية للرسائل الجديدة عندما يكون سوقك مفتوحًا، وليست SMS ولا إشعارات خلفية دائمة. تختلف الإتاحة حسب المتصفح والجهاز.</div><p>الحالة الحالية: <strong>${v12AlertsEnabled?'مفعّلة في هذا الجهاز':'غير مفعّلة'}</strong></p><div class="button-row"><button type="button" class="btn btn-gold" id="v12AlertsEnable" ${supported?'':'disabled'}>السماح بتنبيه الرسائل</button><button type="button" class="btn btn-outline" id="v12AlertsDisable">إيقاف التنبيهات</button></div>${supported?'':'<p class="muted">متصفحك الحالي لا يدعم هذا النوع من التنبيهات.</p>'}`);
 const yes=$('v12AlertsEnable');if(yes)yes.onclick=async()=>{try{const permission=await Notification.requestPermission();v12AlertsEnabled=permission==='granted';localStorage.setItem(V12_ALERT_KEY,v12AlertsEnabled?'yes':'no');openV12BrowserAlerts();notify(v12AlertsEnabled?'تم تفعيل تنبيه المتصفح عند فتح سوقك':'لم يتم السماح بالتنبيهات')}catch(e){notify('تعذر تفعيل التنبيهات على هذا المتصفح')}};
 $('v12AlertsDisable').onclick=()=>{v12AlertsEnabled=false;localStorage.setItem(V12_ALERT_KEY,'no');openV12BrowserAlerts();notify('تم إيقاف تنبيهات المتصفح')};
}
function v12NotifyUnread(count){if(!v12AlertsEnabled||!('Notification' in window)||Notification.permission!=='granted')return;
 try{new Notification('رسالة جديدة في سوقك | SOOQAK',{body:count===1?'وصلتك رسالة جديدة':'وصلتك رسائل جديدة في سوقك',tag:'sooqak-unread'})}catch(_e){}
}
function initV12(){const more=$('sooqakMoreListings');if(more)more.addEventListener('click',loadV12MoreListings);
 window.addEventListener('offline',v12SetOnlineStatus);window.addEventListener('online',v12SetOnlineStatus);v12SetOnlineStatus();
 const footer=document.querySelector('footer');if(footer){const links=document.createElement('div');links.style.cssText='display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:18px auto;font-size:12px';
 links.innerHTML='<a href="./terms.html">شروط الاستخدام (مسودة)</a><a href="./privacy.html">الخصوصية (مسودة)</a><a href="./content-policy.html">سياسة الإعلانات (مسودة)</a>';footer.appendChild(links)}
}
document.addEventListener('DOMContentLoaded',initV12);

document.addEventListener('DOMContentLoaded',initialize);
document.addEventListener('DOMContentLoaded',()=>{
  const auth=new URLSearchParams(location.search).get('auth');
  if(auth==='signup'||auth==='login')setTimeout(()=>openCloudLogin(auth),120);
});

