import { chromium, type Browser, type Page } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

// Usage: bun --hot src/index.ts & then
//   CHROME_PATH=/nix/store/.../bin/chromium bun scripts/ui-screenshots.ts
// Playwright's bundled browser lacks system libs on this NixOS/WSL setup.
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.OUT_DIR ?? path.resolve(process.cwd(), "screenshots");

const errors: string[] = [];

async function waitFonts(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

async function shot(page: Page, dir: string, name: string, fullPage = true) {
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, dir, name + ".png"), fullPage });
}

const visible = async (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .isVisible()
    .catch(() => false);

/** Desktop hides the phone back buttons, so fall back to the sidebar. */
async function ensureHome(page: Page) {
  for (let i = 0; i < 4; i++) {
    if (await visible(page, ".home__grid")) return;
    if (await visible(page, '.sidebar__nav:has-text("Beranda")')) {
      await page.locator('.sidebar__nav:has-text("Beranda")').first().click();
    } else if (await visible(page, 'button:has-text("Kembali")')) {
      await page.locator('button:has-text("Kembali")').first().click();
    }
    await page.waitForTimeout(400);
  }
}

async function openGames(page: Page) {
  await ensureHome(page);
  await page
    .locator("button.home-tile")
    .filter({ hasText: /Permainan/i })
    .click();
  await page.locator(".games__hub").waitFor({ timeout: 15000 });
}

async function backToHub(page: Page) {
  if (await visible(page, ".games__hub")) return;
  await openGames(page);
}

async function back(page: Page) {
  const btn = page.locator('button:has-text("Kembali")').first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
  } else {
    await ensureHome(page);
  }
  await page.waitForTimeout(400);
}

async function capture(page: Page, dir: string) {
  // Landing
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await waitFonts(page);
  await shot(page, dir, "01-landing");

  // App: empty profile screen
  await page.goto(BASE + "/app", { waitUntil: "networkidle" });
  const input = page.locator(".profiles__input").first();
  await input.waitFor({ timeout: 15000 });
  await waitFonts(page);
  await shot(page, dir, "02-profiles-empty");

  await input.fill("Aisyah");
  await page.waitForTimeout(200);
  await shot(page, dir, "03-profiles-form");

  await page
    .locator('button[type="submit"]')
    .filter({ hasText: /Simpan/i })
    .click();
  await page.locator(".home__grid").waitFor({ timeout: 15000 });
  await waitFonts(page);
  await shot(page, dir, "04-home");

  // Play / tracing picker
  await page
    .locator("button.home-tile")
    .filter({ hasText: /Menulis/i })
    .click();
  await page.locator(".play__tabs").waitFor({ timeout: 15000 });
  await waitFonts(page);
  await shot(page, dir, "05-play-picker");

  await page.locator(".glyph-card").first().click();
  await page.locator("canvas").first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(1200);
  await shot(page, dir, "06-tracing");
  await ensureHome(page);

  // Games
  await openGames(page);
  await shot(page, dir, "07-games-hub");

  await page
    .locator(".games__hub button.game-card")
    .filter({ hasText: /Cocokkan/i })
    .click();
  await page.locator(".option-card").first().waitFor({ timeout: 15000 });
  await shot(page, dir, "08-games-matching");
  await backToHub(page);

  await page
    .locator(".games__hub button.game-card")
    .filter({ hasText: /Balon/i })
    .click();
  await page.locator(".balloon").first().waitFor({ timeout: 15000 });
  await shot(page, dir, "09-games-balloon");
  await backToHub(page);

  await page
    .locator(".games__hub button.game-card")
    .filter({ hasText: /Mewarnai/i })
    .click();
  await page.locator(".coloring__svg").waitFor({ timeout: 15000 });
  await page.waitForTimeout(500);
  await shot(page, dir, "10-games-coloring");
  await ensureHome(page);

  // Collection
  await page
    .locator("button.home-tile")
    .filter({ hasText: /Koleksi/i })
    .click();
  await page.locator(".reward-card").first().waitFor({ timeout: 15000 });
  await shot(page, dir, "11-collection");
  await ensureHome(page);

  // Avatar
  // "Koleksi" also mentions "karakter" in its hint, so pick by position.
  await page.locator("button.home-tile").nth(3).click();
  await page.locator(".avatar__stage").waitFor({ timeout: 15000 });
  await page.waitForTimeout(2500);
  await shot(page, dir, "12-avatar");
  await ensureHome(page);

  // Parent
  const parentButton = (await visible(page, ".home__parent"))
    ? page.locator(".home__parent")
    : page.locator('.sidebar__nav:has-text("Area Orang Tua")');
  await parentButton.first().click();
  await page.locator(".gate__question").waitFor({ timeout: 15000 });
  await shot(page, dir, "13-parent-gate");

  const question = (await page
    .locator(".gate__question")
    .innerText()).replace(/\s+/g, " ");
  const nums = question.match(/(\d+)\s*\+\s*(\d+)/);
  if (!nums) throw new Error("Cannot parse gate question: " + question);
  const answer = String(Number(nums[1]) + Number(nums[2]));
  await page.locator(".gate__input").fill(answer);
  await page
    .locator('button[type="submit"]')
    .filter({ hasText: /Masuk/i })
    .click();
  await page.locator('h1:has-text("Area Orang Tua")').waitFor({ timeout: 15000 });
  await waitFonts(page);
  await shot(page, dir, "14-parent-menu");

  await page.locator('button:has-text("Laporan Perkembangan")').click();
  await page.locator(".report__grid").waitFor({ timeout: 15000 });
  await shot(page, dir, "15-parent-report");
  await back(page);

  await page.locator('button:has-text("Kelola Anak")').first().click();
  await page.locator(".child-list").waitFor({ timeout: 15000 });
  await shot(page, dir, "16-parent-children");
  await back(page);

  await page.locator('button:has-text("Pratinjau Konten")').click();
  await page.locator(".preview__chip").first().waitFor({ timeout: 15000 });
  await shot(page, dir, "17-preview");
}

const browser: Browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);
const viewports: Array<{ dir: string; width: number; height: number }> = [
  { dir: "desktop", width: 1440, height: 900 },
  { dir: "mobile", width: 390, height: 844 },
];

try {
  for (const vp of viewports) {
    await mkdir(path.join(OUT, vp.dir), { recursive: true });
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      locale: "id-ID",
    });
    const page = await context.newPage();
    page.on("pageerror", (e) =>
      errors.push("[" + vp.dir + "] pageerror: " + e.message),
    );
    page.on("console", (m) => {
      if (m.type() === "error")
        errors.push("[" + vp.dir + "] console: " + m.text());
    });
    try {
      await capture(page, vp.dir);
      console.log("OK " + vp.dir);
    } catch (e) {
      console.error("FAIL " + vp.dir + ": " + (e as Error).message);
      await page
        .screenshot({
          path: path.join(OUT, vp.dir, "zz-failure.png"),
          fullPage: true,
        })
        .catch(() => {});
      throw e;
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

if (errors.length) {
  console.log("\nCONSOLE/PAGE ERRORS (" + errors.length + "):");
  for (const e of [...new Set(errors)]) console.log(" - " + e);
}
console.log("\nSaved to " + OUT);
