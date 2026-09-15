import { describe, expect, it } from 'vitest'
import { contrasteEntre, hexARgb } from '@/shared/color/wcag'
import { FONDO_POR_TEMA, ajustarContraste, colorDominante, sugerirColorDeMarca } from './color-de-marca'

/** Arma un `Uint8ClampedArray` de pixeles RGBA a mano, sin canvas: `n` copias de cada `[r,g,b,a]`. */
function pixeles(...grupos: Array<{ color: [number, number, number, number]; n: number }>): Uint8ClampedArray {
  const total = grupos.reduce((s, g) => s + g.n, 0)
  const salida = new Uint8ClampedArray(total * 4)
  let i = 0
  for (const { color, n } of grupos) {
    for (let k = 0; k < n; k++) {
      salida.set(color, i)
      i += 4
    }
  }
  return salida
}

describe('colorDominante', () => {
  it('un logo monocromo devuelve ese unico color', () => {
    const p = pixeles({ color: [29, 78, 216, 255], n: 40 })
    expect(colorDominante(p)).toEqual({ r: 29, g: 78, b: 216 })
  })

  it('con tres colores de frecuencias distintas, gana el que MAS AREA ocupa, no el primer pixel', () => {
    // El primer pixel escrito es el rojo (el que menos aparece); si el algoritmo devolviera "el
    // primero que ve" en vez de contar de verdad, este test lo delataria.
    const p = pixeles(
      { color: [220, 40, 40, 255], n: 5 }, // rojo, minoritario, y va PRIMERO en el array
      { color: [29, 78, 216, 255], n: 50 }, // azul, el que mas area ocupa
      { color: [40, 180, 90, 255], n: 20 }, // verde, intermedio
    )
    expect(colorDominante(p)).toEqual({ r: 29, g: 78, b: 216 })
  })

  it('descarta el casi blanco: un color minoritario pero valido gana si el resto es fondo', () => {
    const p = pixeles(
      { color: [253, 253, 250, 255], n: 200 }, // casi blanco: el fondo del PNG, no la marca
      { color: [255, 145, 1, 255], n: 15 }, // el naranja de la marca, minoritario en pixeles
    )
    expect(colorDominante(p)).toEqual({ r: 255, g: 145, b: 1 })
  })

  it('todo transparente no deja ningun pixel valido', () => {
    const p = pixeles({ color: [29, 78, 216, 0], n: 30 })
    expect(colorDominante(p)).toBeNull()
  })

  it('todo blanco tampoco deja ningun pixel valido', () => {
    const p = pixeles({ color: [255, 255, 255, 255], n: 30 })
    expect(colorDominante(p)).toBeNull()
  })

  it('todo negro tampoco deja ningun pixel valido', () => {
    const p = pixeles({ color: [0, 0, 0, 255], n: 30 })
    expect(colorDominante(p)).toBeNull()
  })
})

describe('ajustarContraste', () => {
  const oscuro = hexARgb(FONDO_POR_TEMA.oscuro)!
  const claro = hexARgb(FONDO_POR_TEMA.claro)!
  const naranjaBrillante = { r: 0xff, g: 0x91, b: 0x01 }
  const azulOscuro = { r: 0x0b, g: 0x1a, b: 0x3a }

  it.each([
    ['naranja brillante', naranjaBrillante, 'oscuro', oscuro],
    ['naranja brillante', naranjaBrillante, 'claro', claro],
    ['azul oscuro', azulOscuro, 'oscuro', oscuro],
    ['azul oscuro', azulOscuro, 'claro', claro],
  ] as const)('%s alcanza >= 4,5:1 contra el fondo %s', (_nombre, color, _tema, fondo) => {
    const ajustado = ajustarContraste(color, fondo)
    expect(contrasteEntre(ajustado, fondo)).toBeGreaterThanOrEqual(4.5)
  })

  it('si el color ya cumple, lo devuelve sin tocar', () => {
    // Blanco puro sobre el fondo oscuro ya pasa de sobra: no hay razon para moverlo.
    const blanco = { r: 255, g: 255, b: 255 }
    expect(ajustarContraste(blanco, oscuro)).toEqual(blanco)
  })

  it('mueve el tono hacia el lado que aleja del fondo, sin cruzar al lado contrario', () => {
    // Contra un fondo oscuro, un color ya mas claro que el fondo se aclara mas (nunca se oscurece).
    const ajustado = ajustarContraste(azulOscuro, oscuro)
    expect(ajustado.r + ajustado.g + ajustado.b).toBeGreaterThan(azulOscuro.r + azulOscuro.g + azulOscuro.b)
  })
})

describe('sugerirColorDeMarca', () => {
  it('devuelve un hex de 6 digitos valido para cada tema', () => {
    const p = pixeles({ color: [29, 78, 216, 255], n: 40 })
    for (const tema of ['claro', 'oscuro'] as const) {
      const sugerido = sugerirColorDeMarca(p, tema)
      expect(sugerido).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('el color sugerido cumple el contraste minimo contra el fondo del tema', () => {
    const p = pixeles({ color: [29, 78, 216, 255], n: 40 })
    for (const tema of ['claro', 'oscuro'] as const) {
      const sugerido = sugerirColorDeMarca(p, tema)!
      const fondo = hexARgb(FONDO_POR_TEMA[tema])!
      expect(contrasteEntre(hexARgb(sugerido)!, fondo)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('sin ningun pixel valido, no hay nada que sugerir', () => {
    const p = pixeles({ color: [255, 255, 255, 255], n: 10 })
    expect(sugerirColorDeMarca(p, 'oscuro')).toBeNull()
  })
})
