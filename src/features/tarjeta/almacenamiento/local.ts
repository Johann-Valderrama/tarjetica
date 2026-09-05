import {
  BORRADOR_VACIO,
  FotoLocal,
  TarjetaBorrador,
  type TarjetaBorrador as TipoBorrador,
} from '@/features/tarjeta/modelo/tarjeta'

/**
 * Unidad 1d del PRP-TD-001: persistencia en el dispositivo. D1 en su forma mas literal, la tarjeta
 * vive aqui y en ningun servidor.
 *
 * Tres cosas que este modulo garantiza, y que ningun test de funcionamiento normal delata:
 *
 * 1. **`localStorage` puede LANZAR** (modo privado de Safari, almacenamiento bloqueado por politica,
 *    cuota llena). Toda lectura y escritura va en `try/catch`; la app renderiza bien con cero datos.
 * 2. **Un dato viejo o corrupto no revienta el render.** Se valida SIEMPRE al leer, y lo que no pase
 *    se descarta devolviendo borrador vacio. El telefono de un desconocido, en una conferencia, no
 *    tiene consola donde mirar.
 * 3. **El borrado deja la clave sin rastro**, no un objeto vacio. Es la contramedida del equipo
 *    compartido de stand: sin el, el autosave le muestra al siguiente la tarjeta del anterior.
 */

const CLAVE_TARJETA = 'tarjetica.tarjeta'
const CLAVE_FOTO = 'tarjetica.foto'
/**
 * La confirmacion de "esta tarjeta es mia" (unidad 2d). Se PERSISTE, no vive en el estado de un
 * componente, porque es la puerta de las exportaciones y esas ocurren en DOS pantallas: el `.vcf`
 * en el editor y el `.jpeg` en la vista de la tarjeta, que es donde esta el elemento que se captura.
 * Sin persistirla, pasar de una a otra la perderia y la puerta se abriria sola.
 *
 * Es una afirmacion sobre la TARJETA ("es mia"), no un acto de sesion, asi que persistirla en el
 * dispositivo es lo coherente. Y el boton de borrar se la lleva junto con todo lo demas.
 */
const CLAVE_CONFIRMACION = 'tarjetica.confirmacion'

/** Todas las claves que este producto ha usado alguna vez. El borrado las barre TODAS. */
const CLAVES_CONOCIDAS = [CLAVE_TARJETA, CLAVE_FOTO, CLAVE_CONFIRMACION] as const

/** Version del formato guardado. Sube cuando el envoltorio cambie de forma incompatible. */
export const VERSION_ALMACEN = 1

type Resultado<T> = { ok: true; valor: T } | { ok: false; motivo: MotivoDeFallo }

export type MotivoDeFallo =
  | 'sin-datos'
  | 'almacen-no-disponible'
  | 'json-invalido'
  | 'version-desconocida'
  | 'datos-invalidos'

/**
 * Devuelve `localStorage` o `null`. Nunca lanza: el simple acceso a la propiedad ya tira en algunos
 * navegadores con el almacenamiento bloqueado, por eso el `try` envuelve tambien la lectura.
 */
function obtenerAlmacen(): Storage | null {
  try {
    const almacen = globalThis.localStorage
    return almacen ?? null
  } catch {
    return null
  }
}

function leerCrudo(clave: string): Resultado<unknown> {
  const almacen = obtenerAlmacen()
  if (!almacen) return { ok: false, motivo: 'almacen-no-disponible' }

  let texto: string | null
  try {
    texto = almacen.getItem(clave)
  } catch {
    return { ok: false, motivo: 'almacen-no-disponible' }
  }
  if (texto === null) return { ok: false, motivo: 'sin-datos' }

  let envoltorio: unknown
  try {
    envoltorio = JSON.parse(texto)
  } catch {
    return { ok: false, motivo: 'json-invalido' }
  }

  if (
    typeof envoltorio !== 'object' ||
    envoltorio === null ||
    !('v' in envoltorio) ||
    !('d' in envoltorio)
  ) {
    return { ok: false, motivo: 'json-invalido' }
  }

  const { v, d } = envoltorio as { v: unknown; d: unknown }
  // Migracion por version. Hoy solo existe la 1: cualquier otra cosa se descarta en vez de
  // adivinar su forma. Cuando haya una v2, aqui va la conversion de 1 a 2, no un `if` en el editor.
  if (v !== VERSION_ALMACEN) return { ok: false, motivo: 'version-desconocida' }

  return { ok: true, valor: d }
}

function escribirCrudo(clave: string, dato: unknown): boolean {
  const almacen = obtenerAlmacen()
  if (!almacen) return false
  try {
    almacen.setItem(clave, JSON.stringify({ v: VERSION_ALMACEN, d: dato }))
    instantaneaValida = false
    return true
  } catch {
    // Cuota llena o almacenamiento bloqueado. Se devuelve `false` para que quien llame pueda
    // AVISAR: un guardado que falla en silencio le hace perder la tarjeta al usuario.
    return false
  }
}

/** Lee la tarjeta guardada. Nunca lanza: ante cualquier problema devuelve borrador vacio. */
export function leerTarjeta(): TipoBorrador {
  return leerTarjetaDetallado().valor
}

/**
 * Igual que `leerTarjeta`, pero dice POR QUE no habia nada. El editor lo usa para distinguir
 * "primera visita" de "tus datos guardados no se pudieron leer", que no son lo mismo para el usuario.
 */
export function leerTarjetaDetallado(): { valor: TipoBorrador; motivo: MotivoDeFallo | null } {
  const crudo = leerCrudo(CLAVE_TARJETA)
  if (!crudo.ok) return { valor: BORRADOR_VACIO, motivo: crudo.motivo }

  const validado = TarjetaBorrador.safeParse(crudo.valor)
  if (!validado.success) return { valor: BORRADOR_VACIO, motivo: 'datos-invalidos' }

  return { valor: validado.data, motivo: null }
}

/** Guarda la tarjeta. Devuelve `false` si el navegador no dejo guardar (para poder avisar). */
export function guardarTarjeta(borrador: TipoBorrador): boolean {
  const validado = TarjetaBorrador.safeParse(borrador)
  if (!validado.success) return false
  return escribirCrudo(CLAVE_TARJETA, validado.data)
}

/** Lee la foto guardada (G5). Vive aparte de la tarjeta: nunca entra al link ni al QR. */
export function leerFoto(): FotoLocal | null {
  const crudo = leerCrudo(CLAVE_FOTO)
  if (!crudo.ok) return null
  const validado = FotoLocal.safeParse(crudo.valor)
  return validado.success ? validado.data : null
}

/** Guarda la foto ya reducida por la unidad 2e. Devuelve `false` si el navegador no dejo. */
export function guardarFoto(foto: FotoLocal): boolean {
  const validado = FotoLocal.safeParse(foto)
  if (!validado.success) return false
  return escribirCrudo(CLAVE_FOTO, validado.data)
}

/** Borra SOLO la foto. Quitar la foto no puede llevarse la tarjeta por delante. */
export function borrarFoto(): boolean {
  const almacen = obtenerAlmacen()
  if (!almacen) return false
  try {
    almacen.removeItem(CLAVE_FOTO)
    instantaneaValida = false
    return true
  } catch {
    return false
  }
}

/**
 * Borra TODO lo de este producto en este dispositivo (boton de la unidad 2d).
 * Quita las claves, no las deja en blanco: tras borrar, `getItem` devuelve `null`.
 */
export function borrarTodo(): boolean {
  const almacen = obtenerAlmacen()
  if (!almacen) return false
  try {
    for (const clave of CLAVES_CONOCIDAS) almacen.removeItem(clave)
    instantaneaValida = false
    return true
  } catch {
    return false
  }
}

/** ¿La persona confirmo que la tarjeta es suya? Puerta de TODAS las exportaciones. */
export function leerConfirmacion(): boolean {
  const crudo = leerCrudo(CLAVE_CONFIRMACION)
  return crudo.ok && crudo.valor === true
}

/** Guarda (o retira) esa confirmacion. */
export function guardarConfirmacion(confirmado: boolean): boolean {
  return escribirCrudo(CLAVE_CONFIRMACION, confirmado === true)
}

/**
 * Instantanea cacheada para `useSyncExternalStore`.
 *
 * Existe por una razon concreta: `useSyncExternalStore` compara la instantanea por IDENTIDAD, y
 * `leerTarjeta()` construye un objeto nuevo en cada llamada, asi que sin cache React entraria en un
 * bucle infinito de renders. Se invalida cuando algo escribe, o cuando OTRA pestana escribe.
 */
let instantanea: TipoBorrador = BORRADOR_VACIO
let instantaneaValida = false

export function instantaneaTarjeta(): TipoBorrador {
  if (!instantaneaValida) {
    instantanea = leerTarjeta()
    instantaneaValida = true
  }
  return instantanea
}

/** En el servidor no hay `localStorage`. Devolver siempre lo mismo evita el desajuste de hidratacion. */
export function instantaneaDelServidor(): TipoBorrador {
  return BORRADOR_VACIO
}

/**
 * Avisa cuando el almacen cambia. El evento `storage` solo lo disparan OTRAS pestanas, que es justo
 * el caso del equipo compartido de stand: dos pestanas abiertas sobre la misma tarjeta.
 */
export function suscribirAlAlmacen(alCambiar: () => void): () => void {
  const manejar = () => {
    instantaneaValida = false
    alCambiar()
  }
  globalThis.addEventListener?.("storage", manejar)
  return () => globalThis.removeEventListener?.("storage", manejar)
}

/** Boton de "esto ya no vale" para despues de escribir desde esta misma pestana. */
export function invalidarInstantanea(): void {
  instantaneaValida = false
}

/** Solo para tests y diagnostico: que claves usa este modulo. */
export const CLAVES = { tarjeta: CLAVE_TARJETA, foto: CLAVE_FOTO } as const
