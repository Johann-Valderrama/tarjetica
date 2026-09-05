import { expect, test } from '@playwright/test'
import jsQR from 'jsqr'
import { PNG } from 'pngjs'
import { vcardParaQr } from '../src/features/tarjeta/vcard/generar'

/**
 * Unidad 4d, la mitad que de verdad importa: **decodificar el QR que la PAGINA pinto**, no el que
 * la libreria produce en Node.
 *
 * La prueba unitaria (`src/features/tarjeta/qr/qr-roundtrip.test.ts`) verifica que la libreria
 * codifica bien, y eso es util, pero no verifica que alguien la CONECTE: si el componente pasara
 * otro texto, otro margen, o simplemente no se montara, esa prueba seguiria en verde. Aqui se
 * arranca el build de PRODUCCION, se siembra una tarjeta, se le toma una captura al `<img>` real y
 * se decodifica esa captura.
 *
 * De paso cubre dos criterios de exito del PRP que nada mas puede cubrir:
 * el HTML del servidor no lleva un solo dato de la tarjeta, y la red no transporta esos datos.
 */

const LLENA = {
  n: 'María José',
  a: 'Peña Gutiérrez',
  c: 'Directora de operaciones, logística y compras',
  em: 'Alimentos del Norte S.A.S.',
  co: 'maria.pena@example.com',
  t: [
    { n: '+57 310 555 1234', e: 'whatsapp' },
    { n: '+57 601 555 0000', e: 'oficina' },
  ],
  w: 'https://alimentosdelnorte.example.com',
  li: 'mariapena',
  d: 'Bogotá · Colombia',
  ti: 'Recupera las horas que tu operación te quita.',
  de: 'Tu equipo deja el trabajo repetitivo; vuelve a decidir, crear y vender.',
} as const

const MINIMA = { n: 'Ana', a: 'Ríos' } as const

function decodificar(captura: Buffer): string | null {
  const imagen = PNG.sync.read(captura)
  return jsQR(new Uint8ClampedArray(imagen.data), imagen.width, imagen.height)?.data ?? null
}

async function sembrar(page: import('@playwright/test').Page, datos: unknown) {
  await page.goto('/tarjeta')
  await page.evaluate((t) => {
    localStorage.clear()
    localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
  }, datos)
  await page.reload()
}

test.describe('el QR de la pantalla se lee de verdad', () => {
  for (const [nombre, datos] of [
    ['tarjeta minima', MINIMA],
    ['tarjeta con todos los campos', LLENA],
  ] as const) {
    test(`${nombre}: la captura del <img> decodifica al vCard esperado`, async ({ page }) => {
      await sembrar(page, datos)

      const qr = page.getByTestId('qr-contacto')
      await expect(qr).toBeVisible()

      const leido = decodificar(await qr.screenshot())
      // Caracter por caracter contra el vCard que produce el mismo generador que usa la app.
      expect(leido).toBe(vcardParaQr(datos as never))
    })
  }

  test('el codigo PINTADO queda sobre el piso de lectura, en el telefono que mas aprieta', async ({ page }) => {
    // Se mide el codigo PINTADO, no la caja que lo contiene. No es lo mismo: el `<img>` usa
    // `object-contain`, asi que su caja puede ser mas alta que ancha y el simbolo cuadrado queda
    // centrado adentro. Un assert sobre la caja daria un lado mayor que el real y aprobaria un QR
    // que no se lee. Es el mismo patron que ya se cazo dos veces en la Ola 3: medir una cosa y
    // creer que se probo otra.
    for (const pantalla of [
      { nombre: 'iPhone SE', width: 375, height: 667 },
      { nombre: 'Pixel 7', width: 412, height: 915 },
    ]) {
      await page.setViewportSize({ width: pantalla.width, height: pantalla.height })
      await sembrar(page, LLENA)
      await expect(page.getByTestId('qr-contacto')).toBeVisible()

      const m = await page.evaluate(() => {
        const img = document.querySelector('[data-testid="qr-contacto"]') as HTMLImageElement
        const caja = img.getBoundingClientRect()
        // Imagen cuadrada con `object-contain`: el lado pintado es el menor de la caja.
        const lado = Math.min(caja.width, caja.height)
        const modulos = Number(img.dataset.modulos)
        const margen = Number(img.dataset.margenModulos)
        return { lado, pxPorModulo: lado / (modulos + margen * 2) }
      })

      console.log(`  ${pantalla.nombre}: codigo de ${Math.round(m.lado)} px, ${m.pxPorModulo.toFixed(2)} px por cuadrito`)

      // Piso practico de lectura de una pantalla a otra, con el colchon de la regla 10:1 ya dentro.
      expect(
        m.pxPorModulo,
        `en ${pantalla.nombre} el codigo queda en ${m.pxPorModulo.toFixed(2)} px por cuadrito`,
      ).toBeGreaterThanOrEqual(2.5)
    }
  })

})

test.describe('D1: los datos no salen del navegador', () => {
  test('el HTML que sirve el servidor no contiene ningun dato de la tarjeta', async ({ page, request }) => {
    await sembrar(page, LLENA)
    await expect(page.getByTestId('qr-contacto')).toBeVisible()

    // El QR ya esta en pantalla; el HTML del servidor, pedido aparte, no puede saber nada de el.
    const html = await (await request.get('/tarjeta')).text()
    for (const dato of [LLENA.n, LLENA.a, LLENA.co, LLENA.em, LLENA.ti]) {
      expect(html, `el HTML del servidor trae "${dato}"`).not.toContain(dato)
    }
  })

  test('generar el QR no dispara ninguna peticion a un dominio ajeno', async ({ page }) => {
    const ajenas: string[] = []
    page.on('request', (r) => {
      const url = r.url()
      if (!url.startsWith('http://localhost:3210') && !url.startsWith('data:')) ajenas.push(url)
    })

    await sembrar(page, LLENA)
    await expect(page.getByTestId('qr-contacto')).toBeVisible()
    expect(ajenas, `recursos de fuera: ${ajenas.join(', ')}`).toEqual([])
  })
})
