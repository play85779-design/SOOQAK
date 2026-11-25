const {test,expect}=require('@playwright/test');
const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/9o8AAAAASUVORK5CYII=','base64');
for(const width of [330,390,790,1180]){
 test('V109 header is compact even on empty search at '+width,async({page})=>{
  await page.setViewportSize({width,height:940});
  await page.goto('/v101/index.html#listings');
  await page.locator('#search input').fill('مناديل');
  await page.locator('#search button').click();
  await expect(page.locator('.empty-search')).toBeVisible();
  const sizes=await page.evaluate(()=>({header:document.querySelector('.top').getBoundingClientRect().height,gap:document.querySelector('.main').getBoundingClientRect().top-document.querySelector('.top').getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth-innerWidth}));
  expect(sizes.header).toBeLessThanOrEqual(85);expect(sizes.gap).toBeLessThanOrEqual(3);expect(sizes.overflow).toBeLessThanOrEqual(2);
 });
}
test('V109 owner journey: add tissues, search, open image, favorite and verify reset without network writes',async({page})=>{
 const writes=[];page.on('request',r=>{if(r.method()!=='GET'||r.url().includes('supabase.co'))writes.push(r.url())});
 await page.setViewportSize({width:790,height:940});
 await page.goto('/v101/index.html#post');
 await page.locator('#preview-images').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:image});
 await page.locator('[data-post-next]').click();
 await page.locator('#post-title').fill('مناديل');
 await page.locator('#post-desc').fill('مناديل لمسات راقية جودة قوية');
 await page.locator('#post-price').fill('60');
 await page.locator('#post-cat').selectOption('أخرى');
 await page.locator('#post-region').selectOption('المنطقة الشرقية');
 await page.locator('#post-city').selectOption('الجبيل');
 await page.locator('[data-post-next]').click();
 await expect(page.locator('.wizard-summary-info')).toContainText('60');
 await page.locator('[data-post-preview]').click();
 await expect(page.getByRole('dialog')).toContainText('لم يُنشر للعامة');
 await page.getByRole('button',{name:'فهمت'}).click();
 await expect(page.locator('.card')).toHaveCount(1);
 await expect(page.locator('.card')).toContainText('مناديل');
 await page.locator('button[data-go="home"]:visible').first().click();
 await page.locator('#search input').fill('لمسات راقية');
 await page.locator('#search button').click();
 await expect(page.locator('.card')).toHaveCount(1);
 await expect(page.locator('.card')).toContainText('الجبيل');
 await page.locator('.card-photo button[data-detail]').click();
 await expect(page.locator('.detail-primary-image')).toHaveAttribute('src',/^blob:/);
 await expect(page.locator('.detail-box')).toContainText('60');
 await page.locator('.detail-fav').click();
 await page.locator('button[data-go="favorites"]:visible').first().click();
 await expect(page.locator('.card')).toHaveCount(1);
 await expect(page.locator('.card')).toContainText('مناديل');
 await page.reload();
 await expect(page.locator('.card')).toHaveCount(0);
 expect(writes).toEqual([]);
});
