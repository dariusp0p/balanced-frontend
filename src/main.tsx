import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./app/styles/tailwind.css";
import { AppProviders } from "./app/providers/AppProviders";
import { trackPageVisit } from "./shared/utils/cookies";

trackPageVisit();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
