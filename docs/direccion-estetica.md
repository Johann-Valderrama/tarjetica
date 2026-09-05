# Dirección estética de Tarjetica

> Unidad **3a** del PRP-TD-001. Se cierra ANTES de pintar una sola pantalla, y no es un repaso al
> final: sin este documento la ola devuelve el default de IA.
>
> **El encargo, literal (Johann, 2026-09-04).** Llegó en dos tiempos, y el segundo REEMPLAZA al
> primero, no lo matiza:
>
> 1. *"El estilo de https://johannvalderrama.com/tarjeta?modo=qr pero con los colores de
>    https://johann-valderrama.zelandia.io/"*
> 2. *"La quiero así [señalando la tarjeta de Zelandia], quitando los kpi y dejando 1 qr. Toda la
>    demás información viaja en el qr para que quede guardado en la agenda del contacto"*
> 3. *"Necesito que la tarjeta quede en una sola visual es lo principal y ni negociable"*

## Las dos referencias, abiertas de verdad

No se estimaron de una captura: se abrieron las dos páginas en vivo y se les extrajo el sistema de
diseño **del DOM**, el 2026-09-04.

| | `johannvalderrama.com/tarjeta?modo=qr` | `johann-valderrama.zelandia.io` |
|---|---|---|
| **Qué se toma** | Nada, tras el encargo 2. Se deja medida por trazabilidad | TODO: estructura, tipografía y colores |
| Fondo | `rgb(251,251,249)` hueso | `rgb(10,10,11)` casi negro |
| Texto | `rgb(10,10,10)` / atenuado `rgb(87,83,78)` | `rgb(245,245,247)` / atenuado `rgb(161,165,172)` |
| Acento | `rgb(29,78,216)` azul | `rgb(255,145,1)` naranja |
| Tipografía | **Fraunces** (display, 8 usos) + **Plus Jakarta Sans** (texto, 36 usos) | Segoe UI / Arial Black (pila del sistema) |
| Bordes | `1px solid rgb(231,229,224)` | `1px solid rgba(255,255,255,0.09 – 0.20)` |
| Radios | 24px tarjeta, 12/16px bloques, 9999px píldoras | 18px tarjetas, 14/16px bloques, 99px píldoras |
| Sombras | muy suaves, `rgba(10,10,10,0.12) 0 12px 40px -12px` | profundas + halo del acento, `rgba(255,145,1,0.28) 0 10px 30px` |

Capturas guardadas: `capturas/ref-tarjeta.png` y `capturas/ref-zelandia.png` (no versionadas).

## La decisión, en una línea

**La tarjeta de Zelandia, sin las cifras y con un solo código QR grande.** Una sola vista, sin
pestañas ni selector de modos: ubicación, foto con aro, nombre, cargo y empresa, dos bloques de
texto, el QR, el teléfono y la firma. Fondo casi negro, sans de peso alto para el nombre y el
titular, y el naranja usado como bisturí, no como brocha.

⛔ **SUPERADA la primera versión de esta sección**, que decía "la arquitectura visual de la tarjeta
clara repintada, con un serif de display". Se escribió leyendo el encargo 1; el encargo 2 señaló la
página de Zelandia y dijo "la quiero así", y esa referencia usa una **sans pesada**, no un serif.

## Tokens (esto es lo que se implementa, no los adjetivos de arriba)

| Token | Valor | Para qué |
|---|---|---|
| `--fondo` | `#0A0A0B` | El lienzo. Sale de Zelandia, medido |
| `--superficie` | `#141416` | La tarjeta. Un paso más clara que el lienzo: es lo que la hace FLOTAR sin depender de una sombra, que en fondo oscuro casi no se ve |
| `--superficie-sutil` | `rgba(255,255,255,0.04)` | Paneles internos y el fondo del monograma |
| `--borde` | `rgba(255,255,255,0.10)` | Separación por defecto |
| `--borde-fuerte` | `rgba(255,255,255,0.18)` | Píldoras y controles |
| `--tinta` | `#F5F5F7` | Texto principal |
| `--tinta-suave` | `#A1A5AC` | Texto secundario |
| `--acento` | `#FF9101` | El punto de la ubicación, el aro del avatar, enlaces |
| `--acento-tenue` | `rgba(255,145,1,0.28)` | Halos y anillos |
| Radios | `24px` tarjeta · `16px` bloques · `999px` píldoras | Promedio de las dos referencias |
| Sombra de la tarjeta | `0 24px 60px -20px rgba(0,0,0,0.8)` + anillo `inset 0 0 0 1px var(--borde)` | En oscuro el anillo hace el trabajo que en claro hacía la sombra |

**Contraste, medido y no estimado** (WCAG, AA normal = 4.5): tinta 18,18:1 · tinta suave 8,00:1 ·
acento 8,77:1 sobre el fondo. Sobre la superficie de la tarjeta: 16,90 / 7,44 / 8,15. **Los seis
pares pasan AAA.** El script está en el commit de esta ola.

## Tipografía

- **Plus Jakarta Sans, y nada más.** UNA sola familia: lo que separa el nombre y el titular del
  resto es el **peso** (800), no la familia. Es lo que hace la referencia que Johann señaló.
- ⛔ **Fraunces quedó fuera.** Se había elegido leyendo el encargo 1 ("el estilo de la tarjeta
  clara", que sí usa un serif editorial). Al señalar la página de Zelandia, la referencia cambió, y
  el proyecto dejó de descargar una familia entera.
- Se sirven **auto-hospedadas** con `next/font/google`, que las descarga en el build. No es una
  preferencia de rendimiento: la CSP arranca en `default-src 'self'` y el criterio de éxito exige
  **cero recursos de dominios ajenos**. Un `<link>` a `fonts.googleapis.com` lo bloquearía el
  navegador y el texto saldría con la fuente de respaldo, sin ningún error visible.
- Interletra apretada en los títulos (`-0.02em`), como la referencia (medido: `-0.9px` a 20px).

## Lo que está PROHIBIDO en este proyecto

No es una lista genérica: cada línea tiene su razón, y varias vienen de una medición previa.

1. **Dos vistas, pestañas o cualquier selector de modos.** La tarjeta cabe en UNA SOLA VISUAL, sin
   scroll. Es el requisito que Johann marcó como principal y no negociable, y está garantizado por
   construcción: el bloque del QR absorbe la holgura, así que ningún texto puede empujar nada fuera
   de la pantalla. Se mide contra `100dvh`, nunca `100vh`: en un teléfono real la barra del
   navegador se come ~90 px que `vh` ignora, así que con `vh` la tarjeta "cabe" en la medición y se
   sale en la mano del usuario.
2. **Un bloque de cifras o KPIs.** Se eliminó tras un debate de tres lentes ortogonales: de 18
   casillas posibles en 6 perfiles reales solo 6 o 7 se llenarían con algo útil, un campo vacío "se
   lee como que a uno le faltó algo" y presiona a inventar, y quien RECIBE la tarjeta ignora las
   cifras ajenas. Lo que sí convence es una frase clara de a qué se dedica la persona.
3. **Mostrar en pantalla lo que puede viajar en el QR.** Redes, enlaces, dirección, correo y los
   teléfonos 2 y 3 NO se ven: van dentro del vCard que la otra persona guarda en su agenda. Medido:
   con el QR que produce este layout, el vCard completo queda en 2,59 px por cuadrito, sobre el piso
   de lectura, así que no hay que recortar ningún campo.
4. **Inter, Geist y la pila del sistema como tipografía de marca.** Es el default de IA y borra la
   diferencia entre esta tarjeta y cualquier plantilla.
5. **Degradados morados, y el patrón hero + tres iconos.** Mismo motivo.
6. **DOS códigos QR en la misma vista**, aunque las dos referencias los tengan. Medido el
   2026-09-03: dos QR se reparten el ancho y quedan en **2,39 px por cuadrito**, por debajo del piso
   práctico de ~2,5. Es la causa medida de que la tarjeta de referencia haya que acomodarla para que
   la lean. Aquí va **uno solo, a ancho completo** (4,66 px por cuadrito, casi el doble).
7. **QR sobre fondo oscuro.** El código va siempre sobre una teja BLANCA con su zona silenciosa de
   4 módulos. No es estética: un decodificador necesita ese contraste y ese margen para *encontrar*
   el símbolo. Las dos referencias ya lo hacen bien.
8. **Cualquier recurso de un dominio ajeno**: fuentes por CDN, analítica, widgets, iconos remotos.
   Lo bloquea la CSP y rompería la promesa de privacidad, que es el producto entero.
9. **`backdrop-filter` y desenfoques animados.** El teléfono real de una conferencia es de gama
   media. Se anima solo `transform` y `opacity`, respetando `prefers-reduced-motion`.
10. **El naranja como fondo de áreas grandes.** Es acento: cifras, una palabra del titular, el punto
   de estado, un anillo. Un bloque naranja grande convierte una tarjeta profesional en un volante.

## Cómo se compone la vista única

De arriba hacia abajo, y en este orden:

1. **Ubicación**, en versalitas con el punto del acento. Sale del campo de ciudad; si está vacío, no aparece.
2. **Foto con aro de acento** (o monograma de iniciales), **nombre** en peso 800, y **cargo · empresa** debajo.
3. **Titular**: una frase, lo que hace la persona. Peso 800.
4. **Descripción**: hasta dos frases, por qué la buscan.
5. **UN código QR**, sobre teja blanca, ocupando todo el espacio que sobre.
6. **Un teléfono**, visible como respaldo si la cámara falla.
7. **La firma de marca**, dentro del elemento capturable.

**Los dos bloques de texto llevan tope duro de caracteres Y recorte de líneas.** Son dos candados
para lo mismo por vías distintas: el tope evita que alguien escriba de más, y el recorte es el piso
duro, porque un tope de caracteres es un PROXY del alto y falla con caracteres anchos (medido: 160
letras "m" ocupan 7 líneas donde un texto normal ocupa 4).

**La firma va DENTRO del elemento capturable y el resto de controles FUERA**, aunque hoy no haya
ninguno: el `.jpeg` de la Ola 5 es una captura de ese nodo, así que un botón adentro saldría en la
imagen que el usuario regala. Hay un assert que lo vigila, probado por mutación.

## Qué queda sin decidir

El **modo claro** no entra en la v1. La marca de Johann tiene las dos caras (la tarjeta es clara, el
sitio de Zelandia es oscuro), y sostener las dos duplica el trabajo de esta ola sin que nadie lo haya
pedido. Si aparece la necesidad, los tokens de arriba ya están en variables CSS: es cambiar sus
valores en un bloque, no reescribir componentes.
