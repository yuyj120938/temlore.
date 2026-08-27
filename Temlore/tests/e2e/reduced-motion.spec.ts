import { test, expect } from '@playwright/test';
test('reduced motion still exposes the home action', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await page.waitForTimeout(100);
  await expect(page.getByText('Start writing')).toBeVisible();
  await context.close();
});
