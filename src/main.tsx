import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./app/styles/tailwind.css";
import { trackPageVisit } from "./shared/utils/cookies";

trackPageVisit();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
