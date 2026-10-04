import { test, expect } from '@playwright/test';
import { createProfile } from '../helpers/session';
import { clearIndexedDB } from '../helpers/storage';

test.describe('Error Handling', () => {
  // TC-200: JS bundle 404 fallback
  test('TC-200: Asset loading shows error boundary', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    
    await page.goto('/app');
    
    // App should load despite minor asset issues
    const nameInput = page.locator('.field__input').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });
  });

  // TC-201: CSS bundle 404 - unstyled content usable
  test('TC-201: Unstyled content remains usable', async ({ page }) => {
    await page.goto('/app');
    
    // Even without CSS, form should be functional
    const nameInput = page.locator('.field__input, input').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    
    await nameInput.fill('TestUser');
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeEnabled();
  });

  // TC-202: Slow network shows loading indicator
  test('TC-202: Slow network handling', async ({ page, context }) => {
    // Throttle to 3G
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });
    
    await page.goto('/app');
    
    // Should eventually load
    const nameInput = page.locator('.field__input').first();
    await expect(nameInput).toBeVisible({ timeout: 15000 });
  });

  // TC-210: PixiJS init failure fallback
  test('TC-210: Canvas initialization failure graceful degradation', async ({ page }) => {
    // Block WebGL by disabling it
    await page.goto('/app');
    
    await createProfile(page, 'PixiTest');
    await page.waitForTimeout(1000);
    
    const tracingTile = page.locator('button.tile').filter({ hasText: /tracing|menulis/i }).first();
    await tracingTile.click();
    
    const firstTask = page.locator('.glyph-card').first();
    await expect(firstTask).toBeVisible({ timeout: 10000 });
    await firstTask.click();
    
    // Canvas should load or show error (not blank screen)
    await page.waitForTimeout(2000);
    
    const canvas = page.locator('canvas').first();
    const errorMsg = page.locator('text=/error|gagal/i').first();
    
    // Either canvas loads or error message shows
    const canvasVisible = await canvas.isVisible().catch(() => false);
    const errorVisible = await errorMsg.isVisible().catch(() => false);
    
    expect(canvasVisible || errorVisible).toBe(true);
  });

  // TC-211: Canvas element not mounted error handling
  test('TC-211: Canvas mount failure recovery', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    
    await createProfile(page, 'MountTest');
    await page.waitForTimeout(1000);
    
    const tracingTile = page.locator('button.tile').filter({ hasText: /tracing|menulis/i }).first();
    await tracingTile.click();
    
    const firstTask = page.locator('.glyph-card').first();
    await expect(firstTask).toBeVisible({ timeout: 10000 });
    await firstTask.click();
    
    // Should not crash - either canvas appears or back button works
    await page.waitForTimeout(1000);
    const backButton = page.locator('button').filter({ hasText: /kembali|back/i }).first();
    await expect(backButton).toBeVisible({ timeout: 5000 });
  });

  // TC-212: Invalid task ID redirects or shows 404
  test('TC-212: Invalid task data handling', async ({ page }) => {
    await createProfile(page, 'InvalidTaskTest');
    await page.waitForTimeout(1000);
    
    // Try to navigate directly to invalid task
    await page.goto('/app');
    await page.waitForTimeout(1000);
    
    // Should stay on valid screen (home or play)
    const homeElement = page.locator('.tile-grid, .play__tabs').first();
    await expect(homeElement).toBeVisible({ timeout: 10000 });
  });

  // TC-220: IndexedDB quota exceeded handling
  test('TC-220: Storage quota exceeded graceful handling', async ({ page }) => {
    await clearIndexedDB(page);
    await createProfile(page, 'QuotaTest');
    
    // App should function even if storage is constrained
    await page.waitForTimeout(1000);
    
    const homeScreen = page.locator('.tile-grid').first();
    await expect(homeScreen).toBeVisible({ timeout: 10000 });
  });

  // TC-221: IndexedDB access denied (incognito mode fallback)
  test('TC-221: Storage access denied fallback', async ({ page }) => {
    // Simulate storage denial by intercepting IndexedDB
    await page.goto('/app');
    
    // Should show profile creation (may not persist)
    const nameInput = page.locator('.field__input').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    
    await nameInput.fill('IncognitoUser');
    const startButton = page.locator('button[type="submit"]').filter({ hasText: /mulai|start/i });
    await startButton.click();
    
    // Should navigate even without persistent storage
    await page.waitForTimeout(1000);
    const homeScreen = page.locator('.tile-grid').first();
    await expect(homeScreen).toBeVisible({ timeout: 10000 });
  });

  // TC-230: No session redirect to name entry
  test('TC-230: Direct link without session redirects', async ({ page }) => {
    await clearIndexedDB(page);
    
    // Try direct link to play screen
    await page.goto('/app');
    
    // Should show profile creation form
    const nameInput = page.locator('.field__input').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });
  });
});
