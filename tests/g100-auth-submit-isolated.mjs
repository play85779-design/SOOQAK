import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const auth=await readFile('v101/connected-auth.js','utf8');
const html='<!doctype html><html lang="ar" dir="rtl"><body><div id="connected-auth-root"></div><script>window.SOOQAK_CLOUD_ENABLED=true;</script><script src="/connected-auth.js"></script></body></html>';
const adapter=`window.calls=[];window.sooqakCloud={getUser:()=>null,signInPassword:async(e,p)=>{window.calls.push(['login',e,p]);throw {code:'invalid_credentials'}},signUpPassword:async(e,p,d)=>{window.calls.push(['signup',e,p,d]);throw {code:'unexpected_failure',message:'Error sending confirmation email'}},resetPasswordEmail:async(e)=>{window.calls.push(['recover',e]);return true}};`;
const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/'?'text/html':'text/javascript');res.end(req.url==='/'?html:req.url==='/connected-auth.js'?auth:adapter)});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let n=0;
try{
for(const [name,engine] of [['Chromium',chromium],['WebKit',webkit]]){
const browser=await engine.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await page.goto('http://127.0.0.1:'+server.address().port);
await page.locator('#connected-login-form').waitFor();
const email=page.locator('#live-email'),password=page.locator('#live-password'),status=page.locator('.auth-live-status');
const secret='Synthetic-Only-12345';
await email.fill('test@example.invalid');await password.fill(secret);await page.locator('[data-live-toggle]').click();await password.press('Enter');
await page.waitForFunction(()=>document.querySelector('.auth-live-status')?.classList.contains('error'));
assert.equal(await password.inputValue(),secret);assert.equal(await password.getAttribute('type'),'password');assert.match(await status.innerText(),/تعذر الدخول/);assert.equal(await email.inputValue(),'test@example.invalid');n++;console.log('PASS '+name+' Enter failed login preserves masked password and email');
await page.locator('[data-live-mode="signup"]').click();await page.locator('[name=display]').fill('اختبار');await password.fill(secret);await page.locator('[name=consent]').check();await password.press('Enter');
await page.waitForFunction(()=>document.querySelector('.auth-live-status')?.classList.contains('error'));
assert.equal(await password.inputValue(),secret);assert.equal(await password.getAttribute('type'),'password');assert.match(await status.innerText(),/إرسال البريد/);assert.equal(await page.locator('[name=display]').inputValue(),'اختبار');assert.ok(await page.locator('[name=consent]').isChecked());n++;console.log('PASS '+name+' failed signup keeps draft and explains mail failure');
await page.locator('[data-live-mode="login"]').click();assert.equal(await password.inputValue(),'');n++;console.log('PASS '+name+' changing modes clears password');
await page.locator('[data-live-mode="restore"]').click();await page.locator('#connected-restore-form button').click();await page.waitForFunction(()=>document.querySelector('.auth-live-status')?.textContent.includes('استُقبل طلب الاستعادة'));assert.match(await status.innerText(),/لم نتحقق من وصول الرسالة/);n++;console.log('PASS '+name+' recovery acknowledgement does not claim delivery');
const calls=await page.evaluate(()=>window.calls.map(x=>x[0]));assert.deepEqual(calls,['login','signup','recover']);n++;console.log('PASS '+name+' exactly one request per submit');
}finally{await browser.close()}
}
}finally{server.close()}
console.log('Focused auth assertions passed: '+n);
