const {test,expect}=require('@playwright/test');
for(const width of [390,790]){
 test('V140 multiple local stores and safe inputs at '+width,async({page})=>{
  const writes=[];page.on('request',r=>{if(r.method()!=='GET'||r.url().includes('supabase.co'))writes.push(r.url())});
  await page.setViewportSize({width,height:940});
  await page.goto('/v101/index.html#create-store');
  await page.locator('#store-name').fill('   ');
  await page.getByRole('button',{name:/معاينة متجري/}).click();
  await expect(page.locator('#store-setup-error')).toContainText('3 أحرف');
  await page.locator('#store-name').fill('متجر تجريبي للمنزل');
  await page.locator('#store-section').selectOption('المنزل');
  await page.locator('#store-description').fill('<b>وصف تجريبي</b>');
  await page.getByRole('button',{name:/معاينة متجري/}).click();
  await expect(page.locator('.my-store-page')).toContainText('متجر تجريبي للمنزل');
  await expect(page.locator('.my-store-page .interior-hero p')).toContainText('<b>وصف تجريبي</b>');
  await expect(page.locator('.my-store-page .interior-hero p b')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  await page.locator('.my-store-page [data-go="my-stores"]').click();
  await page.locator('[data-new-store]').click();
  await page.locator('#store-name').fill('متجر آخر');
  await page.getByRole('button',{name:/معاينة متجري/}).click();
  await page.locator('.my-store-page [data-go="my-stores"]').click();
  await expect(page.locator('.owned-store')).toHaveCount(2);
  await expect(page.locator('.owned-store-grid')).toContainText('متجر تجريبي للمنزل');
  await expect(page.locator('.owned-store-grid')).toContainText('متجر آخر');
  await page.reload();
  await expect(page.locator('.owned-store')).toHaveCount(0);
  expect(writes).toEqual([]);
 });
}
