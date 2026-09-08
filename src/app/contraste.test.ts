import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * Contraste de la paleta, medido contra los tokens REALES (repintado del editor, 2026-09-08).
 *
 * **Por que existe.** La Ola 3 fijo la paleta oscura y midio sus seis pares, pero solo pinto la
 * VISTA de la tarjeta: el editor se quedo con los `neutral-*` y `amber-*` de Tailwind, que estan
 * calculados para fondo claro. Un `text-neutral-900` sobre casi-negro es texto invisible, y eso no
 * lo delata **ningun** test de funcionamiento: la app anda igual de bien con la pantalla ilegible.
 * Lo encontro una captura a 375 px, no una medicion, y este archivo existe para que la proxima vez
 * lo encuentre una medicion.
 *
 * **Lee los valores de `globals.css`, no los repite.** Un test que trae su propia copia de la
 * paleta pasa en verde mientras la app se rompe: mediria su copia, no el producto.
 *
 * **Umbrales, y por que son dos.** AAA de WCAG pide 7:1 para texto normal. Los bordes no son texto:
 * WCAG 1.4.11 les pide 3:1, y solo a los que identifican un CONTROL. Un anillo decorativo no entra,
 * y un control DESHABILITADO esta exento por norma, que es por lo que `--borde` se queda bajo.
 */

const TEXTO_AAA = 7
const NO_TEXTUAL = 3

const CSS = readFileSync(new URL('./globals.css', import.meta.url), 'utf8')

/** Saca un token de `globals.css`. Falla ruidoso si no esta: un token ausente no puede pasar. */
function token(nombre: string): string {
  const m = CSS.match(new RegExp(`--${nombre}:\\s*([^;]+);`))
  if (!m) throw new Error(`el token --${nombre} no existe en globals.css`)
  return m[1].trim()
}

type Rgb = [number, number, number]

function aRgba(valor: string): { rgb: Rgb; alfa: number } {
  const hex = valor.match(/^#([0-9a-f]{6})$/i)
  if (hex) {
    const n = hex[1]
    return { rgb: [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)) as Rgb, alfa: 1 }
  }
  const rgba = valor.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)/i)
  if (!rgba) throw new Error(`no se pudo leer el color "${valor}"`)
  return {
    rgb: [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])] as Rgb,
    alfa: rgba[4] === undefined ? 1 : Number(rgba[4]),
  }
}

/**
 * Compone un color translucido sobre el que tiene detras. Sin esto, medir `rgba(255,145,1,0.1)`
 * daria el contraste del naranja puro, que no es el que el ojo ve: se veria un aviso "aprobado" que
 * en pantalla es un rectangulo casi negro.
 */
function componer(valor: string, detras: Rgb): Rgb {
  const { rgb, alfa } = aRgba(valor)
  return rgb.map((c, i) => Math.round(c * alfa + detras[i] * (1 - alfa))) as Rgb
}

function luminancia([r, g, b]: Rgb): number {
  const canal = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
}

function contraste(a: Rgb, b: Rgb): number {
  const [x, y] = [luminancia(a), luminancia(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

const FONDO = componer(token('fondo'), [0, 0, 0])
const SUPERFICIE = componer(token('superficie'), FONDO)
const SUP_AVISO = componer(token('aviso-superficie'), FONDO)
const SUP_PELIGRO = componer(token('peligro-superficie'), FONDO)
const ACENTO = componer(token('acento'), FONDO)

/**
 * Los pares que la interfaz USA de verdad, no los que se podrian formar.
 *
 * Medir todas las combinaciones posibles daria una tabla larga que nadie lee y que falla por pares
 * que no existen en pantalla. Cada fila de aqui corresponde a algo que se ve.
 */
const PARES_DE_TEXTO: Array<[string, string, Rgb]> = [
  ['tinta sobre el fondo (titulos del editor)', 'tinta', FONDO],
  ['tinta-suave sobre el fondo (ayudas y contadores)', 'tinta-suave', FONDO],
  ['tinta sobre superficie (bloque de limites)', 'tinta', SUPERFICIE],
  ['tinta-suave sobre superficie (los limites)', 'tinta-suave', SUPERFICIE],
  ['tinta sobre el aviso (el de "esta app es para TU tarjeta")', 'tinta', SUP_AVISO],
  ['aviso sobre el fondo (advertencias pegadas a un campo)', 'aviso', FONDO],
  ['aviso sobre su propia superficie', 'aviso', SUP_AVISO],
  ['peligro sobre el fondo (el boton de borrar)', 'peligro', FONDO],
  ['peligro sobre su propia superficie (ese boton en hover)', 'peligro', SUP_PELIGRO],
  ['acento sobre el fondo (enlaces y foco)', 'acento', FONDO],
]

/** Bordes que le dicen al usuario DONDE esta un control. Estos si caen bajo WCAG 1.4.11. */
const BORDES_DE_CONTROL: Array<[string, string, Rgb]> = [
  ['borde-fuerte sobre el fondo (los campos del editor)', 'borde-fuerte', FONDO],
  ['aviso-borde sobre el fondo (la caja de advertencia)', 'aviso-borde', FONDO],
  ['peligro-borde sobre el fondo (el boton de borrar)', 'peligro-borde', FONDO],
]

describe('el texto de la interfaz pasa AAA', () => {
  it.each(PARES_DE_TEXTO)('%s', (_nombre, tinta, fondo) => {
    expect(contraste(componer(token(tinta), fondo), fondo)).toBeGreaterThanOrEqual(TEXTO_AAA)
  })

  /**
   * El boton primario invierte los papeles: tinta OSCURA sobre el acento. Es el par que se olvida,
   * porque en la lista de arriba el acento siempre es el texto.
   */
  it('la tinta del boton primario sobre el acento', () => {
    expect(contraste(componer(token('fondo'), ACENTO), ACENTO)).toBeGreaterThanOrEqual(TEXTO_AAA)
  })
})

describe('los bordes que identifican un control pasan 3:1', () => {
  it.each(BORDES_DE_CONTROL)('%s', (_nombre, borde, fondo) => {
    expect(contraste(componer(token(borde), fondo), fondo)).toBeGreaterThanOrEqual(NO_TEXTUAL)
  })

  /**
   * `--borde` NO entra arriba, y se dice por que: es decorativo (el anillo de la tarjeta, el marco
   * del bloque de limites) y ademas es el que se usa en los controles DESHABILITADOS, que WCAG
   * exime. Dejarlo sin medir en silencio seria un hueco; declararlo es la unica forma honesta.
   */
  it('`--borde` es decorativo y se queda por debajo a proposito', () => {
    expect(contraste(componer(token('borde'), FONDO), FONDO)).toBeLessThan(NO_TEXTUAL)
  })
})

/**
 * El guard que impide que la paleta clara vuelva a entrar.
 *
 * Medir los tokens no basta: el defecto que origino todo esto NO fue un token malo, fue una
 * pantalla que **no usaba los tokens**. El editor llevaba `text-neutral-900` desde la Ola 2 y los
 * tokens estaban perfectos. Por eso la propiedad que hay que vigilar es estructural, no cromatica.
 */
describe('ninguna pantalla se sale de la paleta', () => {
  const PALETA_CLARA = /\b[a-z:]*-(neutral|amber|red|slate|gray|zinc|stone)-\d{2,3}\b|\bbg-white\b|\btext-white\b/

  /**
   * `vista/tarjeta.tsx` NO esta en la lista, y la razon se escribe en vez de omitirse: la teja del
   * codigo QR es `bg-white` **por norma**, no por descuido. El decodificador necesita el blanco y
   * la zona silenciosa para ENCONTRAR el simbolo, asi que ahi la paleta clara es lo correcto, y el
   * texto de respaldo que va encima es oscuro justamente porque el fondo es blanco. Meterla en la
   * lista obligaria a una excepcion por linea, que es peor que decirlo una vez aqui.
   */
  const PANTALLAS = [
    'app/page.tsx',
    'features/tarjeta/formulario/editor.tsx',
    'features/tarjeta/formulario/campos.tsx',
    'features/tarjeta/formulario/avisos.tsx',
    'features/tarjeta/enlace/generar-enlace.tsx',
    'features/tarjeta/enlace/pantalla-enlace.tsx',
    'features/tarjeta/vista/pantalla.tsx',
    'shared/idioma/selector-idioma.tsx',
  ]

  /**
   * Se le quitan los COMENTARIOS antes de buscar. La primera version no lo hacia y acuso a dos
   * archivos por nombrar `bg-neutral-50` dentro de una nota que explica que ese color se QUITO: el
   * guard leia la explicacion del arreglo como si fuera el defecto.
   */
  const sinComentarios = (fuente: string) =>
    fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

  /**
   * El modificador de opacidad NO funciona sobre estos tokens, y falla MUDO.
   *
   * Tailwind solo sabe aplicarle `/40` a un color si puede partirlo en canales. Los tokens de este
   * proyecto son `var(--x)` con un hexadecimal adentro, asi que `text-tinta-suave/40` produce una
   * declaracion invalida: el navegador la tira y gana la clase de al lado. Medido el 2026-09-08 con
   * `getComputedStyle`, no deducido: el boton de exportar APAGADO se quedaba con la tinta oscura
   * del boton activo sobre superficie oscura, o sea desaparecia, y la clase estaba escrita.
   *
   * Nada mas lo delata: compila, pasa el lint, la clase se ve bien en el codigo y el CSS ni siquiera
   * llega a generarse. Si hace falta un tono, se agrega un TOKEN (asi nacio `--tinta-tenue`).
   */
  const OPACIDAD_SOBRE_TOKEN = /\b(?:text|bg|border)-(?:tinta|tinta-suave|tinta-tenue|fondo|superficie|superficie-sutil|borde|borde-fuerte|acento|aviso|peligro)[a-z-]*\/\d+/

  it.each(PANTALLAS)('%s no le pone opacidad a un token', (ruta) => {
    const fuente = sinComentarios(readFileSync(new URL(`../${ruta}`, import.meta.url), 'utf8'))
    const culpables = fuente
      .split('\n')
      .map((linea, i) => ({ n: i + 1, linea: linea.trim() }))
      .filter(({ linea }) => OPACIDAD_SOBRE_TOKEN.test(linea))
      .map(({ n, linea }) => `${n}: ${linea}`)

    expect(culpables, `${ruta} usa el modificador /N sobre un token: no se aplica, agrega un token`).toEqual([])
  })

  it.each(PANTALLAS)('%s usa solo los tokens', (ruta) => {
    const fuente = sinComentarios(readFileSync(new URL(`../${ruta}`, import.meta.url), 'utf8'))
    const culpables = fuente
      .split('\n')
      .map((linea, i) => ({ n: i + 1, linea: linea.trim() }))
      .filter(({ linea }) => PALETA_CLARA.test(linea))
      .map(({ n, linea }) => `${n}: ${linea}`)

    expect(culpables, `${ruta} usa colores de Tailwind en vez de los tokens de la marca`).toEqual([])
  })
})
