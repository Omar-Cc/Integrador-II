import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@marweld/ui/globals.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./shared/components/error-boundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
