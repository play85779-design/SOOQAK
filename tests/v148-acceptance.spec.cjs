const {test,expect}=require('@playwright/test');
const base='/v101/index.html';
const routes=['home','listings','stores','store','post','favorites','account','auth','my-ads','messages','detail','create-store','services','my-stores','notifications','welcome','role'];
for(const width of [360,790,1280]){
 test('V148 route layout and no remote writes '+width,async({page})=>{
  const errors=[],writes=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',r=>{if(!['GET','HEAD'].includes(r.method())||r.url().includes('supabase.co'))writes.push(r.url())});
  await page.setViewportSize({width,height:900});
  for(const route of routes){
   await page.goto(base+'#'+route);
   await expect(page.locator('#app main')).toBeVisible();
   await expect(page.locator('#app main')).not.toBeEmpty();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),route).toBeLessThanOrEqual(2);
  }
  expect(errors).toEqual([]);expect(writes).toEqual([]);
 });
}
test('V148 search preserves filter and detail returns to favorites',async({page})=>{
 await page.goto(base+'#listings');
 await page.locator('[data-filter="إلكترونيات"]').click();
 await page.locator('#search input[name=q]').fill('هاتف');
 await page.locator('#search button[type=submit]').click();
 await expect(page.locator('[data-filter="إلكترونيات"]')).toHaveClass(/active/);
 await expect(page.locator('.search-primary .card')).toHaveCount(1);
 await page.locator('.search-primary .card-heart').click();
 await page.locator('.bottom [data-go="favorites"]').click();
 await page.locator('.favorites-page .card-content').first().click();
 await page.locator('[data-action="back-detail"]').click();
 await expect(page.locator('.favorites-page')).toBeVisible();
});
test('V148 advanced filter keyboard escape and responsive resize',async({page})=>{
 await page.setViewportSize({width:360,height:800});
 await page.goto(base+'#home');
 await page.locator('.search-filter-btn').click();
 await expect(page.locator('.filter-dialog')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('.filter-dialog')).toHaveCount(0);
 await page.locator('#search input[name=q]').fill('شاشة كبيرة');
 for(const width of [790,360,1280,390]){
  await page.setViewportSize({width,height:900});
  await expect(page.locator('#search input[name=q]')).toHaveValue('شاشة كبيرة');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
 }
});
