# PROGRESS · PRP-TD-001 Tarjeta de presentación digital   (código: `C:\OPS\_VelOS\proyectos\tarjetica\`, publicado en https://github.com/Johann-Valderrama/tarjetica)

> Bitácora de ejecución. Fuente de verdad durable: un agente nuevo retoma en frío leyendo este archivo
> más el PRP. Lo que deba sobrevivir a la sesión va aquí, no al chat.
>
> **META ORIGINAL (escrita al nacer, NUNCA se reescribe):** que cualquier persona pueda crear y regalar
> su propia tarjeta de presentación digital, sin cuenta y sin servidor, para reemplazar el papel.

## Objetivo / contexto

- PRP que gobierna este trabajo: `C:\OPS\_VelOS\proyectos\tarjetica\plan\PRP-TD-001-tarjeta-digital-regalo.md` (leer PRIMERO).
- Referencia a replicar: `C:\OPS\_VelOS\proyectos\Personal landing page` (tarjeta de Johann en producción).
- El código vive en su propio repositorio público: vive en el repo `tarjetica` (D3), en `C:\OPS\_VelOS\proyectos\tarjetica\`, ya publicado (el gate 🙋 del remoto se cerró el 2026-09-04).

## Estado

### Enlace más corto + botón Compartir · rama `feat/compartir-enlace` · 2026-09-15

- Pedido: el enlace compartible salía muy largo. Un enlace corto de verdad exige servidor; se decidió
  (opción C) no usar acortadores de terceros y dejar el corto cifrado para la ola 2 (DECISIONES).
- U0 medido: con diccionario el enlace baja 17% a 27% (típica 294 → 240 caracteres, llena 556 → 459).
  En los fixtures de `codec.test.ts`: v1 532 → v2 448 (16%), con assert de al menos 15%.
- U2: formato v2 con diccionario CONGELADO en `codec.ts`; v0 y v1 se siguen leyendo.
- U1: botón Compartir (`navigator.share`) en `generar-enlace.tsx`, solo donde existe la hoja.
- Verificado: typecheck 0, lint 0, 250 unitarios, 164/164 e2e contra build nuevo. Ojo: el e2e corre
  sobre `.next`; sin `pnpm build` previo mide código viejo (dio 6 falsos rojos esta sesión).
- El dueño vio los dos enlaces lado a lado y decidió mantener el diccionario (opción A).
- Push y PR #2 a `main` (https://github.com/Johann-Valderrama/tarjetica/pull/2), SIN desplegar.
  Pendiente del dueño: probar la hoja de compartir en un teléfono real y autorizar merge/despliegue.

### Ola 1 · CERRADA, integrada y en producción · 2026-09-15 08:40

- H2: ayudas genéricas (variante 1). H3: tras revisar capturas, el dueño quitó la regla "nunca blanco
  puro" y eligió tema claro blanco, oro y negro (botón con degradado dorado); botones Agendar y
  Cuéntame ENCENDIDOS con aviso de que quedan fijos en el enlace. H4: PR #1 mergeado a `main` por
  fast-forward (`11896d2`), producción en https://tarjetica-app.vercel.app verificada (editor con los
  campos nuevos, 25/25 cabeceras en el dominio).
- `main` había avanzado (`05b8d1c`, aviso de privacidad y gate de titularidad); se fusionó en la rama
  y se adaptaron los e2e al radio "propia". Dos defectos que venían de ese commit se corrigieron de
  paso porque bloqueaban el merge: el enlace del pie a `/privacidad` medía 15 px (piso táctil 44) y
  `receptor.spec` comparaba el almacén incluyendo la bandera del ping anónimo (carrera).
- Suite final sobre `main`: typecheck 0, lint 0, 246 unitarios, 25/25 cabeceras, 162/162 e2e.
- Worktrees `tarjetica-ola-1-u2` y `-u3` borrados con sus ramas (ya fusionadas). El worktree
  `tarjetica-ola-1` (rama `feat/mejora-ola-1`, igual a `main`) sigue existiendo; se puede borrar.
- Capturas de la sesión (no versionadas): `capturas/ola-1-evaluacion/`, `ola-1-antes-despues/`
  (las `-v3` son el estado final), `ola-1-h2/`, `ola-1-h3-paletas/` (opciones descartadas).

## PARA JOHANN (gates abiertos)

- **PR #2 (enlace más corto + botón Compartir), bloquea el merge:** abrir la vista previa del PR en tu
  celular, generar un enlace y tocar Compartir; la hoja nativa solo se probó simulada.
  A. Funciona: merge a `main` y despliegue (recomendada si la hoja abre bien).
  B. Falla o no aparece: me pasas qué viste y se corrige en la misma rama.

- **Pruebas físicas** (siguen pendientes de antes): escanear el QR de pantalla a pantalla, guardar el
  JPEG y el .vcf en iPhone y Android, y abrir un enlace desde Instagram y LinkedIn. Ahora también:
  tocar "Guardar contacto" en el receptor desde un iPhone (hoja nativa) y ver que el tema claro no
  encandile en la mano.
- **Ola 2** (`plan/PRP-TD-002-cuentas-y-foto-borrador.md`): antes de construir, decidir "capa opcional
  o reemplazo" y hacer la asesoría legal de la sección 3. Se planea en plan mode con Opus.H.

## Next action

🤖 Tras el OK del dueño en PR #2: merge a `main` (Sonnet.M), `pnpm build` y e2e completos antes de
desplegar (el e2e mide `.next`; sin build nuevo da falsos rojos). Siguiente trabajo sustantivo: planear
la ola 2 (Opus.H, plan mode, debate adversarial sobre D1), que ya incluye el enlace corto cifrado
`/c/<id>#<clave>` y evaluar Neon frente a Supabase.


### Aviso de Privacidad y titularidad de terceros · 2026-09-15

- Pedido de Johann: revisar si faltaba disclaimer legal sobre el enlace compartible, con la ley
  más dura posible como referencia. Hallazgo: el disclaimer de UX ya existía y era más preciso de
  lo asumido (el link nunca "sube" nada, viaja en el fragmento de la URL); lo que faltaba era un
  documento formal (Política de Tratamiento, exigida por Ley 1581/2012 de Colombia, la jurisdicción
  real del operador, no solo por analogía con RGPD).
- Debate con tres agentes Sonnet en lentes ortogonales (protección de datos Colombia, privacidad
  internacional/RGPD-LGPD-CCPA, consumidor/responsabilidad civil), cada uno leyendo el documento y
  el código sin ver el análisis de los otros dos. Hallazgos aplicados: plazos de respuesta
  corregidos (10 días hábiles consultas, no 15), transferencia internacional (Vercel) declarada,
  cláusula "tal cual" separada entre código MIT y garantías mínimas de consumidor, traslado de
  responsabilidad del caso "stand de evento" matizado, RGPD sustentado con los factores reales del
  Art. 3(2) en vez de una afirmación sin base.
- Hallazgo más importante de los tres revisores: la casilla única "es mía o tengo permiso" quedaba
  literalmente falsa en el caso de tarjeta de un tercero. Se separó en dos radios mutuamente
  excluyentes (`Titularidad = 'propia' | 'tercero'`), con el mismo gate en exportar imagen, `.vcf` y
  generar enlace. `localStorage` pasó de guardar un booleano a `'propia' | 'tercero' | null`.
- Publicado en `/privacidad`: fuente única en `src/features/legal/contenido.ts` (constante TS, no
  archivo `.md` leído con `fs` fuera de `src/`, para evitar el riesgo de que el tracing de archivos
  de Vercel lo excluya del bundle serverless sin avisar en build). Render con un parser Markdown
  propio y minimal (`src/features/legal/markdown-simple.tsx`), sin sumar una dependencia para un
  solo documento estático. Solo en español, a propósito: la ley aplicable es la colombiana y una
  traducción no oficial de un texto legal es más riesgo que no traducirlo; el aviso en inglés manda
  al correo de contacto. Enlazado desde el pie de la home y desde la advertencia de "generar
  enlace" en el editor.
- Validación: `tsc --noEmit` limpio, 173/173 unitarios, build de producción real (no solo dev),
  142/142 E2E (se actualizaron 9 specs que dependían de la casilla vieja: selectores de
  `input[name="confirmacion-propia"]` → `input[name="titularidad"]`, `getByRole('checkbox')` →
  `getByRole('radio', { name: /propia/ })`, y el `localStorage` de prueba de `d: true` → `d: 'propia'`).
  Verificación visual en navegador real: la página `/privacidad` renderiza correcto (headers, listas,
  código inline), el link desde el editor y desde la home funcionan.
- Se eliminó `legal/aviso-privacidad.md` (borrador suelto en la raíz del repo): el contenido vive
  ahora solo en `src/features/legal/contenido.ts`, para no tener dos copias que se desincronicen.
### Ola 1 · REPORTE FINAL (modo autónomo nocturno) · 2026-09-15 01:xx

Rama `feat/mejora-ola-1`, 14 commits locales sobre `f8a23ca`, **sin push** (H4). Director Fable; Opus
ejecutó U2, Sonnet U3; verificación por verificador-qa Sonnet (3 pasadas) y Haiku (1).

**Estado por unidad**

| Unidad | Estado | Commit |
|---|---|---|
| U1 evaluación de referencias | hecha, `capturas/ola-1-evaluacion/` | `1beea82` (docs) |
| U2 contrato de datos (`ag`, `cn`, `tm`, `cm`) | hecha, PASS Sonnet + Haiku | `692984e`, merge `1531062` |
| U3 color de marca desde el logo + selector de tema | hecha, PASS Sonnet (tras corregir `fetch` de `data:` bloqueado por CSP) | `8bf8948`, merge `a63ab91`, fix en `bb59de7` |
| U4 tema claro premium con tokens | hecha, PASS Sonnet (tras agregar el par borde/superficie) | `c8bcdb5`, `d13e39f` |
| U5 receptor (Agendar, Cuéntame, canales, guardar nativo) | hecha, PASS Sonnet tras corregir `noopener` en canales `http://` | `bfcf9aa`, fix en `bb59de7` |
| U6 editor con ayudas | hecha (variante genérica) | `bb59de7` |
| U7 abrir en pestaña nueva | hecha | `db26172` |
| U8 borrador PRP-TD-002 | hecho | `03e3bf3` |
| Cobertura extra pedida por el re-verificador | hecha | último commit |

**Pruebas, antes y después**

| Comprobación | `main` (antes) | rama (después) |
|---|---|---|
| typecheck / lint | 0 / 0 | 0 / 0 |
| unitarios | 173 (12 archivos) | 246 (14 archivos) |
| verify:headers | 25/25 | 25/25 |
| e2e | 142/142 | 162/162 (suite completa tras U6; los tests de cobertura del último commit no tocan runtime) |

**Criterios de aceptación**: campo opcional vacío se omite sin huecos (e2e canales exactos + receptor
mínimo, capturas); enlaces v0/v1 abren idéntico (codec.test + receptor sin `tm`); fragmento sin foto ni
logo y sin fuga (`enlace-y-fuga` 8/8); color sugerido ≥ 4,5:1 y editable (`color-de-marca.spec`);
fondo claro luminancia 0,883 < 0,93 y sin canal en 255 (`contraste.test`); abrir en pestaña nueva y
copiar (`enlace-y-fuga`); QR del JPEG decodifica en los cinco perfiles con logo en ambos temas
(`logo.spec` 10/10); 25/25 cabeceras; textos nuevos en es-CO y en (`mensajes.test`).

**Capturas (todas ignoradas por git)**
- `capturas/ola-1-evaluacion/` (U1, 28 PNG + tabla + `resumen-dom.json`)
- `capturas/ola-1-antes-despues/` (H3): tarjeta, receptor, receptor mínimo y QR en oscuro ANTES
  (producción) y DESPUÉS (oscuro y claro); JPEG DESPUÉS en los dos temas. El JPEG ANTES no se pudo
  exportar en headless contra producción (el botón no llegó a estar listo en 60 s); el JPEG oscuro
  DESPUÉS es visualmente el mismo diseño con el punto de ubicación en el color de marca.
- `capturas/ola-1-h2/` (H2): `variante-1-generica.png` (lo commiteado), `variante-2-con-ejemplos.png`
  y `README.md` con la verificación de servicios y el tradeoff.
- `capturas/ola-1-u4-verificacion/`, `capturas/ola-1-u5-verificacion/`: verificación visual del director.

**Lo que no se hizo y por qué**
- Sol (Codex) no revisó: runtime OPS (ver entrada anterior). Mitigado con dos lentes Claude por unidad.
- Google Forms no entra en la variante 2 de H2: su página oficial no afirma "gratis" para cuentas
  personales; Typeform lo afirma solo en preguntas frecuentes.
- Mejoras 4 (Open Graph estático) y 5 (compartir desde el receptor): aplazadas por decisión H1.

**Pendiente del dueño (H2, H3, H4)**: ver el bloque de decisiones del reporte en el chat y en
`DECISIONES.md` 2026-09-15.

### Ola 1 de mejoras · línea base, U1, U2, U4, U5, U7 y U8 · 2026-09-14 y 15

- Director Fable en el worktree `tarjetica-ola-1`, rama `feat/mejora-ola-1` desde `f8a23ca`. Plan
  aprobado por el dueño; modo autónomo nocturno: se ejecuta todo lo que no dependa de un gate humano,
  H2/H3/H4 quedan documentados para la mañana, sin push ni deploy.
- Línea base en `main` antes de tocar nada: typecheck 0, lint 0, 173/173 unitarios (12 archivos),
  build ok, 25/25 cabeceras, 142/142 E2E (2,5 min). Nada falla en `main`.
- U1 hecha: siete páginas a 375 px y 1280 px, resumen del DOM y tabla por criterio en
  `capturas/ola-1-evaluacion/` (ignorada por git). Las cifras de la tarjeta de referencia no se quedan
  en 0 en ninguna de cinco configuraciones (headless con y sin movimiento reducido, y el navegador de
  la máquina del dueño): arrancan en 0 y llegan al valor final en menos de un segundo. No entran a
  Tarjetica (decisión previa reafirmada por el dueño).
- H1 cerrado (DECISIONES 2026-09-14): entran tres mejoras adicionales dentro del receptor; Claude
  dirige y Sol revisa en lectura.
- U2 (Opus high, worktree propio, commit `692984e`, merge `1531062`): claves `ag`, `cn`, `tm`, `cm`
  en `Tarjeta` y `BorradorGuardable`; `UrlSoloHttps`; helpers `urlAgenda`/`urlCuentame`. Verificado
  por verificador-qa Sonnet (PASS, con casos propios ejecutados) y Haiku (PASS: 19 y 19 claves,
  ninguna en el vCard, traducciones en ambos idiomas).
- U4 (director, `c8bcdb5` + `d13e39f`): `[data-tema='claro']` en globals.css (marfil `#f7f1e4`,
  luminancia 0,883; umbral medido < 0,93), token `--color-marca` (declarado en los DOS bloques:
  `var()` se resuelve donde se declara), JPEG lee `--fondo` computado, `contraste.test.ts` mide ambos
  temas, `perfiles.spec` y `logo.spec` corren en ambos temas. Capturas: `capturas/ola-1-u4-verificacion/`.
- U7 (`db26172`): "Abrir en pestaña nueva" como `<a target=_blank rel=noopener noreferrer>`; e2e con
  evento `page` y copiar al portapapeles.
- U5 (`bfcf9aa`): receptor con Agendar y Cuéntame opcionales, canales solo llenos (WhatsApp con
  mensaje prellenado, Llamar, Correo, web y redes) con SVG en el código, guardar por hoja nativa
  reutilizando `exportar/guardar.ts`, fila flexible sin huecos. Capturas: `capturas/ola-1-u5-verificacion/`.
- U8 (`03e3bf3`): `plan/PRP-TD-002-cuentas-y-foto-borrador.md` (BORRADOR).
- Pruebas tras U5: typecheck 0, lint 0, 218/218 unitarios, e2e receptor + enlace 26/26; suite
  completa e2e tras U7: 153/153 y cabeceras 25/25.
- **Sol (Codex) no pudo revisar U2 por el runtime OPS (E-ENTORNO, dos intentos):** primero
  `OPS_SCOPE_VIOLATION` (el worktree está fuera de `C:\OPS`; se apuntó al repo dentro de OPS), luego
  `spawn ENAMETOOLONG` (las fuentes viajan en la línea de comando y Windows la corta) y, con solo el
  diff, `OPS_TIMEOUT` ("Reading additional input from stdin": el CLI de Codex esperó stdin). Es un
  defecto del runtime para proyectos fuera de OPS y fuentes largas, no de esta ola. Se sigue con
  Sonnet y Haiku, como preveía el plan.
- Siguiente acción: U3 (Sonnet high, worktree propio) en curso; luego U6 (editor), H2 con dos
  variantes, H3 capturas antes/después, reporte final.

### Logo más grande en la tarjeta · 2026-09-13

- Petición del dueño: evaluar subir un poco el tamaño del logo en la tarjeta imagen. Evaluado con
  tres alturas (36, 48, 56) sobre el build de producción, con foto y dos logos reales (cuadrado y 4:3).
- Aprobada opción A: 48 px de alto, ancho automático con tope de 112 (`h-12 w-auto max-w-28`), en
  pantalla y JPEG. Un logo cuadrado pasa de 108 a 144 px en el JPEG (+33%).
- Hallazgo: ensanchar la caja junto con la altura truncaba la ciudad a 375 px aunque el logo no usara
  ese ancho; con ancho según proporción la ciudad queda intacta. Un logotipo muy ancho (4:1) sigue
  limitado por los 112 de ancho y no crece: eso sería otro diseño (mover el logo de fila).
- Costo medido: el QR en pantalla a 375x667 pasa de 270 a 258 px solo cuando hay logo; sin scroll.
- Validación: lint del archivo, build de producción, `e2e/logo.spec.ts` 7/7 (cinco perfiles con foto y
  logo caben y el QR se decodifica). Comparativas en `capturas/logo-tamano/` (carpeta ignorada por git).

### Cierre de sesión · 2026-09-13

- Implementación integrada por fast-forward en `main` hasta `0b9b384`, subida a GitHub.
- Producción verificada: Vercel `dpl_6AQpuB9snZheB4rf8Eccgx7xTm7E`, estado Ready y
  check de GitHub exitoso. Dominio: https://tarjetica-app.vercel.app.
- En el dominio público: perfil recibido, acciones, apertura del QR y retorno de foco con
  Escape comprobados en navegador; 25/25 comprobaciones de cabeceras pasan.
- Este cierre modifica únicamente la bitácora y se sube a `main`. No requiere repetir
  pruebas de código; la evidencia de implementación se conserva en la sección siguiente.
- Sesión cerrada. Próximo paso del dueño: pruebas físicas de escaneo, guardado de imagen
  e importación de contacto en iOS/Android y navegadores integrados de Instagram/LinkedIn.
  No queda implementación pendiente del plan aprobado.

### Perfil recibido y pendientes de la ronda GoFest · 2026-09-13

- Dueño autorizó ejecutar el plan, con subagentes para lógica y director para interfaz.
- Director: perfil recibido con acción principal «Guardar contacto», texto que explica la
  descarga, WhatsApp válido, web/redes/enlaces y QR en diálogo con Escape y retorno de foco.
  Reutiliza ubicación, identidad y discurso de la tarjeta. Titular del editor orientado a
  explicar qué solucionas y para quién; ayuda de WhatsApp con prefijo internacional.
- Terra: compatibilidad del codec v0/v1 mediante fflate local y límites de lectura.
  Luna: helpers puros de destinos seguros y pruebas. Trabajo en worktrees independientes.
- Se completa la firma con el dominio público. Tarjeta local y JPEG siguen sin controles.
- Validación: 173 unitarios, build/TypeScript, lint y 25 comprobaciones de cabeceras pasan.
  Suite completa: 142 E2E, 138 pasan en primera ronda; se corrigieron el retorno de foco del
  diálogo y un detector de traducciones que confundía el dominio con una clave. Las dos suites
  afectadas se repitieron: 18/18 pasan. QR en pantalla/JPEG y cinco perfiles con logo siguen legibles.
- Revisión visual directa del director a 375 px y escritorio: jerarquía, botones, enlaces y
  diálogo. Revisión independiente Terra del diff: sin P1/P2 en codec, carrera de fragmentos,
  seguridad de destinos o separación del almacenamiento. Evidencia en e2e/receptor.spec.ts.
- Cierre completado: integrado en main, push y producción verificada; ver registro de cierre superior.
- Pendientes físicos del dueño: escaneo en condiciones de evento, guardar JPEG e importar
  contacto en iOS/Android reales, también desde Instagram y LinkedIn. Las pruebas emuladas
  no sustituyen esa comprobación.

### Logo de empresa opcional · 2026-09-13

- Petición del dueño: segunda imagen opcional para el logo, independiente del retrato.
- Implementado por director: carga/cambio/borrado con avisos ES/EN, PNG/JPG/WebP hasta 10 MB;
  reducción a PNG local de hasta 100 KB, sin recorte ni deformación y con transparencia.
- Contrato: clave `tarjetica.logo` separada del dato serializado. Aparece arriba a la derecha
  en tarjeta local, vista previa y JPEG; queda fuera del QR, enlace y VCF. El borrado total
  elimina logo y foto. Una carga fallida conserva el anterior; operaciones canceladas no escriben.
- Validación: 157 unitarios, build/TypeScript, lint y 25 cabeceras pasan. De 133 E2E,
  131 pasaron inicialmente; dos aserciones necesitaron ajuste por el nuevo texto del aviso y
  el anunciador de rutas de Next. Las suites afectadas se repitieron: 18/18 pasan.
- Evidencia específica: proporciones y alfa preservados, persistencia, presencia de píxeles
  del logo en JPEG, manejo de error y borrado independiente. Cinco perfiles con foto+logo a
  375x667 caben sin scroll y el QR se decodifica con lector independiente. Revisión visual
  de captura del perfil completo con logo sintético de prueba.
- Publicación por GitHub/Vercel desde `main`; no se agregan imágenes del usuario a servidores.

### Invitación a servicios de Zelandia · 2026-09-13

- Petición del dueño: zona promocional con enlace a `https://wellnessjobs.zelandia.io/brief-general`.
- Añadida al final de la portada, antes del footer, con texto ES/EN y CTA «Hacer el diagnóstico».
  Destino revisado: diagnóstico de procesos con IA. Enlace normal, sin formulario ni precarga
  de datos del visitante; no aparece en tarjetas ni exportaciones.
- Build/TypeScript y lint verificados; revisión móvil de legibilidad y destino del enlace.
  Se publica mediante la integración GitHub/Vercel existente.

### Nombre del ejemplo corregido · 2026-09-13

- Por petición del dueño, Luna high cambió el perfil ficticio a Alexa Rivera y el correo a
  `alexa@example.com`; los tres paneles, QR y texto alternativo derivan del mismo dato.
- Director revisó el diff: sólo muestra y aserciones del ejemplo. Build/TypeScript y prueba E2E
  de portada pasan. Se integra en `main` para publicar por la integración existente de Vercel.

### Cierre de verificación pública y sincronización · 2026-09-13

- `main` ya contiene `fd67156` (`fix: usar Alexa Rivera en el perfil de ejemplo`) y coincide con
  `origin/main`; el merge queda satisfecho sin crear uno redundante.
- GitHub reporta el check de Vercel exitoso. `vercel inspect https://tarjetica-app.vercel.app
  --wait --timeout 60s` confirmó producción `dpl_DLWjssXpYCiHo5wkHh3rJ72RE8sW` en estado
  `Ready`, con alias `https://tarjetica-app.vercel.app`.
- La comprobación HTTP directa respondió 200 y encontró `Alexa Rivera` y
  `alexa@example.com`; `Alex Rivera` y `alex@example.com` están ausentes. Este cierre de bitácora
  se registra en `main` y se sube a `origin/main`; no modifica el código de la aplicación.

### Cierre de sesión y publicación · 2026-09-13

- Dueño autorizó explícitamente cierre, push, merge y despliegue a Vercel.
- Rama `codex/mejoras-experiencia` subida; integrada en `main` mediante fast-forward hasta
  `0bf4d4b`, preservando los cinco commits de implementación y documentación. `main` subido a GitHub.
- Vercel desplegó automáticamente desde GitHub: producción `dpl_4bdvcHuMLJ3JorE75gW7tPYXd2DV`
  en estado Ready, alias `https://tarjetica-app.vercel.app` y `https://tarjetica-ochre.vercel.app`.
- Verificación directa en el dominio público: portada nueva, retrato IA, tarjetas con/sin foto
  y vista de contacto presentes. Se mantienen las verificaciones locales descritas abajo.
- Corregido enlace local obsoleto de Vercel: proyecto actual `tarjetica-app` del equipo
  `johann09-4767s-projects`. El primer intento CLI falló por el enlace antiguo; la integración
  GitHub completó la publicación correctamente. No se publicaron archivos de entorno.
- Sesión cerrada en ese checkpoint. El fallback se resolvió el 2026-09-13; siguen pendientes las pruebas
  físicas con celulares ya registradas. Las notas «sin publicación» inferiores son históricas.

### Portada con tres ejemplos · 2026-09-13

- Petición del dueño: retrato profesional generado con IA, tarjeta con y sin foto, y tercer
  panel que explique el contacto recibido. Frontend y generación atendidos por el director.
- Implementado: tres paneles adaptables con el mismo perfil ficticio: con foto, sin foto y
  contacto desde el QR (nombre completo, cargo, empresa, teléfonos, correo, web, portafolio,
  dirección y notas). Usan un único objeto de datos; no acceden al almacenamiento del visitante.
- Retrato generado con `image_gen`, optimizado a WebP de 15 KB y servido localmente.
  Origen y prompt en `docs/retrato-ejemplo.md`; activo en `public/ejemplos/profesional-ia.webp`.
- La interfaz identifica el retrato IA y aclara que la agenda es ilustrativa, que su disposición
  depende de la app receptora y que la foto no viaja en el QR. Traducciones ES/EN completas.
- Verificación: build con TypeScript y lint pasan; revisión visual directa a 1280x900 y 375x812.
  33 pruebas E2E de experiencia, idiomas y superficie verificadas: 32 pasan en la primera
  ejecución y la restante pasa al corregir su selector de foto, que también contaba el QR.
- Vista local en `http://localhost:3210`; sin publicación.

### Mejora integral implementada localmente · 2026-09-13

- Dueño e integrador: Codex director; frontend atendido directamente por petición del usuario.
- Alcance: portada con ejemplo, editor adaptable con vista previa y acceso rápido a compartir,
  correcciones reproducibles de lógica y documentación. Sin ambigüedades bloqueantes.
- Contrato: datos locales, rutas estables, consentimiento al compartir, foto fuera de QR/enlace
  y tarjeta completa en una sola pantalla. Sin publicación en esta ronda.
- Agentes: Sol high auditó lógica y corrigió dos fallos en worktree aislado; Terra high revisó
  contratos/documentación sin escribir. Director integra y atiende frontend. Base limpia con
  151 unitarios; rama `codex/mejoras-experiencia`.
- Aceptación: build, tipos, lint, unitarios, cabeceras, E2E y revisión visual en escritorio/celular.
- Implementado: portada con muestra ficticia, editor con nombre primero, secciones, vista previa
  de escritorio y salto a compartir; carga de foto traducida y foco visible. Guardado inmediato,
  borrado sin recrear claves y avisos diferenciados de lectura/guardado/borrado.
- Integración de agentes: `c561927` valida formas antes de normalizar; `93b6432` normaliza redes
  sociales. Ambos revisados por el director y cherry-picked desde worktree aislado.
- Verificación: 156/156 unitarios, 126/126 E2E, 25/25 cabeceras, tipos, lint y build en verde.
  Dos regresiones propias se observaron fallar antes: último cambio sin guardar y claves recreadas
  después del borrado. El JPEG conserva texto y QR decodificable por lector independiente.
- Cierre del entorno: al retirar el worktree, Git siguió el enlace de dependencias compartidas.
  Se restauraron con `pnpm install --frozen-lockfile`, sin cambios al lockfile ni al código,
  y se repitieron unitarios, E2E, lint, build y cabeceras con éxito.
- Revisión visual directa: escritorio 1280x720 y celular 375x812. La revisión independiente de
  Terra cubrió demo/consentimiento/captura/persistencia y halló dos detalles corregidos:
  selector erróneo en la nueva prueba y salto de encabezados en la muestra.
- Documentación: README enlaza al plan público; sección 6 actualizada; tablas de diseño inicial
  marcadas como superadas; aviso del enlace corregido (sin foto, no iniciales).
- Límite histórico de compatibilidad, resuelto 2026-09-13 con fflate: el decoder v1 dependía de `DecompressionStream`. Un receptor
  sin esa API no abre enlaces comprimidos; queda por implementar y probar un fallback portátil.
  No se atribuye el problema a una versión concreta de Safari sin prueba en ese dispositivo.
- Siguiente acción: revisar el resultado local en `http://localhost:3210`. La publicación de esta
  ronda no se ha ejecutado. Los gates físicos anteriores siguen siendo pruebas con equipos reales.

✅ **Primera ronda de uso real en PRODUCCION** (2026-09-11, commits `3cfc860` a `3cc4b35`, todos
desplegados en https://tarjetica-app.vercel.app y verificados ALLI, no solo en local). Johann lleno su
tarjeta en el celular y en el computador y reporto dos cosas; detras habia cinco defectos:
- La web escrita sin `https://` bloqueaba compartir, y **apagaba el guardado automatico en silencio**
  (lo escrito despues se perdia al recargar). Tambien una fila de enlace vacia y un correo a medias.
  Arreglo: guardar es permisivo (`BorradorGuardable`), compartir sigue estricto (`esExportable`).
- El boton apagado llevaba siempre a la casilla y decia "escribe tu nombre" con el nombre escrito.
  Ahora lleva al primer campo que falla y lo nombra.
- En el computador la tarjeta dejaba ~200 px de blanco alrededor del QR. Ahora mide lo que necesita;
  el QR no cambio de tamaño en ningun caso medido.
Verificado: typecheck, lint, build, **151 unitarios**, 25/25 cabeceras y **120/120 E2E**.

✅ **El resalte LATE tambien para quien pidio menos movimiento** (2026-09-09). Johann probo el
borde fijo y pidio "un parpadeo basico, que se haga notar". Se puede y ademas es correcto: la
preferencia existe por el movimiento ESPACIAL, no por un cambio de alfa. Late 2 veces en 0,9 s por
ciclo y **nunca se apaga** (baja a 0,45 y vuelve), que es lo que lo separa de un destello. Ademas se
quito la frase repetida de la home. Verificado: typecheck, lint, build, **137 unitarios**, 25/25
cabeceras y **116/116 E2E**.

✅ **Hilo de INTERFAZ cerrado** el 2026-09-08. El "no lo veo parpadear" NO era un defecto: el
Windows de Johann tiene los efectos de animacion apagados, asi que su Chrome pide menos movimiento y
el CSS le da el borde fijo a proposito. Medido por dos vias. De ahi salio lo demas: el resalte gana
RELLENO (y uno reforzado para quien pide menos movimiento), el parpadeo pasa a medirse por el ALFA
fotograma a fotograma (probado con una mutacion), y se descubrio que **la suite media la
configuracion de Windows de quien la corria**. Verificado: typecheck, lint, build, **135
unitarios**, 25/25 cabeceras y **116/116 E2E** contra el build de PRODUCCION.

✅ **Ronda de uso real de Johann** el 2026-09-08 (commits `a1c5db8` a `5f6fe36`, ya en
`origin/main`). Johann abrio la app en su computador y reporto seis cosas, una por una; ninguna la
habia dado ninguna medicion. Verificado: typecheck, lint, build, **133 unitarios**, 25/25 cabeceras
y **113/113 E2E** contra el build de PRODUCCION.

✅ **Ola 7 COMPLETA salvo la 7d** el 2026-09-07 (commit `4b1903e`, ya en `origin/main`). Las
cuatro unidades que no dependian de Vercel: 7a idiomas, 7b puerta agentica y los tres limites en el
copy visible, 7c metrica anonima, 7e barrido final de superficie sobre las cuatro pantallas. **La
7d, el deploy, sigue bloqueada** por un `vercel login` interactivo que solo puede hacer Johann.

✅ **Ola 6 COMPLETA** el 2026-09-05 (commit `c2247f8`, ya en `origin/main`). El enlace compartible
existe, nace apagado y con la advertencia antes de generarlo.

✅ **Ola 5 COMPLETA** el 2026-09-05 (commit `e7d3693`, ya en `origin/main`), **salvo su gate
fisico 5d**. La tarjeta se guarda como `.jpeg` generado en el navegador, con las fuentes embebidas y
el QR adentro, que sigue siendo escaneable despues de comprimir.

✅ **Ola 4 COMPLETA** el 2026-09-05 (commit `4ed0000`, ya en `origin/main`). El QR y el vCard se generan en el CLIENTE y estan cableados en la app.

✅ **Ola 1 COMPLETA** el 2026-09-04 (commits `b64d40c` + `5170e89` + `b422540`, rama `main`). El código vive en
`C:\OPS\_VelOS\proyectos\tarjetica\`, y **ya está publicado**:
https://github.com/Johann-Valderrama/tarjetica (público, MIT detectado por GitHub). FASE 0 cerrada el 2026-09-03. Producto: **Tarjetica**.

## Next action

🤖 **No queda ninguna unidad de agente del PRP.** El producto esta completo y **publicado** desde el
2026-09-10 en **https://tarjetica-app.vercel.app**, en la cuenta personal de Johann.

🙋 **Lo que depende de Johann:**

- **DECISION ABIERTA: ¿la pantalla de 320 px entra al contrato?** Con la tarjeta llena, ahi el QR
  queda en **2,39 px por cuadrito** y el piso de lectura es 2,5, incluso despues de quitarle el
  hueco de la foto. Esta FUERA del caso que el PRP declara (375x667), asi que se dejo medido en el
  codigo y no se toco. Opciones: **(A)** entra, y se busca de donde sacarle pixeles al codigo;
  **(B)** no entra, y queda como limite conocido y escrito. Recomendada la B mientras el peor caso
  declarado siga siendo 375: un iPhone SE de 2016 ya casi no aparece en un evento. El de la Ola 7 (`4b1903e`) ya esta en `origin/main`.
- **Gate fisico 4e, ya se puede contra la URL real:** escanear el QR de la tarjeta LLENA de una pantalla a otra, a unos 20 cm, con
  brillo normal de evento y luz artificial de interior. En un iPhone SE con todos los campos el
  codigo queda en **2,55 px por cuadrito**, sobre el piso de 2,5 pero sin sobra. Si no se lee, la
  palanca ya esta construida: el aviso de densidad dice que campo quitar.
- **Gate fisico 5d:** guardar el `.jpeg` en Fotos en un iPhone y un Android reales, **y ademas
  abriendo la pagina dentro de Instagram y de LinkedIn**, que es por donde se reparte un link
  regalado y donde `navigator.share` con archivos se degrada.

✅ **La decision de la paleta del editor quedo CERRADA** el 2026-09-08: Johann eligio la opcion A
(repintar con los tokens, midiendo el contraste). Ejecutada y revisada por un panel de tres agentes.
Ver el detalle en Completado.

## FRASE PARA ABRIR VENTANA NUEVA · hilo de INTERFAZ (copy-paste) — SUPERADA el 2026-09-08

> **Este hilo se cerro.** Se deja el texto por si hace falta el rastro de que se pidio, pero NO se
> vuelve a pegar: la hipotesis que abre (el parpadeo) quedo resuelta y medida. Lo unico que sigue
> abierto es la 7d (despliegue) y las dos decisiones de arriba.

> Escrita el 2026-09-08. Hay DOS hilos abiertos y cada uno tiene su frase: **este**, de interfaz y
> animacion, que se puede hacer ya; y el del **despliegue (unidad 7d)**, mas abajo, que sigue
> bloqueado por un `vercel login` de Johann.
>
> Se abre con **`Opus.M`**: el nucleo es depurar por que no se ve el parpadeo y escribir el E2E que
> lo asegure. La pasada de mejora estetica, si abre un eje de diseño ABIERTO, puede ir a `Fable.H`
> (el gate de exclusion ya esta resuelto: repo publico MIT, fixtures ficticios, sin datos de
> terceros).

```
Continua el hilo de INTERFAZ de Tarjetica. Codigo en C:\OPS\_VelOS\proyectos\tarjetica\
(repo publico MIT, ya en GitHub). Bitacora en C:\OPS\_VelOS\proyectos\tarjetica\plan\.

Lee primero PROGRESS.md y DECISIONES.md de esa carpeta. Estado: todo commiteado y
pusheado, ultimo commit `5f6fe36`. La suite es 133 unitarios + 25 asserts de cabeceras + 113 E2E,
toda en verde contra el build de PRODUCCION: si algo se pone rojo, es tuyo.

LO QUE JOHANN REPORTO: "aun no lo veo parpadear, se queda en rojo estatico". Habla del resalte que
sale al pulsar un boton apagado en /editor (marca el nombre, NO marques la confirmacion, baja y
toca cualquier boton de compartir).

EMPIEZA POR AQUI, que es la hipotesis fuerte y esta MEDIDA, no supuesta:
con `prefers-reduced-motion: reduce` el CSS deja el borde ENCENDIDO FIJO a proposito, sin
parpadear. Es exactamente el sintoma. Verificado el 2026-09-08 con Playwright:
  no-preference -> parpadea 3 veces
  reduce        -> borde fijo, animationName: none
Asi que lo PRIMERO es averiguar si el Chrome de Johann tiene esa preferencia activa (Windows:
Configuracion > Accesibilidad > Efectos visuales > Efectos de animacion). Preguntaselo o pidele que
abra chrome://settings y lo confirme. Si es eso, la conversacion cambia: no hay bug, hay que
decidir que hacer para quien pidio menos movimiento (hoy se le da borde fijo, que es lo correcto
por accesibilidad, pero se puede reforzar con relleno y contorno mas marcados sin animar nada).
Si NO es eso, entonces si hay un defecto y hay que depurarlo midiendo, no mirando el codigo.

QUE HACER:
1. Resolver lo de arriba antes de tocar CSS.
2. Agregar al resalte un RELLENO, no solo el borde: Johann lo pidio como "un rosado rojizo
   transparentoso". Ya existe el token `--peligro-superficie` (rgba(255,86,68,0.1)); evalua si
   sirve o si hace falta subirlo. Tienes LIBERTAD para ajustar los colores, con dos condiciones:
   que el texto de adentro siga pasando AAA sobre el relleno nuevo, y que lo midas.
3. E2E que ASEGURE el parpadeo, no que lo declare. El de hoy (`e2e/boton-apagado-explica.spec.ts`)
   comprueba `animationName` y `animationIterationCount`, o sea lo que el CSS DICE. Falta medir el
   ALFA del color fotograma a fotograma dentro de la pagina y contar los ciclos reales. La receta
   esta probada y da esto:
     @@@%%#*+=-:..     ..:-=+*#%%@@@@@%%#*+=-:..   (3 valles y meseta final)
   OJO con el medidor: un `box-shadow` INTERPOLA entre el color y transparente, asi que comprobar
   "¿vale transparente?" da SIEMPRE encendido y reporta cero parpadeos. Hay que medir el ALFA.
   Y cubre los DOS casos: con movimiento y con `reducedMotion: 'reduce'`.
4. Pasada de mejora de TODA la interfaz, con las herramientas de OPS que ya existen:
   - C:\OPS\skills-on-demand\medir-pagina\SKILL.md   (saca del DOM lo que una captura no muestra)
   - C:\OPS\skills-on-demand\animar\SKILL.md          (como juzgar motion, con calibraciones ya pagadas)
   - C:\OPS\skills-on-demand\ver-video\SKILL.md       (filmstrip de una animacion; NO se autocarga)
   - C:\OPS\.claude\memory\feedback\diseno-ui-anti-slop-por-defecto.md
   - C:\OPS\.claude\docs\diseno-web-ia-claude-design-stitch-animaciones.md
   - C:\OPS\.claude\memory\reference\defaults-animacion-por-proyecto.md
   La direccion estetica del proyecto esta CERRADA y no se re-litiga: docs/direccion-estetica.md.
   Mejorar es dentro de esos tokens, no cambiando la paleta.

LA LECCION DE AYER, que aplica directo a esto: **medir no basta, hay que MIRAR.** Dos hallazgos que
ningun numero dio: un medidor que reportaba cero parpadeos por lo de la interpolacion, y un rojo
que pasaba el contraste de sobra pero en el filmstrip se veia SALMON (era el tono calibrado para
TEXTO, no para borde; nacio `--peligro-fuerte` por eso). Si vas a afirmar como se ve algo, miralo.

LO QUE NO SE RE-LITIGA:
- D1, cero servidor. Nada de CDN, analitica de terceros ni fuentes remotas: la CSP arranca en
  `default-src 'self'` y hay asserts que lo miden.
- El payload del enlace viaja en el FRAGMENTO (#), jamas en el query string.
- La foto nunca entra al enlace ni al QR (G5); la firma de marca nunca entra a un vCard (G4).
- La puerta de la unidad 2d: no se exporta sin marcar "esta tarjeta es mia". Desde que los botones
  usan `aria-disabled`, esa puerta la sostiene NUESTRO codigo y hay un E2E que la vigila.
- Ninguna pantalla usa colores de Tailwind: todo sale de los tokens. Lo vigila
  src/app/contraste.test.ts, que ademas prohibe el modificador de opacidad sobre un token porque
  NO se aplica (Tailwind no puede con `var(--x)` en hexadecimal).

DECISION ABIERTA que puedes encontrarte: si la pantalla de 320 px entra al contrato. Ahi el QR queda
en 2,39 px por cuadrito y el piso es 2,5. Esta fuera del caso que el PRP declara (375x667). No la
resuelvas por tu cuenta: es de Johann.

Antes de cerrar: typecheck, lint, build, `pnpm test`, `node scripts/verificar-headers.mjs` y el E2E
completo (`node node_modules/@playwright/test/cli.js test`). No corras el E2E mientras un subagente
corra el suyo: comparten el puerto 3210 y la contencion produce fallos que parecen del producto.
Y actualiza PROGRESS.md y DECISIONES.md.

Modelo esperado: Opus.M para abrir. Si eres mas debil, avisa y espera.
```

## FRASE PARA ABRIR VENTANA NUEVA · hilo del DESPLIEGUE (copy-paste)

> Actualizada el 2026-09-07 al cerrar la Ola 7. **Ya no queda ninguna ola de agente del PRP-TD-001**
> (la version anterior de este bloque mandaba a ejecutar la Ola 7, que ya esta hecha). Lo que sigue
> es el gate humano del despliegue, mas la decision de paleta de arriba.
>
> La sesion que ejecute la 7d se abre con **`Sonnet.M`**, que es lo que el PRP estampa para esa
> unidad.

```
Ejecuta la unidad 7d del PRP-TD-001 (el despliegue) en el repo `tarjetica`.

Lee en este orden:
1. C:\OPS\_VelOS\proyectos\tarjetica\plan\PRP-TD-001-tarjeta-digital-regalo.md
   (la fila 7d de la tabla de la Ola 7, en la seccion 7)
2. C:\OPS\_VelOS\proyectos\tarjetica\plan\PROGRESS.md
3. C:\OPS\_VelOS\proyectos\tarjetica\plan\DECISIONES.md
El codigo vive en C:\OPS\_VelOS\proyectos\tarjetica\ (repo publico, MIT, ya en GitHub).

Estado: Olas 1 a 7 completas MENOS la 7d. La suite es 98 unitarios + 25 asserts de cabeceras + 105
E2E, toda en verde contra el build de PRODUCCION: si algo se pone rojo, es tuyo. El commit de la
Ola 7 (`4b1903e`) esta LOCAL, sin pushear.

ANTES DE EMPEZAR comprueba que el bloqueo se levanto de verdad: `vercel whoami`. Si falla, PARA y
avisa; no intentes rodearlo.

QUE HACES:
- `git push` del commit de la Ola 7.
- `vercel link --yes` y `vercel --prod`, en el Vercel PERSONAL de Johann, no en el equipo
  ZelandiaIO.
- Verifica las 4 cabeceras de la unidad 1e contra el dominio de PRODUCCION, no contra localhost.
- Cuando exista el dominio real, llena `MARCA.dominio` en
  src/features/tarjeta/vista/firma.tsx. Hoy esta en `null` A PROPOSITO: un dominio inventado le
  pone a cada usuario un enlace muerto en su tarjeta.

Lo que NO se re-litiga:
- D1, cero servidor. Nada de `next/og`, `@vercel/og`, CDN, analitica de terceros ni fuentes
  remotas: la CSP arranca en `default-src 'self'` y hay asserts que lo miden. La UNICA peticion
  propia es el ping anonimo de la unidad 7c, al propio origen, sin cuerpo y nunca en la ruta de la
  tarjeta.
- El payload del enlace viaja en el FRAGMENTO (#), jamas en el query string.
- La foto nunca entra al enlace ni al QR (G5); la firma de marca nunca entra a un vCard (G4).
- Los idiomas NO llevan prefijo en la URL: las cuatro rutas son contrato ya escrito.

Antes de cerrar: typecheck, lint, build, `pnpm test`, `node scripts/verificar-headers.mjs` y el E2E
completo (`node node_modules/@playwright/test/cli.js test`). Y actualiza PROGRESS.md y
DECISIONES.md en el repositorio privado donde vivio la bitacora antes del 2026-09-10.

Modelo esperado: Sonnet.M. Si eres mas debil, avisa y espera.
```

### 🙋 Y lo que sigue esperandote a ti (Johann)

- **`vercel login`**, que desbloquea la unidad 7d. Es interactivo, ningun agente lo puede hacer.
- **Gate 4e**, escanear el QR de la tarjeta llena de una pantalla a otra.
- **Gate 5d**, guardar el `.jpeg` en Fotos en un iPhone y un Android reales, y dentro de Instagram y
  de LinkedIn.

## En curso

- (vacío)

## Pendientes 🙋

- [x] G1 a G7 ⛔ CERRADOS 2026-09-03 (ver §3 del PRP y el resumen del bloque CÓMO EMPEZAR)
- [x] **Ola 1 CERRADA: repo público `tarjetica` creado y pusheado el 2026-09-04** (autorizado por
  Johann). https://github.com/Johann-Valderrama/tarjetica  ·  nombre verificado libre antes de crear
  (404 en la API). GitHub detecta la licencia MIT. El `LICENSE` entró en el primer commit, que es lo
  que la Ola 7 quería asegurar
- [x] **Firma con dominio completada 2026-09-13:** `tarjetica-app.vercel.app`, fuera del vCard.
- [x] **DECISION CERRADA 2026-09-08: la paleta del EDITOR**, por la opcion A. Repintado con los
  tokens, con el contraste medido en la suite y guards que impiden la reincidencia.
- [ ] **Ola 4: gate físico 4e, escanear el QR de la tarjeta llena de una pantalla a otra.** Es el
  único punto de la Ola 4 que queda abierto, y el árbitro de si llevar TODO dentro del QR aguanta.
  Condiciones que sí cuentan: unos 20 cm, brillo normal de evento y luz artificial de interior, no
  un escritorio con luz controlada
- [ ] **Ola 5: gate físico 5d**, guardar el `.jpeg` en Fotos en un iPhone y un Android reales, y
  además desde el navegador embebido de Instagram y de LinkedIn. Es el único punto abierto de la
  Ola 5: un doble de la capa que falla no verifica nada, y la hoja de compartir es del sistema
  operativo, no del navegador
- [x] **Ola 7d, deploy: HECHO el 2026-09-10.** En la cuenta **personal** de Johann en Vercel.
  URL publica de produccion: **https://tarjetica-app.vercel.app**

  Verificado contra la URL REAL, no contra el build local: 25/25 asserts de cabeceras, la CSP sale
  en `default-src 'self'` con nonce por peticion, **cero peticiones a un dominio ajeno** (D1 se
  sostiene en produccion) y el editor carga sin errores de JS.

  **Tres trampas que un "200" escondia, medidas antes de dar la URL:**
  - `tarjetica.vercel.app` responde 200 pero **no es este proyecto**: el nombre ya lo tenia otra
    persona. Se comprobo por CONTENIDO, no por codigo de estado.
  - La URL larga de cada despliegue (`tarjetica-<hash>-...vercel.app`) y el alias
    `tarjetica-johann09-4767s-projects.vercel.app` devuelven 200 **con la pagina de login de
    Vercel**: tienen la proteccion de despliegues que Vercel pone por defecto. No son publicas.
  - La publica era `tarjetica-ochre.vercel.app`, que Vercel asigno sola porque el nombre corto estaba
    tomado. **El mismo dia Johann pidio un nombre mejor:** se renombro el proyecto a `tarjetica-app`
    y se agrego `tarjetica-app.vercel.app` como dominio DEL PROYECTO (no de un despliegue suelto, asi
    sigue a cada deploy de produccion futuro). `tarjetica-ochre` sigue viva a proposito, para no
    romper un enlace que ya se hubiera repartido. Nada del codigo tenia la URL escrita a mano.

  **Por que estuvo bloqueado tres sesiones, y dos diagnosticos mios que resultaron falsos:**
  1. Las sesiones anteriores afirmaban "no hay sesion" mirando `~/.vercel/auth.json`, que es la
     ruta de Linux. En Windows el CLI guarda en `%APPDATA%\com.vercel.cli\Data\`.
  2. **El 2026-09-10 afirme que el scope del CLI apuntaba a un equipo ajeno y lo quite. Era FALSO:**
     ese identificador `team_...` era la propia cuenta personal de Johann. Vercel convirtio las
     cuentas gratuitas en "equipos personales" con ID `team_`, asi que un `currentTeam` guardado NO
     prueba que se este en un equipo de otro. Lo que lo prueba es `vercel teams ls`, que aqui lista
     UNO solo: `johann09-4767s-projects`. Quitarlo fue inofensivo, pero el razonamiento no.
  3. La causa real era una sola: el token guardado estaba vencido (403). Y los dos primeros logins de
     Johann no quedaron guardados; el tercero si, corrido desde una terminal de administrador.

  Ya NO es cierto que el repo sirva un placeholder: el producto esta completo y publicado. Faltan solo
  los dos gates fisicos, que ahora se pueden hacer contra la URL real
- [~] `alta-baja-de-repos-por-ops`, a medias: el descriptor `_PROYECTO.md` de `tarjetica` YA quedó
  escrito (2026-09-04; gitignoreado en el repo público porque apunta al privado). **Falta regenerar**
  `C:\OPS\_VelOS\proyectos\_MAPA.md`, donde `tarjetica` todavía NO figura: ese archivo tenía cambios
  sin commitear de otra ventana, así que no se tocó. Regenerarlo cuando ese árbol esté limpio.

## Completado

- [x] 2026-09-08 **Seis cosas que Johann encontro USANDO la app**, y que ninguna medicion habia
  dado. Se listan juntas porque la leccion es la misma: **lo que el navegador pinta o decide por su
  cuenta no aparece en ningun archivo del proyecto, asi que ningun test que mire el codigo lo ve.**
  (1) "Guardar como imagen" abria la hoja de compartir de Windows en el computador, sin dejar elegir
  carpeta: `canShare({files})` dice que si en Chrome de escritorio y ganaba siempre. Ahora decide el
  PUNTERO. (2) El autorrelleno de Chrome pintaba su azul sobre el tema oscuro; era la cuarta
  superficie del navegador sin cubrir. (3) La foto no aparecia en el enlace: **no era un fallo, es
  G5**, pero solo se decia en la ayuda del campo de foto y no donde se decide. (4) Sin foto quedaba
  un hueco que "se ve como si faltara algo". (5) "Mostrar codigo QR" subvendia un boton que lleva a
  la tarjeta entera. (6) Los botones apagados no decian por que ni que hacer.
- [x] 2026-09-08 **La foto en el enlace se resolvio con un NUMERO, no con una opinion**: con ella
  adentro el enlace pasaria de 235 a unos 18.000 caracteres, inservible por WhatsApp y con el QR
  imposible. G5 quedo confirmada como bien decidida, y lo que se arreglo fue DONDE se dice.
- [x] 2026-09-08 **Quitar el hueco de la foto mejoro la escaneabilidad**, que no era el objetivo: el
  QR absorbe la holgura, asi que en el peor caso del PRP (375x667) subio de 3,77 a 3,94 px por
  cuadrito. **En 320 px sigue en 2,39, bajo el piso**, y eso quedo como decision abierta.
- [x] 2026-09-08 **Un falso positivo mio, corregido en el mismo turno.** Me alarme diciendo que el
  QR estaba bajo el piso: habia usado el preset "iPhone SE" de Playwright, que es el de 2016 (320
  px), no el de 375 que el PRP declara como peor caso. A 375 nunca hubo regresion. Y peor: escribi
  en un comentario del codigo una cifra ("155 -> 223 px y 2,89") **antes de medirla**, redactada
  como si fuera medida. La real es 184 px y 2,39.
- [x] 2026-09-08 **El estado apagado dejo de ser mudo, y costo un cambio de mecanismo.** Un boton
  con `disabled` no recibe clics ni hover, asi que no admite tooltip ni "llevame a lo que falta"; y
  en tactil el hover no existe, o sea que el tooltip habria fallado justo en el caso principal. Con
  `aria-disabled` el boton responde, explica por `aria-describedby` y **vuelve al recorrido del
  teclado**, del que un `disabled` real lo saca. El precio (la puerta ya no la impone el navegador)
  se cubre con un E2E que pulsa los cuatro botones bloqueados y comprueba que no pasa nada.
- [x] 2026-09-08 **Dos hallazgos que solo dio MIRAR la animacion**, no medirla. (1) El primer
  medidor reportaba **cero parpadeos**: comprobaba si la sombra valia "transparente", pero un
  `box-shadow` INTERPOLA, asi que casi nunca vale eso exacto. Habria concluido que la animacion no
  existia. Se arreglo midiendo el ALFA fotograma a fotograma dentro de la pagina. (2) El primer rojo
  **no se leia como rojo**: pasaba el contraste de sobra pero en el filmstrip se veia salmon, porque
  se uso el tono calibrado para TEXTO. Los dos rojos cumplian el umbral y uno no servia.

- [x] 2026-09-08 **Editor repintado con los tokens** (`Opus.M`), commits `a1c5db8` y `8a8b277`. La
  Ola 3 fijo la paleta oscura pero solo pinto la VISTA de la tarjeta; el editor se quedo con los
  `neutral-*` y `amber-*` de Tailwind, calculados para fondo claro, asi que sus titulos eran texto
  invisible. **Ningun test lo delataba: la app anda igual de bien con la pantalla ilegible.**
- [x] 2026-09-08 **Seis defectos que aparecieron al MEDIR, no al mirar.** Cinco son de la misma
  familia y por eso se nombran juntos: **CSS que se escribe y no se aplica.** (1) `text-tinta-suave/40`
  en cuatro botones y (2) `/70` en la firma de marca desde la Ola 3: Tailwind no le pone opacidad a
  un token `var(--x)`, genera CSS invalido y el navegador lo tira, asi que los botones apagados se
  quedaban con la tinta del boton activo, invisibles. (3) `--borde-fuerte` daba 1,64:1, o sea los
  campos casi no tenian borde. (4) El fondo del campo y su texto de ejemplo los pintaba el
  NAVEGADOR, a 4,41:1, bajo el minimo de AA. (5) El arreglo de (4) tampoco se aplico al primer
  intento: un `::placeholder` pelado pierde por especificidad contra el preflight de Tailwind. Y
  aparte, (6) la casilla marcada salia del azul del sistema.
- [x] 2026-09-08 **Panel de revision de tres agentes** (un validador E2E y dos auditores de lectura
  con lentes ortogonales), pedido por Johann. Encontro 5 hallazgos reales, todos arreglados, y
  **2 falsos positivos en los que los DOS auditores cayeron igual**: marcaron como grave que el
  mensaje de fallo del QR use colores claros, cuando ese texto cae sobre BLANCO PURO dentro de la
  teja del codigo, a 7,81:1 medido. Ninguno siguio el arbol de renderizado hasta el contenedor.
  Convergieron por mirar la misma muestra parcial, no porque el defecto existiera.
- [x] 2026-09-08 **Un assert del E2E media el estado EQUIVOCADO**, y lo caso el panel. El caso del
  enlace roto comprobaba `texto.length > 20`; "Abriendo la tarjeta..." mide exactamente 20, y el
  aviso de carga compartia `data-testid` con el de error. Fallaba por un caracter, y **con un umbral
  un poco mas bajo habria pasado midiendo lo que no era**, que es peor. La fase ahora va declarada.
- [x] 2026-09-08 **Se corrigio la fragilidad medida como "intermitencia".** La corrida con fallos que
  reporto el validador salio de una CONTENCION que causo el orquestador: se lanzo una suite E2E
  mientras el agente corria la suya contra el mismo puerto. Aislada, la suite corre en ~1,9 min y dio
  106/106 en cuatro corridas seguidas. **La intermitencia de `exportar-jpeg.spec.ts` observada el
  2026-09-07 sigue sin reproducirse y sigue abierta**, ahora con la sospecha de que solo aparece
  bajo presion de CPU.
- [x] 2026-09-08 **Siete guards nuevos, todos probados por MUTACION**: los pares de contraste
  leyendo `globals.css`, que ninguna pantalla se salga de los tokens, que nadie les ponga opacidad
  (sobre todo `src`, sin lista), el rango declarado del estado deshabilitado, y un assert de E2E que
  le pregunta al NAVEGADOR de que color quedo cada cosa. Ese ultimo cubre el hueco que los demas no
  ven: **un test de los VALORES de la paleta no puede ver si el CSS llega a aplicarse**, y ahi vivian
  dos de los seis defectos.

- [x] 2026-09-07 **Ola 7 ejecutada MENOS la 7d** (`Opus.M`), commit `4b1903e` en `tarjetica`,
  **local, sin pushear**. 7a idiomas es-CO e ingles con `next-intl`; 7b README, `/llms.txt`, JSON-LD
  y los tres limites en el copy visible; 7c metrica anonima; 7e barrido de superficie sobre las
  cuatro pantallas. Verificado: typecheck, lint, build, **98 unitarios**, 25/25 cabeceras y
  **105/105 E2E** contra el build de PRODUCCION, en tres corridas completas.
- [x] 2026-09-07 **Los idiomas van SIN prefijo en la URL, y no por comodidad.** Las cuatro rutas son
  contrato ya escrito: las usan las cabeceras (`esRutaDeTarjeta`), el `robots.txt` y **los enlaces
  de la Ola 6 ya repartidos, que no se pueden corregir porque no hay servidor donde arreglarlos**.
  El idioma sale de la cookie del usuario y, si no la hay, del `Accept-Language`, que es justo el
  caso de `/t`: la abre un desconocido que nunca eligio nada.
- [x] 2026-09-07 **Cuatro defectos que encontro la verificacion, no la lectura del codigo.**
  (1) **El endpoint de metricas contestaba 400 a TODO ping**, asi que no registraba nada: un beacon
  sin datos no llega con el cuerpo en `null` sino con un flujo vacio. El fallo era mudo por
  construccion, porque un ping es fire-and-forget; ahora el E2E mide la RESPUESTA y no que la
  peticion salga. (2) **El aviso de G2 en el bloque de limites quedaba blanco sobre blanco** desde
  que la Ola 3 volvio la paleta oscura; se vio en una captura a 375 px. (3) **Dos valores de prueba
  coincidian con copy de la interfaz**, asi que aparecian en el HTML servido sin que se filtrara
  nada y ponian en rojo el assert de fuga, diciendo lo contrario de lo que pasaba; queda un guard
  que lo dice con esas palabras (`e2e/fuga.helpers.ts`). (4) **Sembrar `localStorage` antes de que
  el editor hidratara** hacia que el `reload` cancelara el ciclo y el ping no corriera: fallaba solo
  si era la primera navegacion del contexto, o sea de forma intermitente segun el orden.
- [x] 2026-09-07 **El runner de Playwright manda `Accept-Language: en-US`.** En cuanto la app
  aprendio a negociar el idioma, la suite entera empezo a medir la version en INGLES con sus asserts
  escritos en español: 12 pruebas en rojo de golpe, **ninguna por un defecto del producto**. Se fija
  `locale: 'es-CO'` en `playwright.config.ts` y el ingles pasa a tener su propia suite
  (`e2e/idiomas.spec.ts`), que ademas comprueba que no quede ninguna clave de traduccion cruda en
  pantalla.
- [x] 2026-09-07 **Cuatro asserts nuevos PROBADOS POR MUTACION**: el candado de ruta de 7c (volverlo
  `return true` pone la suite en rojo), el tercer limite de 7b en ingles, la paridad de marcadores
  entre idiomas, y el 400 del endpoint de metricas.
- [x] 2026-09-07 **Un objetivo tactil se mide por lo que el DEDO alcanza, no por la caja del
  elemento.** Lo encontro el propio assert de 7e la primera vez que corrio: la casilla de "esta
  tarjeta es mia" mide 20x20 px, pero su `<label>` mide 44 y es la que recibe el toque. Medir la
  caja del `<input>` habria reportado un defecto que el usuario no tiene, y agrandar la casilla
  habria empeorado el editor por un numero mal leido.
- [x] 2026-09-07 **Una falla intermitente que NO se pudo reproducir**, y se anota en vez de darla
  por resuelta: en una corrida completa, `exportar-jpeg.spec.ts` fallo su assert de dimensiones y
  varianza. No volvio a ocurrir en tres corridas completas posteriores ni al correr ese archivo
  solo, y el artefacto con el mensaje se sobrescribio antes de leerlo. Ese assert depende de la caja
  renderizada del lienzo oculto y no espera a `document.fonts.ready`, asi que un arranque en frio lo
  puede mover. **Queda abierto**: no se toco porque es un test de la Ola 5 y arreglarlo sin el
  mensaje real seria adivinar.

- [x] 2026-09-05 **Ola 6 ejecutada completa** (`Opus.M`), commit `c2247f8`, ya en `origin/main`.
  6a codec (claves cortas, `deflate-raw`, base64url, byte de version y fallback sin comprimir);
  6b UI apagada por defecto con la advertencia ANTES de generar; 6c E2E que lo mide desde afuera.
  Las dos propiedades del codec estan PROBADAS: `decode(encode(x))` en tres perfiles, y el payload
  sin la foto ni con una foto cargada, medido sobre el payload real. Link medido: 235 caracteres el
  perfil tipico, 500 el lleno.
- [x] 2026-09-05 **Dos asserts de la Ola 6, probados por mutacion:** mover el payload al query
  string hace fallar la suite, y quitar el aviso del historial del navegador tambien.
- [x] 2026-09-05 **Un fallo propio que encontro el test y no la lectura del codigo:** `decodificar`
  promete no lanzar nunca y filtraba un rechazo no manejado. Un `TransformStream` no deja esperar la
  escritura antes de leer, y con un payload corrupto el lado de escritura RECHAZA; esa promesa
  huerfana se escapaba del `try` como error de consola en el navegador del desconocido que abrio el
  link. Se recoge en un `finally`.
- [x] 2026-09-05 **Los fixtures del repo publico dejan de llevar el contacto real de Johann**
  (commit `e950284`). De paso se arreglo un assert que el cambio dejo VACIO: comprobaba que el HTML
  del servidor no trajera un numero que ya no estaba en ninguna tarjeta de prueba. Re-medido: las
  cifras de densidad no se movieron.
- [x] 2026-09-05 **Re-medido el bloqueo de Vercel** (era el unico claim que quedaba sin verificar):
  cero llaves `VERCEL_*` en el mapa de entorno, sin `~/.vercel/auth.json` y sin proyecto enlazado.
  Sigue bloqueado, y el desbloqueo es un login interactivo de Johann.

- [x] 2026-09-05 **Ola 5 ejecutada completa** (`Opus.H`), commit `e7d3693`, ya en `origin/main`.
  3 unidades de agente: 5a render a JPEG con webfonts embebidas y densidad 3; 5b guardado con la
  hoja del sistema primero y dos respaldos; 5c E2E sobre el build de produccion. Verificado:
  typecheck, lint, build, **66 unitarios**, 25/25 cabeceras y **68/68 E2E**.
- [x] 2026-09-05 **El `.jpeg` se verifica con cuatro asserts que NO son "el archivo existe".**
  Varianza y numero de tonos (descartan un color solido), pixeles claros en la banda del nombre
  (**probado por mutacion: sin embeber las fuentes, falla**), el QR del `.jpeg` vuelto a DECODIFICAR
  despues de comprimir con perdida, y la firma dentro sin ningun control.
- [x] 2026-09-05 **Una barra flotante para guardar, construida y QUITADA el mismo dia.** Tapaba el
  telefono y la firma; se vio en una captura. En el flujo tampoco cabia: le quitaria unos 60 px al
  QR. La vista de la tarjeta se queda sin controles, y hay un assert que lo vigila.
- [x] 2026-09-05 **Cerrado el pendiente de la teja del QR**, que en telefonos altos no era cuadrada
  (356x533, con 177 px de blanco sobrante). `min(100cqw, 100cqh)` es la unica forma de decir "el
  lado que quepa por los dos ejes". Ahora mide 306x306 y 356x356.

- [x] 2026-09-05 **Ola 4 ejecutada completa** (`Opus.M`), commit `4ed0000` en `tarjetica`, ya en
  `origin/main`. Las 5 unidades de agente: 4a vCard 3.0 con todos los campos de texto (solo `FN`,
  plegado por OCTETOS, escape completo); 4b descarga del `.vcf` por Blob con la foto adentro; 4c QR
  en cliente con `M`, `margin: 4`, uno a ancho completo; 4d decodificación con un lector
  independiente; 4f aviso de densidad que nombra el campo más caro. Verificado: typecheck, lint,
  build, **59 unitarios**, 25/25 asserts de cabeceras y **60/60 E2E** contra el build de PRODUCCIÓN.
- [x] 2026-09-05 **La verificación de 4d se hizo en DOS capas, porque una no bastaba.** La prueba en
  Node comprueba que la librería codifica bien, pero no que alguien la CONECTE: si el componente
  pasara otro texto o simplemente no se montara, esa prueba seguiría en verde. La segunda capa le
  toma una captura al `<img>` REAL de la página y la decodifica; coincide carácter por carácter con
  el vCard, en la tarjeta mínima y en la de todos los campos.
- [x] 2026-09-05 **D1 dejó de ser una promesa y pasó a ser un assert.** Dos E2E nuevos: el HTML que
  sirve el servidor no contiene ningún dato de la tarjeta, y generar el QR no dispara ni una
  petición a un dominio ajeno. La descarga del `.vcf` también se midió: cero peticiones.
- [x] 2026-09-05 **Tres defectos que encontró la verificación, no la lectura del código.** (1) El
  assert del margen del QR se comparaba con su propia constante: con `margin: 1` seguía en verde;
  ahora el margen se DEDUCE de los píxeles del PNG y el 4 es la norma escrita a mano. (2) El
  teléfono y la firma quedaban IMPRESOS UNO ENCIMA DEL OTRO al pie de la tarjeta, y no lo delataba
  nada porque no había scroll y el QR seguía grande: se vio en una captura. Nace
  `nada-se-pisa.spec.ts` (5 perfiles × 3 pantallas). (3) Arreglar eso le quitó altura al QR y en un
  iPhone SE cayó a 2,29 px por cuadrito, bajo el piso; se reclamaron 24 px y quedó en 2,55. Los dos
  asserts nuevos están **probados por mutación**.
- [x] 2026-09-05 **Dos ventanas estaban ejecutando la Ola 4 a la vez.** Se detectó por archivos
  ajenos sin commitear y por una colisión de escritura; Johann decidió que la tomara esta ventana y
  cerró la otra. Su trabajo en 4a, 4c y 4f se conservó, no se rehízo.

- [x] 2026-09-04 **Ola 3 REHECHA a una sola vista** (commits `c8206ad` y `9611c68`, ya en
  `origin/main`). Johann la pidió "igual" a su tarjeta de Zelandia: sin KPIs, un solo QR grande, y
  toda la demás información viajando dentro del código para que quede en la agenda del contacto.
  Cambió el modelo (fuera `s` y `no`, entran `ti` y `de` con topes duros), el editor (fuera el
  bloque de cifras) y la vista entera. La tipografía de display dejó de ser Fraunces: la referencia
  usa una sans pesada.
- [x] 2026-09-04 **La tarjeta cabe en una sola visual POR CONSTRUCCIÓN.** El QR absorbe la holgura,
  así que ningún texto puede producir scroll. Verificado con 15 asserts: cinco perfiles por tres
  pantallas (iPhone SE, iPhone 14, Pixel 7), comprobando que no haya scroll en ninguna dirección y
  que el QR no se encoja por debajo de lo legible.
- [x] 2026-09-04 **Tres huecos de verificación propios, encontrados y cerrados.** (1) Un texto sin
  espacios desbordaba en horizontal. (2) El assert del pliegue corría en un Pixel 7 de 915 px y no
  en el teléfono de 667 para el que se calculó el presupuesto: pasaba siempre sin probar nada, y al
  correrlo donde tocaba el QR quedaba 137 px por debajo. (3) El assert medía que el QR fuera visible,
  no que la TARJETA COMPLETA cupiera, que es lo que de verdad se pedía.

- [x] 2026-09-04 **Ola 3 ejecutada completa**, commit `73bea32` en `tarjetica`, ya en `origin/main`.
  Johann dio la direccion en una linea: la estructura y la tipografia de su tarjeta actual, con los
  colores del sitio de Zelandia. Las dos referencias se abrieron EN VIVO y se les saco el sistema de
  diseño **del DOM**, no de una captura; los seis pares de contraste se midieron y todos dan AAA.
  Las 5 unidades: 3a direccion escrita + tokens, 3b tarjeta con dos vistas y el toggle FUERA del
  capturable, 3c avatar, 3e firma DENTRO del capturable, 3d verificacion de superficie a 375 px.
- [x] 2026-09-04 **El assert que protege el `.jpeg` esta PROBADO POR MUTACION**: metiendo el toggle
  dentro del elemento capturable, fallan 2 tests. Sin esa prueba, "el assert pasa" tenia dos
  lecturas.
- [x] 2026-09-04 **Otro defecto que encontro la captura y no el codigo**: "USD 86M" se partia en dos
  lineas y desalineaba la fila de cifras (medido: bloques de 66, 51 y 98 px). Al arreglarlo con
  subgrid se vio ademas que el `<dt class="sr-only">` duplicaba la etiqueta y un lector de pantalla
  la leia dos veces. Los dos quedaron con assert propio.

- [x] 2026-09-04 **Ola 2 ejecutada completa**, commit `95d60c4` en `tarjetica`, ya en `origin/main`.
  Las 5 unidades: 2a campos de identidad, contacto, redes, ubicación y notas; 2b capa de venta
  opcional; 2e carga de foto con recorte cuadrado, reducción y borrado de EXIF; 2c editor con
  autosave e hidratación; 2d avisos con la confirmación como GATE de exportación y el borrado
  visible. Verificado: typecheck, lint, build, 29 unitarios, 25/25 asserts de cabeceras y **8/8
  E2E de Playwright en Chromium móvil contra el build de PRODUCCIÓN**, más pasada en navegador a
  375 px (sin desborde, sin errores de consola, ningún objetivo táctil bajo 44 px).
- [x] 2026-09-04 **Dos defectos que encontró la verificación, no la lectura del código.** (1) Comprimir
  la foto solo por CALIDAD no alcanzaba: medido con ruido puro, a 320 px ni con calidad 0,28 baja de
  34.327 bytes contra un techo de 20.000. Ahora también baja el lado. (2) Sin fondo explícito en el
  `body`, un navegador en modo oscuro dejaba la página ILEGIBLE, y eso no lo delata ninguna medición:
  se vio en un screenshot.

- [x] 2026-09-04 **Ola 1 ejecutada completa** (Opus.M), commit `b64d40c` en el repo local `tarjetica`.
  Las 5 unidades: 1a scaffold Next 16.2.9 / React 19.2.7 / TS 5.9.3 / Tailwind 3.4.19 / Zod 4.5.4 con
  pnpm; 1b `LICENSE` MIT con `Copyright (c) 2026 Johann Valderrama` en el PRIMER commit y el README
  con la frase de G2 sin reformular; 1c tipo `Tarjeta` (Zod, claves de 1-2 letras, `strictObject` en
  todos los niveles, foto en tipo aparte); 1d `localStorage` con validación al leer, migración por
  versión y borrado sin rastro; 1e CSP con nonce que arranca en `default-src 'self'`,
  `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex` en las rutas de tarjeta y `robots.txt`.
  Verificado: `typecheck`, `lint`, `build` y 29 tests en verde, más 25/25 asserts de
  `pnpm verify:headers` contra el build de PRODUCCIÓN, más una pasada en navegador real a 375 px
  (hidrata, cero errores de consola, sin desborde horizontal).
- [x] 2026-09-04 **Arreglado un fallo que las cabeceras NO delataban** (`5170e89`): la CSP con
  nonce bloqueaba los 11 scripts de la página y la app NO hidrataba, con los 22 asserts en verde.
  Causa: una página prerenderizada estática no puede recibir un nonce por petición, y con
  `strict-dynamic` el `'self'` queda ignorado, así que caían también los chunks. Fix:
  `dynamic = 'force-dynamic'` en el layout raíz (se pierde el prerender estático; esta app no lo
  necesita por D1). Se agregaron los dos asserts que faltaban (todo `<script>` con nonce, y la
  frase de G2 literal), **probados por mutación**: sin el `force-dynamic` el guard falla con 11
  de 11 sin nonce y sale 1. También llevaba "ningun servidor" sin tilde en el copy visible.
- [x] 2026-09-04 Nombre `tarjetica` verificado libre bajo la cuenta `Johann-Valderrama` (404 en la
  API). Existen 4 repos homónimos de terceros, todos con 0 estrellas: no hay colisión de marca.

- [x] 2026-09-03 PRP-TD-001 escrito (Opus, esfuerzo alto), con las decisiones D1 a D5 ya cerradas por el operador.
- [x] 2026-09-03 Verificación del plan completa: validador de grafo de olas en verde (7 olas), grep de frontera de repo compartido limpio, recorrido gesto a gesto de CÓMO EMPEZAR.
- [x] 2026-09-03 Investigacion de QR (carril gratis de `ruteo-economico`, 4 de 10 fuentes, costo $0,00, mas medicion propia con la libreria `qrcode`). Origen: Johann reporto que con su tarjeta actual tenia que acomodar el QR para que lo leyeran. Causa medida: dos QR se reparten el ancho y quedan en 2,39 px por cuadrito, bajo el piso de ~2,5. Aplicado al PRP: un solo QR a ancho completo, `margin: 4`, EC se queda en `M`, unidad 4f de aviso de densidad, 5 gotchas y 3 criterios nuevos, y rMQR/PDF417 descartados con evidencia.
- [x] 2026-09-03 FASE 0 cerrada: los 7 gates respondidos por Johann en entrevista. G6 no se re-preguntó (ya venía cerrado por D5). Consecuencias propagadas al PRP: 2 unidades nuevas (2e carga de foto, 3e firma), 4 gotchas nuevos, 4 criterios de éxito nuevos, y 2 entradas nuevas de fuera de scope.
- [x] 2026-09-03 Debate adversarial corrido con 2 lentes ortogonales (conferencia real / fuga de datos). Veredicto de los dos: APROBAR-CON-CAMBIOS. 16 objeciones, todas aceptadas: 13 aplicadas al PRP, 2 convertidas en gate del operador, 1 resuelta por otra. Registro completo: §15 del PRP.

## Decisiones (append-only)

- Ver `C:\OPS\_VelOS\proyectos\tarjetica\plan\DECISIONES.md`.

## Cola de revisión / merge

- ✅ `tarjetica`: los 3 commits de la Ola 1 están en `origin/main` del repo público.
- ✅ La bitácora vivió antes en un repositorio privado y se movió a este repo el 2026-09-10.
  El `main` local se reapuntó a `origin/main` para no dejarlo divergido.

## Aprendizajes de la Ola 1 (van al cerebro de OPS, no se quedan solo aquí)

- **`z.string().url()` de Zod 4 acepta `javascript:alert(1)`.** Lo cazó un test, no la lectura del
  código. En una app que pinta esos valores como `href`, y cuya tarjeta la abre un tercero, eso es
  ejecución de código en el teléfono ajeno. Arreglado con un refinamiento que exige `http:`/`https:`.
- **Una CSP correcta puede tumbar la app sin que ninguna cabecera lo delate.** Caso testigo de esta
  ola: 22 asserts de header en verde y cero hidratación. El assert que faltaba no era sobre la CSP,
  era sobre lo que la CSP DEJA PASAR, y solo se ve en el HTML servido o en un navegador real.
- **Next 16 declaró obsoleta la convención `middleware.ts`**, ahora es `proxy.ts` con export por
  defecto. El build lo avisa pero no falla.
- **`eslint-config-next` 16 revienta con `FlatCompat`** (`Converting circular structure to JSON`): ya
  exporta flat config, se importa directo de `eslint-config-next/core-web-vitals` y `/typescript`.
- **pnpm 11 no lee `onlyBuiltDependencies`**, usa un mapa `allowBuilds:` en `pnpm-workspace.yaml`.
  Sin eso, `sharp` y `esbuild` se quedan sin compilar y el aviso se ve como un error de instalación.
- **`spawn` de un `.cmd` sin shell tira `EINVAL` en Windows** con Node 24 (rompió el script de
  verificación al lanzar `pnpm.cmd`). Se lanza el binario con `process.execPath` en su lugar.
