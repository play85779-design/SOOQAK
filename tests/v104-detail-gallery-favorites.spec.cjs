const {test,expect}=require('@playwright/test');

test('V104 detail photo fits within the page and location icon never expands',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/v101/index.html#home',{waitUntil:'domcontentloaded'});
 await page.locator('[data-detail="laptop"]').first().click();
 await expect(page.locator('.detail-gallery')).toBeVisible();
 await expect(page.locator('.detail-thumb')).toHaveCount(1);
 await expect(page.locator('.detail-primary-image')).toHaveAttribute('src','./assets/laptop.svg');
 const sizes=await page.evaluate(()=>{
  const image=document.querySelector('.detail-primary-image');
  const pin=document.querySelector('.detail-location svg');
  const gallery=document.querySelector('.detail-hero');
  return {imageLoaded:image.complete&&image.naturalWidth>0, pinW:pin.getBoundingClientRect().width,pinH:pin.getBoundingClientRect().height,galleryH:gallery.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth-innerWidth};
 });
 expect(sizes.imageLoaded).toBe(true);
 expect(sizes.pinW).toBeLessThanOrEqual(20);
 expect(sizes.pinH).toBeLessThanOrEqual(20);
 expect(sizes.galleryH).toBeLessThanOrEqual(310);
 expect(sizes.overflow).toBeLessThanOrEqual(2);
});

test('V104 detail favorite fills and un-fills and matches cards/favorites page',async({page})=>{
 await page.goto('/v101/index.html#home',{waitUntil:'domcontentloaded'});
 await page.locator('[data-detail="phone"]').first().click();
 const heart=page.locator('.detail-fav');
 await expect(heart).toHaveAttribute('aria-pressed','false');
 await heart.click();
 await expect(page.locator('.detail-fav')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.detail-fav')).toHaveClass(/is-saved/);
 await expect(page.locator('.detail-fav')).toContainText('محفوظ');
 await page.locator('button[data-go="favorites"]:visible').first().click();
 await expect(page.locator('.card')).toHaveCount(1);
 await page.locator('[data-detail="phone"]').first().click();
 await expect(page.locator('.detail-fav')).toHaveAttribute('aria-pressed','true');
 await page.locator('.detail-fav').click();
 await expect(page.locator('.detail-fav')).toHaveAttribute('aria-pressed','false');
 await expect(page.locator('.detail-fav')).toContainText('حفظ');
});

test('V104 account entry is visible and login signup recovery tabs are editable with local-only test data',async({page})=>{
 await page.setViewportSize({width:330,height:760});
 await page.goto('/v101/index.html#home',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.header-auth-btn')).toBeVisible();
 await page.locator('.header-auth-btn').click();
 await expect(page.locator('.auth-preview-page')).toBeVisible();
 await page.locator('.auth-tabs button[data-auth-mode="signup"]').click();
 await expect(page.locator('.auth-preview-page h1')).toHaveText('إنشاء حساب سوقك');
 await expect(page.locator('#auth-email-preview')).toBeEditable();
 await page.getByRole('button',{name:/نسيت كلمة المرور/}).click();
 await expect(page.locator('.auth-preview-page h1')).toHaveText('استعادة كلمة المرور');
 await page.getByRole('button',{name:'تعبئة بيانات اختبار جاهزة'}).click();
 await page.locator('.auth-explain').click();
 await expect(page.getByRole('dialog')).toContainText('التسجيل غير مفعل');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 expect(overflow).toBeLessThanOrEqual(2);
});

test('V104 messaging teaser does not fake a real message',async({page})=>{
 await page.goto('/v101/index.html#detail',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:/استكشف المراسلة/}).click();
 await expect(page.locator('.screen-title h1')).toHaveText('رسائلي');
 await expect(page.locator('.account-empty')).toContainText('المراسلة الحقيقية');
});

for(const width of [330,390,790,1180]){
 test('V104 detail gallery fits without horizontal scrolling at '+width,async({page})=>{
  await page.setViewportSize({width,height:880});
  await page.goto('/v101/index.html#detail',{waitUntil:'domcontentloaded'});
  const r=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,pinWidth:document.querySelector('.detail-location svg').getBoundingClientRect().width,galleryHeight:document.querySelector('.detail-hero').getBoundingClientRect().height}));
  expect(r.overflow).toBeLessThanOrEqual(2);
  expect(r.pinWidth).toBeLessThanOrEqual(20);
  expect(r.galleryHeight).toBeLessThanOrEqual(310);
 });
}
