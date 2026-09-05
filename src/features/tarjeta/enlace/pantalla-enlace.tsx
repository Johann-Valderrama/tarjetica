'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { decodificar, type ResultadoDecodificacion } from '@/features/tarjeta/enlace/codec'
import { QrDeContacto } from '@/features/tarjeta/qr/qr-cliente'
import { VistaTarjeta } from '@/features/tarjeta/vista/tarjeta'

/**
 * La tarjeta que llega por un link compartido (Ola 6).
 *
 * **Esta pantalla la abre un DESCONOCIDO**, en su telefono, probablemente desde adentro de WhatsApp
 * o LinkedIn. No tiene consola donde mirar ni a quien reportarle nada, asi que aqui no puede haber
 * ninguna pantalla en blanco: todo lo que no se pueda leer sale como un mensaje en español.
 *
 * **El payload se lee de `location.hash`, que NO viaja al servidor.** Por eso el contenido no
 * existe hasta que corre el JS del cliente, y por eso el HTML servido no puede contener ni un dato
 * de la tarjeta. Es la propiedad que hace cierta la promesa de privacidad, y hay un assert que la
 * mide en vez de creersela.
 *
 * **Sin foto, siempre.** La foto no viaja en el link (G5), asi que aqui se ve el monograma de
 * iniciales. No es una degradacion: es la invariante funcionando.
 */

type Estado = { fase: 'leyendo' } | { fase: 'listo'; tarjeta: Tarjeta } | { fase: 'fallo'; motivo: string }

const MENSAJES: Record<Exclude<ResultadoDecodificacion, { ok: true }>['motivo'], string> = {
  vacio: 'Este enlace no trae ninguna tarjeta. Puede que se haya cortado al copiarlo.',
  ilegible: 'No se pudo leer esta tarjeta. El enlace parece incompleto o quedó partido al copiarlo.',
  'version-desconocida': 'Este enlace lo creó una versión más nueva de la app y no se puede leer aquí.',
  'datos-invalidos': 'Esta tarjeta llegó con datos que no se pueden mostrar.',
}

export function PantallaEnlace() {
  const [estado, setEstado] = useState<Estado>({ fase: 'leyendo' })

  useEffect(() => {
    let vigente = true

    const leer = async () => {
      // `slice(1)` quita el `#`. Se lee en un efecto y no en el render porque en el servidor no
      // existe `location`, y este dato solo aparece en el cliente por definicion.
      const resultado = await decodificar(window.location.hash.slice(1))
      if (!vigente) return
      setEstado(
        resultado.ok
          ? { fase: 'listo', tarjeta: resultado.tarjeta }
          : { fase: 'fallo', motivo: MENSAJES[resultado.motivo] },
      )
    }

    void leer()
    // Si alguien pega otro enlace en la misma pestaña, el fragmento cambia sin recargar la pagina.
    window.addEventListener('hashchange', leer)
    return () => {
      vigente = false
      window.removeEventListener('hashchange', leer)
    }
  }, [])

  if (estado.fase === 'leyendo') return <Aviso>Abriendo la tarjeta…</Aviso>

  if (estado.fase === 'fallo') {
    return (
      <Aviso>
        {estado.motivo}{' '}
        <Link href="/" className="text-acento underline underline-offset-4">
          Haz la tuya
        </Link>
        .
      </Aviso>
    )
  }

  return <VistaTarjeta tarjeta={estado.tarjeta} qr={<QrDeContacto tarjeta={estado.tarjeta} />} />
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-md p-6">
      <p role="status" data-testid="aviso-enlace" className="text-sm text-tinta-suave">
        {children}
      </p>
    </main>
  )
}
