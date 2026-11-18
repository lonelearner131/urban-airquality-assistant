import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
        "src/domain/**": {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
        "src/lib/**": {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
      },
      exclude: [
        "node_modules/**",
        ".next/**",
        "vitest.setup.ts",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "src/app/layout.tsx",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
