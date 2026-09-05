import { expect, test, type Page } from '@playwright/test'

/**
 * Unidad 3d del PRP-TD-001: verificacion de superficie en viewport de telefono.
 *
 * La app se usa de pie, en una conferencia, en el telefono del usuario. El monitor del desarrollador
 * no es el caso real, y el proyecto corre todo el E2E en Chromium movil (Pixel 7, 375 px logicos).
 *
 * Aqui viven los tres asserts que protegen decisiones, no apariencias:
 *  - **D1b**: la tarjeta es UNA SOLA VISTA, sin selector de modos.
 *  - **D3a**: las redes y los enlaces NO se muestran en pantalla; viajan dentro del vCard del QR.
 *  - **3b**: el nodo que se exporta no contiene ni un solo control. Si un boton se cuela ahi, sale
 *    en el `.jpeg` que el usuario regala, y nada mas lo delata: la app funciona igual de bien.
 */

const TARJETA_LLENA = {
  n: 'Daniel',
  a: 'Restrepo',
  c: 'CTO',
  em: 'Norte Soluciones TI',
  co: 'daniel@ejemplo.com',
  t: [
    { n: '+57 300 123 4567', e: 'whatsapp' },
    { n: '601 555 0000', e: 'oficina' },
  ],
  w: 'https://danielrestrepo.example',
  li: 'danielrestrepo',
  ig: 'johannvn',
  l: [{ u: 'https://ejemplo.com/portafolio', e: 'Portafolio' }],
  d: 'Bogotá · Colombia',
  ti: 'Recupera las horas que tu operación te quita.',
  de: 'Tu equipo deja el trabajo repetitivo y vuelve a lo que de verdad importa: decidir, crear.',
}

async function sembrarYAbrir(page: Page, tarjeta: unknown) {
  await page.goto('/tarjeta')
  await page.evaluate(
    ([t]) => {
      localStorage.clear()
      localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
    },
    [tarjeta],
  )
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

test.describe('3d · superficie a 375 px', () => {
  test('la tarjeta llena no desborda y ningun control baja de 44 px', async ({ page }) => {
    await sembrarYAbrir(page, TARJETA_LLENA)

    const medida = await page.evaluate(() => {
      const chicos = [...document.querySelectorAll('button, select, textarea, input')]
        .filter((e) => {
          const r = e.getBoundingClientRect()
          return r.height > 0 && r.height < 44
        })
        .map((e) => e.tagName + ' h=' + Math.round(e.getBoundingClientRect().height))
      return {
        desborde: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        chicos,
      }
    })

    expect(medida.desborde, 'desborde horizontal').toBe(false)
    expect(medida.chicos, 'controles bajo 44 px').toEqual([])
  })

  test('D1b · es UNA SOLA VISTA: no existe ningun selector de modos', async ({ page }) => {
    await sembrarYAbrir(page, TARJETA_LLENA)
    const controles = await page.evaluate(() => ({
      tablists: document.querySelectorAll('[role="tablist"]').length,
      tabs: document.querySelectorAll('[role="tab"]').length,
    }))
    expect(controles.tablists).toBe(0)
    expect(controles.tabs).toBe(0)
  })

  test('3b · el elemento capturable NO contiene ningun control', async ({ page }) => {
    await sembrarYAbrir(page, TARJETA_LLENA)
    const controles = await page.evaluate(() => {
      const nodo = document.getElementById('tarjeta-capturable')
      if (!nodo) return ['no existe el elemento capturable']
      return [...nodo.querySelectorAll('button, input, select, textarea, a, [role="tab"]')].map(
        (e) => e.tagName,
      )
    })
    expect(controles, 'controles dentro del capturable').toEqual([])
  })

  test('D3a · lo que se VE y lo que se GUARDA son cosas distintas', async ({ page }) => {
    await sembrarYAbrir(page, TARJETA_LLENA)
    const texto = await page.evaluate(
      () => document.getElementById('tarjeta-capturable')?.innerText ?? '',
    )

    // Lo que SI se ve: identidad, los dos bloques y UN telefono.
    expect(texto).toContain('Daniel Restrepo')
    expect(texto).toContain('Norte Soluciones TI')
    expect(texto).toContain('Recupera las horas')
    expect(texto).toContain('+57 300 123 4567')

    // Lo que NO se ve, porque viaja dentro del vCard que el QR guarda en la agenda ajena.
    for (const oculto of [
      'johannvn', // Instagram
      'danielrestrepo.example', // sitio web
      'ejemplo.com/portafolio', // enlace libre
      '601 555 0000', // el segundo telefono
      'daniel@ejemplo.com', // correo
    ]) {
      expect(texto, `"${oculto}" no deberia verse en pantalla`).not.toContain(oculto)
    }
  })

  test('3e · la firma de marca SI esta dentro del capturable', async ({ page }) => {
    await sembrarYAbrir(page, TARJETA_LLENA)
    const texto = await page.evaluate(
      () => document.getElementById('tarjeta-capturable')?.innerText ?? '',
    )
    expect(texto).toContain('Tarjetica')
  })

  test('la tarjeta minima (solo nombre) tambien renderiza', async ({ page }) => {
    await sembrarYAbrir(page, { n: 'Ana' })
    await expect(page.getByRole('heading', { name: 'Ana' })).toBeVisible()
    await expect(page.getByTestId('monograma-vista')).toHaveText('A')
    const desborde = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(desborde).toBe(false)
  })

  test('sin tarjeta guardada, manda al editor en vez de romperse', async ({ page }) => {
    await page.goto('/tarjeta')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await expect(page.getByRole('link', { name: 'Créala en el editor' })).toBeVisible()
  })
})
