import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'
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

/**
 * La fuente de la direccion estetica (unidad 3a), AUTO-HOSPEDADA.
 *
 * Es UNA sola familia: la referencia que Johann señalo usa una sans pesada para el nombre y el
 * titular, no un serif. Lo que cambia entre display y texto es el PESO, no la familia.
 *
 * `next/font/google` las descarga en el BUILD y las sirve desde el mismo origen. No es una
 * preferencia de rendimiento: la CSP arranca en `default-src 'self'`, asi que un <link> a
 * fonts.googleapis.com quedaria bloqueado y el texto saldria con la fuente de respaldo **sin ningun
 * error visible**. Ademas, el criterio de exito exige cero recursos de dominios ajenos.
 */
const texto = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--fuente-texto',
})

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('app')
  return { title: t('nombre'), description: t('descripcion') }
}

// Mobile-first: la app se usa de pie, en una conferencia, en el telefono del usuario.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0b',
}

/**
 * `lang` sale del idioma resuelto (unidad 7a) y no de una constante: un `lang="es"` fijo en una
 * pagina en ingles hace que el lector de pantalla la lea con fonetica española, y es el atributo
 * del que dependen ademas la division silabica y el traductor del navegador.
 *
 * Los mensajes se pasan COMPLETOS al proveedor de cliente a proposito: casi toda la interfaz de
 * este producto son componentes de cliente (el editor, la vista y el enlace corren en el
 * navegador por D1), asi que filtrarlos por arbol no ahorraria nada real y sí abriria la via de
 * que una clave exista en el servidor y falte en el cliente.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale} className={texto.variable}>
      <body className="font-sans">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
