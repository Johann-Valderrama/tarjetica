import { headers } from 'next/headers'
import { getLocale, getTranslations } from 'next-intl/server'

/**
 * Unidad 7b del PRP-TD-001: datos estructurados de la HERRAMIENTA.
 *
 * ⛔ **Describe la aplicacion, JAMAS la tarjeta de un usuario.** Es la linea que no se cruza: un
 * `Person` con el nombre, el telefono y el correo de quien esta usando la app seria exactamente lo
 * que el producto promete no hacer, y ademas quedaria en el HTML que sirve el servidor, o sea del
 * lado equivocado de D1. Por eso este componente **no recibe ninguna prop**: no hay forma de
 * pasarle un dato de nadie.
 *
 * Solo se monta en la home. Las otras tres rutas van `noindex` (unidad 1e) y muestran o editan
 * datos de una persona: ahi un bloque de datos estructurados no tendria a quien servirle.
 *
 * `SoftwareApplication` y no `WebSite` porque lo que se ofrece es una herramienta que se usa, no un
 * sitio que se lee. `offers` con precio 0 es la forma que la norma tiene de decir "gratis", y aqui
 * es literal: no hay cuenta, no hay pago y no hay servidor que cobrar.
 */
export async function JsonLdDeLaHerramienta() {
  const t = await getTranslations('app')
  const locale = await getLocale()
  // El nonce que emite `src/proxy.ts`. Un bloque `application/ld+json` es un "data block" y el
  // navegador no lo ejecuta, asi que la CSP no deberia tocarlo; se le pone el nonce igual porque el
  // costo es una linea y el fallo contrario seria MUDO (el bloque desaparece del HTML servido y
  // nadie se entera hasta que un buscador deja de verlo).
  const nonce = (await headers()).get('x-nonce') ?? undefined

  const datos = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: t('nombre'),
    description: t('descripcion'),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    inLanguage: locale,
    isAccessibleForFree: true,
    license: 'https://opensource.org/licenses/MIT',
    codeRepository: 'https://github.com/Johann-Valderrama/tarjetica',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    // La propiedad que de verdad distingue a este producto, dicha en la forma que una maquina lee.
    featureList: [t('avisoG2')],
  }

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // El objeto lo construye este archivo, no viene de ninguna entrada: no hay nada que escapar
      // salvo el cierre de etiqueta, que `JSON.stringify` no puede producir con estos valores.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos) }}
    />
  )
}
