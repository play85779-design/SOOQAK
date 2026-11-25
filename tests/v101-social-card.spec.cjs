const {test,expect}=require('@playwright/test');
test('V101 generate real WhatsApp social JPEG from governing poster',async({page})=>{
 await page.setViewportSize({width:1200,height:630});
 await page.goto('/v101/social-card.html',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.title b')).toHaveText('سوقك');
 await page.locator('.poster img').evaluate(img=>new Promise((resolve,reject)=>{if(img.complete&&img.naturalWidth)return resolve();img.addEventListener('load',resolve,{once:true});img.addEventListener('error',()=>reject(new Error('Reference poster failed to load')),{once:true})}));
 await page.evaluate(()=>document.fonts.ready);
 const img=await page.screenshot({type:'jpeg',quality:82,fullPage:false,animations:'disabled'});
 console.log('SOOQAK_SOCIAL_JPEG_BEGIN'+img.toString('base64')+'SOOQAK_SOCIAL_JPEG_END');
});
