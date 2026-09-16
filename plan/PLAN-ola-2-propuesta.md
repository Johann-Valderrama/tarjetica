> ✅ **APROBADO por el dueño el 2026-09-16 para ejecutarse en un chat nuevo.** Reemplaza a
> `PRP-TD-002-cuentas-y-foto-borrador.md`, que queda SUPERADO. La versión anterior de este plan (gates G-A
> a G-F, 2026-09-15) está en el historial de git, commit `f0479ee`.

# Tarjetica v2 en la rama `v2`: cuentas, foto cifrada, miniatura y enlace corto

> **PARA RETOMAR (2026-09-16).** Dirección nueva: v2 exploratoria en la rama `v2`, `main` congelada como v1.
> Encuesta P1 a P12 respondida completa, con P5b y P5c. Decisiones registradas en `DECISIONES.md`;
> estado y siguiente acción en `PROGRESS.md`.

## DIRECCIÓN NUEVA (2026-09-16): v2 se explora en la rama `v2`

Decisión del dueño: la ola 2 deja de ser "una capa que se agrega a v1 con cuidado" y pasa a ser **v2
exploratoria en una rama `v2`**, sin los límites que v1 se puso por no tener servidor. `main` queda como
v1 congelada con sus reglas (sin base, sin fotos alojadas). Al final se decide si `v2` se fusiona o no.

**Cómo se garantiza que v1 no se toca, de forma mecánica y no por disciplina:** mismo proyecto de Vercel;
`v2` sale como despliegue de vista previa; la variable de conexión a Neon (rama `pruebas`) se declara
**solo para el entorno Preview de la rama `v2`**. Producción (`main`) no la tiene, así que v1 no puede
hablar con la base aunque el código existiera.

**Qué cambia de los gates de abajo:** G-A (opcional o reemplazo) se decide al fusionar, no antes. G-B
(alcance recortado) queda superado: v2 explora el alcance completo, miniatura incluida. G-C a G-F se
reemplazan por las respuestas de la encuesta P1 a P12. **Lo único que NO se levanta** es la ley: explorar
con datos de prueba sí, abrirle v2 a personas reales antes de la asesoría legal no (pregunta P9).

### Inventario de límites de v1: cuáles libera Neon y cuáles no

Cobertura: `PRP-TD-001` §0, §2, §3, §11 y §13 leídos completos; `DECISIONES.md` barrido por
prohibiciones, aplazamientos y descartes; `PRP-TD-002` §6.

| Límite de v1 | Por qué se puso | ¿Lo libera Neon? | Pregunta |
|---|---|---|---|
| La foto no se ve al abrir el enlace | alargaba la URL y la dejaba irrevocable | **Sí** | P1 |
| Sin miniatura al compartir; `next/og` prohibido | renderizar en servidor veía los datos (D1) | **Sí** | P2 |
| Enlace irrevocable, no editable y largo | los datos viajaban en la URL | **Sí** | P3 |
| La tarjeta vive en un solo navegador | sin cuentas | **Sí** | P4 |
| Sin analítica de escaneos; no se pueden contar tarjetas | exigía servidor propio | **Sí** | P5 |
| Una persona, una tarjeta; sin tarjetas de empresa | alcance mínimo | **Sí** | P6 |
| Tarjeta de un tercero (stand de evento) | moría con el `localStorage` | cambia de riesgo | P7 |
| Frase "No guardamos tus datos en ningún servidor" | era cierta con D1 | deja de ser cierta en v2 | P8 |
| Apple y Google Wallet | fuera de alcance | **Sí** (firmar el pase exige servidor) | P10 |
| Botones Agendar y Cuéntame fijos en el enlace | enlace no editable | **Sí, automático** con P3 | ninguna |
| Vista previa genérica y "Compartir desde el receptor" | aplazadas en H1 | nunca necesitaron servidor | ninguna, al backlog |
| Foto dentro del QR; dos QR; rMQR y PDF417 | física del QR: densidad y lectores | **No** | ninguna |
| Firma de marca fuera del vCard | respeto a la agenda de un tercero | **No** | ninguna |
| CSP `default-src 'self'`, sin analítica de terceros | seguridad | **No, se conserva** (§3.b) | ninguna |
| Sin modo sin señal (PWA) | alcance | **No**; un servidor lo complica, no lo facilita | ninguna |
| El enlace queda en el historial de quien lo abre | no tiene arreglo desde la página | **No**, pero revocar (P3) lo mitiga | ninguna |
| Asesoría legal antes de datos de personas reales | Ley 1581 | **No** | P9 |

### Respuestas de la encuesta (2026-09-16)

| # | Tema | Decisión del dueño | Consecuencia que queda escrita |
|---|---|---|---|
| P1 | Foto al abrir el enlace | **Cifrada**; solo la ve quien tiene el enlace completo | el servidor nunca la tiene legible dentro de la tarjeta |
| P2 | Miniatura al compartir | **La persona elige, con foto por defecto** | la miniatura es una **imagen pública aparte** de la foto cifrada; existe mientras la persona no la apague. Reabre la prohibición de `next/og` solo para generar esa imagen |
| P3 | Enlace | **Corto `/c/<id>#<clave>` como principal, largo de respaldo** al lado | si la base se suspende, la persona conserva un enlace que abre |
| P4 | Recuperar la tarjeta | **Cuenta con Google** | el correo queda en la base: es dato personal y entra a la revisión legal |
| P5 | Métricas | **Contador de ACCIONES (Agendar, Cuéntame, WhatsApp, llamar, correo, guardar contacto) y aperturas, con tasa de clic y canal, visible SOLO para el administrador**, para decidir mejoras de diseño. **P5b:** la tasa se calcula sobre las aperturas donde cada botón estaba visible; **P5c:** no se leen conclusiones de un botón antes de **1.000 aperturas con ese botón visible** (umbral por botón, no total, porque un total de 2.000 puede dejar un botón poco usado con 500 datos); y el socio agrega al dueño como administrador en su despliegue. La persona dueña de la tarjeta no ve ningún número. Consultados dos expertos Sonnet con lentes distintos (marketing y psicología del consumidor; leads y ventas): los dos concluyeron que abrir es casi vanidad y que las acciones son la señal real; el de marketing advirtió que un número bajo desanima y vuelve transaccional el regalo, y por eso no se le muestra a la persona | se guarda **agregado por día, acción y canal, sin identificador de tarjeta ni del visitante**: no hay nada personal que proteger ni que borrar |
| P6 | Tarjetas por cuenta | **Varias** | existe una lista o mosaico de "mis tarjetas" |
| P7 | Tarjeta de otra persona | **Propuesta del dueño, con límites**: marcar "es de otra persona" pide el correo de Google del titular; la tarjeta espera cifrada, con el correo guardado como huella no legible, y **se borra sola a los 7 días** si nadie la reclama. El reclamo llega por **QR en el stand y por el botón Compartir que ya existe** | sin desarrollo de WhatsApp; el titular reclama desde su propio teléfono, nadie abre su Google en un equipo ajeno |
| P8 | Promesa de privacidad | **v1 conserva su frase intacta; v2 lleva una frase propia**, escrita con la revisión legal | `mensajes.test.ts:77` sigue verde en `main` |
| P9 | Revisión legal | **Antes de abrir v2 a personas reales**; se construye con datos de prueba. Se hace con un **equipo de agentes** (ver Ola 2.L) | no frena la exploración; bloquea que alguien distinto del dueño use v2 |
| P10 | Apple y Google Wallet | **Al backlog** | fuera de v2 |
| P11 | Monitoreo de cuota | **GitHub Actions** en el repo origen, cada 6 horas | se apaga a los 60 días sin actividad, que coincide con v2 en standby |
| P12 | Dominio de Zelandia | **Fuera de nuestro alcance, solo anotado.** Lo decide el socio al subir su fork al Vercel de producción; su propuesta es `zelandia.io/microapps/personalcard`, un directorio para todas las microapps gratis que se regalen | se entrega como nota de traspaso lo hallado en §7 sobre `basePath`; no hay spike nuestro |

**Aprendizaje de proceso de esta encuesta:** el texto escrito en el chat antes de la encuesta no le llegó al
dueño. La explicación de cada opción va dentro de la opción misma, con ventaja y desventaja.

## Contexto

Tarjetica hoy no tiene servidor de datos. La tarjeta vive en `localStorage` y el enlace compartible lleva
los datos comprimidos en el fragmento de la URL, que nunca llega al servidor. Esa decisión (D1) no es una
limitación tolerada: es la mitigación central de privacidad del producto, y es la razón de que la frase
"No guardamos tus datos en ningún servidor" sea literalmente cierta hoy en `README.md:6`, `package.json:5`,
`messages/es-CO.json:4`, la portada, el editor y `/privacidad`.

La ola 1 está cerrada, integrada y en producción. El dueño pidió una ola 2 que rompe ese piso: cuentas por
persona, foto y logo alojados y visibles al abrir el enlace, miniatura con foto al compartir, enlace corto
cifrado `/c/<id>#<clave>` revocable y editable, eliminar cuenta, monitoreo de la cuota de Neon, degradación
digna cuando la base esté suspendida, y la evaluación de servir la app bajo `zelandia.io/tarjetica`.

Este plan convierte el borrador `plan/PRP-TD-002-cuentas-y-foto-borrador.md` en un plan ejecutable **hasta
el punto exacto donde tú tienes que cerrar gates**. No diseña autenticación, cifrado ni políticas de acceso
en detalle, por instrucción tuya y porque el debate adversarial concluyó que hacerlo antes de los gates es
trabajo que se bota. Lo que va después de los gates queda como esqueleto de olas con modelo, esfuerzo y
criterios de aceptación en notación EARS.

---

# BLOQUE INFORMATIVO (no necesitas hacer nada con esto)

## 1. Debate adversarial: una ronda, atacante Sonnet, lente escrito

Corrí un atacante de solo lectura con lente escrito, sin darle el rationale a favor, sobre dos
proposiciones separadas. Leyó completo `DECISIONES.md`, `PRP-TD-002`, `src/features/legal/contenido.ts` y
`codec.ts`, más las secciones 4, 9, 11 y 12 de `PRP-TD-001`.

**Veredictos**

| Proposición | Veredicto del atacante |
|---|---|
| A: vale la pena reabrir D1 para construir la ola 2 **con este alcance completo** | **INDEFENDIBLE** tal como está |
| B: capa opcional, el modo sin servidor sigue intacto y por defecto | **DEFENDIBLE CON CONDICIONES** |

La recomendación previa (capa opcional) **sobrevivió**. Lo que no sobrevivió es el alcance completo en un
solo corte. El argumento más fuerte del atacante no es contra el servidor: es contra meter en la misma ola
la capacidad de mayor riesgo legal y menor valor (la miniatura) junto con las de valor real.

**Las cinco objeciones de severidad alta, y qué hago con cada una**

1. **Cifrado no es lo mismo que "no soy Responsable del tratamiento".** El contenido de la tarjeta queda
   cifrado, sí. Pero el correo de la cuenta y la relación cuenta ↔ enlace viven en claro, y eso ya es dato
   personal bajo el art. 3 de la Ley 1581. **Aceptada.** Pasa a la lista legal como pregunta 1, y baja las
   cuentas a una ola posterior al gate legal.
2. **Contradicción con `/privacidad`, que ya está publicado.** Cuatro afirmaciones concretas se vuelven
   falsas: `contenido.ts:53` "No hay base de datos", `:96` "no existe ningún interruptor que podamos
   apagar", `:184` "no existe una base de datos nuestra", y la mención de no estar en el universo obligado
   a inscribirse en el RNBD. Y el repo invita explícitamente a auditar (`contenido.ts:37`). **Aceptada, y
   es la más grave del lote**, porque no es un defecto técnico: se lee como engaño en el documento que
   existe para dar confianza. Pasa a ser gate G-C.
3. **Colisión entre cuentas y el caso "stand de evento".** `contenido.ts:143` bendice que alguien cree la
   tarjeta de otra persona. Hoy ese dato muere con el `localStorage` del visitante. Con cuentas, queda
   atado de forma durable a la cuenta de quien NO es el titular, y el titular no tiene login con el cual
   pedir supresión. **Aceptada.** Pasa a gate G-D.
4. **El operador del despliegue que se regala no es quien figura como Responsable.** `contenido.ts:32`
   nombra a una persona natural como Responsable único, y la infraestructura del despliegue regalado la
   opera el socio. Si un titular pide supresión, la cadena legal y la cadena operativa no coinciden.
   **Aceptada.** Es la pregunta 2 de la lista legal y no la puedo resolver yo.
5. **El monitoreo no es una mitigación, es una narración.** Un aviso al 80 % no restaura el servicio. Si la
   cuota se agota, los enlaces `/c/` quedan muertos semanas. **Aceptada en parte:** el monitoreo sigue
   valiendo (lo verifiqué: el plan gratis de Neon no trae alertas, ver §2), pero deja de ser la mitigación
   principal. La mitigación principal pasa a ser la degradación digna construida y probada (§6), no
   declarada.

**La objeción que NO acepto, y por qué.** El atacante propone como tercera alternativa un "acortador propio
sin persistencia de contenido, donde el servidor solo mapea `id → URL larga original` sin ver los datos
descifrados". Eso es incoherente: para guardar la URL larga, el navegador tendría que enviarle al servidor
el payload completo, que es exactamente el dato de la tarjeta. O el servidor ve los datos en claro (peor
que lo propuesto), o el payload va cifrado, en cuyo caso esa alternativa **es** `/c/<id>#<clave>`. La
descarto por colapsar en la propuesta o en algo estrictamente peor.

**Lo que el atacante dijo que está bien resuelto:** la arquitectura actual de solo fragmento. La foto nunca
entra al payload por diseño de tipos (`Tarjeta` en `.strict()` más `FotoLocal` aparte), no por disciplina
de quien edita. Ese patrón se conserva tal cual.

## 2. Precios verificados hoy, 2026-09-15, en las páginas oficiales

Todo lo de esta sección lo leí hoy en `neon.com/pricing`, `neon.com/docs/introduction/plans`,
`vercel.com/pricing` y los docs de Vercel Blob y de cron jobs. Son citas, no recuerdos.

**Neon**

| | Free | Launch | Scale |
|---|---|---|---|
| Precio | 0 USD | Pago por uso, **sin mínimo mensual** | Pago por uso, sin mínimo mensual |
| Cómputo | 100 CU-hours por proyecto/mes | 0,106 USD por CU-hora | 0,222 USD por CU-hora |
| Almacenamiento | 0,5 GB por proyecto, **compartido entre ramas** | 0,35 USD por GB-mes | 0,35 USD por GB-mes |
| Ramas | 10 por proyecto | 10, extras a 1,50 USD/rama-mes | 25, extras a 1,50 USD/rama-mes |
| Historial | 6 horas (límite 1 GB) | hasta 7 días | hasta 30 días |
| Egreso | no publicado en la fila Free | 500 GB por proyecto, luego 0,10 USD/GB | igual |
| Scale to zero | a los 5 minutos | a los 5 minutos, se puede desactivar | configurable, desde 1 minuto |
| Alertas de consumo | **ninguna** | correo al 80 % y 100 % de un umbral que tú fijas | igual |

Tres hechos que cambian el diseño, no solo el presupuesto:

- **Al agotar CU-hours:** *"your compute is suspended until the next billing period or until you upgrade"*.
  La base se pausa hasta el mes siguiente. Ninguno de estos límites borra datos.
- **Al pasar 0,5 GB:** fallan los inserts, los updates **y los deletes**. Es decir, con la base llena,
  "eliminar cuenta" deja de funcionar, que es justo la obligación legal que no se puede incumplir.
- **El plan gratis no trae alertas.** Las alertas al 80 % y 100 % son de Launch y Scale. Por eso el
  monitoreo hay que construirlo: no es una función que Neon ya me dé y yo esté duplicando.

**Cuántas visitas aguanta el plan gratis.** El cómputo más pequeño de Neon es 0,25 CU (1 GB de RAM) y el
plan Free admite hasta 2 CU. Con 0,25 CU y suspensión a los 5 minutos, cada despertar cuesta unas
0,021 CU-horas, así que 100 CU-horas dan del orden de **4.800 despertares al mes, unos 160 al día**. Con
1 CU serían unos 40 al día. Un despertar no es una visita: si tres personas abren enlaces en el mismo
minuto, es un solo despertar. **Esta cifra es un cálculo mío a partir de las cifras oficiales, no un dato
publicado por Neon**, y la primera unidad de construcción la mide contra el consumo real.

**Vercel**

| | Hobby | Pro |
|---|---|---|
| Precio | 0 USD | 20 USD al mes por usuario |
| Uso comercial | *"Our Hobby plan is for personal, non-commercial use"* | permitido |
| Ancho de banda | 100 GB/mes | 1 TB/mes, luego 0,15 USD/GB |
| Cron jobs | 100 por proyecto, **mínimo una vez al día**, precisión de ±59 minutos | 100 por proyecto, cada minuto |
| Blob (almacenamiento de archivos) | 1 GB/mes, 10.000 operaciones simples, 2.000 avanzadas, 10 GB de transferencia | por uso |

Dos cosas que hay que decir sin suavizar:

- **El plan Hobby de Vercel es para uso personal y no comercial, en sus palabras.** El despliegue que se
  regala va a operar bajo la marca de Zelandia. Si eso cuenta como comercial, ese despliegue necesita Pro,
  que son 20 USD al mes. No es una decisión técnica y no la tomo yo: va a la lista legal y comercial.
- **Vercel Blob en Hobby, al pasarse del límite:** *"you will not be able to access Vercel Blob if limits
  are exceeded... you will have to wait until 30 days have passed"*. Si las fotos alojadas viven ahí, es
  una segunda cuota que también hay que monitorear, no solo la de Neon.

**Costo recurrente, escenarios**

| Escenario | Neon | Vercel | Total al mes |
|---|---|---|---|
| Uso bajo, todo en capa gratis, despliegue tratado como personal | 0 | 0 | **0 USD** |
| Uso bajo, despliegue regalado en Pro por ser comercial | 0 | 20 | **20 USD** |
| Cuota de cómputo agotada, se pasa a Launch, uso moderado (unas 200 CU-horas y 1 GB) | ~21 + ~0,35 | 20 | **~41 USD** |
| Base despierta todo el mes por un defecto (730 CU-horas en Launch) | ~77 | 20 | **~97 USD** |

El último renglón es el que importa: **en un plan de pago no hay techo automático**. Un bucle de conexiones
mal hecho no pausa la base, te la cobra. Si se pasa a Launch, se fija un umbral de alerta el mismo día.

## 3. Qué decisiones reabre esta ola

| Qué se reabre | Estado hoy | Qué pasa con la ola 2 |
|---|---|---|
| **D1**, los datos viven solo en el navegador | mitigación central del producto | deja de ser universal. Sobrevive como el modo por defecto si se elige capa opcional |
| **D5**, el enlace es opcional, apagado por defecto y lleva los datos adentro | vigente | se invierte para `/c/`: los datos ya no viajan en la URL, existe un registro que la resuelve. Cambia lo que se promete (revocable, editable) y lo que se advierte |
| **G2**, "No guardamos tus datos en ningún servidor" | frase exacta, bloqueada, en 6 sitios del repo | falsa para el modo con cuenta. No se puede reformular a la ligera: `src/i18n/mensajes.test.ts:77` la verifica literal, y es a la vez marketing y afirmación jurídica |
| **La meta original** ("sin cuenta y sin servidor, para reemplazar el papel") | escrita en `PROGRESS.md` con la nota de que nunca se reescribe | se conserva intacta si la cuenta es opcional. Si la reemplaza, hay que escribirlo como meta nueva, no editar la vieja |
| **La prohibición de `next/og`** | vigente | solo la reabre la miniatura con foto. Si la miniatura sale del alcance, la prohibición sigue en pie sin tocarla |

## 3.b. Dos hallazgos del mapa del código que cambian el diseño

**La CSP no hay que relajarla, y eso desarma la objeción 7 del atacante.** La política vive en
`src/shared/seguridad/headers.ts:55-78` y la emite `src/proxy.ts:13-21` con un nonce por petición. Sus
directivas relevantes son `img-src 'self' data: blob:` y `connect-src 'self'`. La conexión a Postgres sale
del servidor, no del navegador, así que `connect-src` ni se entera. El único riesgo real era servir las
fotos alojadas desde un dominio ajeno, que obligaría a abrir `img-src`. **Se evita sirviendo las fotos por
nuestro propio origen**, con un route handler que las entrega. Así la CSP queda intacta, con
`default-src 'self'` sin excepciones, y el script `scripts/verificar-headers.mjs` que ya la verifica sigue
siendo el candado, sin partir la política en dos. Esto convierte la objeción 7 en un requisito de diseño de
una línea en vez de un problema abierto.

**Un defecto preexistente que menciono y no arreglo de paso.** `borrarTodo()` en
`src/features/tarjeta/almacenamiento/local.ts:216` barre `CLAVES_CONOCIDAS`, pero la clave
`'tarjetica:ping:card_created'` que escribe `src/features/metricas/ping-de-tarjeta-creada.tsx:25` no está en
esa lista, así que "Borrar mis datos de este dispositivo" la deja viva. No arrastra datos personales (es una
bandera de una sola vez), pero contradice la promesa de `local.ts:22-23` de que el borrado no deja rastro.
Es de la ola 1, no de esta, y arreglarlo aquí sería un cambio fuera del pedido: queda nombrado para que tú
decidas si se atiende aparte.

## 4. Un hallazgo que hay que corregir, independiente de todo lo demás

`plan/DECISIONES.md:616` nombra a un tercero por su nombre de pila, en un repo **público**, y ya está
empujado. Tu propio límite para esta sesión lo prohíbe. Lo corrijo reescribiendo esa línea hacia adelante
(queda "el despliegue que se regala, operado por el socio"), con una advertencia honesta: **el historial de
git ya lo contiene y reescribir el historial de un repo público es peor que el problema**. Lo que se gana es
que el archivo vigente deje de repetirlo. Va como unidad 0, antes que cualquier otra cosa, y no depende de
ningún gate.

## 5. Monitoreo de la cuota: las tres vías comparadas

| | Vercel Cron | GitHub Actions | Consultar la API de Neon a mano |
|---|---|---|---|
| Costo | 0 en Hobby | 0, *"free... for public repositories"* | 0 |
| Frecuencia | **una vez al día** en Hobby, ±59 min; cada minuto en Pro | mínimo cada 5 minutos | cuando alguien se acuerde |
| Canal de aviso | ninguno propio: hay que sumar un proveedor de correo | **el que ya existe**: un workflow que falla le manda correo al dueño del repo | ninguno |
| Dónde vive el secreto | variables de entorno del despliegue | secretos del repo, que **no** se heredan a los forks | máquina del dueño |
| De qué depende | de que ese despliegue exista | de que el repo tenga actividad | de la memoria de una persona |
| Falla conocida | precisión diaria pobre; el mismo código corre en los dos despliegues, así que hay que apagarlo por variable de entorno en uno | *"In a public repository, scheduled workflows are automatically disabled when no repository activity has occurred in 60 days"* | descartada, no es un mecanismo |

**Recomendada: GitHub Actions en el repo origen**, cada 6 horas, contra
`GET /consumption_history/v2/projects` (campo `compute_unit_seconds`) para el consumo y
`GET /projects/{id}/endpoints` (campo `current_state`, valores `init` / `active` / `idle`) para saber si la
base está suspendida. Gana por una sola razón, y es la que el atacante no pudo tumbar: **es la única de las
tres que trae el canal de notificación incluido y gratis**. Un workflow que sale con código distinto de cero
cuando se cruza el 80 % le llega al correo del dueño sin montar un proveedor de correo, sin una segunda
cuenta y sin tocar ninguno de los dos despliegues.

Lo que hay que aceptar de esa elección, dicho antes de elegirla: los 60 días de inactividad la apagan sola,
y los logs de un repo público son públicos, así que el workflow imprime el veredicto ("umbral superado"),
nunca las cifras. La vía de escape es `workflow_dispatch` para correrlo a mano y una línea en el PROGRESS.
Esto va como opción dentro del gate G-E, no lo decido yo.

## 6. Degradación digna: qué significa exactamente

Este es el punto donde el atacante tiene toda la razón y el borrador estaba débil. La degradación no puede
ser un párrafo, tiene que ser código probado. Lo que sostiene el producto cuando la base está suspendida:

1. **El enlace largo `/t#<payload>` no toca la base.** Se sirve estático desde Vercel y se arma en el
   navegador. Sigue funcionando exactamente igual, y los enlaces ya repartidos no se enteran de nada.
2. **El QR, el JPEG y el `.vcf` se generan en el cliente.** Tampoco tocan la base.
3. **El editor arranca de `localStorage`, no de la base.** La base es un extra, nunca el arranque. Esta es
   la invariante dura de la ola: si el editor deja de abrir porque Postgres no responde, la ola está mal
   construida y se devuelve.
4. **Al crear un enlace corto, se entrega también el largo**, en el mismo momento y sin pedirlo. Es el
   respaldo que le queda a la persona si la base muere, y convierte el peor caso de "mi enlace murió" en
   "tengo el otro enlace guardado".
5. **`/c/<id>` con la base caída muestra una página que explica qué pasó y qué hacer**, no un error 500 ni
   una pantalla en blanco.

## 7. Servir la app bajo `zelandia.io/tarjetica`

Lo miré contra `next.config.ts`, que hoy no tiene `basePath` ni `assetPrefix`. Lo que encontré:

- `basePath` en Next.js es **de compilación y global**. Un mismo build no puede servirse a la vez en la raíz
  de `tarjetica-app.vercel.app` y bajo `/tarjetica` de otro dominio.
- Un rewrite desde `zelandia.io` hacia el despliegue actual **no alcanza solo**: el HTML llegaría con rutas
  absolutas (`/editor`, `/_next/...`) que se romperían bajo el subdirectorio.
- La forma que sí funciona: `basePath` leído de una variable de entorno, y **dos despliegues del mismo
  repo**. Uno sin la variable, que mantiene vivo `tarjetica-app.vercel.app` y todos los enlaces `/t#` ya
  repartidos. Otro con `basePath: '/tarjetica'`, al que `zelandia.io` le hace rewrite. Es el mismo patrón
  de "dos despliegues del mismo código" que ya decidiste para la base.
- **Lo que se rompe si se hace sin cuidado, ya localizado:** `construirEnlace(tarjeta, window.location.origin)`
  en `src/features/tarjeta/enlace/generar-enlace.tsx:60` concatena `origen + '/t'`, sin el subdirectorio, así
  que bajo `basePath` generaría enlaces rotos. `src/features/tarjeta/vista/firma.tsx:19` tiene el dominio
  `tarjetica-app.vercel.app` escrito a mano y lo **estampa dentro del JPEG exportado**, o sea que un cambio
  de dominio queda impreso en las tarjetas viejas. `src/app/robots.ts:14` y `src/proxy.ts:23` derivan rutas
  sin prefijo, y `scripts/verificar-headers.mjs:66,137,152` arma URLs contra la raíz. Son seis puntos
  concretos, no una incógnita.
- **Tensión que hay que ver antes de decidir:** el enlace corto quiere el dominio más corto posible, y
  `zelandia.io/tarjetica/c/<id>#<clave>` es bastante más largo que `tarjetica-app.vercel.app/c/<id>#<clave>`
  y muchísimo más largo que un dominio propio corto. La decisión de SEO y la decisión del enlace corto
  empujan en direcciones opuestas. Por eso propongo que esto sea un spike que produce números y una
  recomendación, no una migración dentro de la misma ola.
- Si se hace, hay que cerrar el canónico: la copia en `vercel.app` apunta con `canonical` a la de
  `zelandia.io`, o Google ve contenido duplicado y el beneficio de autoridad que buscas se diluye.

## 8. Preguntas para la asesoría legal (las resuelve el dueño fuera de aquí)

Esta lista sale del borrador §3, corregida con los hallazgos del atacante y con lo que `/privacidad` ya
promete en producción. **Sin respuesta a las cinco primeras no se escribe la primera migración.**

1. **La pregunta central.** Una base que guarda un correo de cuenta y un identificador ligados a un blob
   cifrado que el operador no puede descifrar, ¿constituye tratamiento de datos personales del titular de
   la tarjeta bajo la Ley 1581? El cifrado protege el contenido; el correo y la existencia de la cuenta
   están en claro y son "información que puede asociarse a una persona determinable" (art. 3).
2. **Quién es el Responsable ahora.** `src/features/legal/contenido.ts:32` nombra hoy a una persona
   natural. El contexto operativo pone a Zelandia como responsable y al socio operando la infraestructura
   del despliegue que se regala. ¿Se necesita un acuerdo escrito de Encargado del tratamiento entre el
   Responsable y quien tiene las llaves de la base? ¿Qué pasa con las solicitudes de supresión si quien
   figura como Responsable no controla la infraestructura?
3. **RNBD.** `contenido.ts` afirma hoy no estar en el universo obligado a inscribirse, apoyándose en que no
   hay base de datos. Con base de datos y con una persona jurídica como Responsable, ¿nace la obligación de
   registro ante la SIC? ¿Con qué umbrales y plazos?
4. **Dos promesas en el mismo dominio.** Si conviven el modo sin servidor y el modo con cuenta, ¿basta un
   solo documento de política que distinga los dos, o hace falta un documento por modo, cada uno con su
   fecha de vigencia? El atacante sostiene que un párrafo añadido al documento único se lee como engaño.
5. **Transferencia internacional.** Neon y Vercel alojan fuera de Colombia. Hoy `/privacidad` cubre solo el
   registro técnico de IP del hosting bajo el art. 26 literales b y f del Decreto 1377. Una base con datos
   de contacto es otra cosa. ¿Qué exige la ley: cláusulas contractuales, declaración de países, algo más?
6. **Tarjetas de terceros bajo una cuenta.** `contenido.ts:143` bendice el caso del stand de evento. Con
   cuentas, el dato del tercero queda atado de forma durable a la cuenta de quien no es el titular, y el
   titular no tiene login para pedir supresión. ¿Hay que prohibirlo, forzar ese flujo al modo sin servidor,
   o basta con un canal de supresión por correo?
7. **La miniatura.** Para que WhatsApp o LinkedIn muestren una vista previa con foto, un servidor tiene que
   servir esa imagen legible por cualquiera que tenga la URL, porque los rastreadores no ejecutan
   JavaScript ni ven el fragmento. ¿Eso cambia la calificación del tratamiento? ¿Qué consentimiento hace
   falta y cómo se retira?
8. **Plazos que ya están comprometidos.** `contenido.ts:187` promete 10 días hábiles para consultas y 15
   para reclamos. Hoy es trivial cumplirlos porque no hay nada que borrar del lado del operador. Con
   cuentas se vuelve una obligación operativa recurrente. ¿Se sostiene el plazo? ¿Quién responde?
9. **Menores y datos sensibles** en el campo libre de descripción (art. 5). Hoy hay un aviso pegado al
   campo. Con servidor, ¿se advierte más, se filtra, o se prohíbe?
10. **Qué se registra de quien abre un enlace.** Hoy es un ping anónimo sin cuerpo. Mantener ese "nada"
    con servidor es una decisión que conviene dejar escrita antes de que aparezca la tentación de medir.

---

# BLOQUE DE DECISIONES: SUPERADO por la encuesta del 2026-09-16

Los gates G-A a G-F de la versión del 2026-09-15 quedaron reemplazados por la dirección nueva (rama `v2`) y
por las respuestas P1 a P12, en la tabla del inicio. G-A (capa opcional o reemplazo) no desaparece: se
decide en el gate final, al momento de fusionar o no `v2`. El texto completo de los gates viejos queda en el
historial de git de `plan/PLAN-ola-2-propuesta.md` (commit `f0479ee`).

**Decisiones abiertas: ninguna.** La siguiente es el gate final, al terminar v2.

---

# ESQUELETO DE OLAS DE v2 (rama `v2`)

Modelo y esfuerzo por unidad. Criterios de aceptación en notación EARS. Una unidad, un commit, verificación
antes de integrar. Todo va en la rama `v2`, **salvo U0, que corrige `main`**. Se construye con datos de prueba;
nadie distinto del dueño usa v2 hasta cerrar la Ola 2.L (P9).

**Orden y dependencias:** 2.0 en cualquier momento. 2.L arranca en paralelo desde el día 1. 2.R → 2.A → 2.B →
2.C → (2.D, 2.E y 2.M sin orden entre ellas) → U10 (necesita la salida de 2.L) → gate final.

**Pasos que hace el dueño con su propio editor, nunca por el chat** (regla de secretos): crear el proyecto
Neon y su rama `pruebas`; pegar la cadena de conexión en Vercel; crear el cliente OAuth de Google y pegar su
secreto en Vercel; guardar la llave de la API de Neon como secreto del repo en GitHub. El agente solo
verifica **que existen**, por nombre, nunca por valor.

**Dónde vive el código nuevo.** Feature nueva y autocontenida en `src/features/enlace-corto/`, con su
cripto, su cliente de base, su API y sus tipos adentro. `src/app/c/[id]/page.tsx` y los route handlers bajo
`src/app/api/` son cáscaras delgadas que re-exportan, igual que ya lo son `src/app/t/page.tsx:18` y
`src/app/editor/page.tsx:17`. Lo que sí se toca de lo existente: `src/features/tarjeta/enlace/generar-enlace.tsx`
(para ofrecer el enlace corto junto al largo) y `src/shared/seguridad/headers.ts` solo si hiciera falta, que
según §3.b no hace falta. **`codec.ts` no se toca**: el diccionario está congelado y el enlace largo no
cambia.

## Ola 2.0 · Higiene en `main` (v1), no depende de nada

| U | Qué | Modelo.Esfuerzo | Criterio de aceptación (EARS) |
|---|---|---|---|
| U0 | Quitar el nombre del tercero de `plan/DECISIONES.md:616`, reescribiendo hacia adelante, y dejar nota de que el historial ya lo contiene | `Sonnet.L` | EL repositorio DEBE no contener nombres de terceros en ningún archivo vigente, verificado con una búsqueda que corre en CI |

## Ola 2.R · Montaje de la rama y del entorno

| U | Qué | Modelo.Esfuerzo | Criterio de aceptación (EARS) |
|---|---|---|---|
| R1 | 🙋 Dueño: proyecto Neon en la organización de Zelandia con rama `pruebas`; cadena de conexión en Vercel, **entorno Preview limitado a la rama `v2`** | humano | ninguno del agente |
| R2 | Crear la rama `v2` desde `main` y comprobar el aislamiento | `Sonnet.L` | EL entorno Production DEBE no tener la variable de conexión, verificado listando nombres de variables, nunca valores. MIENTRAS `main` no la tenga, v1 DEBE pasar la suite completa sin cambios |
| R3 | Comprobar que la vista previa de `v2` no está abierta al público (protección de despliegues de Vercel) | `Sonnet.L` | SI la vista previa responde sin autenticación, ENTONCES el equipo DEBE activar la protección antes de cargar cualquier dato |

## Ola 2.A · Cimientos, sin un solo dato personal en la base

| U | Qué | Modelo.Esfuerzo | Criterio de aceptación (EARS) |
|---|---|---|---|
| U1 | Medir el consumo real: crear el proyecto Neon con las dos ramas, dejar el cómputo en 0,25 CU, y medir cuánto cuesta un despertar de verdad contra la cifra calculada en §2 | `Sonnet.M` | EL equipo DEBE registrar en PROGRESS el consumo medido de un despertar y contrastarlo con la estimación de 0,021 CU-horas |
| U2 | Esquema y migraciones versionadas que viajan con el código desde el repo origen. Tabla de enlaces cifrados: identificador, blob, vector de inicialización, fecha de creación, fecha de último acceso. Sin correo, sin cuenta | `Opus.H` | EL esquema DEBE poder aplicarse desde cero sobre una rama nueva con un solo comando, y la rama `pruebas` DEBE quedar idéntica a `main` tras aplicarlo |
| U3 | Cliente de base con tiempo de espera corto y apagado por variable de entorno, más la invariante de arranque | `Opus.H` | SI la variable de conexión no existe o la base no responde en el tiempo de espera, ENTONCES la app DEBE arrancar igual y el editor DEBE abrir desde `localStorage` sin error visible |
| U4 | Monitoreo de cuota con GitHub Actions en el repo origen, cada 6 horas (P11), con `workflow_dispatch` para correrlo a mano | `Sonnet.M` | CUANDO el consumo mensual cruce el 80 % o el 100 % de las 100 CU-horas, EL workflow DEBE fallar para que GitHub avise al dueño por correo. CUANDO el almacenamiento cruce el 80 % de 0,5 GB, EL workflow DEBE avisar, porque con la base llena fallan los borrados. SI la base no responde o queda suspendida por cuota, ENTONCES EL workflow DEBE avisar. EL workflow DEBE no imprimir cifras en el log, que es público |
| U5 | Servir las fotos alojadas por nuestro propio origen para no tocar la CSP (§3.b) | `Opus.H` | LA CSP de `src/shared/seguridad/headers.ts` DEBE conservar `default-src 'self'` e `img-src 'self' data: blob:` sin agregar ningún origen remoto, verificado por `scripts/verificar-headers.mjs`, que ya falla si aparece uno |

## Ola 2.B · Enlace corto cifrado `/c/<id>#<clave>`

| U | Qué | Modelo.Esfuerzo | Criterio de aceptación (EARS) |
|---|---|---|---|
| U6 | Cifrado en el cliente con WebCrypto. La clave se genera en el navegador, va en el fragmento y nunca se envía | `Opus.H` | EL payload que sale del navegador hacia el servidor DEBE ser indescifrable sin la clave del fragmento, probado con un test que intenta leerlo con lo que el servidor guarda. EL servidor DEBE no recibir la clave en ninguna petición, probado con un test que inspecciona cuerpo, query y cabeceras |
| U7 | API de crear, leer, revocar y editar | `Opus.H` | CUANDO alguien revoque un enlace, EL servidor DEBE dejar de resolver ese identificador de forma permanente. CUANDO alguien edite su tarjeta, EL enlace repartido DEBE mostrar la versión nueva sin cambiar de dirección |
| U8 | Receptor `/c/<id>` y degradación digna | `Sonnet.M` | SI la base está suspendida o no responde, ENTONCES `/c/<id>` DEBE mostrar una explicación de qué pasó y qué hacer, nunca un error sin texto. MIENTRAS la base esté caída, `/t#<payload>`, el QR, el JPEG y el `.vcf` DEBEN seguir funcionando, probado con un e2e que corre con la base apagada |
| U9 | Al crear un enlace corto se entrega también el largo, en el mismo momento | `Sonnet.M` | CUANDO se genere un enlace corto, LA interfaz DEBE mostrar además el enlace largo equivalente y explicar que es el respaldo si el corto deja de resolver |
## Ola 2.C · Cuentas con Google y varias tarjetas (P4, P6)

| U | Qué | Modelo.Esfuerzo | Criterio de aceptación (EARS) |
|---|---|---|---|
| U11 | 🙋 Dueño crea el cliente OAuth de Google. 🤖 Inicio de sesión con Google. El diseño detallado lo hace Opus al abrir la unidad | `Opus.H` | CUANDO una persona inicie sesión con Google en otro dispositivo, LA app DEBE traerle todas sus tarjetas. SI la base no responde, ENTONCES el editor DEBE seguir funcionando con `localStorage` (invariante de U3) |
| U12 | Lista o mosaico de "mis tarjetas": crear, editar y borrar cada una | `Sonnet.M` | DONDE una cuenta tenga varias tarjetas, LA vista DEBE listarlas todas y permitir crear, editar y borrar cada una por separado |
| U13 | Subir a la cuenta la tarjeta que ya vivía en el navegador | `Opus.M` | CUANDO alguien inicie sesión por primera vez con una tarjeta en `localStorage`, LA app DEBE ofrecer subirla y nunca subirla sola. SI esa tarjeta está marcada "es de otra persona", ENTONCES DEBE seguir el camino de reclamo de U17, no subirse como propia |
| U14 | Eliminar cuenta | `Opus.H` | CUANDO alguien elimine su cuenta, EL servidor DEBE borrar sus tarjetas, fotos, miniaturas, enlaces y reclamos pendientes, y los enlaces repartidos DEBEN dejar de resolver. Las métricas no se tocan porque no llevan identificador de tarjeta (P5). EL aviso previo DEBE decir que las copias en caché de WhatsApp o LinkedIn no se pueden borrar desde aquí |

## Ola 2.D · Foto cifrada y miniatura al compartir (P1, P2)

| U | Qué | Modelo.Esfuerzo | Criterio de aceptación (EARS) |
|---|---|---|---|
| U15 | Foto y logo cifrados, servidos por nuestro propio origen (§3.b) | `Opus.H` | EL servidor DEBE guardar la foto y el logo solo cifrados. CUANDO alguien abra `/c/<id>#<clave>`, SU navegador DEBE descifrarlos y mostrarlos |
| U16 | Miniatura como **imagen pública aparte**, encendida por defecto y apagable. Reabre `next/og` **solo en la rama `v2` y solo para esta imagen**, con entrada nueva en `DECISIONES.md`; la exportación a JPEG sigue en el cliente | `Opus.H` | DONDE la persona tenga la miniatura encendida, LA vista previa en WhatsApp y LinkedIn DEBE mostrar su nombre y foto. ANTES de compartir, EL editor DEBE avisar que esa imagen es pública. CUANDO la persona la apague o elimine su cuenta, EL servidor DEBE borrar la imagen |

Trampa conocida de U16: los rastreadores de WhatsApp y LinkedIn no inician sesión, así que con la protección de
R3 encendida la miniatura no se puede probar. Se prueba abriendo la protección un rato y **solo con datos
inventados**.

## Ola 2.E · Reclamo de la tarjeta de otra persona (P7)

| U | Qué | Modelo.Esfuerzo | Criterio de aceptación (EARS) |
|---|---|---|---|
| U17 | Tarjeta creada para otra persona que espera su reclamo. La clave de cifrado viaja en el fragmento del enlace de reclamo, igual que en `/c/` | `Opus.H` | CUANDO se marque "es de otra persona" y se escriba el correo de Google del titular, EL servidor DEBE guardar la tarjeta cifrada y el correo solo como huella no legible. CUANDO el titular inicie sesión con ese correo desde su propio teléfono, LA tarjeta DEBE pasar a su cuenta. SI pasan 7 días sin reclamo, ENTONCES EL servidor DEBE borrarla por completo. EL enlace de reclamo DEBE poder mostrarse como QR y enviarse con el botón Compartir que ya existe, sin integración de WhatsApp |

## Ola 2.M · Métricas para el administrador (P5)

**Choque con un candado vigente, dicho antes de construir:** `src/features/metricas/ping.ts:41` tiene
`RUTAS_PROHIBIDAS = ['/tarjeta', '/t']`, y `DECISIONES.md` (2026-09-07) fija que la métrica nunca corre en la
ruta de la tarjeta. Las acciones ocurren justo ahí, en el receptor. En la rama `v2` ese candado se reabre
**solo para `/c/`** y con las mismas garantías del ping actual (propio origen, sin cuerpo, sin identificador),
con entrada nueva en `DECISIONES.md`. `/t` sigue prohibida.

| U | Qué | Modelo.Esfuerzo | Criterio de aceptación (EARS) |
|---|---|---|---|
| U18 | Contadores agregados de aperturas y acciones, reusando el patrón de `src/features/metricas/ping.ts` y `src/app/api/e/[evento]/route.ts` (lista cerrada de eventos, cuerpo vacío obligatorio). **Con denominador (P5b):** al abrir, se cuenta una apertura por cada botón que la tarjeta tiene visible | `Opus.M` | CUANDO alguien toque un botón de acción en `/c/<id>`, EL servidor DEBE sumar uno al contador de ese día, acción y canal, sin guardar identificador de tarjeta, de visitante, IP ni dispositivo. CUANDO se abra una tarjeta, EL servidor DEBE sumar una "apertura con el botón visible" por cada acción que esa tarjeta muestra. `/t` DEBE seguir sin emitir ningún evento, verificado por el test que ya existe en `ping.test.ts` |
| U19 | Vista de administración: tasa de clic por acción calculada sobre las aperturas donde ese botón estaba visible, y mezcla de canales. 🙋 El dueño declara los correos de administrador en una variable de entorno | `Sonnet.M` | SI quien entra no está en la lista de administradores, ENTONCES la vista DEBE responder como si no existiera. MIENTRAS un botón tenga menos de **1.000 aperturas con ese botón visible**, LA vista DEBE mostrar su tasa marcada como "sin datos suficientes para decidir" (umbral POR BOTÓN, fijado por el dueño en P5c; margen sobre las ~430 que pide detectar un cambio grande, cálculo al 95 % de confianza y 80 % de potencia). LA persona dueña de una tarjeta DEBE no ver ningún contador en ninguna pantalla |

## Ola 2.L · Revisión legal con equipo de agentes (P9), en paralelo desde el día 1

Composición pedida por el dueño: **orquestador `Opus.XH`**; **4 `Sonnet.M`** que investigan y debaten, cada uno
con un lente escrito distinto (Ley 1581, Decreto 1377 y criterios de la SIC; normativa internacional que
aplique donde se regale, como RGPD y LGPD; consumidor y responsabilidad civil; un atacante que busca huecos
en lo que promete v2); **2 `Haiku`** auditores con lente cerrado y contable, como pide la regla de doble
verificación: revisar cita por cita que el artículo exista y diga lo que se afirma, y descartar los falsos
positivos.

- **Entrada:** las 10 preguntas de §8, `src/features/legal/contenido.ts` y las respuestas P1 a P12. Ningún
  dato personal.
- **Salida:** respuesta a cada pregunta con su fuente, borrador de la frase propia de v2 (P8) y de su
  política, y la lista corta de lo que sí necesita firma de un abogado.
- **Límite, dicho de frente:** este equipo reduce y enfoca el trabajo del abogado; no lo reemplaza.
- **Costo estimado:** del orden de 1 a 1,6 millones de tokens. Es una estimación mía, se anuncia otra vez al
  despachar. Mecanismo: Workflow, porque el dueño pidió el equipo de agentes con sus palabras; 7 agentes,
  dentro de la guía de menos de 10.

| U | Qué | Modelo.Esfuerzo | Criterio de aceptación (EARS) |
|---|---|---|---|
| L1 | Correr el equipo legal | `Opus.XH` + 4 `Sonnet.M` + 2 `Haiku` | CADA respuesta DEBE citar su fuente, y CADA cita DEBE estar verificada por un auditor Haiku. SI la revisión no está cerrada, ENTONCES nadie distinto del dueño DEBE usar v2 |
| U10 | Frase propia de v2 y su política, con el texto que salga de L1 | `Opus.H` | EL producto en `v2` DEBE no afirmar en ninguna superficie que no guarda datos en un servidor. `main` DEBE conservar su frase intacta y `mensajes.test.ts:77` en verde |

## Gate final · ¿Se fusiona v2?

Con 2.A a 2.M terminadas y 2.L cerrada, el dueño decide entre fusionar `v2` en `main`, dejarla en standby o
descartarla. Ahí mismo se decide lo que era G-A: si v2 es una capa opcional sobre v1 o la reemplaza.

## Nota de traspaso para el despliegue del socio (P12, no es trabajo nuestro)

El socio decide el dominio al subir su fork al Vercel de producción; su propuesta es
`zelandia.io/microapps/personalcard`, un directorio para todas las microapps gratis. Lo que le sirve saber,
ya medido en §7: `basePath` es de compilación, así que hace falta un despliegue propio con esa variable;
`generar-enlace.tsx:60` arma el enlace sin el subdirectorio; `firma.tsx:19` estampa el dominio actual dentro
del JPEG; y `robots.ts`, `proxy.ts` y el script de cabeceras derivan rutas desde la raíz.

**Segundo punto para el socio (P5b):** las métricas que sirven para decidir mejoras de diseño se acumulan en
la base de producción de su despliegue, no en la rama `pruebas`, que solo tiene datos inventados. Para que el
dueño las vea, el socio lo agrega a la variable de administradores de su despliegue.

---

# Verificación

Piso que no se negocia. La línea base se vuelve a medir en el primer commit de la ola, con los comandos de
`package.json` (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm verify:headers`, `pnpm test:e2e`), y ese
número medido es el piso, no el que recuerde el PROGRESS.

1. `pnpm build` **antes** de los e2e, siempre: `playwright.config.ts:3-9` levanta `next start` contra el
   build, así que sin build nuevo la suite mide `.next` viejo. Ya costó 6 falsos rojos una vez.
2. La suite completa corre con la variable de conexión **ausente** y todo pasa. Es la prueba mecánica de
   que el modo sin servidor sigue intacto.
3. Un e2e nuevo que corre con la base apagada y verifica que `/t#`, el QR, el JPEG y el `.vcf` funcionan.
4. `e2e/enlace-y-fuga.spec.ts` se extiende con el caso nuevo: el servidor nunca recibe la clave del
   fragmento, verificado inspeccionando cuerpo, query y cabeceras de cada petición. Ese spec ya tiene el
   patrón montado (cuenta peticiones a dominios ajenos y verifica que el HTML del servidor no trae datos de
   la tarjeta), así que el caso nuevo se cuelga de lo que existe, no se inventa un andamiaje aparte. Se
   reusa también `e2e/fuga.helpers.ts:24` para no pescar falsos positivos del catálogo i18n.
5. Verificación por dos lentes ortogonales por unidad, como en la ola 1: `verificador-qa` en Sonnet, y un
   segundo pase en Haiku con lente cerrado sobre lo contable (conteo de cabeceras, existencia de la clave
   en las peticiones).
6. Nada se despliega a producción sin que el dueño lo autorice, igual que en las olas anteriores.
