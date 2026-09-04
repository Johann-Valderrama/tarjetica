import { describe, expect, it } from 'vitest'
import {
  CapaVenta,
  esExportable,
  FotoLocal,
  Tarjeta,
  TarjetaBorrador,
} from '@/features/tarjeta/modelo/tarjeta'

describe('Tarjeta (unidad 1c)', () => {
  it('acepta la tarjeta minima: solo nombre', () => {
    expect(Tarjeta.safeParse({ n: 'Johann' }).success).toBe(true)
  })

  it('rechaza una tarjeta sin nombre, que es el unico campo obligatorio', () => {
    expect(Tarjeta.safeParse({ co: 'a@b.com' }).success).toBe(false)
    expect(Tarjeta.safeParse({ n: '' }).success).toBe(false)
  })

  it('rechaza una clave desconocida en vez de ignorarla en silencio', () => {
    expect(Tarjeta.safeParse({ n: 'Johann', xx: 'colada' }).success).toBe(false)
  })

  it('rechaza una clave desconocida tambien en los objetos anidados', () => {
    expect(
      Tarjeta.safeParse({ n: 'J', t: [{ n: '3001234567', e: 'movil', extra: 1 }] }).success,
    ).toBe(false)
    expect(CapaVenta.safeParse({ t: 'titular', z: 1 }).success).toBe(false)
  })

  it('G5: la foto NO cabe dentro de Tarjeta, es un tipo aparte', () => {
    const conFoto = { n: 'Johann', dataUrl: 'data:image/jpeg;base64,AAAA' }
    expect(Tarjeta.safeParse(conFoto).success).toBe(false)
    expect(FotoLocal.safeParse({ dataUrl: 'data:image/jpeg;base64,AAAA' }).success).toBe(true)
    expect(FotoLocal.safeParse({ dataUrl: 'https://ajeno/foto.jpg' }).success).toBe(false)
  })

  it('acepta la tarjeta llena, con capa de venta', () => {
    const llena = {
      n: 'Johann',
      a: 'Valderrama',
      c: 'Project Controls',
      em: 'Zelandia',
      co: 'johann@example.com',
      t: [
        { n: '3001234567', e: 'movil' },
        { n: '3007654321', e: 'whatsapp' },
      ],
      w: 'https://johannvalderrama.com',
      ig: 'johann',
      tk: 'johann',
      fb: 'johann',
      li: 'johannvalderrama',
      l: [{ u: 'https://ejemplo.com/caso', e: 'Caso de exito' }],
      d: 'Bogota, Colombia',
      no: 'Notas libres',
      s: {
        t: 'Menos papel, mas eficiencia',
        c: [{ v: '83%', e: 'ahorro' }],
        p: '¿Cuanto tiempo pierdes retipeando contactos?',
      },
    }
    expect(Tarjeta.safeParse(llena).success).toBe(true)
  })

  it('topea telefonos, enlaces y cifras en 3', () => {
    const tel = { n: '3001234567', e: 'movil' as const }
    expect(Tarjeta.safeParse({ n: 'J', t: [tel, tel, tel, tel] }).success).toBe(false)
    expect(
      Tarjeta.safeParse({
        n: 'J',
        s: { c: [1, 2, 3, 4].map((i) => ({ v: `${i}`, e: 'x' })) },
      }).success,
    ).toBe(false)
  })

  it('valida correo y URL, porque un dato torcido revienta el render en el telefono ajeno', () => {
    expect(Tarjeta.safeParse({ n: 'J', co: 'no-es-un-correo' }).success).toBe(false)
  })

  it('solo acepta URLs http y https: javascript: es ejecucion de codigo en el telefono ajeno', () => {
    expect(Tarjeta.safeParse({ n: 'J', w: 'https://ejemplo.com' }).success).toBe(true)
    expect(Tarjeta.safeParse({ n: 'J', w: 'http://ejemplo.com' }).success).toBe(true)
    for (const veneno of [
      'javascript:alert(1)',
      'JavaScript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
      'ejemplo.com',
    ]) {
      expect(Tarjeta.safeParse({ n: 'J', w: veneno }).success).toBe(false)
      expect(Tarjeta.safeParse({ n: 'J', l: [{ u: veneno, e: 'x' }] }).success).toBe(false)
    }
  })
})

describe('TarjetaBorrador (lo que se guarda mientras se escribe)', () => {
  it('acepta el borrador vacio, que Tarjeta rechaza', () => {
    expect(TarjetaBorrador.safeParse({}).success).toBe(true)
    expect(Tarjeta.safeParse({}).success).toBe(false)
  })

  it('sigue siendo estricto con las claves desconocidas', () => {
    expect(TarjetaBorrador.safeParse({ xx: 1 }).success).toBe(false)
  })

  it('esExportable separa el borrador del contrato de salida', () => {
    expect(esExportable({})).toBe(false)
    expect(esExportable({ n: 'Johann' })).toBe(true)
  })
})
