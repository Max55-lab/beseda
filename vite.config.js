import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const standalone = process.env.VITE_STANDALONE === "1";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  build: standalone
    ? {
        rollupOptions: {
          output: {
            inlineDynamicImports: true,
          },
        },
      }
    : {},
});