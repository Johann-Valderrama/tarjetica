/**
 * Matematica WCAG de contraste, compartida entre `src/app/contraste.test.ts` (mide los tokens de la
 * marca de la app) y la sugerencia de color de marca de la Ola 1 (U3, mide el color que sale de un
 * logo). Antes esta formula solo vivia DUPLICADA dentro del test: aqui queda en un solo sitio y el
 * test de tokens sigue sin tocarse, midiendo lo mismo por su propia cuenta.
 *
 * Formula literal de WCAG 2.x: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

export type Rgb = { r: number; g: number; b: number }

/** Luminancia relativa de un color (0 = negro, 1 = blanco), escala WCAG. */
export function luminanciaRelativa({ r, g, b }: Rgb): number {
  const canal = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
}

/** Razon de contraste WCAG entre dos colores. Blanco/negro da exactamente 21. */
export function contrasteEntre(a: Rgb, b: Rgb): number {
  const [x, y] = [luminanciaRelativa(a), luminanciaRelativa(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** `#rrggbb` (con o sin `#`) a `Rgb`. Devuelve `null` si no tiene ese formato exacto. */
export function hexARgb(hex: string): Rgb | null {
  const m = hex.replace(/^#/, '').match(/^([0-9a-f]{6})$/i)
  if (!m) return null
  const n = m[1]
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  }
}

/** `Rgb` a `#rrggbb` en minusculas, siempre de 6 digitos (contrato de `Tarjeta.cm`). */
export function rgbAHex({ r, g, b }: Rgb): string {
  const canal = (c: number) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')
  return `#${canal(r)}${canal(g)}${canal(b)}`
}
