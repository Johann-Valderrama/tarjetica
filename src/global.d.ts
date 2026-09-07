import type mensajes from '../messages/es-CO.json'

/**
 * Tipa las claves de traduccion contra el archivo de mensajes REAL (unidad 7a).
 *
 * Sin esto, `next-intl` acepta cualquier cadena como clave: un `t('editor.titlo')` con un typo
 * compila, pasa el lint, y en pantalla sale la clave cruda en vez del texto. Es justo el fallo MUDO
 * que este proyecto persigue en todas partes, asi que se cierra con el compilador y no con la
 * disciplina. `es-CO` es la referencia; la paridad con `en` la vigila `messages/mensajes.test.ts`.
 */
declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof mensajes
  }
}
