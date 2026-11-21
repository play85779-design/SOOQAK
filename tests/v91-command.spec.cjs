const {test,expect}=require('@playwright/test');

test('private command view distinguishes zero, missing data and denied access',async({page})=>{
 await page.route('**/cloud.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
 await page.goto('/index.html');
 await page.evaluate(async()=>{
  state.account={id:'fixture'};
  window.sooqakCloud={ownerCommandSnapshot:async()=>({scopes:['finance'],metrics:[{scope:'finance',metric:'cash',value:0,source:'كشف تجريبي',observed_at:'2026-01-01'}]})};
  await openOwnerCommand();
 });
 await expect(page.locator('#modalContent')).toContainText('0 · كشف تجريبي');
 await expect(page.locator('#modalContent')).toContainText('غير متاح');
 await expect(page.locator('#modalContent')).not.toContainText('النشطون اليوم');
 await page.evaluate(async()=>{
  window.sooqakCloud.ownerCommandSnapshot=async()=>{throw {code:'42501'}};
  await openOwnerCommand();
 });
 await expect(page.locator('#modalContent')).toContainText('لا يملك صلاحية');
 await expect(page.locator('#modalContent')).not.toContainText('كشف تجريبي');
});
