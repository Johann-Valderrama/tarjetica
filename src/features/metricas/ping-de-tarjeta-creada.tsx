'use client'

import { useEffect } from 'react'
import { ping } from '@/features/metricas/ping'

/**
 * `card_created` (unidad 7c). Solo se monta en el editor.
 *
 * **Se dispara la PRIMERA vez que la tarjeta llega a ser exportable en este dispositivo, no en cada
 * tecla.** El autosave corre en cada letra; un ping ahi contaria pulsaciones y no tarjetas, y ese
 * numero no habilitaria ninguna decision.
 *
 * La marca vive en `localStorage`, asi que lo que de verdad se cuenta son **dispositivos que
 * llegaron a tener una tarjeta**, no tarjetas. La diferencia importa al leer el numero y por eso se
 * dice aqui: quien edite la suya diez veces cuenta una, y quien borre los datos del sitio y empiece
 * de nuevo cuenta dos. Es el limite que impone no tener servidor; contarlo de otro modo exigiria
 * identificar a la persona, que es justo lo que el producto promete no hacer.
 *
 * La clave va con el mismo prefijo que el resto del almacen, para que el boton de "borrar mis datos
 * de este dispositivo" no la deje huerfana... y **a proposito NO la borra**: si la borrara, cada
 * limpieza de un equipo compartido de stand inflaria el conteo. Se limpia solo cuando el usuario
 * borra los datos del sitio desde el navegador, que es cuando de verdad vuelve a ser un dispositivo
 * nuevo.
 */
const CLAVE = 'tarjetica:ping:card_created'

export function PingDeTarjetaCreada({ listo }: { listo: boolean }) {
  useEffect(() => {
    if (!listo) return
    try {
      if (window.localStorage.getItem(CLAVE)) return
      window.localStorage.setItem(CLAVE, '1')
    } catch {
      // Almacenamiento bloqueado (modo privado, cuota llena). Sin marca no se puede evitar el
      // doble conteo, asi que no se pingea: un numero inflado miente peor que uno que falta.
      return
    }
    ping('card_created')
  }, [listo])

  return null
}
