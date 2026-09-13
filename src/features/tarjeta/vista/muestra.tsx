'use client'

import { useTranslations } from 'next-intl'
import { VistaTarjeta } from './tarjeta'
import { QrDeContacto } from '../qr/qr-cliente'
import type { Tarjeta } from '../modelo/tarjeta'

/** Perfil ficticio independiente del almacenamiento del visitante. */
export function MuestraTarjeta() {
  const t = useTranslations('home')
  const tarjeta: Tarjeta = {
    n: 'Alex', a: 'Rivera', c: t('ejemploCargo'), em: 'Estudio Norte',
    d: t('ejemploCiudad'), ti: t('ejemploTitular'),
    co: 'alex@example.com',
    t: [{ n: '+1 202 555 0148', e: 'movil' }, { n: '+1 202 555 0196', e: 'oficina' }],
    w: 'https://example.com',
    l: [{ e: t('ejemploPortafolio'), u: 'https://example.com/portfolio' }],
  }
  const campos = [
    [t('contactoMovil'), tarjeta.t![0].n],
    [t('contactoOficina'), tarjeta.t![1].n],
    [t('contactoCorreo'), tarjeta.co],
    [t('contactoWeb'), tarjeta.w],
    [tarjeta.l![0].e, tarjeta.l![0].u],
    [t('contactoDireccion'), tarjeta.d],
    [t('contactoNotas'), tarjeta.ti],
  ]
  return (
    <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="ejemplos">
      {[true, false].map((conFoto, i) => (
        <figure key={String(conFoto)} className="mx-auto w-full max-w-[360px]" data-testid={conFoto ? 'ejemplo-con-foto' : 'ejemplo-sin-foto'}>
          <figcaption className="mb-2 flex items-center gap-3 px-3 text-sm font-semibold">
            <span className="text-xs text-acento">0{i + 1}</span>{t(conFoto ? 'conFoto' : 'sinFoto')}
          </figcaption>
          <VistaTarjeta muestra tarjeta={tarjeta} fotoDataUrl={conFoto ? '/ejemplos/profesional-ia.webp' : undefined} qr={<QrDeContacto tarjeta={tarjeta} />} />
        </figure>
      ))}
      <figure className="mx-auto w-full max-w-[360px] md:col-span-2 lg:col-span-1" data-testid="ejemplo-contacto">
        <figcaption className="mb-2 flex items-center gap-3 px-3 text-sm font-semibold">
          <span className="text-xs text-acento">03</span>{t('contactoTitulo')}
        </figcaption>
        <div className="m-3 overflow-hidden rounded-tarjeta border border-borde bg-superficie-sutil">
          <header className="border-b border-borde px-5 py-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-acento">{t('contactoEtiqueta')}</p>
            <h3 className="font-display text-[26px] font-extrabold leading-tight">{tarjeta.n} {tarjeta.a}</h3>
            <p className="mt-1 text-sm text-tinta-suave">{tarjeta.c} · {tarjeta.em}</p>
          </header>
          <dl className="divide-y divide-borde px-5">
            {campos.map(([etiqueta, valor]) => (
              <div key={etiqueta} className="py-2.5">
                <dt className="text-[10px] text-tinta-suave">{etiqueta}</dt>
                <dd className="mt-0.5 break-words text-sm">{valor}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="px-3 text-xs leading-relaxed text-tinta-suave">{t('contactoNota')}</p>
      </figure>
    </div>
  )
}
