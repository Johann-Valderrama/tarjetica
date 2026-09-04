# Dirección estética de Tarjetica

> Unidad **3a** del PRP-TD-001. Se cierra ANTES de pintar una sola pantalla, y no es un repaso al
> final: sin este documento la ola devuelve el default de IA.
>
> **El encargo, literal (Johann, 2026-09-04):** *"El estilo de https://johannvalderrama.com/tarjeta?modo=qr
> pero con los colores de https://johann-valderrama.zelandia.io/"*.

## Las dos referencias, abiertas de verdad

No se estimaron de una captura: se abrieron las dos páginas en vivo y se les extrajo el sistema de
diseño **del DOM**, el 2026-09-04.

| | `johannvalderrama.com/tarjeta?modo=qr` | `johann-valderrama.zelandia.io` |
|---|---|---|
| **Qué se toma** | La ESTRUCTURA y la TIPOGRAFÍA | Los COLORES |
| Fondo | `rgb(251,251,249)` hueso | `rgb(10,10,11)` casi negro |
| Texto | `rgb(10,10,10)` / atenuado `rgb(87,83,78)` | `rgb(245,245,247)` / atenuado `rgb(161,165,172)` |
| Acento | `rgb(29,78,216)` azul | `rgb(255,145,1)` naranja |
| Tipografía | **Fraunces** (display, 8 usos) + **Plus Jakarta Sans** (texto, 36 usos) | Segoe UI / Arial Black (pila del sistema) |
| Bordes | `1px solid rgb(231,229,224)` | `1px solid rgba(255,255,255,0.09 – 0.20)` |
| Radios | 24px tarjeta, 12/16px bloques, 9999px píldoras | 18px tarjetas, 14/16px bloques, 99px píldoras |
| Sombras | muy suaves, `rgba(10,10,10,0.12) 0 12px 40px -12px` | profundas + halo del acento, `rgba(255,145,1,0.28) 0 10px 30px` |

Capturas guardadas: `capturas/ref-tarjeta.png` y `capturas/ref-zelandia.png` (no versionadas).

## La decisión, en una línea

**La arquitectura visual de la tarjeta clara, repintada en la noche de Zelandia.** Una sola tarjeta
flotando sobre un fondo casi negro, con jerarquía de revista: un serif de display para el nombre y
las cifras, una sans humanista para todo lo demás, y el naranja usado como bisturí, no como brocha.

## Tokens (esto es lo que se implementa, no los adjetivos de arriba)

| Token | Valor | Para qué |
|---|---|---|
| `--fondo` | `#0A0A0B` | El lienzo. Sale de Zelandia, medido |
| `--superficie` | `#141416` | La tarjeta. Un paso más clara que el lienzo: es lo que la hace FLOTAR sin depender de una sombra, que en fondo oscuro casi no se ve |
| `--superficie-sutil` | `rgba(255,255,255,0.04)` | El bloque de cifras y otros paneles internos |
| `--borde` | `rgba(255,255,255,0.10)` | Separación por defecto |
| `--borde-fuerte` | `rgba(255,255,255,0.18)` | Píldoras y controles |
| `--tinta` | `#F5F5F7` | Texto principal |
| `--tinta-suave` | `#A1A5AC` | Texto secundario |
| `--acento` | `#FF9101` | Cifras, la palabra subrayada del titular, el punto de estado |
| `--acento-tenue` | `rgba(255,145,1,0.28)` | Halos y anillos |
| Radios | `24px` tarjeta · `16px` bloques · `999px` píldoras | Promedio de las dos referencias |
| Sombra de la tarjeta | `0 24px 60px -20px rgba(0,0,0,0.8)` + anillo `inset 0 0 0 1px var(--borde)` | En oscuro el anillo hace el trabajo que en claro hacía la sombra |

**Contraste, medido y no estimado** (WCAG, AA normal = 4.5): tinta 18,18:1 · tinta suave 8,00:1 ·
acento 8,77:1 sobre el fondo. Sobre la superficie de la tarjeta: 16,90 / 7,44 / 8,15. **Los seis
pares pasan AAA.** El script está en el commit de esta ola.

## Tipografía

- **Fraunces** para el nombre, el titular y las CIFRAS de la capa de venta. Es un serif variable con
  carácter editorial; es lo que le da a la referencia su aire de revista y no de plantilla.
- **Plus Jakarta Sans** para todo lo demás: etiquetas, datos de contacto, botones, avisos.
- Se sirven **auto-hospedadas** con `next/font/google`, que las descarga en el build. No es una
  preferencia de rendimiento: la CSP arranca en `default-src 'self'` y el criterio de éxito exige
  **cero recursos de dominios ajenos**. Un `<link>` a `fonts.googleapis.com` lo bloquearía el
  navegador y el texto saldría con la fuente de respaldo, sin ningún error visible.
- Interletra apretada en los títulos (`-0.02em`), como la referencia (medido: `-0.9px` a 20px).

## Lo que está PROHIBIDO en este proyecto

No es una lista genérica: cada línea tiene su razón, y varias vienen de una medición previa.

1. **Inter, Geist y la pila del sistema como tipografía de marca.** Es el default de IA y borra la
   diferencia entre esta tarjeta y cualquier plantilla.
2. **Degradados morados, y el patrón hero + tres iconos.** Mismo motivo.
3. **DOS códigos QR en la misma vista**, aunque las dos referencias los tengan. Medido el
   2026-09-03: dos QR se reparten el ancho y quedan en **2,39 px por cuadrito**, por debajo del piso
   práctico de ~2,5. Es la causa medida de que la tarjeta de referencia haya que acomodarla para que
   la lean. Aquí va **uno solo, a ancho completo** (4,66 px por cuadrito, casi el doble).
4. **QR sobre fondo oscuro.** El código va siempre sobre una teja BLANCA con su zona silenciosa de
   4 módulos. No es estética: un decodificador necesita ese contraste y ese margen para *encontrar*
   el símbolo. Las dos referencias ya lo hacen bien.
5. **Cualquier recurso de un dominio ajeno**: fuentes por CDN, analítica, widgets, iconos remotos.
   Lo bloquea la CSP y rompería la promesa de privacidad, que es el producto entero.
6. **`backdrop-filter` y desenfoques animados.** El teléfono real de una conferencia es de gama
   media. Se anima solo `transform` y `opacity`, respetando `prefers-reduced-motion`.
7. **El naranja como fondo de áreas grandes.** Es acento: cifras, una palabra del titular, el punto
   de estado, un anillo. Un bloque naranja grande convierte una tarjeta profesional en un volante.

## Cómo se aplica a cada pantalla

- **P2, vista `card`:** una sola tarjeta centrada, `max-width` de lectura, con el avatar y el nombre
  arriba, el titular en Fraunces, las cifras en un panel de `--superficie-sutil` a tres columnas, la
  pregunta de cierre en itálica, y los datos de contacto tocables debajo.
- **P3, vista `qr`:** el mismo marco, con **un** QR ocupando el ancho disponible sobre teja blanca.
- **El toggle entre las dos vistas va FUERA del elemento capturable**, como en la referencia, que lo
  comenta en su propio código. Es lo que permite que el `.jpeg` salga limpio.
- **La firma de marca va DENTRO** del elemento capturable, al pie, en `--tinta-suave` y tamaño
  pequeño. Es lo contrario del toggle, y a propósito: si queda fuera no sale en la imagen y se pierde
  la única palanca de distribución que existe sin servidor.

## Qué queda sin decidir

El **modo claro** no entra en la v1. La marca de Johann tiene las dos caras (la tarjeta es clara, el
sitio de Zelandia es oscuro), y sostener las dos duplica el trabajo de esta ola sin que nadie lo haya
pedido. Si aparece la necesidad, los tokens de arriba ya están en variables CSS: es cambiar sus
valores en un bloque, no reescribir componentes.
