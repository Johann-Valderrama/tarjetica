'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { LogoLocal, TarjetaBorrador } from '@/features/tarjeta/modelo/tarjeta'
import type { Tema } from '@/features/tarjeta/vista/tarjeta'
import { colorDominanteDeLogo, sugerirColorDeMarca } from '@/features/tarjeta/foto/color-de-marca'
import { Entrada, Etiqueta, Seccion } from '@/features/tarjeta/formulario/campos'

/**
 * Unidad 3 del PRP-TD-001 (ola 1): tema y color de marca, sobre los tokens de U4
 * (`[data-tema='claro']` en `globals.css`, `apariencia(tarjeta)` en `vista/apariencia.ts`).
 *
 * **El color de marca es una SUGERENCIA que se puede pisar, no un calculo que se impone.** Por eso
 * este componente distingue, con una bandera que NO viaja al modelo (`esSugerido`, solo en memoria),
 * si el `cm` actual vino de leer el logo o de que la persona lo haya elegido a mano:
 * - Si vino del logo, un cambio de TEMA lo recalcula (el mismo naranja del logo puede pasar el
 *   contraste en oscuro y fallarlo en claro, asi que la sugerencia depende del tema).
 * - Si la persona ya lo eligio, cambiar de tema NUNCA le pisa su eleccion.
 */

type Cambio = (parche: Partial<TarjetaBorrador>) => void

const COLOR_POR_DEFECTO = '#ff9101'
const HEX_VALIDO = /^#[0-9a-f]{6}$/i

export function Apariencia({
  tarjeta,
  onCambio,
  logo,
}: {
  tarjeta: TarjetaBorrador
  onCambio: Cambio
  logo: LogoLocal | null
}) {
  const t = useTranslations('editor')
  const tema: Tema = tarjeta.tm === 'claro' ? 'claro' : 'oscuro'
  const [calculando, setCalculando] = useState(false)
  // Se lee durante el render (para mostrar el texto de "sugerido"), asi que va en estado y no en un
  // ref: un ref no dispara el repintado que la etiqueta necesita cuando la sugerencia llega.
  const [esSugerido, setEsSugerido] = useState(false)

  /**
   * Solo CALCULA, no toca estado: por eso la pueden llamar tanto los efectos automaticos (que no
   * pueden invocar `setState` de forma sincrona en su cuerpo, `react-hooks/set-state-in-effect`) como
   * el boton manual (que si puede, porque es un manejador de evento y no un efecto).
   */
  const calcularSugerencia = (temaObjetivo: Tema, dataUrl: string): Promise<string | null> =>
    colorDominanteDeLogo(dataUrl).then((pixeles) => (pixeles ? sugerirColorDeMarca(pixeles, temaObjetivo) : null))

  // Logo nuevo (o ya guardado, al abrir el editor) sin color todavia: se sugiere una vez, sin
  // pisar un color que la persona ya haya elegido. El `setState` vive DENTRO del `.then()`, nunca
  // en el cuerpo sincrono del efecto.
  useEffect(() => {
    if (!logo || tarjeta.cm) return
    let vigente = true
    calcularSugerencia(tema, logo.dataUrl).then((sugerido) => {
      if (!vigente || !sugerido) return
      setEsSugerido(true)
      onCambio({ cm: sugerido })
    })
    return () => {
      vigente = false
    }
    // Solo cuando aparece/cambia el LOGO: si se metiera `tema` o `tarjeta.cm` aqui, este efecto se
    // dispararia en cada tecla del resto del formulario. El efecto de abajo cubre el cambio de tema.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logo?.dataUrl])

  // Cambio de tema con un color que SIGUE siendo sugerencia (nadie lo edito a mano): se recalcula
  // para el fondo del tema nuevo, porque el mismo color puede pasar el contraste en uno y no en otro.
  useEffect(() => {
    if (!logo || !esSugerido) return
    let vigente = true
    calcularSugerencia(tema, logo.dataUrl).then((sugerido) => {
      if (!vigente || !sugerido) return
      setEsSugerido(true)
      onCambio({ cm: sugerido })
    })
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tema])

  const elegirTema = (siguiente: Tema) => {
    // Ausencia = oscuro (contrato de `Tarjeta.tm`): no se escribe `'oscuro'` en el borrador.
    onCambio({ tm: siguiente === 'claro' ? 'claro' : undefined })
  }

  const escribirColor = (valor: string) => {
    setEsSugerido(false)
    const limpio = valor.trim()
    onCambio({ cm: limpio === '' ? undefined : limpio })
  }

  const usarColorDelLogo = () => {
    if (!logo) return
    // Manejador de evento, no un efecto: aqui SI se puede llamar `setState` de forma sincrona.
    setCalculando(true)
    calcularSugerencia(tema, logo.dataUrl)
      .then((sugerido) => {
        if (!sugerido) return
        setEsSugerido(true)
        onCambio({ cm: sugerido })
      })
      .finally(() => setCalculando(false))
  }

  return (
    <Seccion titulo={t('apariencia')}>
      <fieldset>
        <legend className="text-sm font-medium text-tinta">{t('tema')}</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(['oscuro', 'claro'] as const).map((opcion) => (
            <label
              key={opcion}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-semibold ${
                tema === opcion ? 'border-acento text-tinta' : 'border-borde-fuerte text-tinta-suave'
              }`}
            >
              <input
                type="radio"
                name="tema"
                value={opcion}
                checked={tema === opcion}
                onChange={() => elegirTema(opcion)}
                className="sr-only"
              />
              {opcion === 'oscuro' ? t('temaOscuro') : t('temaClaro')}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-tinta-suave">{t('temaAyuda')}</p>
      </fieldset>

      <div>
        <Etiqueta htmlFor="color-marca-hex">{t('colorMarca')}</Etiqueta>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="color"
            aria-label={t('colorMarca')}
            value={HEX_VALIDO.test(tarjeta.cm ?? '') ? (tarjeta.cm as string) : COLOR_POR_DEFECTO}
            onChange={(e) => escribirColor(e.target.value)}
            className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-borde-fuerte bg-superficie p-1"
          />
          <Entrada
            id="color-marca-hex"
            name="color-marca-hex"
            value={tarjeta.cm ?? ''}
            onChange={(e) => escribirColor(e.target.value)}
            placeholder={COLOR_POR_DEFECTO}
            inputMode="text"
            maxLength={7}
            className="max-w-[10rem]"
          />
        </div>
        <p className="mt-1 text-xs text-tinta-suave">{t('colorMarcaAyuda')}</p>
        <p className="mt-1 text-xs text-tinta-suave">{t('colorHexAyuda')}</p>
        {esSugerido && tarjeta.cm && (
          <p className="mt-1 text-xs text-tinta-suave">{t('colorSugerido')}</p>
        )}
        {logo && (
          <button
            type="button"
            onClick={usarColorDelLogo}
            disabled={calculando}
            className="mt-2 min-h-11 rounded-lg border border-borde-fuerte px-4 text-sm font-semibold text-tinta disabled:text-tinta-tenue"
          >
            {t('usarColorDelLogo')}
          </button>
        )}
      </div>
    </Seccion>
  )
}
