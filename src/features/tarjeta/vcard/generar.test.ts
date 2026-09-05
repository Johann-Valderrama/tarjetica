import { describe, expect, it } from 'vitest'
import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { MARCA } from '@/features/tarjeta/vista/firma'
import { nombreDeArchivo, octetos, vcardParaArchivo, vcardParaQr } from '@/features/tarjeta/vcard/generar'

/**
 * Verificacion de la unidad 4a. Los dos gotchas que vigila fallan en SILENCIO: el vCard se genera,
 * el telefono lo importa, y lo unico que pasa es que el contacto queda mal guardado en la agenda de
 * OTRA persona, donde nadie tiene consola para mirar. Por eso se prueban con asserts, no leyendo.
 *
 * El desplegado de aqui es un lector de vCard de verdad, no un `split` por lineas: implementa el
 * unfolding de RFC 6350 (quitar `CRLF` mas un espacio de continuacion). Si el generador plegara mal,
 * este lector devolveria valores partidos, que es exactamente lo que veria un cliente de contactos.
 */
function desplegar(vcf: string): string[] {
  return vcf
    .replace(/\r\n[ \t]/g, '')
    .split('\r\n')
    .filter((l) => l.length > 0)
}

/** Parte una linea en `PROPIEDAD;PARAMS` y su valor. El valor puede traer `:`, el nombre no. */
function propiedadDe(linea: string): string {
  return linea.slice(0, linea.indexOf(':'))
}

const MINIMA: Tarjeta = { n: 'Ana' }

/** La tarjeta que mas duele: coma en el cargo, tildes y eñes, y todos los campos llenos. */
const LLENA: Tarjeta = {
  n: 'María José',
  a: 'Peña Gutiérrez',
  c: 'Directora de operaciones, logística y compras',
  em: 'Alimentos del Norte S.A.S.',
  co: 'maria.pena@example.com',
  t: [
    { n: '+57 310 555 1234', e: 'whatsapp' },
    { n: '+57 601 555 0000', e: 'oficina' },
    { n: '+57 320 111 2233', e: 'movil' },
  ],
  w: 'https://alimentosdelnorte.example.com',
  li: 'mariapena',
  ig: 'mariapena',
  tk: 'mariapena',
  fb: 'mariapena',
  l: [
    { u: 'https://example.com/portafolio', e: 'Portafolio' },
    { u: 'https://example.com/agenda', e: 'Agenda' },
  ],
  d: 'Bogotá · Colombia',
  ti: 'Recupera las horas que tu operación te quita.',
  de: 'Tu equipo deja el trabajo repetitivo; vuelve a decidir, crear y vender.',
}

describe('vCard: envoltorio y estructura', () => {
  it('abre y cierra como manda vCard 3.0', () => {
    const lineas = desplegar(vcardParaQr(LLENA))
    expect(lineas[0]).toBe('BEGIN:VCARD')
    expect(lineas[1]).toBe('VERSION:3.0')
    expect(lineas.at(-1)).toBe('END:VCARD')
    expect(vcardParaQr(LLENA).endsWith('\r\n')).toBe(true)
  })

  it('lleva FN y NUNCA N estructurado (Google Contacts duplica el apellido)', () => {
    const propiedades = desplegar(vcardParaQr(LLENA)).map(propiedadDe)
    expect(propiedades).toContain('FN')
    expect(propiedades.some((p) => p === 'N' || p.startsWith('N;'))).toBe(false)
  })

  it('la tarjeta minima produce un vCard valido, con solo el nombre', () => {
    expect(desplegar(vcardParaQr(MINIMA))).toEqual(['BEGIN:VCARD', 'VERSION:3.0', 'FN:Ana', 'END:VCARD'])
  })
})

describe('vCard: escape (RFC 2426)', () => {
  it('una coma en el cargo NO parte el campo en dos', () => {
    const title = desplegar(vcardParaQr(LLENA)).find((l) => l.startsWith('TITLE:'))!
    // La coma va escapada, y al des-escapar vuelve el texto ENTERO que la persona escribio.
    expect(title).toBe('TITLE:Directora de operaciones\\, logística y compras')
    expect(title.slice('TITLE:'.length).replace(/\\,/g, ',')).toBe(LLENA.c)
  })

  it('escapa barra invertida, coma, punto y coma y salto de linea', () => {
    const conTodo: Tarjeta = { n: 'X', c: 'a;b,c\\d', de: 'linea1\nlinea2' }
    const lineas = desplegar(vcardParaQr(conTodo))
    expect(lineas).toContain('TITLE:a\\;b\\,c\\\\d')
    expect(lineas).toContain('NOTE:linea1\\nlinea2')
  })

  it('el punto y coma ESTRUCTURAL de ADR sobrevive, y el del valor va escapado', () => {
    const linea = desplegar(vcardParaQr({ n: 'X', d: 'Calle 1; oficina 2' })).find((l) =>
      l.startsWith('ADR'),
    )
    expect(linea).toBe('ADR;TYPE=WORK:;;Calle 1\\; oficina 2;;;;')
  })
})

describe('vCard: plegado a 75 octetos (RFC 6350)', () => {
  it('ninguna linea servida pasa de 75 octetos, ni con la foto adentro', () => {
    const conFoto = vcardParaArchivo(LLENA, `data:image/jpeg;base64,${'A'.repeat(4000)}`)
    for (const vcf of [vcardParaQr(LLENA), conFoto]) {
      for (const linea of vcf.split('\r\n')) {
        expect(octetos(linea), `linea de ${octetos(linea)} octetos`).toBeLessThanOrEqual(75)
      }
    }
  })

  it('cuenta OCTETOS y no caracteres: un texto de puras tildes se pliega antes', () => {
    // 70 caracteres "á" son 140 octetos. Contando caracteres cabrian en una linea; contando
    // octetos, no. Es exactamente el caso que el `fold()` de la landing de referencia hace mal.
    const primera = vcardParaQr({ n: 'X', de: 'á'.repeat(70) })
      .split('\r\n')
      .find((l) => l.startsWith('NOTE:'))!
    expect(octetos(primera)).toBeLessThanOrEqual(75)
  })

  it('no parte un caracter multi-octeto por la mitad (nada de mojibake)', () => {
    const vcf = vcardParaQr({ n: 'X', de: 'ñ'.repeat(120) })
    // Si un corte hubiera partido una eñe, al desplegar no volveria el texto original.
    expect(desplegar(vcf).find((l) => l.startsWith('NOTE:'))).toBe(`NOTE:${'ñ'.repeat(120)}`)
    expect(vcf).not.toContain('�')
  })

  it('el desplegado devuelve el valor original, con los dos bloques de texto juntos', () => {
    const nota = desplegar(vcardParaQr(LLENA)).find((l) => l.startsWith('NOTE:'))!
    const original = nota.slice('NOTE:'.length).replace(/\\,/g, ',').replace(/\\;/g, ';')
    expect(original).toBe(`${LLENA.ti} ${LLENA.de}`)
  })
})

describe('vCard: telefonos y enlaces', () => {
  it('mapea cada etiqueta a su tipo, y WhatsApp cuenta como celular', () => {
    const tel = desplegar(vcardParaQr(LLENA)).filter((l) => l.startsWith('TEL'))
    expect(tel).toEqual([
      'TEL;TYPE=CELL:+57 310 555 1234',
      'TEL;TYPE=WORK:+57 601 555 0000',
      'TEL;TYPE=CELL:+57 320 111 2233',
    ])
  })

  it('las redes viajan como URL completa, no como usuario suelto', () => {
    const urls = desplegar(vcardParaQr(LLENA)).filter((l) => l.startsWith('URL:'))
    expect(urls).toContain('URL:https://linkedin.com/in/mariapena')
    expect(urls).toContain('URL:https://instagram.com/mariapena')
    expect(urls).toContain('URL:https://tiktok.com/@mariapena')
    expect(urls).toContain('URL:https://facebook.com/mariapena')
    expect(urls).toContain('URL:https://example.com/portafolio')
  })
})

describe('las dos invariantes que no puede romper nadie', () => {
  it('G5: el vCard del QR NO contiene la foto', () => {
    // La firma de `vcardParaQr` ni siquiera admite una foto; esto lo confirma sobre el texto real.
    expect(vcardParaQr(LLENA)).not.toContain('PHOTO')
  })

  it('el `.vcf` descargado SI la lleva, embebida en base64', () => {
    const vcf = vcardParaArchivo(LLENA, `data:image/jpeg;base64,${'A'.repeat(300)}`)
    expect(desplegar(vcf).some((l) => l.startsWith('PHOTO;ENCODING=b;TYPE=JPEG:'))).toBe(true)
  })

  it('sin foto, el `.vcf` sale igual de valido y sin una linea PHOTO vacia', () => {
    expect(vcardParaArchivo(LLENA)).not.toContain('PHOTO')
  })

  it('G4: la firma de marca NUNCA entra a ningun vCard', () => {
    for (const vcf of [vcardParaQr(LLENA), vcardParaArchivo(LLENA, 'data:image/jpeg;base64,AAAA')]) {
      expect(vcf.toLowerCase()).not.toContain(MARCA.nombre.toLowerCase())
      if (MARCA.dominio) expect(vcf).not.toContain(MARCA.dominio)
    }
  })
})

describe('nombre del archivo descargado', () => {
  it('quita tildes y espacios, y nunca sale vacio', () => {
    expect(nombreDeArchivo(LLENA)).toBe('maria-jose-pena-gutierrez.vcf')
    expect(nombreDeArchivo({ n: '文' })).toBe('tarjeta.vcf')
  })
})
