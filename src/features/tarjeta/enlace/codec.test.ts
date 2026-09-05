import { describe, expect, it } from 'vitest'
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
