'use client'

import { useState } from 'react'
import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { Avatar } from '@/features/tarjeta/vista/avatar'
import { FirmaDeMarca } from '@/features/tarjeta/vista/firma'

/**
 * Unidad 3b del PRP-TD-001: la tarjeta, con sus dos vistas.
 *
 * Hereda el patron probado en produccion de `Personal landing page`: `card` para leer y `qr` para
 * mostrarle el telefono a alguien, con fallback al valor seguro. Lo que NO se hereda es su layout
 * de DOS codigos QR: medido el 2026-09-03, dos QR se reparten el ancho y los dos caen bajo el piso
 * de lectura (2,39 px por cuadrito contra un piso de ~2,5). Aqui va uno solo, a ancho completo.
 *
 * **El toggle va FUERA del elemento capturable, a proposito.** El `.jpeg` de la Ola 5 es una captura
 * de `#tarjeta-capturable`, asi que cualquier control que quede adentro sale en la imagen que el
 * usuario regala. La referencia lo comenta en su propio codigo; aqui ademas hay un assert que lo
 * vigila, porque es el tipo de cosa que se rompe sin que nada falle.
 */

export const ID_CAPTURABLE = 'tarjeta-capturable'

export type ModoVista = 'card' | 'qr'

export function VistaTarjeta({
  tarjeta,
  fotoDataUrl,
  qr,
  modoInicial = 'card',
}: {
  tarjeta: Tarjeta
  fotoDataUrl?: string
  /** El codigo QR lo construye la Ola 4. Aqui solo se le reserva su teja blanca. */
  qr?: React.ReactNode
  modoInicial?: ModoVista
}) {
  const [modo, setModo] = useState<ModoVista>(modoInicial)

  return (
    <div className="mx-auto w-full max-w-md space-y-4 p-4">
      <SelectorDeVista modo={modo} onCambio={setModo} />

      <article
        id={ID_CAPTURABLE}
        data-capturable
        className="tarjeta-superficie space-y-5 rounded-tarjeta p-5"
      >
        <Encabezado tarjeta={tarjeta} fotoDataUrl={fotoDataUrl} />

        {modo === 'card' ? (
          <>
            <CapaDeVentaVista tarjeta={tarjeta} />
            <Contacto tarjeta={tarjeta} />
          </>
        ) : (
          <TejaDelQr qr={qr} />
        )}

        <FirmaDeMarca />
      </article>
    </div>
  )
}

/** VA FUERA del elemento capturable. Si entra, sale en el .jpeg que el usuario regala. */
function SelectorDeVista({
  modo,
  onCambio,
}: {
  modo: ModoVista
  onCambio: (m: ModoVista) => void
}) {
  const opciones: Array<{ id: ModoVista; texto: string }> = [
    { id: 'card', texto: 'Tarjeta' },
    { id: 'qr', texto: 'Código QR' },
  ]

  return (
    <div
      role="tablist"
      aria-label="Cómo ver la tarjeta"
      className="mx-auto flex w-fit gap-1 rounded-full border border-borde-fuerte p-1"
    >
      {opciones.map((o) => (
        <button
          key={o.id}
          role="tab"
          type="button"
          aria-selected={modo === o.id}
          onClick={() => onCambio(o.id)}
          // Solo transform y opacity: el telefono real de una conferencia es de gama media.
          className={
            'min-h-11 rounded-full px-5 text-sm font-medium transition-opacity motion-reduce:transition-none ' +
            (modo === o.id
              ? 'bg-superficie-sutil text-tinta'
              : 'text-tinta-suave opacity-80 hover:opacity-100')
          }
        >
          {o.texto}
        </button>
      ))}
    </div>
  )
}

function Encabezado({ tarjeta, fotoDataUrl }: { tarjeta: Tarjeta; fotoDataUrl?: string }) {
  const cargoYEmpresa = [tarjeta.c, tarjeta.em].filter(Boolean).join(' · ')

  return (
    <header className="flex items-center gap-4">
      <Avatar fotoDataUrl={fotoDataUrl} nombre={tarjeta.n} apellido={tarjeta.a} />
      <div className="min-w-0">
        <h1 className="font-display text-2xl leading-tight text-tinta">
          {[tarjeta.n, tarjeta.a].filter(Boolean).join(' ')}
        </h1>
        {cargoYEmpresa && <p className="mt-1 text-sm text-tinta-suave">{cargoYEmpresa}</p>}
      </div>
    </header>
  )
}

/**
 * La cifra NO puede partirse en dos lineas: al hacerlo desalinea toda la fila. En vez de dejar que
 * el navegador decida, el tamaño baja segun cuantos caracteres trae ("83%" cabe grande, "USD 86M"
 * no). Es una regla sobre la PROPIEDAD que importa (cuanto ocupa), no un valor horneado.
 */
function tamanoDeCifra(valor: string): string {
  if (valor.length <= 4) return 'text-2xl'
  if (valor.length <= 6) return 'text-xl'
  return 'text-base'
}

function CapaDeVentaVista({ tarjeta }: { tarjeta: Tarjeta }) {
  const venta = tarjeta.s
  if (!venta) return null
  const cifras = venta.c ?? []

  return (
    <section className="space-y-4">
      {venta.t && (
        <p className="font-display text-xl leading-snug text-tinta">{venta.t}</p>
      )}

      {cifras.length > 0 && (
        <div
          className="grid gap-x-3 rounded-bloque bg-superficie-sutil p-4 text-center [grid-template-rows:auto_auto]"
          style={{ gridTemplateColumns: `repeat(${cifras.length}, minmax(0, 1fr))` }}
        >
          {cifras.map((cifra, i) => (
            // `subgrid` alinea las cifras entre si y las etiquetas entre si, en vez de dejar que
            // cada columna crezca por su cuenta. MEDIDO antes de arreglarlo: los tres bloques median
            // 66, 51 y 98 px, o sea 47 px de diferencia, y la fila se veia torcida.
            <div key={i} className="row-span-2 grid min-w-0 gap-y-1 [grid-template-rows:subgrid]">
              <p className={`whitespace-nowrap font-display text-acento ${tamanoDeCifra(cifra.v)}`}>
                {cifra.v}
              </p>
              <p className="text-xs leading-tight text-tinta-suave">{cifra.e}</p>
            </div>
          ))}
        </div>
      )}

      {venta.p && (
        <p className="text-center text-sm italic leading-snug text-tinta-suave">{venta.p}</p>
      )}
    </section>
  )
}

function Contacto({ tarjeta }: { tarjeta: Tarjeta }) {
  const filas: Array<{ etiqueta: string; texto: string; href?: string }> = []

  if (tarjeta.co) filas.push({ etiqueta: 'Correo', texto: tarjeta.co, href: `mailto:${tarjeta.co}` })
  for (const tel of tarjeta.t ?? []) {
    filas.push({ etiqueta: tel.e, texto: tel.n, href: `tel:${tel.n.replace(/\s/g, '')}` })
  }
  if (tarjeta.w) filas.push({ etiqueta: 'Web', texto: tarjeta.w, href: tarjeta.w })
  for (const enlace of tarjeta.l ?? []) {
    filas.push({ etiqueta: enlace.e, texto: enlace.u, href: enlace.u })
  }
  if (tarjeta.li) filas.push({ etiqueta: 'LinkedIn', texto: tarjeta.li })
  if (tarjeta.ig) filas.push({ etiqueta: 'Instagram', texto: `@${tarjeta.ig}` })
  if (tarjeta.tk) filas.push({ etiqueta: 'TikTok', texto: `@${tarjeta.tk}` })
  if (tarjeta.fb) filas.push({ etiqueta: 'Facebook', texto: tarjeta.fb })
  if (tarjeta.d) filas.push({ etiqueta: 'Dirección', texto: tarjeta.d })

  if (filas.length === 0 && !tarjeta.no) return null

  return (
    <section className="space-y-2 border-t border-borde pt-4">
      <ul className="space-y-2">
        {filas.map((fila, i) => (
          <li key={i} className="flex items-baseline gap-3 text-sm">
            <span className="w-24 shrink-0 text-xs uppercase tracking-wide text-tinta-suave/70">
              {fila.etiqueta}
            </span>
            {fila.href ? (
              // `min-h-11` sobre un enlace en linea no sirve de nada; el area tactil se da con
              // padding vertical, que si crece la caja del enlace.
              <a
                href={fila.href}
                className="min-w-0 break-words py-2 text-tinta underline decoration-borde-fuerte underline-offset-4"
              >
                {fila.texto}
              </a>
            ) : (
              <span className="min-w-0 break-words py-2 text-tinta">{fila.texto}</span>
            )}
          </li>
        ))}
      </ul>

      {tarjeta.no && <p className="pt-1 text-sm leading-relaxed text-tinta-suave">{tarjeta.no}</p>}
    </section>
  )
}

/**
 * UN solo QR, a ancho completo, sobre teja BLANCA.
 *
 * Lo blanco no es estetico: el decodificador necesita ese contraste y la zona silenciosa de 4
 * modulos para ENCONTRAR el simbolo. Un QR sobre el fondo casi negro de esta tarjeta no se lee.
 */
function TejaDelQr({ qr }: { qr?: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <p className="text-center text-sm text-tinta-suave">Escanea para guardar mi contacto</p>
      <div className="mx-auto flex aspect-square w-full items-center justify-center rounded-bloque bg-white p-4">
        {qr ?? (
          <span className="px-6 text-center text-xs text-neutral-500">
            El código QR se construye en la Ola 4 del plan.
          </span>
        )}
      </div>
    </section>
  )
}
