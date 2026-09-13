import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { LimitesDelProducto } from '@/features/tarjeta/formulario/avisos'
import { JsonLdDeLaHerramienta } from '@/features/tarjeta/vista/json-ld'
import { MuestraTarjeta } from '@/features/tarjeta/vista/muestra'
import { PingDeVisita } from '@/features/metricas/ping-de-visita'
import { SelectorDeIdioma } from '@/shared/idioma/selector-idioma'

export default async function Home() {
  const t = await getTranslations()
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-10 sm:px-8">
      <JsonLdDeLaHerramienta />
      <PingDeVisita />
      <header className="flex min-h-24 items-center justify-between gap-4 border-b border-borde">
        <span className="font-display text-xl font-extrabold tracking-tight">{t('app.nombre')}<span className="text-acento">.</span></span>
        <SelectorDeIdioma />
      </header>
      <section className="grid items-center gap-8 py-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-acento">{t('home.eyebrow')}</p>
          <h1 className="max-w-xl font-display text-5xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl">
            {t('home.titulo')} <span className="text-acento">{t('home.tituloAcento')}</span>
          </h1>
        </div>
        <div>
          <p className="mt-6 max-w-md text-base leading-relaxed text-tinta-suave">{t('home.tagline')}</p>
          <Link href="/editor" className="mt-8 inline-flex min-h-12 items-center gap-6 rounded-xl bg-acento px-6 font-bold text-fondo hover:brightness-110">
            {t('home.cta')} <span aria-hidden="true">↗</span>
          </Link>
          <p className="mt-4 text-xs text-tinta-suave">{t('home.sinCuenta')}</p>
          <div className="mt-10 max-w-md border-t border-borde pt-5">
            <p className="text-sm leading-relaxed text-tinta-suave">{t('home.comoFunciona')}</p>
          </div>
        </div>
      </section>
      <section aria-labelledby="ejemplos-titulo" className="pb-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-borde pt-6 text-xs text-tinta-suave">
          <h2 id="ejemplos-titulo" className="font-semibold uppercase tracking-widest">{t('home.ejemplo')}</h2>
          <span>{t('home.formato')}</span>
        </div>
        <MuestraTarjeta />
        <p className="mt-5 text-center text-xs leading-relaxed text-tinta-suave">{t('home.ejemploNota')}</p>
      </section>
      <section className="grid gap-6 border-t border-borde pt-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-acento">{t('home.privacidadEtiqueta')}</p>
          <h2 className="text-2xl font-bold">{t('home.privacidadTitulo')}</h2>
          <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{t('home.privacidadCuerpo')}</p>
        </div>
        <LimitesDelProducto />
      </section>
      <section aria-labelledby="servicios-titulo" className="mt-10 grid items-center gap-6 rounded-2xl border border-borde bg-superficie-sutil p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-acento">{t('home.serviciosEtiqueta')}</p>
          <h2 id="servicios-titulo" className="max-w-2xl font-display text-2xl font-extrabold leading-tight sm:text-3xl">{t('home.serviciosTitulo')}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-tinta-suave">{t('home.serviciosCuerpo')}</p>
        </div>
        <a href="https://wellnessjobs.zelandia.io/brief-general" className="inline-flex min-h-12 items-center justify-center gap-5 rounded-xl bg-acento px-6 py-3 text-sm font-bold text-fondo hover:brightness-110">
          {t('home.serviciosCta')} <span aria-hidden="true">↗</span>
        </a>
      </section>
      <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-borde pt-5 text-xs text-tinta-suave">
        <span>{t('home.pie')}</span><span>Tarjetica · MIT</span>
      </footer>
    </main>
  )
}
