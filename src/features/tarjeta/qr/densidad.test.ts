import { describe, expect, it } from 'vitest'
import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { medirDensidad, textoDelAviso, VERSION_QR_DE_AVISO } from '@/features/tarjeta/qr/densidad'

/**
 * Verificacion de la unidad 4f. El aviso es la mitigacion del riesgo que introduce llevar TODO
 * dentro del QR: **falla justo con la tarjeta de quien mas se esforzo en llenarla**, y sin aviso esa
 * persona no tiene forma de enterarse hasta que alguien en un salon no logra escanearla.
 *
 * Los dos casos que exige el PRP son un par: el tipico NO puede disparar el aviso (si dispara con
 * todo el mundo, deja de significar algo y se vuelve ruido que se ignora) y el lleno SI.
 */

/** Lo que llena una persona que va a una conferencia sin pensarlo mucho. */
const TIPICA: Tarjeta = {
  n: 'Ana',
  a: 'Ríos',
  c: 'Coordinadora de compras',
  em: 'Alimentos del Norte',
  co: 'ana.rios@example.com',
  t: [{ n: '310 555 1234', e: 'whatsapp' }],
  li: 'anarios',
  d: 'Medellín · Colombia',
}

/** Todos los campos que el editor deja llenar. */
const LLENA: Tarjeta = {
  ...TIPICA,
  t: [
    { n: '+57 310 555 1234', e: 'whatsapp' },
    { n: '+57 601 555 0000', e: 'oficina' },
    { n: '+57 320 111 2233', e: 'movil' },
  ],
  w: 'https://alimentosdelnorte.example.com',
  ig: 'anarios',
  tk: 'anarios',
  fb: 'anarios',
  l: [
    { u: 'https://example.com/portafolio', e: 'Portafolio' },
    { u: 'https://example.com/agenda', e: 'Agenda' },
  ],
  ti: 'Recupera las horas que tu operación te quita.',
  de: 'Tu equipo deja el trabajo repetitivo; vuelve a decidir, crear y vender.',
}

describe('el aviso dispara donde debe, y solo ahi', () => {
  it('la tarjeta minima no avisa', () => {
    const d = medirDensidad({ n: 'Ana' })
    expect(d.avisar).toBe(false)
    expect(textoDelAviso(d)).toBeNull()
  })

  it('el perfil TIPICO no avisa: si avisara siempre, el aviso no diria nada', () => {
    const d = medirDensidad(TIPICA)
    expect(d.version).toBeLessThanOrEqual(VERSION_QR_DE_AVISO)
    expect(d.avisar).toBe(false)
  })

  it('el perfil LLENO si avisa', () => {
    const d = medirDensidad(LLENA)
    expect(d.version).toBeGreaterThan(VERSION_QR_DE_AVISO)
    expect(d.avisar).toBe(true)
  })
})

describe('el aviso habilita una decision, no solo informa', () => {
  it('nombra un campo concreto que se puede quitar', () => {
    const d = medirDensidad(LLENA)
    const texto = textoDelAviso(d)!
    // "tu código es denso" no habilita nada; el usuario decide sobre "la descripción".
    expect(texto).toContain(d.recortes[0].etiqueta)
  })

  it('los recortes van del mas caro al mas barato, y todos ahorran algo', () => {
    const { recortes } = medirDensidad(LLENA)
    expect(recortes.length).toBeGreaterThan(0)
    for (const r of recortes) expect(r.octetos).toBeGreaterThan(0)
    const octetos = recortes.map((r) => r.octetos)
    expect(octetos).toEqual([...octetos].sort((a, b) => b - a))
  })

  it('el ahorro es MEDIDO: quitar el campo mas caro baja los octetos en lo que dijo', () => {
    const antes = medirDensidad(LLENA)
    const masCaro = antes.recortes[0]
    const sinEse = { ...LLENA }
    delete sinEse[masCaro.campo]
    expect(medirDensidad(sinEse as Tarjeta).octetos).toBe(antes.octetos - masCaro.octetos)
  })

  it('nunca ofrece recortar el nombre, que es el unico campo obligatorio', () => {
    expect(medirDensidad(LLENA).recortes.some((r) => r.campo === 'n')).toBe(false)
  })
})
