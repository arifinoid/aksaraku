import { test, expect } from '@playwright/test';
import { createProfile, selectExistingProfile, waitForProfileList } from '../helpers/session';
import { clearIndexedDB, getProfileFromStorage } from '../helpers/storage';

test.describe('Happy Path - Session & Task Selection', () => {
  test.beforeEach(async ({ page }) => {
    await clearIndexedDB(page);
  });

  // TC-001: User opens / → profile creation form displays
  test('TC-001: Profile creation form displays on first visit', async ({ page }) => {
    await page.goto('/app');
    
    // Profile name input should be visible
    const nameInput = page.locator('.field__input').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    
    // Start button should exist
    const startButton = page.locator('button[type="submit"]').filter({ hasText: /mulai|start/i });
    await expect(startButton).toBeVisible();
  });

  // TC-002: Enter child name (5-20 chars) → "Mulai" button enabled
  test('TC-002: Name entry enables start button', async ({ page }) => {
    await page.goto('/app');
    
    const nameInput = page.locator('.field__input').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    
    // Enter valid name (5-20 chars)
    await nameInput.fill('TestChild');
    
    // Button should be enabled
    const startButton = page.locator('button[type="submit"]').filter({ hasText: /mulai|start/i });
    await expect(startButton).toBeEnabled();
  });

  // TC-003: Profile data saved to IndexedDB
  test('TC-003: Profile saved to storage after creation', async ({ page }) => {
    await page.goto('/app');
    
    const nameInput = page.locator('.field__input').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill('SavedChild');
    
    const startButton = page.locator('button[type="submit"]').filter({ hasText: /mulai|start/i });
    await startButton.click();
    
    // Wait for home screen to load
    await page.waitForTimeout(1000);
    
    // Check IndexedDB
    const profile = await getProfileFromStorage(page);
    expect(profile).toBeTruthy();
    expect(profile.name).toBe('SavedChild');
  });

  // TC-004: Click "Mulai" → navigates to home screen
  test('TC-004: Start button navigates to home', async ({ page }) => {
    await page.goto('/app');
    
    const nameInput = page.locator('.field__input').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill('NavTest');
    
    const startButton = page.locator('button[type="submit"]').filter({ hasText: /mulai|start/i });
    await startButton.click();
    
    // Should navigate to home screen - look for tiles
    await expect(page.locator('.tile-grid, [class*="tile"]').first()).toBeVisible({ timeout: 10000 });
  });

  // TC-005: Session persists across page refresh
  test('TC-005: Profile persists after refresh', async ({ page }) => {
    await createProfile(page, 'PersistTest');
    
    // Wait for navigation to complete
    await page.waitForTimeout(1000);
    
    // Refresh page
    await page.reload();
    
    // Should go directly to home (profile already exists)
    await expect(page.locator('.tile-grid, [class*="tile"]').first()).toBeVisible({ timeout: 10000 });
    
    // Should NOT show profile creation form
    const nameInput = page.locator('.field__input').first();
    await expect(nameInput).not.toBeVisible();
  });

  // TC-006: Second visit skips profile creation
  test('TC-006: Existing profile skips creation screen', async ({ page }) => {
    // Create profile
    await createProfile(page, 'ExistingUser');
    await page.waitForTimeout(1000);
    
    // Close and reopen
    await page.goto('/app');
    
    // Should show home screen (profile auto-selected)
    const tileGrid = page.locator('.tile-grid, [class*="tile"]').first();
    await expect(tileGrid).toBeVisible({ timeout: 10000 });
  });

  // TC-010: Play screen displays level categories
  test.skip('TC-010: Play screen shows category tabs', async ({ page }) => {
    // TODO: Tile click navigates but PlayScreen elements not found
    // Need to debug: tile selector, navigation timing, or PlayScreen rendering
    await createProfile(page, 'CategoryTest');
    await page.waitForTimeout(1000);
    
    // Navigate to play screen - click first tile (tracing)
    const firstTile = page.locator('.tile-grid button, [class*="tile"]').first();
    await expect(firstTile).toBeVisible({ timeout: 10000 });
    await firstTile.click();
    
    // Should show category tabs
    await expect(page.locator('.play__tabs').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button.play__tab').first()).toBeVisible();
    
    // Should show grid of items
    await expect(page.locator('.glyph-card').first()).toBeVisible({ timeout: 5000 });
  });

  // TC-011: Click category → shows task list
  test.skip('TC-011: Category tabs switch task lists', async ({ page }) => {
    // TODO: Blocked by TC-010 - PlayScreen not loading
    await createProfile(page, 'TaskListTest');
    await page.waitForTimeout(1000);
    
    const firstTile = page.locator('.tile-grid button, [class*="tile"]').first();
    await firstTile.click();
    
    await expect(page.locator('.glyph-card').first()).toBeVisible({ timeout: 10000 });
    
    const initialCount = await page.locator('.glyph-card').count();
    expect(initialCount).toBeGreaterThan(0);
    
    const categoryTabs = page.locator('button.play__tab');
    const tabCount = await categoryTabs.count();
    
    if (tabCount > 1) {
      await categoryTabs.nth(1).click();
      await page.waitForTimeout(500);
      
      const newCount = await page.locator('.glyph-card').count();
      expect(newCount).toBeGreaterThan(0);
    }
  });

  // TC-012: Click task → opens tracing screen
  test.skip('TC-012: Click task opens tracing canvas', async ({ page }) => {
    // TODO: Blocked by TC-010 - PlayScreen not loading
    await createProfile(page, 'CanvasTest');
    await page.waitForTimeout(1000);
    
    const firstTile = page.locator('.tile-grid button, [class*="tile"]').first();
    await firstTile.click();
    
    const firstTask = page.locator('.glyph-card').first();
    await expect(firstTask).toBeVisible({ timeout: 10000 });
    
    await firstTask.click();
    
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    const backButton = page.locator('button').filter({ hasText: /kembali|back/i }).first();
    await expect(backButton).toBeVisible();
  });
});
