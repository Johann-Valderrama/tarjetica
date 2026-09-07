import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { LimitesDelProducto } from '@/features/tarjeta/formulario/avisos'
import { JsonLdDeLaHerramienta } from '@/features/tarjeta/vista/json-ld'
import { PingDeVisita } from '@/features/metricas/ping-de-visita'
import { SelectorDeIdioma } from '@/shared/idioma/selector-idioma'

/**
 * Home. Es la unica ruta indexable del producto (`src/app/robots.ts`), asi que es donde viven el
 * JSON-LD y el `llms.txt` de la unidad 7b.
 *
 * Los TRES limites del producto se dicen AQUI, en el copy visible, y no solo en el README: son la
 * contrapartida de no tener servidor, y el README no lo lee quien va a usar la app. Se reusa el
 * mismo bloque que el editor, para que no existan dos redacciones que se desincronicen.
 */
export default async function Home() {
  const t = await getTranslations()
  return (
    <main className="mx-auto w-full max-w-xl space-y-6 p-6">
      <JsonLdDeLaHerramienta />
      <PingDeVisita />

      <div className="flex justify-end">
        <SelectorDeIdioma />
      </div>

      <header className="space-y-2">
        <h1 className="font-display text-3xl font-extrabold text-tinta">{t('app.nombre')}</h1>
        <p className="text-base text-tinta-suave">{t('home.tagline')}</p>
        <p className="font-semibold text-tinta">{t('app.avisoG2')}</p>
      </header>

      <p className="text-sm text-tinta-suave">{t('home.comoFunciona')}</p>

      <p>
        <Link
          href="/editor"
          className="inline-flex min-h-11 items-center rounded-lg bg-acento px-5 font-semibold text-fondo"
        >
          {t('home.cta')}
        </Link>
      </p>

      <LimitesDelProducto />
    </main>
  )
}
