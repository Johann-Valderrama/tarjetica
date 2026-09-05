import { describe, expect, it } from 'vitest'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import { PNG } from 'pngjs'
import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { vcardParaQr } from '@/features/tarjeta/vcard/generar'
import { OPCIONES_QR } from '@/features/tarjeta/qr/opciones'

/**
 * Unidad 4d del PRP-TD-001: **que el QR se VEA bien no prueba que se LEA.**
 *
 * Es mecanicamente testeable, asi que se mide en vez de juzgarlo a ojo. Se genera el simbolo con
 * `OPCIONES_QR`, o sea con los MISMOS parametros que despacha el componente (por eso viven en un
 * modulo aparte), se decodifica con un lector independiente, y se compara **caracter por caracter**
 * con el vCard original.
 *
 * ⚠️ **Lo que esta prueba NO cubre, y hay que decirlo:** decodifica el archivo que el propio codigo
 * acaba de producir, en las condiciones ideales en que se genero. La camara de un telefono de gama
 * baja, el brillo bajado para ahorrar bateria y el reflejo de las luces de un salon no estan aqui.
 * Ese arbitro es el gate fisico 4e, que es del humano. Esta prueba caza el fallo de codificacion,
 * no el de escaneabilidad.
 */

/** Decodifica un PNG de QR con un lector independiente de la libreria que lo genero. */
function leerQr(png: Buffer): string | null {
  const imagen = PNG.sync.read(png)
  const leido = jsQR(new Uint8ClampedArray(imagen.data), imagen.width, imagen.height)
  return leido?.data ?? null
}

const MINIMA: Tarjeta = { n: 'Ana', a: 'Ríos', t: [{ n: '310 555 1234', e: 'whatsapp' }] }

/** Todos los campos que el editor deja llenar. Es el caso de prueba que exige el PRP. */
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

describe('el QR generado se DECODIFICA, no solo se ve', () => {
  for (const [nombre, tarjeta] of [
    ['tarjeta minima', MINIMA],
    ['tarjeta con TODOS los campos llenos', LLENA],
  ] as const) {
    it(`${nombre}: el texto leido coincide caracter por caracter`, async () => {
      const esperado = vcardParaQr(tarjeta)
      const png = await QRCode.toBuffer(esperado, { ...OPCIONES_QR })
      expect(leerQr(png)).toBe(esperado)
    })
  }

  it('los acentos y la eñe sobreviven al viaje completo', async () => {
    const texto = vcardParaQr(LLENA)
    const leido = leerQr(await QRCode.toBuffer(texto, { ...OPCIONES_QR }))
    expect(leido).toContain('María José Peña Gutiérrez')
    expect(leido).toContain('Bogotá')
  })

  it('la zona silenciosa son 4 modulos, DEDUCIDOS de los pixeles y no de la constante', async () => {
    // La norma (DENSO WAVE) exige 4 modulos de zona silenciosa por lado, y es la que el
    // decodificador usa para ENCONTRAR el simbolo. El `4` de aqui es LA NORMA, escrita a mano: si
    // se leyera de `MARGEN_MODULOS`, el assert se compararia consigo mismo y pasaria con cualquier
    // valor. Medido: con `margin: 1` (la desviacion que trae el codigo de la landing) la version
    // anterior de esta prueba seguia en verde.
    const ZONA_SILENCIOSA_DE_LA_NORMA = 4

    const texto = vcardParaQr(MINIMA)
    const simbolo = QRCode.create(texto, { errorCorrectionLevel: OPCIONES_QR.errorCorrectionLevel })
    const png = PNG.sync.read(await QRCode.toBuffer(texto, { ...OPCIONES_QR }))

    // Filas completamente blancas contadas desde arriba: son el margen pintado, en pixeles.
    let margenEnPixeles = 0
    for (let y = 0; y < png.height; y++) {
      const centro = (png.width * y + Math.floor(png.width / 2)) << 2
      if (png.data[centro] !== 255) break
      margenEnPixeles++
    }

    // Dos incognitas (pixeles por modulo y margen) y dos medidas independientes:
    //   ancho = (modulos + 2 * margen) * escala   y   margenEnPixeles = margen * escala
    // De ahi sale la escala sin mirar la configuracion, y con ella el margen REAL del PNG.
    const pixelesPorModulo = (png.width - 2 * margenEnPixeles) / simbolo.modules.size
    const margenReal = margenEnPixeles / pixelesPorModulo

    expect(margenReal).toBeGreaterThanOrEqual(ZONA_SILENCIOSA_DE_LA_NORMA)
  })
})
