import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect } from '@playwright/test'

/**
 * Guard de los asserts de fuga, agregado en la unidad 7a.
 *
 * Dos suites comprueban que el HTML del servidor NO contiene datos de la tarjeta, buscando los
 * valores de un perfil de prueba dentro del HTML. Desde que la app tiene idiomas, ese HTML lleva el
 * catalogo de mensajes completo, asi que **un valor de prueba copiado de un `placeholder` del editor
 * aparece en el HTML sin que se haya filtrado nada**, y el assert se pone en rojo diciendo justo lo
 * contrario de lo que esta pasando.
 *
 * Ocurrio dos veces mientras se escribia la Ola 7 (con el titular y con el telefono), asi que en vez
 * de arreglarlo dos veces se nombra: si vuelve a pasar, el mensaje dice que hay que mover el PERFIL,
 * no el assert.
 *
 * Vive en un archivo aparte porque Playwright prohibe que un spec importe a otro.
 */
const CATALOGO = ['es-CO', 'en']
  .map((idioma) => readFileSync(join(process.cwd(), 'messages', `${idioma}.json`), 'utf8'))
  .join(' ')

export function ningunValorEsCopyDeLaInterfaz(valores: readonly string[]): void {
  for (const valor of valores) {
    expect(
      CATALOGO,
      `el valor de prueba "${valor}" es tambien una cadena de la interfaz, asi que el HTML lo trae sin que se haya filtrado nada: cambia el PERFIL de prueba, no este assert`,
    ).not.toContain(valor)
  }
}
