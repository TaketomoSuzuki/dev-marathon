import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://dev.marathon.rplearn.net/taketomo_suzuki/customer/add.html');
  await page.getByRole('button', { name: '送信' }).click();
  await expect(page).toHaveURL(/add\.html$/);
});