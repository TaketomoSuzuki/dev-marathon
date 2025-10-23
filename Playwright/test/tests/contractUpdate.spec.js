import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  const randomPhone = '0' + Math.floor(100000000 + Math.random() * 900000000).toString();
  await page.goto('http://dev.marathon.rplearn.net/taketomo_suzuki/customer/list.html');
  await page.getByRole('row', { name: '**** 食品商社 0000000000 東京' }).getByRole('link').click();
  await page.getByRole('link', { name: '編集する' }).click();
  await page.getByRole('textbox', { name: '連絡先:' }).click();
  await page.getByRole('textbox', { name: '連絡先:' }).fill(randomPhone);
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page).toHaveURL(/.*update\.html/);
});