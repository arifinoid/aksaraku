/**
 * Privacy-friendly product analytics via GoatCounter.
 *
 * The self-hosted instance lives at stats.arifinoid.web.id. GoatCounter does
 * not use cookies and does not store personal data; pageviews are counted by
 * `count.js`, which is loaded from the HTML entries. Product events (tracing
 * finished, game finished, profile created, PWA installed) are sent explicitly
 * from the UI so the dashboard can show engagement, not just visits.
 *
 * The script is loaded async and may be blocked or unavailable offline, so
 * every call is optional: losing a beacon must never break the app.
 */
interface GoatCounterApi {
  readonly count?: (vars: {
    readonly path: string;
    readonly event?: boolean;
    readonly title?: string;
  }) => void;
}

declare global {
  interface Window {
    goatcounter?: GoatCounterApi;
  }
}

/** Sends one named event, e.g. `event/tracing-item-complete`. */
export const trackEvent = (name: string): void => {
  if (typeof window === "undefined") return;
  window.goatcounter?.count?.({ path: `event/${name}`, event: true });
};
