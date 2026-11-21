const {test,expect}=require('@playwright/test');
async function setup(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V59 local tests'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{
  window.SOOQAK_CLOUD_ENABLED=false;
  reset();state.account=null;state.sellerMutes=[];
  state.ads=[
   {id:'v59-sale-a',title:'كرسي مميز من البائع أ',seller:'البائع أ',owner:'sellerA@example.invalid',
    city:'الجبيل',category:'أثاث ومنزل',status:'متاح',hidden:false,kind:'بيع',
    role:'فردي',price:200,priceType:'ثابت',createdAt:'2026-11-20T12:00:00Z',demo:false},
   {id:'v59-sale-b',title:'طاولة مميزة من البائع ب',seller:'البائع ب',owner:'sellerB@example.invalid',
    city:'الدمام',category:'أثاث ومنزل',status:'متاح',hidden:false,kind:'بيع',
    role:'فردي',price:300,priceType:'ثابت',createdAt:'2026-11-20T11:00:00Z',demo:false}
  ];
  render();
 });
}
test('V59 hides only a selected seller locally and undo restores listings',async({page})=>{
 await setup(page);
 await expect(page.locator('#listingGrid')).toContainText('كرسي مميز من البائع أ');
 await expect(page.locator('#listingGrid')).toContainText('طاولة مميزة من البائع ب');
 await page.evaluate(()=>openSellerProfile('v59-sale-a'));
 await expect(page.locator('[data-act="muteSeller"]')).toBeVisible();
 await page.locator('[data-act="muteSeller"]').click();
 await expect(page.locator('#modalContent')).toContainText('على هذا الجهاز فقط');
 await page.locator('[data-act="confirmMuteSeller"]').click();
 await expect(page.locator('#listingGrid')).not.toContainText('كرسي مميز من البائع أ');
 await expect(page.locator('#listingGrid')).toContainText('طاولة مميزة من البائع ب');
 await page.locator('#filterToggle').click();
 await page.locator('#manageSellerMutes').click();
 await expect(page.locator('#modalContent')).toContainText('البائع أ');
 await page.locator('[data-act="unmuteSeller"]').click();
 await expect(page.locator('#listingGrid')).toContainText('كرسي مميز من البائع أ');
 expect(await page.evaluate(()=>state.sellerMutes.length)).toBe(0);
});
test('V59 locally submitted reports reject demo ads, owner and exact repeats',async({page})=>{
 await setup(page);
 await page.evaluate(()=>{state.account={name:'مستخدم',email:'buyer@example.invalid'};openReport('demo-1')});
 await expect(page.locator('#reportForm')).toHaveCount(0);
 await page.evaluate(()=>openReport('v59-sale-a'));
 await expect(page.locator('#reportForm')).toBeVisible();
 await page.locator('#reportForm textarea').fill('اسم المنتج والوصف لا يتطابقان');
 await page.locator('#reportForm button[type="submit"]').click();
 expect(await page.evaluate(()=>state.reports.length)).toBe(1);
 await page.evaluate(()=>openReport('v59-sale-a'));
 await page.locator('#reportForm button[type="submit"]').click();
 await expect(page.locator('#toast')).toContainText('محفوظ مسبقًا');
 expect(await page.evaluate(()=>state.reports.length)).toBe(1);
 await page.evaluate(()=>{state.account.email='sellerA@example.invalid';openReport('v59-sale-a')});
 await expect(page.locator('#toast')).toContainText('لا يمكنك الإبلاغ عن إعلانك');
});
test('V59 local mute is preserved but never claims a server ban',async({page})=>{
 await setup(page);
 const data=await page.evaluate(()=>{
  window.SOOQAK_CLOUD_ENABLED=true;
  state.sellerMutes=[{key:'owner:sellerA@example.invalid',label:'البائع أ'}];save();
  const raw=JSON.parse(localStorage.getItem(STORAGE_KEY));
  return {muteCount:raw.sellerMutes.length,hasAccountData:Object.hasOwn(raw,'ads')};
 });
 expect(data).toEqual({muteCount:1,hasAccountData:false});
 await page.evaluate(()=>{window.SOOQAK_CLOUD_ENABLED=false;showSellerMutes()});
 await expect(page.locator('#modalContent')).toContainText('ليس حظر حسابات أو رسائل');
});
