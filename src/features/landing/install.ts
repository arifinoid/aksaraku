/**
 * Pure PWA-install state machine for the landing page.
 *
 * Kept free of DOM access so `bun test` can drive every branch and the
 * component layer only wires real browser signals into `InstallContext`.
 */

export type InstallPlatform = "ios" | "android" | "desktop";

export type InstallAction =
  | { readonly action: "prompt" }
  | { readonly action: "open" }
  | { readonly action: "instructions"; readonly platform: InstallPlatform };

export interface InstallContext {
  /** `beforeinstallprompt` was captured for this page load. */
  readonly hasBeforeInstallPrompt: boolean;
  /** Display mode is already `standalone` (installed & launched from icon). */
  readonly isStandalone: boolean;
  /** Coarse platform from the user agent. */
  readonly platform: InstallPlatform;
}

export const detectPlatform = (userAgent: string): InstallPlatform => {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
};

export const classifyInstall = (ctx: InstallContext): InstallAction => {
  if (ctx.isStandalone) return { action: "open" };
  if (ctx.hasBeforeInstallPrompt) return { action: "prompt" };
  return { action: "instructions", platform: ctx.platform };
};

/** What should happen when the user clicks the install/open CTA. */
export type InstallClickOutcome =
  | { readonly kind: "go-to-app" }
  | { readonly kind: "trigger-prompt" }
  | { readonly kind: "show-instructions" };

export const resolveInstallClick = ({
  action,
  hasDeferredPrompt,
}: {
  readonly action: InstallAction;
  readonly hasDeferredPrompt: boolean;
}): InstallClickOutcome => {
  if (action.action === "open") return { kind: "go-to-app" };
  if (action.action === "prompt" && hasDeferredPrompt) {
    return { kind: "trigger-prompt" };
  }
  return { kind: "show-instructions" };
};
