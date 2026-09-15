import { describe, expect, it } from 'vitest'
import {
  BorradorGuardable,
  campoQueImpideExportar,
  completarEsquema,
  esExportable,
  normalizarDirecciones,
  FotoLocal,
  Tarjeta,
  TarjetaBorrador,
  TEMAS,
  TOPE_DESCRIPCION,
  TOPE_TITULAR,
} from '@/features/tarjeta/modelo/tarjeta'

describe('Tarjeta (unidad 1c)', () => {
  it('acepta la tarjeta minima: solo nombre', () => {
    expect(Tarjeta.safeParse({ n: 'Daniel' }).success).toBe(true)
  })

  it('rechaza una tarjeta sin nombre, que es el unico campo obligatorio', () => {
    expect(Tarjeta.safeParse({ co: 'a@b.com' }).success).toBe(false)
    expect(Tarjeta.safeParse({ n: '' }).success).toBe(false)
  })

  it('rechaza una clave desconocida en vez de ignorarla en silencio', () => {
    expect(Tarjeta.safeParse({ n: 'Daniel', xx: 'colada' }).success).toBe(false)
  })

  it('rechaza una clave desconocida tambien en los objetos anidados', () => {
    expect(
      Tarjeta.safeParse({ n: 'J', t: [{ n: '3001234567', e: 'movil', extra: 1 }] }).success,
    ).toBe(false)
  })

  it('D2b: el bloque de cifras ya NO existe en el contrato', () => {
    // Se elimino tras un debate de tres lentes ortogonales: de 18 casillas posibles en 6 perfiles
    // reales solo 6-7 se llenarian con algo util, y el bloque costaba 6 de las 9 lineas que caben.
    expect(Tarjeta.safeParse({ n: 'J', s: { c: [{ v: '83%', e: 'x' }] } }).success).toBe(false)
    expect(Tarjeta.safeParse({ n: 'J', no: 'notas viejas' }).success).toBe(false)
  })

  it('D1b: los dos bloques llevan TOPE DURO, de eso depende que el QR no baje del pliegue', () => {
    expect(Tarjeta.safeParse({ n: 'J', ti: 'a'.repeat(TOPE_TITULAR) }).success).toBe(true)
    expect(Tarjeta.safeParse({ n: 'J', ti: 'a'.repeat(TOPE_TITULAR + 1) }).success).toBe(false)
    expect(Tarjeta.safeParse({ n: 'J', de: 'a'.repeat(TOPE_DESCRIPCION) }).success).toBe(true)
    expect(Tarjeta.safeParse({ n: 'J', de: 'a'.repeat(TOPE_DESCRIPCION + 1) }).success).toBe(false)
  })

  it('G5: la foto NO cabe dentro de Tarjeta, es un tipo aparte', () => {
    const conFoto = { n: 'Daniel', dataUrl: 'data:image/jpeg;base64,AAAA' }
    expect(Tarjeta.safeParse(conFoto).success).toBe(false)
    expect(FotoLocal.safeParse({ dataUrl: 'data:image/jpeg;base64,AAAA' }).success).toBe(true)
    expect(FotoLocal.safeParse({ dataUrl: 'https://ajeno/foto.jpg' }).success).toBe(false)
  })

  it('acepta la tarjeta llena, con capa de venta', () => {
    const llena = {
      n: 'Daniel',
      a: 'Restrepo',
      c: 'Project Controls',
      em: 'Norte Soluciones',
      co: 'daniel@ejemplo.com',
      t: [
        { n: '3001234567', e: 'movil' },
        { n: '3007654321', e: 'whatsapp' },
      ],
      w: 'https://danielrestrepo.example',
      ig: 'johann',
      tk: 'johann',
      fb: 'johann',
      li: 'danielrestrepo',
      l: [{ u: 'https://ejemplo.com/caso', e: 'Caso de exito' }],
      d: 'Bogota · Colombia',
      ti: 'Menos papel, mas eficiencia',
      de: 'Tu equipo deja de retipear contactos a mano en cada conferencia.',
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

  it('acepta handles con o sin arroba y URLs completas de cada red', () => {
    expect(Tarjeta.safeParse({ n: 'J', li: 'ana-restrepo', ig: '@ana.rios', tk: '@anarios', fb: 'ana.rios' }).success).toBe(true)
    expect(
      Tarjeta.safeParse({
        n: 'J',
        li: 'https://www.linkedin.com/in/ana-restrepo',
        ig: 'https://instagram.com/ana.rios/',
        tk: 'http://www.tiktok.com/@anarios',
        fb: 'https://m.facebook.com/ana.rios',
      }).success,
    ).toBe(true)
  })

  it('rechaza esquemas peligrosos, espacios y hosts ajenos en redes', () => {
    for (const [campo, valor] of [
      ['li', 'javascript:alert(1)'],
      ['ig', 'ana rios'],
      ['tk', 'https://example.com/@anarios'],
      ['fb', 'https://facebook.com.example.org/ana'],
    ] as const) {
      expect(Tarjeta.safeParse({ n: 'J', [campo]: valor }).success, `${campo}: ${valor}`).toBe(false)
      // El borrador sigue siendo permisivo: el dato a medio escribir se conserva para corregirlo.
      expect(BorradorGuardable.safeParse({ [campo]: valor }).success).toBe(true)
    }
  })
})

describe('acciones opcionales y apariencia (U2)', () => {
  it('la tarjeta minima, sin ninguno de los cuatro campos, sigue pasando', () => {
    // Compatibilidad hacia atras: lo que ya circula no conoce estas claves.
    expect(Tarjeta.safeParse({ n: 'Daniel' }).success).toBe(true)
  })

  it('acepta los cuatro campos llenos', () => {
    expect(
      Tarjeta.safeParse({
        n: 'Daniel',
        ag: 'https://cal.example.com/daniel/30min',
        cn: 'https://ejemplo.com/cuentame',
        tm: 'claro',
        cm: '#1D4ED8',
      }).success,
    ).toBe(true)
  })

  it('las dos acciones exigen https, sin usuario ni contraseña: es un boton que toca un desconocido', () => {
    for (const campo of ['ag', 'cn'] as const) {
      expect(Tarjeta.safeParse({ n: 'J', [campo]: 'https://ejemplo.com/x' }).success).toBe(true)
      for (const veneno of [
        'http://ejemplo.com/x',
        'javascript:alert(1)',
        'https://usuario:clave@ejemplo.com/x',
        'https://usuario@ejemplo.com/x',
        'ejemplo.com/x',
      ]) {
        expect(Tarjeta.safeParse({ n: 'J', [campo]: veneno }).success, `${campo}: ${veneno}`).toBe(false)
      }
    }
  })

  it('el color de marca es hexadecimal de SEIS digitos, con su numeral', () => {
    expect(Tarjeta.safeParse({ n: 'J', cm: '#1d4ed8' }).success).toBe(true)
    expect(Tarjeta.safeParse({ n: 'J', cm: '#1D4ED8' }).success).toBe(true)
    for (const invalido of ['#3', '#abc', '1D4ED8', '#1D4ED', '#1D4ED8F', 'azul']) {
      expect(Tarjeta.safeParse({ n: 'J', cm: invalido }).success, invalido).toBe(false)
    }
  })

  it('el tema solo admite los dos valores del control; ausente significa oscuro', () => {
    expect([...TEMAS]).toEqual(['claro', 'oscuro'])
    expect(Tarjeta.safeParse({ n: 'J', tm: 'oscuro' }).success).toBe(true)
    for (const invalido of ['Claro', 'sistema', 'dark', '']) {
      expect(Tarjeta.safeParse({ n: 'J', tm: invalido }).success, invalido).toBe(false)
    }
    // Sin `.default()`: un enlace viejo decodifica al MISMO objeto, sin ganar la clave.
    expect(Tarjeta.parse({ n: 'J' })).not.toHaveProperty('tm')
  })

  it('el borrador conserva el dato a medio escribir de las acciones y del color', () => {
    expect(BorradorGuardable.safeParse({ ag: 'http://', cm: '#3' }).success).toBe(true)
    expect(BorradorGuardable.safeParse({ cn: 'ejemplo.com' }).success).toBe(true)
    // El tema es la excepcion: se elige en un control cerrado, no se teclea.
    expect(BorradorGuardable.safeParse({ tm: 'a medias' }).success).toBe(false)
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
    expect(esExportable({ n: 'Daniel' })).toBe(true)
  })
})

/**
 * La web escrita "a lo humano" (2026-09-11). Lo reporto Johann en produccion: con
 * `johannvalderrama.com` en el campo web, los botones de compartir se quedaban apagados y la pantalla
 * decia "escribe al menos tu nombre", con el nombre ya escrito. Ningun fixture lo cubria porque
 * todos traian la web con su `https://`.
 */
describe('completarEsquema', () => {
  it('completa el https de un dominio pelado, como lo escribe la gente', () => {
    expect(completarEsquema('johannvalderrama.com')).toBe('https://johannvalderrama.com')
    expect(completarEsquema('www.johannvalderrama.com')).toBe('https://www.johannvalderrama.com')
    expect(completarEsquema('  midominio.co/portafolio  ')).toBe('https://midominio.co/portafolio')
  })

  it('no toca lo que ya trae esquema', () => {
    expect(completarEsquema('https://a.com')).toBe('https://a.com')
    expect(completarEsquema('http://a.com')).toBe('http://a.com')
  })

  it('NO afloja la regla de seguridad: un javascript: pasa sin cambios y se sigue rechazando', () => {
    // El espejo que importa. Si esta funcion le antepusiera https:// a cualquier cosa, un
    // `javascript:alert(1)` saldria como `https://javascript:alert(1)` y la validacion cambiaria
    // de sentido sin que ningun test de esquema lo notara.
    const peligroso = 'javascript:alert(1)'
    expect(completarEsquema(peligroso)).toBe(peligroso)
    expect(Tarjeta.safeParse({ n: 'X', w: completarEsquema(peligroso) }).success).toBe(false)
  })

  it('no inventa una URL de un texto que no parece dominio', () => {
    expect(completarEsquema('mi pagina')).toBe('mi pagina')
    expect(completarEsquema('sinpunto')).toBe('sinpunto')
    expect(completarEsquema(undefined)).toBeUndefined()
  })

  it('la tarjeta que reporto Johann pasa a ser exportable', () => {
    const suya: TarjetaBorrador = { n: 'Johann', a: 'Valderrama', co: 'johann09@gmail.com', w: 'johannvalderrama.com' }
    expect(esExportable(suya), 'la precondicion: sin normalizar SI bloquea').toBe(false)
    expect(esExportable(normalizarDirecciones(suya))).toBe(true)
  })

  it('normaliza tambien los enlaces extra, sin tocar su etiqueta', () => {
    const b: TarjetaBorrador = { n: 'X', l: [{ u: 'portafolio.com', e: 'Portafolio' }] }
    expect(normalizarDirecciones(b).l).toEqual([{ u: 'https://portafolio.com', e: 'Portafolio' }])
  })
})

describe('campoQueImpideExportar', () => {
  it('dice CUAL campo impide exportar, no solo que no se puede', () => {
    expect(campoQueImpideExportar({})).toEqual({ campo: 'n', indice: undefined })
    expect(campoQueImpideExportar({ n: 'Johann', c: 'x'.repeat(81) })?.campo).toBe('c')
    expect(campoQueImpideExportar({ n: 'Johann', t: [{ n: '12', e: 'movil' }] })).toEqual({ campo: 't', indice: 0 })
  })

  it('devuelve null cuando la tarjeta ya se puede exportar', () => {
    expect(campoQueImpideExportar({ n: 'Johann', w: 'https://johannvalderrama.com' })).toBeNull()
  })
})

describe('BorradorGuardable y Tarjeta no se desincronizan', () => {
  it('tienen exactamente las mismas claves', () => {
    // Si alguien agrega un campo a `Tarjeta` y no a `BorradorGuardable`, el `strictObject` del
    // borrador rechazaria esa clave y la tarjeta guardada entera se descartaria al leerla.
    expect(Object.keys(BorradorGuardable.shape).sort()).toEqual(Object.keys(Tarjeta.shape).sort())
  })
})
