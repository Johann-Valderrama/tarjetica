import { expect, test } from '@playwright/test'
import { PNG } from 'pngjs'
import { readFile } from 'node:fs/promises'
import jsQR from 'jsqr'
import { PERFILES } from './perfiles.datos'

const png = new PNG({ width: 400, height: 100 })
for (let y = 10; y < 90; y++) for (let x = 10; x < 390; x++) {
  const i = (y * png.width + x) * 4
  png.data.set([0, 220, 220, 255], i)
}
const logo = { name: 'logo.png', mimeType: 'image/png', buffer: PNG.sync.write(png) }

test('logo independiente: conserva formato, persiste y aparece en el JPEG', async ({ page }) => {
  await page.goto('/editor')
  await page.getByLabel('Nombre *', { exact: true }).fill('Marca de prueba')
  await page.locator('#foto').setInputFiles('public/ejemplos/profesional-ia.webp')
  await expect(page.getByAltText('Tu foto de perfil')).toBeVisible()
  await page.locator('#logo').setInputFiles(logo)
  await expect(page.getByRole('button', { name: 'Quitar logo' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Quitar logo' })).toBeVisible()
  const imagen = await page.evaluate(() => JSON.parse(localStorage.getItem('tarjetica.logo')!).d.dataUrl as string)
  const reducida = PNG.sync.read(Buffer.from(imagen.split(',')[1], 'base64'))
  expect(reducida.width / reducida.height).toBe(4)
  expect(reducida.data[3]).toBe(0)
  await page.getByRole('checkbox', { name: /Confirmo/ }).check()
  const [descarga] = await Promise.all([
    page.waitForEvent('download'), page.getByTestId('exportar-jpeg').click(),
  ])
  const bytes = await readFile((await descarga.path())!)
  const pixelesLogo = await page.evaluate(async (bytes) => {
    const img = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' }))
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const ctx = c.getContext('2d')!; ctx.drawImage(img, 0, 0); img.close()
    const d = ctx.getImageData(0, 0, c.width, c.height).data
    let total = 0
    for (let i = 0; i < d.length; i += 4) if (d[i] < 70 && d[i + 1] > 170 && d[i + 2] > 170) total++
    return total
  }, [...bytes])
  expect(pixelesLogo).toBeGreaterThan(500)
  await page.getByRole('button', { name: 'Quitar logo' }).click()
  await expect(page.getByTestId('logo-tarjeta')).toHaveCount(0)
  await expect(page.getByAltText('Tu foto de perfil')).toBeVisible()
  await page.locator('#logo').setInputFiles(logo)
  await expect(page.getByRole('button', { name: 'Quitar logo' })).toBeVisible()
  await page.getByRole('button', { name: 'Borrar mis datos de este dispositivo' }).click()
  expect(await page.evaluate(() => localStorage.getItem('tarjetica.logo'))).toBeNull()
})

test('si falla el guardado o el archivo, conserva el logo anterior', async ({ page }) => {
  await page.goto('/editor')
  await page.locator('#logo').setInputFiles(logo)
  await expect(page.getByRole('button', { name: 'Quitar logo' })).toBeVisible()
  const anterior = await page.evaluate(() => localStorage.getItem('tarjetica.logo'))
  await page.locator('#logo').setInputFiles({ name: 'mal.png', mimeType: 'image/png', buffer: Buffer.from('no es una imagen') })
  await expect(page.getByRole('alert').filter({ hasText: 'No pudimos procesar el logo' })).toBeVisible()
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function(k, v) { if (k === 'tarjetica.logo') throw new Error('cuota'); original.call(this, k, v) }
  })
  await page.locator('#logo').setInputFiles(logo)
  await expect(page.getByRole('alert').filter({ hasText: 'No pudimos guardar el logo' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('tarjetica.logo'))).toBe(anterior)
})

for (const perfil of PERFILES) test(`foto y logo caben y el QR se lee: ${perfil.nombre}`, async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/editor')
  await page.evaluate((datos) => localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: datos })), perfil.datos)
  await page.reload()
  await page.locator('#foto').setInputFiles('public/ejemplos/profesional-ia.webp')
  await expect(page.getByAltText('Tu foto de perfil')).toBeVisible()
  await page.locator('#logo').setInputFiles(logo)
  await expect(page.getByRole('button', { name: 'Quitar logo' })).toBeVisible()
  await page.goto('/tarjeta')
  await expect(page.getByTestId('logo-tarjeta')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true)
  const qr = PNG.sync.read(await page.getByTestId('qr-contacto').screenshot())
  const contacto = jsQR(new Uint8ClampedArray(qr.data), qr.width, qr.height)?.data
  expect(contacto).toContain(`FN:${perfil.datos.n}`)
  expect(contacto).not.toContain('data:image')
  await page.screenshot({ path: `test-results/logo-${perfil.nombre}.png` })
})
