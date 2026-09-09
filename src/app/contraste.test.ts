import { globSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
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
const RELLENO_RESALTE = componer(token('peligro-relleno'), FONDO)
const RELLENO_RESALTE_FUERTE = componer(token('peligro-relleno-fuerte'), FONDO)
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
  /*
    Los dos pares del CAMPO DE TEXTO. Entraron el 2026-09-08, despues de medir que no los pintaba
    este proyecto sino el NAVEGADOR: con `color-scheme: dark`, Chrome le ponia al texto de ejemplo
    un `rgb(156,163,175)` sobre un `rgb(59,59,59)` propio, o sea 4,41:1 en el formulario principal
    del producto, por debajo del minimo de AA. Y al venir del navegador, el numero ni siquiera era
    estable entre Chrome, Safari y Firefox. Ahora los fija `globals.css` y se miden aqui.
  */
  ['lo que el usuario escribe, dentro del campo', 'tinta', SUPERFICIE],
  ['el texto de ejemplo del campo (placeholder)', 'tinta-suave', SUPERFICIE],
  /*
    El relleno del resalte de "esto es lo que falta" (2026-09-08). Entra en las DOS variantes
    porque quien pide menos movimiento ve la fuerte, no la normal, y es el caso que Johann tiene
    encendido en su maquina: si solo se midiera la normal, el par que el ve de verdad quedaria sin
    medir. El texto es el de la casilla "esta tarjeta es mia", que hereda `--tinta`.
  */
  ['la casilla sobre el relleno del resalte', 'tinta', RELLENO_RESALTE],
  ['la casilla sobre el relleno reforzado (menos movimiento)', 'tinta', RELLENO_RESALTE_FUERTE],
]

/** Bordes que le dicen al usuario DONDE esta un control. Estos si caen bajo WCAG 1.4.11. */
const BORDES_DE_CONTROL: Array<[string, string, Rgb]> = [
  ['borde-fuerte sobre el fondo (los campos del editor)', 'borde-fuerte', FONDO],
  ['aviso-borde sobre el fondo (la caja de advertencia)', 'aviso-borde', FONDO],
  ['peligro-borde sobre el fondo (el boton de borrar)', 'peligro-borde', FONDO],
  // El anillo del resalte de "esto es lo que falta", en su estado de REPOSO (alfa 1). Es el que
  // identifica el control, asi que es el que tiene que pasar 1.4.11.
  ['peligro-fuerte sobre el fondo (el anillo del resalte)', 'peligro-fuerte', FONDO],
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
 * La tinta de los controles DESHABILITADOS, declarada como contrato en vez de quedar sin medir.
 *
 * Una revision externa midio los cuatro botones apagados del editor y saco 3,65:1 y 3,92:1, por
 * debajo del 4,5:1 de AA. El dato es correcto y no se discute; lo que se decide aqui es que se
 * queda asi, y por que:
 *
 * - WCAG 2.x **exime** a los componentes deshabilitados del requisito de contraste (1.4.3 y 1.4.11
 *   hablan de controles activos). No es incumplimiento.
 * - Subirlo tiene un costo real en el producto: un boton apagado que contrasta como uno encendido
 *   deja de leerse como apagado, y el editor tiene tres botones que nacen deshabilitados hasta que
 *   la persona escribe su nombre. El estado tiene que distinguirse a simple vista.
 *
 * Lo que NO se acepta es que quede sin numero: por eso el rango va escrito. Si alguien baja el
 * token, el piso de 3 lo detiene antes de que el boton desaparezca (que es el defecto que ya
 * ocurrio con `text-tinta-suave/40`); si alguien lo sube pensando que "mas contraste es mejor", el
 * techo de 4,5 obliga a volver a leer esta nota antes de borrar la distincion.
 */
describe('el estado deshabilitado se ve apagado, y esta medido', () => {
  /**
   * El punto BAJO del latido se declara como rango, no se sube (2026-09-09).
   *
   * Con menos movimiento pedido el anillo late entre `--peligro-fuerte` (alfa 1) y
   * `--peligro-latido` (0,45), y ese punto bajo da 2,06:1 contra el fondo, por debajo del 3:1 de
   * WCAG 1.4.11. **No es un incumplimiento y por eso no se sube:** 1.4.11 mide el estado en REPOSO
   * de lo que identifica un control, y aqui el reposo es el anillo pleno, que ya se mide arriba. El
   * punto bajo es un instante de 0,45 s dentro de un latido que dura 1,8 s, y mientras tanto el
   * relleno reforzado sigue puesto.
   *
   * Subirlo hasta 3:1 exigiria alfa ~0,65, y ahi el latido deja de verse, que era justo lo que
   * Johann pidio que se notara. Lo que no se acepta es dejarlo sin numero.
   */
  it('el punto bajo del latido se atenua sin desaparecer', () => {
    const bajo = contraste(componer(token('peligro-latido'), FONDO), FONDO)
    expect(bajo, 'el latido se apaga tanto que parece un destello').toBeGreaterThan(1.5)
    expect(bajo, 'el latido no baja lo suficiente para notarse').toBeLessThan(NO_TEXTUAL)

    // Y que de verdad SEA un punto bajo del alto, no un valor suelto que alguien igualo sin querer.
    const alto = contraste(componer(token('peligro-fuerte'), FONDO), FONDO)
    expect(alto, 'el latido no tiene amplitud: el punto alto y el bajo se parecen').toBeGreaterThan(bajo * 1.5)
  })

  it('`--tinta-tenue` cae entre 3:1 y 4,5:1 sobre las dos superficies donde se usa', () => {
    for (const fondo of [FONDO, SUPERFICIE]) {
      const medido = contraste(componer(token('tinta-tenue'), fondo), fondo)
      expect(medido).toBeGreaterThanOrEqual(NO_TEXTUAL)
      expect(medido).toBeLessThan(4.5)
    }
  })
})

/**
 * Lo que el NAVEGADOR pinta si el proyecto no lo fija.
 *
 * Son tres superficies que no se ven en ningun `className` y que aparecieron una por una, cada vez
 * porque alguien abrio la app y miro: el fondo de los campos, el texto de ejemplo y el
 * autorrelleno. Las tres las pintaba Chrome con sus propios colores, calculados para otro tema, y
 * ninguna medicion de tokens las delataba porque el problema no era el valor del token sino que
 * nadie lo estuviera usando.
 *
 * Este guard no comprueba que se APLIQUEN (eso es del E2E, que le pregunta al navegador): comprueba
 * que la regla siga escrita. Es el minimo que evita que se borren "limpiando" CSS que parece muerto.
 */
describe('las superficies que pinta el navegador estan cubiertas', () => {
  it.each([
    ['el fondo y la tinta de los campos', /input,[\s\S]{0,40}select\s*\{[\s\S]{0,120}background-color:\s*var\(--superficie\)/],
    ['el texto de ejemplo', /input::placeholder/],
    // `background-color` no funciona en este estado: Chrome lo ignora. La sombra interior es la
    // unica via, asi que se exige ESA, no una cualquiera.
    ['el autorrelleno de Chrome', /input:-webkit-autofill[\s\S]{0,400}box-shadow:[^;]*var\(--superficie\) inset/],
  ])('%s', (_nombre, patron) => {
    expect(CSS).toMatch(patron)
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

  /**
   * Este guard corre sobre TODO `src`, no sobre la lista de pantallas, y la diferencia no es de
   * estilo: la primera version solo miraba la lista y por eso **no vio** que `vista/firma.tsx`
   * llevaba `text-tinta-suave/70` desde la Ola 3, o sea el mismo defecto, escrito dos olas antes,
   * dentro del elemento que se captura como `.jpeg`. Lo encontro una auditoria, no el test.
   *
   * Ponerle opacidad a un token no es correcto en NINGUN archivo, asi que no hay razon para que el
   * guard tenga una lista: una lista es justo por donde se escapo.
   */
  it('ningun archivo de src le pone opacidad a un token', () => {
    const archivos = globSync('**/*.tsx', { cwd: fileURLToPath(new URL('..', import.meta.url)) })
    const culpables: string[] = []
    for (const archivo of archivos) {
      const fuente = sinComentarios(readFileSync(new URL(`../${archivo}`, import.meta.url), 'utf8'))
      fuente.split('\n').forEach((linea, i) => {
        if (OPACIDAD_SOBRE_TOKEN.test(linea)) culpables.push(`${archivo}:${i + 1}: ${linea.trim()}`)
      })
    }
    expect(culpables, 'el modificador /N no se aplica sobre estos tokens: agrega un token en su lugar').toEqual([])
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
