import { iniciales } from '@/features/tarjeta/foto/cargar'

/**
 * Unidad 3c del PRP-TD-001: el avatar, con sus dos estados.
 *
 * Si el usuario cargó una foto (G5) se muestra; si no, un monograma con sus iniciales. Nunca un
 * icono generico de persona: un monograma se lee como una decision de diseño y el icono generico
 * se lee como un campo sin llenar.
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
            alt={`Foto de ${[nombre, apellido].filter(Boolean).join(' ') || 'perfil'}`}
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
