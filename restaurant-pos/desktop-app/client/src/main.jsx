import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initOfflineEngine } from "./utils/offlineEngine";
import "./index.css";   // ← VERY IMPORTANT

initOfflineEngine();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
