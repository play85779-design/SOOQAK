const {test,expect}=require('@playwright/test');
const owner='v50-owner@example.invalid';
function listing(id,status,options={}){
 return {id,title:'اختبار إعلان '+id,description:'إعلان آمن للاختبار فقط',role:'فردي',owner,
  category:'سيارات',city:'الجبيل',kind:'بيع',price:10000,priceType:'ثابت',
  status,createdAt:'2026-11-20T10:00:00Z',expiresAt:'2027-11-20T10:00:00Z',hidden:false,demo:false,...options};
}
async function setup(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V50: no remote access'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{
   window.SOOQAK_CLOUD_ENABLED=false;
   state.role='فردي';state.account={id:'11111111-1111-4111-8111-111111111111',email:'v50-owner@example.invalid',name:'اختبار'};
   state.ads=[];state.favorites=[];state.savedSearch=null;
 });
}
test('V50 owner dashboard distinguishes active, expired, sold, and hidden ads',async({page})=>{
 await setup(page);
 await page.evaluate(()=>{
   state.ads=[
    {id:'v50-active',title:'إعلان نشط',description:'تجريبي',role:'فردي',owner:'v50-owner@example.invalid',category:'سيارات',city:'الجبيل',kind:'بيع',price:10000,priceType:'ثابت',status:'متاح',createdAt:'2026-11-20T10:00:00Z',expiresAt:'2027-11-20T10:00:00Z',hidden:false},
    {id:'v50-expired',title:'إعلان منتهي',description:'تجريبي',role:'فردي',owner:'v50-owner@example.invalid',category:'سيارات',city:'الجبيل',kind:'بيع',price:9000,priceType:'ثابت',status:'منتهي',createdAt:'2026-11-20T10:00:00Z',expiresAt:'2026-11-19T10:00:00Z',hidden:false},
    {id:'v50-sold',title:'إعلان مباع',description:'تجريبي',role:'فردي',owner:'v50-owner@example.invalid',category:'سيارات',city:'الجبيل',kind:'بيع',price:8000,priceType:'ثابت',status:'مباع',createdAt:'2026-11-20T10:00:00Z',expiresAt:'2027-11-20T10:00:00Z',hidden:false},
    {id:'v50-hidden',title:'إعلان مخفي',description:'تجريبي',role:'فردي',owner:'v50-owner@example.invalid',category:'سيارات',city:'الجبيل',kind:'بيع',price:7000,priceType:'ثابت',status:'متاح',createdAt:'2026-11-20T10:00:00Z',expiresAt:'2027-11-20T10:00:00Z',hidden:true}
   ];
   openMyAds();
 });
 await expect(page.locator('#modalContent [data-owner-status]')).toHaveCount(4);
 await expect(page.locator('[data-owner-status="active"] [data-act="edit"]')).toHaveCount(1);
 await expect(page.locator('[data-owner-status="expired"] [data-act="renew"]')).toHaveCount(1);
 await expect(page.locator('[data-owner-status="expired"] [data-act="edit"]')).toHaveCount(0);
 await expect(page.locator('[data-owner-status="sold"] [data-act="delete"]')).toHaveCount(0);
 await expect(page.locator('[data-owner-status="hidden"] [data-act]')).toHaveCount(0);
});
test('V50 hide leaves owner data intact but removes ad from public feed',async({page})=>{
 await setup(page);
 page.on('dialog',d=>d.accept());
 await page.evaluate(()=>{state.ads=[{id:'v50-hide',title:'سيارة تظل محفوظة',description:'وصف الاختبار فقط',role:'فردي',owner:'v50-owner@example.invalid',category:'سيارات',city:'الجبيل',kind:'بيع',price:5000,priceType:'ثابت',status:'متاح',createdAt:'2026-11-20T10:00:00Z',expiresAt:'2027-11-20T10:00:00Z',hidden:false}];render();openMyAds()});
 await expect(page.locator('#listingGrid')).toContainText('سيارة تظل محفوظة');
 await page.locator('#modalContent [data-act="delete"]').click();
 expect(await page.evaluate(()=>({count:state.ads.length,hidden:state.ads[0].hidden}))).toEqual({count:1,hidden:true});
 await expect(page.locator('#listingGrid')).not.toContainText('سيارة تظل محفوظة');
 await page.evaluate(()=>openMyAds());
 await expect(page.locator('[data-owner-status="hidden"]')).toContainText('سيارة تظل محفوظة');
});
test('V50 expired local demo renewal extends 60 days without republishing',async({page})=>{
 await setup(page);
 await page.evaluate(()=>{state.ads=[{id:'v50-renew',title:'سيارة للتجديد',description:'وصف الاختبار فقط',role:'فردي',owner:'v50-owner@example.invalid',category:'سيارات',city:'الجبيل',kind:'بيع',price:5000,priceType:'ثابت',status:'منتهي',createdAt:'2026-11-20T10:00:00Z',expiresAt:'2026-11-19T10:00:00Z',hidden:false}];render();openMyAds()});
 await expect(page.locator('#listingGrid')).not.toContainText('سيارة للتجديد');
 await page.locator('#modalContent [data-act="renew"]').click();
 const value=await page.evaluate(()=>({count:state.ads.length,status:state.ads[0].status,renewals:state.ads[0].renewalCount,until:new Date(state.ads[0].expiresAt).getTime()}));
 expect(value.count).toBe(1);expect(value.status).toBe('متاح');expect(value.renewals).toBe(1);
 expect(value.until).toBeGreaterThan(Date.now()+59*86400000);
 await expect(page.locator('#listingGrid')).toContainText('سيارة للتجديد');
});
