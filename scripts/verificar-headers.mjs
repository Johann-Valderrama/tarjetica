#!/usr/bin/env node
/**
 * Verificacion de la unidad 1e del PRP-TD-001, contra el BUILD DE PRODUCCION.
 *
 * Por que contra produccion y no leyendo el codigo: la CSP la emite el proxy (src/proxy.ts) con un nonce por
 * peticion, y `next.config.ts` puede compilar bien y no servir nada. Un `grep` probaria que el
 * string existe, no que el navegador lo recibe.
 *
 * Uso:
 *   pnpm build && pnpm verify:headers
 *   pnpm verify:headers --url https://tarjetica.example   (contra un despliegue ya arriba)
 *
 * Sale 0 si todo pasa, 1 si algo falla.
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { setTimeout as esperar } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const urlExterna = args.includes('--url') ? args[args.indexOf('--url') + 1] : null
const PUERTO = 3987

const fallos = []
const pasos = []

function comprobar(nombre, condicion, detalle) {
  if (condicion) pasos.push(nombre)
  else fallos.push(nombre + '\n      ' + detalle)
}

async function arrancarServidor() {
  if (!existsSync('.next')) {
    console.error('No hay build de produccion. Corre primero:  pnpm build')
    process.exit(1)
  }
  // Se lanza el binario de Next con el propio Node, no `pnpm.cmd`: en Windows, `spawn` de un .cmd
  // sin shell tira EINVAL desde Node 20 (medido aqui con Node 24).
  const binNext = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url))
  const proceso = spawn(process.execPath, [binNext, 'start', '--port', String(PUERTO)], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const base = 'http://localhost:' + PUERTO
  for (let intento = 0; intento < 60; intento++) {
    await esperar(500)
    try {
      await fetch(base, { method: 'HEAD' })
      return { proceso, base }
    } catch {
      /* todavia no levanta */
    }
  }
  proceso.kill()
  console.error('El servidor de produccion no levanto en 30 s.')
  process.exit(1)
}

const { proceso, base } = urlExterna
  ? { proceso: null, base: urlExterna.replace(/\/$/, '') }
  : await arrancarServidor()

const nonceDe = (r) => (r.headers.get('content-security-policy') ?? '').match(/'nonce-([^']+)'/)?.[1]

try {
  // ---- 1. CSP: deny by default ------------------------------------------------------------
  const home = await fetch(base)
  const csp = home.headers.get('content-security-policy') ?? ''

  comprobar(
    'CSP arranca en default-src self (deny by default)',
    csp.trim().startsWith("default-src 'self'"),
    'recibido: ' + (csp || '(sin cabecera)'),
  )
  comprobar(
    'CSP trae nonce por peticion en script-src',
    /script-src[^;]*'nonce-[^']+'/.test(csp),
    'recibido: ' + csp,
  )
  for (const directiva of [
    "connect-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]) {
    comprobar('CSP incluye ' + directiva, csp.includes(directiva), 'recibido: ' + csp)
  }
  // La fuga que la pagina SI controla: un dominio ajeno colado en cualquier directiva.
  comprobar(
    'CSP no permite ningun origen remoto (ni http:, ni https:, ni *)',
    !/(^|[ ;])(\*|https?:)(\s|;|$)/.test(csp) && !/\/\/[a-z0-9.-]+\.[a-z]{2,}/i.test(csp),
    'recibido: ' + csp,
  )

  // Dos peticiones seguidas no pueden traer el mismo nonce.
  const otra = await fetch(base)
  comprobar(
    'el nonce cambia entre peticiones',
    Boolean(nonceDe(home)) && Boolean(nonceDe(otra)) && nonceDe(home) !== nonceDe(otra),
    nonceDe(home) + ' vs ' + nonceDe(otra),
  )

  // ---- 2. Referrer-Policy -----------------------------------------------------------------
  comprobar(
    'Referrer-Policy: no-referrer',
    home.headers.get('referrer-policy') === 'no-referrer',
    'recibido: ' + home.headers.get('referrer-policy'),
  )

  // ---- 3. noindex en la ruta de la tarjeta -------------------------------------------------
  for (const ruta of ['/t', '/tarjeta', '/editor']) {
    const r = await fetch(base + ruta)
    comprobar(
      'X-Robots-Tag noindex en ' + ruta,
      (r.headers.get('x-robots-tag') ?? '').includes('noindex'),
      'recibido: ' + r.headers.get('x-robots-tag'),
    )
  }
  comprobar(
    'la home SI se puede indexar (es la distribucion del producto)',
    !(home.headers.get('x-robots-tag') ?? '').includes('noindex'),
    'recibido: ' + home.headers.get('x-robots-tag'),
  )

  // ---- 4. robots.txt ----------------------------------------------------------------------
  const robots = await fetch(base + '/robots.txt')
  const cuerpoRobots = await robots.text()
  comprobar('robots.txt responde 200', robots.status === 200, 'status: ' + robots.status)
  for (const ruta of ['/t', '/tarjeta', '/editor']) {
    comprobar(
      'robots.txt prohibe ' + ruta,
      cuerpoRobots.includes('Disallow: ' + ruta),
      'cuerpo:\n' + cuerpoRobots,
    )
  }

  // ---- extras heredados, que son decision y no accidente ----------------------------------
  const estaticos = {
    'x-frame-options': 'DENY',
    'x-content-type-options': 'nosniff',
    'strict-transport-security': 'max-age=63072000; includeSubDomains',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  }
  for (const [clave, esperado] of Object.entries(estaticos)) {
    comprobar(
      clave + ': ' + esperado,
      home.headers.get(clave) === esperado,
      'recibido: ' + home.headers.get(clave),
    )
  }
} finally {
  proceso?.kill()
}

console.log('\n  ' + pasos.length + ' comprobaciones en verde')
if (fallos.length) {
  console.error('\n  ' + fallos.length + ' FALLO(S):')
  for (const f of fallos) console.error('   - ' + f)
  process.exit(1)
}
console.log('  Candados de cabecera (unidad 1e): OK\n')
