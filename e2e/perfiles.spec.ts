import { expect, test } from '@playwright/test'

/**
 * La tarjeta, vista en TODOS sus estados y no solo en el maximo.
 *
 * Nace de un hueco real de verificacion (2026-09-04): la Ola 3 se diseño y se miro con una tarjeta
 * llena, capa de venta incluida, y nadie abrio la tarjeta que en realidad es el **caso comun**. El
 * PRP lo dice con todas las letras: *"El QR de la tarjeta llena es el caso de prueba; el de la
 * tarjeta minima es el caso comun"*. El assert de "renderiza sin desbordar" pasaba en los dos, asi
 * que nada delataba que el caso comun se viera pobre.
 *
 * Este archivo deja los cuatro estados corriendo en cada suite, y guarda una captura de cada uno
 * para poder MIRARLOS, que es lo unico que caza un problema de composicion.
 */

export const PERFILES: Array<{ nombre: string; datos: Record<string, unknown> }> = [
  {
    nombre: 'minima',
    datos: { n: 'Ana', a: 'Ríos', t: [{ n: '3105551234', e: 'whatsapp' }] },
  },
  {
    nombre: 'tipica-sin-venta',
    datos: {
      n: 'Ana',
      a: 'Ríos',
      c: 'Coordinadora de compras',
      em: 'Alimentos del Norte',
      co: 'ana.rios@example.com',
      t: [{ n: '3105551234', e: 'whatsapp' }],
      li: 'anarios',
    },
  },
  {
    nombre: 'creativa-sin-venta',
    datos: {
      n: 'Sara',
      a: 'Molina',
      c: 'Fotógrafa',
      co: 'hola@saramolina.co',
      t: [{ n: '3009998877', e: 'whatsapp' }],
      w: 'https://saramolina.co',
      ig: 'saramolina',
      tk: 'saramolina',
      no: 'Retrato de producto y documental de marca. Bogotá y alrededores.',
    },
  },
  {
    nombre: 'una-sola-cifra',
    datos: {
      n: 'Camilo',
      a: 'Peña',
      c: 'Contador',
      t: [{ n: '3201112233', e: 'oficina' }],
      s: { c: [{ v: '18 años', e: 'de experiencia' }] },
    },
  },
  {
    nombre: 'con-venta',
    datos: {
      n: 'Johann',
      a: 'Valderrama',
      c: 'Agentic operations',
      em: 'Zelandia',
      co: 'johann@example.com',
      t: [{ n: '3192480121', e: 'whatsapp' }],
      w: 'https://johannvalderrama.com',
      li: 'johannvalderrama',
      s: {
        t: 'Recupera las horas que tu operación te quita.',
        c: [
          { v: '83%', e: 'menos tiempo de reporte' },
          { v: '815', e: 'proyectos' },
          { v: 'USD 86M', e: 'capital gestionado' },
        ],
        p: '¿Cuánto de ese cuello de botella vuelve a tu bolsillo?',
      },
    },
  },
]

for (const { nombre, datos } of PERFILES) {
  test(`perfil ${nombre}: renderiza, no desborda y deja captura`, async ({ page }) => {
    await page.goto('/tarjeta')
    await page.evaluate((t) => {
      localStorage.clear()
      localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
    }, datos)
    await page.reload()
    await expect(page.getByRole('tablist')).toBeVisible()

    await page.screenshot({ path: `capturas/perfil-${nombre}.png`, fullPage: true })

    const m = await page.evaluate(() => {
      const capturable = document.getElementById('tarjeta-capturable')
      return {
        existe: Boolean(capturable),
        alto: capturable ? Math.round(capturable.getBoundingClientRect().height) : 0,
        desborde: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        controlesDentro: capturable
          ? capturable.querySelectorAll('button, input, select, textarea').length
          : -1,
      }
    })

    expect(m.existe, 'debe existir el elemento capturable').toBe(true)
    expect(m.desborde, `desborde horizontal en el perfil ${nombre}`).toBe(false)
    expect(m.controlesDentro, `controles dentro del capturable en ${nombre}`).toBe(0)
    console.log(`  ${nombre}: la tarjeta mide ${m.alto} px de alto`)
  })
}
