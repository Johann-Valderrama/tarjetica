import type { NextConfig } from 'next'
import { CABECERAS_ESTATICAS } from './src/shared/seguridad/headers'

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

export default nextConfig
