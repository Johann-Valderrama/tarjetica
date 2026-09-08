import { useTranslations } from 'next-intl'
import { iniciales } from '@/features/tarjeta/foto/cargar'

/**
 * Unidad 3c del PRP-TD-001: el avatar.
 *
 * ⚠️ **Ya no tiene dos estados: solo se monta cuando HAY foto** (cambio del 2026-09-08). El
 * monograma de iniciales que salia sin ella se quito de la vista, porque en un enlace compartido
 * (que por G5 nunca lleva foto) se leia como que faltaba algo, y porque sus 68 px se los queda el
 * codigo QR, que en la pantalla mas chica estaba por debajo del piso de lectura. El monograma sigue
 * vivo en el EDITOR, donde ese circulo es el sitio de la foto que vas a poner.
 *
 * El respaldo de iniciales se conserva aqui por si alguien lo vuelve a montar sin foto, pero el
 * llamador no debe hacerlo.
 *
 * El anillo del acento viene de la referencia de Zelandia, donde el retrato lleva un aro naranja.
 */
export function Avatar({
  fotoDataUrl,
  nombre,
  apellido,
  tamano = 88,
}: {
  fotoDataUrl?: string
  nombre?: string
  apellido?: string
  tamano?: number
}) {
  const t = useTranslations('tarjeta')
  const estilo = { width: tamano, height: tamano }

  return (
    <div
      className="shrink-0 rounded-full p-[2px]"
      style={{ ...estilo, background: 'linear-gradient(160deg, var(--acento), transparent 65%)' }}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-superficie-sutil">
        {fotoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fotoDataUrl}
            alt={t('fotoDe', { nombre: [nombre, apellido].filter(Boolean).join(' ') || t('perfil') })}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            data-testid="monograma-vista"
            className="font-display text-tinta"
            style={{ fontSize: Math.round(tamano * 0.36) }}
          >
            {iniciales(nombre, apellido)}
          </span>
        )}
      </div>
    </div>
  )
}
