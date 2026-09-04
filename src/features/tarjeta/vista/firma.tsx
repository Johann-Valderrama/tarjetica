/**
 * Unidad 3e del PRP-TD-001: la firma de marca (G4).
 *
 * Va DENTRO del elemento capturable, y es lo contrario del toggle de vistas, que va fuera a
 * proposito. La razon: el `.jpeg` es esta misma vista renderizada, asi que una firma fuera del
 * elemento no sale en la imagen, y con ella se pierde la unica palanca de distribucion que existe
 * sin servidor (seccion 13 del PRP).
 *
 * ⛔ NUNCA dentro del vCard del QR, ni como `URL` ni en `NOTE`. Ese vCard aterriza en la agenda de
 * un TERCERO que jamas uso la herramienta: seria publicidad en la libreta de otra persona, y cada
 * byte ahi es densidad del QR, que es el riesgo numero uno del producto.
 */

/**
 * ⏳ `dominio` esta VACIO a proposito: todavia no hay uno. El despliegue es la Ola 7 y sigue
 * esperando el gate del operador, asi que escribir aqui una direccion inventada pondria en la
 * tarjeta de cada usuario un enlace que no lleva a ninguna parte. Cuando el dominio exista, se
 * llena esta constante y la firma lo muestra sola.
 */
export const MARCA: { nombre: string; dominio: string | null } = {
  nombre: 'Tarjetica',
  dominio: null,
}

export function FirmaDeMarca() {
  return (
    <p className="pt-1 text-center text-[11px] tracking-wide text-tinta-suave/70">
      Hecha con <span className="text-tinta-suave">{MARCA.nombre}</span>
      {MARCA.dominio ? ` · ${MARCA.dominio}` : null}
    </p>
  )
}
