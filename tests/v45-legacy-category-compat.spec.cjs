const {test,expect}=require('@playwright/test');
// V45: regression checks against a simulated set of pre-V41 listings.
// No live account, customer database, email or real API is touched.
async function seed(page){
 await page.route('**/cloud.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// V45 offline compatibility regression'}));
 await page.goto('/index.html');
 await page.evaluate(()=>{
   const labels=['سيارات','عقارات','إلكترونيات','أثاث ومنزل','خدمات','حيوانات','مستلزمات شخصية','معدات وآليات','أخرى'];
   const titles=['سيارة سيدان قديمة','أرض في حي جديد','جوال مستعمل','كنب مجلس','خدمة سباكة','أغنام للبيع','عطر أصلي','حفار معدات','كتب قديمة'];
   state.ads=labels.map((category,i)=>({
     id:'legacy-v45-'+i,title:titles[i],description:'إعلان قديم بدون حقول القسم الفرعي',
     category,city:'الجبيل',district:'',status:'متاح',createdAt:'2026-11-10T12:00:00Z',
     expiresAt:'2027-12-01T00:00:00Z',price:1000,priceType:'ثابت',
     kind:'بيع',seller:'بائع سابق',emoji:'📦',color:'blue',demo:false
   }));
   render();
 });
}
test('V45 keeps original parent classification for all nine historical listing types',async({page})=>{
 await seed(page);
 const parents=await page.evaluate(()=>window.SOOQAK_CATEGORY_TREE.map(x=>x.name));
 expect(parents).toHaveLength(9);
 for(let i=0;i<parents.length;i++){
   await page.locator('#categoryCards [data-category]').filter({hasText:parents[i]}).click();
   await expect(page.locator('#listingGrid [data-open="legacy-v45-'+i+'"]')).toBeVisible();
 }
});
test('V45 previous ads without subcategory remain searchable through the new filter',async({page})=>{
 await seed(page);
 await page.locator('#filterToggle').click();
 await page.locator('#categoryFilter').selectOption('سيارات');
 await page.locator('#subcategoryFilter').selectOption('سيدان');
 await expect(page.locator('#listingGrid [data-open="legacy-v45-0"]')).toHaveCount(1);
 await page.locator('#categoryFilter').selectOption('عقارات');
 await expect(page.locator('#subcategoryFilter')).toHaveValue('');
 await expect(page.locator('#listingGrid [data-open="legacy-v45-1"]')).toHaveCount(1);
});
test('V45 legacy records retain category values after browsing and reset',async({page})=>{
 await seed(page);
 await page.locator('#categoryCards [data-category="سيارات"]').click();
 await page.locator('#showAllCats').click();
 await expect(page.locator('#categoryFilter')).toHaveValue('');
 const snapshot=await page.evaluate(()=>state.ads.map(x=>({id:x.id,category:x.category,hasSubcategory:Object.hasOwn(x,'subcategory')})));
 expect(snapshot).toHaveLength(9);
 expect(snapshot.every(x=>!x.hasSubcategory)).toBe(true);
 expect(snapshot.map(x=>x.category)).toEqual(['سيارات','عقارات','إلكترونيات','أثاث ومنزل','خدمات','حيوانات','مستلزمات شخصية','معدات وآليات','أخرى']);
});
