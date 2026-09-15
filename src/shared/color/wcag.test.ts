import { describe, expect, it } from 'vitest'
import { contrasteEntre, hexARgb, luminanciaRelativa, rgbAHex } from './wcag'

describe('contrasteEntre', () => {
  it('blanco contra negro da 21, el maximo de la escala', () => {
    expect(contrasteEntre({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 })).toBe(21)
  })

  it('un par conocido: #767676 sobre blanco da ~4,54:1 (el gris limite de AA)', () => {
    expect(contrasteEntre({ r: 0x76, g: 0x76, b: 0x76 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(4.54, 2)
  })

  it('es simetrico: el orden de los dos colores no cambia el resultado', () => {
    const a = { r: 29, g: 78, b: 216 }
    const b = { r: 10, g: 10, b: 11 }
    expect(contrasteEntre(a, b)).toBe(contrasteEntre(b, a))
  })
})

describe('luminanciaRelativa', () => {
  it('blanco es 1 y negro es 0', () => {
    expect(luminanciaRelativa({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 6)
    expect(luminanciaRelativa({ r: 0, g: 0, b: 0 })).toBe(0)
  })
})

describe('hexARgb / rgbAHex', () => {
  it('van y vuelven sin cambiar el color', () => {
    expect(hexARgb('#ff9101')).toEqual({ r: 255, g: 145, b: 1 })
    expect(rgbAHex({ r: 255, g: 145, b: 1 })).toBe('#ff9101')
  })

  it('acepta el hex sin almohadilla', () => {
    expect(hexARgb('0a0a0b')).toEqual({ r: 10, g: 10, b: 11 })
  })

  it('rechaza lo que no es un hex de 6 digitos', () => {
    expect(hexARgb('#fff')).toBeNull()
    expect(hexARgb('no-es-color')).toBeNull()
  })

  it('rgbAHex siempre da 6 digitos en minusculas', () => {
    expect(rgbAHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
    expect(rgbAHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff')
  })
})
