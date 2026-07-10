import { defineConfig } from "vite";

// Production (GitHub Pages) is served from /needle-drop/; keep the dev server at root.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/needle-drop/" : "/",
}));
