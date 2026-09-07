import { expect, test } from '@playwright/test'
import { PERFILES } from './perfiles.datos'

/**
 * Verificacion de la unidad 7a, contra el BUILD DE PRODUCCION.
 *
 * El resto de la suite corre con `locale: 'es-CO'` fijo en `playwright.config.ts`, o sea que mide
 * SIEMPRE la version en español. Este archivo es el unico que abre el contexto en ingles, y por
 * eso es el unico que puede cazar el fallo tipico de una traduccion a medias: **una pantalla que
 * se queda en español porque alguien dejo el texto escrito en el componente.** Ese fallo no rompe
 * nada, no sale en consola y no lo ve quien lo escribio.
 *
 * La unidad 7a lo pide como grep de cadenas fuera de `messages/`. Un grep tiene dos huecos que esto
 * no tiene: no ve un texto que se arme concatenando, y no distingue una cadena visible de un
 * `data-testid`. Aqui se mide lo que la pantalla PINTA.
 */

const PERFIL = PERFILES.find((p) => p.nombre === 'completo')!

/** Palabras que solo existen en el copy en español. Si aparecen con la app en ingles, quedo texto sin traducir. */
const SOLO_EN_ESPANOL = [
  'tarjeta',
  'Guardar como imagen',
  'Borrar mis datos',
  'ningún servidor',
  'Escanea para guardarme',
  'Enlace para compartir',
]

async function textoVisible(page: import('@playwright/test').Page) {
  return (await page.locator('body').innerText()).toLowerCase()
}

test.describe('en ingles, ninguna pantalla se queda en español', () => {
  test.use({ locale: 'en-US' })

  test('la home responde al idioma del navegador, sin que nadie elija nada', async ({ page }) => {
    await page.goto('/')
    const texto = await textoVisible(page)
    expect(texto).toContain('we do not store your data on any server')
    for (const frase of SOLO_EN_ESPANOL) {
      expect(texto, `quedo sin traducir: "${frase}"`).not.toContain(frase.toLowerCase())
    }
  })

  test('el `lang` del documento cambia con el idioma, no se queda en "es"', async ({ page }) => {
    // No es un detalle: de `lang` dependen la pronunciacion del lector de pantalla, la division
    // silabica y el traductor del navegador. Un `lang` mentiroso no se ve en ninguna captura.
    await page.goto('/')
    expect(await page.locator('html').getAttribute('lang')).toBe('en')
  })

  test('el editor entero, incluidos los avisos y el aviso de densidad', async ({ page }) => {
    await page.goto('/editor')
    await page.evaluate((t) => {
      localStorage.clear()
      localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
      localStorage.setItem('tarjetica.confirmacion', JSON.stringify({ v: 1, d: true }))
    }, PERFIL.datos)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Your card' })).toBeVisible()

    const texto = await textoVisible(page)
    for (const frase of SOLO_EN_ESPANOL) {
      expect(texto, `quedo sin traducir en el editor: "${frase}"`).not.toContain(frase.toLowerCase())
    }
  })

  test('la advertencia del enlace, que es la que mas pesa, sale completa en ingles', async ({ page }) => {
    await page.goto('/editor')
    await page.evaluate((t) => {
      localStorage.clear()
      localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
      localStorage.setItem('tarjetica.confirmacion', JSON.stringify({ v: 1, d: true }))
    }, PERFIL.datos)
    await page.reload()
    await page.getByTestId('abrir-enlace').click()

    const aviso = (await page.getByTestId('advertencia-enlace').textContent())!.toLowerCase()
    // Las MISMAS tres cosas que el assert en español exige, dichas en ingles.
    expect(aviso, 'falta decir que es publico para quien lo tenga').toContain('anyone who has it')
    expect(aviso, 'falta decir que NO se puede desactivar').toContain('cannot be switched off')
    expect(aviso, 'falta decir lo del historial del navegador').toContain('browser history')
  })

  test('la vista de la tarjeta, que es la que abre un desconocido', async ({ page }) => {
    await page.goto('/editor')
    await page.evaluate((t) => {
      localStorage.clear()
      localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
    }, PERFIL.datos)
    await page.goto('/tarjeta')
    await expect(page.getByTestId('qr-contacto')).toBeVisible()

    const texto = await textoVisible(page)
    expect(texto).toContain('scan to save me in your contacts')
    expect(texto).toContain('made with')
  })
})

test.describe('el idioma elegido a mano manda sobre el del navegador', () => {
  test.use({ locale: 'en-US' })

  test('elegir español lo cambia y AGUANTA la recarga', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Create my card' })).toBeVisible()

    await page.getByRole('combobox', { name: 'Language' }).selectOption('es-CO')
    await expect(page.getByRole('link', { name: 'Crear mi tarjeta' })).toBeVisible()

    // Si no sobrevive a la recarga, el selector es decoracion: el usuario lo cambia y vuelve solo.
    await page.reload()
    await expect(page.getByRole('link', { name: 'Crear mi tarjeta' })).toBeVisible()
    expect(await page.locator('html').getAttribute('lang')).toBe('es-CO')

    // Y viaja a las demas pantallas, no solo a la que tenia el selector.
    await page.goto('/editor')
    await expect(page.getByRole('heading', { name: 'Tu tarjeta' })).toBeVisible()
  })
})

test.describe('no queda ninguna clave de traduccion cruda en pantalla', () => {
  /**
   * El fallo que el typecheck NO puede ver: `t('editor.titulo')` con la clave bien escrita pero
   * ausente del catalogo en tiempo de ejecucion pinta la ruta de la clave tal cual. Se ve como un
   * texto raro, no como un error, y nadie lo reporta.
   */
  const PARECE_CLAVE = /\b(app|meta|idioma|home|editor|campos|avisos|limites|tarjeta|qr|enlace)\.[a-zA-Z]/

  for (const [ruta, sembrar] of [
    ['/', false],
    ['/editor', true],
    ['/tarjeta', true],
  ] as const) {
    test(`${ruta} no pinta ninguna clave`, async ({ page }) => {
      await page.goto('/editor')
      if (sembrar) {
        await page.evaluate((t) => {
          localStorage.clear()
          localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
          localStorage.setItem('tarjetica.confirmacion', JSON.stringify({ v: 1, d: true }))
        }, PERFIL.datos)
      }
      await page.goto(ruta)
      const texto = await page.locator('body').innerText()
      expect(texto, `hay una clave sin traducir en ${ruta}`).not.toMatch(PARECE_CLAVE)
    })
  }
})
