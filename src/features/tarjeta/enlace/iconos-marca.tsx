import type { TipoCanal } from './acciones'

/**
 * Pictogramas de los canales del receptor (ola 1, U5), en SVG dentro del codigo.
 *
 * No son los logotipos oficiales pixel a pixel: son trazos simples, del mismo estilo que el icono
 * de descarga del boton principal, que se reconocen al lado de su etiqueta. Van en el codigo y no
 * como archivos remotos porque la CSP arranca en `default-src 'self'` y porque un icono que se
 * pide a un CDN es una peticion a un dominio ajeno, que es justo lo que el producto promete no
 * hacer. `currentColor` para que hereden la tinta del tema.
 */
const TRAZOS: Record<TipoCanal, React.ReactNode> = {
  whatsapp: (
    <>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1L4 20z" />
      <path d="M9.5 9.5c.3 1.6 1.7 3.2 3.4 3.7l1.2-1.1 2 .9c-.2 1.2-1.1 1.9-2.2 1.8-3-.3-5.6-2.9-5.9-5.9-.1-1.1.6-2 1.8-2.2l.9 2-1.2 1.2z" />
    </>
  ),
  llamar: <path d="M5 4h3.5l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7L15 13l4 1.5V18a2 2 0 0 1-2 2A14 14 0 0 1 4 7a2 2 0 0 1 1-3z" />,
  correo: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  web: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10v7M8 7v.5M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17 7v.5" />
    </>
  ),
  tiktok: <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.5 2.5 2 4 4.5 4.5" />,
  facebook: <path d="M14 20v-7h2.5l.5-3H14V8.5c0-1 .4-1.5 1.5-1.5H17V4.3c-.5-.1-1.5-.3-2.5-.3C12.2 4 11 5.4 11 7.8V10H8.5v3H11v7" />,
}

export function IconoCanal({ tipo }: { tipo: TipoCanal }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      {TRAZOS[tipo]}
    </svg>
  )
}

/** Icono de la accion principal: guardar el contacto. */
export function IconoGuardar() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12m-5-5 5 5 5-5M5 16v4h14v-4" />
    </svg>
  )
}

/** Icono de agenda (calendario) para el boton "Agendar". */
export function IconoAgenda() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

/** Icono de conversacion para "Cuentame que necesitas". */
export function IconoCuentame() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  )
}
