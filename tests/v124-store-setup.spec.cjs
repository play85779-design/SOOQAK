const {test,expect}=require('@playwright/test');
for(const width of [390,790]){
 test('V124 store setup local preview and reset at '+width,async({page})=>{
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
  const preview=page.locator('#local-store-preview');
  await expect(preview).toContainText('متجر تجريبي للمنزل');
  await expect(preview).toContainText('<b>وصف تجريبي</b>');
  await expect(preview.locator('b')).toHaveCount(0);
  await expect(preview).toContainText('غير منشور');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  await page.locator('#store-name').fill('متجر آخر');
  await expect(preview).toHaveCount(0);
  await page.getByRole('button',{name:/معاينة متجري/}).click();
  await expect(preview).toContainText('متجر آخر');
  await page.getByRole('button',{name:'مسح بيانات التجربة'}).click();
  await expect(page.locator('#store-name')).toHaveValue('');
  await expect(preview).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#store-name')).toHaveValue('');
  expect(writes).toEqual([]);
 });
}
