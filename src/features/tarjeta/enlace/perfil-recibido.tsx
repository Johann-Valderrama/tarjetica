'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { Ubicacion, Encabezado, Discurso } from '@/features/tarjeta/vista/tarjeta'
import { FirmaDeMarca } from '@/features/tarjeta/vista/firma'
import { QrDeContacto } from '@/features/tarjeta/qr/qr-cliente'
import { nombreDeArchivo, vcardParaArchivo } from '@/features/tarjeta/vcard/generar'
import { guardarImagen } from '@/features/tarjeta/exportar/guardar'
import { apariencia } from '@/features/tarjeta/vista/apariencia'
import { canalesDelPerfil, enlacesDelPerfil, urlAgenda, urlCuentame } from './acciones'
import { IconoAgenda, IconoCanal, IconoCuentame, IconoGuardar } from './iconos-marca'

const secundario = 'flex min-h-12 items-center justify-center gap-2 rounded-xl border border-borde-fuerte px-4 py-3 text-sm font-semibold text-tinta transition-colors hover:bg-superficie-sutil focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acento'
const externo = { target: '_blank', rel: 'noopener noreferrer', referrerPolicy: 'no-referrer' } as const

/**
 * El perfil que abre quien RECIBE el enlace (rediseñado en la ola 1, U5).
 *
 * Orden por lo que esa persona necesita: guardar el contacto primero, despues las dos acciones
 * opcionales que el creador eligio (agendar, contar que necesita), la fila de canales SOLO con lo
 * que el creador lleno, y el QR a pedido. Sin foto ni logo: por G5 no viajan en el enlace. Actua
 * sobre el fragmento recibido, sin consultar ni modificar el borrador del visitante.
 */
export function PerfilRecibido({ tarjeta }: { tarjeta: Tarjeta }) {
  const t = useTranslations('receptor')
  const [qrAbierto, setQrAbierto] = useState(false)
  const [guardado, setGuardado] = useState<'descargado' | 'compartido' | 'error' | null>(null)
  const disparador = useRef<HTMLButtonElement>(null)
  const nombre = [tarjeta.n, tarjeta.a].filter(Boolean).join(' ')
  const agenda = urlAgenda(tarjeta)
  const cuentame = urlCuentame(tarjeta)
  const canales = canalesDelPerfil(tarjeta, t('whatsappTexto', { nombre: tarjeta.n }))
  const otros = enlacesDelPerfil(tarjeta).filter((e) => e.tipo === 'otro')

  // El tema y el color de marca envuelven `<main>` Y el dialogo del QR: el dialogo es hermano de
  // `<main>`, y si el atributo fuera solo del `<main>` la tarjeta clara abriria un dialogo oscuro.
  const { tema, colorMarca } = apariencia(tarjeta)
  const estiloMarca = colorMarca ? ({ '--color-marca': colorMarca } as React.CSSProperties) : undefined

  /**
   * Guardar el contacto por la MEJOR via del dispositivo (mejora 1 de la ola 1). En un telefono,
   * la hoja del sistema ofrece Contactos; con mouse, la descarga clasica del `.vcf`. Es la misma
   * decision que ya toma el JPEG, asi que se reutiliza tal cual en vez de duplicarla.
   */
  async function guardar() {
    setGuardado(null)
    try {
      const archivo = new File([vcardParaArchivo(tarjeta)], nombreDeArchivo(tarjeta), { type: 'text/vcard;charset=utf-8' })
      const resultado = await guardarImagen(archivo)
      if (resultado.ok) setGuardado(resultado.via === 'compartir' ? 'compartido' : 'descargado')
      else if (resultado.motivo !== 'cancelado') setGuardado('error')
    } catch {
      setGuardado('error')
    }
  }

  function cerrarQr() {
    setQrAbierto(false)
    disparador.current?.focus()
  }

  return (
    <div data-tema={tema} style={estiloMarca} className="min-h-dvh bg-fondo text-tinta">
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-8 sm:py-12">
      <article data-testid="perfil-recibido" className="tarjeta-superficie overflow-hidden rounded-tarjeta p-6 sm:p-8">
        <p className="mb-7 text-[10px] font-bold uppercase tracking-[0.22em] text-tinta-suave">{t('presentacion')}</p>
        <Ubicacion ciudad={tarjeta.d} />
        <Encabezado tarjeta={tarjeta} muestra={false} />
        <Discurso tarjeta={tarjeta} completo />

        <section aria-label={t('acciones')} className="mt-7 space-y-3 border-t border-borde pt-6">
          <button type="button" aria-describedby="guardar-contacto-ayuda" onClick={() => void guardar()} className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-acento-relleno px-5 py-4 font-bold text-tinta-sobre-relleno transition-transform active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acento">
            <IconoGuardar />
            {t('guardar')}
          </button>
          <p id="guardar-contacto-ayuda" className="px-2 text-center text-xs leading-relaxed text-tinta-suave">{t('guardarAyuda')}</p>
          {guardado && <p role="status" className="rounded-lg bg-superficie-sutil p-3 text-sm text-tinta">{t(guardado)}</p>}

          {/* Las dos acciones que el creador eligio. Si no lleno ninguna, el bloque no existe. */}
          {(agenda || cuentame) && (
            <div data-testid="acciones-opcionales" className={`grid gap-3 pt-2 ${agenda && cuentame ? 'sm:grid-cols-2' : ''}`}>
              {agenda && <a href={agenda} {...externo} data-testid="accion-agendar" className={secundario}><IconoAgenda />{t('agendar')}</a>}
              {cuentame && <a href={cuentame} {...externo} data-testid="accion-cuentame" className={secundario}><IconoCuentame />{t('cuentame')}</a>}
            </div>
          )}

          {/*
            Solo los canales llenos: un canal vacio no se pinta, ni atenuado. Fila flexible y no
            rejilla: con un numero impar de canales el ultimo crece a todo el ancho y no queda una
            celda vacia.
          */}
          {canales.length > 0 && (
            <ul aria-label={t('canales')} className="flex flex-wrap gap-2 pt-2">
              {canales.map((canal) => {
                // Externo = cualquier esquema navegable, no solo `https://`: la web y las redes
                // admiten `http://` en el modelo, y un chip sin `noopener` seria el unico enlace de
                // la pagina sin ese candado (lo cazo el verificador independiente, 2026-09-15).
                const esExterno = /^https?:\/\//i.test(canal.url)
                return (
                  <li key={canal.tipo} className="min-w-0 grow basis-[calc(50%-0.25rem)] sm:basis-[calc(33.333%-0.34rem)]">
                    <a
                      href={canal.url}
                      {...(esExterno ? externo : {})}
                      data-testid={`icono-canal-${canal.tipo}`}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-borde-fuerte px-3 py-2 text-sm font-semibold text-tinta transition-colors hover:bg-superficie-sutil focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acento"
                    >
                      <IconoCanal tipo={canal.tipo} />
                      <span className="truncate">{t(`redes.${canal.tipo}`)}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          )}

          <button ref={disparador} type="button" aria-haspopup="dialog" onClick={() => setQrAbierto(true)} className={`${secundario} w-full`}>{t('mostrarQr')}</button>
        </section>

        {otros.length > 0 && <nav aria-label={t('enlaces')} className="mt-7 border-t border-borde pt-5">
          <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-tinta-suave">{t('enlaces')}</h2>
          {otros.map(enlace => <a key={enlace.url} href={enlace.url} {...externo} className="flex min-h-12 items-center justify-between gap-4 rounded-lg px-2 py-3 text-sm text-tinta hover:bg-superficie-sutil focus-visible:outline focus-visible:outline-2 focus-visible:outline-acento">
            <span className="min-w-0 break-words">{enlace.etiqueta || t('redes.otro')}</span><span aria-hidden="true" className="text-acento">↗</span>
          </a>)}
        </nav>}
      </article>
      <footer className="mt-5"><FirmaDeMarca /></footer>
    </main>
    {qrAbierto && <DialogoQr tarjeta={tarjeta} nombre={nombre} cerrar={cerrarQr} />}
    </div>
  )
}

function DialogoQr({ tarjeta, nombre, cerrar }: { tarjeta: Tarjeta; nombre: string; cerrar: () => void }) {
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
    <p className="mb-4 text-sm text-tinta-suave">{nombre}</p>
    <div className="aspect-square w-full rounded-xl bg-white p-2"><QrDeContacto tarjeta={tarjeta} /></div>
    <p className="mt-4 text-center text-xs leading-relaxed text-tinta-suave">{t('qrAyuda')}</p>
  </dialog>
}
