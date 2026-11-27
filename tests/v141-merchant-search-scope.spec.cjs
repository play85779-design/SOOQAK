const {test,expect}=require('@playwright/test');
const image={name:'demo.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF1kAAAAASUVORK5CYII=','base64')};
for(const width of [390,790]){
 test('V141 merchant listing, Arabic search scope and safe unlink '+width,async({page})=>{
  const writes=[];page.on('request',r=>{if(r.method()!=='GET'||r.url().includes('supabase.co'))writes.push(r.url())});
  await page.setViewportSize({width,height:940});
  await page.goto('/v101/index.html#create-store');
  await page.locator('#store-name').fill('متجر الاختبار');
  await page.locator('#store-description').fill('تجربة محلية');
  await page.getByRole('button',{name:/معاينة متجري/}).click();
  await page.locator('[data-post-store]').click();
  await page.locator('#preview-images').setInputFiles(image);
  await page.locator('[data-post-next]').click();
  await page.locator('#post-title').fill('شاشة كبيره');
  await page.locator('#post-desc').fill('شاشة 65 بوصة');
  await page.locator('#post-price').fill('3085');
  await page.locator('#post-cat').selectOption('إلكترونيات');
  await page.locator('#post-region').selectOption('منطقة المدينة المنورة');
  await page.locator('#post-city').selectOption('ينبع');
  await page.locator('[data-post-next]').click();
  await page.locator('[data-post-preview]').click();
  await expect(page.locator('.my-store-page')).toContainText('منتجات المتجر (1)');
  await page.locator('[data-unlink-id]').click();
  await expect(page.locator('.my-store-page')).toContainText('منتجات المتجر (0)');
  await expect(page.locator('.store-pick-item')).toContainText('شاشة كبيره');
  await page.locator('[data-attach-id]').click();
  await expect(page.locator('.my-store-page')).toContainText('منتجات المتجر (1)');
  await page.locator('.bottom [data-go="home"]').click();
  await page.locator('#region').selectOption('المنطقة الشرقية');
  await page.locator('#search input[name=q]').fill('شاشة كبيرة');
  await page.locator('#search button[type=submit]').click();
  await expect(page.locator('.scope-hint')).toContainText('نتائج مطابقة خارج الموقع المحدد');
  await page.locator('[data-action="expand-search-location"]').click();
  await expect(page.locator('.search-primary')).toContainText('شاشة كبيره');
  await expect(page.locator('#search input[name=q]')).toHaveValue('شاشة كبيرة');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  expect(writes).toEqual([]);
 });
}
