import { expect, test, type Page } from '@playwright/test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * E2E de la Ola 2 del PRP-TD-001, contra el BUILD DE PRODUCCION.
 *
 * Cubre las tres unidades cuyo fallo seria SILENCIOSO:
 *  - 2c: el autosave. Uno que no guarda se ve identico a uno que si, hasta que el usuario vuelve.
 *  - 2d: la confirmacion como GATE. Un aviso sin gate es decoracion, y ningun test de
 *        funcionamiento lo delata: la app anda igual de bien sin el.
 *  - 2e: la reduccion de la foto. Sin ella el guardado falla por cuota EN SILENCIO.
 *
 * No usa dobles de `localStorage` ni del canvas: si se sustituyera justo la capa que puede fallar,
 * la prueba no verificaria nada.
 */

const CLAVE_TARJETA = 'tarjetica.tarjeta'
const CLAVE_FOTO = 'tarjetica.foto'

async function irAlEditorLimpio(page: Page) {
  await page.goto('/editor')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Tu tarjeta' })).toBeVisible()
}

test.describe('2c · autosave e hidratacion', () => {
  test('lo que escribo sigue ahi despues de recargar', async ({ page }) => {
    await irAlEditorLimpio(page)

    await page.fill('#n', 'Johann')
    await page.fill('#a', 'Valderrama')
    await page.fill('#co', 'johann@example.com')
    await expect(page.getByTestId('estado-guardado')).toHaveText('Guardado en este dispositivo')

    await page.reload()

    await expect(page.locator('#n')).toHaveValue('Johann')
    await expect(page.locator('#a')).toHaveValue('Valderrama')
    await expect(page.locator('#co')).toHaveValue('johann@example.com')
  })

  test('no pisa lo guardado con un borrador vacio antes de hidratar', async ({ page }) => {
    await irAlEditorLimpio(page)
    await page.fill('#n', 'Johann')
    await expect(page.getByTestId('estado-guardado')).toHaveText('Guardado en este dispositivo')

    // Se recarga y se lee el disco INMEDIATAMENTE, sin esperar: si el primer autosave corriera
    // antes de hidratar, aqui ya no quedaria nada.
    await page.reload()
    const guardado = await page.evaluate((k) => localStorage.getItem(k), CLAVE_TARJETA)
    expect(guardado).toContain('Johann')
  })

  test('el monograma sale de las iniciales cuando no hay foto', async ({ page }) => {
    await irAlEditorLimpio(page)
    await page.fill('#n', 'Johann')
    await page.fill('#a', 'Valderrama')
    await expect(page.getByTestId('monograma')).toHaveText('JV')
  })
})

test.describe('2d · la confirmacion es un GATE, no un aviso', () => {
  test('exportar esta bloqueado hasta marcar la confirmacion', async ({ page }) => {
    await irAlEditorLimpio(page)

    // Sin nombre no hay nada que exportar.
    await expect(page.getByTestId('exportar-jpeg')).toBeDisabled()

    await page.fill('#n', 'Johann')
    // Con nombre pero SIN confirmar, sigue bloqueado. Este es el assert que justifica la unidad.
    await expect(page.getByTestId('exportar-jpeg')).toBeDisabled()
    await expect(page.getByTestId('mostrar-qr')).toBeDisabled()

    await page.getByRole('checkbox').check()
    await expect(page.getByTestId('exportar-jpeg')).toBeEnabled()
    await expect(page.getByTestId('mostrar-qr')).toBeEnabled()
  })

  test('borrar deja el editor vacio y la clave SIN RASTRO', async ({ page }) => {
    await irAlEditorLimpio(page)
    await page.fill('#n', 'Johann')
    await expect(page.getByTestId('estado-guardado')).toHaveText('Guardado en este dispositivo')

    await page.getByRole('button', { name: 'Borrar mis datos de este dispositivo' }).click()
    await page.reload()

    await expect(page.locator('#n')).toHaveValue('')
    // No basta con que el editor se vea vacio: la clave no puede existir.
    const claves = await page.evaluate(() => Object.keys(localStorage))
    expect(claves).not.toContain(CLAVE_TARJETA)
    expect(claves).not.toContain(CLAVE_FOTO)
  })

  test('las advertencias de direccion y notas estan pegadas a su campo', async ({ page }) => {
    await irAlEditorLimpio(page)
    await expect(page.getByText(/Piensa si quieres poner tu casa/)).toBeVisible()
    await expect(page.getByText(/evita datos delicados/)).toBeVisible()
  })
})

test.describe('2e · la foto se reduce ANTES de guardar', () => {
  test('una foto pesada con EXIF queda chica, sin EXIF, y el guardado no falla', async ({
    page,
  }) => {
    await irAlEditorLimpio(page)

    // Se fabrica un JPEG grande DE VERDAD en el navegador (ruido, que no comprime bien), y despues
    // se le inyecta un segmento EXIF: un JPEG de canvas no trae EXIF, asi que sin este paso la
    // prueba de "se le quita el EXIF" no probaria nada.
    const base64Original = await page.evaluate(async () => {
      const lado = 2400
      const lienzo = document.createElement('canvas')
      lienzo.width = lado
      lienzo.height = lado
      const ctx = lienzo.getContext('2d')!
      const datos = ctx.createImageData(lado, lado)
      for (let i = 0; i < datos.data.length; i += 4) {
        datos.data[i] = Math.random() * 255
        datos.data[i + 1] = Math.random() * 255
        datos.data[i + 2] = Math.random() * 255
        datos.data[i + 3] = 255
      }
      ctx.putImageData(datos, 0, 0)
      return lienzo.toDataURL('image/jpeg', 1).split(',')[1]
    })

    const sinExif = Buffer.from(base64Original, 'base64')
    const conExif = inyectarExif(sinExif)
    expect(conExif.includes(Buffer.from('Exif'))).toBe(true)
    // La premisa de esta prueba es que la foto de entrada es PESADA. Si no lo fuera, pasaria sin
    // ejercer nada.
    expect(conExif.byteLength).toBeGreaterThan(1_000_000)

    const carpeta = mkdtempSync(join(tmpdir(), 'tarjetica-'))
    const ruta = join(carpeta, 'foto-pesada.jpg')
    writeFileSync(ruta, conExif)

    await page.setInputFiles('#foto', ruta)

    // Que la foto se vea es la senal de que el guardado no lanzo.
    await expect(page.getByAltText('Tu foto de perfil')).toBeVisible({ timeout: 20_000 })

    const guardada = await page.evaluate((k) => localStorage.getItem(k), CLAVE_FOTO)
    expect(guardada).not.toBeNull()

    const dataUrl = JSON.parse(guardada!).d.dataUrl as string
    expect(dataUrl.startsWith('data:image/jpeg')).toBe(true)
    expect(dataUrl.length).toBeLessThan(20_000)

    const bytesFinales = Buffer.from(dataUrl.split(',')[1], 'base64')
    expect(bytesFinales.includes(Buffer.from('Exif'))).toBe(false)
  })

  test('la foto NO entra en la clave de la tarjeta', async ({ page }) => {
    await irAlEditorLimpio(page)
    await page.fill('#n', 'Johann')
    await expect(page.getByTestId('estado-guardado')).toHaveText('Guardado en este dispositivo')

    const tarjeta = await page.evaluate((k) => localStorage.getItem(k), CLAVE_TARJETA)
    // Es la invariante de G5 vista desde afuera: la foto vive en su propia clave, y por eso el
    // codec del enlace y el vCard del QR no pueden arrastrarla.
    expect(tarjeta).not.toContain('data:image')
  })
})

/**
 * Mete un segmento APP1/Exif bien formado justo despues del SOI. Los decodificadores lo saltan,
 * asi que la imagen sigue siendo valida; lo que importa es que el JPEG de ENTRADA si lo traiga.
 */
function inyectarExif(jpeg: Buffer): Buffer {
  const tiff = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ])
  const carga = Buffer.concat([Buffer.from('Exif\0\0', 'latin1'), tiff])
  const largo = Buffer.alloc(2)
  largo.writeUInt16BE(carga.byteLength + 2)
  const app1 = Buffer.concat([Buffer.from([0xff, 0xe1]), largo, carga])
  return Buffer.concat([jpeg.subarray(0, 2), app1, jpeg.subarray(2)])
}
