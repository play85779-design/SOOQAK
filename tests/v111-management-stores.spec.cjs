const {test,expect}=require('@playwright/test');
const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/9o8AAAAASUVORK5CYII=','base64');
test('V111 edit local listing, search, favorite and remove with confirmation',async({page})=>{
 const writes=[];page.on('request',r=>{if(r.method()!=='GET'||r.url().includes('supabase.co'))writes.push(r.url())});
 await page.goto('/v101/index.html#post');
 await page.locator('#preview-images').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:image});
 await page.locator('[data-post-next]').click();
 await page.locator('#post-title').fill('مناديل');
 await page.locator('#post-price').fill('63');
 await page.locator('#post-region').selectOption('منطقة تبوك');
 await page.locator('#post-city').selectOption('تبوك');
 await page.locator('[data-post-next]').click();
 await page.locator('[data-post-preview]').click();
 await page.getByRole('button',{name:'فهمت'}).click();
 await expect(page.locator('.ads-stats strong')).toHaveText(['1','0','0']);
 await page.getByRole('button',{name:'تعديل',exact:true}).click();
 await page.locator('#edit-title').fill('مناديل ناعمة');
 await page.locator('#edit-price').fill('360');
 await page.getByRole('button',{name:'حفظ التعديل'}).click();
 await expect(page.locator('.managed-unit')).toContainText('360');
 await page.locator('.card-heart').click();
 await page.locator('button[data-go="home"]:visible').first().click();
 await page.locator('#search input').fill('مناديل');
 await page.locator('#search button').click();
 await expect(page.locator('.feed-head')).toContainText('مناديل');
 await expect(page.locator('.card')).toHaveCount(1);
 await expect(page.locator('.card')).toContainText('360');
 await page.locator('button[data-go="account"]:visible').first().click();
 await page.locator('.account-quick-card[data-go="my-ads"]').click();
 await page.getByRole('button',{name:'حذف',exact:true}).click();
 await page.getByRole('button',{name:'إلغاء',exact:true}).click();
 await expect(page.locator('.managed-unit')).toHaveCount(1);
 await page.getByRole('button',{name:'حذف',exact:true}).click();
 await page.getByRole('button',{name:'تأكيد الحذف'}).click();
 await expect(page.locator('.ads-stats strong')).toHaveText(['0','0','0']);
 await page.locator('button[data-go="favorites"]:visible').first().click();
 await expect(page.locator('.card')).toHaveCount(0);
 expect(writes).toEqual([]);
});
for(const [id,name,count] of [['tech','متجر التقنية',2],['home','متجر المنزل',1],['cars','متجر السيارات',1]]){
 test('V111 distinct store '+id,async({page})=>{
  await page.goto('/v101/index.html#stores');
  await page.locator('[data-shop="'+id+'"]').click();
  await expect(page.locator('.store-cover h2')).toHaveText(name);
  await expect(page.locator('.card')).toHaveCount(count);
  await page.reload();
  await expect(page.locator('.store-cover h2')).toHaveText(name);
 });
}
test('V111 store intro opens an actual sample instead of unavailable modal',async({page})=>{
 await page.goto('/v101/index.html#create-store');
 await page.getByRole('button',{name:/شاهد نموذج متجر/}).click();
 await expect(page.locator('.store-cover')).toBeVisible();
 await expect(page.getByRole('dialog')).toHaveCount(0);
});
