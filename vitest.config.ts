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
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
        "src/domain/**": {
          lines: 95,
          functions: 95,
          branches: 90,
          statements: 95,
        },
        "src/lib/**": {
          lines: 95,
          functions: 95,
          branches: 90,
          statements: 95,
        },
      },
      exclude: [
        "node_modules/**",
        ".next/**",
        "vitest.setup.ts",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "src/app/layout.tsx",
        "src/domain/types.ts",
        "src/services/types.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
