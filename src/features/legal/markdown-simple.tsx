import type { ReactNode } from 'react'

/**
 * Parser de Markdown minimo, a proposito NO una libreria general.
 *
 * Cubre exactamente el subconjunto que `contenido.ts` usa: encabezados #/##/###, regla horizontal
 * (---), listas con `-` y `1.`, parrafos, y en linea **negrita**, `codigo` y *cursiva*. No intenta
 * ser un parser de Markdown completo (tablas, enlaces, citas no estan soportados): agregar una
 * dependencia como `react-markdown` para un solo documento estatico seria mas peso del que este
 * problema pide.
 */

function renderInline(texto: string, clavePadre: string): ReactNode[] {
  const partes = texto.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).filter((p) => p !== '')
  return partes.map((parte, i) => {
    const clave = `${clavePadre}-${i}`
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return <strong key={clave}>{parte.slice(2, -2)}</strong>
    }
    if (parte.startsWith('`') && parte.endsWith('`')) {
      return (
        <code key={clave} className="rounded bg-superficie-sutil px-1 py-0.5 text-[0.85em]">
          {parte.slice(1, -1)}
        </code>
      )
    }
    if (parte.startsWith('*') && parte.endsWith('*')) {
      return <em key={clave}>{parte.slice(1, -1)}</em>
    }
    return parte
  })
}

/** Convierte el Markdown de `contenido.ts` en JSX. Agrupa lineas consecutivas por tipo de bloque. */
export function renderizarMarkdownSimple(md: string): ReactNode[] {
  const lineas = md.split('\n')
  const bloques: ReactNode[] = []
  let parrafo: string[] = []
  let lista: { tipo: 'ul' | 'ol'; items: string[] } | null = null

  const cerrarParrafo = () => {
    if (parrafo.length === 0) return
    const clave = `p-${bloques.length}`
    bloques.push(<p key={clave}>{renderInline(parrafo.join(' '), clave)}</p>)
    parrafo = []
  }

  const cerrarLista = () => {
    if (!lista) return
    const clave = `l-${bloques.length}`
    const Tag = lista.tipo
    bloques.push(
      <Tag key={clave} className={Tag === 'ul' ? 'list-disc space-y-1 pl-6' : 'list-decimal space-y-1 pl-6'}>
        {lista.items.map((item, i) => <li key={`${clave}-${i}`}>{renderInline(item, `${clave}-${i}`)}</li>)}
      </Tag>,
    )
    lista = null
  }

  for (const linea of lineas) {
    const l = linea.trim()

    if (l === '') {
      cerrarParrafo()
      cerrarLista()
      continue
    }
    if (l === '---') {
      cerrarParrafo()
      cerrarLista()
      bloques.push(<hr key={`hr-${bloques.length}`} className="border-borde" />)
      continue
    }
    if (l.startsWith('### ')) {
      cerrarParrafo()
      cerrarLista()
      const clave = `h3-${bloques.length}`
      bloques.push(<h3 key={clave} className="text-base font-semibold text-tinta">{renderInline(l.slice(4), clave)}</h3>)
      continue
    }
    if (l.startsWith('## ')) {
      cerrarParrafo()
      cerrarLista()
      const clave = `h2-${bloques.length}`
      bloques.push(<h2 key={clave} className="text-xl font-bold text-tinta">{renderInline(l.slice(3), clave)}</h2>)
      continue
    }
    if (l.startsWith('# ')) {
      cerrarParrafo()
      cerrarLista()
      const clave = `h1-${bloques.length}`
      bloques.push(<h1 key={clave} className="text-2xl font-bold text-tinta">{renderInline(l.slice(2), clave)}</h1>)
      continue
    }
    const item = /^-\s+(.*)/.exec(l) ?? /^\d+\.\s+(.*)/.exec(l)
    if (item) {
      cerrarParrafo()
      const tipo = l.startsWith('-') ? 'ul' : 'ol'
      if (!lista || lista.tipo !== tipo) {
        cerrarLista()
        lista = { tipo, items: [] }
      }
      lista.items.push(item[1])
      continue
    }

    cerrarLista()
    parrafo.push(l)
  }
  cerrarParrafo()
  cerrarLista()
  return bloques
}
