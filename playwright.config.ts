import { defineConfig, devices } from '@playwright/test'

/**
 * El E2E corre contra el BUILD DE PRODUCCION, no contra el dev server.
 *
 * No es una preferencia: la unidad 1e emite la CSP con un nonce por peticion, y en desarrollo la
 * politica es distinta (lleva `'unsafe-eval'`). Probar contra `next dev` verificaria una app que
 * nadie va a usar. Lo mismo vale para el prerender: lo que rompe en produccion no rompe en dev.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3210',
    // El caso de uso es un telefono, de pie, en una conferencia. Esa es la medida por defecto.
    ...devices['Pixel 7'],
  },
  webServer: {
    command: 'node node_modules/next/dist/bin/next start --port 3210',
    url: 'http://localhost:3210',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
