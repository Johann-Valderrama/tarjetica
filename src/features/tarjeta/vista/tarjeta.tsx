import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { Avatar } from '@/features/tarjeta/vista/avatar'
import { FirmaDeMarca } from '@/features/tarjeta/vista/firma'

/**
 * La tarjeta, en UNA SOLA VISTA (D1b).
 *
 * Johann la pidio "igual" a su tarjeta de `johann-valderrama.zelandia.io`, señalando la pagina:
 * ubicacion arriba, foto con aro, nombre grande, cargo y empresa, un titular, un parrafo, y el
 * codigo QR abajo. Sin selector de modos: el toggle `card`/`qr` de la primera version se elimino.
 *
 * **Que se VE y que se GUARDA son cosas distintas (D3a).** En pantalla van solo el nombre, el cargo,
 * la empresa, los dos bloques de texto y UN telefono. Las redes, la direccion completa, los enlaces
 * y los demas telefonos NO se muestran: viajan dentro del vCard que el QR guarda en la agenda de la
 * otra persona. Literal del encargo: *"Toda la demas informacion viaja en el qr para que quede
 * guardado en la agenda del contacto"*. Ademas de ser lo que aconsejo el lente de conferencia, es lo
 * que le devuelve espacio al QR.
 *
 * **Por que no hay ningun control aqui adentro:** el `.jpeg` de la Ola 5 es una captura de
 * `#tarjeta-capturable`, asi que un boton dentro saldria en la imagen que el usuario regala. Hay un
 * assert que lo vigila, probado por mutacion.
 */

export const ID_CAPTURABLE = 'tarjeta-capturable'

export function VistaTarjeta({
  tarjeta,
  fotoDataUrl,
  qr,
}: {
  tarjeta: Tarjeta
  fotoDataUrl?: string
  /** El codigo QR lo construye la Ola 4. Aqui se le reserva su teja blanca al tamaño final. */
  qr?: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-md p-3">
      <article id={ID_CAPTURABLE} data-capturable className="tarjeta-superficie rounded-tarjeta p-4">
        <Ubicacion ciudad={tarjeta.d} />
        <Encabezado tarjeta={tarjeta} fotoDataUrl={fotoDataUrl} />
        <Discurso tarjeta={tarjeta} />
        <BloqueDelQr tarjeta={tarjeta} qr={qr} />
        <FirmaDeMarca />
      </article>
    </div>
  )
}

/** La linea de arriba con el punto del acento. Sale del campo de direccion, si la persona lo lleno. */
function Ubicacion({ ciudad }: { ciudad?: string }) {
  if (!ciudad) return null
  return (
    <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-acento">
      <span aria-hidden className="inline-block h-2 w-2 shrink-0 rounded-full bg-acento" />
      <span className="min-w-0 truncate">{ciudad}</span>
    </p>
  )
}

function Encabezado({ tarjeta, fotoDataUrl }: { tarjeta: Tarjeta; fotoDataUrl?: string }) {
  return (
    <header className="flex items-center gap-4">
      <Avatar fotoDataUrl={fotoDataUrl} nombre={tarjeta.n} apellido={tarjeta.a} tamano={68} />
      <div className="min-w-0">
        <h1 className="break-words font-display text-[26px] font-extrabold leading-[1.1] text-tinta">
          {[tarjeta.n, tarjeta.a].filter(Boolean).join(' ')}
        </h1>
        {(tarjeta.c || tarjeta.em) && (
          <p className="mt-1 text-sm text-tinta-suave">
            {tarjeta.c}
            {tarjeta.c && tarjeta.em ? ' · ' : ''}
            {tarjeta.em && <span className="font-semibold text-tinta">{tarjeta.em}</span>}
          </p>
        )}
      </div>
    </header>
  )
}

/**
 * Los dos bloques de texto, con DOS candados que hacen lo mismo por vias distintas.
 *
 * El tope de CARACTERES vive en el modelo y evita que alguien escriba de mas. El `line-clamp` de
 * aqui es el piso duro: un tope de caracteres es un PROXY del alto y falla con caracteres anchos
 * (medido: 160 letras "m" seguidas ocupan 7 lineas donde un texto normal ocupa 4, y empujaban el QR
 * 91 px por debajo del pliegue). El clamp cierra esa via, y no es silencioso: recorta con puntos
 * suspensivos, que se ven.
 */
function Discurso({ tarjeta }: { tarjeta: Tarjeta }) {
  if (!tarjeta.ti && !tarjeta.de) return null
  return (
    <section className="mt-5 space-y-2">
      {tarjeta.ti && (
        <p className="line-clamp-2 break-words font-display text-[22px] font-extrabold leading-[1.15] text-tinta">
          {tarjeta.ti}
        </p>
      )}
      {tarjeta.de && <p className="line-clamp-4 break-words text-sm leading-relaxed text-tinta-suave">{tarjeta.de}</p>}
    </section>
  )
}

/**
 * UN solo QR, a ancho completo, sobre teja BLANCA.
 *
 * Lo blanco y el margen no son estetica: el decodificador los necesita para ENCONTRAR el simbolo.
 * Y uno solo, no dos: medido, dos QR se reparten el ancho y caen a 2,39 px por cuadrito, bajo el
 * piso practico de ~2,5; uno solo a ancho completo da 4,66.
 *
 * El telefono queda VISIBLE debajo a proposito: es el respaldo si la camara falla, y es el unico
 * dato de contacto que se muestra en pantalla.
 */
function BloqueDelQr({ tarjeta, qr }: { tarjeta: Tarjeta; qr?: React.ReactNode }) {
  const telefono = tarjeta.t?.[0]

  return (
    <section className="mt-5 space-y-2">
      <p className="text-center text-xs text-tinta-suave">Escanea para guardarme en tus contactos</p>
      {/*
        El QR responde al ALTO disponible, no solo al ancho. MEDIDO: con tamaño fijo a ancho
        completo, en un telefono de 375x667 terminaba 49 px por debajo del pliegue incluso con
        textos cortos, y el gesto central del producto pasaba a exigir scroll. En pantallas altas
        sigue ocupando el ancho completo, que es donde la densidad importa.
      */}
      <div className="mx-auto flex aspect-square w-full max-w-[min(100%,40vh)] items-center justify-center rounded-bloque bg-white p-3">
        {qr ?? (
          <span className="px-6 text-center text-xs text-neutral-500">
            El código QR se construye en la Ola 4 del plan.
          </span>
        )}
      </div>
      {telefono && <p className="text-center text-base tracking-wide text-tinta">{telefono.n}</p>}
    </section>
  )
}
