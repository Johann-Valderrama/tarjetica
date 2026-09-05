#!/usr/bin/env node
/**
 * Cuanto cabe en el QR antes de que deje de escanearse (insumo de la Ola 4).
 *
 * Responde una pregunta concreta: si TODA la informacion viaja dentro del vCard (D3a), ¿en que
 * punto el codigo se vuelve demasiado denso para leerse de una pantalla a otra?
 *
 * El piso practico son ~2,5 px por cuadrito EN LA IMAGEN DE LA CAMARA, no en la pantalla, y va con
 * un colchon de 20-30% para luz, angulo y camaras de gama baja. Se mide contra los dos tamaños
 * reales que la vista produce hoy, medidos en el navegador:
 *   - telefono chico (375x667), PEOR caso de texto: teja de 296 px menos 24 de relleno = 272
 *   - telefono alto (412x915):                        teja de 356 px menos 24 de relleno = 332
 *
 * Los dos suben cuando hay menos texto, porque el QR absorbe la holgura por construccion.
 *
 * Uso:  node scripts/medir-densidad-qr.mjs
 */
import QRCode from 'qrcode'

const CODIGO_CHICO = 272
const CODIGO_ALTO = 332
const PISO = 2.5

/** Plegado RFC 6350 a 75 octetos, igual que el `.vcf` de la landing de referencia. */
function plegar(linea) {
  const bytes = Buffer.from(linea, 'utf8')
  if (bytes.byteLength <= 75) return linea
  const partes = []
  let actual = Buffer.alloc(0)
  for (const ch of linea) {
    const b = Buffer.from(ch, 'utf8')
    if (actual.byteLength + b.byteLength > 74) {
      partes.push(actual.toString('utf8'))
      actual = Buffer.alloc(0)
    }
    actual = Buffer.concat([actual, b])
  }
  partes.push(actual.toString('utf8'))
  return partes.join('\r\n ')
}

const escapar = (v) => String(v).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')

/**
 * Construye el vCard con los campos que se le pidan. Solo `FN`, sin `N` estructurado: es un gotcha
 * heredado y documentado, porque Google Contacts duplica el apellido al mezclar los dos.
 */
function vcard(t, campos) {
  const l = ['BEGIN:VCARD', 'VERSION:3.0']
  l.push(`FN:${escapar([t.n, t.a].filter(Boolean).join(' '))}`)
  if (campos.has('cargo') && t.c) l.push(`TITLE:${escapar(t.c)}`)
  if (campos.has('empresa') && t.em) l.push(`ORG:${escapar(t.em)}`)
  if (campos.has('tel1') && t.t?.[0]) l.push(`TEL;TYPE=CELL:${escapar(t.t[0].n)}`)
  if (campos.has('correo') && t.co) l.push(`EMAIL:${escapar(t.co)}`)
  if (campos.has('telN')) for (const tel of (t.t ?? []).slice(1)) l.push(`TEL;TYPE=WORK:${escapar(tel.n)}`)
  if (campos.has('web') && t.w) l.push(`URL:${escapar(t.w)}`)
  if (campos.has('redes')) {
    if (t.li) l.push(`URL:https://linkedin.com/in/${escapar(t.li)}`)
    if (t.ig) l.push(`URL:https://instagram.com/${escapar(t.ig)}`)
    if (t.tk) l.push(`URL:https://tiktok.com/@${escapar(t.tk)}`)
    if (t.fb) l.push(`URL:https://facebook.com/${escapar(t.fb)}`)
  }
  if (campos.has('enlaces')) for (const e of t.l ?? []) l.push(`URL:${escapar(e.u)}`)
  if (campos.has('direccion') && t.d) l.push(`ADR;TYPE=WORK:;;${escapar(t.d)};;;;`)
  if (campos.has('texto')) {
    const nota = [t.ti, t.de].filter(Boolean).join(' ')
    if (nota) l.push(`NOTE:${escapar(nota)}`)
  }
  l.push('END:VCARD')
  return l.map(plegar).join('\r\n')
}

/** Perfil completo, con todos los campos que el editor permite llenar. */
const LLENA = {
  n: 'Johann',
  a: 'Valderrama',
  c: 'CTO',
  em: 'Zelandia IT Solutions',
  co: 'johann@zelandia.io',
  t: [
    { n: '+57 319 248 0121', e: 'whatsapp' },
    { n: '+57 601 555 0000', e: 'oficina' },
    { n: '+57 310 222 3344', e: 'movil' },
  ],
  w: 'https://johannvalderrama.com',
  li: 'johannvalderrama',
  ig: 'johannvn',
  tk: 'johannvn',
  fb: 'johannvalderrama',
  l: [
    { u: 'https://johannvalderrama.com/portafolio', e: 'Portafolio' },
    { u: 'https://zelandia.io', e: 'Zelandia' },
  ],
  d: 'Bogotá · Colombia',
  ti: 'Recupera las horas que tu operación te quita.',
  de: 'Tu equipo deja el trabajo repetitivo y vuelve a lo que de verdad importa: decidir, crear.',
}

const NIVELES = [
  ['1. solo lo que se VE en la tarjeta', ['cargo', 'empresa', 'tel1']],
  ['2. + correo', ['cargo', 'empresa', 'tel1', 'correo']],
  ['3. + los otros telefonos y el sitio web', ['cargo', 'empresa', 'tel1', 'correo', 'telN', 'web']],
  ['4. + LinkedIn y las demas redes', ['cargo', 'empresa', 'tel1', 'correo', 'telN', 'web', 'redes']],
  ['5. + enlaces libres y direccion', ['cargo', 'empresa', 'tel1', 'correo', 'telN', 'web', 'redes', 'enlaces', 'direccion']],
  ['6. TODO, con los dos bloques de texto', ['cargo', 'empresa', 'tel1', 'correo', 'telN', 'web', 'redes', 'enlaces', 'direccion', 'texto']],
]

console.log('DENSIDAD DEL QR SEGUN QUE SE METE ADENTRO')
console.log(`Piso practico de lectura: ${PISO} px por cuadrito. Correccion M, margen 4 (la norma).\n`)
console.log('nivel'.padEnd(42), 'bytes'.padStart(6), 'ver'.padStart(4), 'mod'.padStart(4), 'chico'.padStart(7), 'alto'.padStart(7))
console.log('-'.repeat(76))

for (const [nombre, campos] of NIVELES) {
  const texto = vcard(LLENA, new Set(campos))
  const qr = QRCode.create(texto, { errorCorrectionLevel: 'M' })
  // El margen de 4 modulos por lado es OBLIGATORIO: es la zona silenciosa que el decodificador usa
  // para ENCONTRAR el simbolo, no un adorno.
  const modulos = qr.modules.size + 8
  const chico = CODIGO_CHICO / modulos
  const alto = CODIGO_ALTO / modulos
  const marca = (v) => (v >= PISO ? v.toFixed(2) : v.toFixed(2) + ' ✗')
  console.log(
    nombre.padEnd(42),
    String(Buffer.byteLength(texto)).padStart(6),
    String(qr.version).padStart(4),
    String(qr.modules.size).padStart(4),
    marca(chico).padStart(7),
    marca(alto).padStart(7),
  )
}

console.log('\n✗ = por debajo del piso: el codigo puede no leerse de una pantalla a otra.')
console.log('chico = 375x667 con el texto en su tope (272 px de codigo) · alto = 412x915 (332 px)')
console.log('Los dos son el PISO: con menos texto el QR crece, porque absorbe la holgura.')
