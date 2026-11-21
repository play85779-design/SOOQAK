const {test,expect}=require('@playwright/test');
// Only sample listings and in-memory data. No real Supabase or external calls.
async function setup(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// local V53 fixture'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{window.SOOQAK_CLOUD_ENABLED=false;reset()});
}
test('V53 corrects an Arabic single-letter typo by explicit user selection',async({page})=>{
 await setup(page);
 await page.locator('#searchInput').fill('سيارر');
 await expect(page.locator('#sooqakSearchHints')).toBeVisible();
 await expect(page.locator('#sooqakSearchHints [role="option"]').first()).toContainText('سيارة');
 await page.locator('#sooqakSearchHints [role="option"]').first().click();
 await expect(page.locator('#searchInput')).toHaveValue('سيارة');
 await expect(page.locator('#sooqakSearchHints')).toBeHidden();
 await expect(page.locator('#listingGrid')).toContainText('سيارة سيدان عائلية');
});
test('V53 prefix suggestions support keyboard arrows, enter and escape',async({page})=>{
 await setup(page);
 await page.locator('#searchInput').fill('سيار');
 await expect(page.locator('#sooqakSearchHints')).toBeVisible();
 await page.locator('#searchInput').press('ArrowDown');
 await expect(page.locator('#sooqakSearchHints [role="option"]').first()).toHaveAttribute('aria-selected','true');
 await page.locator('#searchInput').press('Enter');
 await expect(page.locator('#searchInput')).toHaveValue('سيارة');
 await page.locator('#searchInput').fill('عقا');
 await expect(page.locator('#sooqakSearchHints')).toBeVisible();
 await page.locator('#searchInput').press('Escape');
 await expect(page.locator('#sooqakSearchHints')).toBeHidden();
});
test('V53 excludes sold or hidden inventory and uses safe text nodes',async({page})=>{
 await setup(page);
 await page.evaluate(()=>{
  state.ads.push({
   id:'private-leak-test',title:'سريةاختبارممنوع',description:'',city:'الجبيل',
   category:'سيارات',status:'مباع',hidden:false,demo:false
  });
  state.ads.push({
   id:'hidden-leak-test',title:'مخفياختبارممنوع',description:'',city:'الجبيل',
   category:'سيارات',status:'متاح',hidden:true,demo:false
  });
 });
 await page.locator('#searchInput').fill('سريةاختبارممنو');
 await expect(page.locator('#sooqakSearchHints')).toBeHidden();
 await page.locator('#searchInput').fill('مخفياختبارممنو');
 await expect(page.locator('#sooqakSearchHints')).toBeHidden();
 const safe=await page.evaluate(()=>{
  const hints=window.SOOQAK_SEARCH_ASSIST.suggestions('<img onerror=alert(1)>');
  return hints.length===0&&document.querySelector('#sooqakSearchHints img')===null;
 });
 expect(safe).toBe(true);
});
