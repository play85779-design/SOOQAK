const {test,expect}=require('@playwright/test');
async function setup(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V60 local mocks only'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{window.SOOQAK_CLOUD_ENABLED=false;reset();state.ads=[];state.account=null});
}
test('V60 demo seller presents facts without stars or identity claims',async({page})=>{
 await setup(page);
 await page.evaluate(()=>openSellerProfile('demo-1'));
 const panel=page.locator('.seller-trust-facts');
 await expect(panel).toBeVisible();
 await expect(panel).toContainText('هذا ملف تجريبي');
 await expect(panel).toContainText('لم يتم إثبات التوثيق');
 await expect(panel).not.toContainText('موثق الهوية');
 await expect(panel).not.toContainText('★★★★★');
});
test('V60 seller facts count visible ads, never claim all marketplace inventory',async({page})=>{
 await setup(page);
 await page.evaluate(()=>{
  window.SOOQAK_CLOUD_ENABLED=true;
  const item={id:'v60-public',seller:'بائع موضح',title:'كرسي اختبار',city:'الجبيل',category:'أثاث ومنزل',status:'متاح',hidden:false,
   kind:'بيع',accountId:'33333333-3333-4333-8333-333333333333',price:100,priceType:'ثابت',createdAt:'2026-11-21T12:00:00Z',demo:false};
  drawSellerProfile(item,null,false);
 });
 const panel=page.locator('.seller-trust-facts');
 await expect(panel).toContainText('عدد الإعلانات المتاحة الظاهرة: 1');
 await expect(panel).toContainText('من نتائج الإعلانات التي حُمّلت في هذه الجلسة');
 await expect(panel).toContainText('الرقم غير موثّق');
 await expect(panel).not.toContainText('حساب موثق');
});
test('V60 opt-in contact fact never prints private phone in trust panel',async({page})=>{
 await setup(page);
 const output=await page.evaluate(()=>{
  const item={id:'v60-private',seller:'بائع',status:'متاح',demo:false,
   accountId:'abc',whatsapp:'966512345678',showWhatsapp:true,allowCall:false};
  return sellerTrustFacts(item,[item]);
 });
 expect(output).toContain('اختار البائع إظهار وسيلة اتصال');
 expect(output).not.toContain('966512345678');
});
