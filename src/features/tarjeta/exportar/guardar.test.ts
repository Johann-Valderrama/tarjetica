import { describe, expect, it } from 'vitest'
import { elegirVia, esPantallaTactil, type NavegadorParaCompartir } from '@/features/tarjeta/exportar/guardar'
import { nombreDeImagen } from '@/features/tarjeta/exportar/a-imagen'

/**
 * Verificacion de la unidad 5b: **los dos caminos**, como exige el PRP.
 *
 * Lo que se prueba aqui es la DECISION, no el efecto. Que la hoja del sistema de verdad guarde en
 * Fotos no lo puede verificar ningun navegador headless, porque esa hoja es del sistema operativo:
 * un doble de la capa que falla no verifica nada. Ese arbitro es el gate fisico 5d.
 */

const ARCHIVO = new File([new Uint8Array([1, 2, 3])], 'ana-rios.jpeg', { type: 'image/jpeg' })

/** Un navegador que acepta compartir archivos: iOS Safari, Android Chrome y Chrome de Windows. */
const CON_ARCHIVOS: NavegadorParaCompartir = {
  share: async () => {},
  canShare: (d) => Array.isArray(d.files) && d.files.length > 0,
}

/** El caso que engaña: tiene `share`, pero solo para texto y URL. */
const SOLO_TEXTO: NavegadorParaCompartir = {
  share: async () => {},
  canShare: () => false,
}

/** Los dos dispositivos, nombrados para que cada assert diga desde donde se esta guardando. */
const TACTIL = true
const CON_MOUSE = false

describe('en el TELEFONO manda la hoja del sistema', () => {
  it('con hoja que acepta archivos, se comparte', () => {
    expect(elegirVia(CON_ARCHIVOS, ARCHIVO, true, TACTIL)).toBe('compartir')
  })

  it('compartir gana a la descarga aunque las dos esten disponibles', () => {
    // El orden importa, y es la razon de ser de esta unidad: en iOS la descarga existe y NO guarda
    // en Fotos, asi que preferirla dejaria al usuario creyendo que guardo su tarjeta.
    expect(elegirVia(CON_ARCHIVOS, ARCHIVO, true, TACTIL)).toBe('compartir')
  })

  it('un navegador que comparte texto pero NO archivos cae a la descarga', () => {
    // Preguntar solo si existe `navigator.share` lo daria por bueno, y el usuario se quedaria
    // mirando una hoja del sistema sin su imagen.
    expect(elegirVia(SOLO_TEXTO, ARCHIVO, true, TACTIL)).toBe('descarga')
  })

  it('sin `canShare` (solo `share`), tampoco se asume que acepte archivos', () => {
    expect(elegirVia({ share: async () => {} }, ARCHIVO, true, TACTIL)).toBe('descarga')
  })

  it('sin compartir Y sin descarga, queda la pulsacion larga', () => {
    expect(elegirVia(undefined, ARCHIVO, false, TACTIL)).toBe('pulsacion-larga')
  })
})

describe('en el COMPUTADOR manda la descarga', () => {
  /**
   * El caso que Johann reporto el 2026-09-08 usando la app en su computador: Chrome de Windows
   * responde que SI puede compartir archivos, asi que ganaba la hoja de Windows y no lo dejaba
   * elegir carpeta, donde el esperaba la descarga de toda la vida.
   */
  it('aunque el navegador PUEDA compartir archivos, con mouse se descarga', () => {
    expect(elegirVia(CON_ARCHIVOS, ARCHIVO, true, CON_MOUSE)).toBe('descarga')
  })

  it('sin nada de compartir, tambien es la descarga', () => {
    expect(elegirVia(undefined, ARCHIVO, true, CON_MOUSE)).toBe('descarga')
  })

  /**
   * El unico caso en que un computador abre la hoja del sistema: que no tenga descarga. Es raro,
   * pero la hoja sigue siendo mejor que dejar a la persona sin ninguna via.
   */
  it('un escritorio sin descarga cae a compartir antes que a la pulsacion larga', () => {
    expect(elegirVia(CON_ARCHIVOS, ARCHIVO, false, CON_MOUSE)).toBe('compartir')
  })

  it('sin descarga y sin compartir, queda la pulsacion larga', () => {
    expect(elegirVia(undefined, ARCHIVO, false, CON_MOUSE)).toBe('pulsacion-larga')
  })
})

describe('como se decide si es tactil', () => {
  /**
   * Se pregunta por el PUNTERO, no por el user agent: un user agent hay que mantenerlo a mano cada
   * vez que sale un dispositivo, y `(pointer: coarse)` responde lo unico que importa aqui, que es
   * si la persona toca con el dedo.
   */
  it('lee `(pointer: coarse)`, y nada mas', () => {
    const consultado: string[] = []
    const ventana = (grueso: boolean) =>
      ({ matchMedia: (q: string) => { consultado.push(q); return { matches: grueso } } }) as unknown as Window

    expect(esPantallaTactil(ventana(true))).toBe(true)
    expect(esPantallaTactil(ventana(false))).toBe(false)
    expect(consultado).toEqual(['(pointer: coarse)', '(pointer: coarse)'])
  })

  it('sin `matchMedia` asume escritorio, que es el lado seguro', () => {
    // Una descarga que no era la ideal se VE y se puede repetir; una hoja del sistema que no
    // aparece deja al usuario sin saber que paso.
    expect(esPantallaTactil(undefined)).toBe(false)
    expect(esPantallaTactil({} as Window)).toBe(false)
  })
})

describe('nombre del archivo de imagen', () => {
  it('quita tildes y espacios, y nunca sale vacio', () => {
    expect(nombreDeImagen('María José', 'Peña Gutiérrez')).toBe('maria-jose-pena-gutierrez.jpeg')
    expect(nombreDeImagen('Ana')).toBe('ana.jpeg')
    expect(nombreDeImagen('文')).toBe('tarjeta.jpeg')
  })
})
