import type { Config } from 'tailwindcss'

/**
 * Los tokens viven en variables CSS (`src/app/globals.css`) y aqui solo se exponen a Tailwind. Esa
 * indireccion es lo que permitiria agregar un modo claro cambiando un bloque de valores, sin tocar
 * un solo componente. El por que de cada valor esta en `docs/direccion-estetica.md`.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fondo: 'var(--fondo)',
        superficie: 'var(--superficie)',
        'superficie-sutil': 'var(--superficie-sutil)',
        borde: 'var(--borde)',
        'borde-fuerte': 'var(--borde-fuerte)',
        tinta: 'var(--tinta)',
        'tinta-suave': 'var(--tinta-suave)',
        acento: 'var(--acento)',
        'acento-tenue': 'var(--acento-tenue)',
      },
      fontFamily: {
        // Se inyectan desde `src/app/layout.tsx` con next/font, que las auto-hospeda.
        display: ['var(--fuente-display)', 'Georgia', 'serif'],
        sans: ['var(--fuente-texto)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        tarjeta: '24px',
        bloque: '16px',
      },
    },
  },
  plugins: [],
}

export default config
