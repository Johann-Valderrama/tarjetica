'use client'

import { useState } from 'react'
import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { construirEnlace } from '@/features/tarjeta/enlace/codec'

/**
 * Unidad 6b del PRP-TD-001: generar el link compartible.
 *
 * **Nace APAGADO y no se puede encender por descuido.** Su efecto va hacia AFUERA: produce una URL
 * con datos personales que el usuario va a repartir y que **no se puede revocar**, porque no hay
 * servidor donde borrar nada. La regla del sistema para eso es clara: la opcion se OFRECE visible
 * (si no se ve, no existe), pero el default se queda apagado y la advertencia va ANTES de generar,
 * no despues. Un aviso que aparece cuando el link ya existe no es una advertencia, es una nota.
 *
 * Las TRES cosas que la advertencia tiene que decir, y las tres estan por una razon medida:
 *
 * 1. **Es publico para quien lo tenga.** Un link no se autentica.
 * 2. **No se puede desactivar despues.** Con servidor se borra la tarjeta y el link muere; aqui los
 *    datos van DENTRO del link, asi que lo repartido queda vivo para siempre. Y editar la tarjeta
 *    genera un link NUEVO: el viejo se queda congelado en la version vieja.
 * 3. **Queda en el HISTORIAL del navegador de quien lo abra, y se sincroniza** si esa persona tiene
 *    Chrome Sync o iCloud activo, que es el default de un telefono personal. Esto NO tiene arreglo
 *    tecnico desde la pagina: el historial vive en el navegador, fuera de su alcance. Por eso se
 *    dice en vez de mitigarse.
 */

type Estado = { fase: 'apagado' } | { fase: 'advertido' } | { fase: 'generando' } | { fase: 'listo'; enlace: string }

export function GenerarEnlace({ tarjeta, habilitado }: { tarjeta: Tarjeta | null; habilitado: boolean }) {
  const [estado, setEstado] = useState<Estado>({ fase: 'apagado' })
  const [copiado, setCopiado] = useState(false)

  const generar = async () => {
    if (!tarjeta) return
    setEstado({ fase: 'generando' })
    // `location.origin` y no un dominio hardcodeado: hoy no hay dominio (la Ola 7 sigue pendiente),
    // y hornear uno aqui pondria en la tarjeta de cada usuario un enlace que no lleva a ninguna parte.
    setEstado({ fase: 'listo', enlace: await construirEnlace(tarjeta, window.location.origin) })
  }

  const copiar = async (enlace: string) => {
    try {
      await navigator.clipboard.writeText(enlace)
      setCopiado(true)
    } catch {
      // Sin permiso de portapapeles el texto sigue visible y seleccionable: no se pierde nada.
      setCopiado(false)
    }
  }

  return (
    <section className="space-y-3 rounded-lg border border-neutral-300 p-3">
      <h3 className="text-sm font-semibold text-neutral-900">Enlace para compartir (opcional)</h3>
      <p className="text-sm text-neutral-600">
        Si prefieres, puedes mandar tu tarjeta como un enlace. No hace falta: el código QR y la imagen
        ya funcionan sin esto.
      </p>

      {estado.fase === 'apagado' && (
        <button
          type="button"
          data-testid="abrir-enlace"
          disabled={!habilitado}
          onClick={() => setEstado({ fase: 'advertido' })}
          className="min-h-11 w-full rounded-lg border border-neutral-400 px-4 text-sm font-medium text-neutral-800 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
        >
          Quiero un enlace
        </button>
      )}

      {(estado.fase === 'advertido' || estado.fase === 'generando') && (
        <div
          role="alert"
          data-testid="advertencia-enlace"
          className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <p className="font-semibold">Antes de crearlo, lee esto:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Tus datos van dentro del enlace. Cualquiera que lo tenga los ve, sin contraseña.</li>
            <li>
              <strong>No se puede desactivar después.</strong> No hay servidor donde borrarlo: lo que
              repartas queda vivo para siempre. Si editas tu tarjeta, se crea un enlace nuevo y el
              anterior sigue mostrando la versión vieja.
            </li>
            <li>
              El enlace queda en el <strong>historial del navegador</strong> de quien lo abra, y si esa
              persona tiene la sincronización activada, se copia a sus otros dispositivos. Eso no lo
              podemos evitar desde aquí.
            </li>
          </ul>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              data-testid="cancelar-enlace"
              onClick={() => setEstado({ fase: 'apagado' })}
              className="min-h-11 flex-1 rounded-lg border border-amber-400 px-4 text-sm font-medium"
            >
              Mejor no
            </button>
            <button
              type="button"
              data-testid="confirmar-enlace"
              disabled={estado.fase === 'generando'}
              onClick={() => void generar()}
              className="min-h-11 flex-1 rounded-lg bg-amber-900 px-4 text-sm font-semibold text-amber-50 disabled:bg-amber-300"
            >
              {estado.fase === 'generando' ? 'Creando…' : 'Entiendo, créalo'}
            </button>
          </div>
        </div>
      )}

      {estado.fase === 'listo' && (
        <div className="space-y-2">
          <p
            data-testid="enlace-generado"
            className="break-all rounded-lg border border-neutral-300 bg-neutral-50 p-2 font-mono text-xs text-neutral-700"
          >
            {estado.enlace}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              data-testid="copiar-enlace"
              onClick={() => void copiar(estado.enlace)}
              className="min-h-11 flex-1 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white"
            >
              {copiado ? 'Copiado' : 'Copiar enlace'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEstado({ fase: 'apagado' })
                setCopiado(false)
              }}
              className="min-h-11 rounded-lg border border-neutral-300 px-4 text-sm text-neutral-700"
            >
              Ocultar
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
