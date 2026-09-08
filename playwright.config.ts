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
    /**
     * Idioma FIJO, agregado en la unidad 7a. No es cosmetico: el runner de Playwright manda
     * `Accept-Language: en-US`, asi que en cuanto la app aprendio a negociar el idioma (7a) la
     * suite entera empezo a medir la version en INGLES mientras sus asserts seguian escritos en
     * español. Doce pruebas se pusieron en rojo de golpe, y ninguna por un defecto del producto.
     *
     * Se fija `es-CO` porque es el idioma por defecto y el de los asserts. La version en ingles no
     * se queda sin medir: tiene su propia suite en `e2e/idiomas.spec.ts`, que abre el contexto con
     * `en` a proposito.
     */
    locale: 'es-CO',
    /**
     * Movimiento FIJO, agregado el 2026-09-08. Mismo tipo de fallo que el `locale` de arriba, y por
     * eso va pegado a el: Playwright NO emula esta preferencia por defecto, la hereda del SISTEMA
     * donde corre. En esta maquina Windows tiene los efectos de animacion APAGADOS, asi que la
     * suite entera medía la version sin movimiento mientras sus asserts exigian el parpadeo, y tres
     * pruebas se ponian en rojo sin que el producto tuviera nada.
     *
     * Peor que ponerse en rojo: una suite que depende del panel de control de quien la corre da
     * resultados distintos en dos computadores con el mismo commit.
     *
     * Va dentro de `contextOptions` y NO suelto como `locale`: en esta version de Playwright
     * (1.62.1) `reducedMotion` no existe en el tipo de `use`, asi que suelto rompe el typecheck y,
     * peor, un `test.use({ reducedMotion: 'reduce' })` dentro de un `describe` se IGNORA EN
     * SILENCIO. Medido: ese `describe` imprimia `false` al preguntarle a `matchMedia`, o sea que
     * habria medido el caso contrario al de su nombre. Por eso la version sin movimiento abre su
     * PROPIO contexto en `e2e/boton-apagado-explica.spec.ts`, igual que el ingles en
     * `e2e/idiomas.spec.ts`.
     */
    contextOptions: { reducedMotion: 'no-preference' },
  },
  webServer: {
    command: 'node node_modules/next/dist/bin/next start --port 3210',
    url: 'http://localhost:3210',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
