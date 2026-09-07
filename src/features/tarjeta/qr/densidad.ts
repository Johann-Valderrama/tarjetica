import QRCode from 'qrcode'
import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { octetos, vcardParaQr } from '@/features/tarjeta/vcard/generar'

/**
 * Unidad 4f del PRP-TD-001: el aviso de densidad.
 *
 * Es la mitigacion del riesgo que introduce llevar TODO dentro del QR (D3a): el codigo se vuelve
 * mas denso cuanto mas se esfuerza la persona en llenar su tarjeta, o sea que **falla justo con la
 * tarjeta de quien mas trabajo se tomo**, y sin aviso no tiene forma de enterarse hasta que alguien
 * en un salon no logra escanearla.
 *
 * El dato que se muestra habilita una decision del usuario, que es recortar un campo, asi que va con
 * el campo NOMBRADO. Un aviso que diga "tu QR es denso" y nada mas no habilita nada.
 *
 * **El umbral es la version 15** (77 modulos: 4,0 px por cuadrito sobre un codigo de 340 px). Por
 * encima de ahi todavia se lee en condiciones buenas, pero se pierde el colchon de 20-30% que la
 * regla 10:1 pide para luz de salon, angulo y camaras de gama baja.
 */

export const VERSION_QR_DE_AVISO = 15

/** Cuanto pesa cada campo recortable dentro del vCard, en octetos, y como se llama para el usuario. */
export type Recorte = {
  /**
   * Clave del campo en el modelo. Es TAMBIEN la clave de traduccion del nombre que ve el usuario
   * (`qr.recortes.<campo>` en `messages/`): unidad 7a. Antes aqui vivia la etiqueta en español
   * escrita a mano, y eso dejaba el unico aviso accionable del producto sin traducir.
   */
  campo: CampoRecortable
  /** Octetos que se ahorran si se quita. */
  octetos: number
}

export type Densidad = {
  /** Version del simbolo QR (1 a 40). Sube con la cantidad de datos. */
  version: number
  /** Lado del simbolo en modulos, SIN la zona silenciosa. */
  modulos: number
  /** Octetos del vCard que se codifica. */
  octetos: number
  /** ¿Pasa del umbral y hay que avisarle al usuario? */
  avisar: boolean
  /** Los campos mas pesados que la persona puede quitar, del mas caro al mas barato. */
  recortes: Recorte[]
}

/**
 * Los campos que la persona PUEDE quitar sin dejar de tener una tarjeta, del que suele pesar mas al
 * que menos. `n` (nombre) no esta: es el unico obligatorio del modelo, asi que ofrecer recortarlo
 * seria ofrecer romper la tarjeta.
 *
 * El orden de esta lista NO decide nada (el orden final sale de medir el ahorro real de cada uno);
 * es solo el barrido.
 */
const RECORTABLES = ['de', 'ti', 'l', 'd', 't', 'w', 'li', 'ig', 'fb', 'tk', 'em', 'c'] as const

/**
 * Los campos que el aviso puede nombrar. Es una UNION y no `keyof Tarjeta` a proposito: es lo que
 * hace que `qr.recortes.<campo>` sea una clave de traduccion comprobada por el compilador, asi que
 * agregar un recortable sin su nombre en los dos idiomas no compila.
 */
export type CampoRecortable = (typeof RECORTABLES)[number]

/**
 * Mide la tarjeta REAL: construye su vCard, deja que la libreria elija la version que de verdad
 * necesita, y calcula el ahorro de cada campo QUITANDOLO y volviendo a medir el vCard.
 *
 * No se estima el peso de un campo por el largo de su valor: la codificacion del QR no es lineal
 * (cambia de modo, y el plegado agrega bytes), asi que la unica cifra honesta es la diferencia
 * medida entre el vCard con el campo y sin el.
 */
export function medirDensidad(tarjeta: Tarjeta): Densidad {
  const texto = vcardParaQr(tarjeta)
  const simbolo = QRCode.create(texto, { errorCorrectionLevel: 'M' })
  const total = octetos(texto)

  const recortes: Recorte[] = []
  for (const campo of RECORTABLES) {
    if (tarjeta[campo] === undefined) continue
    const sinEse = { ...tarjeta }
    delete sinEse[campo]
    const ahorro = total - octetos(vcardParaQr(sinEse as Tarjeta))
    if (ahorro > 0) recortes.push({ campo, octetos: ahorro })
  }
  recortes.sort((a, b) => b.octetos - a.octetos)

  return {
    version: simbolo.version,
    modulos: simbolo.modules.size,
    octetos: total,
    avisar: simbolo.version > VERSION_QR_DE_AVISO,
    recortes,
  }
}

/** Lo que hay que decirle al usuario, sin redactar: la redaccion vive en `messages/`. */
export type AvisoDeDensidad = {
  /** Lado del simbolo en modulos, la cifra que se le muestra. */
  modulos: number
  /** El campo mas caro, si hay alguno recortable. Es la clave de `qr.recortes.<campo>`. */
  campo?: CampoRecortable
}

/**
 * El aviso, como DATO y no como frase. Nombra el campo mas caro porque el usuario no puede decidir
 * sobre "los datos": decide sobre "la descripcion".
 *
 * Devuelve un descriptor en vez del texto ya armado (unidad 7a) por dos razones: esta funcion es
 * pura y corre tambien fuera de React (en los tests y en `scripts/medir-densidad-qr.mjs`), donde no
 * hay traductor; y asi el texto no puede quedarse en español cuando la app esta en ingles.
 */
export function avisoDeDensidad(densidad: Densidad): AvisoDeDensidad | null {
  if (!densidad.avisar) return null
  return { modulos: densidad.modulos, campo: densidad.recortes[0]?.campo }
}
