'use client'

import { useTranslations } from 'next-intl'

/**
 * Los botones que producen una salida (la imagen, la tarjeta, el `.vcf`, el enlace), con su estado
 * apagado EXPLICADO en vez de mudo.
 *
 * **El problema que resuelve.** Los cuatro nacen apagados hasta que la persona escribe su nombre y
 * marca la confirmacion de "esta tarjeta es mia". Antes eso era un `disabled` a secas: el boton se
 * veia gris y no pasaba nada, sin decir por que ni que hacer. Johann lo reporto pidiendo un tooltip
 * y, mejor todavia, que al tocarlo te lleve a lo que falta.
 *
 * **Por que `aria-disabled` y no `disabled`.** Un boton con `disabled` de verdad **no recibe clics
 * ni hover**: el navegador se los come antes de que llegue ningun manejador. Con ese atributo no
 * hay tooltip ni "llevame al checkbox" que valga, porque no hay evento que escuchar. `aria-disabled`
 * le dice a la tecnologia de asistencia exactamente lo mismo, y ademas **deja el boton en el
 * recorrido del teclado**: un `disabled` real desaparece de ese recorrido, asi que quien navega con
 * lector de pantalla ni se entera de que la salida existe. Es mejor accesibilidad, no un rodeo.
 *
 * **El precio, dicho.** La puerta deja de imponerla el navegador y pasa a imponerla este codigo. Por
 * eso `onAccion` NO se llama cuando esta apagado, y hay un E2E que pulsa cada boton bloqueado y
 * comprueba que no ocurre nada: navegar, descargar ni generar. Esa contramedida es de la unidad 2d
 * y no se debilita, solo cambia quien la sostiene.
 *
 * **Por que el gesto es tocar y no pasar el mouse.** El producto se usa de pie, en un telefono. En
 * tactil **no existe el hover**, asi que un tooltip clasico no aparece nunca justo en el caso
 * principal. Lo que funciona en los dos sitios es el toque: lleva el foco a lo que falta, lo resalta
 * y lo dice.
 */

export function BotonDeSalida({
  id,
  habilitado,
  onAccion,
  onFalta,
  variante,
  children,
}: {
  /** Va al `data-testid`, para que los asserts sigan nombrando cada boton como siempre. */
  id: string
  habilitado: boolean
  onAccion: () => void
  /** Que hacer cuando esta apagado: llevar el foco a lo que falta y resaltarlo. */
  onFalta: () => void
  variante: 'primario' | 'acento' | 'neutro'
  children: React.ReactNode
}) {
  const t = useTranslations('editor')

  const base =
    'min-h-11 rounded-lg px-4 font-medium transition-opacity aria-disabled:cursor-help aria-disabled:text-tinta-tenue'
  const porVariante = {
    primario: 'bg-acento text-fondo aria-disabled:bg-superficie-sutil',
    acento: 'border border-acento text-tinta aria-disabled:border-borde',
    neutro: 'border border-borde-fuerte text-tinta aria-disabled:border-borde',
  }[variante]

  return (
    <button
      type="button"
      data-testid={id}
      aria-disabled={!habilitado}
      /*
        El texto que explica QUE FALTA se enlaza por `aria-describedby`, no se mete en un `title`:
        el `title` nativo tarda un segundo en salir, no aparece en tactil y muchos lectores de
        pantalla lo ignoran. Ese parrafo ya existe debajo de los botones y lo lee todo el mundo.
      */
      aria-describedby={habilitado ? undefined : 'que-falta-para-compartir'}
      // `title` igual, como respaldo para quien use mouse: no cuesta nada y ahi si funciona.
      title={habilitado ? undefined : t('faltaConfirmacion')}
      onClick={() => (habilitado ? onAccion() : onFalta())}
      className={`${base} ${porVariante}`}
    >
      {children}
    </button>
  )
}
