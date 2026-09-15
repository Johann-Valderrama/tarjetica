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
 * Base de las dos reglas de URL: el esquema se valida contra una LISTA BLANCA.
 *
 * `z.string().url()` de Zod 4 acepta `javascript:alert(1)` (medido, no supuesto: el test
 * "valida correo y URL" lo cazo al escribir esta unidad). Estos campos se pintan como `href` en la
 * vista de tarjeta, y con el link de la Ola 6 la tarjeta la abre un TERCERO en su telefono: una URL
 * con esquema `javascript:` seria ejecucion de codigo en el navegador de esa persona.
 */
const urlConEsquemas = (max: number, esquemas: readonly string[]) =>
  z
    .string()
    .max(max)
    .refine(
      (valor) => {
        try {
          return esquemas.includes(new URL(valor).protocol)
        } catch {
          return false
        }
      },
      { message: `Tiene que ser una direccion que empiece por ${esquemas.map((e) => `${e}//`).join(' o ')}` },
    )

/** URL de verdad navegable: **solo `http:` y `https:`**. */
const UrlNavegable = (max: number) => urlConEsquemas(max, ['http:', 'https:'])

/**
 * URL de una ACCION de la tarjeta (agendar, contar que necesitas): `https:` y nada mas.
 *
 * Mas estricta que `UrlNavegable` a proposito. Una accion es un boton grande que un desconocido
 * toca en su telefono sin mirar el destino: en `http:` ese salto viaja en claro, y unas credenciales
 * incrustadas (`https://usuario:clave@...`) son la forma clasica de disfrazar el host real.
 */
const UrlSoloHttps = (max: number) =>
  urlConEsquemas(max, ['https:']).refine(
    (valor) => {
      try {
        const u = new URL(valor)
        return !u.username && !u.password
      } catch {
        return false
      }
    },
    { message: 'No puede llevar usuario ni contraseña' },
  )

const REDES = {
  linkedin: { dominio: 'linkedin.com', prefijo: 'https://linkedin.com/in/', maxHandle: 60 },
  instagram: { dominio: 'instagram.com', prefijo: 'https://instagram.com/', maxHandle: 40 },
  tiktok: { dominio: 'tiktok.com', prefijo: 'https://tiktok.com/@', maxHandle: 40 },
  facebook: { dominio: 'facebook.com', prefijo: 'https://facebook.com/', maxHandle: 60 },
} as const

export type RedSocial = keyof typeof REDES

/**
 * Convierte un handle o una URL completa de una red en una unica URL navegable.
 *
 * Los handles conservan los prefijos que ya usaba el vCard. Una URL completa se acepta solo si es
 * HTTP(S) y su host pertenece a la red: comparar por dominio evita confundir
 * `facebook.com.example.org` con Facebook. Se permiten subdominios oficiales como `www` y `m`.
 */
export function urlDeRedSocial(valor: string, red: RedSocial): string | null {
  const limpio = valor.trim()
  if (!limpio || /\s/u.test(limpio)) return null

  const configuracion = REDES[red]
  const sinArroba = limpio.startsWith('@') ? limpio.slice(1) : limpio
  if (/^[a-zA-Z0-9._-]+$/u.test(sinArroba) && sinArroba.length <= configuracion.maxHandle) {
    return `${configuracion.prefijo}${sinArroba}`
  }

  try {
    const url = new URL(limpio)
    const protocoloValido = url.protocol === 'http:' || url.protocol === 'https:'
    const hostValido =
      url.hostname === configuracion.dominio || url.hostname.endsWith(`.${configuracion.dominio}`)
    if (!protocoloValido || !hostValido || url.username || url.password || url.port) return null
    return url.href
  } catch {
    return null
  }
}

const DireccionDeRedSocial = (red: RedSocial) =>
  z
    .string()
    // Una URL completa pesa mas que un handle. El techo sigue siendo el de las otras URLs.
    .max(300)
    .refine((valor) => urlDeRedSocial(valor, red) !== null, {
      message: `Tiene que ser un handle o una URL de ${red}`,
    })

/**
 * Completa el `https://` de una direccion escrita "a lo humano" (2026-09-11).
 *
 * **Por que existe.** Casi todo el mundo escribe su web como `midominio.com`, y `UrlNavegable` la
 * rechazaba: la tarjeta dejaba de ser exportable y los botones de compartir se quedaban apagados
 * sin decir por que. Lo encontro Johann usando la app en produccion; ningun test lo cubria, porque
 * todos los fixtures traian la web con su `https://`.
 *
 * **Lo que NO afloja.** La regla de seguridad sigue intacta: esto solo toca lo que NO trae esquema.
 * Un `javascript:alert(1)` ya trae uno, asi que pasa sin cambios y `UrlNavegable` lo sigue
 * rechazando. Tampoco inventa una URL de cualquier texto: si no hay un punto, o hay espacios, no
 * parece un dominio y se deja tal cual para que la validacion lo diga.
 */
export function completarEsquema(valor: string | undefined): string | undefined {
  if (!valor) return valor
  const limpio = valor.trim()
  // Ya trae esquema, bueno o malo: lo decide `UrlNavegable`, no esta funcion.
  if (/^[a-z][a-z0-9+.-]*:/i.test(limpio)) return limpio
  if (!limpio.includes('.') || /\s/.test(limpio)) return limpio
  return `https://${limpio}`
}

/** Aplica `completarEsquema` a los dos campos de direccion: la web y los enlaces extra. */
export function normalizarDirecciones(borrador: TarjetaBorrador): TarjetaBorrador {
  const salida = { ...borrador }
  if (salida.w !== undefined) salida.w = completarEsquema(salida.w)
  if (salida.l) salida.l = salida.l.map((e) => ({ ...e, u: completarEsquema(e.u) ?? e.u }))
  return salida
}

/**
 * El PRIMER campo que impide exportar la tarjeta, o `null` si ya se puede (2026-09-11).
 *
 * Antes, la pantalla solo sabia "no es exportable" y lo traducia siempre como "escribe tu nombre",
 * y el boton apagado llevaba siempre a la casilla de confirmacion. Con el nombre escrito y la web
 * sin `https://`, eso mandaba a la persona a revisar justo lo que ya estaba bien.
 */
export function campoQueImpideExportar(borrador: TarjetaBorrador): { campo: string; indice?: number } | null {
  const r = Tarjeta.safeParse(borrador)
  if (r.success) return null
  const [campo, indice] = r.error.issues[0].path
  return { campo: String(campo), indice: typeof indice === 'number' ? indice : undefined }
}

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

/**
 * Los dos temas de la tarjeta. **La AUSENCIA de `tm` significa oscuro**, y por eso el esquema no
 * lleva `.default()`: un enlace repartido antes de esta unidad tiene que decodificar al MISMO objeto
 * de antes, sin ganar claves que su emisor nunca escribio.
 */
export const TEMAS = ['claro', 'oscuro'] as const
export type Tema = (typeof TEMAS)[number]

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
  /** instagram (handle con/sin @ o URL completa) */
  ig: DireccionDeRedSocial('instagram').optional(),
  /** tiktok (handle con/sin @ o URL completa) */
  tk: DireccionDeRedSocial('tiktok').optional(),
  /** facebook (handle/pagina con/sin @ o URL completa) */
  fb: DireccionDeRedSocial('facebook').optional(),
  /** linkedin (handle con/sin @ o URL completa) */
  li: DireccionDeRedSocial('linkedin').optional(),
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

  // acciones opcionales y apariencia (U2)

  /** url de agenda: destino del boton "Agendar" */
  ag: UrlSoloHttps(300).optional(),
  /** url de "Cuentame que necesitas" */
  cn: UrlSoloHttps(300).optional(),
  /** tema. Ausente = oscuro (ver `TEMAS`) */
  tm: z.enum(TEMAS).optional(),
  /** color de marca en hexadecimal de 6 digitos. Seis y no tres: una sola forma de escribir el
   * mismo color, asi que comparar dos tarjetas no depende de como lo tecleo cada quien */
  cm: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
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

/** Logo local independiente: conserva transparencia y no entra al QR ni al enlace. */
export const LogoLocal = z.strictObject({
  dataUrl: z.string().max(100_000).regex(/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/),
})
export type LogoLocal = z.infer<typeof LogoLocal>

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

/**
 * Lo que se GUARDA en el dispositivo: el borrador tal como se esta escribiendo (2026-09-11).
 *
 * **Por que es una regla aparte y mas permisiva.** Antes, guardar exigia el mismo formato que
 * compartir, asi que cualquier campo a medio escribir (un correo como `johann@`, una web sin
 * `https://`, una fila de enlace recien agregada y todavia vacia) hacia fallar la validacion y el
 * guardado automatico dejaba de guardar EN SILENCIO. Todo lo escrito despues vivia solo en la
 * pestaña y se perdia al recargar. Un borrador es justamente lo que todavia no esta terminado.
 *
 * **Lo que conserva.** Mismas claves, `strictObject` (una clave desconocida se rechaza, asi que un
 * dato manipulado a mano en el almacenamiento sigue sin entrar), y tipos correctos. Solo suelta el
 * FORMATO. Los topes son holgados a proposito: nadie los alcanza tecleando, y frenan la basura.
 *
 * **Por que es seguro.** Un borrador solo se pinta dentro de campos del editor, que escapan el
 * texto. Donde un dato se vuelve un enlace clicable (la vista de la tarjeta, el QR, el `.vcf`, el
 * link compartible) manda `esExportable`, que sigue usando `Tarjeta`, la regla estricta.
 *
 * Tiene que tener las MISMAS claves que `Tarjeta`: lo vigila un test, porque un campo nuevo que se
 * agregue alla y no aca haria que el borrador guardado lo rechazara entero.
 */
const TextoGuardable = z.string().max(1000)
export const BorradorGuardable = z.strictObject({
  n: TextoGuardable.optional(),
  a: TextoGuardable.optional(),
  c: TextoGuardable.optional(),
  em: TextoGuardable.optional(),
  co: TextoGuardable.optional(),
  t: z.array(z.strictObject({ n: TextoGuardable, e: z.enum(ETIQUETAS_TELEFONO) })).max(10).optional(),
  w: TextoGuardable.optional(),
  ig: TextoGuardable.optional(),
  tk: TextoGuardable.optional(),
  fb: TextoGuardable.optional(),
  li: TextoGuardable.optional(),
  l: z.array(z.strictObject({ u: TextoGuardable, e: TextoGuardable })).max(10).optional(),
  d: TextoGuardable.optional(),
  ti: TextoGuardable.optional(),
  de: TextoGuardable.optional(),
  ag: TextoGuardable.optional(),
  cn: TextoGuardable.optional(),
  // El tema no se teclea, se elige en un control cerrado: aqui no hay formato a medio escribir que
  // conservar, y un valor inventado si seria basura.
  tm: z.enum(TEMAS).optional(),
  cm: TextoGuardable.optional(),
})

/** ¿Este borrador ya cumple el contrato de salida? Puerta de las exportaciones (Olas 4, 5 y 6). */
export function esExportable(borrador: TarjetaBorrador): borrador is Tarjeta {
  return Tarjeta.safeParse(borrador).success
}
