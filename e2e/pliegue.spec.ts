import { expect, test } from '@playwright/test'
import { PERFILES } from './perfiles.datos'

/**
 * D1b, en el TELEFONO CHICO. Este archivo existe por un hueco de muestreo propio.
 *
 * El resto del E2E corre en un Pixel 7, que mide 915 px de alto. El presupuesto de texto que
 * justifica los topes de caracteres se calculo contra un telefono de **667 px** (un iPhone SE), que
 * es el caso apretado. Un assert de "el QR no baja del pliegue" que solo corre a 915 px pasaria
 * siempre y no probaria nada del caso que importa: es el mismo patron de mirar una sola muestra y
 * creer que cubre el rango.
 *
 * La regla que se vigila aqui es la razon de ser de los topes: el QR va abajo, PERO tiene que
 * quedar visible sin scroll. Si esto falla, el gesto central del producto (extender el celular para
 * que te escaneen) pasa a exigir que la otra persona haga scroll en tu telefono.
 */

test.use({ viewport: { width: 375, height: 667 }, isMobile: true })

for (const { nombre, datos } of PERFILES) {
  test(`${nombre}: el QR queda visible sin scroll en un telefono de 375x667`, async ({ page }) => {
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
        finDelQr: r ? Math.round(r.bottom) : 0,
        ladoDelQr: r ? Math.round(r.width) : 0,
        ventana: window.innerHeight,
        desborde: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      }
    })

    console.log(
      `  ${nombre}: el QR mide ${m.ladoDelQr} px y termina en ${m.finDelQr} de ${m.ventana}`,
    )
    expect(m.desborde, `desborde horizontal en ${nombre}`).toBe(false)
    expect(
      m.finDelQr,
      `en ${nombre} el QR termina en ${m.finDelQr} px y la pantalla mide ${m.ventana}`,
    ).toBeLessThanOrEqual(m.ventana)
  })
}
