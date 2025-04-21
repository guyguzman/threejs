import { defineConfig } from "vite";

export default defineConfig({
  // Project root directory (where index.html is located).
  root: ".",
  // Base public path when served in development or production.
  base: "/",
  // Directory to serve as plain static assets.
  publicDir: "public",
  // Directory to build output
  build: {
    outDir: "dist",
    // Generate source maps for the build.
    sourcemap: true,
  },
  server: {
    // Specify server port.
    port: 5173,
    // Open browser on server start.
    open: true,
  },
});
