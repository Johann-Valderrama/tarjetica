import { expect, test } from '@playwright/test'
import { PERFILES } from './perfiles.datos'

/**
 * **El requisito principal y no negociable: la tarjeta cabe en UNA SOLA VISUAL.** Sin scroll, con
 * cualquier contenido y en cualquier telefono.
 *
 * Este archivo existe porque el assert anterior medía otra cosa. Vigilaba que el CODIGO QR no
 * bajara del pliegue, que no es lo mismo que la tarjeta completa: con el QR visible, el telefono y
 * la firma podian quedar abajo y aparecer scroll igual. Es el patron de medir una cosa y creer que
 * se probo otra.
 *
 * Se prueba en TRES pantallas porque una sola muestra no cubre el rango: el resto del E2E corre en
 * un Pixel 7 de 915 px, donde todo cabe con holgura y este assert pasaria siempre sin probar nada.
 * El caso apretado es el iPhone SE.
 */

const PANTALLAS = [
  { nombre: 'iPhone SE', ancho: 375, alto: 667 },
  { nombre: 'iPhone 14', ancho: 390, alto: 844 },
  { nombre: 'Pixel 7', ancho: 412, alto: 915 },
] as const

/** Por debajo de esto un vCard completo cae bajo el piso de lectura (ver scripts/medir-densidad-qr.mjs). */
const LADO_MINIMO_DEL_QR = 200

for (const pantalla of PANTALLAS) {
  test.describe(`${pantalla.nombre} ${pantalla.ancho}x${pantalla.alto}`, () => {
    test.use({
      viewport: { width: pantalla.ancho, height: pantalla.alto },
      isMobile: true,
    })

    for (const { nombre, datos } of PERFILES) {
      test(`${nombre}: cabe entera, sin scroll`, async ({ page }) => {
        await page.goto('/tarjeta')
        await page.evaluate((t) => {
          localStorage.clear()
          localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
        }, datos)
        await page.reload()
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

        const m = await page.evaluate(() => {
          const teja = document.querySelector('#tarjeta-capturable .bg-white')
          const r = teja?.getBoundingClientRect()
          return {
            altoDelDocumento: document.documentElement.scrollHeight,
            ventana: window.innerHeight,
            anchoDelDocumento: document.documentElement.scrollWidth,
            anchoVentana: document.documentElement.clientWidth,
            ladoDelQr: r ? Math.round(r.width) : 0,
            finDelQr: r ? Math.round(r.bottom) : 0,
          }
        })

        console.log(
          `  ${pantalla.nombre} · ${nombre}: documento ${m.altoDelDocumento}/${m.ventana}, QR ${m.ladoDelQr} px`,
        )

        // Lo principal: nada de scroll, en ninguna direccion.
        expect(
          m.altoDelDocumento,
          `${nombre} en ${pantalla.nombre} necesita scroll vertical`,
        ).toBeLessThanOrEqual(m.ventana)
        expect(
          m.anchoDelDocumento,
          `${nombre} en ${pantalla.nombre} desborda en horizontal`,
        ).toBeLessThanOrEqual(m.anchoVentana)

        // Que quepa encogiendo el QR hasta volverlo ilegible no seria una solucion, seria otro bug.
        expect(
          m.ladoDelQr,
          `el QR quedo en ${m.ladoDelQr} px, por debajo del minimo legible`,
        ).toBeGreaterThanOrEqual(LADO_MINIMO_DEL_QR)
      })
    }
  })
}
