import { expect, test, type Page } from '@playwright/test'

/**
 * Unidad 3d del PRP-TD-001: verificacion de superficie en viewport de telefono.
 *
 * La app se usa de pie, en una conferencia, en el telefono del usuario. El monitor del desarrollador
 * no es el caso real, y el proyecto corre todo el E2E en Chromium movil (Pixel 7, 375 px logicos).
 *
 * Ademas del desborde y los objetivos tactiles, aqui vive el assert que protege la unidad 3b: **el
 * nodo que se exporta no puede contener ni un solo control**. Si un boton se cuela ahi, sale en el
 * `.jpeg` que el usuario regala, y nada mas lo delata: la app funciona igual de bien.
 */

const TARJETA_LLENA = {
  n: 'Johann',
  a: 'Valderrama',
  c: 'Agentic operations',
  em: 'Zelandia',
  co: 'johann@example.com',
  t: [
    { n: '3192480121', e: 'whatsapp' },
    { n: '6015550000', e: 'oficina' },
  ],
  w: 'https://johannvalderrama.com',
  li: 'johannvalderrama',
  ig: 'johannvn',
  l: [{ u: 'https://ejemplo.com/portafolio', e: 'Portafolio' }],
  d: 'Bogotá, Colombia',
  no: 'Once años dentro de operaciones reales: Project Controls, Oil & Gas y Energía.',
  s: {
    t: 'Recupera las horas que tu operación te quita.',
    c: [
      { v: '83%', e: 'menos tiempo de reporte' },
      { v: '815', e: 'proyectos' },
      { v: 'USD 86M', e: 'capital gestionado' },
    ],
    p: '¿Cuánto de ese cuello de botella vuelve a tu bolsillo?',
  },
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
  await expect(page.getByRole('tablist')).toBeVisible()
}

test.describe('3d · superficie a 375 px', () => {
  test('la tarjeta llena no desborda y ningun control baja de 44 px', async ({ page }) => {
    await sembrarYAbrir(page, TARJETA_LLENA)

    for (const modo of ['Tarjeta', 'Código QR']) {
      await page.getByRole('tab', { name: modo }).click()

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

      expect(medida.desborde, `desborde horizontal en la vista ${modo}`).toBe(false)
      expect(medida.chicos, `controles bajo 44 px en la vista ${modo}`).toEqual([])
    }
  })

  test('3b · el elemento capturable NO contiene ningun control', async ({ page }) => {
    await sembrarYAbrir(page, TARJETA_LLENA)

    for (const modo of ['Tarjeta', 'Código QR']) {
      await page.getByRole('tab', { name: modo }).click()
      const controles = await page.evaluate(() => {
        const nodo = document.getElementById('tarjeta-capturable')
        if (!nodo) return ['no existe el elemento capturable']
        return [...nodo.querySelectorAll('button, input, select, textarea, [role="tab"]')].map(
          (e) => e.tagName,
        )
      })
      expect(controles, `controles dentro del capturable en la vista ${modo}`).toEqual([])
    }
  })

  test('3a · la fila de cifras queda alineada y la etiqueta no se lee dos veces', async ({
    page,
  }) => {
    await sembrarYAbrir(page, TARJETA_LLENA)

    // MEDIDO antes de existir este assert: los tres bloques median 66, 51 y 98 px porque
    // "USD 86M" se partia en dos lineas, y la fila se veia torcida. Ninguna otra comprobacion lo
    // delataba: no hay desborde, no hay error de consola y todos los textos estan.
    const m = await page.evaluate(() => {
      const valores = [...document.querySelectorAll('p.font-display.text-acento')]
      return {
        topes: valores.map((v) => Math.round(v.getBoundingClientRect().top)),
        alturas: valores.map((v) => Math.round(v.getBoundingClientRect().height)),
        vecesLaEtiqueta: (document.body.innerText.match(/capital gestionado/g) ?? []).length,
      }
    })

    expect(new Set(m.topes).size, 'las cifras deben arrancar todas a la misma altura').toBe(1)
    expect(new Set(m.alturas).size, 'ninguna cifra puede partirse en dos lineas').toBe(1)
    // El <dt class="sr-only"> duplicaba el texto visible y un lector de pantalla lo leia dos veces.
    expect(m.vecesLaEtiqueta, 'la etiqueta de la cifra no puede aparecer dos veces').toBe(1)
  })

  test('3e · la firma de marca SI esta dentro del capturable', async ({ page }) => {
    await sembrarYAbrir(page, TARJETA_LLENA)
    const texto = await page.evaluate(
      () => document.getElementById('tarjeta-capturable')?.innerText ?? '',
    )
    expect(texto).toContain('Tarjetica')
  })

  test('el toggle esta FUERA del capturable, que es el punto de sacarlo', async ({ page }) => {
    await sembrarYAbrir(page, TARJETA_LLENA)
    const dentro = await page.evaluate(() => {
      const capturable = document.getElementById('tarjeta-capturable')
      const tablist = document.querySelector('[role="tablist"]')
      return Boolean(capturable && tablist && capturable.contains(tablist))
    })
    expect(dentro).toBe(false)
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
