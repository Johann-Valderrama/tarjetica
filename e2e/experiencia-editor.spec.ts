import { expect, test } from '@playwright/test'

test('un borrador dañado avisa y no se reemplaza silenciosamente al abrir', async ({ page }) => {
  await page.goto('/editor')
  await expect(page.getByLabel('Nombre *', { exact: true })).toBeVisible()
  const corrupto = JSON.stringify({ v: 1, d: { w: 7 } })
  await page.evaluate((dato) => localStorage.setItem('tarjetica.tarjeta', dato), corrupto)
  await page.reload()
  await expect(page.getByTestId('estado-guardado')).toContainText('No pudimos leer')
  await expect(page.getByLabel('Nombre *', { exact: true })).toHaveValue('')
  await page.waitForTimeout(600)
  expect(await page.evaluate(() => localStorage.getItem('tarjetica.tarjeta'))).toBe(corrupto)
  await page.getByLabel('Nombre *', { exact: true }).fill('Lucía')
  await expect(page.getByTestId('estado-guardado')).toHaveText('Guardado en este dispositivo')
})

test('la etiqueta traducida de foto abre el selector de archivos', async ({ page }) => {
  await page.goto('/editor')
  const [selector] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByText('Elegir foto', { exact: true }).click(),
  ])
  expect(selector.isMultiple()).toBe(false)
})

test('la última edición se guarda antes de navegar, sin esperar un temporizador', async ({ page }) => {
  await page.goto('/editor')
  await page.getByLabel('Nombre *', { exact: true }).fill('Lucía')
  // Lectura inmediata: esperar «Guardado» escondería la ventana de pérdida del autosave anterior.
  const dato = await page.evaluate(() => JSON.parse(localStorage.getItem('tarjetica.tarjeta') ?? 'null'))
  expect(dato?.d.n).toBe('Lucía')
  await page.getByRole('checkbox', { name: /Confirmo/ }).check()
  await page.getByLabel('Nombre *', { exact: true }).fill('Lucía Actualizada')
  await page.getByTestId('mostrar-qr').dispatchEvent('click')
  await expect(page.getByRole('heading', { name: 'Lucía Actualizada', exact: true })).toBeVisible()
})

test('borrar no recrea claves después del antiguo plazo del autosave', async ({ page }) => {
  await page.goto('/editor')
  await page.getByLabel('Nombre *', { exact: true }).fill('Lucía')
  await page.getByRole('checkbox', { name: /Confirmo/ }).check()
  await page.getByRole('button', { name: 'Borrar mis datos de este dispositivo' }).click()
  await expect(page.getByLabel('Nombre *', { exact: true })).toHaveValue('')
  await page.waitForTimeout(600)
  expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('tarjetica.')))).toEqual([])
})

test('en escritorio la vista previa cambia, sin duplicar el lienzo de exportación', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/editor')
  await page.getByLabel('Nombre *', { exact: true }).fill('Lucía')
  await page.getByLabel('Titular', { exact: true }).fill('Diseño con intención.')
  const previa = page.getByTestId('vista-previa')
  await expect(previa).toBeVisible()
  await expect(previa.getByRole('heading', { name: 'Lucía' })).toBeVisible()
  await expect(previa.getByText('Diseño con intención.')).toBeVisible()
  await expect(previa.getByTestId('qr-contacto')).toHaveCount(0)
  await expect(page.locator('#tarjeta-capturable')).toHaveCount(1)
  await page.getByRole('link', { name: 'Ir a compartir' }).click()
  await expect(page.getByRole('heading', { name: 'Compartir', exact: true })).toBeInViewport()
})

test('la portada muestra un ejemplo sin reemplazar la tarjeta del visitante', async ({ page }) => {
  await page.goto('/editor')
  await page.getByLabel('Nombre *', { exact: true }).fill('Lucía')
  await expect(page.getByTestId('estado-guardado')).toHaveText('Guardado en este dispositivo')
  const antes = await page.evaluate(() => localStorage.getItem('tarjetica.tarjeta'))
  await page.goto('/')
  await expect(page.getByTestId('ejemplo-con-foto').getByRole('heading', { name: 'Alex Rivera' })).toBeVisible()
  await expect(page.getByTestId('ejemplo-con-foto').getByRole('img', { name: 'Foto de Alex Rivera' })).toHaveAttribute('src', '/ejemplos/profesional-ia.webp')
  await expect(page.getByTestId('ejemplo-sin-foto').getByRole('img', { name: 'Foto de Alex Rivera' })).toHaveCount(0)
  await expect(page.getByTestId('ejemplo-contacto')).toContainText('alex@example.com')
  await expect(page.getByTestId('ejemplo-contacto')).toContainText('https://example.com/portfolio')
  await expect(page.locator('#tarjeta-capturable')).toHaveCount(0)
  expect(await page.evaluate(() => localStorage.getItem('tarjetica.tarjeta'))).toBe(antes)
  await expect(page.locator('[data-limite]')).toHaveCount(4)
})
