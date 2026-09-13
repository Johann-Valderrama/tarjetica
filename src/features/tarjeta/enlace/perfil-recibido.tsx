'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { Ubicacion, Encabezado, Discurso } from '@/features/tarjeta/vista/tarjeta'
import { FirmaDeMarca } from '@/features/tarjeta/vista/firma'
import { QrDeContacto } from '@/features/tarjeta/qr/qr-cliente'
import { descargarVCard } from '@/features/tarjeta/vcard/descargar'
import { enlacesDelPerfil, urlWhatsapp } from './acciones'

const secundario = 'flex min-h-12 items-center justify-center gap-3 rounded-xl border border-borde-fuerte px-4 py-3 text-sm font-semibold text-tinta transition-colors hover:bg-superficie-sutil focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acento'

/** El destinatario actúa sobre el fragmento recibido, sin consultar ni modificar su borrador. */
export function PerfilRecibido({ tarjeta }: { tarjeta: Tarjeta }) {
  const t = useTranslations('receptor')
  const [qrAbierto, setQrAbierto] = useState(false)
  const [descarga, setDescarga] = useState<'listo' | 'error' | null>(null)
  const disparador = useRef<HTMLButtonElement>(null)
  const whatsapp = urlWhatsapp(tarjeta)
  const enlaces = enlacesDelPerfil(tarjeta)

  function guardar() {
    try {
      setDescarga(descargarVCard(tarjeta).ok ? 'listo' : 'error')
    } catch {
      setDescarga('error')
    }
  }

  function cerrarQr() {
    setQrAbierto(false)
    disparador.current?.focus()
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-8 sm:py-12">
      <article data-testid="perfil-recibido" className="tarjeta-superficie overflow-hidden rounded-tarjeta p-6 sm:p-8">
        <p className="mb-7 text-[10px] font-bold uppercase tracking-[0.22em] text-tinta-suave">{t('presentacion')}</p>
        <Ubicacion ciudad={tarjeta.d} />
        <Encabezado tarjeta={tarjeta} muestra={false} />
        <Discurso tarjeta={tarjeta} completo />

        <section aria-label={t('acciones')} className="mt-7 space-y-3 border-t border-borde pt-6">
          <button type="button" aria-describedby="guardar-contacto-ayuda" onClick={guardar} className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-acento px-5 py-4 font-bold text-fondo transition-transform active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acento">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v12m-5-5 5 5 5-5M5 16v4h14v-4" /></svg>
            {t('guardar')}
          </button>
          <p id="guardar-contacto-ayuda" className="px-2 text-center text-xs leading-relaxed text-tinta-suave">{t('guardarAyuda')}</p>
          {descarga && <p role="status" className="rounded-lg bg-superficie-sutil p-3 text-sm text-tinta">{t(descarga === 'listo' ? 'descargado' : 'error')}</p>}
          <div className={`grid gap-3 pt-2 ${whatsapp ? 'grid-cols-2' : ''}`}>
            {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className={secundario}>WhatsApp <span aria-hidden="true">↗</span></a>}
            <button ref={disparador} type="button" aria-haspopup="dialog" onClick={() => setQrAbierto(true)} className={secundario}>{t('mostrarQr')}</button>
          </div>
        </section>

        {enlaces.length > 0 && <nav aria-label={t('enlaces')} className="mt-7 border-t border-borde pt-5">
          <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-tinta-suave">{t('enlaces')}</h2>
          {enlaces.map(enlace => <a key={enlace.url} href={enlace.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="flex min-h-12 items-center justify-between gap-4 rounded-lg px-2 py-3 text-sm text-tinta hover:bg-superficie-sutil focus-visible:outline focus-visible:outline-2 focus-visible:outline-acento">
            <span className="min-w-0 break-words">{enlace.etiqueta || t(`redes.${enlace.tipo}`)}</span><span aria-hidden="true" className="text-acento">↗</span>
          </a>)}
        </nav>}
      </article>
      <footer className="mt-5"><FirmaDeMarca /></footer>
      {qrAbierto && <DialogoQr tarjeta={tarjeta} cerrar={cerrarQr} />}
    </main>
  )
}

function DialogoQr({ tarjeta, cerrar }: { tarjeta: Tarjeta; cerrar: () => void }) {
  const t = useTranslations('receptor')
  const dialogo = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const elemento = dialogo.current
    elemento?.showModal()
    return () => elemento?.close()
  }, [])
  function cerrarDialogo() {
    // Retira primero la modalidad: mientras el fondo sea inert no puede recuperar el foco.
    dialogo.current?.close()
    cerrar()
  }
  return <dialog ref={dialogo} aria-labelledby="titulo-qr" onCancel={event => { event.preventDefault(); cerrarDialogo() }} className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-tarjeta border border-borde bg-superficie p-5 text-tinta backdrop:bg-black/80">
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 id="titulo-qr" className="font-display text-lg font-bold">{t('qrTitulo')}</h2>
      <button type="button" autoFocus onClick={cerrarDialogo} aria-label={t('cerrar')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-borde-fuerte text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-acento">×</button>
    </div>
    <p className="mb-4 text-sm text-tinta-suave">{[tarjeta.n, tarjeta.a].filter(Boolean).join(' ')}</p>
    <div className="aspect-square w-full rounded-xl bg-white p-2"><QrDeContacto tarjeta={tarjeta} /></div>
    <p className="mt-4 text-center text-xs leading-relaxed text-tinta-suave">{t('qrAyuda')}</p>
  </dialog>
}
