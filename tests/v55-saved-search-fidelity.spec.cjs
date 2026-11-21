const {test,expect}=require('@playwright/test');
async function setup(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V55 offline tests'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{window.SOOQAK_CLOUD_ENABLED=false;reset()});
 await page.locator('#filterToggle').click();
}
test('V55 local saved search preserves category, subcategory, city, district, sorting and price',async({page})=>{
 await setup(page);
 await page.locator('#categoryFilter').selectOption('سيارات');
 const sub=await page.locator('#subcategoryFilter option').nth(1).getAttribute('value');
 await page.locator('#subcategoryFilter').selectOption(sub);
 await page.locator('#cityFilter').selectOption('الجبيل');
 await page.locator('#districtFilter').fill('الفيحاء');
 await page.locator('#sortFilter').selectOption('cheap');
 await page.locator('#minPrice').fill('1000');
 await page.evaluate(()=>saveCurrentSearch());
 const saved=await page.evaluate(()=>state.savedSearch);
 expect(saved).toHaveLength(1);
 expect(saved[0]).toMatchObject({category:'سيارات',subcategory:sub,city:'الجبيل',district:'الفيحاء',sort:'cheap',min_price:1000});
 await page.evaluate(()=>{const row=state.savedSearch[0];reset();applySearchPayload(row)});
 await expect(page.locator('#categoryFilter')).toHaveValue('سيارات');
 await expect(page.locator('#subcategoryFilter')).toHaveValue(sub);
 await expect(page.locator('#cityFilter')).toHaveValue('الجبيل');
 await expect(page.locator('#districtFilter')).toHaveValue('الفيحاء');
 await expect(page.locator('#sortFilter')).toHaveValue('cheap');
 await expect(page.locator('#minPrice')).toHaveValue('1000');
 await page.evaluate(()=>saveCurrentSearch());
 expect(await page.evaluate(()=>state.savedSearch.length)).toBe(1);
});
test('V55 applying an old basic search clears unrelated advanced filters',async({page})=>{
 await setup(page);
 await page.locator('#categoryFilter').selectOption('سيارات');
 await page.locator('#subcategoryFilter').selectOption({index:1});
 await page.locator('#districtFilter').fill('حي قديم');
 await page.locator('#sortFilter').selectOption('expensive');
 await page.evaluate(()=>applySearchPayload({search_query:'شقة',category:'عقارات',city:'الدمام',listing_kind:'بيع',min_price:null,max_price:null}));
 await expect(page.locator('#categoryFilter')).toHaveValue('عقارات');
 await expect(page.locator('#subcategoryFilter')).toHaveValue('');
 await expect(page.locator('#districtFilter')).toHaveValue('');
 await expect(page.locator('#sortFilter')).toHaveValue('new');
});
test('V55 rejects silently losing advanced criteria in cloud saved searches',async({page})=>{
 await setup(page);
 await page.locator('#cityFilter').selectOption('الجبيل');
 await page.locator('#districtFilter').fill('الفيحاء');
 await page.evaluate(()=>{
  window.__V55_NETWORK_CALLS=0;
  window.SOOQAK_CLOUD_ENABLED=true;
  state.account={id:'v55-test',email:'test@example.invalid'};
  window.sooqakCloud={addSavedSearch:async()=>{window.__V55_NETWORK_CALLS++}};
  saveCurrentSearch();
 });
 await expect(page.locator('#toast')).toContainText('قاعدة البيانات');
 expect(await page.evaluate(()=>window.__V55_NETWORK_CALLS)).toBe(0);
});
