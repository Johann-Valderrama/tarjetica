import { FotoLocal } from '@/features/tarjeta/modelo/tarjeta'

/**
 * Unidad 2e del PRP-TD-001: cargar la foto de perfil (G5).
 *
 * Por que no se guarda la foto tal cual la da el telefono: `localStorage` tiene unos 5 MB por sitio
 * y base64 infla un 33%, asi que una foto de camara de 4 MB **hace fallar el guardado EN SILENCIO**
 * y el usuario pierde la tarjeta sin ningun mensaje. Se reduce ANTES de guardar, no despues.
 *
 * Y por que se re-codifica en un canvas en vez de recortar bytes: **eso borra el EXIF**, que puede
 * traer las coordenadas GPS de donde se tomo la foto. Un dato de ubicacion que el usuario nunca
 * quiso publicar viajaria dentro de su tarjeta.
 *
 * La foto NUNCA entra al codec del link ni al vCard del QR (lo garantiza el tipo, no esta funcion):
 * solo a la vista, al `.jpeg` exportado y al `.vcf` descargado.
 */

/** Lado del cuadrado final, en pixeles. Heredado de `Personal landing page/src/shared/config/card.ts`. */
export const LADO_PX = 320

/** Presupuesto de bytes del data URL final. Por encima de esto se vuelve a comprimir mas fuerte. */
export const PRESUPUESTO_BYTES = 20_000

/** Objetivo al que se apunta primero; el presupuesto de arriba es el techo duro. */
const OBJETIVO_BYTES = 10_000

const CALIDADES = [0.82, 0.7, 0.6, 0.5, 0.42, 0.35, 0.28] as const

/**
 * Si bajar la calidad no alcanza, se baja tambien el LADO. Medido el 2026-09-04 con ruido puro, que
 * es el peor caso posible para JPEG: a 320 px ni siquiera con calidad 0,28 baja de 34.327 bytes,
 * muy por encima del techo de 20.000. Una foto real (con superficies suaves) cabe de sobra a 320.
 *
 * El techo de bytes es la restriccion dura, porque de el depende que el guardado no falle en
 * silencio; el lado es la palanca. Se prefiere siempre el lado mas grande que quepa.
 */
const LADOS = [LADO_PX, 224, 160, 112] as const

export type ResultadoFoto =
  | { ok: true; foto: FotoLocal; bytes: number; calidad: number }
  | { ok: false; motivo: 'tipo-no-soportado' | 'no-se-pudo-leer' | 'no-se-pudo-comprimir' }

const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic']

/**
 * Convierte el archivo que eligio el usuario en un JPEG cuadrado, chico y sin metadatos.
 *
 * Es asincrona y toca APIs del navegador (`createImageBitmap`, `OffscreenCanvas`/`canvas`), asi que
 * solo corre en cliente. Nunca lanza: devuelve un resultado con motivo.
 */
export async function prepararFoto(archivo: File): Promise<ResultadoFoto> {
  if (archivo.type && !TIPOS.includes(archivo.type)) {
    return { ok: false, motivo: 'tipo-no-soportado' }
  }

  let bitmap: ImageBitmap
  try {
    // `imageOrientation: 'from-image'` aplica la rotacion del EXIF ANTES de descartarlo. Sin esto,
    // una foto vertical de iPhone se guarda acostada: el dato de orientacion se pierde con el resto
    // del EXIF y ya no hay quien la enderece.
    bitmap = await createImageBitmap(archivo, { imageOrientation: 'from-image' })
  } catch {
    return { ok: false, motivo: 'no-se-pudo-leer' }
  }

  try {
    // Recorte cuadrado centrado: se toma el cuadrado mas grande que quepa y se escala al lado final.
    const recorte = Math.min(bitmap.width, bitmap.height)
    const x = (bitmap.width - recorte) / 2
    const y = (bitmap.height - recorte) / 2

    let mejor: { dataUrl: string; bytes: number; calidad: number } | null = null

    for (const lado of LADOS) {
      const lienzo = crearLienzo(lado)
      const ctx = lienzo.getContext('2d')
      if (!ctx) return { ok: false, motivo: 'no-se-pudo-comprimir' }
      ctx.drawImage(bitmap, x, y, recorte, recorte, 0, 0, lado, lado)

      for (const calidad of CALIDADES) {
        const dataUrl = await aDataUrlJpeg(lienzo, calidad)
        const bytes = dataUrl.length
        if (bytes > PRESUPUESTO_BYTES) continue
        // Cabe. Se recuerda por si nada mejor aparece; y si ademas alcanza el objetivo, se corta,
        // porque seguir bajando la calidad empeoraria la imagen sin ganar nada.
        mejor = { dataUrl, bytes, calidad }
        if (bytes <= OBJETIVO_BYTES) break
      }
      if (mejor) break
    }

    if (!mejor) return { ok: false, motivo: 'no-se-pudo-comprimir' }
    const validado = FotoLocal.safeParse({ dataUrl: mejor.dataUrl })
    if (!validado.success) return { ok: false, motivo: 'no-se-pudo-comprimir' }
    return { ok: true, foto: validado.data, bytes: mejor.bytes, calidad: mejor.calidad }
  } finally {
    bitmap.close()
  }
}

type Lienzo = OffscreenCanvas | HTMLCanvasElement

function crearLienzo(lado: number): Lienzo {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(lado, lado)
  const c = document.createElement('canvas')
  c.width = lado
  c.height = lado
  return c
}

async function aDataUrlJpeg(lienzo: Lienzo, calidad: number): Promise<string> {
  if (lienzo instanceof HTMLCanvasElement) return lienzo.toDataURL('image/jpeg', calidad)
  const blob = await lienzo.convertToBlob({ type: 'image/jpeg', quality: calidad })
  return await new Promise<string>((resolver, rechazar) => {
    const lector = new FileReader()
    lector.onload = () => resolver(String(lector.result))
    lector.onerror = () => rechazar(lector.error)
    lector.readAsDataURL(blob)
  })
}

/** Iniciales para el monograma, que es el fallback cuando no hay foto (G5). */
export function iniciales(nombre?: string, apellido?: string): string {
  const a = (nombre ?? '').trim()[0] ?? ''
  const b = (apellido ?? '').trim()[0] ?? ''
  return (a + b).toUpperCase() || '·'
}
