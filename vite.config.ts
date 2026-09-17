import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: "/prom-viewer/",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  // Drop stray console.log/debug/info calls from production builds (console.error/warn are kept for real diagnostics).
  esbuild: command === "build" ? { pure: ["console.log", "console.debug", "console.info"] } : {},
  build: {
    rollupOptions: {
      input: {
        main: `${rootDir}index.html`,
        launch: `${rootDir}launch.html`,
        launchPatient: `${rootDir}launch-patient.html`,
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
}));
