import { expect, test, type Page } from '@playwright/test'
import { PERFILES } from './perfiles.datos'

/**
 * Unidad 7e del PRP-TD-001: el barrido final de superficie, sobre las CUATRO pantallas.
 *
 * **Por que existe si ya hay un 3d.** La unidad 3d midio superficie, pero depende de 3b y 3c: solo
 * cubrio las vistas de tarjeta. **El editor y la home nunca se midieron**, y el editor es de lejos
 * la pantalla con mas controles del producto: veinte campos, tres selectores, siete botones. Si hay
 * un objetivo tactil de 32 px en alguna parte, esta ahi.
 *
 * Y lo segundo: el assert de CERO dominios ajenos existia en la unidad 6c, colgando del enlace. Ahi
 * medía una pantalla y solo si el enlace se construia. Aqui corre sobre las cuatro, **exista o no el
 * enlace**, que es lo que el PRP pidio.
 *
 * Las tres propiedades se miden en la misma pasada por pantalla, a proposito: son el mismo gesto
 * (abrir la pantalla y mirarla) y separarlas triplicaria el arranque sin agregar informacion.
 */

const ANCHO_TELEFONO = 375
const PISO_TACTIL = 44

/** El perfil mas cargado que existe: si algo desborda, desborda aqui. */
const PERFIL = PERFILES.find((p) => p.nombre === 'completo')!

/**
 * El origen propio. Todo lo demas es "ajeno", incluidos los CDN de fuentes: las fuentes van
 * auto-hospedadas con `next/font` justo para esto (ver `DECISIONES.md`, 2026-09-04).
 *
 * `data:` y `blob:` NO cuentan como peticion a nadie: viven dentro del navegador y son como viajan
 * la foto (G5) y el `.jpeg` exportado.
 */
const PROPIO = 'http://localhost:3210'

function esAjena(url: string): boolean {
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('about:')) return false
  return !url.startsWith(PROPIO)
}

async function sembrar(page: Page) {
  await page.goto('/editor')
  /*
    Se espera a que el editor este HIDRATADO antes de tocar el almacenamiento.
    
    No es precaucion de mas: sin esta espera, en la PRIMERA navegacion del contexto (la fria, con
    los chunks sin cachear) el `reload()` de abajo alcanzaba a cancelar el ciclo de hidratacion, y
    el efecto que manda `card_created` no llegaba a correr. La prueba fallaba solo cuando era la
    primera navegacion, o sea de forma intermitente segun el orden de los tests, que es la peor
    manera de fallar. El texto "Abriendo tu tarjeta..." se cambia por el titulo justo cuando el
    componente ya corre en el cliente, asi que esperarlo es esperar la hidratacion.
  */
  await expect(page.getByRole('heading', { name: 'Tu tarjeta' })).toBeVisible()
  await page.evaluate((t) => {
    localStorage.clear()
    localStorage.setItem('tarjetica.tarjeta', JSON.stringify({ v: 1, d: t }))
    localStorage.setItem('tarjetica.confirmacion', JSON.stringify({ v: 1, d: true }))
  }, PERFIL.datos)
}

/**
 * Las cuatro pantallas del producto. `/t` necesita un enlace real, que se genera desde el editor:
 * pedirla pelada mostraria el aviso de "este enlace no trae ninguna tarjeta", que es otra pantalla.
 */
async function abrir(page: Page, cual: '/' | '/editor' | '/tarjeta' | '/t'): Promise<void> {
  if (cual === '/') {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    return
  }

  await sembrar(page)

  if (cual === '/editor') {
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Tu tarjeta' })).toBeVisible()
    return
  }

  if (cual === '/tarjeta') {
    await page.goto('/tarjeta')
    await expect(page.getByTestId('qr-contacto')).toBeVisible()
    return
  }

  await page.reload()
  await page.getByTestId('abrir-enlace').click()
  await page.getByTestId('confirmar-enlace').click()
  const enlace = (await page.getByTestId('enlace-generado').textContent())!.trim()
  await page.goto(enlace)
  await expect(page.getByTestId('qr-contacto')).toBeVisible()
}

const PANTALLAS = ['/', '/editor', '/tarjeta', '/t'] as const

test.describe('7e · las cuatro pantallas a 375 px', () => {
  test.use({ viewport: { width: ANCHO_TELEFONO, height: 667 } })

  for (const pantalla of PANTALLAS) {
    test(`${pantalla} no desborda en horizontal`, async ({ page }) => {
      await abrir(page, pantalla)
      const { scroll, cliente } = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        cliente: document.documentElement.clientWidth,
      }))
      expect(scroll, `${pantalla} se sale ${scroll - cliente} px por el costado`).toBeLessThanOrEqual(cliente)
    })

    test(`${pantalla}: ningun control por debajo de ${PISO_TACTIL} px`, async ({ page }) => {
      await abrir(page, pantalla)

      /*
        Se mide la caja RENDERIZADA de cada control visible, no su clase de Tailwind: un `min-h-11`
        lo puede ganar un `height` de un ancestro, y eso no se ve leyendo el JSX. Los ocultos se
        saltan: un control con caja de 0x0 no es un objetivo tactil chico, es uno que no existe.

        Lo que se mide es **lo que el dedo alcanza**, no la caja del elemento. Un control envuelto
        en su `<label>` recibe el toque en TODA la etiqueta, asi que ahi el objetivo es la etiqueta.
        La distincion la encontro este mismo assert la primera vez que corrio: la casilla de "esta
        tarjeta es mia" mide 20x20 px, pero su etiqueta mide 44 y es la que se toca. Medir la caja
        del `<input>` habria reportado un defecto que el usuario no tiene, y "arreglarlo" agrandando
        la casilla habria empeorado el editor por un numero mal leido.
      */
      const chicos = await page.evaluate((piso) => {
        const controles = [...document.querySelectorAll('a, button, input, select, textarea, [role="button"]')]
        return controles
          .map((el) => {
            const propia = el.getBoundingClientRect()
            // La etiqueta que envuelve al control, si la hay: es la superficie que recibe el toque.
            const etiqueta = el.closest('label')?.getBoundingClientRect()
            const alcanzable = Math.max(propia.height, etiqueta?.height ?? 0)
            return {
              etiqueta: el.tagName.toLowerCase(),
              id: el.id || el.getAttribute('name') || '',
              alto: propia.height,
              altoAlcanzable: alcanzable,
              ancho: propia.width,
            }
          })
          .filter((c) => c.alto > 0 && c.ancho > 0 && c.altoAlcanzable < piso)
      }, PISO_TACTIL)

      expect(chicos, `controles por debajo de ${PISO_TACTIL} px en ${pantalla}`).toEqual([])
    })

    /**
     * El criterio de exito mas duro del producto, y el que la unidad 7c NO podia romper: se mide
     * TAMBIEN en la home y en el editor, que son las dos pantallas donde la metrica anonima si
     * dispara. Un ping al propio origen pasa; cualquier cosa a otro dominio, no.
     */
    test(`${pantalla}: CERO peticiones a un dominio ajeno`, async ({ page }) => {
      const ajenas: string[] = []
      page.on('request', (r) => {
        if (esAjena(r.url())) ajenas.push(`${r.method()} ${r.url()}`)
      })

      await abrir(page, pantalla)
      // Un margen para lo que se dispara tarde: fuentes, imagenes diferidas, el ping de 7c.
      await page.waitForTimeout(1200)

      expect(ajenas, `${pantalla} habla con un dominio ajeno`).toEqual([])
    })
  }
})

/**
 * Que el CSS de la paleta LLEGUE a aplicarse.
 *
 * `src/app/contraste.test.ts` mide los VALORES de los tokens, y eso es todo lo que puede medir: no
 * ve si una regla se aplica de verdad. Los dos fallos que aparecieron el 2026-09-08 vivian justo en
 * ese hueco, y los dos eran MUDOS:
 *
 * - `text-tinta-suave/40` no se aplicaba (Tailwind no le pone opacidad a un token `var(--x)`), asi
 *   que los botones apagados se quedaban con la tinta del boton activo.
 * - `::placeholder` a secas perdia por especificidad contra el `input::placeholder` del preflight
 *   de Tailwind, y el campo seguia pintando el gris de Tailwind con la regla escrita.
 *
 * En los dos casos el codigo se leia bien, el build pasaba y el test de tokens pasaba. Lo unico que
 * los distingue es preguntarle al NAVEGADOR de que color quedo la cosa.
 */
test.describe('la paleta llega a la pantalla, no solo al archivo', () => {
  test.use({ viewport: { width: ANCHO_TELEFONO, height: 667 } })

  test('el campo, su texto de ejemplo y el boton apagado usan los tokens, no los del navegador', async ({ page }) => {
    await page.goto('/editor')
    await expect(page.getByRole('heading', { name: 'Tu tarjeta' })).toBeVisible()

    const medido = await page.evaluate(() => {
      const raiz = getComputedStyle(document.documentElement)
      const token = (n: string) => raiz.getPropertyValue(n).trim()
      // `#a1a5ac` y `rgb(161, 165, 172)` son el mismo color: se comparan ya normalizados por el
      // navegador, pintando el token en un elemento de mentira y leyendo como lo resuelve.
      const sonda = document.createElement('span')
      sonda.style.display = 'none'
      document.body.appendChild(sonda)
      const normalizar = (valor: string) => {
        sonda.style.color = valor
        return getComputedStyle(sonda).color
      }
      const campo = document.querySelector('#ti') as HTMLElement
      const boton = document.querySelector('[data-testid="exportar-jpeg"]') as HTMLButtonElement
      const r = {
        fondoCampo: getComputedStyle(campo).backgroundColor,
        fondoEsperado: normalizar(token('--superficie')),
        placeholder: getComputedStyle(campo, '::placeholder').color,
        placeholderEsperado: normalizar(token('--tinta-suave')),
        botonApagado: boton.getAttribute('aria-disabled') === 'true',
        tintaBoton: getComputedStyle(boton).color,
        tintaEsperada: normalizar(token('--tinta-tenue')),
      }
      sonda.remove()
      return r
    })

    expect(medido.fondoCampo, 'el fondo del campo lo sigue pintando el navegador').toBe(medido.fondoEsperado)
    expect(medido.placeholder, 'el texto de ejemplo lo sigue pintando el navegador').toBe(medido.placeholderEsperado)
    // El boton nace deshabilitado porque no hay tarjeta: es justo el estado que se rompio.
    expect(medido.botonApagado).toBe(true)
    expect(medido.tintaBoton, 'el boton apagado se quedo con la tinta del boton activo').toBe(medido.tintaEsperada)
  })
})

test.describe('7c · la metrica no toca la ruta de la tarjeta', () => {
  test.use({ viewport: { width: ANCHO_TELEFONO, height: 667 } })

  /**
   * Se espia la RESPUESTA y no la peticion.
   *
   * No es un detalle: la primera version media que el `POST` saliera, y salia. Lo que no salia era
   * la metrica, porque el endpoint contestaba **400** a todo ping (un beacon sin datos no llega con
   * el cuerpo en `null`, sino con un flujo vacio). El fallo era invisible por construccion, porque
   * un ping es fire-and-forget y nadie mira su respuesta. Un `POST` que devuelve 400 no es un
   * evento contado: es un evento perdido.
   */
  function espiarPings(page: Page): Array<{ ruta: string; estado: number }> {
    const pings: Array<{ ruta: string; estado: number }> = []
    page.on('response', (r) => {
      const ruta = new URL(r.url()).pathname
      if (ruta.startsWith('/api/e/')) pings.push({ ruta, estado: r.status() })
    })
    return pings
  }

  test('la home cuenta la visita, y el servidor la ACEPTA', async ({ page }) => {
    const pings = espiarPings(page)
    await abrir(page, '/')
    await page.waitForTimeout(1200)
    expect(pings).toContainEqual({ ruta: '/api/e/home_visit', estado: 204 })
  })

  test('el editor cuenta la tarjeta creada UNA vez, no en cada tecla', async ({ page }) => {
    const pings = espiarPings(page)
    await page.goto('/editor')
    await abrir(page, '/editor')
    // Se escribe de mas: si el ping colgara del autosave, aqui saldrian varios.
    await page.locator('#c').fill('Directora de operaciones')
    await page.waitForTimeout(1200)
    expect(pings.filter((p) => p.ruta === '/api/e/card_created')).toEqual([
      { ruta: '/api/e/card_created', estado: 204 },
    ])
  })

  test('un evento que no existe no se registra, y un ping con cuerpo tampoco', async ({ request }) => {
    // La lista de eventos es cerrada: si no lo fuera, cualquiera podria llenar el log desde afuera.
    expect((await request.post('/api/e/lo_que_sea')).status()).toBe(404)
    // Y no hay donde colar un dato: un ping con cuerpo se descarta entero.
    expect((await request.post('/api/e/card_created', { data: { n: 'Daniel' } })).status()).toBe(400)
    // El ping legitimo, sin cuerpo, si pasa.
    expect((await request.post('/api/e/card_created')).status()).toBe(204)
  })

  for (const pantalla of ['/tarjeta', '/t'] as const) {
    test(`${pantalla} no manda NINGUN ping`, async ({ page }) => {
      // Se siembra y se genera el enlace ANTES de empezar a espiar: lo que se mide es lo que hace
      // la pantalla de la tarjeta, no el paso por el editor que hizo falta para llegar.
      await sembrar(page)
      let enlace = '/tarjeta'
      if (pantalla === '/t') {
        await page.reload()
        await page.getByTestId('abrir-enlace').click()
        await page.getByTestId('confirmar-enlace').click()
        enlace = (await page.getByTestId('enlace-generado').textContent())!.trim()
      }

      const pings = espiarPings(page)
      await page.goto(enlace)
      await expect(page.getByTestId('qr-contacto')).toBeVisible()
      await page.waitForTimeout(1200)

      expect(pings, `${pantalla} pingeo`).toEqual([])
    })
  }
})
