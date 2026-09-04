'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { esExportable } from '@/features/tarjeta/modelo/tarjeta'
import {
  instantaneaDelServidor,
  instantaneaTarjeta,
  leerFoto,
  suscribirAlAlmacen,
} from '@/features/tarjeta/almacenamiento/local'
import { VistaTarjeta } from '@/features/tarjeta/vista/tarjeta'

/**
 * Cablea la vista de la Ola 3 con lo que guardo el editor de la Ola 2. Mismo patron que el editor:
 * nada se pinta hasta estar en el cliente, para poder sembrar desde `localStorage` en el PRIMER
 * render en vez de hidratar en un efecto.
 */
const sinSuscripcion = () => () => {}

export function PantallaTarjeta() {
  const enCliente = useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  )
  const borrador = useSyncExternalStore(
    suscribirAlAlmacen,
    instantaneaTarjeta,
    instantaneaDelServidor,
  )

  if (!enCliente) {
    return <Aviso>Abriendo tu tarjeta…</Aviso>
  }

  if (!esExportable(borrador)) {
    return (
      <Aviso>
        Todavía no hay una tarjeta en este dispositivo.{' '}
        <Link href="/editor" className="text-acento underline underline-offset-4">
          Créala en el editor
        </Link>
        .
      </Aviso>
    )
  }

  return <VistaTarjeta tarjeta={borrador} fotoDataUrl={leerFoto()?.dataUrl} />
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-md p-6">
      <p className="text-sm text-tinta-suave">{children}</p>
    </main>
  )
}
