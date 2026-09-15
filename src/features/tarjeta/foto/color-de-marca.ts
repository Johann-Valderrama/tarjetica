import { contrasteEntre, hexARgb, luminanciaRelativa, rgbAHex, type Rgb } from '@/shared/color/wcag'

/**
 * Unidad 3 (ola 1): el color de marca que se SUGIERE desde el logo, y el ajuste que lo hace legible.
 *
 * Tres piezas separadas a proposito, cada una probable por si sola:
 * - `colorDominante` (PURA): que color predomina en el logo, sin tocar el DOM.
 * - `ajustarContraste` (PURA): que tan lejos hay que mover ese color para que se lea sobre el fondo.
 * - `colorDominanteDeLogo` (IMPURA): el unico punto que toca `createImageBitmap`/canvas.
 *
 * La separacion es la misma razon que ya usa `foto/logo.ts`: lo puro se prueba con arreglos escritos
 * a mano en `vitest`, sin levantar un canvas; lo impuro se prueba en el E2E de verdad.
 */

/**
 * Los `--fondo` de cada tema, copiados de `src/app/globals.css` (unidad 3a/U4). Este modulo no
 * puede leer el CSS en runtime del navegador como hace el test de contraste (ese lee el ARCHIVO
 * .css desde Node); aqui el fondo hace falta en el CLIENTE, mientras la persona edita, asi que se
 * fija como constante. Si `globals.css` cambia estos dos valores, esta constante hay que
 * actualizarla a mano; el guard de esa deriva vive en `contraste.test.ts`, que mide los valores
 * reales de la paleta.
 */
export const FONDO_POR_TEMA = {
  oscuro: '#0a0a0b',
  claro: '#f7f1e4',
} as const satisfies Record<'oscuro' | 'claro', string>

const ALFA_MINIMO = 128
/** Casi blanco o casi negro: fondo o borde del logo, no el color que lo identifica. */
const LUMINANCIA_MAXIMA = 0.92
const LUMINANCIA_MINIMA = 0.04
/** 8 niveles por canal = 512 cubetas. Agrupa tonos parecidos sin perder la identidad del color. */
const NIVELES_POR_CANAL = 8
const ANCHO_CUBETA = 256 / NIVELES_POR_CANAL

function indiceDeCubeta(canal: number): number {
  return Math.min(NIVELES_POR_CANAL - 1, Math.floor(canal / ANCHO_CUBETA))
}

/**
 * El color mas FRECUENTE del logo, no el primer pixel ni un promedio ciego de todos.
 *
 * Un promedio simple de todo el logo da un gris lodoso en cuanto hay dos colores saturados
 * distintos; lo que la persona reconoce como "el color de mi marca" es el que mas AREA ocupa. Por
 * eso se cuantiza a cubetas (para que "azul cielo" y "azul cielo con un pixel distinto de
 * antialiasing" cuenten juntos) y se elige la cubeta mas poblada, promediando los pixeles REALES que
 * cayeron en ella (no el centro matematico de la cubeta, que perderia el matiz exacto).
 *
 * Descarta:
 * - pixeles casi transparentes (alfa < 128): no son color, son el fondo del PNG.
 * - pixeles casi blancos o casi negros: casi siempre el fondo o el trazo del logo, no la marca.
 *
 * `null` si no queda ningun pixel valido (logo todo transparente, o todo blanco/negro).
 */
export function colorDominante(pixeles: Uint8ClampedArray): Rgb | null {
  const cubetas = new Map<number, { n: number; r: number; g: number; b: number }>()

  for (let i = 0; i + 3 < pixeles.length; i += 4) {
    const r = pixeles[i]
    const g = pixeles[i + 1]
    const b = pixeles[i + 2]
    const a = pixeles[i + 3]
    if (a < ALFA_MINIMO) continue
    const l = luminanciaRelativa({ r, g, b })
    if (l > LUMINANCIA_MAXIMA || l < LUMINANCIA_MINIMA) continue

    const clave =
      indiceDeCubeta(r) * NIVELES_POR_CANAL * NIVELES_POR_CANAL + indiceDeCubeta(g) * NIVELES_POR_CANAL + indiceDeCubeta(b)
    const acumulado = cubetas.get(clave) ?? { n: 0, r: 0, g: 0, b: 0 }
    acumulado.n += 1
    acumulado.r += r
    acumulado.g += g
    acumulado.b += b
    cubetas.set(clave, acumulado)
  }

  let mejor: { n: number; r: number; g: number; b: number } | null = null
  for (const cubeta of cubetas.values()) {
    if (!mejor || cubeta.n > mejor.n) mejor = cubeta
  }
  if (!mejor) return null
  return { r: Math.round(mejor.r / mejor.n), g: Math.round(mejor.g / mejor.n), b: Math.round(mejor.b / mejor.n) }
}

/** HSL de 0 a 1 en los tres ejes, para mover SOLO la luminosidad sin tocar el tono ni la saturacion. */
type Hsl = { h: number; s: number; l: number }

function rgbAHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0)
  else if (max === gn) h = (bn - rn) / d + 2
  else h = (rn - gn) / d + 4
  return { h: h / 6, s, l }
}

function hslARgb({ h, s, l }: Hsl): Rgb {
  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }
  const hue2rgb = (p: number, q: number, tInicial: number) => {
    let t = tInicial
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  }
}

const TOPE_ITERACIONES = 100
/** 100 pasos de 1% cubren el rango completo de luminosidad (0 a 1) sin pasarse del tope. */
const PASO_LUMINOSIDAD = 1 / TOPE_ITERACIONES

/**
 * Mueve la luminosidad del color (en HSL, sin tocar el tono ni la saturacion) hacia el lado que lo
 * ALEJA del fondo, hasta que el contraste alcance el objetivo o se agote el tope de iteraciones.
 *
 * El lado se decide UNA vez, al principio: si el color ya es mas claro que el fondo, se aclara mas;
 * si es mas oscuro, se oscurece mas. Cruzar al lado contrario acercaria las dos luminancias en vez
 * de separarlas, que es lo opuesto de lo que pide el contraste.
 *
 * Si el color YA cumple el objetivo, se devuelve tal cual: no hay razon para tocar un color que el
 * logo ya trae legible.
 */
export function ajustarContraste(color: Rgb, fondo: Rgb, objetivo = 4.5): Rgb {
  if (contrasteEntre(color, fondo) >= objetivo) return color

  const hsl = rgbAHsl(color)
  const aclarar = luminanciaRelativa(color) >= luminanciaRelativa(fondo)
  let l = hsl.l
  let mejorColor = color

  for (let i = 0; i < TOPE_ITERACIONES; i++) {
    l = aclarar ? Math.min(1, l + PASO_LUMINOSIDAD) : Math.max(0, l - PASO_LUMINOSIDAD)
    const candidato = hslARgb({ ...hsl, l })
    mejorColor = candidato
    if (contrasteEntre(candidato, fondo) >= objetivo) return candidato
    if (l === 0 || l === 1) break
  }
  // Se agoto el tope o se llego al extremo (negro o blanco) sin alcanzar el objetivo: se devuelve
  // el mejor intento en vez de fallar, porque un color de marca aproximado sigue siendo mejor que
  // ninguno, y quien lo revise en pantalla puede afinarlo a mano.
  return mejorColor
}

/**
 * El color de marca sugerido para un tema: el dominante del logo, ajustado para leerse sobre el
 * `--fondo` de ese tema. `null` si el logo no aporto ningun pixel valido.
 */
export function sugerirColorDeMarca(pixeles: Uint8ClampedArray, tema: 'claro' | 'oscuro'): string | null {
  const dominante = colorDominante(pixeles)
  if (!dominante) return null
  const fondo = hexARgb(FONDO_POR_TEMA[tema])
  // `FONDO_POR_TEMA` es un literal de este archivo: si algun dia no fuera un hex valido, es un
  // error de programacion, no una entrada del usuario que haya que tolerar en silencio.
  if (!fondo) throw new Error(`FONDO_POR_TEMA.${tema} no es un hex valido`)
  return rgbAHex(ajustarContraste(dominante, fondo))
}

/**
 * Lee los pixeles del logo ya guardado (su `dataUrl` PNG) para calcular el color dominante.
 *
 * IMPURA: el unico punto de este archivo que toca `createImageBitmap` y un canvas, mismo patron que
 * `foto/logo.ts`. Nunca lanza: cualquier fallo (dataUrl invalido, decodificacion, canvas sin
 * contexto) se traduce a `null`, porque esto alimenta una SUGERENCIA, no un paso obligatorio del
 * flujo de exportar.
 */
/** `data:image/png;base64,...` a `Blob`, sin pasar por la red. Devuelve null si no tiene esa forma. */
export function blobDeDataUrl(dataUrl: string): Blob | null {
  const m = dataUrl.match(/^data:(image\/[a-z+.-]+);base64,([A-Za-z0-9+\/=]+)$/i)
  if (!m) return null
  const binario = atob(m[2])
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return new Blob([bytes], { type: m[1] })
}

export async function colorDominanteDeLogo(dataUrl: string): Promise<Uint8ClampedArray | null> {
  let bitmap: ImageBitmap | undefined
  try {
    // Sin `fetch`: la CSP arranca en `connect-src 'self'` y un `fetch` de un `data:` URL queda
    // bloqueado en produccion (medido: la sugerencia nunca llegaba y el e2e la esperaba en vano).
    // El logo ya es base64 en memoria, asi que se decodifica a mano y no hay peticion de ninguna clase.
    const blob = blobDeDataUrl(dataUrl)
    if (!blob) return null
    bitmap = await createImageBitmap(blob)
    // Se reduce a un lienzo pequeño: el color dominante no necesita resolucion completa, y un logo
    // ya viene reducido a 320 px por `prepararLogo`, asi que 64 px es de sobra para contar cubetas.
    const lado = 64
    const escala = Math.min(1, lado / bitmap.width, lado / bitmap.height)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * escala))
    canvas.height = Math.max(1, Math.round(bitmap.height * escala))
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    return ctx.getImageData(0, 0, canvas.width, canvas.height).data
  } catch {
    return null
  } finally {
    bitmap?.close()
  }
}
