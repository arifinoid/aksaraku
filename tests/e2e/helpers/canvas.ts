import { type Page, expect } from '@playwright/test';

export async function waitForCanvas(page: Page) {
  const canvas = page.locator('canvas').first();
  await expect(canvas).toBeVisible({ timeout: 10000 });
  return canvas;
}

export async function drawStroke(page: Page, startX: number, startY: number, endX: number, endY: number) {
  const canvas = await waitForCanvas(page);
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas not found');
  
  await page.mouse.move(box.x + startX, box.y + startY);
  await page.mouse.down();
  await page.mouse.move(box.x + endX, box.y + endY, { steps: 10 });
  await page.mouse.up();
}

export async function getCanvasPixelData(page: Page): Promise<Uint8ClampedArray> {
  return await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas not found');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D context not available');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return data.data;
  });
}
