'use client'

/**
 * Unidad 2d del PRP-TD-001: avisos y controles de privacidad del editor.
 *
 * Son contramedidas de la seccion 9, y su ausencia NO la detecta ningun test de funcionamiento: la
 * app anda igual de bien sin ellas. Dos cosas que el PRP exige y que aqui se cumplen literal:
 *
 * - **Un aviso sin gate es decoracion.** Por eso la confirmacion de "esta tarjeta es mia" BLOQUEA la
 *   exportacion, no solo la acompana. El `.jpeg` en Fotos y el `.vcf` en Contactos se respaldan
 *   solos a iCloud o Google: si alguien hace la tarjeta de OTRA persona, los datos de esa persona
 *   terminan en la nube de quien la creo.
 * - **El boton de borrar es visible**, no esta escondido. En un equipo compartido de stand, el
 *   autosave le muestra al siguiente la tarjeta del anterior.
 */

export function AvisoDeAlcance() {
  return (
    <div
      role="note"
      className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
    >
      <p className="font-semibold">Esta app es para TU propia tarjeta.</p>
      <p className="mt-1">
        Si haces la de otra persona, sus datos quedan en este teléfono y en las copias de seguridad de
        este teléfono. La imagen que guardes va a tus Fotos, y el contacto a tu agenda.
      </p>
    </div>
  )
}

/** Advertencia corta que va PEGADA a un campo delicado, no en una nota al pie. */
export function AvisoDeCampo({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-amber-700">{children}</p>
}

export function ConfirmacionDeExportacion({
  confirmado,
  onCambio,
}: {
  confirmado: boolean
  onCambio: (v: boolean) => void
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-neutral-300 p-3 text-sm">
      <input
        type="checkbox"
        name="confirmacion-propia"
        checked={confirmado}
        onChange={(e) => onCambio(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0"
      />
      <span>
        Confirmo que esta tarjeta es mía, o que tengo permiso de la persona para compartir sus datos.
      </span>
    </label>
  )
}

/**
 * Puerta de las exportaciones. Se usa asi para que la regla viva en UN solo lugar y no dependa de
 * que cada boton se acuerde de comprobarla.
 */
export function puedeExportar(confirmado: boolean): boolean {
  return confirmado === true
}

export function BotonBorrarTodo({ onBorrar }: { onBorrar: () => void }) {
  return (
    <button
      type="button"
      onClick={onBorrar}
      className="min-h-11 w-full rounded-lg border border-red-300 px-4 text-sm font-medium text-red-700 hover:bg-red-50"
    >
      Borrar mis datos de este dispositivo
    </button>
  )
}

/**
 * Limitaciones que son consecuencia directa de no tener servidor (D1). Van DICHAS en el copy, no
 * enterradas en la documentacion: son la contrapartida que el usuario tiene que conocer antes de
 * confiarle su tarjeta a la herramienta.
 */
export function LimitesDelProducto() {
  return (
    <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-sm">
      <p className="font-semibold">No guardamos tus datos en ningún servidor.</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-neutral-600">
        <li>
          Tu tarjeta vive en este navegador y en este equipo. Si borras los datos del sitio o cambias
          de teléfono, la pierdes: no hay cuenta desde donde recuperarla.
        </li>
        <li>La imagen que guardes es tu respaldo.</li>
        <li>Necesitas señal la primera vez que abres la app.</li>
      </ul>
    </div>
  )
}
