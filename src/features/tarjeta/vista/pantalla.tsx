'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { esExportable } from '@/features/tarjeta/modelo/tarjeta'
import {
  instantaneaDelServidor,
  instantaneaTarjeta,
  leerFoto,
  leerLogo,
  suscribirAlAlmacen,
} from '@/features/tarjeta/almacenamiento/local'
import { VistaTarjeta } from '@/features/tarjeta/vista/tarjeta'
import { apariencia } from '@/features/tarjeta/vista/apariencia'
import { QrDeContacto } from '@/features/tarjeta/qr/qr-cliente'

/**
 * Cablea la vista de la Ola 3 con lo que guardo el editor de la Ola 2. Mismo patron que el editor:
 * nada se pinta hasta estar en el cliente, para poder sembrar desde `localStorage` en el PRIMER
 * render en vez de hidratar en un efecto.
 */
const sinSuscripcion = () => () => {}

export function PantallaTarjeta() {
  const t = useTranslations('tarjeta')
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
    return <Aviso>{t('abriendo')}</Aviso>
  }

  if (!esExportable(borrador)) {
    return (
      <Aviso>
        {t('sinTarjeta')}{' '}
        <Link href="/editor" className="text-acento underline underline-offset-4">
          {t('crearla')}
        </Link>
        .
      </Aviso>
    )
  }

  // El QR se pasa como hijo y no lo construye la vista: asi la vista sigue siendo una funcion del
  // dato, y la Ola 5 puede capturarla sin arrastrar la logica de generacion del codigo.
  /**
   * Esta pantalla NO lleva ningun control, ni siquiera fuera del elemento capturable.
   *
   * Se intento una barra flotante para guardar la imagen y se descarto MIDIENDO: tapaba el telefono
   * y la firma al pie. Ponerla en el flujo tampoco servia, porque le quitaria unos 60 px al QR, que
   * es justo lo que no sobra (en un iPhone SE con la tarjeta llena el codigo ya va en 2,55 px por
   * cuadrito, sobre el piso de 2,5 pero sin holgura). Esta pantalla existe para extenderle el
   * telefono a otra persona: se queda limpia, y las salidas viven en el editor.
   */
  // El tema envuelve la PAGINA entera, no solo la columna de la tarjeta: en un monitor, una
  // tarjeta clara centrada sobre el fondo oscuro del `body` se veria como una franja con margenes
  // negros a los lados. El `body` sigue oscuro porque `:root` no cambia.
  const { tema, colorMarca } = apariencia(borrador)
  return (
    <div data-tema={tema} className="min-h-dvh bg-fondo">
      <VistaTarjeta
        tarjeta={borrador}
        fotoDataUrl={leerFoto()?.dataUrl}
        logoDataUrl={leerLogo()?.dataUrl}
        qr={<QrDeContacto tarjeta={borrador} />}
        tema={tema}
        colorMarca={colorMarca}
      />
    </div>
  )
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-md p-6">
      <p className="text-sm text-tinta-suave">{children}</p>
    </main>
  )
}
