/**
 * Los parametros con los que se pinta el QR, en UN solo lugar.
 *
 * Viven aparte del componente a proposito. La prueba de decodificacion (unidad 4d) tiene que
 * generar el simbolo con **exactamente** lo que se despacha: si copiara estos valores, verificaria
 * una configuracion que nadie usa, y el dia que alguien cambie el componente la prueba seguiria en
 * verde midiendo otra cosa. Es el modo de falla de `verificacion-que-no-verifica`.
 *
 * Los tres son decisiones MEDIDAS (2026-09-03), no defaults de la libreria:
 *
 * - `errorCorrectionLevel: 'M'` — bajar a `L` da cuadritos 14% mas grandes pero pierde una
 *   tolerancia a borrosidad del mismo orden, asi que los dos efectos se cancelan. **La correccion
 *   de errores NO es una palanca en este producto**; las palancas reales son cuantos datos van
 *   adentro y que tan grande se pinta.
 * - `margin: 4` — es la zona silenciosa que exige la norma (DENSO WAVE), y es la que el
 *   decodificador usa para ENCONTRAR el simbolo. La landing de referencia la bajo a `1`
 *   (`src\features\card\qr-code.tsx:20`): esa desviacion NO da error, simplemente puede hacer que
 *   el codigo no se localice. Aqui se paga el 8% de tamaño de cuadrito y se respeta la norma.
 * - `scale: 8` — pixeles por modulo del PNG generado. La pantalla lo escala al ancho disponible;
 *   esto solo fija que no se vea pixelado al agrandarlo.
 */
export const CORRECCION = 'M' as const
export const MARGEN_MODULOS = 4
export const ESCALA = 8

export const OPCIONES_QR = {
  errorCorrectionLevel: CORRECCION,
  margin: MARGEN_MODULOS,
  scale: ESCALA,
  color: { dark: '#000000ff', light: '#ffffffff' },
} as const
