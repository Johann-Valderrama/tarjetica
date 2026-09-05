import { expect, test } from '@playwright/test'
import { PERFILES } from './perfiles.datos'

/**
 * **Que quepa no es que se vea bien.**
 *
 * `una-sola-visual.spec.ts` vigila que no haya scroll y que el QR no se encoja. Los dos pasaban, y
 * aun asi el telefono y la firma de marca quedaban IMPRESOS UNO ENCIMA DEL OTRO al pie de la
 * tarjeta: la teja del QR se dimensionaba con `h-full`, o sea el alto entero de su seccion, y lo
 * que venia despues se salia por debajo. Un elemento que se desborda de su contenedor no produce
 * scroll en el documento cuando el padre recorta, asi que ningun assert de los que habia podia
 * verlo. Se vio en una captura de pantalla, y solo por eso.
 *
 * Este archivo cierra ese hueco: comprueba que las cajas de la tarjeta van una DEBAJO de otra, sin
 * solaparse, en los cinco perfiles y en las tres pantallas. Importa mas de lo normal porque esta
 * vista es exactamente lo que la Ola 5 convierte en el `.jpeg` que el usuario regala.
 */

const PANTALLAS = [
  { nombre: 'iPhone SE', ancho: 375, alto: 667 },
  { nombre: 'iPhone 14', ancho: 390, alto: 844 },
  { nombre: 'Pixel 7', ancho: 412, alto: 915 },
] as const

/** Una holgura de 1 px absorbe el redondeo del navegador, no un solape de verdad. */
const TOLERANCIA_PX = 1

for (const pantalla of PANTALLAS) {
  test.describe(`${pantalla.nombre} ${pantalla.ancho}x${pantalla.alto}`, () => {
    test.use({ viewport: { width: pantalla.ancho, height: pantalla.alto }, isMobile: true })

    for (const { nombre, datos } of PERFILES) {
      test(`${nombre}: ningun bloque se pisa con el siguiente`, async ({ page }) => {
        await page.goto('/tarjeta')
        await page.evaluate((t) => {
          localStorage.clear()
          localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
        }, datos)
        await page.reload()
        await expect(page.getByTestId('qr-contacto')).toBeVisible()

        const bloques = await page.evaluate(() => {
          const capturable = document.getElementById('tarjeta-capturable')!
          // Hijos directos de la tarjeta mas los del bloque del QR: son las bandas horizontales
          // que tienen que ir apiladas sin montarse.
          const bandas: Element[] = []
          for (const hijo of Array.from(capturable.children)) {
            if (hijo.tagName === 'SECTION' && hijo.querySelector('img,span')) {
              bandas.push(...Array.from(hijo.children))
            } else {
              bandas.push(hijo)
            }
          }
          return bandas.map((e) => {
            const r = e.getBoundingClientRect()
            return {
              etiqueta: `${e.tagName.toLowerCase()}.${(e.className || '').toString().slice(0, 24)}`,
              arriba: r.top,
              abajo: r.bottom,
              alto: r.height,
            }
          })
        })

        const visibles = bloques.filter((b) => b.alto > 0)
        for (let i = 1; i < visibles.length; i++) {
          const previo = visibles[i - 1]
          const actual = visibles[i]
          expect(
            actual.arriba,
            `"${actual.etiqueta}" empieza en ${Math.round(actual.arriba)} y "${previo.etiqueta}" termina en ${Math.round(previo.abajo)}: se pisan`,
          ).toBeGreaterThanOrEqual(previo.abajo - TOLERANCIA_PX)
        }

        // Y nada se sale por debajo del elemento que la Ola 5 va a capturar.
        const desborde = await page.evaluate(() => {
          const c = document.getElementById('tarjeta-capturable')!
          return c.scrollHeight - c.clientHeight
        })
        expect(desborde, 'algo se sale del elemento capturable').toBeLessThanOrEqual(TOLERANCIA_PX)
      })
    }
  })
}
