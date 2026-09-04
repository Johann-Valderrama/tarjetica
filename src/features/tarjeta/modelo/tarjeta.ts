import { z } from 'zod'

/**
 * Unidad 1c del PRP-TD-001: el contrato que consumen las 6 olas siguientes.
 *
 * **Claves de 1 o 2 letras a proposito.** No es microoptimizacion: cada byte del JSON es densidad
 * del QR, y la densidad del QR decide si se escanea de pantalla a pantalla o no. El nombre legible
 * vive en el tipo de TypeScript, no en el dato serializado.
 *
 * **Todo es `strictObject`.** Una clave desconocida no se ignora en silencio: revienta la
 * validacion. Es lo que hace que la invariante de G5 (la foto NUNCA entra al link ni al QR) la
 * sostenga el compilador y no la disciplina de quien edite despues.
 *
 * **Solo el nombre es obligatorio.** Una tarjeta con nombre y correo tiene que renderizar y exportar
 * igual de bien que una con los 20 campos llenos.
 */

/**
 * URL de verdad navegable: **solo `http:` y `https:`**.
 *
 * `z.string().url()` de Zod 4 acepta `javascript:alert(1)` (medido, no supuesto: el test
 * "valida correo y URL" lo cazo al escribir esta unidad). Estos campos se pintan como `href` en la
 * vista de tarjeta, y con el link de la Ola 6 la tarjeta la abre un TERCERO en su telefono: una URL
 * con esquema `javascript:` seria ejecucion de codigo en el navegador de esa persona.
 */
const UrlNavegable = (max: number) =>
  z
    .string()
    .max(max)
    .refine(
      (valor) => {
        try {
          const u = new URL(valor)
          return u.protocol === 'http:' || u.protocol === 'https:'
        } catch {
          return false
        }
      },
      { message: 'Tiene que ser una direccion que empiece por http:// o https://' },
    )

export const ETIQUETAS_TELEFONO = ['movil', 'whatsapp', 'oficina'] as const

export const Telefono = z.strictObject({
  /** numero */
  n: z.string().min(5).max(25),
  /** etiqueta */
  e: z.enum(ETIQUETAS_TELEFONO),
})

export const Enlace = z.strictObject({
  /** url */
  u: UrlNavegable(300),
  /** etiqueta */
  e: z.string().min(1).max(30),
})

/**
 * TOPES DUROS de los dos bloques de texto (D1b).
 *
 * No son un limite estetico: salen de un presupuesto MEDIDO. En un telefono de 375x667, despues
 * de la cabecera, el QR a ancho completo y la firma, quedan **185 px para todo el texto, unas 9
 * lineas**. Si el texto crece libre empuja el QR fuera de la pantalla, justo en el gesto central
 * del producto: extender el celular para que te escaneen.
 *
 * CALIBRADOS midiendo, no estimando (2026-09-04). Referencia: el titular real de la tarjeta de
 * Johann son 45 caracteres y su descripcion 88, asi que estos topes dejan holgura sin que el texto
 * empuje el QR fuera de la pantalla. El QR ademas se encoge solo cuando el alto aprieta.
 */
export const TOPE_TITULAR = 60
export const TOPE_DESCRIPCION = 160

export const Tarjeta = z.strictObject({
  // identidad
  /** nombre (unico campo obligatorio) */
  n: z.string().min(1).max(60),
  /** apellido */
  a: z.string().max(60).optional(),
  /** cargo */
  c: z.string().max(80).optional(),
  /** empresa */
  em: z.string().max(80).optional(),

  // contacto
  /** correo */
  co: z.string().email().max(120).optional(),
  /** hasta 3 telefonos, cada uno con su etiqueta */
  t: z.array(Telefono).max(3).optional(),
  /** sitio web */
  w: UrlNavegable(300).optional(),

  // redes
  /** instagram (usuario, sin @) */
  ig: z.string().max(40).optional(),
  /** tiktok (usuario, sin @) */
  tk: z.string().max(40).optional(),
  /** facebook (usuario o pagina) */
  fb: z.string().max(60).optional(),
  /** linkedin (usuario o vanity URL) */
  li: z.string().max(60).optional(),
  /** hasta 3 enlaces libres con etiqueta */
  l: z.array(Enlace).max(3).optional(),

  // ubicacion
  /** direccion fisica. Lleva advertencia en el editor (unidad 2d) */
  d: z.string().max(200).optional(),

  // los dos bloques de texto que la persona escribe sobre si misma (D1b, una sola vista)

  /** titular: UNA frase, lo que hace. Es la linea grande de la tarjeta */
  ti: z.string().max(TOPE_TITULAR).optional(),

  /**
   * descripcion: hasta DOS frases, por que la buscan.
   *
   * Es el unico campo donde cabe cualquier cosa, incluido un dato sensible del art. 5 de la Ley
   * 1581 (salud, afiliacion, convicciones). Lleva advertencia pegada en el editor (unidad 2d).
   */
  de: z.string().max(TOPE_DESCRIPCION).optional(),
})

/**
 * G5: la foto vive APARTE del tipo que se serializa al link. Es un dato de dispositivo, no de
 * tarjeta: se guarda en `localStorage`, se pinta en la vista, entra al `.jpeg` y al `.vcf`
 * descargado, y NUNCA toca el codec (Ola 6) ni el vCard del QR (Ola 4).
 *
 * Que sea un tipo distinto, y que `Tarjeta` sea estricto, es lo que vuelve esa invariante
 * verificable por el compilador.
 */
export const FotoLocal = z.strictObject({
  dataUrl: z.string().startsWith('data:image/jpeg'),
})

export type Telefono = z.infer<typeof Telefono>
export type Enlace = z.infer<typeof Enlace>
export type Tarjeta = z.infer<typeof Tarjeta>
export type FotoLocal = z.infer<typeof FotoLocal>

/**
 * Lo que se guarda mientras el usuario escribe: **todos los campos opcionales, y sigue siendo
 * estricto** (una clave desconocida se rechaza igual).
 *
 * Existe porque el autosave de la unidad 2c guarda en cada tecla, y en ese momento la tarjeta
 * todavia no cumple el contrato de exportacion (le falta hasta el nombre). `Tarjeta` es el contrato
 * de SALIDA: se exige al exportar el .jpeg, el vCard o el link, no al teclear.
 */
export const TarjetaBorrador = Tarjeta.partial()
export type TarjetaBorrador = z.infer<typeof TarjetaBorrador>

/** Lo que devuelve el almacenamiento cuando no hay nada guardado, o cuando lo guardado no sirve. */
export const BORRADOR_VACIO: TarjetaBorrador = {}

/** ¿Este borrador ya cumple el contrato de salida? Puerta de las exportaciones (Olas 4, 5 y 6). */
export function esExportable(borrador: TarjetaBorrador): borrador is Tarjeta {
  return Tarjeta.safeParse(borrador).success
}
