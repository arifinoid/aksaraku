import { type Page, expect } from '@playwright/test';

export async function createProfile(page: Page, name: string) {
  await page.goto('/app');
  const nameInput = page.locator('.field__input, input.field__input').first();
  await expect(nameInput).toBeVisible({ timeout: 10000 });
  await nameInput.fill(name);
  const startButton = page.locator('button[type="submit"]').filter({ hasText: /mulai|start/i });
  await expect(startButton).toBeEnabled();
  await startButton.click();
}

export async function waitForProfileList(page: Page) {
  await expect(page.locator('text=/profil|profile/i').first()).toBeVisible({ timeout: 10000 });
}

export async function selectExistingProfile(page: Page, name: string) {
  await page.goto('/');
  await waitForProfileList(page);
  await page.locator(`button:has-text("${name}")`).click();
}
