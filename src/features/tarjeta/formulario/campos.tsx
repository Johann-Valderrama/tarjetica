'use client'

import { useTranslations } from 'next-intl'
import {
  completarEsquema,
  ETIQUETAS_TELEFONO,
  TOPE_DESCRIPCION,
  TOPE_TITULAR,
  type TarjetaBorrador,
} from '@/features/tarjeta/modelo/tarjeta'
import { AvisoDeCampo } from '@/features/tarjeta/formulario/avisos'

/**
 * Unidad 2a del PRP-TD-001: los campos de identidad, contacto, redes, ubicacion y descripcion
 * (seccion 5 del PRP), sobre el contrato que la unidad 1c ya cerro.
 *
 * **La estetica NO se decide aqui.** La direccion visual, los tokens y el layout definitivo son la
 * unidad 3a de la Ola 3, que se cierra ANTES de pintar. Lo que si es obligatorio desde ya, porque es
 * un default del sistema y no una decision de diseno: mobile-first, sin desborde horizontal a 375 px
 * y controles de al menos 44 px de alto (`min-h-11`).
 *
 * **Ningun campo es obligatorio salvo el nombre.** Una tarjeta con nombre y correo tiene que
 * funcionar igual de bien que una con los 20 campos llenos.
 *
 * **Ningun texto visible se escribe aqui (unidad 7a).** Todo sale de `messages/`, incluidos los
 * `placeholder` y los `aria-label`: un `aria-label` sin traducir deja el formulario en español para
 * quien navega con lector de pantalla, y eso no se ve en ninguna captura.
 */

type Cambio = (parche: Partial<TarjetaBorrador>) => void

export function Etiqueta({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-tinta">
      {children}
    </label>
  )
}

export function Entrada({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        'min-h-11 w-full rounded-lg border border-borde-fuerte px-3 text-base focus:border-acento focus:outline-none ' +
        className
      }
    />
  )
}

export function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-tinta">{titulo}</legend>
      {children}
    </fieldset>
  )
}

function CampoTexto({
  id,
  etiqueta,
  valor,
  onCambio,
  tipo = 'text',
  ayuda,
  ...resto
}: {
  id: string
  etiqueta: string
  valor: string | undefined
  onCambio: (v: string | undefined) => void
  tipo?: string
  ayuda?: React.ReactNode
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'value' | 'onChange' | 'type'>) {
  return (
    <div>
      <Etiqueta htmlFor={id}>{etiqueta}</Etiqueta>
      <Entrada
        id={id}
        name={id}
        type={tipo}
        value={valor ?? ''}
        // Una cadena vacia no es "el usuario escribio nada": es que el campo NO EXISTE en la
        // tarjeta. Guardarla como '' hincharia el QR con claves vacias.
        onChange={(e) => onCambio(e.target.value === '' ? undefined : e.target.value)}
        {...resto}
      />
      {ayuda}
    </div>
  )
}

export function CamposIdentidad({
  tarjeta,
  onCambio,
}: {
  tarjeta: TarjetaBorrador
  onCambio: Cambio
}) {
  const t = useTranslations('campos')
  return (
    <Seccion titulo={t('identidad')}>
      <CampoTexto
        id="n"
        etiqueta={t('nombre')}
        valor={tarjeta.n}
        onCambio={(v) => onCambio({ n: v })}
        autoComplete="given-name"
        required
      />
      <CampoTexto
        id="a"
        etiqueta={t('apellido')}
        valor={tarjeta.a}
        onCambio={(v) => onCambio({ a: v })}
        autoComplete="family-name"
      />
      <CampoTexto
        id="c"
        etiqueta={t('cargo')}
        valor={tarjeta.c}
        onCambio={(v) => onCambio({ c: v })}
        autoComplete="organization-title"
      />
      <CampoTexto
        id="em"
        etiqueta={t('empresa')}
        valor={tarjeta.em}
        onCambio={(v) => onCambio({ em: v })}
        autoComplete="organization"
      />
    </Seccion>
  )
}

export function CamposContacto({
  tarjeta,
  onCambio,
}: {
  tarjeta: TarjetaBorrador
  onCambio: Cambio
}) {
  const t = useTranslations('campos')
  const telefonos = tarjeta.t ?? []

  const cambiarTelefono = (i: number, parche: Partial<{ n: string; e: string }>) => {
    onCambio({
      t: telefonos.map((t, j) => (j === i ? { ...t, ...parche } : t)) as TarjetaBorrador['t'],
    })
  }

  return (
    <Seccion titulo={t('contacto')}>
      <CampoTexto
        id="co"
        etiqueta={t('correo')}
        tipo="email"
        valor={tarjeta.co}
        onCambio={(v) => onCambio({ co: v })}
        autoComplete="email"
        inputMode="email"
      />

      <div className="space-y-2">
        <Etiqueta htmlFor="tel-0">{t('telefonos')}</Etiqueta>
        {telefonos.map((tel, i) => (
          <div key={i} className="flex gap-2">
            <Entrada
              id={`tel-${i}`}
              name={`tel-${i}`}
              type="tel"
              inputMode="tel"
              value={tel.n}
              onChange={(e) => cambiarTelefono(i, { n: e.target.value })}
              placeholder={t('telefonoPlaceholder')}
            />
            <select
              aria-label={t('etiquetaTelefono', { n: i + 1 })}
              name={`tel-etiqueta-${i}`}
              value={tel.e}
              onChange={(e) => cambiarTelefono(i, { e: e.target.value })}
              className="min-h-11 shrink-0 rounded-lg border border-borde-fuerte px-2 text-base"
            >
              {/*
                Las etiquetas de telefono (`movil`, `casa`...) NO se traducen: son VALORES del
                modelo que viajan al vCard y al enlace, no texto de interfaz. Traducirlas
                cambiaria el dato guardado segun el idioma en que se creo la tarjeta.
              */}
              {ETIQUETAS_TELEFONO.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label={t('quitarTelefono', { n: i + 1 })}
              onClick={() =>
                onCambio({ t: telefonos.filter((_, j) => j !== i) as TarjetaBorrador['t'] })
              }
              className="min-h-11 shrink-0 rounded-lg border border-borde-fuerte px-3 text-tinta-suave"
            >
              ×
            </button>
          </div>
        ))}
        {telefonos.length < 3 && (
          <button
            type="button"
            onClick={() =>
              onCambio({ t: [...telefonos, { n: '', e: 'movil' }] as TarjetaBorrador['t'] })
            }
            className="min-h-11 w-full rounded-lg border border-dashed border-borde-fuerte text-sm text-tinta-suave"
          >
            {t('agregarTelefono')}
          </button>
        )}
      </div>

      <CampoTexto
        id="w"
        etiqueta={t('sitioWeb')}
        tipo="url"
        valor={tarjeta.w}
        onCambio={(v) => onCambio({ w: v })}
        // Al SALIR del campo, no al escribir: completar mientras se teclea convertiria la primera
        // letra en `https://j`. El blur ocurre antes del clic en un boton, asi que llega a tiempo.
        onBlur={() => onCambio({ w: completarEsquema(tarjeta.w) })}
        placeholder={t('urlPlaceholder')}
        inputMode="url"
      />
    </Seccion>
  )
}

export function CamposRedes({ tarjeta, onCambio }: { tarjeta: TarjetaBorrador; onCambio: Cambio }) {
  const t = useTranslations('campos')
  const enlaces = tarjeta.l ?? []

  const cambiarEnlace = (i: number, parche: Partial<{ u: string; e: string }>) => {
    onCambio({
      l: enlaces.map((l, j) => (j === i ? { ...l, ...parche } : l)) as TarjetaBorrador['l'],
    })
  }

  return (
    <Seccion titulo={t('redes')}>
      <CampoTexto
        id="li"
        etiqueta={t('linkedin')}
        valor={tarjeta.li}
        onCambio={(v) => onCambio({ li: v })}
        placeholder={t('linkedinPlaceholder')}
      />
      <CampoTexto
        id="ig"
        etiqueta={t('instagram')}
        valor={tarjeta.ig}
        onCambio={(v) => onCambio({ ig: v })}
        placeholder={t('sinArroba')}
      />
      <CampoTexto
        id="tk"
        etiqueta={t('tiktok')}
        valor={tarjeta.tk}
        onCambio={(v) => onCambio({ tk: v })}
        placeholder={t('sinArroba')}
      />
      <CampoTexto
        id="fb"
        etiqueta={t('facebook')}
        valor={tarjeta.fb}
        onCambio={(v) => onCambio({ fb: v })}
      />

      <div className="space-y-2">
        <Etiqueta htmlFor="enlace-0">{t('otrosEnlaces')}</Etiqueta>
        {enlaces.map((enlace, i) => (
          <div key={i} className="flex gap-2">
            <Entrada
              id={`enlace-${i}`}
              name={`enlace-${i}`}
              type="url"
              inputMode="url"
              value={enlace.u}
              onChange={(e) => cambiarEnlace(i, { u: e.target.value })}
              onBlur={() => cambiarEnlace(i, { u: completarEsquema(enlace.u) ?? enlace.u })}
              placeholder={t('urlPlaceholder')}
            />
            <Entrada
              aria-label={t('etiquetaEnlace', { n: i + 1 })}
              name={`enlace-etiqueta-${i}`}
              value={enlace.e}
              onChange={(e) => cambiarEnlace(i, { e: e.target.value })}
              placeholder={t('enlacePlaceholder')}
              className="max-w-[38%]"
            />
            <button
              type="button"
              aria-label={t('quitarEnlace', { n: i + 1 })}
              onClick={() =>
                onCambio({ l: enlaces.filter((_, j) => j !== i) as TarjetaBorrador['l'] })
              }
              className="min-h-11 shrink-0 rounded-lg border border-borde-fuerte px-3 text-tinta-suave"
            >
              ×
            </button>
          </div>
        ))}
        {enlaces.length < 3 && (
          <button
            type="button"
            onClick={() => onCambio({ l: [...enlaces, { u: '', e: '' }] as TarjetaBorrador['l'] })}
            className="min-h-11 w-full rounded-lg border border-dashed border-borde-fuerte text-sm text-tinta-suave"
          >
            {t('agregarEnlace')}
          </button>
        )}
      </div>
    </Seccion>
  )
}

/**
 * Ubicacion y los DOS BLOQUES DE TEXTO (D1b).
 *
 * Los dos llevan **contador de caracteres visible**, no un tope silencioso. La razon no es de
 * formulario: el tope existe para que el codigo QR no baje del pliegue en un telefono chico, y un
 * limite que corta sin avisar se siente como que la app perdio lo que escribiste.
 *
 * El orden en pantalla lo recomendo el lente de conversion: pedir primero "por que te buscan", que
 * es la frase que la gente abandona a medio llenar, y despues "que haces". Aqui el titular va
 * primero porque es la linea grande de la tarjeta, pero el texto de ayuda de cada campo dice cual
 * es cual, que es lo que de verdad guia.
 */
export function CamposDeTexto({
  tarjeta,
  onCambio,
}: {
  tarjeta: TarjetaBorrador
  onCambio: Cambio
}) {
  const t = useTranslations('campos')
  return (
    <Seccion titulo={t('dosFrases')}>
      <div>
        <Etiqueta htmlFor="ti">{t('titular')}</Etiqueta>
        <Entrada
          id="ti"
          name="ti"
          value={tarjeta.ti ?? ''}
          onChange={(e) => onCambio({ ti: e.target.value === '' ? undefined : e.target.value })}
          maxLength={TOPE_TITULAR}
          placeholder={t('titularPlaceholder')}
        />
        <Contador actual={tarjeta.ti?.length ?? 0} tope={TOPE_TITULAR} />
        <p className="mt-1 text-xs text-tinta-suave">{t('titularAyuda')}</p>
      </div>

      <div>
        <Etiqueta htmlFor="de">{t('descripcion')}</Etiqueta>
        <textarea
          id="de"
          name="de"
          rows={3}
          value={tarjeta.de ?? ''}
          onChange={(e) => onCambio({ de: e.target.value === '' ? undefined : e.target.value })}
          maxLength={TOPE_DESCRIPCION}
          placeholder={t('descripcionPlaceholder')}
          className="w-full rounded-lg border border-borde-fuerte p-3 text-base focus:border-acento focus:outline-none"
        />
        <Contador actual={tarjeta.de?.length ?? 0} tope={TOPE_DESCRIPCION} />
        <p className="mt-1 text-xs text-tinta-suave">{t('descripcionAyuda')}</p>
        <AvisoDeCampo>{t('descripcionAviso')}</AvisoDeCampo>
      </div>
    </Seccion>
  )
}

/** El tope es duro por una razon de layout, asi que se muestra en vez de sorprender al usuario. */
function Contador({ actual, tope }: { actual: number; tope: number }) {
  const apretado = actual > tope - 15
  return (
    <p className={'mt-1 text-right text-xs ' + (apretado ? 'text-aviso' : 'text-tinta-suave')}>
      {actual} / {tope}
    </p>
  )
}

export function CampoUbicacion({
  tarjeta,
  onCambio,
}: {
  tarjeta: TarjetaBorrador
  onCambio: Cambio
}) {
  const t = useTranslations('campos')
  return (
    <Seccion titulo={t('ubicacion')}>
      <CampoTexto
        id="d"
        etiqueta={t('ciudad')}
        valor={tarjeta.d}
        onCambio={(v) => onCambio({ d: v })}
        placeholder={t('ciudadPlaceholder')}
        ayuda={<AvisoDeCampo>{t('ciudadAviso')}</AvisoDeCampo>}
      />
    </Seccion>
  )
}
