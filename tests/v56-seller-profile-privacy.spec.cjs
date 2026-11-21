const {test,expect}=require('@playwright/test');
// Tests use only browser fixtures and local/fake cloud data. No real accounts.
async function local(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V56 local fixture'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{window.SOOQAK_CLOUD_ENABLED=false;reset()});
}
test('V56 seller profile can show a safe public bio and its active listings',async({page})=>{
 await local(page);
 await page.evaluate(()=>{
  state.account={name:'بائع تجريبي',email:'seller@example.invalid'};
  state.role='فردي';
  state.sellerProfiles[sellerProfileKey()]={display_name:'متجر التجربة',city:'الجبيل',about:'منتجات منزلية بجودة جيدة',is_visible:true};
  state.ads=[{id:'seller-v56-1',owner:'seller@example.invalid',role:'فردي',
   title:'طاولة للمجلس',city:'الجبيل',status:'متاح',category:'أثاث ومنزل',kind:'بيع',
   price:350,priceType:'ثابت',createdAt:new Date().toISOString(),seller:'متجر التجربة'}];
  openMySellerProfile();
 });
 await expect(page.locator('#modalContent')).toContainText('متجر التجربة');
 await expect(page.locator('#modalContent')).toContainText('منتجات منزلية');
 await expect(page.locator('#modalContent')).toContainText('طاولة للمجلس');
 await expect(page.locator('#modalContent')).toContainText('ملف البائع العام لا يعني');
 await expect(page.locator('#modalContent')).not.toContainText('seller@example.invalid');
});
test('V56 public bio form blocks accidental phone/email and keeps draft',async({page})=>{
 await local(page);
 await page.evaluate(()=>{
  state.account={name:'بائع',email:'seller@example.invalid'};
  state.role='فردي';
  editSellerProfile();
 });
 await expect(page.locator('#sellerProfileForm')).toBeVisible();
 await page.locator('#sellerProfileForm textarea[name="about"]').fill('للتواصل 0501234567');
 await page.locator('#sellerProfileForm button[type="submit"]').click();
 await expect(page.locator('#toast')).toContainText('لا تضع رقم الجوال أو البريد');
 await expect(page.locator('#sellerProfileForm')).toBeVisible();
 await page.locator('#sellerProfileForm textarea[name="about"]').fill('البريد seller@example.com');
 await page.locator('#sellerProfileForm button[type="submit"]').click();
 await expect(page.locator('#sellerProfileForm')).toBeVisible();
 expect(await page.evaluate(()=>state.sellerProfiles[sellerProfileKey()]||null)).toBe(null);
});
test('V56 shared cloud seller listing displays without claiming full inventory or exposing hidden profile',async({page})=>{
 await local(page);
 await page.evaluate(()=>{
  window.SOOQAK_CLOUD_ENABLED=true;
  state.account={id:'11111111-1111-4111-8111-111111111111',name:'مشتري',email:'buyer@example.invalid'};
  state.ads=[];
  const ad={id:'shared-v56',title:'كراسي للمجلس من رابط مباشر',status:'متاح',
   createdAt:new Date().toISOString(),accountId:'33333333-3333-4333-8333-333333333333',
   seller:'اسم بائع عام',city:'الجبيل',price:350,priceType:'ثابت',kind:'بيع',
   category:'أثاث ومنزل',description:'وصف تجريبي',hidden:false,demo:false};
  sooqakSharedLinkCache.set(ad.id,ad);
  window.sooqakCloud={getPublicSellerProfile:async()=>({
   display_name:'سر خاص بالبائع',city:'موقع خاص',about:'نبذة خاصة مخفية',is_visible:false
  })};
  openSellerProfile('shared-v56');
 });
 await expect(page.locator('#modalContent')).toContainText('كراسي للمجلس من رابط مباشر');
 await expect(page.locator('#modalContent')).toContainText('إعلانات ظاهرة من النتائج الحالية: 1');
 await expect(page.locator('#modalContent')).toContainText('اسم بائع عام');
 await expect(page.locator('#modalContent')).not.toContainText('سر خاص بالبائع');
 await expect(page.locator('#modalContent')).not.toContainText('نبذة خاصة مخفية');
});
