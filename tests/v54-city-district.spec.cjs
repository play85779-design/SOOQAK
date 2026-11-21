const {test,expect}=require('@playwright/test');
async function setup(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V54 tests only'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{window.SOOQAK_CLOUD_ENABLED=false;reset()});
 await page.locator('#filterToggle').click();
}
test('V54 offers additional Saudi cities and allows district text search',async({page})=>{
 await setup(page);
 await expect(page.locator('#cityFilter option[value="القطيف"]')).toHaveCount(1);
 await expect(page.locator('#cityFilter option[value="تبوك"]')).toHaveCount(1);
 await page.evaluate(()=>{demos[3].district='حي الفيحاء';demos[0].district='حي الورود'});
 await page.locator('#cityFilter').selectOption('الجبيل');
 await page.locator('#districtFilter').focus();
 await expect(page.locator('#sooqakDistrictSuggestions option')).toHaveCount(1);
 await expect(page.locator('#sooqakDistrictSuggestions option').first()).toHaveAttribute('value','حي الفيحاء');
 await page.locator('#districtFilter').fill('الفيحاء');
 await expect(page.locator('#listingGrid .listing-card')).toHaveCount(1);
 await expect(page.locator('#listingGrid .listing-card').first()).toContainText('طقم كنب');
 await page.locator('#cityFilter').selectOption('الرياض');
 await expect(page.locator('#districtFilter')).toHaveValue('');
 await expect(page.locator('#sooqakDistrictSuggestions option').first()).toHaveAttribute('value','حي الورود');
});
test('V54 neighborhood suggestions exclude hidden and sold ads',async({page})=>{
 await setup(page);
 await page.evaluate(()=>{
  demos[3].district='حي الفيحاء';
  state.ads.push({id:'v54-hidden',title:'إعلان مخفي',city:'الجبيل',district:'سر مخفي',
   category:'عقارات',status:'متاح',hidden:true,demo:false});
  state.ads.push({id:'v54-sold',title:'إعلان مباع',city:'الجبيل',district:'سر مباع',
   category:'عقارات',status:'مباع',hidden:false,demo:false});
 });
 await page.locator('#cityFilter').selectOption('الجبيل');
 const options=await page.evaluate(()=>window.SOOQAK_LOCATION_FILTERS.availableNeighborhoods('الجبيل'));
 expect(options).toEqual(['حي الفيحاء']);
 await page.locator('#cityFilter').selectOption('القطيف');
 await expect(page.locator('#sooqakDistrictSuggestions option')).toHaveCount(0);
});
