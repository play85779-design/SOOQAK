const {test,expect}=require('@playwright/test');
test('V58 seller page never invents a rating for demo seller',async({page})=>{
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V58 fixture'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{window.SOOQAK_CLOUD_ENABLED=false;reset();openSellerProfile('demo-1')});
 await expect(page.locator('#modalContent .seller-review-readiness')).toContainText('التقييمات غير مفعّلة');
 await expect(page.locator('#modalContent .seller-review-readiness')).not.toContainText('★★★★★');
 await expect(page.locator('#modalContent')).toContainText('بائع تجريبي');
});
test('V58 profile owner sees honest ratings status, no review submission controls',async({page})=>{
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V58 fixture'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{window.SOOQAK_CLOUD_ENABLED=false;reset();state.account={name:'بائع اختبار',email:'owner@example.invalid'};openMySellerProfile()});
 await expect(page.locator('#modalContent .seller-review-readiness')).toContainText('التحقق من أهلية المقيّم');
 await expect(page.locator('#modalContent [data-act="submit-review"]')).toHaveCount(0);
});
