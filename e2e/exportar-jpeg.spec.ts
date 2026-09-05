import { expect, test } from '@playwright/test'
import jsQR from 'jsqr'
import { PERFILES } from './perfiles.datos'

/**
 * Unidad 5c del PRP-TD-001: el `.jpeg`, sobre el build de PRODUCCION.
 *
 * **El error de esta ola es MUDO: un `.jpeg` en blanco no rompe nada.** El archivo se descarga, pesa
 * lo suyo, y solo cuando alguien lo abre se ve que el texto no esta, porque las webfonts no se
 * embebieron. Por eso ningun assert de "el archivo existe" sirve aqui.
 *
 * ⚠️ **Lo que este archivo NO puede probar, dicho para que nadie lo confunda con cobertura:** que la
 * imagen quede en el CARRETE del telefono. La hoja de compartir y el guardado en Fotos son del
 * sistema operativo, no del navegador, y aqui no existen. Ese arbitro es el gate fisico 5d, en un
 * iPhone y un Android reales y ademas dentro del navegador embebido de Instagram y de LinkedIn.
 * Lo de aqui es el filtro de "no esta vacia", no el de "esta bien".
 */

const PERFIL = PERFILES.find((p) => p.nombre === 'completo')!

/**
 * Siembra una tarjeta CONFIRMADA y abre el editor, que es desde donde se exporta.
 *
 * La imagen NO sale de la pantalla de la tarjeta: sale de un lienzo montado fuera de pantalla a
 * tamaño de telefono fijo (390x844), para que la imagen mida siempre lo mismo la genere quien la
 * genere, y para que la pantalla de la tarjeta se quede sin un solo control.
 */
async function abrirEditorListo(page: import('@playwright/test').Page, datos: unknown) {
  await page.goto('/editor')
  await page.evaluate((t) => {
    localStorage.clear()
    localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
    localStorage.setItem('tarjetica.confirmacion', JSON.stringify({ v: 1, d: true }))
  }, datos)
  await page.reload()
  // El QR del lienzo oculto tiene que estar pintado antes de capturar.
  await expect(page.getByTestId('qr-contacto')).toBeAttached()
  await expect(page.getByTestId('exportar-jpeg')).toBeEnabled()
}

/** Genera el `.jpeg` con el MISMO codigo que usa el boton, y lo devuelve como bytes. */
async function generarJpeg(page: import('@playwright/test').Page): Promise<Buffer> {
  await page.getByTestId('exportar-jpeg').click()
  const descarga = await page.waitForEvent('download')
  const ruta = await descarga.path()
  return (await import('node:fs/promises')).readFile(ruta)
}

test.describe('el .jpeg exportado', () => {
  test('no esta en blanco: dimensiones esperadas y varianza de pixeles sobre cero', async ({ page }) => {
    await abrirEditorListo(page, PERFIL.datos)

    // El lienzo es de tamaño FIJO (390x844), y el elemento capturable es eso menos el relleno del
    // marco. Se MIDE en vez de calcularlo a mano: la imagen tiene que ser 3 veces lo que se captura,
    // no 3 veces lo que uno cree que se captura.
    const caja = await page.evaluate(() => {
      const r = document.getElementById('tarjeta-capturable')!.getBoundingClientRect()
      return { ancho: Math.round(r.width), alto: Math.round(r.height) }
    })
    // Ancho fijo (390 del lienzo menos su relleno); alto SEGUN CONTENIDO, para que la imagen no
    // lleve huecos vacios cuando el texto es corto.
    expect(caja.ancho, 'el lienzo oculto no mide el ancho de un telefono').toBe(366)
    expect(caja.alto).toBeGreaterThan(400)

    const jpeg = await generarJpeg(page)
    expect(jpeg.byteLength).toBeGreaterThan(10_000)

    // Se decodifica de verdad, no se mira el tamaño del archivo: un JPEG de un color solido
    // tambien pesa unos cuantos KB.
    const { ancho, alto, varianza, tonos } = await page.evaluate(async (bytes) => {
      const blob = new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' })
      const bitmap = await createImageBitmap(blob)
      const lienzo = document.createElement('canvas')
      lienzo.width = bitmap.width
      lienzo.height = bitmap.height
      const ctx = lienzo.getContext('2d')!
      ctx.drawImage(bitmap, 0, 0)
      const datos = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data
      let suma = 0
      let sumaCuadrados = 0
      let n = 0
      const distintos = new Set<number>()
      for (let i = 0; i < datos.length; i += 4 * 37) {
        const gris = (datos[i] + datos[i + 1] + datos[i + 2]) / 3
        suma += gris
        sumaCuadrados += gris * gris
        n++
        distintos.add(Math.round(gris / 8))
      }
      const media = suma / n
      return { ancho: bitmap.width, alto: bitmap.height, varianza: sumaCuadrados / n - media * media, tonos: distintos.size }
    }, Array.from(jpeg))

    console.log(`  imagen ${ancho}x${alto}, varianza ${Math.round(varianza)}, ${tonos} tonos`)

    // pixelRatio 3: la imagen tiene que ser 3 veces la caja, con holgura de redondeo.
    expect(ancho).toBeGreaterThanOrEqual(caja.ancho * 3 - 6)
    expect(alto).toBeGreaterThanOrEqual(caja.alto * 3 - 6)

    // Varianza sobre cero descarta el color solido. Y los tonos distintos descartan una imagen de
    // dos colores planos, que un umbral de varianza sola dejaria pasar.
    expect(varianza, 'la imagen parece un color solido').toBeGreaterThan(100)
    expect(tonos, 'la imagen tiene demasiado pocos tonos: puede estar sin texto').toBeGreaterThan(8)
  })

  test('el texto SI esta en la imagen: las webfonts se embebieron', async ({ page }) => {
    // Es el gotcha numero uno de la ola y no lo delata ningun error: sin fuentes embebidas la
    // imagen sale con el texto invisible y la varianza global puede seguir siendo alta por el QR.
    // Se mide la BANDA del nombre, arriba, donde solo hay texto y el avatar.
    await abrirEditorListo(page, PERFIL.datos)
    const jpeg = await generarJpeg(page)

    const tinta = await page.evaluate(async (bytes) => {
      const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' }))
      const lienzo = document.createElement('canvas')
      lienzo.width = bitmap.width
      lienzo.height = bitmap.height
      lienzo.getContext('2d')!.drawImage(bitmap, 0, 0)
      // Banda del nombre: entre el 12% y el 22% del alto, saltandose el avatar de la izquierda.
      const y0 = Math.round(bitmap.height * 0.12)
      const alto = Math.round(bitmap.height * 0.1)
      const x0 = Math.round(bitmap.width * 0.35)
      const ancho = Math.round(bitmap.width * 0.6)
      const datos = lienzo.getContext('2d')!.getImageData(x0, y0, ancho, alto).data
      // El texto es casi blanco (#f5f5f7) sobre superficie casi negra (#141416). Se cuenta que
      // haya pixeles CLAROS: si la fuente no se embebio, esta banda queda toda oscura.
      let claros = 0
      for (let i = 0; i < datos.length; i += 4) if (datos[i] > 180) claros++
      return { claros, total: datos.length / 4 }
    }, Array.from(jpeg))

    const proporcion = tinta.claros / tinta.total
    console.log(`  banda del nombre: ${(proporcion * 100).toFixed(1)}% de pixeles claros`)
    expect(proporcion, 'la banda del nombre salio vacia: la fuente no se embebio').toBeGreaterThan(0.01)
  })

  test('el QR de la imagen SIGUE siendo escaneable despues de comprimir a JPEG', async ({ page }) => {
    // La compresion con perdida es justo lo que puede arruinar un patron de cuadritos finos, y la
    // imagen es una de las dos formas en que la tarjeta se reparte. Si el QR del `.jpeg` no se lee,
    // la mitad del producto no funciona y nada mas lo delataria.
    await abrirEditorListo(page, PERFIL.datos)
    const jpeg = await generarJpeg(page)

    const rgba = await page.evaluate(async (bytes) => {
      const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' }))
      const lienzo = document.createElement('canvas')
      lienzo.width = bitmap.width
      lienzo.height = bitmap.height
      const ctx = lienzo.getContext('2d')!
      ctx.drawImage(bitmap, 0, 0)
      const d = ctx.getImageData(0, 0, bitmap.width, bitmap.height)
      return { ancho: d.width, alto: d.height, datos: Array.from(d.data) }
    }, Array.from(jpeg))

    const leido = jsQR(new Uint8ClampedArray(rgba.datos), rgba.ancho, rgba.alto)
    expect(leido?.data, 'el QR del .jpeg no se pudo decodificar').toContain('BEGIN:VCARD')
    expect(leido!.data).toContain('Daniel Restrepo')
  })

  test('la firma de marca SI aparece en la imagen, y ningun control', async ({ page }) => {
    // G4: la firma es la unica palanca de distribucion que existe sin servidor, y va DENTRO del
    // capturable. Los controles van fuera. Se comprueba sobre el DOM real que se captura.
    await abrirEditorListo(page, PERFIL.datos)
    const dentro = await page.evaluate(() => {
      const c = document.getElementById('tarjeta-capturable')!
      return {
        firma: c.textContent?.includes('Tarjetica') ?? false,
        controles: c.querySelectorAll('button, a, input, select, textarea').length,
      }
    })
    expect(dentro.firma).toBe(true)
    expect(dentro.controles, 'hay un control dentro de lo que se captura').toBe(0)
  })
})

test('sin confirmar que la tarjeta es tuya, no se puede exportar', async ({ page }) => {
  // El aviso sin gate es decoracion. El `.jpeg` en Fotos se respalda solo a iCloud o Google: si
  // alguien hace la tarjeta de OTRA persona, los datos de esa persona terminan en su nube.
  await page.goto('/editor')
  await page.evaluate((t) => {
    localStorage.clear()
    localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
  }, PERFIL.datos)
  await page.reload()
  await expect(page.getByTestId('exportar-jpeg')).toBeDisabled()
  await expect(page.getByTestId('descargar-vcf')).toBeDisabled()
})

test('la pantalla de la tarjeta NO tiene ningun control, ni dentro ni fuera del capturable', async ({ page }) => {
  // Es lo que se le extiende a otra persona, y cada pixel de control es pixel que no es QR. Se
  // intento una barra flotante para guardar y tapaba el telefono y la firma: se midio y se quito.
  await page.goto('/tarjeta')
  await page.evaluate((t) => {
    localStorage.clear()
    localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
    localStorage.setItem('tarjetica.confirmacion', JSON.stringify({ v: 1, d: true }))
  }, PERFIL.datos)
  await page.reload()
  await expect(page.getByTestId('qr-contacto')).toBeVisible()
  expect(await page.locator('button, a, input, select, textarea').count()).toBe(0)
})

test('el lienzo de exportacion esta RENDERIZADO, no oculto con display none', async ({ page }) => {
  // Un elemento que no se pinta no tiene dimensiones, asi que la captura saldria vacia o de 0x0 y
  // sin ningun error. Es el fallo mudo propio de este montaje.
  await abrirEditorListo(page, PERFIL.datos)
  const medida = await page.evaluate(() => {
    const nodo = document.getElementById('tarjeta-capturable')!
    const r = nodo.getBoundingClientRect()
    return { ancho: Math.round(r.width), alto: Math.round(r.height), display: getComputedStyle(nodo).display }
  })
  expect(medida.display).not.toBe('none')
  expect(medida.ancho).toBeGreaterThan(300)
  // El alto va segun contenido; lo que este assert vigila es que NO sea cero, que es lo que
  // pasaria con `display: none` y sin ningun error.
  expect(medida.alto).toBeGreaterThan(400)
})

test('exportar no dispara ninguna peticion a un dominio ajeno', async ({ page }) => {
  const ajenas: string[] = []
  page.on('request', (r) => {
    const url = r.url()
    if (!url.startsWith('http://localhost:3210') && !url.startsWith('data:') && !url.startsWith('blob:')) {
      ajenas.push(url)
    }
  })
  await abrirEditorListo(page, PERFIL.datos)
  await generarJpeg(page)
  expect(ajenas, `recursos de fuera: ${ajenas.join(', ')}`).toEqual([])
})
