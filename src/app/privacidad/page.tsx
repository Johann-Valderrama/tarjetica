import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { AVISO_PRIVACIDAD_MD } from '@/features/legal/contenido'
import { renderizarMarkdownSimple } from '@/features/legal/markdown-simple'

/**
 * Unidad legal (2026-09-15): la pagina que sirve `contenido.ts`.
 *
 * Shim delgado a proposito (arquitectura.md #8): la logica de parseo vive en la feature
 * `src/features/legal/`, este archivo solo la monta en la ruta que Next exige.
 *
 * SOLO en español, a proposito y no por descuido: el documento ancla su ley aplicable en Colombia
 * (seccion 10), y una traduccion no oficial de un texto legal es un riesgo mayor que no traducirlo
 * (una imprecision de traduccion puede leerse como una promesa distinta a la que el texto original
 * hace). El aviso de arriba, en los dos idiomas, se lo dice a quien no lea español y lo manda al
 * correo de contacto para un resumen.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal')
  return { title: t('tituloPagina') }
}

export default async function PaginaPrivacidad() {
  const t = await getTranslations('legal')
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-16 sm:px-8">
      <header className="flex min-h-24 items-center justify-between gap-4 border-b border-borde">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight">
          {t('volver')}
        </Link>
      </header>
      <p className="mt-6 rounded-lg border border-borde-fuerte bg-superficie-sutil p-3 text-sm text-tinta-suave">
        {t('soloEspanol')}
      </p>
      <article className="prose-tarjetica mt-8 space-y-4 text-sm leading-relaxed text-tinta [&_h1]:mb-2 [&_h2]:mb-1 [&_h2]:mt-8 [&_h3]:mt-4 [&_hr]:my-8">
        {renderizarMarkdownSimple(AVISO_PRIVACIDAD_MD)}
      </article>
    </main>
  )
}
