> ⛔ **PROPUESTA SIN APROBAR (2026-09-15).** Este documento es el plan que salió de una sesión en plan
> mode con Opus.H. El dueño NO lo ha aprobado todavía: pidió continuarlo al día siguiente. **No se
> ejecuta ninguna unidad de aquí hasta que los gates G-A a G-F del bloque de decisiones estén
> respondidos.** Copia de trabajo original de la sesión:
> `C:\Users\OswyDesktop.0\.claude\plans\piped-stirring-horizon.md`.
> Cuando se apruebe, este archivo reemplaza a `PRP-TD-002-cuentas-y-foto-borrador.md`, que queda
> SUPERADO; mientras tanto conviven a propósito y el borrador sigue siendo el registro de la ola 1.

# Ola 2 de Tarjetica: cuentas, foto alojada y enlace corto cifrado

> **PARA RETOMAR (2026-09-15, sesión pausada).** El plan está completo y no necesita más investigación.
> Lo hecho: debate adversarial de una ronda (atacante Sonnet, lente escrito, solo lectura), precios de Neon
> y Vercel verificados ese día en las páginas oficiales, mapa del código con rutas `file:line`, lista de
> preguntas legales y esqueleto de olas con EARS.
> Lo que falta, y es lo único que bloquea: **responder los gates G-A a G-F del bloque de decisiones.**
> G-A y G-B son los bloqueantes; los otros cuatro se pueden responder mientras corre la asesoría legal.
> Pendiente de persistir fuera de este archivo (no se pudo por estar en modo plan): entrada en
> `plan/PROGRESS.md` de Tarjetica y guardado en Engram. Es lo primero al retomar.

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

# BLOQUE DE DECISIONES (esto sí necesita tu respuesta)

Seis gates. Los dos primeros son bloqueantes: sin ellos no arranca nada. Los otros cuatro se pueden
responder mientras corre la asesoría legal. Cada gate usa letras (G-A a G-F) y sus opciones usan números,
para que no se crucen.

## G-A (BLOQUEANTE) · Capa opcional o reemplazo

1. **Capa opcional. RECOMENDADA.** El modo sin servidor queda intacto y por defecto; la cuenta es un camino
   que la persona elige. *Consecuencia:* la meta original y D1 se conservan para el camino por defecto, los
   enlaces `/t#` repartidos siguen vivos, y el costo es sostener dos modos en el copy, en las pruebas y en
   el documento legal. El atacante avaló la dirección y advirtió que "opcional" no aísla el riesgo legal,
   solo lo diluye: el documento de privacidad es compartido.
2. **Reemplazo.** La cuenta pasa a ser el camino normal. *Consecuencia:* producto más simple de mantener y
   de explicar, pero mata la propuesta de valor que hoy lo diferencia, obliga a reescribir la meta original
   y deja a los enlaces repartidos como camino heredado sin dueño.

## G-B (BLOQUEANTE) · Alcance del primer corte

1. **Solo el enlace corto cifrado, sin cuentas todavía. RECOMENDADA.** Resuelve el riesgo que tu propio PRP
   declara como el riesgo propio del diseño ("el link no se puede revocar", `PRP-TD-001` §9), con la
   superficie de datos personales más pequeña posible: solo un blob cifrado y un identificador, sin correo
   y sin cuenta. *Consecuencia:* la revocación y la edición del enlace llegan ya; recuperar la tarjeta
   desde otro equipo y la foto alojada esperan al gate legal. Es también el corte que menos depende de la
   asesoría, porque sin correo la pregunta 1 de la lista legal es mucho más fácil de contestar.
2. **Enlace corto más cuentas, sin miniatura.** *Consecuencia:* llega la portabilidad, que es la capacidad
   de más valor para la persona, pero depende por completo de la respuesta legal y mete el correo en claro.
3. **Todo el alcance de una, miniatura incluida.** *Consecuencia:* es lo que el atacante declaró
   indefendible. La miniatura obliga a que el servidor tenga la foto y el nombre legibles, que es justo lo
   que el cifrado estaba evitando, y a cambio solo da una vista previa más bonita.

## G-C · Qué pasa con la frase "No guardamos tus datos en ningún servidor"

1. **Se mantiene literal para el modo por defecto y el modo con servidor tiene su propio documento y su
   propio aviso. RECOMENDADA.** *Consecuencia:* `mensajes.test.ts:77` sigue verde sin tocar nada, la
   promesa de hoy no se rompe para quien nunca cree una cuenta, y el costo es escribir y mantener un
   segundo documento legal.
2. **Se reformula a una frase que cubra los dos modos** (del estilo "tus datos no salen de tu navegador, a
   menos que tú actives el enlace corto"). *Consecuencia:* un solo documento y un solo mensaje, pero se
   pierde la frase corta que hoy funciona como diferenciador, y hay que cambiarla en seis sitios y en el
   test que la fija.
3. **Se quita la frase.** *Consecuencia:* la opción honesta si al final gana el reemplazo, y la que más
   valor de marca destruye.

## G-D · Tarjetas de terceros cuando hay cuenta

1. **Una tarjeta creada bajo el radio "es de otra persona" nunca sube a la base; se queda en el modo sin
   servidor. RECOMENDADA.** *Consecuencia:* la colisión desaparece de raíz y el gate de titularidad que ya
   existe se reusa tal cual, sin inventar nada. Cuesta que el caso del stand de evento no reciba las
   ventajas de la ola 2.
2. **Sí sube, con un canal de supresión por correo para el titular.** *Consecuencia:* más capacidad, pero
   crea el pasivo exacto que el atacante describe y obliga a operar un canal de habeas data de verdad.

## G-E · Vía del monitoreo de cuota

1. **GitHub Actions en el repo origen, cada 6 horas. RECOMENDADA.** *Consecuencia:* gratis, trae el canal de
   aviso incluido (el workflow que falla te manda correo), y no depende de ninguno de los dos despliegues.
   Se apaga sola tras 60 días sin actividad en el repo y hay que volver a encenderla con un clic.
2. **Vercel Cron diario en un solo despliegue, activado por variable de entorno.** *Consecuencia:* vive con
   el código y no se apaga por inactividad, pero en Hobby corre una vez al día con ±59 minutos de
   imprecisión y **no tiene canal de aviso**: toca sumar un proveedor de correo, que es un servicio más que
   mantener.
3. **Las dos.** *Consecuencia:* cubre las fallas de cada una, y es exactamente el tipo de cosa que la regla
   de simplicidad manda recortar mientras no haya un incidente que lo justifique.

## G-F · Cuándo se evalúa `zelandia.io/tarjetica`

1. **Spike aparte, después del primer corte. RECOMENDADA.** *Consecuencia:* produce números y una
   recomendación sin frenar la ola, y evita mezclar un cambio de dominio con un cambio de arquitectura de
   datos, que es la receta para no saber cuál de los dos rompió qué.
2. **Dentro de la misma ola.** *Consecuencia:* un solo periodo de inestabilidad en vez de dos, a cambio de
   un blast radius mucho mayor y de decidir el dominio del enlace corto antes de tener medido cuánto pesa.

---

# ESQUELETO DE OLAS (se despacha cuando G-A y G-B estén cerrados)

Modelo y esfuerzo por unidad. Criterios de aceptación en notación EARS. Una unidad, un commit, verificación
antes de integrar. Las olas 2C en adelante están **congeladas hasta que vuelva la asesoría legal**.

**Dónde vive el código nuevo.** Feature nueva y autocontenida en `src/features/enlace-corto/`, con su
cripto, su cliente de base, su API y sus tipos adentro. `src/app/c/[id]/page.tsx` y los route handlers bajo
`src/app/api/` son cáscaras delgadas que re-exportan, igual que ya lo son `src/app/t/page.tsx:18` y
`src/app/editor/page.tsx:17`. Lo que sí se toca de lo existente: `src/features/tarjeta/enlace/generar-enlace.tsx`
(para ofrecer el enlace corto junto al largo) y `src/shared/seguridad/headers.ts` solo si hiciera falta, que
según §3.b no hace falta. **`codec.ts` no se toca**: el diccionario está congelado y el enlace largo no
cambia.

## Ola 2.0 · Higiene, no depende de ningún gate

| U | Qué | Modelo.Esfuerzo | Criterio de aceptación (EARS) |
|---|---|---|---|
| U0 | Quitar el nombre del tercero de `plan/DECISIONES.md:616`, reescribiendo hacia adelante, y dejar nota de que el historial ya lo contiene | `Sonnet.L` | EL repositorio DEBE no contener nombres de terceros en ningún archivo vigente, verificado con una búsqueda que corre en CI |

## Ola 2.A · Cimientos, sin un solo dato personal en la base

| U | Qué | Modelo.Esfuerzo | Criterio de aceptación (EARS) |
|---|---|---|---|
| U1 | Medir el consumo real: crear el proyecto Neon con las dos ramas, dejar el cómputo en 0,25 CU, y medir cuánto cuesta un despertar de verdad contra la cifra calculada en §2 | `Sonnet.M` | EL equipo DEBE registrar en PROGRESS el consumo medido de un despertar y contrastarlo con la estimación de 0,021 CU-horas |
| U2 | Esquema y migraciones versionadas que viajan con el código desde el repo origen. Tabla de enlaces cifrados: identificador, blob, vector de inicialización, fecha de creación, fecha de último acceso. Sin correo, sin cuenta | `Opus.H` | EL esquema DEBE poder aplicarse desde cero sobre una rama nueva con un solo comando, y la rama `pruebas` DEBE quedar idéntica a `main` tras aplicarlo |
| U3 | Cliente de base con tiempo de espera corto y apagado por variable de entorno, más la invariante de arranque | `Opus.H` | SI la variable de conexión no existe o la base no responde en el tiempo de espera, ENTONCES la app DEBE arrancar igual y el editor DEBE abrir desde `localStorage` sin error visible |
| U4 | Monitoreo de cuota por la vía que elijas en G-E | `Sonnet.M` | CUANDO el consumo mensual cruce el 80 % o el 100 % de las 100 CU-horas, EL monitoreo DEBE notificar al dueño dentro de las 6 horas siguientes. CUANDO `current_state` sea `idle` por más de lo esperado o la base no responda, EL monitoreo DEBE notificar. EL monitoreo DEBE no imprimir cifras de consumo en un log público |
| U5 | Servir las fotos alojadas por nuestro propio origen para no tocar la CSP (§3.b) | `Opus.H` | LA CSP de `src/shared/seguridad/headers.ts` DEBE conservar `default-src 'self'` e `img-src 'self' data: blob:` sin agregar ningún origen remoto, verificado por `scripts/verificar-headers.mjs`, que ya falla si aparece uno |

## Ola 2.B · Enlace corto cifrado `/c/<id>#<clave>`

| U | Qué | Modelo.Esfuerzo | Criterio de aceptación (EARS) |
|---|---|---|---|
| U6 | Cifrado en el cliente con WebCrypto. La clave se genera en el navegador, va en el fragmento y nunca se envía | `Opus.H` | EL payload que sale del navegador hacia el servidor DEBE ser indescifrable sin la clave del fragmento, probado con un test que intenta leerlo con lo que el servidor guarda. EL servidor DEBE no recibir la clave en ninguna petición, probado con un test que inspecciona cuerpo, query y cabeceras |
| U7 | API de crear, leer, revocar y editar | `Opus.H` | CUANDO alguien revoque un enlace, EL servidor DEBE dejar de resolver ese identificador de forma permanente. CUANDO alguien edite su tarjeta, EL enlace repartido DEBE mostrar la versión nueva sin cambiar de dirección |
| U8 | Receptor `/c/<id>` y degradación digna | `Sonnet.M` | SI la base está suspendida o no responde, ENTONCES `/c/<id>` DEBE mostrar una explicación de qué pasó y qué hacer, nunca un error sin texto. MIENTRAS la base esté caída, `/t#<payload>`, el QR, el JPEG y el `.vcf` DEBEN seguir funcionando, probado con un e2e que corre con la base apagada |
| U9 | Al crear un enlace corto se entrega también el largo, en el mismo momento | `Sonnet.M` | CUANDO se genere un enlace corto, LA interfaz DEBE mostrar además el enlace largo equivalente y explicar que es el respaldo si el corto deja de resolver |
| U10 | Copy y documento legal del modo con servidor, según G-C | `Opus.H` | EL producto DEBE no afirmar en ninguna superficie que no guarda datos en un servidor cuando la persona está usando el modo que sí los guarda |

## Ola 2.C · Cuentas, foto y logo alojados · CONGELADA hasta la asesoría legal

Cuentas, login, eliminar cuenta, foto y logo cifrados en almacenamiento remoto. Todo `Opus.H` salvo el copy.
No se diseña aquí por instrucción tuya. Depende de las preguntas 1, 2, 3, 6 y 8 de §8.

## Ola 2.D · Miniatura al compartir · CONGELADA, y sujeta a G-B

Solo existe si G-B elige la opción 3. Reabre la prohibición de `next/og` y obliga a que el servidor tenga la
foto y el nombre legibles. Si entra, entra con la persona eligiendo explícitamente entre miniatura con su
foto (pública para quien tenga la URL) o miniatura genérica.

## Ola 2.E · Spike de `zelandia.io/tarjetica` · según G-F

| U | Qué | Modelo.Esfuerzo | Criterio de aceptación (EARS) |
|---|---|---|---|
| U11 | Probar `basePath` por variable de entorno en una rama, medir el largo del enlace corto en los dos dominios y dejar una recomendación | `Sonnet.M` | EL spike DEBE entregar el largo exacto en caracteres del enlace corto bajo cada dominio candidato y una recomendación con su consecuencia. EL despliegue actual DEBE seguir sirviendo `/t#` sin cambios |

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
