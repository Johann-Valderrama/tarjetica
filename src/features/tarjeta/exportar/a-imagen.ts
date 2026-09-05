import { domToJpeg } from 'modern-screenshot'
import { ID_CAPTURABLE } from '@/features/tarjeta/vista/tarjeta'

/**
 * Unidad 5a del PRP-TD-001: la tarjeta convertida en `.jpeg`, EN EL CLIENTE.
 *
 * Es la SALIDA PRINCIPAL 2, y es construccion 100% nueva: en la landing de referencia no existe
 * exportacion de la tarjeta a imagen.
 *
 * ⛔ **`next/og` y `@vercel/og` estan PROHIBIDOS aqui**, aunque exista el precedente en
 * `Personal landing page\src\app\opengraph-image.tsx`. Renderizan en el SERVIDOR, o sea que los
 * datos de la tarjeta viajarian hasta alla: rompe D1 en silencio y ningun test lo delata.
 *
 * **El fallo propio de esta unidad es MUDO.** Si las webfonts no se embeben, el texto sale en
 * blanco, no se lanza ningun error, y nadie se entera hasta que alguien muestra la imagen. Por eso
 * la libreria se eligio por su manejo de fuentes (`modern-screenshot`, MIT, sin dependencias, y
 * mantenida: la alternativa comun, `html-to-image`, no publica desde febrero de 2025), y por eso la
 * verificacion mide VARIANZA DE PIXELES y no solo que el archivo exista.
 */

/**
 * Tres veces la densidad de la pantalla. La imagen se ve en el telefono de otra persona y se
 * amplia con los dedos: a `pixelRatio: 1` el texto se ve pastoso en cuanto alguien hace zoom.
 */
const DENSIDAD = 3

/**
 * `image/jpeg` no tiene transparencia: sin fondo explicito, lo transparente se rellena de NEGRO.
 * La tarjeta tiene esquinas redondeadas, asi que esos cuatro triangulitos son justo lo que se
 * veria mal. Se pinta con el mismo `--fondo` de la app.
 */
const FONDO = '#0a0a0b'

/** Calidad del JPEG. 0,92 es el punto donde el texto todavia no muestra artefactos de bloque. */
const CALIDAD = 0.92

export type ResultadoImagen =
  | { ok: true; dataUrl: string; ancho: number; alto: number }
  | { ok: false; motivo: 'sin-tarjeta-en-pantalla' | 'fallo-el-render' }

/**
 * Busca el elemento capturable. Se hace por ID y no recibiendo el nodo por parametro para que la
 * vista NO tenga que exponer una referencia: la vista es una funcion del dato, y quien exporta es
 * otra pieza.
 */
function nodoCapturable(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  return document.getElementById(ID_CAPTURABLE)
}

/**
 * Convierte la tarjeta que hay en pantalla a un `.jpeg` en memoria.
 *
 * No recibe la tarjeta como dato: captura lo que el usuario ESTA VIENDO. Es deliberado, y es lo que
 * hace que la firma de marca (G4) y la foto (G5) salgan en la imagen sin ningun codigo aparte, y
 * que un control que se colara dentro del elemento tambien saliera. De eso ultimo se encarga el
 * assert de `vista-movil.spec.ts`, probado por mutacion.
 */
export async function tarjetaAJpeg(): Promise<ResultadoImagen> {
  const nodo = nodoCapturable()
  if (!nodo) return { ok: false, motivo: 'sin-tarjeta-en-pantalla' }

  const { width, height } = nodo.getBoundingClientRect()

  try {
    const dataUrl = await domToJpeg(nodo, {
      scale: DENSIDAD,
      quality: CALIDAD,
      backgroundColor: FONDO,
      // Las fuentes se embeben en la imagen. Es el gotcha numero uno de esta ola: sin ellas el
      // texto sale en blanco y no se lanza nada.
      font: {},
      // El QR ya es un `data:` URL y la foto tambien, asi que no hay ninguna carga de red que
      // esperar. Se deja el margen igual, por si un navegador reporta la imagen como no decodificada.
      timeout: 15_000,
    })

    return { ok: true, dataUrl, ancho: Math.round(width * DENSIDAD), alto: Math.round(height * DENSIDAD) }
  } catch {
    return { ok: false, motivo: 'fallo-el-render' }
  }
}

/** Nombre del archivo que ve el usuario. Sin acentos ni espacios: viaja entre sistemas. */
export function nombreDeImagen(nombre: string, apellido?: string): string {
  const base = [nombre, apellido]
    .filter(Boolean)
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return `${base || 'tarjeta'}.jpeg`
}

/** Un `data:` URL de JPEG a `Blob`, sin pasar por la red. */
export function dataUrlABlob(dataUrl: string): Blob {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const binario = atob(base64)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return new Blob([bytes], { type: 'image/jpeg' })
}
