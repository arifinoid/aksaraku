const ensureLink = (rel: string, href: string, type?: string): void => {
  if (document.head.querySelector(`link[rel="${rel}"]`)) return;
  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;
  if (type) link.type = type;
  document.head.append(link);
};

const isProduction = process.env.NODE_ENV === "production";

export const setupPwa = (): void => {
  ensureLink("manifest", "/manifest.webmanifest");
  ensureLink("icon", "/icon.svg", "image/svg+xml");
  ensureLink("apple-touch-icon", "/icon.svg");

  if (!isProduction) return;
  if (!("serviceWorker" in navigator)) return;

  const hadController = navigator.serviceWorker.controller !== null;

  window.addEventListener("load", () => {
    void navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.update())
      .catch(() => undefined);
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) return;
    if (sessionStorage.getItem("aksaraku:sw-reloaded") === "1") return;
    sessionStorage.setItem("aksaraku:sw-reloaded", "1");
    window.location.reload();
  });
};
