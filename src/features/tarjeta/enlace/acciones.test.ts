import { describe, expect, it } from 'vitest'
import type { Tarjeta } from '@/features/tarjeta/modelo/tarjeta'
import { enlacesDelPerfil, urlAgenda, urlCuentame, urlWhatsapp } from '@/features/tarjeta/enlace/acciones'

describe('urlWhatsapp', () => {
  it('construye wa.me con el primer WhatsApp internacional y sus separadores', () => {
    const tarjeta: Tarjeta = {
      n: 'Ana',
      t: [{ n: '+57 (310) 555-12.34', e: 'whatsapp' }],
    }
    expect(urlWhatsapp(tarjeta)).toBe('https://wa.me/573105551234')
  })

  it('requiere + explícito y no adivina el país', () => {
    expect(urlWhatsapp({ n: 'Ana', t: [{ n: '310 555 1234', e: 'whatsapp' }] })).toBeNull()
    expect(urlWhatsapp({ n: 'Ana', t: [{ n: '+310 555 1234', e: 'whatsapp' }] })).toBe(
      'https://wa.me/3105551234',
    )
  })

  it('rechaza texto, extensiones, primer dígito cero y longitudes fuera de 8 a 15', () => {
    const invalidos = [
      ' +57 310 555 1234 ext 9',
      '+57 310 555 1234 x9',
      '+57 310 555 1234#9',
      '+0 310 555 1234',
      '+1234567',
      '+1234567890123456',
    ]
    for (const n of invalidos) {
      expect(urlWhatsapp({ n: 'Ana', t: [{ n, e: 'whatsapp' }] })).toBeNull()
    }
  })

  it('usa el primer teléfono válido etiquetado como WhatsApp', () => {
    const tarjeta: Tarjeta = {
      n: 'Ana',
      t: [
        { n: 'sin numero valido', e: 'whatsapp' },
        { n: '+573105551234', e: 'whatsapp' },
      ],
    }
    expect(urlWhatsapp(tarjeta)).toBe('https://wa.me/573105551234')
  })
})

describe('urlAgenda y urlCuentame (U2)', () => {
  const casos = [
    ['ag', urlAgenda],
    ['cn', urlCuentame],
  ] as const

  it('devuelven el destino cuando es https', () => {
    for (const [campo, helper] of casos) {
      expect(helper({ n: 'Ana', [campo]: 'https://cal.example.com/ana/30min' })).toBe(
        'https://cal.example.com/ana/30min',
      )
    }
  })

  it('devuelven null con http, con javascript:, con credenciales y cuando el campo falta', () => {
    for (const [campo, helper] of casos) {
      for (const veneno of [
        'http://cal.example.com/ana',
        'javascript:alert(1)',
        'data:text/html,alert(1)',
        'https://usuario:clave@cal.example.com/ana',
        '   ',
      ]) {
        expect(helper({ n: 'Ana', [campo]: veneno }), `${campo}: ${veneno}`).toBeNull()
      }
      expect(helper({ n: 'Ana' })).toBeNull()
    }
  })

  it('no lanzan con un payload manipulado que trae otro tipo', () => {
    // Fuera de la garantia estatica de `Tarjeta`: el enlace lo puede fabricar cualquiera a mano.
    expect(urlAgenda({ ag: 7 } as unknown as Tarjeta)).toBeNull()
    expect(urlCuentame({ cn: { u: 'https://x.example' } } as unknown as Tarjeta)).toBeNull()
  })
})

describe('enlacesDelPerfil', () => {
  it('ordena web, redes y enlaces libres, etiquetando solo los libres', () => {
    const tarjeta: Tarjeta = {
      n: 'Ana',
      w: 'https://ana.example/perfil',
      li: 'ana-restrepo',
      ig: '@ana.rios',
      tk: 'ana-rios',
      fb: 'ana.rios',
      l: [{ u: 'https://ana.example/agenda', e: 'Agenda' }],
    }
    expect(enlacesDelPerfil(tarjeta)).toEqual([
      { tipo: 'web', url: 'https://ana.example/perfil' },
      { tipo: 'linkedin', url: 'https://linkedin.com/in/ana-restrepo' },
      { tipo: 'instagram', url: 'https://instagram.com/ana.rios' },
      { tipo: 'tiktok', url: 'https://tiktok.com/@ana-rios' },
      { tipo: 'facebook', url: 'https://facebook.com/ana.rios' },
      { tipo: 'otro', url: 'https://ana.example/agenda', etiqueta: 'Agenda' },
    ])
  })

  it('deduplica después de normalizar URLs', () => {
    const tarjeta: Tarjeta = {
      n: 'Ana',
      w: 'https://ana.example',
      l: [
        { u: 'https://ana.example/', e: 'Web repetida' },
        { u: 'https://ana.example/otra', e: 'Otra' },
      ],
    }
    expect(enlacesDelPerfil(tarjeta)).toEqual([
      { tipo: 'web', url: 'https://ana.example/' },
      { tipo: 'otro', url: 'https://ana.example/otra', etiqueta: 'Otra' },
    ])
  })

  it('descarta esquemas peligrosos, credenciales, hosts sociales ajenos y entradas malformed', () => {
    const tarjeta = {
      n: 'Ana',
      w: 'javascript:alert(1)',
      li: 'https://user:pass@linkedin.com/in/ana',
      ig: 'https://example.com/ana',
      tk: 'https://tiktok.com/@ana',
      fb: 'data:text/html,alert(1)',
      l: [
        { u: 'https://user:pass@ana.example/privado', e: 'Privado' },
        { u: 'javascript:alert(1)', e: 'Veneno' },
        { u: 'https://ana.example/seguro', e: 'Seguro' },
        null,
        { u: 42, e: 'Número' },
      ],
    } as unknown as Tarjeta
    expect(enlacesDelPerfil(tarjeta)).toEqual([
      { tipo: 'tiktok', url: 'https://tiktok.com/@ana' },
      { tipo: 'otro', url: 'https://ana.example/seguro', etiqueta: 'Seguro' },
    ])
  })
})
