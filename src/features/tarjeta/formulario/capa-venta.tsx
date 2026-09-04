'use client'

import { useState } from 'react'
import type { CapaVenta, TarjetaBorrador } from '@/features/tarjeta/modelo/tarjeta'
import { Entrada, Etiqueta, Seccion } from '@/features/tarjeta/formulario/campos'

/**
 * Unidad 2b del PRP-TD-001: la capa de venta opcional (D2).
 *
 * Que hace: es lo que convierte la tarjeta de una agenda de contactos en una propuesta. En la
 * tarjeta de Johann son sus KPIs mas una pregunta puente.
 *
 * **Es opcional a proposito:** no todo el mundo va a una conferencia a vender. Por eso arranca
 * plegada y el usuario la abre si la quiere; si no la toca, la clave `s` ni siquiera existe en la
 * tarjeta, y cada clave que no existe es densidad que el QR no gasta.
 */

export function CapaDeVenta({
  tarjeta,
  onCambio,
}: {
  tarjeta: TarjetaBorrador
  onCambio: (parche: Partial<TarjetaBorrador>) => void
}) {
  // Que la seccion este ABIERTA y que tenga DATOS son dos cosas distintas. Si se mezclaran, abrirla
  // obligaria a escribir algo (un espacio en el titular, por ejemplo) solo para que se quede abierta,
  // y ese espacio viajaria dentro del QR.
  const [abierta, setAbierta] = useState(Boolean(tarjeta.s))
  const venta = tarjeta.s
  const cifras = venta?.c ?? []

  const parchear = (parche: Partial<CapaVenta>) => {
    const siguiente = { ...(venta ?? {}), ...parche }
    // Si no queda nada adentro, se quita la clave entera en vez de guardar un objeto vacio.
    const vacia =
      !siguiente.t && !siguiente.p && (!siguiente.c || siguiente.c.length === 0)
    onCambio({ s: vacia ? undefined : siguiente })
  }

  const cambiarCifra = (i: number, parche: Partial<{ v: string; e: string }>) => {
    parchear({ c: cifras.map((c, j) => (j === i ? { ...c, ...parche } : c)) })
  }

  if (!abierta) {
    return (
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className="min-h-11 w-full rounded-lg border border-dashed border-neutral-300 px-4 text-sm text-neutral-600"
      >
        Agregar capa de venta (opcional)
      </button>
    )
  }

  return (
    <Seccion titulo="Capa de venta">
      <p className="text-sm text-neutral-600">
        Opcional. Es lo que convierte la tarjeta en una propuesta, no solo en un contacto.
      </p>

      <div>
        <Etiqueta htmlFor="s-t">Titular de una línea</Etiqueta>
        <Entrada
          id="s-t"
          name="s-t"
          value={venta?.t ?? ''}
          onChange={(e) => parchear({ t: e.target.value === '' ? undefined : e.target.value })}
          placeholder="Menos papel, más eficiencia"
          maxLength={80}
        />
      </div>

      <div className="space-y-2">
        <Etiqueta htmlFor="s-c-0">Cifras (hasta 3)</Etiqueta>
        {cifras.map((cifra, i) => (
          <div key={i} className="flex gap-2">
            <Entrada
              id={`s-c-${i}`}
              name={`s-c-${i}`}
              value={cifra.v}
              onChange={(e) => cambiarCifra(i, { v: e.target.value })}
              placeholder="83%"
              maxLength={12}
              className="max-w-[34%]"
            />
            <Entrada
              aria-label={`Etiqueta de la cifra ${i + 1}`}
              name={`s-c-etiqueta-${i}`}
              value={cifra.e}
              onChange={(e) => cambiarCifra(i, { e: e.target.value })}
              placeholder="de ahorro en horas"
              maxLength={30}
            />
            <button
              type="button"
              aria-label={`Quitar la cifra ${i + 1}`}
              onClick={() => parchear({ c: cifras.filter((_, j) => j !== i) })}
              className="min-h-11 shrink-0 rounded-lg border border-neutral-300 px-3 text-neutral-600"
            >
              ×
            </button>
          </div>
        ))}
        {cifras.length < 3 && (
          <button
            type="button"
            onClick={() => parchear({ c: [...cifras, { v: '', e: '' }] })}
            className="min-h-11 w-full rounded-lg border border-dashed border-neutral-300 text-sm text-neutral-600"
          >
            Agregar cifra
          </button>
        )}
      </div>

      <div>
        <Etiqueta htmlFor="s-p">Pregunta de cierre</Etiqueta>
        <Entrada
          id="s-p"
          name="s-p"
          value={venta?.p ?? ''}
          onChange={(e) => parchear({ p: e.target.value === '' ? undefined : e.target.value })}
          placeholder="¿Cuánto tiempo pierdes retipeando contactos?"
          maxLength={120}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          setAbierta(false)
          onCambio({ s: undefined })
        }}
        className="min-h-11 text-sm text-neutral-600 underline"
      >
        Quitar la capa de venta
      </button>
    </Seccion>
  )
}
