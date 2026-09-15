import { expect, test } from '@playwright/test'
import { PNG } from 'pngjs'

/**
 * Unidad 3 del PRP-TD-001 (ola 1): el color de marca sugerido desde el logo, de punta a punta.
 *
 * NO corre en esta sesion (worktree exclusivo de la unidad 3, comparte puerto con el director): se
 * escribe para que la verificacion de "verificar antes de integrar" lo corra aparte.
 */

/**
 * 200x100, con 60% de un azul saturado, 30% blanco puro y 10% rojo, por FILAS (asi el area de cada
 * color es exacta: 60 filas de 200 px, 30 filas de 200 px y 10 filas de 200 px).
 */
const png = new PNG({ width: 200, height: 100 })
const AZUL: [number, number, number, number] = [0x1d, 0x4e, 0xd8, 255]
const BLANCO: [number, number, number, number] = [255, 255, 255, 255]
const ROJO: [number, number, number, number] = [220, 20, 20, 255]
for (let y = 0; y < png.height; y++) {
  const color = y < 60 ? AZUL : y < 90 ? BLANCO : ROJO
  for (let x = 0; x < png.width; x++) png.data.set(color, (y * png.width + x) * 4)
}
const logoAzul = { name: 'logo-azul.png', mimeType: 'image/png', buffer: PNG.sync.write(png) }

/** Misma matematica que `src/shared/color/wcag.ts`, calculada aqui para no depender del bundle. */
function contraste(hexA: string, hexB: string): number {
  const rgb = (hex: string) => {
    const n = hex.replace('#', '')
    return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16))
  }
  const luminancia = ([r, g, b]: number[]) => {
    const canal = (c: number) => {
      const v = c / 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
  }
  const [la, lb] = [luminancia(rgb(hexA)), luminancia(rgb(hexB))]
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

test('el logo sugiere un color de marca legible, y la persona lo puede cambiar', async ({ page }) => {
  await page.goto('/editor')
  await page.locator('#logo').setInputFiles(logoAzul)

  const campoHex = page.locator('#color-marca-hex')
  await expect(campoHex).toHaveValue(/^#[0-9a-f]{6}$/i, { timeout: 10_000 })

  const sugeridoOscuro = await campoHex.inputValue()
  const [r, g, b] = [
    parseInt(sugeridoOscuro.slice(1, 3), 16),
    parseInt(sugeridoOscuro.slice(3, 5), 16),
    parseInt(sugeridoOscuro.slice(5, 7), 16),
  ]
  // El azul de la imagen predomina de lejos (60% del area, y el blanco/rojo se descartan por
  // luminancia o por no ser el mas frecuente): el canal B tiene que ganarle a los otros dos.
  expect(b, `el color sugerido ${sugeridoOscuro} no tiene tono azul`).toBeGreaterThan(r)
  expect(b, `el color sugerido ${sugeridoOscuro} no tiene tono azul`).toBeGreaterThan(g)
  expect(contraste(sugeridoOscuro, '#0a0a0b')).toBeGreaterThanOrEqual(4.5)

  // Cambiar a Claro recalcula: el mismo tono puede necesitar otra luminosidad para el fondo marfil.
  // El radio es sr-only y la etiqueta lo tapa: se pulsa la etiqueta, que es lo que toca la persona.
  await page.locator('label', { hasText: /^Claro$/ }).click()
  await expect(page.getByRole('radio', { name: 'Claro' })).toBeChecked()
  await expect
    .poll(async () => campoHex.inputValue(), { timeout: 10_000 })
    .not.toBe(sugeridoOscuro)
  const sugeridoClaro = await campoHex.inputValue()
  expect(contraste(sugeridoClaro, '#f7f1e4')).toBeGreaterThanOrEqual(4.5)

  // Un hex escrito a mano se refleja en la vista previa: el `--color-marca` del contenedor cambia.
  await campoHex.fill('#112233')
  await expect
    .poll(() =>
      page.evaluate(() => {
        const contenedor = document.querySelector('[data-testid="vista-previa"] [data-tema]') as HTMLElement | null
        return contenedor ? getComputedStyle(contenedor).getPropertyValue('--color-marca').trim() : null
      }),
    )
    .toBe('#112233')
})
