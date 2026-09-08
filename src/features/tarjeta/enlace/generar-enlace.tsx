'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('enlace')
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
    <section className="space-y-3 rounded-lg border border-borde-fuerte p-3">
      <h3 className="text-sm font-semibold text-tinta">{t('titulo')}</h3>
      <p className="text-sm text-tinta-suave">{t('intro')}</p>

      {estado.fase === 'apagado' && (
        <button
          type="button"
          data-testid="abrir-enlace"
          disabled={!habilitado}
          onClick={() => setEstado({ fase: 'advertido' })}
          className="min-h-11 w-full rounded-lg border border-borde-fuerte px-4 text-sm font-medium text-tinta disabled:cursor-not-allowed disabled:border-borde disabled:text-tinta-tenue"
        >
          {t('quiero')}
        </button>
      )}

      {(estado.fase === 'advertido' || estado.fase === 'generando') && (
        <div
          role="alert"
          data-testid="advertencia-enlace"
          className="space-y-2 rounded-lg border border-aviso-borde bg-aviso-superficie p-3 text-sm text-tinta"
        >
          <p className="font-semibold">{t('antesDeCrearlo')}</p>
          {/*
            Las tres advertencias van con `t.rich` y no con `t`: el enfasis de "no se puede
            desactivar" y de "historial del navegador" es parte del mensaje, no decoracion, y
            meterlo como HTML crudo en el JSON abriria una via de inyeccion sin necesidad.
          */}
          <ul className="list-disc space-y-1 pl-5">
            <li>{t('publico')}</li>
            <li>{t.rich('irrevocable', { fuerte: (c) => <strong>{c}</strong> })}</li>
            <li>{t.rich('historial', { fuerte: (c) => <strong>{c}</strong> })}</li>
            {/*
              La foto. Va AQUI y no solo en la ayuda del campo, que esta arriba del formulario:
              Johann genero un enlace, no vio su foto y lo reporto como un fallo. No lo es (es la
              invariante G5, y la sostiene el tipo), pero enterarse DESPUES de repartir el enlace es
              enterarse tarde. Donde se toma la decision es donde tiene que estar el dato.
            */}
            <li>{t.rich('sinFoto', { fuerte: (c) => <strong>{c}</strong> })}</li>
          </ul>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              data-testid="cancelar-enlace"
              onClick={() => setEstado({ fase: 'apagado' })}
              className="min-h-11 flex-1 rounded-lg border border-aviso-borde px-4 text-sm font-medium"
            >
              {t('mejorNo')}
            </button>
            <button
              type="button"
              data-testid="confirmar-enlace"
              disabled={estado.fase === 'generando'}
              onClick={() => void generar()}
              className="min-h-11 flex-1 rounded-lg bg-acento px-4 text-sm font-semibold text-fondo disabled:bg-superficie-sutil disabled:text-tinta-tenue"
            >
              {estado.fase === 'generando' ? t('creando') : t('entiendo')}
            </button>
          </div>
        </div>
      )}

      {estado.fase === 'listo' && (
        <div className="space-y-2">
          <p
            data-testid="enlace-generado"
            className="break-all rounded-lg border border-borde-fuerte bg-superficie p-2 font-mono text-xs text-tinta"
          >
            {estado.enlace}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              data-testid="copiar-enlace"
              onClick={() => void copiar(estado.enlace)}
              className="min-h-11 flex-1 rounded-lg bg-acento px-4 text-sm font-medium text-fondo"
            >
              {copiado ? t('copiado') : t('copiar')}
            </button>
            <button
              type="button"
              onClick={() => {
                setEstado({ fase: 'apagado' })
                setCopiado(false)
              }}
              className="min-h-11 rounded-lg border border-borde-fuerte px-4 text-sm text-tinta"
            >
              {t('ocultar')}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
