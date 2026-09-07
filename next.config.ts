import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { CABECERAS_ESTATICAS } from './src/shared/seguridad/headers'

// Unidad 7a. Los mensajes se resuelven en `src/i18n/request.ts`, SIN prefijo de idioma en la URL:
// las cuatro rutas del producto (`/`, `/editor`, `/tarjeta`, `/t`) son contrato ya escrito, y los
// enlaces de la Ola 6 ya repartidos no se pueden corregir. El porque completo, en `src/i18n/locales.ts`.
const conIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Fija la raiz de Turbopack a ESTE proyecto. Sin esto, Next infiere mal el root por los
  // lockfiles de la carpeta padre. Gotcha heredado de `Personal landing page`.
  turbopack: { root: process.cwd() },

  async headers() {
    // La CSP y el X-Robots-Tag de la ruta de tarjeta NO van aqui: viven en `src/proxy.ts`
    // porque llevan un nonce por peticion / dependen de la ruta.
    return [{ source: '/:path*', headers: [...CABECERAS_ESTATICAS] }]
  },
}

export default conIntl(nextConfig)
