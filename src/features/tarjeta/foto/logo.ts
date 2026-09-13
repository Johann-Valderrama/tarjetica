import { LogoLocal } from '../modelo/tarjeta'

/** Reduce sin recortar ni deformar; PNG conserva transparencia y elimina metadatos. */
export async function prepararLogo(archivo: File): Promise<LogoLocal | null> {
  if (archivo.size > 10_000_000 || !['image/png', 'image/jpeg', 'image/webp'].includes(archivo.type)) return null
  let bitmap: ImageBitmap | undefined
  try {
    bitmap = await createImageBitmap(archivo, { imageOrientation: 'from-image' })
    for (const lado of [320, 224, 160, 112]) {
      const escala = Math.min(1, lado / bitmap.width, lado / bitmap.height)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(bitmap.width * escala))
      canvas.height = Math.max(1, Math.round(bitmap.height * escala))
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const resultado = LogoLocal.safeParse({ dataUrl: canvas.toDataURL('image/png') })
      if (resultado.success) return resultado.data
    }
    return null
  } catch {
    return null
  } finally {
    bitmap?.close()
  }
}
