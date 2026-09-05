import type { Tarjeta, Telefono } from '@/features/tarjeta/modelo/tarjeta'

/**
 * Unidad 4a del PRP-TD-001: el vCard 3.0, generado EN EL CLIENTE.
 *
 * Es la SALIDA PRINCIPAL 1 del producto: lo que el codigo QR le mete a la agenda de la otra
 * persona. Aqui viven los dos gotchas heredados de `Personal landing page`, y los dos fallan en
 * SILENCIO (el contacto se guarda, pero mal):
 *
 * 1. **Solo `FN`, sin `N` estructurado.** Heredado de `src/shared/config/card.ts:62-64` con su razon
 *    escrita: mezclar `FN` con `N` hace que Google Contacts duplique el apellido y el contacto
 *    quede como "Ana Rios Rios".
 * 2. **Plegado a 75 octetos (RFC 6350 seccion 3.2).** Sin el, un cliente de contactos puede partir
 *    un campo largo por la mitad o descartar la linea entera.
 *
 * **Dos funciones, no una con bandera.** `vcardParaQr` no acepta foto en su firma: es el tipo, y no
 * la disciplina de quien edite despues, lo que sostiene la invariante G5 (la foto NUNCA entra al
 * QR, porque cada byte ahi es densidad y la densidad decide si el codigo se lee o no).
 *
 * NUNCA la firma de marca (G4) dentro de ningun vCard, ni como `URL` ni dentro de `NOTE`: ese
 * contacto aterriza en la agenda de un TERCERO que jamas uso la herramienta.
 */

/**
 * `TextEncoder` y no `Buffer`: este codigo corre en el NAVEGADOR. `Buffer` es API de Node y Next no
 * la rellena en el bundle del cliente, asi que usarla aqui reventaria el QR en el telefono del
 * usuario con un `ReferenceError` que ninguna prueba de Node delata, porque en Node `Buffer` existe.
 */
const OCTETOS = new TextEncoder()

/**
 * Cuantos OCTETOS pesa un texto. Se exporta porque el aviso de densidad (4f) mide el ahorro de
 * quitar un campo, y tiene que contarlo con la MISMA vara con la que se pliega aqui: contar
 * caracteres daria un ahorro distinto en cuanto el dato lleve una tilde.
 */
export function octetos(texto: string): number {
  return OCTETOS.encode(texto).length
}

/** Un contenido de linea no puede pasar de esto; la continuacion se gasta un octeto en su espacio. */
const OCTETOS_POR_LINEA = 74

/**
 * Escapa un valor de texto de vCard (RFC 2426 seccion 2). La barra invertida va PRIMERA: si se
 * escapara despues, se re-escaparian las barras que las otras reglas acaban de introducir.
 */
export function escaparValor(valor: string): string {
  return valor
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

/**
 * Pliega una linea larga a 75 octetos con `CRLF` + espacio de continuacion.
 *
 * **Cuenta OCTETOS, no caracteres, y corta por punto de codigo.** Es la diferencia con el `fold()`
 * de la landing (`src/app/api/vcard/route.ts:19-20`), que corta por `String.length`: en un dato en
 * espanol ("Bogota", "Rios", "Pena") una tilde son dos octetos y ahi cuenta como uno, asi que ese
 * corte se pasa del limite de la norma; y en el peor caso parte una tilde o un emoji por la mitad y
 * produce bytes invalidos. La norma habla de octetos.
 *
 * La medicion de densidad (`scripts/medir-densidad-qr.mjs`) ya asume este mismo plegado, asi que
 * cambiarlo moveria los numeros sobre los que se decidio no recortar ningun campo.
 */
export function plegar(linea: string): string {
  if (OCTETOS.encode(linea).length <= OCTETOS_POR_LINEA) return linea

  const partes: string[] = []
  let actual = ''
  let octetos = 0

  // `for...of` itera por punto de codigo, no por unidad UTF-16: nunca parte un par suplente.
  for (const caracter of linea) {
    const suyos = OCTETOS.encode(caracter).length
    if (octetos + suyos > OCTETOS_POR_LINEA) {
      partes.push(actual)
      actual = ''
      octetos = 0
    }
    actual += caracter
    octetos += suyos
  }
  partes.push(actual)

  return partes.join('\r\n ')
}

/** El WhatsApp y el movil son el mismo aparato para un cliente de contactos; la oficina no. */
function tipoDeTelefono(etiqueta: Telefono['e']): string {
  return etiqueta === 'oficina' ? 'WORK' : 'CELL'
}

/**
 * Las lineas de contenido del vCard, en orden, SIN envoltorio y SIN plegar.
 *
 * Vive aparte porque las dos salidas (el QR y el archivo) comparten exactamente este cuerpo, y lo
 * unico que las separa es la foto.
 */
function lineasDeContenido(t: Tarjeta): string[] {
  const l: string[] = []

  // Solo FN. Ver el gotcha 1 de arriba.
  l.push(`FN:${escaparValor([t.n, t.a].filter(Boolean).join(' '))}`)
  if (t.c) l.push(`TITLE:${escaparValor(t.c)}`)
  if (t.em) l.push(`ORG:${escaparValor(t.em)}`)

  for (const tel of t.t ?? []) {
    l.push(`TEL;TYPE=${tipoDeTelefono(tel.e)}:${escaparValor(tel.n)}`)
  }
  if (t.co) l.push(`EMAIL:${escaparValor(t.co)}`)
  if (t.w) l.push(`URL:${escaparValor(t.w)}`)

  // Las redes viajan como URL completas: un cliente de contactos las abre, y un humano que mira el
  // contacto reconoce de que red se trata sin que haga falta una etiqueta aparte.
  if (t.li) l.push(`URL:https://linkedin.com/in/${escaparValor(t.li)}`)
  if (t.ig) l.push(`URL:https://instagram.com/${escaparValor(t.ig)}`)
  if (t.tk) l.push(`URL:https://tiktok.com/@${escaparValor(t.tk)}`)
  if (t.fb) l.push(`URL:https://facebook.com/${escaparValor(t.fb)}`)
  for (const enlace of t.l ?? []) l.push(`URL:${escaparValor(enlace.u)}`)

  // El `;` de ADR es ESTRUCTURAL (son 7 componentes). Lo que se escapa es el valor que va adentro,
  // y por eso el escape corre antes de armar la estructura, no sobre la linea ya armada.
  if (t.d) l.push(`ADR;TYPE=WORK:;;${escaparValor(t.d)};;;;`)

  const nota = [t.ti, t.de].filter(Boolean).join(' ')
  if (nota) l.push(`NOTE:${escaparValor(nota)}`)

  return l
}

function envolver(lineas: string[]): string {
  return ['BEGIN:VCARD', 'VERSION:3.0', ...lineas, 'END:VCARD'].map(plegar).join('\r\n') + '\r\n'
}

/**
 * El vCard que va DENTRO del codigo QR.
 *
 * No recibe foto ni puede recibirla: G5 es una invariante de firma, no una nota en un comentario.
 * Lleva todo lo demas que el usuario escribio, porque con un solo QR a ancho completo hay
 * presupuesto de densidad para ello (medido: 2,59 px por cuadrito en el peor caso, sobre el piso
 * practico de 2,5). Si aun asi la tarjeta queda apretada, quien avisa es la unidad 4f.
 */
export function vcardParaQr(tarjeta: Tarjeta): string {
  return envolver(lineasDeContenido(tarjeta))
}

/**
 * El vCard del archivo `.vcf` que el usuario descarga, CON la foto embebida si existe.
 *
 * Aqui la foto si entra, y no contradice a la funcion de arriba: un archivo no tiene piso de
 * lectura. Es el mismo criterio de la landing de referencia, que sirve el `.vcf` con retrato y
 * recorta el QR (`src/shared/config/card.ts:49-72`).
 *
 * @param fotoDataUrl el `data:image/jpeg;base64,...` que dejo la unidad 2e, ya reducido a ~10 KB.
 */
export function vcardParaArchivo(tarjeta: Tarjeta, fotoDataUrl?: string): string {
  const lineas = lineasDeContenido(tarjeta)
  const base64 = fotoDataUrl?.split(',')[1]
  if (base64) lineas.push(`PHOTO;ENCODING=b;TYPE=JPEG:${base64}`)
  return envolver(lineas)
}

/** Nombre del archivo descargado. Sin acentos ni espacios: viaja entre sistemas de archivos. */
export function nombreDeArchivo(tarjeta: Tarjeta): string {
  const base = [tarjeta.n, tarjeta.a]
    .filter(Boolean)
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // El espacio se vuelve guion; si se BORRARA, 'Maria Jose' quedaria 'mariajose'.
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return `${base || 'tarjeta'}.vcf`
}
