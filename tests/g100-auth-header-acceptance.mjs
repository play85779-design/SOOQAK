import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('v101');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep))throw Error();res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});res.end(await readFile(file))}catch{if(!res.headersSent)res.writeHead(404);res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await (process.env.G100_BROWSER==='webkit'?webkit:chromium).launch({headless:true});
let passed=0;
const check=(name,ok)=>{assert.ok(ok,name);passed++;console.log('PASS',name)};
try{
for(const [name,width,height] of [['phone',390,844],['fold',720,780],['desktop',1280,900]]){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',isMobile:name!=='desktop',hasTouch:name!=='desktop'});
 await context.route('**/*',r=>r.request().url().startsWith(base)||/^(blob:|data:)/.test(r.request().url())?r.continue():r.abort());
 const page=await context.newPage();
 const pageErrors=[];page.on('pageerror',e=>{pageErrors.push(e.message);console.error('PAGE ERROR:',e.message)});
 try{
 await page.goto(base+'/#auth');
 await page.locator('#connected-login-form').waitFor();
 check(name+' offline test disables submission',await page.locator('#connected-login-form .auth-live-primary').isDisabled());
 for(const mode of ['login','signup']){
 if(mode==='signup')await page.locator('[data-live-mode="signup"]').click();
 const field=page.locator('#live-password'),toggle=page.locator('#connected-auth-root [data-live-toggle]');
 await field.fill('synthetic-only-123');check(name+' '+mode+' starts masked',await field.getAttribute('type')==='password');
 await toggle.click();check(name+' '+mode+' shows password',await field.getAttribute('type')==='text'&&await toggle.getAttribute('aria-pressed')==='true');
 await toggle.click();check(name+' '+mode+' masks without data loss',await field.getAttribute('type')==='password'&&await field.inputValue()==='synthetic-only-123'&&await toggle.getAttribute('aria-pressed')==='false');
 check(name+' '+mode+' submission stays disabled',await page.locator('#connected-auth-root .auth-live-primary').isDisabled());
 }
 await page.goto(base+'/#home');await page.locator('.site>.top').waitFor();
 const top=page.locator('.site>.top');
 check(name+' sticky header CSS',await top.evaluate(e=>getComputedStyle(e).position==='sticky'));
 await page.evaluate(()=>window.scrollTo(0,Math.min(450,document.documentElement.scrollHeight-innerHeight)));
 await page.waitForTimeout(100);
 check(name+' header remains visible while scrolling',await page.evaluate(()=>{const b=document.querySelector('.site>.top').getBoundingClientRect();return scrollY>100&&b.top>=-2&&b.top<8&&b.bottom>0}));
 const photo=page.locator('.card-photo:has(img)').first();await photo.waitFor();
 check(name+' display watermark present',await photo.evaluate(e=>getComputedStyle(e,'::after').content.includes('سوقك')&&getComputedStyle(e,'::after').pointerEvents==='none'));
 await photo.locator('button[data-detail]').click();const detail=page.locator('.detail-gallery .detail-hero:has(img)');await detail.waitFor();
 check(name+' detail watermark present',await detail.evaluate(e=>getComputedStyle(e,'::after').content.includes('سوقك')&&getComputedStyle(e,'::after').pointerEvents==='none'));
 await page.locator('.detail-primary-image').evaluate(img=>img.decode());
 const original=await page.locator('.detail-primary-image').getAttribute('src');
 await page.locator('.detail-primary-image').click();
 await page.locator('.g100-image-dialog').waitFor();
 check(name+' full gallery branding and controls',await page.locator('.g100-gallery-brand').innerText()==='سوقك'&&await page.locator('.g100-image-dialog [data-brand-photo]').isVisible());
 await page.locator('.g100-gallery-frame img').evaluate(img=>img.decode());
 const downloadEvent=page.waitForEvent('download');
 await page.locator('.g100-image-dialog [data-brand-photo]').click();
 const download=await downloadEvent;
 const bytes=await readFile(await download.path());
 check(name+' PNG copy exported',download.suggestedFilename()==='sooqak-image.png'&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
 const branded=await page.evaluate(async data=>{const im=new Image();im.src='data:image/png;base64,'+data;await im.decode();const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);return [...ctx.getImageData(0,c.height-1,1,1).data]},bytes.toString('base64'));
 check(name+' actual pixels carry brand band',branded[0]===18&&branded[1]===62&&branded[2]===50);
 await page.locator('.g100-image-dialog [data-close-image]').click();
 check(name+' original image reference unchanged',await page.locator('.detail-primary-image').getAttribute('src')===original);
 await page.goto(base+'/#post');
 await page.locator('#preview-images').setInputFiles({name:'test.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAIAAADRv8uKAAAAL0lEQVR4nO3NIQEAMAgAsPMadCIK/SUVcJitwCK73oV/sorFYrFYLBaLxWKxeGUAnxYBEyCi9ycAAAAASUVORK5CYII=','base64')});
 const beforeCrop=await page.locator('.upload-thumb img').first().getAttribute('src');
 await page.locator('[data-draft-crop="0"]').click();await page.locator('#crop-image').evaluate(img=>img.decode());
 await page.locator('[data-crop-cancel]').click();
 check(name+' cancel crop preserves original',await page.locator('.upload-thumb img').first().getAttribute('src')===beforeCrop);
 await page.locator('[data-draft-crop="0"]').click();await page.locator('#crop-image').evaluate(img=>img.decode());await page.locator('[data-crop-save]').click();
 await page.locator('.crop-dialog').waitFor({state:'detached'});await page.locator('.upload-thumb img').first().evaluate(img=>img.decode());
 check(name+' draft crop saved at 4:3',await page.locator('.upload-thumb img').first().evaluate(img=>img.naturalWidth===1200&&img.naturalHeight===900));
 await page.locator('[data-post-next]').click();
 check(name+' nine approved listing sections',await page.locator('#post-cat option').count()===9);
 await page.locator('#post-cat').selectOption('إلكترونيات');
 check(name+' five dependent subcategories',await page.locator('#post-subcategory option').count()===6);
 await page.locator('#post-subcategory').selectOption('جوالات');
 await page.locator('#post-title').fill('إعلان حالة تجريبي');
 await page.locator('#post-price').fill('99');
 await page.locator('#post-condition').selectOption('مستعمل');
 await page.locator('#post-region').selectOption({label:'المنطقة الشرقية'});
 await page.locator('#post-city').selectOption({label:'الجبيل'});
 await page.locator('[data-post-next]').click();
 check(name+' review shows selected condition', (await page.locator('.wizard-summary-info').innerText()).includes('مستعمل'));
 await page.locator('[data-post-preview]').click();
 await page.locator('.dialog-card .cta[data-action="close"]').click();
 await page.goto(base+'/#listings');
 const local=page.locator('.card').filter({hasText:'إعلان حالة تجريبي'});
 await local.waitFor();
 check(name+' card shows real date and condition',await local.locator('time[datetime]').count()===1&&(await local.locator('.g100-card-meta').innerText()).includes('مستعمل'));
 await page.locator('.search-filter-btn').click();
 await page.locator('#advanced-condition').selectOption('جديد');await page.locator('#advanced-filter-form [type=submit]').click();
 check(name+' condition filter excludes other states',await local.count()===0);
 await page.locator('[data-clear-search="condition"]').click();await local.waitFor();
 check(name+' condition chip clears filter',await local.count()===1);
 await page.locator('.search-filter-btn').click();await page.locator('#advanced-category').selectOption('إلكترونيات');await page.locator('#advanced-subcategory').selectOption('كمبيوترات');await page.locator('#advanced-filter-form [type=submit]').click();
 check(name+' subcategory excludes different listing',await local.count()===0);
 await page.locator('[data-clear-search="subcategory"]').click();await local.waitFor();
 check(name+' subcategory chip restores result',(await local.locator('.g100-card-meta').innerText()).includes('جوالات'));
 await page.locator('[data-clear-search="category"]').click();
 await page.waitForFunction(async()=>{const db=await new Promise((ok,no)=>{const q=indexedDB.open('sooqak-preview-workspace',1);q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)});try{return await new Promise(ok=>{const q=db.transaction('workspace','readonly').objectStore('workspace').get('current');q.onsuccess=()=>ok(!!q.result?.ads?.some(x=>x.title==='إعلان حالة تجريبي'&&x.images?.[0]?.bytes instanceof ArrayBuffer));q.onerror=()=>ok(false)})}finally{db.close()}},{},{timeout:15000});await page.reload();await local.waitFor();
 check(name+' condition and date survive reload',(await local.locator('.g100-card-meta').innerText()).includes('مستعمل')&&await local.locator('time[datetime]').count()===1);

 // Isolated simulated account; neither real mail nor database requests are made.
 await page.route('**/cloud-config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.SOOQAK_CLOUD_ENABLED=true;window.SOOQAK_AUTH_CALLBACK=false;'}));
 await page.route('**/cloud-adapter.js',r=>r.fulfill({contentType:'text/javascript',body:`const u={id:'mock-user',user_metadata:{full_name:'اسم اختبار'},email_confirmed_at:'2026-01-01'};let profile={city:''};window.sooqakCloud={getUser:()=>u,loadPrivateProfile:async()=>profile,getContactPrefs:async()=>({}),listMyAccountKinds:async()=>[{kind:'personal'}],savePrivateProfile:async v=>{profile={city:v.city};u.user_metadata.full_name=v.display_name}};`}));
 await page.goto(base+'/#settings');await page.reload();
 const progress=page.locator('.g100-completion progress');await progress.waitFor();
 check(name+' profile completion uses saved data',await progress.getAttribute('value')==='75');
 await page.locator('#connected-profile-form [name=city]').fill('الجبيل');
 await page.locator('#connected-profile-form button').click();
 await page.waitForFunction(()=>document.querySelector('.g100-completion progress')?.value===100);
 check(name+' profile completion refreshes after mock save',await progress.getAttribute('value')==='100');
 const pw=page.locator('#connected-change-password input[type=password]');
 await pw.fill('synthetic-only-456');await page.locator('#connected-change-password [data-live-toggle]').click();
 check(name+' settings password visibility works',await page.locator('#connected-change-password input').getAttribute('type')==='text');
 check(name+' no uncaught script errors',pageErrors.length===0);


 }finally{await context.close()}
}
}finally{await browser.close();server.close()}
console.log('G100 browser assertions passed:',passed);
