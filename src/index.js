import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { register } from "./serviceWorkerRegistration";

// Import Material Design icons
const materialIconsLink = document.createElement("link");
materialIconsLink.href =
  "https://fonts.googleapis.com/icon?family=Material+Icons";
materialIconsLink.rel = "stylesheet";
document.head.appendChild(materialIconsLink);

// Create root for React 18+ rendering
const container = document.getElementById("root");
const root = createRoot(container);

// Render with the new API
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA
register();
