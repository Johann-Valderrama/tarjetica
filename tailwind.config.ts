import type { Config } from 'tailwindcss'

// Los tokens de la direccion estetica los fija la Ola 3 (unidad 3a), no esta ola.
// Aqui solo queda el scaffold: que Tailwind compile y barra el arbol de src/.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}

export default config
