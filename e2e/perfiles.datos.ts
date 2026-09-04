/**
 * Los cinco perfiles que se usan para mirar la tarjeta en TODOS sus estados, no solo en el maximo.
 *
 * Viven fuera de los specs porque Playwright prohibe que un archivo de test importe a otro, y dos
 * suites distintas los necesitan: `perfiles.spec.ts` (captura y superficie) y `pliegue.spec.ts`
 * (que el QR no baje del pliegue en un telefono chico).
 */
export const PERFILES: Array<{ nombre: string; datos: Record<string, unknown> }> = [
  {
    nombre: 'minima',
    datos: { n: 'Ana', a: 'Ríos', t: [{ n: '310 555 1234', e: 'whatsapp' }] },
  },
  {
    nombre: 'tipica-sin-texto',
    datos: {
      n: 'Ana',
      a: 'Ríos',
      c: 'Coordinadora de compras',
      em: 'Alimentos del Norte',
      co: 'ana.rios@example.com',
      t: [{ n: '310 555 1234', e: 'whatsapp' }],
      li: 'anarios',
      d: 'Medellín · Colombia',
    },
  },
  {
    nombre: 'creativa',
    datos: {
      n: 'Sara',
      a: 'Molina',
      c: 'Fotógrafa',
      co: 'hola@saramolina.co',
      t: [{ n: '300 999 8877', e: 'whatsapp' }],
      w: 'https://saramolina.co',
      ig: 'saramolina',
      tk: 'saramolina',
      d: 'Bogotá · Colombia',
      ti: 'Fotografío productos que se venden solos.',
      de: 'Retrato de producto y documental de marca para tiendas que venden en línea.',
    },
  },
  {
    nombre: 'texto-al-tope',
    datos: {
      n: 'Camilo',
      a: 'Peña',
      c: 'Contador público',
      em: 'Peña & Asociados',
      t: [{ n: '320 111 2233', e: 'oficina' }],
      d: 'Cali · Colombia',
      // Los dos campos EXACTAMENTE en su tope. Es el caso que decide si el QR baja del pliegue.
      ti: 'm'.repeat(60),
      de: 'm'.repeat(160),
    },
  },
  {
    nombre: 'johann',
    datos: {
      n: 'Johann',
      a: 'Valderrama',
      c: 'CTO',
      em: 'Zelandia IT Solutions',
      co: 'johann@example.com',
      t: [{ n: '+57 319 248 0121', e: 'whatsapp' }],
      w: 'https://johannvalderrama.com',
      li: 'johannvalderrama',
      d: 'Bogotá · Colombia',
      ti: 'Recupera las horas que tu operación te quita.',
      de: 'Tu equipo deja el trabajo repetitivo y vuelve a lo que de verdad importa: decidir, crear.',
    },
  },
]
