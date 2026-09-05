import { describe, expect, it } from 'vitest'
import { elegirVia, type NavegadorParaCompartir } from '@/features/tarjeta/exportar/guardar'
import { nombreDeImagen } from '@/features/tarjeta/exportar/a-imagen'

/**
 * Verificacion de la unidad 5b: **los dos caminos**, como exige el PRP.
 *
 * Lo que se prueba aqui es la DECISION, no el efecto. Que la hoja del sistema de verdad guarde en
 * Fotos no lo puede verificar ningun navegador headless, porque esa hoja es del sistema operativo:
 * un doble de la capa que falla no verifica nada. Ese arbitro es el gate fisico 5d.
 */

const ARCHIVO = new File([new Uint8Array([1, 2, 3])], 'ana-rios.jpeg', { type: 'image/jpeg' })

/** Un navegador que acepta compartir archivos: iOS Safari, Android Chrome. */
const CON_ARCHIVOS: NavegadorParaCompartir = {
  share: async () => {},
  canShare: (d) => Array.isArray(d.files) && d.files.length > 0,
}

/** El caso que engaña: tiene `share`, pero solo para texto y URL. */
const SOLO_TEXTO: NavegadorParaCompartir = {
  share: async () => {},
  canShare: () => false,
}

describe('elegir por donde se guarda', () => {
  it('con hoja del sistema que acepta archivos, se comparte', () => {
    expect(elegirVia(CON_ARCHIVOS, ARCHIVO, true)).toBe('compartir')
  })

  it('un navegador que comparte texto pero NO archivos cae a la descarga', () => {
    // Preguntar solo si existe `navigator.share` lo daria por bueno, y el usuario se quedaria
    // mirando una hoja del sistema sin su imagen.
    expect(elegirVia(SOLO_TEXTO, ARCHIVO, true)).toBe('descarga')
  })

  it('sin `canShare` (solo `share`), tampoco se asume que acepte archivos', () => {
    expect(elegirVia({ share: async () => {} }, ARCHIVO, true)).toBe('descarga')
  })

  it('sin nada de compartir, es la descarga', () => {
    expect(elegirVia(undefined, ARCHIVO, true)).toBe('descarga')
  })

  it('sin compartir Y sin descarga, queda la pulsacion larga', () => {
    expect(elegirVia(undefined, ARCHIVO, false)).toBe('pulsacion-larga')
  })

  it('compartir gana a la descarga aunque las dos esten disponibles', () => {
    // El orden importa: en iOS la descarga existe y NO guarda en Fotos.
    expect(elegirVia(CON_ARCHIVOS, ARCHIVO, true)).toBe('compartir')
  })
})

describe('nombre del archivo de imagen', () => {
  it('quita tildes y espacios, y nunca sale vacio', () => {
    expect(nombreDeImagen('María José', 'Peña Gutiérrez')).toBe('maria-jose-pena-gutierrez.jpeg')
    expect(nombreDeImagen('Ana')).toBe('ana.jpeg')
    expect(nombreDeImagen('文')).toBe('tarjeta.jpeg')
  })
})
