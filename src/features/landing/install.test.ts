import { describe, expect, test } from "bun:test";
import {
  classifyInstall,
  detectPlatform,
  type InstallContext,
} from "./install";

describe("detectPlatform", () => {
  test("returns ios for iPhone user agent", () => {
    expect(
      detectPlatform(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) Safari",
      ),
    ).toBe("ios");
  });

  test("returns ios for iPad user agent", () => {
    expect(
      detectPlatform(
        "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) Safari",
      ),
    ).toBe("ios");
  });

  test("returns android for Android user agent", () => {
    expect(
      detectPlatform(
        "Mozilla/5.0 (Linux; Android 12; SM-T220) AppleWebKit Safari",
      ),
    ).toBe("android");
  });

  test("returns desktop for Mac desktop user agent", () => {
    expect(
      detectPlatform(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Chrome",
      ),
    ).toBe("desktop");
  });

  test("returns desktop for Windows user agent", () => {
    expect(
      detectPlatform(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome",
      ),
    ).toBe("desktop");
  });

  test("returns desktop for unknown agent", () => {
    expect(detectPlatform("")).toBe("desktop");
  });
});

describe("classifyInstall", () => {
  /** When the browser fires beforeinstallprompt, we can trigger native install. */
  test("returns promptable when beforeinstallprompt is available", () => {
    const ctx: InstallContext = {
      hasBeforeInstallPrompt: true,
      isStandalone: false,
      platform: "android",
    };
    expect(classifyInstall(ctx)).toEqual({ action: "prompt" });
  });

  /** Already installed — show "Open App" instead of install. */
  test("returns open when already standalone", () => {
    const ctx: InstallContext = {
      hasBeforeInstallPrompt: false,
      isStandalone: true,
      platform: "android",
    };
    expect(classifyInstall(ctx)).toEqual({ action: "open" });
  });

  /** iOS Safari never fires beforeinstallprompt — show instructions. */
  test("returns instructions-ios when iOS without prompt", () => {
    const ctx: InstallContext = {
      hasBeforeInstallPrompt: false,
      isStandalone: false,
      platform: "ios",
    };
    expect(classifyInstall(ctx)).toEqual({
      action: "instructions",
      platform: "ios",
    });
  });

  test("returns instructions-android when Android without prompt", () => {
    const ctx: InstallContext = {
      hasBeforeInstallPrompt: false,
      isStandalone: false,
      platform: "android",
    };
    expect(classifyInstall(ctx)).toEqual({
      action: "instructions",
      platform: "android",
    });
  });

  test("returns instructions-desktop when desktop without prompt", () => {
    const ctx: InstallContext = {
      hasBeforeInstallPrompt: false,
      isStandalone: false,
      platform: "desktop",
    };
    expect(classifyInstall(ctx)).toEqual({
      action: "instructions",
      platform: "desktop",
    });
  });

  /** Edge case: standalone + prompt available (devtools / weird state) → open wins. */
  test("prefers open over prompt when both are true", () => {
    const ctx: InstallContext = {
      hasBeforeInstallPrompt: true,
      isStandalone: true,
      platform: "android",
    };
    expect(classifyInstall(ctx)).toEqual({ action: "open" });
  });
});
