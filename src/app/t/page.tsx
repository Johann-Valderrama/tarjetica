import type { Metadata } from 'next'
import { PantallaEnlace } from '@/features/tarjeta/enlace/pantalla-enlace'
import { metadataNoindex } from '@/shared/seguridad/headers'

/**
 * Punto de entrada del framework para un link compartido: un cascaron delgado. La logica vive en
 * `src/features/tarjeta/enlace/`.
 *
 * `noindex` porque esta ruta muestra datos de una persona. Los buscadores ignoran el fragmento de
 * la URL, asi que solo indexarian la ruta pelada; se cierra igual de forma explicita, junto con el
 * header `X-Robots-Tag` que ya emite el proxy para `/t`.
 */
export const metadata: Metadata = {
  title: 'Tarjeta · Tarjetica',
  ...metadataNoindex,
}

export default function PaginaEnlace() {
  return <PantallaEnlace />
}
