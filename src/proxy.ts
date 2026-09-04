import { NextResponse, type NextRequest } from 'next/server'
import { construirCsp, esRutaDeTarjeta, X_ROBOTS_TAG_TARJETA } from '@/shared/seguridad/headers'

/**
 * Unidad 1e: la CSP se emite aqui y no en `next.config.ts` porque lleva un nonce por peticion.
 * Next aplica ese nonce a sus propios scripts leyendo la cabecera `Content-Security-Policy` de la
 * peticion, por eso se escribe en las dos (request y response).
 *
 * El archivo se llama `proxy.ts` y no `middleware.ts`: Next 16 marco esa convencion como obsoleta
 * (aviso literal del build, 2026-09-04).
 */
export default function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = construirCsp(nonce, process.env.NODE_ENV === 'development')

  const cabecerasDePeticion = new Headers(request.headers)
  cabecerasDePeticion.set('x-nonce', nonce)
  cabecerasDePeticion.set('Content-Security-Policy', csp)

  const respuesta = NextResponse.next({ request: { headers: cabecerasDePeticion } })
  respuesta.headers.set('Content-Security-Policy', csp)

  if (esRutaDeTarjeta(request.nextUrl.pathname)) {
    respuesta.headers.set('X-Robots-Tag', X_ROBOTS_TAG_TARJETA)
  }

  return respuesta
}

export const config = {
  matcher: [
    // todo menos los estaticos de Next y el favicon
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
