import { test, expect } from '@playwright/test';

test('intro settles into home and Sign opens the revised login', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto('/');
  await page.waitForTimeout(3200);
  const sign = page.getByRole('button', { name: 'Sign' });
  await expect(sign).toBeVisible();
  await sign.click();
  await expect(page.getByText('SIGN IN')).toBeVisible();
  await expect(page.getByText('邮箱', { exact: true })).toBeVisible();
});
