import { afterEach, expect, test } from "bun:test";
import { trackEvent } from "./analytics";

interface Recorded {
  readonly path: string;
  readonly event?: boolean;
}

const installGoatCounter = (calls: Recorded[]): void => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { goatcounter: { count: (vars: Recorded) => calls.push(vars) } },
  });
};

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

test("sends the event path to GoatCounter", () => {
  const calls: Recorded[] = [];
  installGoatCounter(calls);

  trackEvent("tracing-item-complete");

  expect(calls).toEqual([
    { path: "event/tracing-item-complete", event: true },
  ]);
});

test("is a no-op when the GoatCounter script did not load", () => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {},
  });

  expect(() => trackEvent("profile-created")).not.toThrow();
});

test("is a no-op without a browser window", () => {
  expect(() => trackEvent("game-complete")).not.toThrow();
});
