import { describe, expect, it } from 'vitest'
import es from '../../messages/es-CO.json'
import en from '../../messages/en.json'
import { IDIOMAS, IDIOMA_POR_DEFECTO, negociarIdioma } from '@/i18n/locales'

/**
 * Verificacion de la unidad 7a.
 *
 * **Todos los fallos de un archivo de traducciones son MUDOS.** Una clave que existe en español y
 * falta en ingles no rompe el build, no rompe el lint y no rompe ningun test de funcionamiento: la
 * pagina se pinta igual y en su lugar sale la ruta de la clave. Solo lo ve quien abra la app en ese
 * idioma, que por definicion no es quien la escribio. Por eso la paridad se mide aqui.
 *
 * El typecheck ya cubre el otro lado (`src/global.d.ts` tipa las claves contra `es-CO.json`, asi que
 * un `t('editor.titlo')` no compila). Lo que ESO no puede ver es si `en.json` va al dia, porque no
 * es el archivo de referencia. Esa mitad es la que vive en este archivo.
 */

type Arbol = { [k: string]: string | Arbol }

/** Aplana a rutas con punto, que es como se nombran las claves en el codigo. */
function rutas(arbol: Arbol, prefijo = ''): string[] {
  return Object.entries(arbol).flatMap(([k, v]) =>
    typeof v === 'string' ? [`${prefijo}${k}`] : rutas(v, `${prefijo}${k}.`),
  )
}

function valor(arbol: Arbol, ruta: string): string {
  return ruta.split('.').reduce<string | Arbol>((n, k) => (n as Arbol)[k], arbol) as string
}

/** `{modulos}`, `{campo}`, `{n}`... Si no coinciden, un idioma pinta el hueco sin rellenar. */
function marcadores(texto: string): string[] {
  return [...texto.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
}

/** Las etiquetas de texto enriquecido (`<fuerte>`), que el componente tiene que saber renderizar. */
function etiquetas(texto: string): string[] {
  return [...texto.matchAll(/<(\w+)>/g)].map((m) => m[1]).sort()
}

const ES = es as unknown as Arbol
const EN = en as unknown as Arbol

describe('los dos idiomas dicen lo mismo', () => {
  it('tienen exactamente las mismas claves', () => {
    const enEs = rutas(ES).sort()
    const enEn = rutas(EN).sort()
    expect(enEn.filter((r) => !enEs.includes(r)), 'sobran en en.json').toEqual([])
    expect(enEs.filter((r) => !enEn.includes(r)), 'faltan en en.json').toEqual([])
  })

  it('ninguna traduccion esta vacia', () => {
    for (const arbol of [ES, EN]) {
      for (const r of rutas(arbol)) expect(valor(arbol, r).trim(), `vacia: ${r}`).not.toBe('')
    }
  })

  it('cada clave lleva los mismos marcadores y las mismas etiquetas en los dos idiomas', () => {
    for (const r of rutas(ES)) {
      expect(marcadores(valor(EN, r)), `marcadores distintos en ${r}`).toEqual(marcadores(valor(ES, r)))
      expect(etiquetas(valor(EN, r)), `etiquetas distintas en ${r}`).toEqual(etiquetas(valor(ES, r)))
    }
  })

  it('hay un archivo por cada idioma declarado, y ni uno mas', () => {
    expect([...IDIOMAS].sort()).toEqual(['en', 'es-CO'])
  })
})

describe('lo que el copy NO puede perder', () => {
  /**
   * G2 es una frase que el operador aprobo LITERAL, con esas palabras y esas tildes. Se verifica
   * aqui porque un archivo de traducciones es justo donde alguien la "mejoraria" de paso.
   */
  it('el aviso de G2 en español es la frase exacta, sin reformular', () => {
    expect(valor(ES, 'app.avisoG2')).toBe('No guardamos tus datos en ningún servidor.')
  })

  /**
   * Los TRES limites de la unidad 7b. El assert existe porque son decisiones tomadas, y callarlas
   * convierte una limitacion honesta en una promesa rota: si alguien borra uno del JSON, el bloque
   * de la interfaz simplemente pinta un renglon menos y nada mas se entera.
   */
  it('los tres limites del producto estan en los dos idiomas', () => {
    for (const arbol of [ES, EN]) {
      for (const limite of ['senal', 'equipo', 'enlaceIrrevocable']) {
        expect(valor(arbol, `limites.${limite}`).length, `falta el limite ${limite}`).toBeGreaterThan(20)
      }
    }
  })
})

describe('la negociacion de idioma atiende al desconocido que abre un enlace', () => {
  it('elige ingles si el navegador lo pide primero', () => {
    expect(negociarIdioma('en-US,en;q=0.9')).toBe('en')
  })

  it('cualquier variante de español cae en es-CO, no solo es-CO exacto', () => {
    for (const cabecera of ['es', 'es-ES,es;q=0.9', 'es-419', 'es-MX,en;q=0.8']) {
      expect(negociarIdioma(cabecera), cabecera).toBe('es-CO')
    }
  })

  it('un idioma que no existe aqui cae al de por defecto, no a una pagina en blanco', () => {
    expect(negociarIdioma('de-DE,de;q=0.9')).toBe(IDIOMA_POR_DEFECTO)
    expect(negociarIdioma(null)).toBe(IDIOMA_POR_DEFECTO)
    expect(negociarIdioma('')).toBe(IDIOMA_POR_DEFECTO)
  })
})
