const ensureLink = (rel: string, href: string, type?: string): void => {
  if (document.head.querySelector(`link[rel="${rel}"]`)) return;
  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;
  if (type) link.type = type;
  document.head.append(link);
};

export const setupPwa = (): void => {
  ensureLink("manifest", "/manifest.webmanifest");
  ensureLink("icon", "/icon.svg", "image/svg+xml");
  ensureLink("apple-touch-icon", "/icon.svg");

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      void navigator.serviceWorker.register("/sw.js");
    });
  }
};
