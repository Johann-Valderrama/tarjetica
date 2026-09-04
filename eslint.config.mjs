import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescriptConfig from 'eslint-config-next/typescript'

// eslint-config-next 16 ya exporta flat config. No se usa FlatCompat: con este paquete revienta
// con "Converting circular structure to JSON" (medido al montar el scaffold).
const eslintConfig = [
  ...coreWebVitals,
  ...typescriptConfig,
  { ignores: ['.next/**', 'node_modules/**'] },
]

export default eslintConfig
