import type { MetadataRoute } from 'next'
import { RUTAS_TARJETA } from '@/shared/seguridad/headers'

/**
 * Unidad 1e. La home si se indexa (es la distribucion del producto); las rutas que muestran o
 * editan una tarjeta, no. El buscador ignora el fragmento de la URL de todos modos, pero se cierra
 * de forma explicita.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: RUTAS_TARJETA.map((r) => `${r}/`).concat(RUTAS_TARJETA.map((r) => r)),
    },
  }
}
