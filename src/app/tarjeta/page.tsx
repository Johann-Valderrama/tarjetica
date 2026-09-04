import type { Metadata } from 'next'
import { PantallaTarjeta } from '@/features/tarjeta/vista/pantalla'
import { metadataNoindex } from '@/shared/seguridad/headers'

/**
 * Punto de entrada del framework: un cascaron delgado. La logica vive en `src/features/tarjeta/`.
 */
export const metadata: Metadata = {
  title: 'Tu tarjeta · Tarjetica',
  ...metadataNoindex,
}

export default function PaginaTarjeta() {
  return <PantallaTarjeta />
}
