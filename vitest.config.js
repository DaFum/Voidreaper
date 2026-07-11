import { defineConfig } from "vitest/config";

// Vitest deckt den DOM-basierten Frontend-Layer (src/ui) ab und läuft getrennt
// vom bestehenden node:test-Runner: `npm test` findet weiterhin tests/**/*.test.js,
// `npm run test:frontend` findet ausschließlich tests/frontend/**/*.spec.js.
export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["tests/frontend/**/*.spec.js"]
  }
});
