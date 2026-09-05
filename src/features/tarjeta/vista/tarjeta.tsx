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
  dimension,
}: {
  tarjeta: Tarjeta
  fotoDataUrl?: string
  /** El codigo QR. Se pasa como hijo para que la vista siga siendo una funcion del dato. */
  qr?: React.ReactNode
  /**
   * ANCHO fijo en pixeles. Solo lo usa el montaje fuera de pantalla del que sale el `.jpeg`
   * (Ola 5), para que la imagen exportada mida siempre lo mismo y no dependa de la ventana de quien
   * la genera: en un monitor, `100dvh` daria una tarjeta larguisima que en un telefono se ve rara.
   *
   * **Se fija el ancho y NO el alto, a proposito.** Una PANTALLA tiene un alto que hay que respetar,
   * y por eso ahi el QR absorbe la holgura. Una IMAGEN no tiene viewport: forzarle un alto de
   * telefono deja huecos vacios arriba y abajo del codigo cuando el texto es corto (medido: 160 px
   * de vacio con el perfil de Johann a 390x844). Con el alto segun contenido, la tarjeta mide lo
   * que mide y no le sobra nada.
   */
  dimension?: { ancho: number }
}) {
  const paraImagen = dimension !== undefined
  return (
    <div
      className="mx-auto flex w-full max-w-md flex-col overflow-hidden p-3"
      style={dimension ? { width: dimension.ancho, maxWidth: 'none' } : { height: '100dvh' }}
    >
      <article id={ID_CAPTURABLE} data-capturable className="tarjeta-superficie flex min-h-0 flex-1 flex-col overflow-hidden rounded-tarjeta p-4">
        <Ubicacion ciudad={tarjeta.d} />
        <Encabezado tarjeta={tarjeta} fotoDataUrl={fotoDataUrl} />
        <Discurso tarjeta={tarjeta} />
        <BloqueDelQr tarjeta={tarjeta} qr={qr} paraImagen={paraImagen} />
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
    <section className="mt-4 space-y-2">
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
function BloqueDelQr({
  tarjeta,
  qr,
  paraImagen,
}: {
  tarjeta: Tarjeta
  qr?: React.ReactNode
  /** En una imagen no hay alto que respetar: el codigo se dimensiona solo por el ancho. */
  paraImagen: boolean
}) {
  const telefono = tarjeta.t?.[0]

  return (
    <section className={`mt-4 flex flex-col gap-1 ${paraImagen ? '' : 'min-h-0 flex-1 justify-center'}`}>
      <p className="text-center text-xs text-tinta-suave">Escanea para guardarme en tus contactos</p>
      {/*
        **La tarjeta cabe en UNA SOLA VISUAL por construccion, no por calibracion.** Es el requisito
        que Johann marco como principal y no negociable, asi que no puede depender de que los topes
        de caracteres esten bien ajustados: el QR ABSORBE la holgura y es un cuadrado del alto que
        sobre, sea el que sea. Si el texto crece, el QR se encoge; nunca aparece scroll.

        Se mide contra `100dvh` y no `100vh` a proposito: en un telefono real la barra del navegador
        se come ~90 px que `vh` ignora, asi que con `vh` la tarjeta "cabe" en la medicion y se sale
        en la mano del usuario.

        El limite de este mecanismo esta en la densidad, no en el layout: por debajo de unos 243 px
        de codigo, un vCard completo cae bajo el piso de lectura de 2,5 px por cuadrito. Lo vigila
        `scripts/medir-densidad-qr.mjs`.

        La teja se dimensiona con `flex-1` y NO con `h-full` (arreglado en la Ola 4, con el QR real
        adentro). Con `h-full` la teja valia el alto ENTERO de la seccion, asi que el telefono de
        abajo y la firma se salian y quedaban uno encima del otro: se veia en la captura y ningun
        assert lo delataba, porque no habia scroll y el QR seguia siendo grande. Con `flex-1` la
        teja se queda con lo que sobra despues del texto, que es lo que siempre se quiso decir.
      */}
      {/*
        La teja es un CUADRADO del lado menor entre lo ancho y lo alto que queda. Se resuelve con
        container queries (`min(100cqw, 100cqh)`) y no con `aspect-square`, que aqui no alcanza: con
        `h-full` la teja valia el alto entero y el pie se salia; con `aspect-square` mas `max-w-full`
        el navegador recorta el ancho y NO recalcula el alto, asi que en un telefono alto quedaba de
        356x533 con 177 px de blanco sobrante arriba y abajo. `min()` de las dos medidas del
        contenedor es la unica forma de decir "el lado que quepa por los dos ejes".
      */}
      <div
        className={
          paraImagen
            ? 'flex items-center justify-center'
            : 'flex min-h-0 flex-1 items-center justify-center [container-type:size]'
        }
      >
        <div
          className={`flex items-center justify-center rounded-bloque bg-white p-2 ${
            paraImagen ? 'aspect-square w-full' : 'h-[min(100cqw,100cqh)] w-[min(100cqw,100cqh)]'
          }`}
        >
        {qr ?? (
          <span className="px-6 text-center text-xs text-neutral-500">
            El código QR se construye en la Ola 4 del plan.
          </span>
        )}
        </div>
      </div>
      {telefono && <p className="text-center text-base tracking-wide text-tinta">{telefono.n}</p>}
    </section>
  )
}
