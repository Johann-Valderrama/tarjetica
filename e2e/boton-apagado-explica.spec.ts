import { expect, test, type Page } from '@playwright/test'
import { PERFILES } from './perfiles.datos'

/**
 * Los botones apagados explican QUE FALTA, y la puerta sigue cerrada (2026-09-08).
 *
 * **Que cambio.** Los cuatro botones de salida nacian con `disabled` a secas: se veian grises y no
 * pasaba nada. Johann pidio que dijeran por que, y que al tocarlos llevaran a lo que falta. Un
 * `disabled` de verdad **no recibe clics ni hover**, asi que se cambio a `aria-disabled`.
 *
 * **Por que este archivo es obligatorio y no un extra.** Con `disabled`, la puerta de la unidad 2d
 * (no exportar sin confirmar que la tarjeta es tuya) la imponia el NAVEGADOR. Ahora la impone
 * nuestro codigo, y una contramedida de privacidad que depende de un `if` necesita que alguien
 * pulse el boton de verdad y compruebe que no pasa nada. Comprobar el atributo `aria-disabled` NO
 * es comprobar eso: el atributo puede estar y el manejador ejecutarse igual.
 */

/**
 * Sobre el `{ force: true }` de los clics de este archivo, que NO es un atajo.
 *
 * Playwright se niega a pulsar un elemento con `aria-disabled="true"`: lo trata como no accionable
 * por politica SUYA, no porque el navegador lo impida. Medido el 2026-09-08 en Chromium real: el
 * clic llega al manejador, el foco pasa a la confirmacion, la animacion corre y el control queda a
 * la vista. `force` salta el chequeo previo de Playwright y pulsa en las coordenadas de verdad, que
 * es lo que hace el dedo de una persona.
 *
 * Se deja dicho porque un `force: true` sin explicacion se lee como que alguien silencio una queja
 * de la herramienta, y aqui es al reves: es la unica forma de medir lo que de verdad pasa.
 */

const PERFIL = PERFILES.find((p) => p.nombre === 'completo')!

/** Tarjeta llena pero SIN confirmar: el estado exacto en el que los botones estan apagados. */
async function editorSinConfirmar(page: Page) {
  await page.goto('/editor')
  await expect(page.getByRole('heading', { name: 'Tu tarjeta' })).toBeVisible()
  await page.evaluate((t) => {
    localStorage.clear()
    localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
  }, PERFIL.datos)
  await page.reload()
  await expect(page.getByRole('checkbox')).not.toBeChecked()
}

test.describe('la puerta sigue cerrada, ahora que la sostiene el codigo', () => {
  test('pulsar los botones apagados no exporta, no navega y no genera enlace', async ({ page }) => {
    await editorSinConfirmar(page)

    let huboDescarga = false
    page.on('download', () => {
      huboDescarga = true
    })

    for (const id of ['exportar-jpeg', 'mostrar-qr', 'descargar-vcf', 'abrir-enlace']) {
      await expect(page.getByTestId(id)).toHaveAttribute('aria-disabled', 'true')
      await page.getByTestId(id).click({ force: true })
    }
    // Margen para que cualquier descarga o navegacion tardia se manifieste.
    await page.waitForTimeout(1200)

    expect(huboDescarga, 'se exporto un archivo sin haber confirmado').toBe(false)
    expect(new URL(page.url()).pathname, 'se navego a la tarjeta sin haber confirmado').toBe('/editor')
    await expect(page.getByTestId('advertencia-enlace'), 'se abrio el flujo del enlace').toHaveCount(0)
    await expect(page.getByTestId('enlace-generado'), 'se genero un enlace').toHaveCount(0)
  })

  test('con la confirmacion marcada, los mismos botones si abren su camino', async ({ page }) => {
    // El espejo del anterior: sin esto, un boton roto que no hace NADA nunca pasaria las dos
    // pruebas, y la de arriba sola no distingue "bien cerrado" de "no funciona".
    await editorSinConfirmar(page)
    await page.getByRole('checkbox').check()

    for (const id of ['exportar-jpeg', 'mostrar-qr', 'descargar-vcf', 'abrir-enlace']) {
      await expect(page.getByTestId(id)).toHaveAttribute('aria-disabled', 'false')
    }

    await page.getByTestId('abrir-enlace').click()
    await expect(page.getByTestId('advertencia-enlace')).toBeVisible()
  })
})

test.describe('el boton apagado dice que falta, y lleva hasta alli', () => {
  test('lo anuncia a un lector de pantalla, no solo a quien ve la pantalla', async ({ page }) => {
    await editorSinConfirmar(page)

    /*
      `aria-disabled` en vez de `disabled` tiene una ventaja que no es un rodeo: el boton se queda
      en el recorrido del teclado. Con `disabled` de verdad, quien navega con lector de pantalla
      **no se entera de que la salida existe**, y por lo tanto tampoco de que le falta un paso.
    */
    const boton = page.getByTestId('exportar-jpeg')
    const describedby = await boton.getAttribute('aria-describedby')
    expect(describedby, 'el boton apagado no enlaza el texto que explica que falta').toBeTruthy()

    const explicacion = page.locator(`#${describedby}`)
    await expect(explicacion).toBeVisible()
    expect((await explicacion.textContent())!.length).toBeGreaterThan(20)
  })

  test('al pulsarlo, la confirmacion queda enfocada y resaltada', async ({ page }) => {
    await editorSinConfirmar(page)

    // Se baja del todo para que la confirmacion quede FUERA de la vista: si ya estuviera visible,
    // el test pasaria sin probar que el gesto lleva a alguna parte.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.getByTestId('abrir-enlace').click({ force: true })

    // El foco es la parte que sirve con teclado y con lector de pantalla, no solo la animacion.
    await expect(page.getByRole('checkbox')).toBeFocused()

    // Y el resalte: se comprueba por estado COMPUTADO, no por la clase, porque una clase presente
    // con la animacion mal definida no resalta nada.
    const resaltado = await page.evaluate(() => {
      const caja = document.querySelector('input[name="confirmacion-propia"]')!.closest('div')
      return caja ? getComputedStyle(caja).animationName !== 'none' || getComputedStyle(caja).boxShadow !== 'none' : false
    })
    expect(resaltado, 'la confirmacion no se resalto').toBe(true)

    // Y quedo a la vista, que era el punto del gesto.
    await expect(page.getByRole('checkbox')).toBeInViewport()
  })
})
