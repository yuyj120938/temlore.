import { test, expect } from '@playwright/test';
test('letter lifecycle surface is reachable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await page.waitForTimeout(3100);
  await expect(page.getByText('Start writing')).toBeVisible();
});

test('writes text around a photo and opens it in the same order', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('temlore.session', JSON.stringify({ email: 'one@example.com' }));
  });
  await page.goto('/');
  await page.getByText('Start writing').waitFor({ timeout: 6000 });
  await page.getByText('Start writing').click();
  const first = page.getByLabel('文字段落1');
  await first.fill('照片上面照片下面');
  await first.evaluate((node: HTMLTextAreaElement) => {
    node.setSelectionRange(4, 4);
    node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.getByLabel('上传照片').setInputFiles({
    name: 'memory.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n0kAAAAASUVORK5CYII=', 'base64'),
  });
  await expect(page.getByLabel('文字段落1')).toHaveValue('照片上面');
  await expect(page.getByLabel('文字段落2')).toHaveValue('照片下面');
  await page.getByLabel('文字段落2').fill('照片下面的新文字');
  await page.locator('.editor-done').click();
  await page.getByRole('button', { name: '10 秒' }).click();
  await page.getByText('确认封存时间').click();
  await page.getByText('Start writing').waitFor({ timeout: 8000 });
  await page.getByText('A letter has arrived.').waitFor({ timeout: 15000 });
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('temlore.letters.one@example.com') || '[]')[0]);
  expect(stored.blocks.map((block: { type: string }) => block.type)).toEqual(['text', 'photo', 'text']);
  expect(stored).not.toHaveProperty('body');
  await page.getByRole('button', { name: '打开抽屉' }).click({ force: true });
  await page.getByRole('button', { name: '打开中央抽屉' }).click();
  await expect(page.getByTestId('reader-flow')).toBeVisible();
  const flowText = await page.getByTestId('reader-flow').locator(':scope > *').allTextContents();
  expect(flowText).toEqual(['照片上面', '', '照片下面的新文字']);
  await expect(page.getByAltText('信件照片1')).toBeVisible();
  await page.locator('.reader-screen header button').click();
  await page.getByText('Start writing').click();
  await expect(page.getByLabel('文字段落1')).toHaveValue('');
});
