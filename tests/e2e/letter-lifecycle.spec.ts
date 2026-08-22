import { test, expect } from '@playwright/test';
test('letter lifecycle surface is reachable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await page.waitForTimeout(3100);
  await expect(page.getByText('Start writing')).toBeVisible();
});
