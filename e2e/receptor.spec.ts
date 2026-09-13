import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { deflateRawSync } from 'node:zlib'
import { PNG } from 'pngjs'
import jsQR from 'jsqr'

const perfil = { n: 'Alexa', a: 'Rivera', c: 'Consultora de innovación', em: 'Estudio Norte', co: 'alexa@example.com', t: [{ n: '+57 300 123 4567', e: 'whatsapp' }], w: 'https://example.com/', li: 'alexa-rivera', l: [{ e: 'Mi portafolio', u: 'https://example.org/portfolio' }], d: 'Bogotá, Colombia', ti: 'Automatizo tareas para que tu equipo venda más.', de: 'Diseñamos procesos simples para pequeñas empresas. Conversemos sobre lo que tu equipo necesita.' }
function enlace(datos: unknown, comprimido = false) {
  const json = Buffer.from(JSON.stringify(datos))
  return '/t#' + Buffer.concat([Buffer.from([comprimido ? 1 : 0]), comprimido ? deflateRawSync(json) : json]).toString('base64url')
}

test('acciones del receptor descargan sus datos sin tocar los del visitante ni pedir recursos externos', async ({ page }) => {
  await page.goto('/editor')
  await page.evaluate(() => localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: { n: 'Visitante' } })))
  const antes = await page.evaluate(() => JSON.stringify(localStorage))
  const ajenas: string[] = []
  page.on('request', request => { if (!request.url().startsWith('http://localhost:3210') && !/^(data|blob):/.test(request.url())) ajenas.push(request.url()) })
  await page.goto(enlace(perfil))
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Alexa Rivera')
  await expect(page.getByTestId('qr-contacto')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', 'https://wa.me/573001234567')
  await expect(page.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://linkedin.com/in/alexa-rivera')
  for (const link of await page.getByRole('navigation').getByRole('link').all()) {
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(link).toHaveAttribute('referrerpolicy', 'no-referrer')
  }
  const pendiente = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Guardar contacto' }).click()
  const archivo = await pendiente
  const contenido = (await readFile((await archivo.path())!, 'utf8')).replace(/\r?\n /g, '')
  expect(contenido).toContain('FN:Alexa Rivera')
  expect(contenido).toContain('alexa@example.com')
  expect(contenido).toContain('https://example.com/')
  expect(contenido).toContain('Estudio Norte')
  expect(contenido).toContain('+57 300 123 4567')
  expect(contenido).not.toContain('Visitante')
  expect(contenido).not.toContain('tarjetica-app')
  await expect(page.getByRole('status')).toContainText('Archivo listo')
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(antes)
  expect(ajenas).toEqual([])
})

test('el QR se abre a pedido, se lee y devuelve el foco al cerrar con Escape', async ({ page }) => {
  await page.goto(enlace(perfil))
  const abrir = page.getByRole('button', { name: 'Mostrar QR' })
  await abrir.click()
  const dialogo = page.getByRole('dialog', { name: 'Escanea el contacto' })
  await expect(dialogo).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cerrar QR' })).toBeFocused()
  const imagen = PNG.sync.read(await page.getByTestId('qr-contacto').screenshot())
  expect(jsQR(new Uint8ClampedArray(imagen.data), imagen.width, imagen.height)?.data).toContain('FN:Alexa Rivera')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialogo).toHaveCount(0)
  await expect(abrir).toBeFocused()
})

test('sin WhatsApp internacional ni enlaces no aparecen acciones vacías', async ({ page }) => {
  await page.goto(enlace({ n: 'Sofía', t: [{ n: '300 123 4567', e: 'whatsapp' }] }))
  await expect(page.getByRole('button', { name: 'Guardar contacto' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'WhatsApp' })).toHaveCount(0)
  await expect(page.getByRole('navigation')).toHaveCount(0)
})

test('cambiar de fragmento actualiza perfil y acciones, cerrando el QR anterior', async ({ page }) => {
  await page.goto(enlace(perfil))
  await page.getByRole('button', { name: 'Mostrar QR' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.evaluate(hash => { location.hash = hash }, enlace({ n: 'Nuevo contacto' }).split('#')[1])
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nuevo contacto')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'WhatsApp' })).toHaveCount(0)
})

test('una lectura antigua lenta no sustituye el fragmento más reciente', async ({ page }) => {
  await page.addInitScript(() => {
    const Original = DecompressionStream
    Object.defineProperty(window, 'DecompressionStream', { value: class {
      readable: ReadableStream
      writable: WritableStream
      constructor(format: CompressionFormat) {
        const original = new Original(format)
        this.writable = original.writable
        this.readable = original.readable.pipeThrough(new TransformStream({ async transform(chunk, controller) {
          await new Promise(resolve => setTimeout(resolve, 600))
          controller.enqueue(chunk)
        } }))
        ;(window as unknown as { leyendo: boolean }).leyendo = true
      }
    } })
  })
  await page.goto(enlace(perfil, true))
  await page.waitForFunction(() => (window as unknown as { leyendo?: boolean }).leyendo)
  await page.evaluate(hash => { location.hash = hash }, enlace({ n: 'Último perfil' }).split('#')[1])
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Último perfil')
  await page.waitForTimeout(900)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Último perfil')
})

test('un navegador sin descompresión nativa abre enlaces comprimidos existentes', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'DecompressionStream', { value: undefined }) })
  await page.goto(enlace(perfil, true))
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Alexa Rivera')
})

for (const ancho of [375, 1280]) {
  test(`perfil completo sin desborde a ${ancho}px`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: ancho === 375 ? 812 : 900 })
    await page.goto(enlace(perfil))
    await expect(page.getByRole('button', { name: 'Guardar contacto' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `test-results/receptor-${ancho}.png`, fullPage: true })
  })
}

test('el receptor habla inglés según el navegador', async ({ browser }) => {
  const contexto = await browser.newContext({ locale: 'en-US' })
  const page = await contexto.newPage()
  await page.goto('http://localhost:3210' + enlace(perfil))
  await expect(page.getByRole('button', { name: 'Save contact' })).toBeVisible()
  await page.getByRole('button', { name: 'Show QR' }).click()
  await expect(page.getByRole('dialog', { name: 'Scan the contact' })).toBeVisible()
  await contexto.close()
})

