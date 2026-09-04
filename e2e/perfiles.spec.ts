import { expect, test } from '@playwright/test'
import { PERFILES } from './perfiles.datos'

/**
 * La tarjeta, vista en TODOS sus estados y no solo en el maximo.
 *
 * Nace de un hueco real de verificacion (2026-09-04): la Ola 3 se diseño y se miro con una tarjeta
 * llena, capa de venta incluida, y nadie abrio la tarjeta que en realidad es el **caso comun**. El
 * PRP lo dice con todas las letras: *"El QR de la tarjeta llena es el caso de prueba; el de la
 * tarjeta minima es el caso comun"*. El assert de "renderiza sin desbordar" pasaba en los dos, asi
 * que nada delataba que el caso comun se viera pobre.
 *
 * Este archivo deja los cuatro estados corriendo en cada suite, y guarda una captura de cada uno
 * para poder MIRARLOS, que es lo unico que caza un problema de composicion.
 */

for (const { nombre, datos } of PERFILES) {
  test(`perfil ${nombre}: renderiza, no desborda y deja captura`, async ({ page }) => {
    await page.goto('/tarjeta')
    await page.evaluate((t) => {
      localStorage.clear()
      localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
    }, datos)
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await page.screenshot({ path: `capturas/perfil-${nombre}.png`, fullPage: true })

    const m = await page.evaluate(() => {
      const capturable = document.getElementById('tarjeta-capturable')
      return {
        existe: Boolean(capturable),
        alto: capturable ? Math.round(capturable.getBoundingClientRect().height) : 0,
        desborde: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        controlesDentro: capturable
          ? capturable.querySelectorAll('button, input, select, textarea').length
          : -1,
        ...(() => {
          const teja = document.querySelector('#tarjeta-capturable .bg-white')
          const fin = teja ? Math.round(teja.getBoundingClientRect().bottom) : 0
          return {
            finDelQr: fin,
            ventana: window.innerHeight,
            qrFueraDePantalla: fin > window.innerHeight,
          }
        })(),
      }
    })

    expect(m.existe, 'debe existir el elemento capturable').toBe(true)
    // D1b: el QR va abajo, PERO tiene que quedar visible sin scroll. Es la razon entera de que los
    // dos bloques de texto lleven tope duro de caracteres. Si esto falla, el gesto central del
    // producto (extender el celular para que te escaneen) pasa a exigir scroll.
    expect(
      m.qrFueraDePantalla,
      `en el perfil ${nombre} el QR queda debajo del pliegue (termina en ${m.finDelQr} px, la pantalla mide ${m.ventana})`,
    ).toBe(false)
    expect(m.desborde, `desborde horizontal en el perfil ${nombre}`).toBe(false)
    expect(m.controlesDentro, `controles dentro del capturable en ${nombre}`).toBe(0)
    console.log(`  ${nombre}: la tarjeta mide ${m.alto} px de alto`)
  })
}
