import { type Page } from '@playwright/test';

export async function clearIndexedDB(page: Page) {
  await page.goto('/app');
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('aksaraku');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
  });
  await page.waitForTimeout(500);
}

export async function getProfileFromStorage(page: Page): Promise<any> {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      const req = indexedDB.open('aksaraku');
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('profiles', 'readonly');
        const store = tx.objectStore('profiles');
        const get = store.getAll();
        get.onsuccess = () => resolve(get.result[0]);
      };
      req.onerror = () => resolve(null);
    });
  });
}
