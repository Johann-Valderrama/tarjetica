import { describe, expect, it, vi, afterEach } from 'vitest'
import { EVENTOS, ping, rutaPuedePingear } from '@/features/metricas/ping'

/**
 * Verificacion de la unidad 7c.
 *
 * Lo que se mide aqui NO es que la metrica funcione: es que el CANDADO aguante. El `Si falla` de
 * esta unidad es DESCARTAR, o sea que ante la duda se pierde la metrica y no el candado, asi que la
 * propiedad que hay que probar es la negativa: **en la ruta de la tarjeta no sale ni una peticion**.
 *
 * El assert de "cero dominios ajenos" en las cuatro pantallas vive en el E2E de la unidad 7e, que
 * lo mide desde afuera, con la app corriendo. Este archivo cubre la otra mitad: que la regla este
 * en el CODIGO y no solo en como quedaron montados los componentes hoy.
 */

const original = globalThis.window

afterEach(() => {
  if (original === undefined) Reflect.deleteProperty(globalThis, 'window')
  else globalThis.window = original
  vi.unstubAllGlobals()
})

/** Monta un `window` minimo con la ruta dada, y un `sendBeacon` que anota a donde se llamo. */
function enLaRuta(pathname: string) {
  const llamadas: string[] = []
  vi.stubGlobal('window', { location: { pathname } })
  vi.stubGlobal('navigator', {
    sendBeacon: (url: string) => {
      llamadas.push(url)
      return true
    },
  })
  return llamadas
}

describe('la ruta de la tarjeta no pingea, pase lo que pase', () => {
  it('las dos rutas que muestran una tarjeta estan prohibidas', () => {
    expect(rutaPuedePingear('/tarjeta')).toBe(false)
    expect(rutaPuedePingear('/t')).toBe(false)
  })

  it('y tambien lo estan sus subrutas, no solo la ruta pelada', () => {
    expect(rutaPuedePingear('/tarjeta/lo-que-sea')).toBe(false)
    expect(rutaPuedePingear('/t/lo-que-sea')).toBe(false)
  })

  it('la home y el editor si pueden', () => {
    expect(rutaPuedePingear('/')).toBe(true)
    expect(rutaPuedePingear('/editor')).toBe(true)
  })

  /**
   * El que de verdad importa: aunque alguien monte por descuido un componente de metrica dentro de
   * la vista de la tarjeta, la llamada no sale. La comprobacion no vive en el arbol de componentes
   * (que cambia), vive aqui.
   */
  it.each(['/tarjeta', '/t'])('un ping disparado desde %s no manda nada', (ruta) => {
    const llamadas = enLaRuta(ruta)
    for (const evento of EVENTOS) expect(ping(evento)).toBe(false)
    expect(llamadas).toEqual([])
  })
})

describe('cuando si pingea, lo hace al propio origen y sin cuerpo', () => {
  it('el destino es una ruta relativa: no hay forma de que apunte a otro dominio', () => {
    const llamadas = enLaRuta('/')
    expect(ping('home_visit')).toBe(true)
    expect(llamadas).toEqual(['/api/e/home_visit'])
    // Relativa, no absoluta: sin `//` de esquema, no puede resolver a un host ajeno.
    for (const url of llamadas) expect(url.startsWith('/') && !url.startsWith('//')).toBe(true)
  })

  it('el evento viaja en la RUTA, y no hay ningun cuerpo donde colar un dato', () => {
    const llamadas = enLaRuta('/editor')
    ping('card_created')
    expect(llamadas).toEqual(['/api/e/card_created'])
    // `sendBeacon` se llama con UN solo argumento: si hubiera un segundo, seria el cuerpo.
    expect(llamadas[0]).not.toContain('?')
  })

  it('solo existen los dos eventos del PRP, sin parametros', () => {
    expect([...EVENTOS]).toEqual(['home_visit', 'card_created'])
  })
})
