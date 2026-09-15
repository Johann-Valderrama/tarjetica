import { urlDeRedSocial, type RedSocial, type Tarjeta } from '@/features/tarjeta/modelo/tarjeta'

export type TipoEnlacePerfil =
  | 'web'
  | 'linkedin'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'otro'

export type EnlacePerfil = {
  tipo: TipoEnlacePerfil
  url: string
  etiqueta?: string
}

/**
 * Devuelve el enlace directo a WhatsApp del primer teléfono válido etiquetado como tal.
 *
 * WhatsApp requiere un número internacional explícito. Los separadores habituales se quitan,
 * pero no se adivina ningún prefijo de país y cualquier texto adicional invalida el número.
 */
export function urlWhatsapp(tarjeta: Tarjeta, texto?: string): string | null {
  const telefonos = (tarjeta as { t?: unknown }).t
  if (!Array.isArray(telefonos)) return null

  for (const candidato of telefonos) {
    if (typeof candidato !== 'object' || candidato === null || !('e' in candidato) || candidato.e !== 'whatsapp') {
      continue
    }
    if (!('n' in candidato) || typeof candidato.n !== 'string') continue

    const valor = candidato.n.trim()
    if (!valor.startsWith('+')) continue

    const digitos = valor.slice(1).replace(/[\s().-]/gu, '')
    if (/^[1-9]\d{7,14}$/u.test(digitos)) {
      // Mensaje prellenado (ola 1, mejora 2): la conversacion arranca con contexto en vez de un
      // chat vacio. `wa.me` lo acepta como `text`; se codifica para que un nombre con espacios o
      // tildes no rompa la URL.
      return texto ? `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}` : `https://wa.me/${digitos}`
    }
  }
  return null
}

/**
 * `tel:` del PRIMER telefono (ola 1, mejora 3): quien recibe esta en un telefono y tocar para
 * llamar es el gesto natural. Se conservan el `+` y los digitos; todo lo demas se quita. Sin un
 * numero de al menos 7 digitos no hay accion.
 */
export function urlLlamar(tarjeta: Tarjeta): string | null {
  const telefonos = (tarjeta as { t?: unknown }).t
  if (!Array.isArray(telefonos) || telefonos.length === 0) return null
  const primero = telefonos[0]
  if (typeof primero !== 'object' || primero === null || !('n' in primero) || typeof primero.n !== 'string') return null
  const valor = primero.n.trim()
  const digitos = valor.replace(/[^\d]/gu, '')
  if (digitos.length < 7 || digitos.length > 15) return null
  return `tel:${valor.startsWith('+') ? '+' : ''}${digitos}`
}

/** `mailto:` del correo, solo si tiene forma de correo. Sin cabeceras ni asunto: menos superficie. */
export function urlCorreo(tarjeta: Tarjeta): string | null {
  const correo = (tarjeta as { co?: unknown }).co
  if (typeof correo !== 'string') return null
  const limpio = correo.trim()
  if (!/^[^\s@/?#]+@[^\s@/?#]+\.[^\s@/?#]+$/u.test(limpio)) return null
  return `mailto:${limpio}`
}

const ESQUEMAS_NAVEGABLES = ['http:', 'https:'] as const
/** Las dos acciones no aceptan `http:`. Misma razon que `UrlSoloHttps` en el modelo. */
const ESQUEMAS_DE_ACCION = ['https:'] as const

function urlHttpSegura(valor: unknown, esquemas: readonly string[] = ESQUEMAS_NAVEGABLES): string | null {
  if (typeof valor !== 'string') return null
  const limpio = valor.trim()
  if (!limpio) return null

  try {
    const url = new URL(limpio)
    if (!esquemas.includes(url.protocol) || url.username || url.password) return null
    return url.href
  } catch {
    return null
  }
}

/**
 * Los destinos de las dos acciones opcionales (U2): agendar y "cuentame que necesitas".
 *
 * Se revalidan en tiempo de ejecucion, igual que `urlWhatsapp`, porque tambien pueden recibir un
 * payload manipulado a mano en JavaScript, fuera de la garantia estatica de `Tarjeta`. Devuelven
 * `null` en vez de lanzar: una accion que no se puede confiar simplemente no se pinta.
 */
export function urlAgenda(tarjeta: Tarjeta): string | null {
  return urlHttpSegura((tarjeta as { ag?: unknown }).ag, ESQUEMAS_DE_ACCION)
}

export function urlCuentame(tarjeta: Tarjeta): string | null {
  return urlHttpSegura((tarjeta as { cn?: unknown }).cn, ESQUEMAS_DE_ACCION)
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

/**
 * Reúne los destinos accionables del perfil, en el orden de la tarjeta y sin repetir URLs.
 * Toda entrada se vuelve a validar porque el helper también puede recibir datos provenientes de
 * un payload manipulado en JavaScript, fuera de la garantía estática de `Tarjeta`.
 */
export function enlacesDelPerfil(tarjeta: Tarjeta): EnlacePerfil[] {
  const resultado: EnlacePerfil[] = []
  const vistos = new Set<string>()

  const agregar = (tipo: TipoEnlacePerfil, valor: unknown, etiqueta?: string) => {
    const url = urlHttpSegura(valor)
    if (!url || vistos.has(url)) return
    vistos.add(url)
    resultado.push(etiqueta === undefined ? { tipo, url } : { tipo, url, etiqueta })
  }

  const datos = tarjeta as Record<string, unknown>
  agregar('web', datos.w)

  const redes: [keyof Pick<Tarjeta, 'li' | 'ig' | 'tk' | 'fb'>, RedSocial, Exclude<TipoEnlacePerfil, 'web' | 'otro'>][] = [
    ['li', 'linkedin', 'linkedin'],
    ['ig', 'instagram', 'instagram'],
    ['tk', 'tiktok', 'tiktok'],
    ['fb', 'facebook', 'facebook'],
  ]
  for (const [campo, red, tipo] of redes) {
    const valor = datos[campo]
    if (typeof valor !== 'string') continue
    const url = urlDeRedSocial(valor, red)
    agregar(tipo, url)
  }

  if (Array.isArray(datos.l)) {
    for (const enlace of datos.l) {
      if (!esRegistro(enlace)) continue
      const etiqueta = typeof enlace.e === 'string' ? enlace.e : undefined
      agregar('otro', enlace.u, etiqueta)
    }
  }

  return resultado
}

export type TipoCanal = 'whatsapp' | 'llamar' | 'correo' | Exclude<TipoEnlacePerfil, 'otro'>

export type Canal = { tipo: TipoCanal; url: string }

/**
 * La fila de iconos del receptor (ola 1, U5): SOLO los canales que la persona lleno, en un orden
 * fijo (los de contacto directo primero, las redes despues). Reutiliza `enlacesDelPerfil` y los
 * helpers de arriba: cero validacion de URL nueva. Un canal vacio no aparece atenuado, no aparece
 * y punto: ademas de no dejar huecos, no revela que canales NO tiene la persona.
 */
export function canalesDelPerfil(tarjeta: Tarjeta, textoWhatsapp?: string): Canal[] {
  const canales: Canal[] = []
  const whatsapp = urlWhatsapp(tarjeta, textoWhatsapp)
  if (whatsapp) canales.push({ tipo: 'whatsapp', url: whatsapp })
  const llamar = urlLlamar(tarjeta)
  if (llamar) canales.push({ tipo: 'llamar', url: llamar })
  const correo = urlCorreo(tarjeta)
  if (correo) canales.push({ tipo: 'correo', url: correo })
  for (const enlace of enlacesDelPerfil(tarjeta)) {
    if (enlace.tipo !== 'otro') canales.push({ tipo: enlace.tipo, url: enlace.url })
  }
  return canales
}
