import { deflateSync, inflateSync } from 'fflate'
import { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'

/**
 * El payload viaja en el FRAGMENTO de la URL (`/t#...`), nunca en el query string. El fragmento no
 * se envia al servidor, asi que los datos de la tarjeta no acaban en logs de hosting ni proxies.
 *
 * El byte de version conserva dos formatos: `0` es JSON plano y `1` es JSON con `deflate-raw`.
 * La foto no pertenece a `Tarjeta`, que ademas es un objeto estricto, por lo que no puede entrar al
 * enlace por accidente ni mediante un payload manipulado.
 */

/** Comprimido con `deflate-raw`. Es el camino normal. */
const VERSION_COMPRIMIDO = 1
/** Sin comprimir. Conserva los enlaces creados sin un compresor disponible. */
const VERSION_PLANO = 0

/** La ruta que sirve un link compartido. El payload va siempre en su fragmento. */
export const RUTA_ENLACE = '/t'

/** Un fragmento mayor no es un enlace de tarjeta razonable y no se intenta decodificar. */
const LIMITE_FRAGMENTO = 96 * 1024
/** Tope de texto JSON al inflar. El byte extra de fflate permite detectar el desborde. */
const LIMITE_DESCOMPRIMIDO = 64 * 1024

const CODIFICADOR = new TextEncoder()
const DECODIFICADOR = new TextDecoder('utf-8', { fatal: true })

/** Streams y `fflate` trabajan con bytes propios; nunca aceptamos SharedArrayBuffer aqui. */
type Bytes = Uint8Array<ArrayBuffer>

function copiarBytes(bytes: Uint8Array): Bytes {
  return new Uint8Array(bytes) as Bytes
}

function crearCompresorNativo(): CompressionStream | null {
  if (typeof CompressionStream !== 'function') return null
  try {
    return new CompressionStream('deflate-raw')
  } catch {
    // Algunos navegadores exponen la API pero no este formato.
    return null
  }
}

function crearDescompresorNativo(): DecompressionStream | null {
  if (typeof DecompressionStream !== 'function') return null
  try {
    return new DecompressionStream('deflate-raw')
  } catch {
    return null
  }
}

/**
 * Lee ambos lados del TransformStream a la vez. Si se esperara `write` antes de leer, el buffer
 * acotado del stream podria bloquearse. El limite se comprueba por chunk antes de guardarlo: asi
 * un enlace hostil no nos hace reservar su salida completa.
 */
async function pasarPorStream(
  bytes: Bytes,
  stream: { readable: ReadableStream<Bytes>; writable: WritableStream<BufferSource> },
  limite = Number.POSITIVE_INFINITY,
): Promise<Bytes> {
  const escritor = stream.writable.getWriter()
  const escritura = (async () => {
    await escritor.write(bytes)
    await escritor.close()
  })()
  // El rechazo se observa de inmediato y tambien en el finally. Nunca queda una promesa huerfana.
  void escritura.catch(() => {})

  const partes: Bytes[] = []
  let total = 0
  const lector = stream.readable.getReader()
  try {
    for (;;) {
      const { done, value } = await lector.read()
      if (done) break
      if (total + value.byteLength > limite) {
        await lector.cancel().catch(() => {})
        throw new Error('salida demasiado grande')
      }
      partes.push(value)
      total += value.byteLength
    }
  } finally {
    await escritura.catch(() => {})
  }

  const salida = new Uint8Array(total) as Bytes
  let cursor = 0
  for (const parte of partes) {
    salida.set(parte, cursor)
    cursor += parte.byteLength
  }
  return salida
}

function aBase64Url(bytes: Bytes): string {
  let binario = ''
  for (const byte of bytes) binario += String.fromCharCode(byte)
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function deBase64Url(texto: string): Bytes {
  if (!/^[A-Za-z0-9_-]+$/u.test(texto)) throw new Error('base64url invalido')
  const base64 = texto.replace(/-/g, '+').replace(/_/g, '/')
  const binario = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  const bytes = new Uint8Array(binario.length) as Bytes
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return bytes
}

async function comprimir(bytes: Bytes): Promise<Bytes | null> {
  const nativo = crearCompresorNativo()
  if (nativo) {
    try {
      return await pasarPorStream(bytes, nativo)
    } catch {
      // La API existia, pero no pudo comprimir esta carga: el contrato conserva el enlace plano.
      return null
    }
  }

  try {
    // Respaldo empaquetado por la aplicacion para APIs ausentes o sin deflate-raw.
    return copiarBytes(deflateSync(bytes))
  } catch {
    return null
  }
}

async function descomprimir(bytes: Bytes): Promise<Bytes> {
  const nativo = crearDescompresorNativo()
  if (nativo) return pasarPorStream(bytes, nativo, LIMITE_DESCOMPRIMIDO)

  // `out` impide que fflate reserve una salida sin tope. Se deja un byte centinela para distinguir
  // exactamente 64 KiB de una bomba truncada a 64 KiB.
  const salida = inflateSync(bytes, { out: new Uint8Array(LIMITE_DESCOMPRIMIDO + 1) })
  if (salida.byteLength > LIMITE_DESCOMPRIMIDO) throw new Error('salida demasiado grande')
  return copiarBytes(salida)
}

/** Convierte una tarjeta en el payload del fragmento. Nunca rechaza su promesa. */
export async function codificar(tarjeta: Tarjeta): Promise<string> {
  try {
    const texto = JSON.stringify(tarjeta)
    if (typeof texto !== 'string') return ''
    const json = CODIFICADOR.encode(texto) as Bytes
    const cuerpo = await comprimir(json)
    const comprimido = cuerpo !== null
    const payload = new Uint8Array((cuerpo ?? json).byteLength + 1) as Bytes
    payload[0] = comprimido ? VERSION_COMPRIMIDO : VERSION_PLANO
    payload.set(cuerpo ?? json, 1)
    const codificado = aBase64Url(payload)
    return codificado.length <= LIMITE_FRAGMENTO ? codificado : ''
  } catch {
    return ''
  }
}

export type ResultadoDecodificacion =
  | { ok: true; tarjeta: Tarjeta }
  | { ok: false; motivo: 'vacio' | 'ilegible' | 'version-desconocida' | 'datos-invalidos' }

/**
 * Lee un payload hostil o antiguo sin lanzar. La validacion final es estricta para que campos
 * desconocidos (incluida una foto) nunca lleguen a la vista de tarjeta.
 */
export async function decodificar(payload: string): Promise<ResultadoDecodificacion> {
  try {
    if (!payload) return { ok: false, motivo: 'vacio' }
    if (typeof payload !== 'string' || payload.length > LIMITE_FRAGMENTO) return { ok: false, motivo: 'ilegible' }

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

    let json: string
    try {
      const crudo = version === VERSION_COMPRIMIDO ? await descomprimir(copiarBytes(bytes.subarray(1))) : bytes.subarray(1)
      if (crudo.byteLength > LIMITE_DESCOMPRIMIDO) return { ok: false, motivo: 'ilegible' }
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
  } catch {
    return { ok: false, motivo: 'ilegible' }
  }
}

/** El link completo, listo para repartir. El payload va SIEMPRE despues del `#`. */
export async function construirEnlace(tarjeta: Tarjeta, origen: string): Promise<string> {
  try {
    return `${origen}${RUTA_ENLACE}#${await codificar(tarjeta)}`
  } catch {
    return `${origen}${RUTA_ENLACE}#`
  }
}
