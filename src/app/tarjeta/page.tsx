import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PantallaTarjeta } from '@/features/tarjeta/vista/pantalla'
import { metadataNoindex } from '@/shared/seguridad/headers'

/**
 * Punto de entrada del framework: un cascaron delgado. La logica vive en `src/features/tarjeta/`.
 */
export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('meta'))('tarjeta'), ...metadataNoindex }
}

export default function PaginaTarjeta() {
  return <PantallaTarjeta />
}
