import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { initI18n } from "./i18n";
import { setupFonts } from "./platform/fonts";
import { setupPwa } from "./platform/pwa";
import { ErrorBoundary } from "./ui";
import "./index.css";

initI18n("id");
setupFonts();
setupPwa();

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

(import.meta.hot.data.root ??= createRoot(elem)).render(app);
