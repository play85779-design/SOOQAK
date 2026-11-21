const {test,expect}=require('@playwright/test');
test('shared store page requests only public sale listings for the addressed business',async({page})=>{
 const id='55555555-5555-4555-8555-555555555555';
 await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:`
 export function createClient(){return {from:()=>{
  window.calls=[];
  const q=new Proxy({},{get:(_,k)=>(...args)=>{
   window.calls.push([k,...args]);
   if(k==='range')return Promise.resolve({data:[{id:'item',title:'منتج متجر',seller_display_name:'متجر تجريبي',status:'active'}],count:1});
   return q;
  }});return q;
 }}}
 `}));
 await page.goto('/store.html?id='+id);
 await expect(page.locator('#storeName')).toHaveText('متجر تجريبي');
 await expect(page.locator('#products a')).toHaveAttribute('href','./listing.html?id=item');
 await expect(page.locator('#summary')).toContainText('1 من 1');
 expect(await page.evaluate(()=>window.calls)).toEqual(expect.arrayContaining([
  ['eq','account_id',id],['eq','seller_kind','business'],['eq','listing_kind','sale'],
  ['in','status',['active','reserved']],['is','hidden_at',null],['gt','expires_at',expect.any(String)]
 ]));
});
