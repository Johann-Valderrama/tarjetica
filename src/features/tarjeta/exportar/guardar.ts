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

/**
 * Las tres vias. **El orden entre las dos primeras depende del DISPOSITIVO, no es fijo.**
 *
 * Hasta el 2026-09-08 `compartir` iba primero siempre, y el comentario de aqui abajo afirmaba que
 * la descarga "sirve en Android y en escritorio". Era falso en la mitad que importa: en escritorio
 * **nunca se llegaba** a la descarga, porque Chrome de Windows responde que SI puede compartir
 * archivos y ganaba la hoja del sistema. Johann lo reporto usando la app en su computador: le salia
 * la hoja de Windows con una lista de apps, sin poder elegir carpeta, donde esperaba la descarga de
 * toda la vida. La suposicion estaba escrita en el codigo y nadie la habia medido.
 */
export type Via =
  /** Hoja del sistema. La unica que guarda en Fotos en iOS. */
  | 'compartir'
  /** Descarga clasica. Es la que espera quien esta en un computador con mouse. */
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
  esTactil: boolean,
): Via {
  const puedeCompartir = Boolean(navegador?.share && navegador.canShare?.({ files: [archivo] }))

  /*
    En TACTIL la hoja del sistema va primero, y esa sigue siendo la razon original de esta unidad:
    en iOS Safari `<a download>` NO guarda en Fotos, asi que sin la hoja el boton principal del
    producto no hace nada util justo en los telefonos de una conferencia.

    Con MOUSE va primero la descarga. No es una preferencia estetica: en un computador la hoja del
    sistema no deja elegir carpeta y ofrece una lista de apps que no viene al caso, mientras que la
    descarga clasica es exactamente lo que la persona espera y le da su carpeta.
  */
  if (esTactil && puedeCompartir) return 'compartir'
  if (soportaDescarga) return 'descarga'
  // Un tactil sin descarga (iOS viejo) o un escritorio raro: la hoja sigue siendo mejor que nada.
  if (puedeCompartir) return 'compartir'
  return 'pulsacion-larga'
}

/** ¿El navegador soporta el atributo `download` de un ancla? */
export function soportaDescargaDeAncla(documento: Document | undefined = globalThis.document): boolean {
  if (!documento) return false
  return 'download' in documento.createElement('a')
}

/**
 * ¿La persona esta tocando la pantalla con el dedo, o apuntando con un mouse?
 *
 * Se pregunta por el PUNTERO y no por el sistema operativo ni por el user agent: lo que decide cual
 * via sirve es como interactua la persona, y un user agent hay que mantenerlo a mano cada vez que
 * sale un dispositivo nuevo. `(pointer: coarse)` reporta el puntero PRIMARIO, asi que un portatil
 * con pantalla tactil y mouse cuenta como mouse, que es lo correcto.
 *
 * Sin `matchMedia` (entorno de prueba, navegador viejo) devuelve `false`, o sea escritorio: es el
 * lado seguro, porque una descarga que no era la ideal se ve y se puede repetir, mientras que una
 * hoja del sistema que no aparece deja al usuario sin saber que paso.
 */
export function esPantallaTactil(ventana: Window | undefined = globalThis.window): boolean {
  if (!ventana?.matchMedia) return false
  return ventana.matchMedia('(pointer: coarse)').matches
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

  const via = elegirVia(navegador, archivo, soportaDescargaDeAncla(), esPantallaTactil())

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
