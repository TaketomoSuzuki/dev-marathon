import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  const randomPhone = '0' + Math.floor(100000000 + Math.random() * 900000000).toString();
  await page.goto('http://dev.marathon.rplearn.net/taketomo_suzuki/customer/add.html');
  await page.getByRole('textbox', { name: '会社名:' }).click();
  await page.getByRole('textbox', { name: '会社名:' }).fill('ホゲホゲ海運会社');
  await page.getByRole('textbox', { name: '会社名:' }).press('ArrowDown');
  await page.getByRole('textbox', { name: '業種:' }).click();
  await page.getByRole('textbox', { name: '業種:' }).click();
  await page.getByRole('textbox', { name: '業種:' }).click();
  await page.getByRole('textbox', { name: '業種:' }).fill('運送業');
  await page.getByRole('textbox', { name: '連絡先:' }).click();
  await page.getByRole('textbox', { name: '連絡先:' }).fill(randomPhone);
  await page.getByRole('textbox', { name: '連絡先:' }).press('Enter');
  await page.getByRole('textbox', { name: '所在地:' }).click();
  await page.getByRole('textbox', { name: '所在地:' }).fill('横浜');
  await page.getByRole('button', { name: '送信' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page).toHaveURL(/.*list\.html/);
});