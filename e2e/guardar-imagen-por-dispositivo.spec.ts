import { expect, test } from '@playwright/test'
import { PERFILES } from './perfiles.datos'

/**
 * Por donde sale la imagen segun el DISPOSITIVO (unidad 5b, corregida el 2026-09-08).
 *
 * **El caso que lo origino.** Johann uso la app en su computador y, al pulsar "Guardar como
 * imagen", le salio la hoja de compartir de Windows con una lista de apps, sin poder elegir
 * carpeta, donde esperaba la descarga de toda la vida. La causa: el codigo preguntaba
 * `navigator.canShare({files})` y **Chrome de escritorio responde que si**, asi que la hoja del
 * sistema ganaba siempre. El propio comentario del codigo afirmaba que la descarga "sirve en
 * Android y en escritorio", y era falso: en escritorio nunca se llegaba a ella.
 *
 * **Por que hacia falta ESTE test y no bastaba el unitario.** El de `guardar.test.ts` llama a
 * `elegirVia` directamente y le pasa los dos booleanos a mano, asi que comprueba la decision pero
 * no que alguien la CONECTE al boton: si el editor dejara de leer el puntero, ese test seguiria en
 * verde. Aqui se pulsa el boton de verdad y se mira lo que ocurre.
 *
 * ⚠️ **Su limite, dicho para que nadie lo confunda con cobertura.** Chromium sin cabeza no trae
 * `navigator.share`, asi que la unica forma de reproducir el navegador de Johann es inyectarlo. Eso
 * significa que este archivo verifica **cual via se elige**, no que la hoja del sistema de verdad
 * guarde en Fotos: esa es del sistema operativo y su arbitro sigue siendo el gate fisico 5d.
 */

const PERFIL = PERFILES.find((p) => p.nombre === 'completo')!

/**
 * Le pone al navegador un `share` que acepta archivos, como el Chrome de Windows de Johann, y deja
 * anotado si lo llamaron. Va como `addInitScript` para que exista ANTES de que cargue la app.
 */
const CON_HOJA_DEL_SISTEMA = `
  window.__compartido = []
  navigator.canShare = (datos) => Array.isArray(datos?.files) && datos.files.length > 0
  navigator.share = async (datos) => { window.__compartido.push(datos.files[0].name) }
`

async function abrirEditorListo(page: import('@playwright/test').Page) {
  await page.goto('/editor')
  await expect(page.getByRole('heading', { name: 'Tu tarjeta' })).toBeVisible()
  await page.evaluate((t) => {
    localStorage.clear()
    localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
    localStorage.setItem('tarjetica.confirmacion', JSON.stringify({ v: 1, d: true }))
  }, PERFIL.datos)
  await page.reload()
  await expect(page.getByTestId('qr-contacto')).toBeAttached()
  await expect(page.getByTestId('exportar-jpeg')).toBeEnabled()
}

test.describe('en el COMPUTADOR, la imagen se DESCARGA', () => {
  // Sin `hasTouch` y con puntero fino: un computador con mouse, que es donde aparecio el defecto.
  test.use({ viewport: { width: 1280, height: 800 }, hasTouch: false, isMobile: false })

  test('aunque el navegador ofrezca la hoja del sistema, baja el archivo', async ({ page }) => {
    await page.addInitScript(CON_HOJA_DEL_SISTEMA)
    await abrirEditorListo(page)

    // Comprobacion de la premisa: si el puntero no sale fino, este test mide otra cosa.
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
      'el contexto no quedo como escritorio: el test no probaria lo que dice',
    ).toBe(false)
    expect(
      await page.evaluate(() => typeof navigator.share === 'function'),
      'no se inyecto la hoja del sistema: sin ella el test pasaria por la razon equivocada',
    ).toBe(true)

    const descarga = page.waitForEvent('download', { timeout: 15_000 })
    await page.getByTestId('exportar-jpeg').click()

    // Si el codigo eligiera compartir, aqui no habria descarga y el test caeria por tiempo: eso es
    // exactamente lo que le pasaba a Johann.
    expect((await descarga).suggestedFilename()).toMatch(/\.jpeg$/)
    expect(
      await page.evaluate(() => (window as unknown as { __compartido: string[] }).__compartido),
      'se abrio la hoja del sistema en un computador',
    ).toEqual([])
  })
})

test.describe('en el TELEFONO, manda la hoja del sistema', () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true })

  test('con hoja disponible, se comparte y NO se descarga', async ({ page }) => {
    await page.addInitScript(CON_HOJA_DEL_SISTEMA)
    await abrirEditorListo(page)

    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
      'el contexto no quedo como telefono: el test no probaria lo que dice',
    ).toBe(true)

    /*
      Es la razon de ser de la unidad 5b y no se puede perder al arreglar el escritorio: en iOS
      Safari `<a download>` NO guarda en Fotos, asi que preferir la descarga en un telefono dejaria
      al usuario creyendo que guardo su tarjeta cuando no guardo nada.
    */
    let huboDescarga = false
    page.on('download', () => {
      huboDescarga = true
    })

    await page.getByTestId('exportar-jpeg').click()
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __compartido: string[] }).__compartido.length))
      .toBe(1)

    expect(huboDescarga, 'se descargo en vez de abrir la hoja del sistema').toBe(false)
  })
})
