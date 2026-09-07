/**
 * Unidad 7a del PRP-TD-001: los dos idiomas del producto.
 *
 * **Sin prefijo de idioma en la URL, a proposito.** `next-intl` ofrece dos montajes: con
 * enrutamiento (`/es-CO/editor`) y sin el. Aqui se usa el SEGUNDO, y no es una preferencia de
 * estilo:
 *
 * - Las rutas de este producto son parte del contrato ya escrito. La unidad 7e mide las CUATRO
 *   pantallas nombrandolas `/`, `/editor`, `/tarjeta` y `/t`; `src/shared/seguridad/headers.ts`
 *   decide el `X-Robots-Tag` comparando contra esas mismas rutas, y `src/app/robots.ts` las
 *   escribe en el `robots.txt`. Un prefijo las movería todas.
 * - El enlace compartible de la Ola 6 se reparte como `origen + /t#payload`. Con prefijo, cada
 *   enlace ya repartido quedaria atado al idioma de quien lo genero, y **un enlace repartido no se
 *   puede corregir** (no hay servidor donde arreglarlo).
 *
 * El idioma se resuelve, en este orden: la cookie que el propio usuario eligio, el
 * `Accept-Language` que manda su navegador, y de ultimas `es-CO`. La negociacion por cabecera es
 * la que atiende el caso real de `/t`: esa pantalla la abre un DESCONOCIDO que nunca eligio nada, y
 * que puede no hablar español.
 */

export const IDIOMAS = ['es-CO', 'en'] as const

export type Idioma = (typeof IDIOMAS)[number]

export const IDIOMA_POR_DEFECTO: Idioma = 'es-CO'

/** Nombre de cada idioma EN SI MISMO: un menu de idiomas traducido no lo entiende quien lo necesita. */
export const NOMBRE_DEL_IDIOMA: Record<Idioma, string> = {
  'es-CO': 'Español',
  en: 'English',
}

/**
 * La cookie del idioma. Es el unico dato que este producto le manda al servidor por su cuenta, y
 * es una preferencia de interfaz: no lleva nada de la tarjeta. Sin `Secure` porque tiene que
 * funcionar en `localhost` durante el desarrollo y las pruebas.
 */
export const COOKIE_IDIOMA = 'IDIOMA'

export function esIdioma(valor: unknown): valor is Idioma {
  return typeof valor === 'string' && (IDIOMAS as readonly string[]).includes(valor)
}

/**
 * Negocia el idioma contra el `Accept-Language` del navegador. Deliberadamente simple: se busca el
 * primer idioma soportado que aparezca, comparando solo por la parte de lengua (`es` casa con
 * `es-CO`, `es-419` y `es-ES`). No se ordena por `q` porque con dos idiomas el orden de aparicion
 * ya es la preferencia en todos los navegadores reales.
 */
export function negociarIdioma(acceptLanguage: string | null | undefined): Idioma {
  if (!acceptLanguage) return IDIOMA_POR_DEFECTO
  for (const parte of acceptLanguage.split(',')) {
    const lengua = parte.split(';')[0].trim().toLowerCase().split('-')[0]
    if (lengua === 'es') return 'es-CO'
    if (lengua === 'en') return 'en'
  }
  return IDIOMA_POR_DEFECTO
}
