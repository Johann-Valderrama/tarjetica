'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { vcardParaQr } from '@/features/tarjeta/vcard/generar'
import { medirDensidad, type Densidad } from '@/features/tarjeta/qr/densidad'
import { CORRECCION, MARGEN_MODULOS, OPCIONES_QR } from '@/features/tarjeta/qr/opciones'

/**
 * Unidad 4c del PRP-TD-001: el codigo QR, generado EN EL CLIENTE.
 *
 * Es un cambio de arquitectura respecto a la landing de referencia, y lo obliga D1: si el QR lo
 * pintara el servidor, los datos de la tarjeta tendrian que viajar hasta alla. Aqui el HTML que sale
 * del servidor no contiene un solo dato de la tarjeta; el codigo aparece cuando corre el JS.
 *
 * **Los tres parametros son decisiones MEDIDAS, no defaults.** Cambiar cualquiera rompe la
 * escaneabilidad de una pantalla a otra, que es el uso principal del producto:
 *
 * - `errorCorrectionLevel: 'M'` — bajar a `L` da cuadritos 14% mas grandes pero pierde una
 *   tolerancia a borrosidad del mismo orden. La correccion NO es la palanca aqui (medido sobre
 *   12.800 configuraciones: L acerto 1.257 veces, M 1.600, Q 1.839, H 2.001).
 * - `margin: 4` — es la zona silenciosa que exige la norma, y el decodificador la usa para
 *   ENCONTRAR el simbolo. El codigo que se copia de la landing trae `margin: 1`, que es una
 *   desviacion silenciosa: no da error, simplemente puede no leerse.
 * - **UNO solo, a ancho completo** — dos QR en la misma pantalla se reparten el ancho y los dos
 *   caen a 2,39 px por cuadrito, bajo el piso practico de ~2,5. Uno solo da 4,66.
 */


type Estado =
  | { fase: 'generando' }
  | { fase: 'listo'; dataUrl: string; densidad: Densidad }
  | { fase: 'fallo' }

export function QrDeContacto({ tarjeta, onDensidad }: { tarjeta: Tarjeta; onDensidad?: (d: Densidad) => void }) {
  const [estado, setEstado] = useState<Estado>({ fase: 'generando' })
  const texto = vcardParaQr(tarjeta)

  useEffect(() => {
    let vigente = true
    const densidad = medirDensidad(tarjeta)

    QRCode.toDataURL(texto, { ...OPCIONES_QR })
      .then((dataUrl) => {
        if (!vigente) return
        setEstado({ fase: 'listo', dataUrl, densidad })
        onDensidad?.(densidad)
      })
      .catch(() => {
        if (vigente) setEstado({ fase: 'fallo' })
      })

    return () => {
      vigente = false
    }
    // `texto` es el resumen completo de lo que entra al codigo: si no cambio, el QR es el mismo.
    // `onDensidad` se deja fuera a proposito, para no regenerar el PNG porque el padre se re-creo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto])

  if (estado.fase === 'fallo') {
    return (
      <p className="px-4 text-center text-xs text-neutral-600">
        No se pudo generar el código en este navegador. El teléfono de abajo sigue sirviendo.
      </p>
    )
  }

  if (estado.fase === 'generando') {
    // Sin texto durante el instante de generacion: un "Cargando..." aqui parpadea dentro del
    // elemento que la Ola 5 captura como imagen.
    return <div aria-hidden className="h-full w-full" />
  }

  return (
    /*
      El `<img>` va a `w-full h-full`: el cuadrado que lo contiene ya es el ancho disponible menos el
      relleno de la teja blanca, y absorbe la holgura vertical de la vista. Los `data-*` no son
      decoracion: son lo que permite verificar sobre el DOM que el margen renderizado son 4 modulos y
      que el codigo ocupa el ancho, en vez de creerselo leyendo este archivo.

      Es un `data:` URL local, no una imagen remota: `next/image` no aporta nada y agregaria una
      peticion, que es justo lo que el candado de cero dominios ajenos evita.
    */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={estado.dataUrl}
      alt="Código QR con los datos de contacto de esta tarjeta"
      data-testid="qr-contacto"
      data-margen-modulos={MARGEN_MODULOS}
      data-modulos={estado.densidad.modulos}
      data-version={estado.densidad.version}
      data-correccion={CORRECCION}
      className="h-full w-full object-contain"
    />
  )
}
