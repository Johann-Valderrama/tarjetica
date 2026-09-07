import { cookies, headers } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { COOKIE_IDIOMA, esIdioma, negociarIdioma, type Idioma } from '@/i18n/locales'

/**
 * Resuelve el idioma de la peticion y carga sus mensajes (unidad 7a).
 *
 * Leer cookie y cabecera aqui es seguro para la app: las dos las manda el navegador en cada
 * peticion de todos modos, y ninguna lleva un dato de la tarjeta. La app ya es `force-dynamic`
 * (unidad 1e), asi que esto no le quita ningun prerender que hoy exista.
 */
export async function idiomaDeLaPeticion(): Promise<Idioma> {
  const elegido = (await cookies()).get(COOKIE_IDIOMA)?.value
  if (esIdioma(elegido)) return elegido
  return negociarIdioma((await headers()).get('accept-language'))
}

export default getRequestConfig(async () => {
  const locale = await idiomaDeLaPeticion()
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
