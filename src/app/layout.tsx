import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tarjetica',
  description: 'Tu tarjeta de presentacion digital. No guardamos tus datos en ningun servidor.',
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
