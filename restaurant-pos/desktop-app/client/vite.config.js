import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Required for Electron loadFile(file://...) in packaged app.
  base: "./",
});
