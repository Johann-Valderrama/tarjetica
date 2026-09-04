import type { Metadata } from 'next'
import { Editor } from '@/features/tarjeta/formulario/editor'
import { metadataNoindex } from '@/shared/seguridad/headers'

/**
 * Punto de entrada del framework: un cascaron delgado que re-exporta la feature. La logica vive en
 * `src/features/tarjeta/`, para que "ver el modulo completo" sea leer su carpeta.
 *
 * `metadataNoindex` va ademas del `X-Robots-Tag` que ya pone `src/proxy.ts` en esta ruta: son dos
 * capas del mismo candado, y la del proxy corre aunque alguien borre esta linea.
 */
export const metadata: Metadata = {
  title: 'Editor · Tarjetica',
  ...metadataNoindex,
}

export default function PaginaEditor() {
  return <Editor />
}
