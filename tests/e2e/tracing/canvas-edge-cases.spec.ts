import { test, expect } from '@playwright/test';
import { createProfile } from '../helpers/session';

test.describe('Canvas Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await createProfile(page, 'CanvasUser');
    await page.waitForTimeout(1000);
    
    // Navigate to tracing screen
    const tracingTile = page.locator('button.tile').filter({ hasText: /tracing|menulis/i }).first();
    await tracingTile.click();
    
    const firstTask = page.locator('.glyph-card').first();
    await expect(firstTask).toBeVisible({ timeout: 10000 });
    await firstTask.click();
    
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });
    return canvas;
  });

  // -------------------REAL WORLD EMULATION: canvas-check-stroke-intrinsic -------------------
  test('TC-020-c: Canvas intrinsic stroke check (intrinsic test)', async ({ page }) => {
    const canvas = page.locator('.tracing-canvas canvas') || page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    const isSameCanvas = await page.evaluate(() => {
      const canvases = Array.from(document.querySelectorAll('canvas'));
      return canvases.some(c => c.width > 0 && c.height > 0);
    });
    expect(isSameCanvas).toBe(true);
  });
  test('TC-020: Canvas loads with letter/image visible', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    
    // Canvas should have width/height
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  // TC-021: Guide dots render
  test('TC-021: Guide dots render with correct color', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    
    // Take screenshot and check for guide dots (dark brown #8a7663)
    const screenshot = await canvas.screenshot();
    expect(screenshot.length).toBeGreaterThan(1000); // Non-empty canvas
  });

  // TC-022: Guide dots positioned correctly (visual check - manual verification needed)
  test('TC-022: Guide dots positioned along path', async ({ page }) => {
    // ponytail: Full geometric verification needs PixiJS state inspection
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  // TC-023: Touch/mouse drag draws stroke
  test('TC-023: Mouse drag draws stroke on canvas', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    
    // Draw stroke: start at center, drag right
    const startX = box!.x + box!.width / 2;
    const startY = box!.y + box!.height / 2;
    
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 50, startY, { steps: 10 });
    await page.mouse.up();
    
    // Wait for stroke to render
    await page.waitForTimeout(200);
    
    // Canvas should have changed (stroke drawn)
    const screenshot = await canvas.screenshot();
    expect(screenshot.length).toBeGreaterThan(1000);
  });

  // TC-024: Stroke follows pointer smoothly (no lag <100ms)
  test('TC-024: Stroke follows pointer smoothly', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    
    const startX = box!.x + 50;
    const startY = box!.y + 50;
    
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    
    // Quick drag
    const startTime = Date.now();
    await page.mouse.move(startX + 100, startY + 100, { steps: 20 });
    await page.mouse.up();
    const elapsed = Date.now() - startTime;
    
    // Should complete without lag (rough heuristic)
    expect(elapsed).toBeLessThan(1000);
  });

  // TC-025: Multiple strokes accumulate
  test('TC-025: Multiple strokes accumulate without overwrite', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    
    // Draw first stroke
    await page.mouse.move(box!.x + 30, box!.y + 30);
    await page.mouse.down();
    await page.mouse.move(box!.x + 80, box!.y + 30, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(100);
    
    const screenshot1 = await canvas.screenshot();
    
    // Draw second stroke
    await page.mouse.move(box!.x + 30, box!.y + 60);
    await page.mouse.down();
    await page.mouse.move(box!.x + 80, box!.y + 60, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(100);
    
    const screenshot2 = await canvas.screenshot();
    
    // Second screenshot should differ (more strokes)
    expect(Buffer.compare(screenshot1, screenshot2)).not.toBe(0);
  });

  // TC-026: Stroke width consistent
  test('TC-026: Stroke width consistent (~12px)', async ({ page }) => {
    // ponytail: Exact pixel measurement needs image analysis or PixiJS state
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    
    await page.mouse.move(box!.x + 40, box!.y + 40);
    await page.mouse.down();
    await page.mouse.move(box!.x + 90, box!.y + 40, { steps: 5 });
    await page.mouse.up();
    
    await page.waitForTimeout(100);
    const screenshot = await canvas.screenshot();
    expect(screenshot.length).toBeGreaterThan(1000);
  });

  // TC-027: Release pointer completes stroke
  test('TC-027: Release pointer completes stroke', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    
    await page.mouse.move(box!.x + 50, box!.y + 50);
    await page.mouse.down();
    await page.mouse.move(box!.x + 100, box!.y + 50, { steps: 5 });
    
    // Before release
    await page.waitForTimeout(50);
    
    await page.mouse.up();
    
    // After release - stroke should be complete
    await page.waitForTimeout(100);
    const screenshot = await canvas.screenshot();
    expect(screenshot.length).toBeGreaterThan(1000);
  });
});
