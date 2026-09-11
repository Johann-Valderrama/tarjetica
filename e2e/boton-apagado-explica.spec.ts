import { devices, expect, test, type Page } from '@playwright/test'
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

    /*
      El resalte se comprueba por estado COMPUTADO, no por la clase: una clase presente con la
      animacion mal escrita no resalta nada. Se exigen las TRES propiedades que Johann pidio:
      que el borde sea ROJO, que parpadee 3 veces, y que al acabar SIGA encendido.
    */
    const resalte = await page.evaluate(() => {
      const caja = document.querySelector('input[name="confirmacion-propia"]')!.closest('div')!
      const cs = getComputedStyle(caja)
      return { animacion: cs.animationName, vueltas: cs.animationIterationCount, sombra: cs.boxShadow }
    })
    expect(resalte.animacion, 'la confirmacion no se resalto').toBe('parpadeo-de-peligro')
    expect(resalte.vueltas, 'el borde no parpadea exactamente 3 veces').toBe('3')

    // El rojo se compara contra el TOKEN, no contra un valor escrito a mano aqui: asi el test no
    // trae su propia copia del color, que es la forma de que pase mientras la app usa otro.
    const rojo = await page.evaluate(() => {
      const sonda = document.createElement('span')
      sonda.style.color = getComputedStyle(document.documentElement).getPropertyValue('--peligro-fuerte').trim()
      document.body.appendChild(sonda)
      const c = getComputedStyle(sonda).color
      sonda.remove()
      return c
    })
    expect(resalte.sombra, 'el borde del resalte no es el rojo de peligro').toContain(rojo)

    // Y lo que de verdad pidio: que al TERMINAR el parpadeo el borde siga encendido.
    await page.waitForTimeout(1800)
    const alFinal = await page.evaluate(() => {
      const caja = document.querySelector('input[name="confirmacion-propia"]')!.closest('div')!
      return { sombra: getComputedStyle(caja).boxShadow, sigueLaClase: caja.classList.contains('reclamando') }
    })
    expect(alFinal.sigueLaClase, 'el resalte se quito solo antes de que la persona actuara').toBe(true)
    expect(alFinal.sombra, 'el borde no se quedo encendido al acabar el parpadeo').toContain(rojo)

    // Y quedo a la vista, que era el punto del gesto.
    await expect(page.getByRole('checkbox')).toBeInViewport()
  })

  test('el borde se apaga cuando la persona marca la casilla, no por tiempo', async ({ page }) => {
    // El espejo del anterior. Sin este, un resalte que NUNCA se quita pasaria la prueba de arriba
    // y dejaria el borde rojo puesto para siempre, incluso con todo ya confirmado.
    await editorSinConfirmar(page)
    await page.getByTestId('exportar-jpeg').click({ force: true })
    await expect(page.locator('.reclamando')).toHaveCount(1)

    await page.getByRole('checkbox').check()
    await expect(page.locator('.reclamando')).toHaveCount(0)
  })
})

/**
 * El parpadeo se MIDE, fotograma a fotograma, en vez de declararse (2026-09-08).
 *
 * **Por que hacia falta.** Las pruebas de arriba comprueban `animationName` y
 * `animationIterationCount`, o sea lo que el CSS DICE que va a pasar. Eso no es el parpadeo: unos
 * `@keyframes` con los dos extremos iguales pasan esos asserts y no parpadean nada.
 *
 * **El error que se cazo escribiendo el medidor, y que vale mas que el medidor.** Un `box-shadow`
 * INTERPOLA entre el color y transparente, asi que en mitad del ciclo el valor computado no es
 * `transparent` sino `rgba(255, 86, 68, 0.47)`. Preguntar "¿esta transparente?" da SIEMPRE que no,
 * y el medidor reporta CERO parpadeos con la animacion corriendo perfectamente. Hay que leer el
 * ALFA, no comparar contra una palabra.
 *
 * **Los dos casos.** `prefers-reduced-motion: reduce` NO es el caso raro: se midio que el Chrome de
 * Johann esta asi (Windows con los efectos de animacion apagados), y por eso reporto "se queda en
 * rojo estatico". Si solo se midiera el caso con movimiento, la rama que el ve de verdad seria la
 * unica sin prueba.
 */

/**
 * Dispara el resalte y muestrea el alfa del anillo por fotograma, dentro de la pagina.
 *
 * Los umbrales son parametros porque los dos casos miden ciclos de AMPLITUD distinta: con
 * movimiento el anillo se va a cero, y con menos movimiento solo baja a 0,45 y vuelve. Contar el
 * latido con el umbral del parpadeo daria CERO y se leeria como "no anima nada", que es justo la
 * conclusion equivocada.
 */
async function medirElResalte(page: Page, umbrales = { bajo: 0.15, alto: 0.5 }) {
  await editorSinConfirmar(page)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.getByTestId('abrir-enlace').click({ force: true })

  return page.evaluate(async (u) => {
    const caja = document.querySelector('input[name="confirmacion-propia"]')!.closest('div')!
    /** Alfa de un color computado. Un `rgb(...)` sin cuarto canal es opaco: alfa 1. */
    const alfa = (valor: string) => {
      const m = valor.match(/rgba?\(\s*[\d.]+[,\s]+[\d.]+[,\s]+[\d.]+(?:[,/\s]+([\d.]+))?\s*\)/)
      return m ? (m[1] === undefined ? 1 : Number(m[1])) : null
    }
    const anillo: number[] = []
    let ultimo = { relleno: 0, sombra: '' }
    const t0 = performance.now()
    await new Promise<void>((listo) => {
      const tic = () => {
        const cs = getComputedStyle(caja)
        /*
          Los fotogramas ANTERIORES a que la clase se aplique no tienen sombra, y `alfa('none')` da
          `null`. Se descartan en vez de guardarse: un `null` se compara como 0 y el contador de
          abajo lo leeria como un apagon, o sea un parpadeo de regalo que nunca ocurrio. Esto no es
          un detalle de implementacion, es el mismo error de forma que el de la interpolacion.
        */
        const a = alfa(cs.boxShadow)
        if (a !== null) anillo.push(a)
        if (a !== null) ultimo = { relleno: alfa(cs.backgroundColor)!, sombra: cs.boxShadow }
        if (performance.now() - t0 > 2200) return listo()
        requestAnimationFrame(tic)
      }
      requestAnimationFrame(tic)
    })
    /*
      Un ciclo = el alfa BAJA de 0,15 y despues vuelve a subir por encima de 0,5. Los dos umbrales
      (histeresis) evitan contar de mas cuando el valor tiembla cerca de uno solo.
    */
    let ciclos = 0
    let dentro = false
    for (const a of anillo) {
      if (a < u.bajo && !dentro) {
        ciclos++
        dentro = true
      } else if (a > u.alto) dentro = false
    }
    return {
      fotogramas: anillo.length,
      ciclos,
      minimo: Math.min(...anillo),
      anilloFinal: anillo[anillo.length - 1],
      ...ultimo,
    }
  }, umbrales)
}

test.describe('el resalte parpadea de verdad, medido por fotograma', () => {
  test('con movimiento: tres apagones y se queda encendido', async ({ page }) => {
    const m = await medirElResalte(page)

    // Si el muestreo no alcanzo a correr, cualquier conteo de abajo seria un cero enganoso.
    expect(m.fotogramas, 'el muestreo por fotograma no corrio').toBeGreaterThan(60)
    expect(m.ciclos, 'el borde no se apago y encendio exactamente 3 veces').toBe(3)
    expect(m.minimo, 'el borde nunca llego a apagarse del todo').toBeLessThan(0.05)
    expect(m.anilloFinal, 'el borde no quedo encendido al acabar el parpadeo').toBe(1)
    expect(m.relleno, 'el resalte no tiene relleno, solo borde').toBeGreaterThan(0.1)
  })

  test('el relleno NO parpadea: es lo que se queda diciendo cual es la caja', async ({ page }) => {
    // El espejo del anterior. Sin esto, animar tambien el relleno pasaria la prueba de arriba y
    // dejaria la caja apagada del todo en mitad de cada ciclo, que es justo lo que no se quiere.
    await editorSinConfirmar(page)
    await page.getByTestId('abrir-enlace').click({ force: true })
    const rellenos = await page.evaluate(async () => {
      const caja = document.querySelector('input[name="confirmacion-propia"]')!.closest('div')!
      const vistos = new Set<string>()
      for (let i = 0; i < 40; i++) {
        vistos.add(getComputedStyle(caja).backgroundColor)
        await new Promise((r) => requestAnimationFrame(r))
      }
      return [...vistos]
    })
    expect(rellenos, 'el relleno cambia durante el parpadeo').toHaveLength(1)
  })
})

test.describe('con menos movimiento pedido, el borde LATE en vez de parpadear', () => {
  /**
   * Este caso abre su PROPIO contexto en vez de usar `test.use({ reducedMotion: 'reduce' })`, y no
   * es una preferencia de estilo: se midio el 2026-09-08 que ese `test.use` **no pisa** al
   * `reducedMotion` del `playwright.config.ts` (el mismo test imprimio `false` con `test.use` y
   * `true` con un contexto propio). O sea que la version escrita con `test.use` habria medido el
   * caso CON movimiento mientras su nombre decia lo contrario, y habria pasado en verde el dia que
   * el producto dejara de respetar la preferencia. `e2e/idiomas.spec.ts` ya abre su propio contexto
   * por la misma razon; esto sigue ese patron, no inventa uno.
   */
  test('late 2 veces sin apagarse, con el relleno y el anillo mas marcados', async ({ browser }, info) => {
    const ctx = await browser.newContext({
      ...devices['Pixel 7'],
      locale: 'es-CO',
      baseURL: info.project.use.baseURL,
      reducedMotion: 'reduce',
    })
    const page = await ctx.newPage()
    // Sin esto, un fallo del propio emulado dejaria pasar el resto midiendo el caso equivocado.
    expect(
      await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
      'el contexto no quedo en modo "menos movimiento": lo que siga mediria el caso contrario',
    ).toBe(true)

    try {
      // Umbrales propios: este ciclo baja a 0,45, no a cero.
      const m = await medirElResalte(page, { bajo: 0.6, alto: 0.9 })

      expect(m.fotogramas, 'el muestreo por fotograma no corrio').toBeGreaterThan(60)
      expect(m.ciclos, 'el borde no latio exactamente 2 veces').toBe(2)
      expect(m.anilloFinal, 'el borde no quedo encendido al acabar el latido').toBe(1)

      /*
        Lo que separa un LATIDO de un destello, y la razon por la que este caso puede animar aunque
        se haya pedido menos movimiento: el anillo se atenua pero NUNCA se apaga. Sin este assert,
        subir la animacion del caso con movimiento a esta rama pasaria en verde y le devolveria el
        destello completo justo a quien pidio lo contrario.
      */
      expect(m.minimo, 'el anillo se apaga: eso ya no es un latido, es un destello').toBeGreaterThan(0.35)
      expect(m.minimo, 'el latido es tan sutil que no se va a notar').toBeLessThan(0.6)

      // La compensacion, contra los TOKENS y no contra numeros escritos aqui.
      const tokens = await page.evaluate(() => {
        /*
          El alfa se le pregunta al NAVEGADOR, no se le saca al texto del token con una expresion
          regular. Razon medida: en `globals.css` estos tokens estan escritos como
          `rgba(255, 86, 68, 0.18)`, pero el CSS ya construido los guarda como `#ff56442e`, o sea
          hexadecimal de ocho digitos. Un lector de texto que espere un `rgba(...)` devuelve null
          contra el build de produccion, que es justo lo que esta suite mide.
        */
        const cs = getComputedStyle(document.documentElement)
        const sonda = document.createElement('span')
        document.body.appendChild(sonda)
        const a = (n: string) => {
          sonda.style.backgroundColor = cs.getPropertyValue(n).trim()
          const m = getComputedStyle(sonda).backgroundColor.match(/rgba?\([^)]*?([\d.]+)\s*\)/)
          return m ? Number(m[1]) : 1
        }
        const r = { normal: a('--peligro-relleno'), fuerte: a('--peligro-relleno-fuerte') }
        sonda.remove()
        return r
      })
      expect(tokens.fuerte, 'el relleno reforzado no es mas fuerte que el normal').toBeGreaterThan(tokens.normal)
      expect(m.relleno, 'no se aplico el relleno reforzado').toBeCloseTo(tokens.fuerte, 2)
      expect(m.sombra, 'el anillo no engordo para compensar la falta de parpadeo').toContain('5px')
    } finally {
      await ctx.close()
    }
  })
})

/**
 * El boton apagado lleva a lo que DE VERDAD falta, no siempre a la casilla (2026-09-11).
 *
 * Reportado por Johann en produccion, con captura: tarjeta llena, casilla marcada, y los botones
 * seguian apagados. La pantalla decia "escribe al menos tu nombre" con el nombre ya escrito, y el
 * boton lo llevaba a la casilla que ya habia marcado. La causa era la web escrita como
 * `johannvalderrama.com`, sin `https://`, que la validacion rechazaba sin decirlo.
 *
 * Estas pruebas repiten ESE recorrido, con las teclas, no inyectando el dato ya arreglado: si la
 * normalizacion dejara de correr, la primera se pondria roja.
 */
test.describe('el boton apagado lleva al campo que falla', () => {
  test('la web sin https ya no bloquea: se completa sola y se puede compartir', async ({ page }) => {
    await page.goto('/editor')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.locator('#n').fill('Johann')
    await page.locator('#w').fill('johannvalderrama.com')
    await page.getByRole('checkbox').check()

    await expect(page.getByTestId('mostrar-qr')).toHaveAttribute('aria-disabled', 'false')
    await expect(page.locator('#w')).toHaveValue('https://johannvalderrama.com')
  })

  test('una tarjeta YA GUARDADA con la web sin https tambien queda desbloqueada', async ({ page }) => {
    // El caso real de Johann: la tarjeta ya estaba guardada en su navegador ANTES del arreglo.
    // Sin normalizar al cargar, seguiria bloqueada hasta que tocara justo ese campo.
    await page.goto('/editor')
    await page.evaluate(() => {
      localStorage.clear()
      localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: { n: 'Johann', w: 'johannvalderrama.com' } }))
    })
    await page.reload()
    await page.getByRole('checkbox').check()
    await expect(page.getByTestId('mostrar-qr')).toHaveAttribute('aria-disabled', 'false')
  })

  test('con otro campo roto, el aviso lo nombra y el boton lleva a ESE campo', async ({ page }) => {
    // Un correo a medio escribir, TECLEADO: es un estado al que una persona llega de verdad. (Un
    // cargo de 81 caracteres inyectado en el almacenamiento no sirve: el campo corta al escribir y
    // al cargar se descarta, asi que la prueba mediria un estado que no existe.)
    await page.goto('/editor')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.locator('#n').fill('Johann')
    await page.locator('#co').fill('johann@')
    await page.getByRole('checkbox').check()

    const aviso = page.locator('#que-falta-para-compartir')
    await expect(aviso, 'el aviso sigue diciendo "escribe tu nombre" con el nombre escrito').not.toContainText('nombre')
    await expect(aviso).toContainText('Correo')

    await page.getByTestId('mostrar-qr').click({ force: true })
    await expect(page.locator('#co'), 'el boton no llevo al campo que falla').toBeFocused()
    await expect(page.locator('#co')).toHaveClass(/reclamando/)
    // Y lo que Johann vio: la casilla YA marcada no se vuelve a resaltar como si faltara.
    const casilla = page.locator('input[name="confirmacion-propia"]').locator('xpath=ancestor::div[1]')
    await expect(casilla).not.toHaveClass(/reclamando/)
  })
})
