import { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'

/**
 * Unidad 6a del PRP-TD-001: el codec del link compartible.
 *
 * **El payload viaja en el FRAGMENTO de la URL (`/t#...`), nunca en el query string.** No es un
 * detalle de implementacion: el fragmento **no se envia al servidor**, asi que ni los logs del
 * hosting, ni un proxy intermedio, ni el registro de acceso de nadie ven los datos. Esa es la razon
 * por la que este producto NO crea una base de datos con informacion personal de terceros, y por la
 * que quien lo opera no queda como Responsable del tratamiento bajo la Ley 1581. Escrito asi a
 * proposito: **que nadie lo "mejore" pasandolo al query string.**
 *
 * **Dos propiedades irrenunciables, las dos PROBADAS y no asumidas:**
 *
 * 1. `decode(encode(x))` devuelve `x` para toda tarjeta valida. Un codec asimetrico corrompe la
 *    tarjeta de alguien sin avisar: el link se genera, se reparte, y falla en el telefono de un
 *    desconocido que no tiene consola donde mirar.
 * 2. **El payload NUNCA contiene la foto** (G5). Lo sostiene el TIPO y no la disciplina: `Tarjeta`
 *    es `strictObject` y la foto vive en `FotoLocal`, que es otro tipo. Una foto dentro del link
 *    volveria el QR demasiado denso para escanearlo de una pantalla a otra, que es el uso principal.
 *
 * **Byte de version al frente.** El decodificador tiene que saber cual de los dos caminos leyo:
 * `CompressionStream` no existe en todos los navegadores, y sin el byte un payload sin comprimir se
 * intentaria inflar y reventaria.
 */

/** Comprimido con `deflate-raw`. Es el camino normal. */
const VERSION_COMPRIMIDO = 1
/** Sin comprimir. Fallback donde `CompressionStream` no existe. */
const VERSION_PLANO = 0

/** La ruta que sirve un link compartido. Vive aqui para que el generador y la pagina no se desincronicen. */
export const RUTA_ENLACE = '/t'

const CODIFICADOR = new TextEncoder()

/**
 * Los bytes de este modulo se declaran sobre `ArrayBuffer` y no sobre `ArrayBufferLike`: la API de
 * streams no acepta un `SharedArrayBuffer`, y sin el estrechamiento el tipo generico no encaja.
 */
type Bytes = Uint8Array<ArrayBuffer>
const DECODIFICADOR = new TextDecoder()

function hayCompresion(): boolean {
  return typeof CompressionStream === 'function' && typeof DecompressionStream === 'function'
}

async function pasarPorStream(
  bytes: Uint8Array<ArrayBuffer>,
  // `CompressionStream` acepta `BufferSource` de entrada, no `Uint8Array`, asi que su tipo no encaja
  // en un `TransformStream<Uint8Array, Uint8Array>`. Se declara lo que de verdad se usa.
  stream: { readable: ReadableStream<Bytes>; writable: WritableStream<BufferSource> },
) {
  const escritor = stream.writable.getWriter()

  /**
   * La escritura NO se puede esperar antes de leer: un `TransformStream` tiene el buffer acotado y
   * `write` no resuelve hasta que alguien lea del otro lado. Pero tampoco se puede dejar suelta:
   * cuando el payload viene corrupto, el lado de escritura RECHAZA, y una promesa huerfana se
   * convierte en un rechazo no manejado que en el navegador aparece como error en consola aunque
   * quien llama tenga su `try`. Medido: con un payload de un solo caracter cambiado, el
   * `Z_DATA_ERROR` se escapaba del `try` de `decodificar`, que promete no lanzar nunca.
   *
   * Se guarda la promesa y se recoge en el `finally`, pase lo que pase.
   */
  const escritura = (async () => {
    await escritor.write(bytes)
    await escritor.close()
  })()

  const partes: Bytes[] = []
  const lector = stream.readable.getReader()
  try {
    for (;;) {
      const { done, value } = await lector.read()
      if (done) break
      partes.push(value)
    }
  } finally {
    await escritura.catch(() => {})
  }

  const total = partes.reduce((n, p) => n + p.byteLength, 0)
  const salida = new Uint8Array(total) as Bytes
  let cursor = 0
  for (const parte of partes) {
    salida.set(parte, cursor)
    cursor += parte.byteLength
  }
  return salida
}

/**
 * base64url: el base64 de siempre con `+/` cambiados por `-_` y sin relleno.
 *
 * El base64 normal NO sirve en una URL: `+` se interpreta como espacio y `/` parte la ruta. Y el
 * `=` del relleno se pierde al copiar y pegar un link de algunos clientes de mensajeria.
 */
function aBase64Url(bytes: Bytes): string {
  let binario = ''
  for (const byte of bytes) binario += String.fromCharCode(byte)
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function deBase64Url(texto: string): Bytes {
  const base64 = texto.replace(/-/g, '+').replace(/_/g, '/')
  const binario = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  const bytes = new Uint8Array(binario.length) as Bytes
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return bytes
}

/**
 * Convierte una tarjeta en el payload del fragmento.
 *
 * **No acepta la foto ni por descuido:** su parametro es `Tarjeta`, que es `strictObject` y no tiene
 * campo de foto. La invariante de G5 la comprueba el compilador antes que cualquier test.
 */
export async function codificar(tarjeta: Tarjeta): Promise<string> {
  const json = CODIFICADOR.encode(JSON.stringify(tarjeta)) as Bytes

  const comprimir = hayCompresion()
  const cuerpo = comprimir ? await pasarPorStream(json, new CompressionStream('deflate-raw')) : json

  const payload = new Uint8Array(cuerpo.byteLength + 1) as Bytes
  payload[0] = comprimir ? VERSION_COMPRIMIDO : VERSION_PLANO
  payload.set(cuerpo, 1)
  return aBase64Url(payload)
}

export type ResultadoDecodificacion =
  | { ok: true; tarjeta: Tarjeta }
  | { ok: false; motivo: 'vacio' | 'ilegible' | 'version-desconocida' | 'datos-invalidos' }

/**
 * Lee el payload de un fragmento y devuelve la tarjeta.
 *
 * **Nunca lanza.** Este codigo corre en el telefono de un DESCONOCIDO, que abrio un link que le
 * pasaron: ahi no hay consola donde mirar ni nadie a quien reportarle. Todo lo que no se pueda leer
 * devuelve un motivo y la pagina muestra un mensaje, no una pantalla en blanco.
 *
 * Y valida con `Tarjeta` (estricto): un payload manipulado con una clave de mas se RECHAZA en vez de
 * pintarse. Es lo que impide que alguien fabrique un link con basura adentro y la app la muestre.
 */
export async function decodificar(payload: string): Promise<ResultadoDecodificacion> {
  if (!payload) return { ok: false, motivo: 'vacio' }

  let bytes: Bytes
  try {
    bytes = deBase64Url(payload)
  } catch {
    return { ok: false, motivo: 'ilegible' }
  }
  if (bytes.byteLength < 2) return { ok: false, motivo: 'ilegible' }

  const version = bytes[0]
  if (version !== VERSION_COMPRIMIDO && version !== VERSION_PLANO) {
    return { ok: false, motivo: 'version-desconocida' }
  }

  const cuerpo = bytes.subarray(1) as Bytes
  let json: string
  try {
    const crudo =
      version === VERSION_COMPRIMIDO
        ? await pasarPorStream(cuerpo, new DecompressionStream('deflate-raw'))
        : cuerpo
    json = DECODIFICADOR.decode(crudo)
  } catch {
    return { ok: false, motivo: 'ilegible' }
  }

  let objeto: unknown
  try {
    objeto = JSON.parse(json)
  } catch {
    return { ok: false, motivo: 'ilegible' }
  }

  const validado = Tarjeta.safeParse(objeto)
  return validado.success ? { ok: true, tarjeta: validado.data } : { ok: false, motivo: 'datos-invalidos' }
}

/** El link completo, listo para repartir. El payload va SIEMPRE despues del `#`. */
export async function construirEnlace(tarjeta: Tarjeta, origen: string): Promise<string> {
  return `${origen}${RUTA_ENLACE}#${await codificar(tarjeta)}`
}
