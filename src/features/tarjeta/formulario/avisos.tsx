'use client'

import { useTranslations } from 'next-intl'

/**
 * Unidad 2d del PRP-TD-001: avisos y controles de privacidad del editor.
 *
 * Son contramedidas de la seccion 9, y su ausencia NO la detecta ningun test de funcionamiento: la
 * app anda igual de bien sin ellas. Dos cosas que el PRP exige y que aqui se cumplen literal:
 *
 * - **Un aviso sin gate es decoracion.** Por eso la confirmacion de "esta tarjeta es mia" BLOQUEA la
 *   exportacion, no solo la acompana. El `.jpeg` en Fotos y el `.vcf` en Contactos se respaldan
 *   solos a iCloud o Google: si alguien hace la tarjeta de OTRA persona, los datos de esa persona
 *   terminan en la nube de quien la creo.
 * - **El boton de borrar es visible**, no esta escondido. En un equipo compartido de stand, el
 *   autosave le muestra al siguiente la tarjeta del anterior.
 */

export function AvisoDeAlcance() {
  const t = useTranslations('avisos')
  return (
    <div
      role="note"
      className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
    >
      <p className="font-semibold">{t('alcanceTitulo')}</p>
      <p className="mt-1">{t('alcanceCuerpo')}</p>
    </div>
  )
}

/** Advertencia corta que va PEGADA a un campo delicado, no en una nota al pie. */
export function AvisoDeCampo({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-amber-700">{children}</p>
}

export function ConfirmacionDeExportacion({
  confirmado,
  onCambio,
}: {
  confirmado: boolean
  onCambio: (v: boolean) => void
}) {
  const t = useTranslations('avisos')
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-neutral-300 p-3 text-sm">
      <input
        type="checkbox"
        name="confirmacion-propia"
        checked={confirmado}
        onChange={(e) => onCambio(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0"
      />
      <span>{t('confirmacion')}</span>
    </label>
  )
}

/**
 * Puerta de las exportaciones. Se usa asi para que la regla viva en UN solo lugar y no dependa de
 * que cada boton se acuerde de comprobarla.
 */
export function puedeExportar(confirmado: boolean): boolean {
  return confirmado === true
}

export function BotonBorrarTodo({ onBorrar }: { onBorrar: () => void }) {
  const t = useTranslations('avisos')
  return (
    <button
      type="button"
      onClick={onBorrar}
      className="min-h-11 w-full rounded-lg border border-red-300 px-4 text-sm font-medium text-red-700 hover:bg-red-50"
    >
      {t('borrarTodo')}
    </button>
  )
}

/**
 * Limitaciones que son consecuencia directa de no tener servidor (D1). Van DICHAS en el copy, no
 * enterradas en la documentacion: son la contrapartida que el usuario tiene que conocer antes de
 * confiarle su tarjeta a la herramienta.
 *
 * **Los TRES limites que la unidad 7b exige, y los tres estan aqui** (`data-testid` para que un
 * assert los pueda contar en vez de que alguien los cuente leyendo):
 *
 * 1. `senal` — hace falta conexion la primera vez (G7: no se construyo PWA en v1).
 * 2. `equipo` — la tarjeta vive solo en este navegador y en este equipo.
 * 3. `enlaceIrrevocable` — un enlace repartido no se puede desactivar.
 *
 * El tercero **estaba solo dentro del flujo del enlace** (`generar-enlace.tsx`), o sea que solo lo
 * veia quien ya habia decidido crear uno. Ahi es una advertencia antes de actuar, que es su sitio;
 * aqui es un limite del producto que se dice ANTES, a quien todavia esta decidiendo si usarlo. No
 * es duplicacion: son dos momentos distintos, y callarlo en el segundo convierte una limitacion
 * honesta en una sorpresa.
 *
 * Este bloque se pinta en la home y en el editor, con UNA sola redaccion: dos textos separados se
 * desincronizan y nadie lo nota.
 */
export function LimitesDelProducto() {
  const t = useTranslations()
  return (
    <div
      data-testid="limites-producto"
      /*
        Pintado con los tokens de la direccion estetica (unidad 3a) y no con neutrales claros. El
        bloque traia `bg-neutral-50` y un titulo SIN color: sobre el fondo oscuro que fijo la Ola 3,
        ese titulo heredaba la tinta clara y quedaba blanco sobre blanco, o sea el aviso de G2, que
        es la frase mas importante del producto, era el unico texto ilegible del bloque. Se vio en
        una captura a 375 px; ninguna medicion lo delataba.
      */
      className="rounded-bloque border border-borde bg-superficie p-3 text-sm"
    >
      <p className="font-semibold text-tinta">{t('app.avisoG2')}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-tinta-suave">
        <li data-limite="senal">{t('limites.senal')}</li>
        <li data-limite="equipo">{t('limites.equipo')}</li>
        <li data-limite="enlace">{t('limites.enlaceIrrevocable')}</li>
        <li data-limite="respaldo">{t('limites.respaldo')}</li>
      </ul>
    </div>
  )
}
