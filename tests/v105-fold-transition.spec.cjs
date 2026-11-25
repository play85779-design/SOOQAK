const {test,expect}=require('@playwright/test');

// Same browser tab throughout: folding/unfolding must not reset the selected
// listing or the locally saved heart. This is a viewport simulation, not
// physical Galaxy Fold certification and never touches a live backend.
test('V105 fold transition preserves laptop detail, gallery and favorite',async({page})=>{
  await page.setViewportSize({width:330,height:760});
  await page.goto('/v101/index.html#home',{waitUntil:'domcontentloaded'});
  await page.locator('[data-detail="laptop"]').first().click();
  const image=page.locator('.detail-primary-image');
  const heart=page.locator('.detail-fav');
  await expect(image).toHaveAttribute('src','./assets/laptop-photo.jpg');
  await expect(heart).toHaveAttribute('aria-pressed','false');
  await heart.click();
  for(const width of [330,790,1180,390,330]){
    await page.setViewportSize({width,height:880});
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('src','./assets/laptop-photo.jpg');
    await expect(heart).toHaveAttribute('aria-pressed','true');
    await expect(heart).toHaveClass(/is-saved/);
    await expect(page.locator('.detail-thumb')).toHaveCount(1);
    await expect.poll(()=>image.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
    const sizes=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth-innerWidth,
      pin:document.querySelector('.detail-location svg').getBoundingClientRect().width,
      gallery:document.querySelector('.detail-hero').getBoundingClientRect().height
    }));
    expect(sizes.overflow).toBeLessThanOrEqual(2);
    expect(sizes.pin).toBeLessThanOrEqual(20);
    expect(sizes.gallery).toBeLessThanOrEqual(310);
  }
  await page.locator('button[data-go="favorites"]:visible').first().click();
  await expect(page.locator('.card')).toHaveCount(1);
  await page.locator('[data-detail="laptop"]').first().click();
  await expect(heart).toHaveAttribute('aria-pressed','true');
  await heart.click();
  await page.locator('button[data-go="favorites"]:visible').first().click();
  await expect(page.locator('.card')).toHaveCount(0);
});
