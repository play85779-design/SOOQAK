import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('v101');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep))throw Error();const data=await readFile(file);res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});res.end(data)}catch{res.writeHead(404);res.end('Not found')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
let passed=0;const check=(name,condition)=>{assert.ok(condition,name);passed++;console.log('PASS',name)};
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAIAAADRv8uKAAAAL0lEQVR4nO3NIQEAMAgAsPMadCIK/SUVcJitwCK73oV/sorFYrFYLBaLxWKxeGUAnxYBEyCi9ycAAAAASUVORK5CYII=','base64');
try{
for(const [name,width,height] of [['phone',390,844],['fold',720,780],['desktop',1280,900]]){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',isMobile:name!=='desktop',hasTouch:name!=='desktop'});
 await context.route('**/*',route=>{const u=route.request().url();return u.startsWith(base)||u.startsWith('blob:')||u.startsWith('data:')?route.continue():route.abort()});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/#home');await page.locator('#hero-carousel .hero-stage').waitFor();
 const stage=page.locator('#hero-carousel .hero-stage'),next=page.locator('#hero-carousel .hero-next');
 await next.scrollIntoViewIfNeeded();const before=await stage.boundingBox(),scroll=await page.evaluate(()=>window.scrollY);for(let i=0;i<4;i++)await next.click();const after=await stage.boundingBox();
 check(name+' carousel stable height',Math.abs(before.height-after.height)<=1);check(name+' carousel stable scroll',Math.abs(await page.evaluate(()=>window.scrollY)-scroll)<=2);check(name+' one visible slide',await page.locator('[data-hero-panel]:visible').count()===1);
 check(name+' no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2));
 await page.goto(base+'/#services');await page.locator('.service-tile').first().waitFor();check(name+' nine unique service icons',await page.locator('.service-tile>span>svg').evaluateAll(xs=>new Set(xs.map(x=>x.innerHTML)).size)===9);
 await page.goto(base+'/#about');await page.locator('.about-guide').waitFor();check(name+' about has FAQ',await page.locator('.about-guide details').count()>=4);
 await page.goto(base+'/#home');await page.locator('#hero-carousel').waitFor();await page.waitForTimeout(350);
 // Seed a synthetic old-format local advertisement, never real personal data.
 await page.evaluate(async b=>{const blob=new Blob([new Uint8Array(b)],{type:'image/png'});await new Promise((resolve,reject)=>{const req=indexedDB.open('sooqak-preview-workspace',1);req.onsuccess=()=>{const db=req.result,tx=db.transaction('workspace','readwrite');tx.objectStore('workspace').put({schema:1,ads:[{id:'local-77',title:'إعلان تجربة',price:30,region:'الشرقية',city:'الجبيل',section:'أخرى',note:'قديم',images:[blob],local:true}],stores:[],draftPhotos:[],favorites:[],activity:[],nextDemoId:77},'current');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)};req.onerror=()=>reject(req.error)})},[...png]);
 await page.goto(base+'/#detail/local-77');await page.reload();await page.locator('[data-edit-local="local-77"]').waitFor();
 await page.locator('[data-edit-local="local-77"]').click();await page.locator('#edit-title').fill('إعلان بعد التعديل');await page.locator('#edit-price').fill('40');
 // Select a real offered region rather than relying on a spelling guess.
 const region=await page.locator('#edit-region option').nth(1).getAttribute('value')||await page.locator('#edit-region option').nth(1).innerText();await page.locator('#edit-region').selectOption({label:region});
 await page.locator('#edit-image-files').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:png});
 await page.locator('[data-edit-photo-main="1"]').click();check(name+' selected new cover',await page.locator('#edit-photo-list .edit-photo').count()===2);
 await page.locator('#edit-note').fill('وصف بعد التعديل');await page.locator('#edit-local-form button[type=submit]').click();await page.locator('.detail-box h2').waitFor();
 check(name+' edited title visible',(await page.locator('.detail-box h2').innerText()).includes('إعلان بعد التعديل'));
 await page.waitForTimeout(250);await page.reload();await page.locator('[data-edit-local="local-77"]').waitFor();
 check(name+' edit and images persisted',(await page.locator('.detail-box h2').innerText()).includes('إعلان بعد التعديل')&&await page.locator('.detail-thumb').count()===2);
 await page.locator('[data-toggle-local="local-77"]').click();check(name+' paused owner action',(await page.locator('[data-toggle-local="local-77"]').innerText()).includes('تفعيل'));
 await page.goto(base+'/#my-ads');await page.locator('.managed-unit').first().waitFor();check(name+' paused item retained in library',(await page.locator('.managed-unit').first().innerText()).includes('متوقف'));
 check(name+' no script errors',errors.length===0);await context.close();
}
}finally{await browser.close();server.close()}
console.log('Browser assertions passed:',passed);
