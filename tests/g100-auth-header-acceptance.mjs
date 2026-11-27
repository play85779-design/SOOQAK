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

 }finally{await context.close()}
}
}finally{await browser.close();server.close()}
console.log('G100 browser assertions passed:',passed);
