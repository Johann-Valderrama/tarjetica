'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { COOKIE_IDIOMA, IDIOMAS, NOMBRE_DEL_IDIOMA, esIdioma } from '@/i18n/locales'

/** Un año. La preferencia de idioma no caduca sola: si el usuario la cambia, la vuelve a cambiar. */
const VIGENCIA_SEGUNDOS = 60 * 60 * 24 * 365

/**
 * Selector de idioma (unidad 7a).
 *
 * **Solo va en la home y en el editor.** Las otras dos pantallas (`/tarjeta` y `/t`) no admiten
 * ningun control: la primera es lo que la Ola 5 captura como imagen, y las dos existen para
 * extenderle el telefono a otra persona. Ahi el idioma lo resuelve el `Accept-Language` del
 * navegador de quien abre, que es exactamente el caso de un desconocido que recibe un enlace.
 *
 * La cookie la escribe el CLIENTE, sin accion de servidor: es una preferencia de interfaz, no un
 * dato de la tarjeta, y asi no aparece un `POST` en una app cuya promesa es que nada se manda a
 * ningun lado. `router.refresh()` es lo que hace que el servidor vuelva a resolver los mensajes.
 */
export function SelectorDeIdioma() {
  const t = useTranslations('idioma')
  const actual = useLocale()
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()

  return (
    <label className="inline-flex items-center gap-2 text-sm text-tinta-suave">
      <span>{t('etiqueta')}</span>
      <select
        name="idioma"
        aria-label={t('etiqueta')}
        value={actual}
        disabled={pendiente}
        onChange={(e) => {
          const elegido = e.target.value
          if (!esIdioma(elegido)) return
          document.cookie = `${COOKIE_IDIOMA}=${elegido}; path=/; max-age=${VIGENCIA_SEGUNDOS}; SameSite=Lax`
          iniciar(() => router.refresh())
        }}
        // Tokens de la direccion estetica: un `bg-white` aqui es un parche blanco sobre el fondo oscuro.
        className="min-h-11 rounded-lg border border-borde bg-superficie px-2 text-base text-tinta"
      >
        {IDIOMAS.map((idioma) => (
          <option key={idioma} value={idioma}>
            {NOMBRE_DEL_IDIOMA[idioma]}
          </option>
        ))}
      </select>
    </label>
  )
}
