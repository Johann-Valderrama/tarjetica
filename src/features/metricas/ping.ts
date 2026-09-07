/**
 * Unidad 7c del PRP-TD-001: la metrica anonima.
 *
 * **Esta unidad choca de frente con el candado de la unidad 1e, y el PRP escribio de antemano quien
 * gana: si medir exigiera cargar algo de un dominio ajeno en la ruta de la tarjeta, se descarta LA
 * METRICA y no el candado** (`Si falla: DESCARTAR`, seccion 13). Lo que sigue es como se midio esa
 * tension en vez de asumirla.
 *
 * **Lo que se descarto, y por que.** Analitica de terceros (Vercel Analytics, Plausible, GA) queda
 * FUERA, y no por preferencia: todas cargan un script de otro dominio, la CSP arranca en
 * `default-src 'self'` y el assert de la unidad 7e mide CERO peticiones a dominios ajenos en las
 * CUATRO pantallas, incluidas la home y el editor. Cualquiera de ellas pone el assert en rojo el
 * dia que se instale.
 *
 * **Lo que queda: un ping al PROPIO origen, sin cuerpo.** El nombre del evento va en la RUTA
 * (`/api/e/card_created`), no en un cuerpo JSON, para que no exista un canal por donde algo pueda
 * colarse mañana: no hay campo que llenar. `connect-src 'self'` ya lo permite, asi que no se toca
 * ni una directiva de la CSP.
 *
 * **Esto NO contradice D1.** D1 dice que los datos de la tarjeta no viven en ningun servidor, y
 * siguen sin vivir: el ping no lleva ni un campo de la tarjeta, ni un identificador, ni nada que
 * distinga a una persona de otra. Lo unico que el servidor sabe es que ALGUIEN hizo esto una vez,
 * que es lo mismo que ya sabe por servir la pagina.
 *
 * **El candado duro esta abajo, en `RUTAS_PROHIBIDAS`:** la ruta de la tarjeta no puede pingear
 * aunque alguien monte ahi un componente por descuido. No basta con "no lo pusimos ahi": eso es una
 * disposicion, no una garantia.
 */

/** Los unicos eventos que existen. Sin parametros: un evento es un nombre, no un objeto. */
export const EVENTOS = ['home_visit', 'card_created'] as const

export type Evento = (typeof EVENTOS)[number]

/**
 * Rutas donde el ping NO puede ocurrir, pase lo que pase. Son las que muestran una tarjeta: la
 * propia (`/tarjeta`) y la que llega por enlace (`/t`, que abre un desconocido). El criterio de
 * exito del producto es que ahi no salga ni una peticion, y esta lista es lo que lo hace cierto
 * aunque el arbol de componentes cambie.
 */
const RUTAS_PROHIBIDAS = ['/tarjeta', '/t'] as const

export function rutaPuedePingear(pathname: string): boolean {
  return !RUTAS_PROHIBIDAS.some((r) => pathname === r || pathname.startsWith(`${r}/`))
}

/**
 * Manda el ping. Devuelve si se mando, para que un test lo pueda comprobar; nadie en la app usa
 * ese valor, porque una metrica que falla no puede cambiar nada de lo que el usuario ve.
 *
 * Ruta relativa, nunca absoluta: asi el destino es siempre el mismo origen que sirvio la pagina,
 * por construccion. Un dominio escrito aqui seria justo lo que el candado existe para impedir.
 */
export function ping(evento: Evento): boolean {
  if (typeof window === 'undefined') return false
  if (!rutaPuedePingear(window.location.pathname)) return false

  const destino = `/api/e/${evento}`
  try {
    // `sendBeacon` sobrevive a que la pestaña se cierre en el mismo gesto, que es el caso real:
    // el usuario guarda su imagen y se va. Sin cuerpo: el segundo argumento se omite.
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      return navigator.sendBeacon(destino)
    }
    void fetch(destino, { method: 'POST', keepalive: true })
    return true
  } catch {
    // Un bloqueador, el modo sin conexion o una CSP mas estricta del lado del usuario. No se
    // reporta nada: la metrica es un lujo y el producto funciona igual sin ella.
    return false
  }
}
