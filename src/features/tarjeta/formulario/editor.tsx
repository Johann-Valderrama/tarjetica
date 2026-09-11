'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  BORRADOR_VACIO,
  campoQueImpideExportar,
  esExportable,
  normalizarDirecciones,
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
  guardarConfirmacion,
  leerConfirmacion,
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
import { descargarVCard } from '@/features/tarjeta/vcard/descargar'
import { dataUrlABlob, nombreDeImagen, tarjetaAJpeg } from '@/features/tarjeta/exportar/a-imagen'
import { guardarImagen } from '@/features/tarjeta/exportar/guardar'
import { LienzoOculto } from '@/features/tarjeta/exportar/lienzo-oculto'
import { GenerarEnlace } from '@/features/tarjeta/enlace/generar-enlace'
import { avisoDeDensidad, medirDensidad } from '@/features/tarjeta/qr/densidad'
import {
  AvisoDeAlcance,
  BotonBorrarTodo,
  ConfirmacionDeExportacion,
  LimitesDelProducto,
  puedeExportar,
} from '@/features/tarjeta/formulario/avisos'
import { BotonDeSalida } from '@/features/tarjeta/formulario/boton-de-salida'
import { PingDeTarjetaCreada } from '@/features/metricas/ping-de-tarjeta-creada'
import { SelectorDeIdioma } from '@/shared/idioma/selector-idioma'

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
  const t = useTranslations('editor')
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
        <p className="text-sm text-tinta-suave">{t('abriendo')}</p>
      </main>
    )
  }

  return <EditorHidratado inicial={persistida} />
}

function EditorHidratado({ inicial }: { inicial: TarjetaBorrador }) {
  const t = useTranslations()
  const tCampos = useTranslations('campos')
  const router = useRouter()
  // Se normaliza AL CARGAR, no solo al editar: una tarjeta guardada antes del arreglo (con la web
  // escrita como `midominio.com`) seguiria bloqueada hasta que la persona tocara ese campo, sin
  // ninguna pista de que es ese el que falla.
  const [tarjeta, setTarjeta] = useState<TarjetaBorrador>(() => normalizarDirecciones(inicial))
  const [foto, setFoto] = useState<FotoLocal | null>(() => leerFoto())
  // Se siembra de lo guardado: la puerta de exportacion vive en dos pantallas (el `.vcf` aqui,
  // el `.jpeg` en la vista de la tarjeta), asi que la confirmacion tiene que sobrevivir al salto.
  const [confirmado, setConfirmado] = useState(() => leerConfirmacion())
  const [guardado, setGuardado] = useState<EstadoGuardado>('inicial')
  const [avisoFoto, setAvisoFoto] = useState<string | null>(null)
  const [avisoDescarga, setAvisoDescarga] = useState<string | null>(null)
  const [exportando, setExportando] = useState(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const confirmacion = useRef<HTMLDivElement | null>(null)

  /**
   * Que pasa cuando alguien pulsa un boton que todavia no puede usar.
   *
   * En vez de no hacer nada (que es lo que hacia un `disabled` a secas), lleva la vista a lo que
   * falta, lo resalta un momento y le pone el foco al propio control. Las tres cosas juntas: el
   * scroll para que se vea, el resalte para que se note cual de todo, y el foco para que quien
   * navegue con teclado quede parado justo ahi.
   *
   * La clase del resalte se quita sola: si se quedara puesta, el segundo intento no animaria nada
   * y el usuario pensaria que el boton ya ni responde.
   */
  const senalarLoQueFalta = () => {
    /*
      Primero la TARJETA, despues la confirmacion: marcar la casilla no sirve de nada si un campo no
      pasa la validacion. Antes esta funcion llevaba SIEMPRE a la casilla, y con la casilla ya
      marcada y la web sin `https://` mandaba a la persona a mirar justo lo que estaba bien
      (2026-09-11, reportado por Johann en produccion).
    */
    const falla = campoQueImpideExportar(tarjeta)
    const destino = falla
      ? document.getElementById(idDelCampo(falla.campo, falla.indice))
      : confirmacion.current
    if (!destino) return
    destino.scrollIntoView({ behavior: 'smooth', block: 'center' })
    destino.classList.remove('reclamando')
    // Forzar un reflujo reinicia la animacion cuando se pulsa dos veces seguidas. Sin esto, el
    // segundo intento no parpadea y se lee como que el boton dejo de responder.
    void destino.offsetWidth
    destino.classList.add('reclamando')
    const control = destino instanceof HTMLInputElement ? destino : destino.querySelector('input, textarea, select')
    ;(control as HTMLElement | null)?.focus({ preventScroll: true })
  }

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

  /**
   * El borde rojo se apaga cuando la persona MARCA la casilla, no a los N segundos.
   *
   * Un temporizador apagaria la señal mientras alguien todavia la esta buscando, y el punto de que
   * el borde se quede encendido es justo ese: sigue diciendo "es aqui" hasta que se actua. Va en un
   * efecto y no en el manejador del checkbox porque la confirmacion tambien puede cambiar por otra
   * via (el boton de borrar todo la desmarca).
   */
  useEffect(() => {
    if (confirmado) confirmacion.current?.classList.remove('reclamando')
  }, [confirmado])

  // Lo mismo para un CAMPO resaltado: su borde rojo se apaga cuando la tarjeta ya pasa, o sea
  // cuando la persona arreglo lo que faltaba, no por tiempo.
  const exportable = esExportable(tarjeta)
  useEffect(() => {
    if (!exportable) return
    document.querySelectorAll('.reclamando').forEach((el) => {
      if (el !== confirmacion.current) el.classList.remove('reclamando')
    })
  }, [exportable])

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
          ? t('editor.fotoTipoNoSoportado')
          : t('editor.fotoFallo'),
      )
      return
    }
    if (!guardarFoto(resultado.foto)) {
      setAvisoFoto(t('editor.fotoNoGuardada'))
      return
    }
    setFoto(resultado.foto)
  }

  const alBorrar = () => {
    borrarTodo()
    setTarjeta(BORRADOR_VACIO)
    setFoto(null)
    setConfirmado(false)
    guardarConfirmacion(false)
    setGuardado('inicial')
  }

  /**
   * Guarda la tarjeta como `.jpeg`. Captura el lienzo OCULTO de abajo, no esta pantalla: la imagen
   * que se regala es la tarjeta, no el formulario.
   */
  const exportarImagen = async () => {
    // Igual que en el `.vcf`: la puerta la sostiene este codigo desde que el boton usa
    // `aria-disabled`. Es la contramedida de la unidad 2d y no se debilita, solo cambia quien la
    // impone; hay un E2E que pulsa el boton bloqueado y comprueba que no sale ninguna imagen.
    if (!esExportable(tarjeta) || !puedeExportar(confirmado)) return
    setAvisoDescarga(null)
    setExportando(true)
    try {
      const imagen = await tarjetaAJpeg()
      if (!imagen.ok) {
        setAvisoDescarga(t('editor.imagenFallo'))
        return
      }
      const archivo = new File([dataUrlABlob(imagen.dataUrl)], nombreDeImagen(tarjeta.n, tarjeta.a), {
        type: 'image/jpeg',
      })
      const resultado = await guardarImagen(archivo)
      // Que el usuario cierre la hoja del sistema no es un error: no se le muestra nada.
      if (!resultado.ok && resultado.motivo !== 'cancelado') {
        setAvisoDescarga(t('editor.imagenNoGuardada'))
      }
    } finally {
      setExportando(false)
    }
  }

  const listaParaExportar = esExportable(tarjeta) && puedeExportar(confirmado)

  // Que dice el aviso cuando la TARJETA no pasa: sin nombre, el mensaje de siempre (es el caso mas
  // comun y el unico campo obligatorio); con otro campo roto, el nombre de ESE campo.
  const falla = campoQueImpideExportar(tarjeta)
  const claveDeLaFalla = falla && falla.campo !== 'n' ? etiquetaDelCampo(falla.campo) : null
  const avisoQueFalta = claveDeLaFalla
    ? t('editor.revisaCampo', {
        // La etiqueta del nombre trae un asterisco ("Nombre *") que no pinta nada en una frase.
        campo: tCampos(claveDeLaFalla).replace(/\s*\*$/, ''),
      })
    : t('editor.faltaNombre')

  /**
   * El aviso de densidad (unidad 4f). Se mide en cuanto la tarjeta es exportable, no al pulsar el
   * boton: el usuario tiene que enterarse MIENTRAS edita, que es cuando todavia puede quitar un
   * campo. Enterarse al exportar seria enterarse tarde.
   *
   * `useMemo` porque medirlo arma el vCard una vez por cada campo recortable, y esto corre en cada
   * tecla del autosave.
   */
  const aviso = useMemo(
    () => (esExportable(tarjeta) ? avisoDeDensidad(medirDensidad(tarjeta)) : null),
    [tarjeta],
  )

  return (
    <main className="mx-auto w-full max-w-xl space-y-6 p-4 pb-24">
      <PingDeTarjetaCreada listo={esExportable(tarjeta)} />

      <div className="flex justify-end">
        <SelectorDeIdioma />
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-tinta">{t('editor.titulo')}</h1>
        <p className="text-sm text-tinta-suave">{t('editor.subtitulo')}</p>
      </header>

      <AvisoDeAlcance />

      <section className="space-y-3">
        <Etiqueta htmlFor="foto">{t('editor.foto')}</Etiqueta>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-superficie-sutil text-xl font-semibold text-tinta-suave">
            {foto ? (
              /* Un data: URL local, no una imagen remota: next/image no aporta nada aqui y
                 anadiria una peticion, que es justo lo que el candado de cero dominios ajenos evita. */
              // eslint-disable-next-line @next/next/no-img-element
              <img src={foto.dataUrl} alt={t('editor.fotoAlt')} className="h-full w-full object-cover" />
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
              className="block w-full text-sm file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-lg file:border file:border-borde-fuerte file:bg-superficie file:text-tinta file:px-4 file:text-sm file:font-medium"
            />
            <p className="mt-1 text-xs text-tinta-suave">{t('editor.fotoAyuda')}</p>
            {foto && (
              <button
                type="button"
                onClick={() => {
                  setFoto(null)
                  borrarFoto()
                }}
                className="mt-1 min-h-11 text-sm text-tinta-suave underline"
              >
                {t('editor.quitarFoto')}
              </button>
            )}
          </div>
        </div>
        {avisoFoto && (
          <p role="alert" className="text-sm text-peligro">
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
        <h2 className="text-lg font-semibold text-tinta">{t('editor.compartir')}</h2>
        <div ref={confirmacion}>
          <ConfirmacionDeExportacion
            confirmado={confirmado}
            onCambio={(v) => {
              setConfirmado(v)
              guardarConfirmacion(v)
            }}
          />
        </div>
        <div className="grid gap-2">
          {/*
            Los tres van por `BotonDeSalida`, que en vez de un `disabled` mudo explica QUE FALTA y
            al pulsarlo lleva a la confirmacion, la resalta y le da el foco. El porque de
            `aria-disabled` en vez de `disabled` (y su precio) esta en ese archivo.
          */}
          <BotonDeSalida
            id="exportar-jpeg"
            variante="primario"
            habilitado={listaParaExportar && !exportando}
            onAccion={() => void exportarImagen()}
            onFalta={senalarLoQueFalta}
          >
            {exportando ? t('editor.creandoImagen') : t('editor.guardarImagen')}
          </BotonDeSalida>
          <BotonDeSalida
            id="mostrar-qr"
            variante="acento"
            habilitado={listaParaExportar}
            onAccion={() => router.push('/tarjeta')}
            onFalta={senalarLoQueFalta}
          >
            {/*
              "Ver mi tarjeta", no "Mostrar codigo QR". El boton lleva a la tarjeta ENTERA (nombre,
              cargo, empresa, los dos bloques de texto, el telefono y la firma, ademas del codigo),
              asi que el nombre viejo subvendia lo que hace. Lo noto Johann.

              Y no se llama "previsualizacion", que fue lo primero que se propuso: esa pantalla NO
              es un ensayo previo, es el gesto central del producto, el momento de extenderle el
              telefono a otra persona en un evento. Nombrar el GESTO sirve para los dos momentos
              (revisar como quedo y enseñarsela a alguien) sin rebajar ninguno.
            */}
            {t('editor.verTarjeta')}
          </BotonDeSalida>
          {/*
            La descarga del `.vcf` (unidad 4b). Va aqui y no en la vista de la tarjeta porque alli
            no cabe ningun control: esa pantalla es lo que la Ola 5 captura como imagen, y un boton
            adentro saldria en el `.jpeg` que el usuario regala.
          */}
          <BotonDeSalida
            id="descargar-vcf"
            variante="neutro"
            habilitado={listaParaExportar}
            onAccion={() => {
              // La puerta se comprueba TAMBIEN aqui, no solo en el estado del boton: desde que el
              // apagado es `aria-disabled`, el navegador ya no la sostiene por nosotros.
              if (!esExportable(tarjeta) || !puedeExportar(confirmado)) return
              const r = descargarVCard(tarjeta, foto?.dataUrl)
              if (!r.ok) setAvisoDescarga(t('editor.vcfFallo'))
            }}
            onFalta={senalarLoQueFalta}
          >
            {t('editor.descargarVcf')}
          </BotonDeSalida>
        </div>
        {aviso && (
          <p role="status" data-testid="aviso-densidad" className="rounded-lg border border-aviso-borde bg-aviso-superficie p-3 text-sm text-tinta">
            {aviso.campo
              ? t('qr.densidadRecorte', {
                  modulos: aviso.modulos,
                  campo: t(`qr.recortes.${aviso.campo}`),
                })
              : t('qr.densidad', { modulos: aviso.modulos })}
          </p>
        )}
        {avisoDescarga && (
          <p role="alert" className="text-sm text-peligro">
            {avisoDescarga}
          </p>
        )}
        {!esExportable(tarjeta) && (
          // Mismo `id` que el aviso de la confirmacion (nunca salen los dos a la vez): asi el
          // `aria-describedby` de los botones apagados tambien anuncia ESTE motivo.
          <p id="que-falta-para-compartir" className="text-sm text-tinta-suave">
            {avisoQueFalta}
          </p>
        )}
        {esExportable(tarjeta) && !confirmado && (
          // El `id` no es decoracion: es lo que `aria-describedby` de cada boton apagado enlaza,
          // asi que un lector de pantalla anuncia QUE FALTA al llegar al boton, no solo que esta
          // deshabilitado.
          <p id="que-falta-para-compartir" className="text-sm text-tinta-suave">
            {t('editor.faltaConfirmacion')}
          </p>
        )}
        <p className="text-xs text-tinta-suave">{t('editor.notaImagen')}</p>
      </section>

      {/*
        El enlace va DESPUES de las dos salidas principales y en su propio bloque, no como un tercer
        boton al lado: es opcional, tiene efecto hacia afuera y no se puede revocar. Se ofrece
        visible (invisible = no existe) pero nace apagado.
      */}
      <GenerarEnlace
        tarjeta={esExportable(tarjeta) ? tarjeta : null}
        habilitado={listaParaExportar}
        onFalta={senalarLoQueFalta}
      />

      <LimitesDelProducto />

      {/*
        La tarjeta montada fuera de pantalla, de donde sale el `.jpeg`. Solo existe cuando ya hay
        algo que exportar: montarla siempre pintaria un QR en cada tecleo.
      */}
      {esExportable(tarjeta) && <LienzoOculto tarjeta={tarjeta} fotoDataUrl={foto?.dataUrl} />}

      <section className="space-y-2">
        <BotonBorrarTodo onBorrar={alBorrar} />
        <p aria-live="polite" data-testid="estado-guardado" className="text-center text-xs text-tinta-suave">
          {guardado === 'guardando' && t('editor.guardando')}
          {guardado === 'guardado' && t('editor.guardado')}
          {guardado === 'fallo' && t('editor.falloGuardado')}
        </p>
      </section>
    </main>
  )
}

/**
 * El `id` del control de cada campo del modelo. Coincide con la clave (`n`, `co`, `w`...) salvo en
 * las listas, que llevan su indice. Si un campo nuevo no esta aqui, cae al nombre en vez de a nada.
 */
function idDelCampo(campo: string, indice?: number): string {
  if (campo === 't') return `tel-${indice ?? 0}`
  if (campo === 'l') return `enlace-${indice ?? 0}`
  return campo
}

/** La etiqueta visible de cada campo, para que el aviso nombre el que falla con sus palabras. */
const ETIQUETA_DEL_CAMPO = {
  n: 'nombre', a: 'apellido', c: 'cargo', em: 'empresa', co: 'correo', t: 'telefonos',
  w: 'sitioWeb', li: 'linkedin', ig: 'instagram', tk: 'tiktok', fb: 'facebook',
  l: 'otrosEnlaces', d: 'ciudad', ti: 'titular', de: 'descripcion',
} as const

function etiquetaDelCampo(campo: string) {
  return campo in ETIQUETA_DEL_CAMPO ? ETIQUETA_DEL_CAMPO[campo as keyof typeof ETIQUETA_DEL_CAMPO] : null
}
