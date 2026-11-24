const {test,expect}=require('@playwright/test');
for(const width of [330,390,790,1180]){
 test('V108 compact bright auth and editable controls at '+width,async({page})=>{
  await page.setViewportSize({width,height:844});
  await page.goto('/v101/index.html#auth');
  await expect(page.locator('#auth-email-preview')).toBeEditable();
  await expect(page.locator('#auth-password-preview')).toBeEditable();
  await page.locator('#auth-email-preview').fill('demo@example.invalid');
  await page.locator('#auth-password-preview').fill('Demo1234');
  await page.getByRole('button',{name:'إظهار كلمة المرور التجريبية'}).click();
  await expect(page.locator('#auth-password-preview')).toHaveAttribute('type','text');
  const metrics=await page.evaluate(()=>({height:document.querySelector('.auth-intro').getBoundingClientRect().height,overflow:document.documentElement.scrollWidth-innerWidth,theme:document.querySelector('meta[name=theme-color]').content,formNames:document.querySelectorAll('#auth-demo-form [name]').length}));
  expect(metrics.height).toBeLessThan(150);expect(metrics.overflow).toBeLessThanOrEqual(2);expect(metrics.theme).toBe('#ffffff');expect(metrics.formNames).toBe(0);
  await page.locator('.auth-explain').click();
  await expect(page.getByRole('dialog')).toContainText('التسجيل غير مفعل');
  await expect(page.locator('#auth-email-preview')).toHaveValue('');
  await expect(page.locator('#auth-password-preview')).toHaveValue('');
 });
}
test('V108 non-test address is refused and cleared; no backend request',async({page})=>{
 const sensitiveRequests=[];page.on('request',req=>{if(req.method()!=='GET'||req.url().includes('supabase.co'))sensitiveRequests.push(req.url())});
 await page.goto('/v101/index.html#auth');
 await page.locator('#auth-email-preview').fill('person@example.com');
 await page.locator('#auth-password-preview').fill('Demo1234');
 await page.locator('.auth-explain').click();
 await expect(page.locator('#auth-demo-error')).toContainText('تعبئة بيانات اختبار جاهزة');
 await expect(page.locator('#auth-email-preview')).toHaveValue('');
 await expect(page.locator('#auth-password-preview')).toHaveValue('');
 expect(sensitiveRequests).toEqual([]);
});
