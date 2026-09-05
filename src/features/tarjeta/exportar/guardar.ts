/**
 * Unidad 5b del PRP-TD-001: llevar el `.jpeg` a las Fotos del telefono.
 *
 * Parece un detalle y es el boton principal del producto fallando justo en los telefonos de
 * conferencia: **en iOS Safari, `<a download>` NO guarda en Fotos.** Descarga el archivo a la
 * bandeja de descargas de Safari, o directamente no hace nada visible, y el usuario se queda
 * creyendo que guardo su tarjeta. La via correcta ahi es `navigator.share({ files })`, que abre la
 * hoja del sistema con "Guardar en Fotos".
 *
 * Y un link que se regala se abre casi siempre DENTRO del navegador embebido de una app
 * (Instagram, LinkedIn, WhatsApp), donde `navigator.share` con archivos se degrada o se bloquea.
 * Por eso hay una tercera via, y por eso el arbitro de esta unidad no es este archivo ni su test:
 * es el gate fisico 5d, en telefonos reales y dentro de esas apps.
 */

/** Las tres vias, de la mejor a la peor. */
export type Via =
  /** Hoja del sistema. La unica que guarda en Fotos en iOS. */
  | 'compartir'
  /** Descarga clasica. Sirve en Android y en escritorio. */
  | 'descarga'
  /** Abrir la imagen para que el usuario la guarde con una pulsacion larga. El ultimo recurso. */
  | 'pulsacion-larga'

/**
 * Lo minimo que esta decision necesita del navegador. Se declara como tipo propio, y no se usa
 * `Navigator`, para que el test pueda pasar un doble sin inventarse las 60 propiedades que no
 * importan.
 */
export type NavegadorParaCompartir = {
  share?: (datos: { files?: File[]; title?: string }) => Promise<void>
  canShare?: (datos: { files?: File[] }) => boolean
}

/**
 * Elige la via. **Funcion pura y exportada a proposito**: es la decision que hay que verificar, y
 * verificarla sobre el efecto (abrir una hoja del sistema de verdad) no se puede en un navegador
 * headless. Aqui se prueban los dos caminos; que el efecto ocurra lo prueba el gate 5d.
 *
 * `canShare` se pregunta CON EL ARCHIVO adentro, no a secas: hay navegadores que tienen
 * `navigator.share` para texto y URL y NO aceptan archivos, y preguntar por la existencia de la
 * funcion los daria por buenos.
 */
export function elegirVia(
  navegador: NavegadorParaCompartir | undefined,
  archivo: File,
  soportaDescarga: boolean,
): Via {
  if (navegador?.share && navegador.canShare?.({ files: [archivo] })) return 'compartir'
  if (soportaDescarga) return 'descarga'
  return 'pulsacion-larga'
}

/** ¿El navegador soporta el atributo `download` de un ancla? */
export function soportaDescargaDeAncla(documento: Document | undefined = globalThis.document): boolean {
  if (!documento) return false
  return 'download' in documento.createElement('a')
}

export type ResultadoGuardado =
  | { ok: true; via: Via }
  /** El usuario cerro la hoja del sistema. No es un error: no hay que mostrarle nada. */
  | { ok: false; motivo: 'cancelado' }
  | { ok: false; motivo: 'sin-navegador' | 'fallo' }

/**
 * Guarda la imagen por la mejor via disponible.
 *
 * Si la hoja del sistema falla por algo que NO es una cancelacion del usuario, cae a la descarga en
 * vez de darse por vencida: el WebView de una app social puede exponer `canShare` y despues negarse.
 */
export async function guardarImagen(
  archivo: File,
  navegador: NavegadorParaCompartir | undefined = globalThis.navigator,
): Promise<ResultadoGuardado> {
  if (typeof document === 'undefined') return { ok: false, motivo: 'sin-navegador' }

  const via = elegirVia(navegador, archivo, soportaDescargaDeAncla())

  if (via === 'compartir') {
    try {
      await navegador!.share!({ files: [archivo], title: archivo.name })
      return { ok: true, via: 'compartir' }
    } catch (error) {
      // `AbortError` es el usuario cerrando la hoja: se respeta, no se le abre otra cosa encima.
      if (error instanceof Error && error.name === 'AbortError') return { ok: false, motivo: 'cancelado' }
      // Cualquier otro fallo: se sigue por la via de abajo.
    }
  }

  const url = URL.createObjectURL(archivo)
  try {
    if (soportaDescargaDeAncla()) {
      const ancla = document.createElement('a')
      ancla.href = url
      ancla.download = archivo.name
      ancla.style.display = 'none'
      document.body.appendChild(ancla)
      ancla.click()
      ancla.remove()
      return { ok: true, via: 'descarga' }
    }

    const abierta = window.open(url, '_blank')
    if (!abierta) return { ok: false, motivo: 'fallo' }
    return { ok: true, via: 'pulsacion-larga' }
  } catch {
    return { ok: false, motivo: 'fallo' }
  } finally {
    // Soltarlo en el mismo turno cancela la descarga en algunos navegadores; y si se abrio en otra
    // pestaña, hay que darle tiempo a cargar antes de invalidar la URL.
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }
}
