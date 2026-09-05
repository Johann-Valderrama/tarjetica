'use client'

import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { QrDeContacto } from '@/features/tarjeta/qr/qr-cliente'
import { VistaTarjeta } from '@/features/tarjeta/vista/tarjeta'

/**
 * La tarjeta montada FUERA DE PANTALLA, que es de donde sale el `.jpeg` (Ola 5).
 *
 * **Por que no se captura la pantalla de la tarjeta directamente**, que seria lo obvio:
 *
 * 1. Esa pantalla mide `100dvh`. En el monitor de un escritorio la imagen saldria larguisima y en
 *    un telefono se veria rara. Aqui el tamaño es FIJO (390x844, un telefono corriente), asi que la
 *    imagen que se regala mide siempre lo mismo, la genere quien la genere.
 * 2. La puerta de exportacion (la confirmacion de "esta tarjeta es mia") vive en el editor. Exportar
 *    desde aqui la deja donde estaba, sin tener que duplicar el gate en la otra pantalla.
 * 3. La pantalla de la tarjeta se queda LIMPIA, sin un solo control. Se probo una barra flotante
 *    para guardar y se descarto midiendo: tapaba el telefono y la firma; ponerla en el flujo le
 *    quitaba unos 60 px al QR, que en un iPhone SE ya va sin holgura.
 *
 * ⚠️ **`left: -10000px` y NO `display: none`, ni `visibility: hidden`, ni `hidden`.** Un elemento
 * que no se pinta no tiene dimensiones, asi que la captura saldria vacia o de 0x0 y sin ningun
 * error. Tiene que estar renderizado de verdad, solo que donde nadie lo ve.
 *
 * `aria-hidden` + `inert` para que no exista para un lector de pantalla ni para el tabulador: es un
 * duplicado de la tarjeta, y un lector leeria todo dos veces.
 */

/**
 * El ANCHO de un telefono corriente. La imagen sale a tres veces esto: 1170 px de ancho.
 *
 * Sin alto: la tarjeta mide lo que su contenido pida. Forzarle un alto de telefono le dejaba huecos
 * vacios arriba y abajo del codigo cuando el texto era corto (medido: 160 px con el perfil de
 * Johann). Una pantalla tiene alto que respetar; una imagen no.
 */
export const DIMENSION_DE_EXPORTACION = { ancho: 390 } as const

export function LienzoOculto({ tarjeta, fotoDataUrl }: { tarjeta: Tarjeta; fotoDataUrl?: string }) {
  return (
    <div
      aria-hidden
      inert
      data-testid="lienzo-oculto"
      style={{
        position: 'fixed',
        top: 0,
        left: -10_000,
        // Sin `pointer-events: none` un clic a ciegas podria caer aqui; y sin `overflow` visible
        // el navegador no le crea barras de desplazamiento al documento.
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <VistaTarjeta
        tarjeta={tarjeta}
        fotoDataUrl={fotoDataUrl}
        qr={<QrDeContacto tarjeta={tarjeta} />}
        dimension={DIMENSION_DE_EXPORTACION}
      />
    </div>
  )
}
