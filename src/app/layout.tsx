import type { Metadata, Viewport } from 'next'
import './globals.css'

/**
 * Renderizado dinamico en TODA la app, a proposito (unidad 1e).
 *
 * MEDIDO el 2026-09-04, no supuesto: con las paginas prerenderizadas como estaticas, Next no puede
 * inyectarle el nonce por peticion a sus scripts, la CSP los bloquea TODOS y la app **no hidrata**.
 * Los 22 asserts de cabecera pasaban igual: el fallo solo se ve abriendo la pagina en un navegador.
 * El precio es que no hay prerender estatico ni export estatico; esta app no lo necesita, porque no
 * tiene datos de servidor que cachear (D1).
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tarjetica',
  description: 'Tu tarjeta de presentación digital. No guardamos tus datos en ningún servidor.',
}

// Mobile-first: la app se usa de pie, en una conferencia, en el telefono del usuario.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
