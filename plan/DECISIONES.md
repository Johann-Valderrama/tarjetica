# DECISIONES: tarjeta-digital

> Append-only. Una línea por decisión: esencia (<=40 palabras) más puntero al detalle. No se reescribe,
> se agrega. Si una decisión queda superada, se marca SUPERADA y la nueva va debajo.

- 2026-09-02 **D1: los datos viven SOLO en el navegador.** Cero servidor, cero base de datos. Es la
  mitigación central, no una limitación tolerada: sin base de datos no hay información personal de
  terceros que proteger. Detalle: `PRP-TD-001-tarjeta-digital-regalo.md` §4 y §12 : Johann.

- 2026-09-02 **D2: la tarjeta lleva contacto MÁS una capa de venta opcional** (titular de una línea,
  hasta 3 cifras con etiqueta, pregunta de cierre). Sin ella es una agenda; con ella, una propuesta.
  Detalle: `PRP-TD-001-tarjeta-digital-regalo.md` §5 : Johann.

- 2026-09-02 **D3: el código nace en un repo PÚBLICO nuevo desde el día 1.** El PRP, la bitácora y
  estas decisiones vivieron primero en un repositorio privado. Detalle:
  `PRP-TD-001-tarjeta-digital-regalo.md` §12 : Johann.

- 2026-09-02 **D4: licencia MIT.** El titular del copyright queda BLOQUEADO en el gate G1; el motivo
  está en el registro interno del proyecto. Detalle: `PRP-TD-001-tarjeta-digital-regalo.md` §3 G1
  y §12 : Johann.

- 2026-09-02 **D5: el link compartible es opcional y APAGADO por defecto; las salidas principales son
  el QR de vCard y el `.jpeg`.** Corrección del propio Johann a mitad de la planeación: el link es la
  única salida que crea una URL irrevocable con datos personales. Detalle:
  `PRP-TD-001-tarjeta-digital-regalo.md` §9 : Johann.

- 2026-09-03 **El `LICENSE` MIT entra en el PRIMER commit del repo público (Ola 1), no en la Ola 7.**
  Un repo público sin archivo de licencia es "todos los derechos reservados" por defecto, o sea
  contradice D4 mientras tanto. Cambio del agente sobre el plan aprobado, declarado. Detalle:
  `PRP-TD-001-tarjeta-digital-regalo.md` unidad 1b : Opus.

- 2026-09-03 **`next/og` y `@vercel/og` quedan PROHIBIDOS en este proyecto**, aunque exista el
  precedente `Personal landing page\src\app\opengraph-image.tsx:1`: renderizan en el servidor y
  romperían D1 en silencio. Detalle: `PRP-TD-001-tarjeta-digital-regalo.md` §2 y §8 : Opus.

- 2026-09-03 **Los candados de seguridad (CSP `default-src 'self'`, `Referrer-Policy`, `noindex`) NO
  dependen del gate G6: se construyen en la Ola 1 y corren exista o no el link.** Protegen el
  `localStorage`, que existe siempre. Corrección de un defecto estructural que el propio PRP traía.
  Detalle: `PRP-TD-001-tarjeta-digital-regalo.md` §15 objeción B3 : Opus + debate adversarial.

- 2026-09-03 **El escaneo del QR de pantalla a pantalla necesita gate FÍSICO (unidad 4e), no basta el
  assert que decodifica el archivo generado.** Decodificar el propio buffer no prueba que una cámara de
  gama baja lo lea de una pantalla con brillo bajo. Detalle:
  `PRP-TD-001-tarjeta-digital-regalo.md` §15 objeción A2 : Opus + debate adversarial.

- 2026-09-03 **El borrador de aviso "tus datos no salen de tu dispositivo" queda TUMBADO como
  afirmación**: las dos salidas principales existen para que los datos salgan del dispositivo. La
  redacción recomendada pasa a ser "no guardamos tus datos en ningún servidor", pero el texto final lo
  decide el operador en G2. Detalle: `PRP-TD-001-tarjeta-digital-regalo.md` §15 objeción B8 : debate.

- 2026-09-03 **Gate G7 nuevo (¿se construye para red caída?)**, surgido del debate: una conferencia es
  el peor escenario de red y el PRP no lo contemplaba. Recomendación: no construir PWA en v1 y declarar
  el límite. Es decisión del operador, no del agente. Detalle:
  `PRP-TD-001-tarjeta-digital-regalo.md` §3 G7 : Opus + debate adversarial.

- 2026-09-03 **FASE 0 CERRADA, los 7 gates.** G1 copyright = `Johann Valderrama` persona natural.
  G2 aviso = frase exacta "No guardamos tus datos en ningún servidor". G3 = producto y repo
  **`tarjetica`** en la cuenta personal de GitHub de Johann. G4 firma = sí, dentro del elemento
  capturable. G5 foto = sí, menos en el link. G6 link = sí (ya venía por D5). G7 red caída = no PWA en
  v1, límite declarado en el copy. Detalle: `PRP-TD-001-tarjeta-digital-regalo.md` §3 : Johann.

- 2026-09-03 **La firma de marca NO entra al vCard del QR**, ni como `URL` ni en `NOTE`: ese vCard
  aterriza en la agenda de un TERCERO que nunca usó la herramienta, esos dos campos son del usuario, y
  cada byte ahí es densidad del QR. Va dentro del elemento capturable, que cubre pantalla y `.jpeg` con
  una sola pieza. Detalle: `PRP-TD-001-tarjeta-digital-regalo.md` §3 G4 : Opus, propuesto por Johann.

- 2026-09-03 **La foto se guarda reducida a ~320 px y ~10 KB, sin EXIF, ANTES de tocar
  `localStorage`.** Una foto de celular sin reducir revienta la cuota (~5 MB, y base64 la infla 33%) y
  el guardado falla en SILENCIO. Criterio heredado de `Personal landing page\src\shared\config\card.ts:23-24`.
  Detalle: `PRP-TD-001-tarjeta-digital-regalo.md` unidad 2e : Opus.

- 2026-09-03 **UN solo QR, a ancho completo de pantalla, y el QR carga TODOS los campos de texto que
  el usuario escribio** (menos foto y firma). Medido: dos QR repartiendose el ancho dejan 2,39 px por
  cuadrito, bajo el piso de ~2,5; uno solo a 340 px sube el perfil tipico a 4,66. Detalle:
  `PRP-TD-001-tarjeta-digital-regalo.md` seccion 6 : Johann.

- 2026-09-03 **`margin: 4` en el QR, NO se hereda el `margin: 1` de la landing.** La zona silenciosa
  obligatoria son 4 modulos y es la que el decodificador usa para ENCONTRAR el simbolo (fuente
  primaria: DENSO WAVE). Cuesta 8% de tamano de cuadrito y se paga igual. Detalle: seccion 2 : Opus.

- 2026-09-03 **La correccion de errores se queda en `M` y NO es una palanca.** Bajar a `L` da cuadritos
  14% mas grandes pero pierde una tolerancia del mismo orden; los dos efectos se cancelan (medido en
  un estudio de 12.800 configuraciones). CORRIGE un consejo previo del agente de bajar a `L`.
  Detalle: seccion 2 y seccion 8 : Opus, tras investigacion.

- 2026-09-03 **rMQR (ISO/IEC 23941) y PDF417 DESCARTADOS** como alternativa rectangular. rMQR carga
  maximo 150 bytes (el perfil minimo de esta tarjeta ya son 142 caracteres) y las camaras nativas no
  lo leen. PDF417 lo leen escaneres dedicados y el gesto de guardar contacto esta atado a QR+vCard.
  Detalle: seccion 11 : Opus, tras investigacion con carril gratis.

- 2026-09-04 **Las URLs de la tarjeta se restringen a `http:` y `https:`, no basta `z.string().url()`.**
  Medido al escribir la unidad 1c: Zod 4 acepta `javascript:alert(1)` como URL valida, y esos campos
  se pintan como `href` en una tarjeta que un TERCERO abre en su telefono via el link de la Ola 6.
  Detalle: `UrlNavegable` en `src/features/tarjeta/modelo/tarjeta.ts` del repo `tarjetica` : Opus.

- 2026-09-04 **Se separa `TarjetaBorrador` (lo que se guarda al teclear) de `Tarjeta` (contrato de
  SALIDA).** El autosave de la unidad 2c guarda en cada tecla, cuando la tarjeta ni siquiera tiene
  nombre; exigirle el contrato completo ahi haria que no guardara nada. `Tarjeta` se exige al
  exportar (.jpeg, vCard, link), via `esExportable()`. Detalle: seccion 4 del PRP : Opus.

- 2026-09-04 **La CSP se emite desde `src/proxy.ts` con un nonce por peticion, no como cabecera
  estatica en `next.config.ts`.** Una CSP estatica obligaria a `'unsafe-inline'` en `script-src` para
  que Next hidratara, que es justo lo que el candado existe para cerrar. Nota: Next 16 declaro
  obsoleta la convencion `middleware.ts` a favor de `proxy.ts` : Opus.

- 2026-09-04 **Tarjetica se despliega en el Vercel PERSONAL de Johann, no en el equipo ZelandiaIO.**
  Coherente con G3 (el repo ya vive en su cuenta personal de GitHub) y con que el producto todavia no
  esta atribuido a una persona juridica. Es explicitamente un "por ahora": si Zelandia lo adopta, se mueve.
  El scope es el mismo donde ya vive el proyecto `johannvalderrama` : Johann.

- 2026-09-04 **La foto se comprime bajando calidad Y TAMBIEN el lado (320 -> 224 -> 160 -> 112).**
  El techo de 20 KB es la restriccion dura, porque de el depende que el guardado no falle en
  silencio; el lado es la palanca. Medido con ruido puro, el peor caso para JPEG: a 320 px ni con
  calidad 0,28 baja de 34.327 bytes. Una foto real cabe de sobra a 320 : Opus.

- 2026-09-04 **El editor siembra su estado en el PRIMER render (`useSyncExternalStore`), no en un
  efecto.** Hidratar en un efecto abre una ventana en la que el primer autosave puede pisar con un
  borrador vacio lo que el usuario ya tenia guardado, y ademas dispara `react-hooks/set-state-in-
  effect` de React 19. De regalo, avisa entre pestanas, que es el caso del equipo compartido : Opus.

- 2026-09-04 **El E2E corre contra el BUILD DE PRODUCCION, en Chromium movil (Pixel 7), y sin
  dobles de `localStorage` ni del canvas.** En desarrollo la CSP es distinta (lleva `unsafe-eval`) y
  el prerender tambien, asi que probar contra `next dev` verificaria una app que nadie usa; y
  sustituir justo la capa que puede fallar no verifica nada : Opus.

- 2026-09-04 **Direccion estetica CERRADA (unidad 3a), encargada por Johann en una linea:** la
  ESTRUCTURA y la TIPOGRAFIA de `johannvalderrama.com/tarjeta?modo=qr` (Fraunces + Plus Jakarta
  Sans), con la PALETA de `johann-valderrama.zelandia.io` (fondo `#0A0A0B`, tinta `#F5F5F7`,
  atenuado `#A1A5AC`, acento naranja `#FF9101`). Las dos paginas se abrieron en vivo y se les
  extrajo el sistema del DOM; los seis pares de contraste se midieron y todos pasan AAA.
  Detalle: `docs/direccion-estetica.md` en el repo `tarjetica` : Johann + Opus.

- 2026-09-04 **La v1 es SOLO oscura.** La marca de Johann tiene las dos caras (su tarjeta es clara,
  el sitio de Zelandia es oscuro) y sostener las dos duplica la ola sin que nadie lo haya pedido.
  Los tokens ya viven en variables CSS, asi que un modo claro seria cambiar un bloque de valores,
  no reescribir componentes : Opus.

- 2026-09-04 **Las fuentes van AUTO-HOSPEDADAS con `next/font`, nunca por CDN.** No es
  rendimiento: la CSP arranca en `default-src 'self'`, asi que un `<link>` a Google Fonts quedaria
  bloqueado y el texto saldria con la fuente de respaldo **sin ningun error visible** : Opus.

- 2026-09-04 **La firma de marca sale SIN dominio hasta que exista uno.** Escribir una direccion
  inventada pondria un enlace muerto en la tarjeta de cada usuario. Se llena en la Ola 7, con el
  despliegue : Opus.

- 2026-09-04 **La tarjeta pasa a UNA SOLA VISTA, sin selector de modos.** Johann la pidio "igual"
  a su tarjeta de `johann-valderrama.zelandia.io`, señalando la pagina: foto, nombre, cargo y
  empresa, titular, parrafo, y el QR abajo. Se elimina el toggle `card`/`qr` que construyo la Ola 3
  (D1b) : Johann.

- 2026-09-04 **El QR va ABAJO, pero con TOPE DURO de caracteres en el texto de arriba**, para que
  nunca baje del pliegue. Medido en un telefono de 375x667: tras la cabecera, el QR a ancho completo
  y la firma quedan **185 px para todo el texto, unas 9 lineas**. Sin tope, dos bloques largos
  empujan el QR fuera de pantalla justo en el gesto central del producto : Johann (D1b).

- 2026-09-04 **Fuera el bloque de cifras (KPIs), y fuera tambien del editor.** Se debatio con tres
  lentes ortogonales la alternativa de generalizarlo a "prueba social" y los tres la rechazaron: de
  18 casillas posibles en 6 perfiles reales solo 6-7 se llenarian con algo util, un campo vacio "se
  lee como que a uno le faltó algo" y presiona a inventar, quien RECIBE la tarjeta ignora las cifras
  ajenas, y "prueba social" resulto un cajon de sastre (años de experiencia es dato biografico,
  cliente es prueba social, certificacion es credencial) forzado a un molde de 12 caracteres. El
  bloque costaba 6 de las 9 lineas disponibles : Johann (D2b), tras debate.

- 2026-09-04 **En pantalla solo van nombre, cargo, empresa, los dos bloques de texto y un telefono.**
  Redes, direccion, enlaces y demas telefonos NO se muestran: **viajan dentro del vCard que el QR
  guarda en la agenda**. Literal de Johann: *"Toda la demas informacion viaja en el qr para que quede
  guardado en la agenda del contacto"*. Separa lo que se VE de lo que se GUARDA, y le devuelve
  espacio al QR : Johann (D3a).

- 2026-09-04 **La tipografia de display pasa de Fraunces (serif) a la sans pesada de la referencia.**
  CORRIGE la unidad 3a: se habia elegido Fraunces leyendo "el estilo de la tarjeta clara", pero al
  señalar la pagina de Zelandia y decir "la quiero asi", la referencia es su sans de peso alto, no un
  serif editorial : Johann.

- 2026-09-04 **REQUISITO PRINCIPAL Y NO NEGOCIABLE: la tarjeta cabe en UNA SOLA VISUAL, sin
  scroll, con cualquier contenido y en cualquier telefono.** Literal de Johann. Se garantiza por
  CONSTRUCCION y no por calibracion: la tarjeta ocupa `100dvh` y el bloque del QR absorbe la
  holgura, siendo un cuadrado del alto que sobre. Si el texto crece, el QR se encoge. Se usa `dvh`
  y no `vh` porque en un telefono real la barra del navegador se come ~90 px que `vh` ignora : Johann.

- 2026-09-04 **V-1 (recortar el vCard del QR) queda DESCARTADA: ya no hace falta.** Al absorber la
  holgura, el QR paso de 267 px fijos a 319-356 segun el telefono (296 en el peor caso de texto), y
  con eso el vCard COMPLETO sube a 2,59 px por cuadrito en el telefono mas chico, sobre el piso de
  2,5. Toda la informacion viaja dentro del QR, como Johann pidio, sin recortar nada. Medido con la
  libreria real en `scripts/medir-densidad-qr.mjs` : Opus, tras medir.

- 2026-09-05 **La descarga del `.vcf` y el aviso de densidad viven en el EDITOR, no en la vista de
  la tarjeta.** La vista de la tarjeta no admite ningun control: es lo que la Ola 5 captura como
  imagen, y un boton adentro saldria en el `.jpeg` que el usuario regala. Ademas el aviso de
  densidad habilita una decision (recortar un campo) que solo se puede tomar editando : Opus.

- 2026-09-05 **El vCard se pliega contando OCTETOS, no caracteres.** Se aparta a proposito del
  `fold()` de la landing de referencia, que corta por `String.length`: en español una tilde pesa dos
  octetos, asi que ese corte se pasa del limite de la norma justo en el caso comun del producto, no
  en el raro : Opus, tras medir.

- 2026-09-05 **Los enlaces libres viajan al vCard SIN su etiqueta.** Conservarla en vCard 3.0 obliga
  al agrupamiento `itemN.X-ABLabel`, que es de Apple, no lo entienden todos los clientes de
  contactos, y cuesta unos 25 octetos por enlace. Se paga la etiqueta y se conserva el enlace, que
  es el dato que sirve, porque la densidad del QR es el riesgo numero uno del producto : Opus.

- 2026-09-05 **La teja del QR se dimensiona con `flex-1`, nunca con `h-full`.** Con `h-full` la teja
  valia el alto ENTERO de su seccion y el telefono y la firma quedaban impresos uno encima del otro
  al pie. CONSECUENCIA MEDIDA que hay que conocer antes de tocar este layout: arreglarlo le quito
  altura al codigo y en un iPhone SE con la tarjeta llena cayo a 2,29 px por cuadrito, bajo el piso
  de 2,5; se reclamaron 24 px de relleno y margenes y quedo en **2,55, sobre el piso pero sin
  sobra** : Opus, tras medir.

- 2026-09-05 **El `.jpeg` NO se captura de la pantalla de la tarjeta: sale de un lienzo montado
  FUERA DE PANTALLA con ancho fijo de 390 px y alto segun contenido.** Tres razones medidas: la
  pantalla mide `100dvh`, asi que en un monitor la imagen saldria larguisima; la puerta de
  exportacion vive en el editor y exportar desde alla evita duplicarla; y deja la vista de la
  tarjeta sin un solo control. El alto va segun CONTENIDO y no fijo porque con alto de telefono la
  imagen salia con 160 px de vacio arriba y abajo del codigo: una pantalla tiene alto que respetar,
  una imagen no : Opus, tras medir.

- 2026-09-05 **La vista de la tarjeta NO lleva ningun control, ni siquiera fuera del capturable.**
  Se construyo una barra flotante para guardar la imagen y se QUITO tras verla: tapaba el telefono y
  la firma. Ponerla en el flujo tampoco cabia, le quitaria unos 60 px al QR, que en un iPhone SE ya
  va en 2,55 px por cuadrito. Esa pantalla existe para extenderle el telefono a otra persona : Opus.

- 2026-09-05 **La confirmacion de "esta tarjeta es mia" se PERSISTE en el dispositivo.** Es la puerta
  de DOS salidas (el `.vcf` y el `.jpeg`) y dejarla en el estado de un componente la perderia al
  cambiar de pantalla, abriendo la puerta sola. Es una afirmacion sobre la tarjeta, no un acto de
  sesion, y el boton de borrar se la lleva con todo lo demas : Opus.

- 2026-09-05 **La teja del QR se dimensiona con `min(100cqw, 100cqh)`, no con `aspect-square`.** Es
  la unica forma de decir "el lado que quepa por los dos ejes": `aspect-square` con `max-w-full`
  recorta el ancho y NO recalcula el alto, y por eso en un Pixel 7 la teja quedaba de 356x533, con
  177 px de blanco sobrante. Ahora es cuadrada en las dos pantallas : Opus, tras medir.

- 2026-09-05 **La libreria de render a imagen es `modern-screenshot` y no `html-to-image`.** Las dos
  son MIT y hacen lo mismo; se eligio por MANTENIMIENTO y por manejo de fuentes, que es donde esta
  el riesgo: `html-to-image` no publica desde febrero de 2025, `modern-screenshot` publico en abril
  de 2026 y no arrastra dependencias. El fallo que importa (texto invisible por webfonts sin
  embeber) es MUDO : Opus.

- 2026-09-05 **El enlace se genera desde el EDITOR, nace APAGADO y la advertencia va ANTES.** Su
  efecto va hacia afuera y no se puede revocar, asi que se ofrece visible (invisible = no existe)
  pero el default se queda en no, y el aviso aparece antes de que el link exista. Un aviso posterior
  no es advertencia, es una nota : Opus.

- 2026-09-05 **Los enlaces libres del vCard y el link comparten la misma frontera: el payload va en
  el FRAGMENTO, jamas en el query string.** El fragmento no se envia al servidor, y esa es la razon
  entera por la que este producto no crea una base de datos con datos personales de terceros ni
  convierte a quien lo opera en Responsable del tratamiento. Queda con assert y probado por
  mutacion: moverlo a `?` hace fallar la suite : Opus.

- 2026-09-05 **Los fixtures del repo PUBLICO dejan de llevar el contacto real de Johann.** No era una
  fuga (ese numero ya esta publicado en su landing), pero un repo MIT que cualquiera forkea no es el
  sitio del contacto real de una persona. El perfil pasa a ficticio y se renombra `johann` ->
  `completo`, que es lo que de verdad es. Se conservan las menciones de AUTORIA y las referencias a
  sus paginas publicas en la direccion estetica: eso es procedencia, no dato de contacto. Re-medido
  tras el cambio: las cifras de densidad no se movieron : Opus.
- 2026-09-07 **Los idiomas van SIN prefijo en la URL** (`next-intl` en su montaje sin enrutamiento).
  Las cuatro rutas son contrato ya escrito (cabeceras, `robots.txt`, y los enlaces de la Ola 6 ya
  repartidos, que no se pueden corregir). El idioma sale de la cookie del usuario y, si no la hay,
  del `Accept-Language`, que es el caso de `/t`. Detalle: `src/i18n/locales.ts` : Opus.

- 2026-09-07 **Las claves de traduccion se tipan contra `messages/es-CO.json`** (`src/global.d.ts`).
  Sin eso, un `t('editor.titlo')` con typo compila, pasa el lint y en pantalla sale la clave cruda.
  La otra mitad (que `en.json` vaya al dia) la mide `src/i18n/mensajes.test.ts` : Opus.

- 2026-09-07 **Toda analitica de TERCEROS queda descartada, y la metrica es un ping al PROPIO
  origen, sin cuerpo, con el evento en la RUTA.** Es el `Si falla: DESCARTAR` de la unidad 7c
  ejecutado: cualquier script de otro dominio pondria en rojo el assert de cero dominios ajenos de
  7e, que corre tambien sobre la home y el editor. NO contradice D1: el ping no lleva ni un campo
  de la tarjeta ni un identificador. El candado de "nunca en la ruta de la tarjeta" vive en el
  CODIGO (`RUTAS_PROHIBIDAS`), no en donde quedaron montados los componentes : Opus.

- 2026-09-07 **`card_created` cuenta DISPOSITIVOS que llegaron a tener una tarjeta, no tarjetas.**
  La marca vive en `localStorage`, asi que quien edite la suya diez veces cuenta una. Contarlo de
  otro modo exigiria identificar a la persona, que es lo que el producto promete no hacer. El
  limite se declara en vez de disimularse : Opus.

- 2026-09-07 **El E2E fija `locale: 'es-CO'`, y el ingles tiene su propia suite.** El runner de
  Playwright manda `Accept-Language: en-US`: en cuanto la app aprendio a negociar el idioma, la
  suite entera empezo a medir la version en ingles con sus asserts escritos en español (12 pruebas
  en rojo, ninguna por un defecto del producto). Detalle: `playwright.config.ts` y
  `e2e/idiomas.spec.ts` : Opus, tras medir.

- 2026-09-07 **Un objetivo tactil se mide por lo que el DEDO alcanza, no por la caja del elemento.**
  Un control envuelto en su `<label>` recibe el toque en toda la etiqueta. Lo encontro el propio
  assert de 7e la primera vez que corrio: la casilla de "esta tarjeta es mia" mide 20x20 px y su
  etiqueta 44. Medir la caja del `<input>` habria reportado un defecto que el usuario no tiene, y
  "arreglarlo" agrandando la casilla habria empeorado el editor por un numero mal leido : Opus.

- 2026-09-07 **Ningun valor de un perfil de prueba puede coincidir con una cadena de la interfaz.**
  Desde que la app tiene idiomas, el HTML servido lleva el catalogo de mensajes, asi que un dato de
  prueba copiado de un `placeholder` aparece ahi sin que se filtre nada y pone en rojo el assert de
  fuga, diciendo justo lo contrario de lo que pasa. Ocurrio DOS veces (el titular y el telefono).
  Queda un guard que lo nombra: `e2e/fuga.helpers.ts` : Opus, tras medir.

- 2026-09-07 **La paleta del EDITOR sigue siendo la clara de las Olas 1-2, sobre el fondo oscuro que
  fijo la Ola 3.** Sus titulos (`text-neutral-900`) quedan casi invisibles. Se vio en una captura a
  375 px; ninguna medicion lo delata. En esta ola se arreglo SOLO lo escrito aqui (la home nueva, el
  bloque de limites y el selector de idioma); repintar el editor entero es trabajo aparte y una
  decision de Johann, porque toca la direccion estetica que el cerro : Opus, reportado sin ejecutar.

- 2026-09-08 **El editor se repinta con los tokens (opcion A), y la medicion del contraste deja de
  ser un script suelto.** Vive en `src/app/contraste.test.ts`, corre en la suite y **lee los valores
  de `globals.css` en vez de traer una copia**: un test con su propia copia de la paleta pasa en
  verde mientras la app se rompe : Johann eligio, Opus ejecuto.

- 2026-09-08 **El modificador de opacidad de Tailwind (`/40`, `/70`) NO se puede usar sobre estos
  tokens.** Son `var(--x)` con un hexadecimal adentro, asi que Tailwind genera una declaracion
  invalida, el navegador la descarta y gana la clase de al lado; el CSS ni siquiera se genera.
  Cuando haga falta un tono, se agrega un TOKEN (asi nacio `--tinta-tenue`). Hay un guard sobre todo
  `src` : Opus, tras medir con `getComputedStyle`.

- 2026-09-08 **Un guard con LISTA de archivos es un guard con una puerta abierta.** El primero solo
  miraba las pantallas enumeradas y por eso no vio el `/70` de `vista/firma.tsx`, escrito dos olas
  antes y dentro del elemento que se captura como `.jpeg`. El de opacidad pasa a correr sobre todo
  `src`, sin lista : Opus, tras la revision.

- 2026-09-08 **El fondo de los campos, su texto de ejemplo y el color de las casillas se fijan con
  tokens.** Los pintaba el NAVEGADOR: con `color-scheme: dark`, Chrome daba 4,41:1 en el texto de
  ejemplo del formulario principal, bajo el minimo de AA, y el valor cambiaba entre navegadores.
  Ojo con la especificidad: un `::placeholder` pelado PIERDE contra el `input::placeholder` del
  preflight de Tailwind : Opus, tras medir.

- 2026-09-08 **`--borde-fuerte` sube de 0,18 a 0,36.** Es el borde que dice DONDE esta un control y
  cae bajo WCAG 1.4.11 (3:1); a 0,18 daba 1,64:1 y los campos del editor casi no tenian borde. No
  afecta la vista de la tarjeta, que usa `--borde`, que se queda bajo por ser decorativo : Opus.

- 2026-09-08 **El contraste del estado DESHABILITADO se declara como rango (3:1 a 4,5:1), no se
  sube.** WCAG exime a los controles deshabilitados, y darles el contraste de uno activo borra la
  distincion justo donde importa: el editor tiene tres botones que nacen apagados. Lo que no se
  acepta es que quede sin numero : Opus, tras el hallazgo del validador E2E.

- 2026-09-08 **Un test que mide los VALORES de la paleta no ve si el CSS se APLICA.** Los dos fallos
  mudos de esta tanda vivian en ese hueco. Lo cubre un assert de E2E que le pregunta al navegador de
  que color quedo cada cosa; el test de tokens se queda con lo suyo : Opus.

- 2026-09-08 **El aviso de la pantalla de enlace lleva su FASE en un atributo.** El de carga y el de
  error salian por el mismo `data-testid`, asi que una prueba podia leer el de carga creyendo que
  leia el de error: el assert media `texto.length > 20` y "Abriendo la tarjeta..." mide exactamente
  20. Fallaba por un caracter, y con un umbral mas bajo habria pasado midiendo el estado equivocado
  : Opus, hallazgo del panel de revision.

- 2026-09-08 **La imagen se DESCARGA en el computador y va por la hoja del sistema en el telefono**,
  decidido por el PUNTERO (`pointer: coarse`) y no por el user agent. `navigator.canShare({files})`
  dice que si en Chrome de escritorio, asi que la hoja ganaba siempre y no dejaba elegir carpeta. La
  razon original (en iOS Safari `<a download>` no guarda en Fotos) sigue viva donde importa
  : Johann reporto, Opus midio.

- 2026-09-08 **El fondo de los campos, su texto de ejemplo, el autorrelleno de Chrome y el color de
  las casillas se fijan con tokens.** Son CUATRO superficies que pintaba el NAVEGADOR y que ninguna
  medicion de tokens delataba, porque el problema no era el valor sino que nadie lo usaba. Aparecieron
  una por una, siempre porque alguien abrio la app y miro. Gotcha: `background-color` NO funciona en
  `:-webkit-autofill` (Chrome lo ignora), la unica via es una sombra interior : Opus, tras medir.

- 2026-09-08 **La foto fuera del enlace NO es un defecto: es G5, y la sostiene el compilador**
  (`Tarjeta` es `strictObject` sin campo de foto). Medido para que se pueda revisar con numeros: con
  la foto adentro el enlace pasaria de 235 a unos 18.000 caracteres, inservible por WhatsApp y con el
  QR imposible. Lo que SI era defecto es que solo se decia en la ayuda del campo de foto: ahora es la
  cuarta advertencia, ANTES de generar el enlace : Johann reporto, Opus midio.

- 2026-09-08 **Sin foto no se pinta el hueco de la foto.** SUPERA la unidad 3c, que ponia un
  monograma de iniciales argumentando que se lee como decision de diseño: en un enlace compartido
  (que nunca lleva foto) Johann lo describio como que "se ve como si faltara algo". El efecto no era
  estetico: el avatar mide 68 px y el QR absorbe la holgura, asi que subio de 3,77 a 3,94 px por
  cuadrito en el peor caso del PRP : Johann.

- 2026-09-08 **PENDIENTE DE DECISION: si la pantalla de 320 px entra al contrato.** Ahi el QR queda
  en 2,39 px por cuadrito, bajo el piso de 2,5, incluso despues de quitar el avatar. Esta FUERA del
  caso que el PRP declara (375x667), asi que se dejo medido y escrito en el codigo en vez de
  arreglado : Opus, reportado sin ejecutar.

- 2026-09-08 **El boton que lleva a la tarjeta se llama "Ver mi tarjeta", no "Mostrar codigo QR" ni
  "Previsualizacion".** Lleva a la tarjeta ENTERA, asi que el nombre viejo subvendia. Y no es una
  previsualizacion: esa pantalla es el gesto central del producto, el momento de extenderle el
  telefono a otra persona; llamarla ensayo la rebaja. Nombrar el GESTO sirve para los dos momentos
  : Johann propuso el problema, Opus la redaccion.

- 2026-09-08 **Los botones de salida usan `aria-disabled`, no `disabled`.** Un `disabled` de verdad
  no recibe clics ni hover, asi que no admite ni tooltip ni "llevame a lo que falta"; y en TACTIL no
  existe el hover, o sea que un tooltip clasico no aparece nunca en el caso principal. PRECIO
  declarado: la puerta de la unidad 2d la imponia el NAVEGADOR y ahora la impone nuestro codigo, asi
  que hay un E2E que pulsa los cuatro botones bloqueados y comprueba que no pasa nada. De regalo,
  el boton deja de salirse del recorrido del teclado : Johann pidio, Opus eligio la via.

- 2026-09-08 **El resalte de "esto es lo que falta" es un borde ROJO que parpadea 3 veces y se queda
  ENCENDIDO** hasta que la persona marca la casilla, no hasta que se acaba un temporizador: apagarlo
  por tiempo lo apagaria mientras alguien todavia lo busca. Nace `--peligro-fuerte` (#ff5644) porque
  `--peligro` esta calibrado para TEXTO y como borde se leia salmon : Johann.


- 2026-09-08 **El "no lo veo parpadear" de Johann NO era un defecto: su Windows tiene los efectos de
  animacion apagados**, asi que su Chrome pide menos movimiento y el CSS le da, a proposito, el borde
  fijo. Medido por dos vias independientes (`SPI_GETCLIENTAREAANIMATION` = 0, y Chrome real
  respondiendo `prefers-reduced-motion: reduce`), no preguntado : Opus midio.

- 2026-09-08 **El resalte gana RELLENO, y sin movimiento el color hace el trabajo del parpadeo.**
  Nace `--peligro-relleno` (0,18) porque `--peligro-superficie` (0,10) es el hover del boton de
  borrar y subirla cambiaria ese boton. Con `reduce`, relleno 0,30 y anillo 5 px: se compensa lo que
  se pierde en vez de animar. Texto en 11,97:1, sobre AAA : Johann pidio, Opus midio.

- 2026-09-08 **La suite media la configuracion de WINDOWS de quien la corria.** Playwright no emula
  `prefers-reduced-motion` por defecto: la hereda del sistema, asi que en esta maquina tres pruebas
  se ponian en rojo sin que el producto tuviera nada. Se fija en `contextOptions` del config
  : Opus, tras medir.

- 2026-09-08 **`reducedMotion` NO es opcion de `use` en Playwright 1.62.1: va en `contextOptions`, y
  un `test.use({ reducedMotion })` se IGNORA EN SILENCIO** (medido: el mismo test imprimio `false`
  con `test.use` y `true` con contexto propio). Suelto en `use` ademas rompe el typecheck. El caso
  sin movimiento abre su propio contexto, igual que el ingles : Opus, tras medir.

- 2026-09-08 **El parpadeo se mide por el ALFA fotograma a fotograma, no por lo que el CSS dice.**
  Probado con una mutacion que anula el apagon dejando `animationName` y las 3 vueltas intactas: las
  dos pruebas viejas siguieron en verde y solo la nueva se puso roja. Y el relleno tiene su propio
  assert de que NO parpadea : Opus.

- 2026-09-08 **Un `next start` viejo en el 3210 hace que la suite entera mida un build rancio.** El
  config trae `reuseExistingServer`, asi que Playwright reusa lo que encuentre: habia un servidor de
  las 13:21 sirviendo un CSS distinto al del disco. Antes de creerle a un E2E, comparar el hash del
  CSS servido con el construido : Opus, tras perseguir tres fallos inexistentes.

- 2026-09-08 **En el build, un token escrito `rgba(255, 86, 68, 0.18)` se guarda como `#ff56442e`.**
  Un test que le lea el alfa al TEXTO del token devuelve null contra produccion, que es contra lo que
  corre esta suite. El alfa se le pregunta al navegador pintando una sonda : Opus, tras medir.

- 2026-09-09 **Con menos movimiento pedido el borde LATE, no se queda quieto. SUPERA la decision
  del 2026-09-08** de dejarlo fijo. Johann lo probo y pidio "un parpadeo basico, que se haga notar",
  y la norma le da la razon: `prefers-reduced-motion` existe por el movimiento ESPACIAL, que es el
  que marea; cambiar el alfa de una sombra no mueve nada de sitio : Johann pidio, Opus midio.

- 2026-09-09 **Lo que separa el latido de un destello son tres numeros, no el buen gusto:** 0,9 s por
  ciclo (1,1 por segundo, un tercio del limite de WCAG 2.3.1), 2 ciclos en vez de 3, y sobre todo el
  anillo NO se apaga, baja a 0,45 y vuelve. El E2E lo exige con un minimo entre 0,35 y 0,6, asi que
  devolverle el destello completo a quien pidio lo contrario se pone rojo : Opus.

- 2026-09-09 **El punto bajo del latido da 2,06:1 y se DECLARA como rango en vez de subirse.** WCAG
  1.4.11 mide el estado en REPOSO de lo que identifica un control, y aqui el reposo es el anillo
  pleno, que si pasa. Llevarlo a 3:1 exigiria alfa 0,65 y ahi el latido deja de verse, o sea se
  cumpliria el numero rompiendo lo que se pidio : Opus, tras medir.

- 2026-09-09 **La profundidad del latido queda en 0,45 y 2 ciclos, confirmado por Johann viendolo
  correr**, no solo por la medicion. Se le ofrecieron bajar a 0,30 o sumar un tercer ciclo y eligio
  dejarlo : Johann.

- 2026-09-10 **La bitacora se muda a ESTE repo y se vuelve publica.** SUPERA a D3, que la dejaba en
  un repositorio privado. El proyecto es opensource: quien lo clone deberia poder leer por que esta
  construido asi, no solo como. De 1.769 lineas, el 97% era tecnico y entro tal cual : Johann.

- 2026-09-10 **Lo privado se SEPARO por contenido, no por carpeta.** Un puñado de fragmentos (las
  razones de negocio detras de dos decisiones, e infraestructura interna de un repositorio ajeno)
  salio a un registro interno del autor; en su lugar quedan frases neutras que conservan la decision
  sin el motivo. Nada se borro : Opus, con el criterio de Johann.

- 2026-09-10 **Dos de las tres muestras NO eran publicables, y ninguna medicion de texto lo dice.**
  Llevaban un nombre real, un cargo, un telefono y un QR con el vCard completo, todo dentro de la
  IMAGEN. Se vio abriendolas. La tercera si entro: su perfil es un fixture que ya vive en
  `e2e/perfiles.datos.ts` : Opus, tras mirar.

(Registrado en Engram: observacion 1243, proyecto `ops`.)
