'use client'

import { useEffect, useRef } from 'react'
import { ping } from '@/features/metricas/ping'

/**
 * Una visita a la home (unidad 7c). Solo se monta en `/`.
 *
 * `useRef` y no un estado: en desarrollo React monta dos veces cada componente a proposito, y sin
 * el candado la home contaria el doble. El ping ocurre una vez por carga de pagina.
 */
export function PingDeVisita() {
  const yaFue = useRef(false)

  useEffect(() => {
    if (yaFue.current) return
    yaFue.current = true
    ping('home_visit')
  }, [])

  return null
}
