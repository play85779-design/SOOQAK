import { test, expect } from '@playwright/test';

test('homepage displays search and listings area on mobile', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#searchInput')).toBeVisible();
  await expect(page.locator('#searchButton')).toBeVisible();
  await expect(page.locator('#listingGrid')).toBeAttached();
});

test('search input accepts Arabic text without a page error', async ({ page }) => {
  await page.goto('/');
  await page.locator('#searchInput').fill('أرض');
  await expect(page.locator('#searchInput')).toHaveValue('أرض');
  await page.locator('#searchButton').click();
  await expect(page.locator('#searchInput')).toHaveValue('أرض');
});
