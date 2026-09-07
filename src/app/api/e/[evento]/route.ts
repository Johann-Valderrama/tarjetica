import { EVENTOS, type Evento } from '@/features/metricas/ping'

/**
 * Receptor del ping anonimo (unidad 7c). Es el UNICO endpoint del producto.
 *
 * **No guarda nada.** No hay base de datos, ni archivo, ni cookie: escribe una linea en el log del
 * proceso y contesta 204. Contar es leer esas lineas en el panel de despliegue. Es exactamente lo
 * que la seccion 13 del PRP admite que se puede sostener sin servidor de datos, y ni un poco mas.
 *
 * **Rechaza cualquier cuerpo.** Un endpoint que acepta un cuerpo es un endpoint por donde mañana
 * alguien manda "solo el nombre, para segmentar". Aqui no hay donde poner eso: si viene cuerpo, la
 * peticion se descarta.
 *
 * El evento va en la ruta y se valida contra la lista cerrada: un nombre desconocido devuelve 404,
 * no se registra. Asi el log no se puede llenar de basura desde afuera.
 */

/** Sin cache: es un contador, no un recurso. */
export const dynamic = 'force-dynamic'

function esEvento(valor: string): valor is Evento {
  return (EVENTOS as readonly string[]).includes(valor)
}

export async function POST(peticion: Request, ctx: { params: Promise<{ evento: string }> }) {
  const { evento } = await ctx.params
  if (!esEvento(evento)) return new Response(null, { status: 404 })

  /*
    Un ping no lleva cuerpo. Si lo lleva, no es un ping de esta app: se ignora entero.

    Se LEE el cuerpo y se exige vacio, en vez de comprobar `peticion.body !== null`. Medido el
    2026-09-07: un `navigator.sendBeacon(url)` sin datos llega igual con un `body` que no es `null`
    (un flujo vacio), asi que esa comprobacion rechazaba **todos** los pings con 400 y la metrica no
    registraba nada. El fallo era MUDO por construccion: un ping es fire-and-forget, no tiene a
    quien reportarle un error. Por eso ahora el E2E mide la RESPUESTA y no solo que la peticion
    salga: una peticion que devuelve 400 no es una metrica.
  */
  if ((await peticion.text()) !== '') return new Response(null, { status: 400 })

  // La unica salida es el log. Sin IP, sin agente, sin identificador: solo que ocurrio.
  console.log(`[metrica] ${evento}`)
  return new Response(null, { status: 204 })
}
