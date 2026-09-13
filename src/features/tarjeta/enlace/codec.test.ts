import { deflateSync } from 'fflate'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { codificar, construirEnlace, decodificar, RUTA_ENLACE } from '@/features/tarjeta/enlace/codec'

/**
 * Verificacion de la unidad 6a. Las dos propiedades del codec se PRUEBAN, no se asumen: un codec
 * asimetrico corrompe la tarjeta de alguien sin avisar, y una foto colada en el payload vuelve el
 * QR del link inescaneable.
 */

const MINIMA: Tarjeta = { n: 'Ana' }

const TIPICA: Tarjeta = {
  n: 'Ana',
  a: 'Ríos',
  c: 'Coordinadora de compras',
  em: 'Alimentos del Norte',
  co: 'ana.rios@example.com',
  t: [{ n: '310 555 1234', e: 'whatsapp' }],
  li: 'anarios',
  d: 'Medellín · Colombia',
}

const LLENA: Tarjeta = {
  ...TIPICA,
  t: [
    { n: '+57 310 555 1234', e: 'whatsapp' },
    { n: '+57 601 555 0000', e: 'oficina' },
    { n: '+57 320 111 2233', e: 'movil' },
  ],
  w: 'https://alimentosdelnorte.example.com',
  ig: 'anarios',
  tk: 'anarios',
  fb: 'anarios',
  l: [
    { u: 'https://example.com/portafolio', e: 'Portafolio' },
    { u: 'https://example.com/agenda', e: 'Agenda' },
  ],
  ti: 'Recupera las horas que tu operación te quita.',
  de: 'Tu equipo deja el trabajo repetitivo; vuelve a decidir, crear y vender.',
}

const PERFILES: [string, Tarjeta][] = [
  ['minima', MINIMA],
  ['tipica', TIPICA],
  ['todos los campos llenos', LLENA],
]

function aBase64Url(bytes: Uint8Array): string {
  let binario = ''
  for (const byte of bytes) binario += String.fromCharCode(byte)
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function payloadPlanoAntiguo(tarjeta: unknown): string {
  const json = new TextEncoder().encode(JSON.stringify(tarjeta))
  const bytes = new Uint8Array(json.byteLength + 1)
  bytes[0] = 0
  bytes.set(json, 1)
  return aBase64Url(bytes)
}

function payloadComprimidoAntiguo(tarjeta: unknown): string {
  const cuerpo = deflateSync(new TextEncoder().encode(JSON.stringify(tarjeta)))
  const bytes = new Uint8Array(cuerpo.byteLength + 1)
  bytes[0] = 1
  bytes.set(cuerpo, 1)
  return aBase64Url(bytes)
}

function version(payload: string): number {
  return atob(payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=')).charCodeAt(0)
}

afterEach(() => vi.unstubAllGlobals())

describe('propiedad 1: el codec es simetrico', () => {
  for (const [nombre, tarjeta] of PERFILES) {
    it(`${nombre}: decode(encode(x)) devuelve x`, async () => {
      const leida = await decodificar(await codificar(tarjeta))
      expect(leida.ok).toBe(true)
      expect(leida.ok && leida.tarjeta).toEqual(tarjeta)
    })
  }

  it('los acentos, la eñe y el punto medio sobreviven', async () => {
    const conTildes: Tarjeta = { n: 'María José', a: 'Peña', d: 'Bogotá · Colombia', ti: 'Ñandú' }
    const leida = await decodificar(await codificar(conTildes))
    expect(leida.ok && leida.tarjeta).toEqual(conTildes)
  })

  it('el payload es seguro en una URL: nada de +, / ni relleno', async () => {
    // `+` se lee como espacio y `/` parte la ruta; el `=` del relleno se pierde al copiar el link
    // desde algunos clientes de mensajeria.
    const payload = await codificar(LLENA)
    expect(payload).toMatch(/^[A-Za-z0-9_-]+$/)
  })
})

describe('propiedad 2: la foto NUNCA entra al payload (G5)', () => {
  it('una clave de foto colada revienta la validacion en vez de viajar', async () => {
    // El compilador ya lo impide (`Tarjeta` es strictObject y no tiene campo de foto). Esto
    // comprueba el otro extremo: que un payload FABRICADO con una foto adentro no se acepte.
    const conFoto = { ...TIPICA, dataUrl: 'data:image/jpeg;base64,AAAA' }
    const payload = await codificar(conFoto as Tarjeta)
    const leida = await decodificar(payload)
    expect(leida.ok).toBe(false)
    expect(!leida.ok && leida.motivo).toBe('datos-invalidos')
  })

  it('el texto del payload no contiene ninguna marca de imagen', async () => {
    const payload = await codificar(LLENA)
    const json = JSON.stringify(LLENA)
    expect(json).not.toContain('data:image')
    expect(payload).not.toContain('data:image')
  })
})

describe('un payload roto NUNCA revienta: devuelve motivo', () => {
  const basura: [string, string][] = [
    ['vacio', ''],
    ['no es base64url', '!!!!'],
    ['demasiado corto', 'AQ'],
    ['version desconocida', 'CQAAAAA'],
  ]
  for (const [nombre, payload] of basura) {
    it(`${nombre}: devuelve ok:false, no lanza`, async () => {
      const leida = await decodificar(payload)
      expect(leida.ok).toBe(false)
    })
  }

  it('un payload que descomprime a algo que no es JSON tampoco lanza', async () => {
    const payload = await codificar(LLENA)
    // Se le cambia un caracter del medio: el inflate va a fallar o a dar basura.
    const roto = payload.slice(0, 10) + (payload[10] === 'A' ? 'B' : 'A') + payload.slice(11)
    await expect(decodificar(roto)).resolves.toHaveProperty('ok', false)
  })

  it('una tarjeta sin nombre no se acepta, aunque el JSON sea valido', async () => {
    const payload = await codificar({ c: 'CTO' } as unknown as Tarjeta)
    const leida = await decodificar(payload)
    expect(!leida.ok && leida.motivo).toBe('datos-invalidos')
  })
})

describe('el enlace completo', () => {
  it('el payload va en el FRAGMENTO, jamas en el query string', async () => {
    // El fragmento no se envia al servidor. Si esto se mueve a `?`, los datos personales de un
    // tercero empiezan a aparecer en los logs del hosting.
    const enlace = await construirEnlace(TIPICA, 'https://ejemplo.com')
    expect(enlace.startsWith(`https://ejemplo.com${RUTA_ENLACE}#`)).toBe(true)
    expect(enlace).not.toContain('?')
    const [antes, despues] = enlace.split('#')
    expect(antes).toBe(`https://ejemplo.com${RUTA_ENLACE}`)
    expect((await decodificar(despues)).ok).toBe(true)
  })
})

describe('cuanto pesa el link (informe, no assert)', () => {
  it('imprime la longitud en los tres perfiles', async () => {
    for (const [nombre, tarjeta] of PERFILES) {
      const enlace = await construirEnlace(tarjeta, 'https://tarjetica.example')
      console.log(`  ${nombre.padEnd(24)} payload ${String((await codificar(tarjeta)).length).padStart(4)} car · link completo ${enlace.length} car`)
      expect(enlace.length).toBeGreaterThan(0)
    }
  })
})

describe('compatibilidad de codecs', () => {
  it('el camino nativo produce y lee deflate-raw', async () => {
    const payload = await codificar(LLENA)
    expect(version(payload)).toBe(1)
    expect(await decodificar(payload)).toEqual({ ok: true, tarjeta: LLENA })
  })

  it('usa fflate empaquetado si faltan las Streams y conserva interoperabilidad', async () => {
    vi.stubGlobal('CompressionStream', undefined)
    vi.stubGlobal('DecompressionStream', undefined)
    const payload = await codificar(TIPICA)
    expect(version(payload)).toBe(1)
    expect(await decodificar(payload)).toEqual({ ok: true, tarjeta: TIPICA })
  })

  it('usa fflate si las APIs existen pero no conocen deflate-raw', async () => {
    class SinDeflateRaw {
      constructor() {
        throw new TypeError('formato no soportado')
      }
    }
    vi.stubGlobal('CompressionStream', SinDeflateRaw)
    vi.stubGlobal('DecompressionStream', SinDeflateRaw)
    const payload = await codificar(TIPICA)
    expect(version(payload)).toBe(1)
    expect(await decodificar(payload)).toEqual({ ok: true, tarjeta: TIPICA })
  })

  it('si una compresion nativa falla, emite el enlace plano sin rechazar', async () => {
    class CompresorQueFalla {
      readonly readable: ReadableStream<Uint8Array>
      readonly writable: WritableStream<Uint8Array>

      constructor() {
        const stream = new TransformStream<Uint8Array, Uint8Array>({
          transform() {
            throw new Error('fallo de compresion')
          },
        })
        this.readable = stream.readable
        this.writable = stream.writable
      }
    }
    vi.stubGlobal('CompressionStream', CompresorQueFalla)
    const payload = await codificar(TIPICA)
    expect(version(payload)).toBe(0)
    expect(await decodificar(payload)).toEqual({ ok: true, tarjeta: TIPICA })
  })

  it('lee enlaces v0 y v1 ya repartidos', async () => {
    await expect(decodificar(payloadPlanoAntiguo(TIPICA))).resolves.toEqual({ ok: true, tarjeta: TIPICA })
    await expect(decodificar(payloadComprimidoAntiguo(TIPICA))).resolves.toEqual({ ok: true, tarjeta: TIPICA })
  })
})

describe('limites de lectura', () => {
  it('rechaza un fragmento de mas de 96 KiB antes de base64', async () => {
    await expect(decodificar('A'.repeat(96 * 1024 + 1))).resolves.toEqual({ ok: false, motivo: 'ilegible' })
  })

  it('rechaza una bomba deflate nativa por encima de 64 KiB', async () => {
    const bomba = payloadComprimidoAntiguo({ n: 'A'.repeat(64 * 1024) })
    await expect(decodificar(bomba)).resolves.toEqual({ ok: false, motivo: 'ilegible' })
  })

  it('rechaza la misma bomba por el respaldo fflate sin reservar su salida completa', async () => {
    vi.stubGlobal('DecompressionStream', undefined)
    const bomba = payloadComprimidoAntiguo({ n: 'A'.repeat(64 * 1024) })
    await expect(decodificar(bomba)).resolves.toEqual({ ok: false, motivo: 'ilegible' })
  })

  it('mantiene los extremos validos con UTF-8', async () => {
    const extrema: Tarjeta = {
      n: 'Ñ'.repeat(60),
      a: 'Á'.repeat(60),
      c: 'é'.repeat(80),
      em: 'í'.repeat(80),
      co: 'ana@example.com',
      t: [
        { n: '1'.repeat(25), e: 'movil' },
        { n: '2'.repeat(25), e: 'whatsapp' },
        { n: '3'.repeat(25), e: 'oficina' },
      ],
      w: 'https://example.com/' + 'x'.repeat(280),
      ig: 'usuario.extremo',
      tk: 'usuario-extremo',
      fb: 'usuario.extremo',
      li: 'usuario-extremo',
      l: [
        { u: 'https://example.com/' + 'a'.repeat(280), e: 'L'.repeat(30) },
        { u: 'https://example.com/' + 'b'.repeat(280), e: 'M'.repeat(30) },
        { u: 'https://example.com/' + 'c'.repeat(280), e: 'N'.repeat(30) },
      ],
      d: 'Bogotá · '.repeat(22),
      ti: 'ó'.repeat(60),
      de: 'ú'.repeat(160),
    }
    const payload = await codificar(extrema)
    expect(payload.length).toBeLessThan(96 * 1024)
    await expect(decodificar(payload)).resolves.toEqual({ ok: true, tarjeta: extrema })
  })
})
