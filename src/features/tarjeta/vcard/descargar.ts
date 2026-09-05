import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { nombreDeArchivo, vcardParaArchivo } from '@/features/tarjeta/vcard/generar'

/**
 * Unidad 4b del PRP-TD-001: la descarga del `.vcf`, EN EL CLIENTE.
 *
 * Es el port de `Personal landing page\src\app\api\vcard\route.ts` a cliente, y el port no es un
 * detalle de implementacion: ese endpoint arma el vCard en el SERVIDOR, o sea que los datos de la
 * tarjeta viajan hasta alla. Aqui el archivo se arma con `Blob` y se entrega desde el propio
 * navegador, asi que **la pestana de red no registra ni una sola peticion** cuando el usuario lo
 * descarga. Eso es D1 en su forma verificable.
 *
 * A diferencia del QR, este archivo SI lleva la foto: un `.vcf` no se escanea con una camara, asi
 * que la foto no cuesta escaneabilidad y hace que al guardar el contacto nadie diga "¿este quien
 * es?".
 */

export type ResultadoDescarga = { ok: true; nombre: string } | { ok: false; motivo: 'sin-navegador' }

/**
 * `text/vcard` con `charset=utf-8` explicito: sin el, un cliente de contactos que asuma Latin-1 lee
 * "Peña" como "PeÃ±a", y el contacto queda guardado asi para siempre en la agenda de la otra
 * persona. Es un fallo mudo: la descarga funciona, el archivo importa, y solo el nombre sale roto.
 */
const TIPO_MIME = 'text/vcard;charset=utf-8'

export function descargarVCard(tarjeta: Tarjeta, fotoDataUrl?: string): ResultadoDescarga {
  if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return { ok: false, motivo: 'sin-navegador' }
  }

  const nombre = nombreDeArchivo(tarjeta)
  const blob = new Blob([vcardParaArchivo(tarjeta, fotoDataUrl)], { type: TIPO_MIME })
  const url = URL.createObjectURL(blob)

  const ancla = document.createElement('a')
  ancla.href = url
  ancla.download = nombre
  // Fuera del documento visible: el ancla es un mecanismo, no un control que el usuario ve, y un
  // nodo suelto en el `<body>` alcanzaria a entrar en la captura de imagen de la Ola 5.
  ancla.style.display = 'none'
  document.body.appendChild(ancla)
  ancla.click()
  ancla.remove()

  // Liberar el object URL en el mismo turno cancela la descarga en algunos navegadores; se suelta
  // en el siguiente ciclo, cuando el navegador ya tomo los bytes.
  setTimeout(() => URL.revokeObjectURL(url), 0)

  return { ok: true, nombre }
}
