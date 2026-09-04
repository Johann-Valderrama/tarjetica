'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  BORRADOR_VACIO,
  esExportable,
  type FotoLocal,
  type TarjetaBorrador,
} from '@/features/tarjeta/modelo/tarjeta'
import {
  borrarFoto,
  borrarTodo,
  instantaneaDelServidor,
  instantaneaTarjeta,
  suscribirAlAlmacen,
  guardarFoto,
  guardarTarjeta,
  leerFoto,
} from '@/features/tarjeta/almacenamiento/local'
import { iniciales, prepararFoto } from '@/features/tarjeta/foto/cargar'
import {
  CamposContacto,
  CamposDeTexto,
  CamposIdentidad,
  CamposRedes,
  CampoUbicacion,
  Etiqueta,
} from '@/features/tarjeta/formulario/campos'
import {
  AvisoDeAlcance,
  BotonBorrarTodo,
  ConfirmacionDeExportacion,
  LimitesDelProducto,
  puedeExportar,
} from '@/features/tarjeta/formulario/avisos'

/**
 * Unidad 2c del PRP-TD-001: el editor, donde las piezas se conectan.
 *
 * Es la unidad donde el error seria SILENCIOSO: un autosave que no guarda se ve exactamente igual
 * que uno que si, hasta que el usuario vuelve al dia siguiente y su tarjeta no esta. Por eso la
 * verificacion de esta unidad no es "correr la app", es un E2E sobre el build de produccion que
 * escribe, recarga y comprueba que los datos siguen ahi.
 */

const RETARDO_AUTOSAVE_MS = 400

type EstadoGuardado = 'inicial' | 'guardando' | 'guardado' | 'fallo'

/** Suscripcion vacia: lo unico que cambia entre servidor y cliente es DONDE corre, no un dato. */
const sinSuscripcion = () => () => {}

/**
 * El editor no se pinta hasta estar en el cliente.
 *
 * Es lo que permite sembrar el estado con lo que hay en `localStorage` en el PRIMER render, sin
 * hidratarlo despues en un efecto. La diferencia no es de estilo: hidratar en un efecto dispara
 * `react-hooks/set-state-in-effect` de React 19 porque encadena renders, y ademas abre la ventana en
 * la que el primer autosave puede pisar con un borrador vacio lo que el usuario ya tenia guardado.
 */
export function Editor() {
  const enCliente = useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  )
  const persistida = useSyncExternalStore(
    suscribirAlAlmacen,
    instantaneaTarjeta,
    instantaneaDelServidor,
  )

  if (!enCliente) {
    return (
      <main className="mx-auto w-full max-w-xl p-4">
        <p className="text-sm text-neutral-600">Abriendo tu tarjeta…</p>
      </main>
    )
  }

  return <EditorHidratado inicial={persistida} />
}

function EditorHidratado({ inicial }: { inicial: TarjetaBorrador }) {
  const [tarjeta, setTarjeta] = useState<TarjetaBorrador>(inicial)
  const [foto, setFoto] = useState<FotoLocal | null>(() => leerFoto())
  const [confirmado, setConfirmado] = useState(false)
  const [guardado, setGuardado] = useState<EstadoGuardado>('inicial')
  const [avisoFoto, setAvisoFoto] = useState<string | null>(null)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  // El autosave: solo ESCRIBE, no toca estado de React de forma sincrona. El "Guardando..." lo
  // pone el manejador del cambio, que es donde de verdad ocurre.
  useEffect(() => {
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => {
      setGuardado(guardarTarjeta(tarjeta) ? 'guardado' : 'fallo')
    }, RETARDO_AUTOSAVE_MS)
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    }
  }, [tarjeta])

  const cambiar = (parche: Partial<TarjetaBorrador>) => {
    setGuardado('guardando')
    setTarjeta((previa) => ({ ...previa, ...parche }))
  }

  const alElegirFoto = async (archivo: File | undefined) => {
    if (!archivo) return
    setAvisoFoto(null)
    const resultado = await prepararFoto(archivo)
    if (!resultado.ok) {
      setAvisoFoto(
        resultado.motivo === 'tipo-no-soportado'
          ? 'Ese archivo no parece una imagen.'
          : 'No se pudo procesar la imagen. Prueba con otra.',
      )
      return
    }
    if (!guardarFoto(resultado.foto)) {
      setAvisoFoto('No se pudo guardar la foto en este navegador.')
      return
    }
    setFoto(resultado.foto)
  }

  const alBorrar = () => {
    borrarTodo()
    setTarjeta(BORRADOR_VACIO)
    setFoto(null)
    setConfirmado(false)
    setGuardado('inicial')
  }

  const listaParaExportar = esExportable(tarjeta) && puedeExportar(confirmado)

  return (
    <main className="mx-auto w-full max-w-xl space-y-6 p-4 pb-24">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-neutral-900">Tu tarjeta</h1>
        <p className="text-sm text-neutral-600">
          Se guarda sola en este dispositivo, mientras escribes.
        </p>
      </header>

      <AvisoDeAlcance />

      <section className="space-y-3">
        <Etiqueta htmlFor="foto">Foto</Etiqueta>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-xl font-semibold text-neutral-600">
            {foto ? (
              /* Un data: URL local, no una imagen remota: next/image no aporta nada aqui y
                 anadiria una peticion, que es justo lo que el candado de cero dominios ajenos evita. */
              // eslint-disable-next-line @next/next/no-img-element
              <img src={foto.dataUrl} alt="Tu foto de perfil" className="h-full w-full object-cover" />
            ) : (
              <span data-testid="monograma">{iniciales(tarjeta.n, tarjeta.a)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <input
              id="foto"
              name="foto"
              type="file"
              accept="image/*"
              onChange={(e) => void alElegirFoto(e.target.files?.[0])}
              // El input de archivo nativo mide 26 px de alto, por debajo del piso tactil de 44.
              // Se le da altura al BOTON interno, que es lo que el dedo toca de verdad.
              className="block w-full text-sm file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-lg file:border file:border-neutral-300 file:bg-white file:px-4 file:text-sm file:font-medium"
            />
            <p className="mt-1 text-xs text-neutral-600">
              Se achica y se le quitan los metadatos antes de guardarla. Nunca viaja dentro del
              código QR ni del enlace.
            </p>
            {foto && (
              <button
                type="button"
                onClick={() => {
                  setFoto(null)
                  borrarFoto()
                }}
                className="mt-1 min-h-11 text-sm text-neutral-600 underline"
              >
                Quitar la foto
              </button>
            )}
          </div>
        </div>
        {avisoFoto && (
          <p role="alert" className="text-sm text-red-700">
            {avisoFoto}
          </p>
        )}
      </section>

      <CamposIdentidad tarjeta={tarjeta} onCambio={cambiar} />
      <CamposDeTexto tarjeta={tarjeta} onCambio={cambiar} />
      <CamposContacto tarjeta={tarjeta} onCambio={cambiar} />
      {/* Las redes y los enlaces NO se ven en la tarjeta (D3a): viajan dentro del vCard del QR. */}
      <CamposRedes tarjeta={tarjeta} onCambio={cambiar} />
      <CampoUbicacion tarjeta={tarjeta} onCambio={cambiar} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Compartir</h2>
        <ConfirmacionDeExportacion confirmado={confirmado} onCambio={setConfirmado} />
        <div className="grid gap-2">
          <button
            type="button"
            data-testid="exportar-jpeg"
            disabled={!listaParaExportar}
            className="min-h-11 rounded-lg bg-neutral-900 px-4 font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            Guardar como imagen
          </button>
          <button
            type="button"
            data-testid="mostrar-qr"
            disabled={!listaParaExportar}
            className="min-h-11 rounded-lg border border-neutral-900 px-4 font-medium text-neutral-900 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400"
          >
            Mostrar código QR
          </button>
        </div>
        {!esExportable(tarjeta) && (
          <p className="text-sm text-neutral-600">Escribe al menos tu nombre para poder compartir.</p>
        )}
        {esExportable(tarjeta) && !confirmado && (
          <p className="text-sm text-neutral-600">
            Marca la confirmación de arriba para poder compartir.
          </p>
        )}
        <p className="text-xs text-neutral-500">
          Estos dos botones se construyen en las siguientes olas del plan; hoy solo se comprueba que
          la confirmación los habilite.
        </p>
      </section>

      <LimitesDelProducto />

      <section className="space-y-2">
        <BotonBorrarTodo onBorrar={alBorrar} />
        <p aria-live="polite" data-testid="estado-guardado" className="text-center text-xs text-neutral-500">
          {guardado === 'guardando' && 'Guardando…'}
          {guardado === 'guardado' && 'Guardado en este dispositivo'}
          {guardado === 'fallo' && 'No se pudo guardar en este navegador'}
        </p>
      </section>
    </main>
  )
}

