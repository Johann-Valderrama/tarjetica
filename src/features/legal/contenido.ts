/**
 * Fuente unica del Aviso de Privacidad / Politica de Tratamiento (unidad legal, 2026-09-15).
 *
 * Vive como constante de TypeScript, no como archivo `.md` leido con `fs` en runtime, a proposito:
 * un `fs.readFileSync` sobre una ruta fuera de `src/` es fragil en el tracing de archivos de
 * Vercel (puede quedar fuera del bundle de la funcion serverless sin que nada lo avise en build).
 * Una constante importada normalmente no tiene ese riesgo y no agrega ninguna dependencia nueva.
 *
 * Es la UNICA copia: `src/app/privacidad/page.tsx` la renderiza con un parser minimo
 * (`markdown-simple.tsx`) que cubre solo el subconjunto de Markdown que este texto usa. Revisado
 * por tres lentes (protección de datos Colombia, privacidad internacional, consumidor) — ver
 * `PROGRESS.md` / `DECISIONES.md` de esta unidad para el detalle de cada correccion.
 */
export const AVISO_PRIVACIDAD_MD = `# Política de Tratamiento de Datos Personales y Términos de Uso de Tarjetica

**Última actualización: 15 de septiembre de 2026**

Este documento cumple dos funciones a la vez, como lo exige la Ley 1581 de 2012: es la **Política de Tratamiento de Datos Personales** (el documento completo, siempre disponible) y también sirve como el **Aviso de Privacidad** (el resumen que ves antes de usar la herramienta). Van juntos en una sola página porque Tarjetica es un proyecto pequeño y separarlos en dos documentos no le agregaría claridad a nadie; el contenido cubre lo que la norma exige para ambos.

Léelo con calma: es corto a propósito, porque Tarjetica está diseñada de una forma que hace innecesaria la mayoría de la letra pequeña habitual.

**Finalidad del tratamiento, en una frase:** tus datos se tratan únicamente para generar tu tarjeta de presentación digital y, si tú decides activarlos, el código QR, la imagen y el enlace que tú mismo compartes. No se usan para ningún otro fin.

La idea de fondo es simple: **tu tarjeta vive en tu navegador, no en nuestros servidores.** Eso tiene ventajas grandes y también limitaciones reales, y aquí te contamos las dos.

---

## 1. Quién responde por esto

Tarjetica es un proyecto personal y de código abierto (licencia MIT), no una empresa.

- **Responsable del tratamiento de datos:** Johann Valderrama, persona natural, actuando a título personal como autor y operador del proyecto Tarjetica.
- **No existe una sociedad, empresa registrada ni equipo detrás.** Es un desarrollador operando un proyecto propio. Por no ser persona jurídica ni tener bases de datos que administrar, no está dentro del universo obligado a inscribirse en el Registro Nacional de Bases de Datos (RNBD) de la SIC. [Probable, sujeto a verificación puntual si el proyecto cambia de naturaleza].
- **Correo de contacto para cualquier asunto de privacidad, derechos o reclamos:** johann09+tarjetica@gmail.com
- **Código fuente público:** github.com/Johann-Valderrama/tarjetica (puedes revisar por ti mismo todo lo que este documento afirma).

Ese último punto importa: como el código es abierto, no tienes que creernos por fe. Todo lo que decimos aquí se puede verificar leyendo el repositorio.

---

## 2. Qué datos existen y dónde viven de verdad

Esta es la parte más importante del documento.

### 2.1 Los datos de tu tarjeta

Cuando llenas tu tarjeta escribes cosas como tu nombre, tu rol, tu empresa, tus teléfonos, tu correo, tus redes sociales, enlaces, tu ciudad y una foto.

**Todo eso se guarda únicamente en el almacenamiento local (\`localStorage\`) del navegador que estás usando en ese momento.**

En términos prácticos:

- **No hay base de datos.** No existe ningún servidor donde queden guardados tu nombre ni tu teléfono.
- **No hay cuenta ni registro.** No creas usuario, no pones contraseña, no hay perfil.
- **No hay backend que reciba tus datos.** Lo que escribes no se envía a ninguna parte cuando lo escribes.
- **Nosotros no podemos ver tu tarjeta.** No es una promesa de buena voluntad: es que técnicamente no existe copia alguna del lado nuestro.

Consecuencias de esto que conviene que tengas presentes:

- Si limpias los datos del sitio en tu navegador, **tu tarjeta desaparece y no hay forma de recuperarla.** No tenemos respaldo.
- Si abres Tarjetica en otro dispositivo o en otro navegador, **no vas a ver tu tarjeta**, porque quedó en el navegador donde la creaste.
- Si usas modo incógnito, lo más probable es que tu tarjeta se pierda al cerrar la ventana.

### 2.2 Tu foto

Si subes una foto:

- Se procesa **dentro de tu propio navegador**, no en un servidor. Se recorta y se comprime ahí mismo.
- Antes de guardarse, **se le eliminan los metadatos EXIF**, que es la información oculta que suelen traer las fotos y que puede incluir las coordenadas GPS del lugar donde se tomó. Esa información no se conserva.
- La foto **nunca viaja dentro del enlace compartible ni dentro del código QR.**
- La foto solo puede salir de tu dispositivo si tú decides exportarla: en la imagen \`.jpeg\` que descargas o en el archivo de contacto \`.vcf\` que guardas. Los dos archivos se generan localmente en tu equipo y eres tú quien decide si los compartes y con quién.

### 2.3 Cookies y analítica

- **No usamos cookies de rastreo.**
- **No hay herramientas de analítica de terceros** (ni Google Analytics, ni píxeles publicitarios, ni SDKs de medición).
- El único almacenamiento del navegador que usamos es el \`localStorage\` descrito arriba, y se usa exclusivamente para lo que es la función principal del producto: guardar tu propia tarjeta para que la vuelvas a encontrar cuando regreses.

Por eso no verás un banner de consentimiento de cookies. Bajo el criterio de almacenamiento "estrictamente necesario" que usa la normativa europea de privacidad electrónica (ePrivacy), un almacenamiento indispensable para prestar el servicio que el usuario pidió no requiere consentimiento previo. Si algún día agregáramos analítica u otro tipo de seguimiento, ese banner aparecería y este documento se actualizaría antes.

---

## 3. El enlace compartible: léelo antes de usarlo

Tarjetica puede generar un enlace para que compartas tu tarjeta con otras personas. **Es opcional y viene apagado por defecto.** Antes de generarlo tienes que confirmar que leíste una advertencia. Aquí está la versión completa de esa advertencia.

### 3.1 Cómo funciona técnicamente

Los datos de tu tarjeta se codifican dentro del **fragmento** de la dirección web, que es la parte que va después del símbolo \`#\` (por ejemplo, \`tarjetica.app/t#...\`). Por cómo están especificados los navegadores, esa parte de la dirección **nunca se envía al servidor**. Es decir: cuando alguien abre tu enlace, tu tarjeta se arma en el navegador de esa persona, y el servidor no recibe ni ve su contenido.

Suena bien, y lo es. Pero tiene un costo que debes entender.

### 3.2 Qué significa compartir ese enlace

1. **Es público y no tiene contraseña.** Cualquier persona que tenga el enlace puede ver la tarjeta completa. No hay control de acceso, no hay lista de invitados, no hay caducidad.
2. **No se puede desactivar después.** Como no hay servidor donde viva esa información, no hay ningún interruptor que podamos apagar ni ningún registro que podamos borrar. **Lo que compartiste queda vivo mientras alguien conserve el enlace.** No existe la opción de "revocar el link".
3. **Queda en el historial de quien lo abre.** Y si esa persona tiene activada la sincronización de su navegador (Chrome Sync, iCloud u otra), el enlace completo puede terminar copiado en los servidores de esa empresa, junto con el resto de su historial. Eso está fuera de nuestro alcance y del tuyo.
4. **La foto no viaja en el enlace.** Por razones de tamaño, la imagen no se incluye. Quien abra tu enlace verá tus datos, no tu foto.

### 3.3 Qué no controla Tarjetica

Una vez compartes el enlace, ni tú ni nosotros controlamos a dónde llega. Puede reenviarse, copiarse, publicarse o guardarse. Piensa en él como en una tarjeta de cartón que entregaste: no puedes pedir que se desintegre a distancia.

La recomendación honesta: **pon en la tarjeta solo información que estarías cómodo entregando a un desconocido en un evento.** Si un dato no lo pondrías en una tarjeta física que vas a repartir, tampoco lo pongas aquí.

---

## 4. La única información que sí llega a un servidor

Tarjetica envía un **conteo anónimo** de dos eventos, para saber si la herramienta se está usando:

- que alguien visitó la página de inicio, y
- que alguien creó una tarjeta.

Sobre ese conteo:

- Es un aviso sin contenido, enviado y olvidado (no espera respuesta ni devuelve nada).
- **No incluye ningún dato de tu tarjeta.** Ni tu nombre, ni tu correo, ni nada de lo que escribiste.
- El código **no guarda tu dirección IP, ni tu navegador, ni ningún identificador.** Solo escribe una línea que dice, en esencia, "ocurrió el evento X". Sin nombre, sin usuario, sin cuenta.
- No hay forma de vincular esos conteos con una persona.

### Y la parte honesta sobre el hosting

Toda petición que hace cualquier navegador a cualquier sitio web pasa por la infraestructura de quien aloja ese sitio. En nuestro caso, el proveedor de hosting (por ejemplo Vercel) puede conservar en sus propios registros técnicos de plataforma la dirección IP de origen durante un tiempo, como parte de su operación normal y de su seguridad.

Eso no es algo que Tarjetica haga a propósito ni algo que podamos apagar desde el código: pasa exactamente igual cuando visitas cualquier página de internet. Lo mencionamos porque preferimos que lo sepas a que suene a que "aquí no queda registro de nada en ninguna parte". Esos registros son del proveedor, se rigen por sus políticas, y nosotros no los consultamos ni construimos nada sobre ellos.

**Sobre esto, una precisión que la Ley 1581 exige mencionar:** el proveedor de hosting (Vercel) opera con infraestructura que puede estar fuera de Colombia, así que ese registro técnico de IP puede implicar una transferencia internacional de datos. La cubrimos bajo la causal de necesidad para la ejecución del servicio que tú mismo solicitas al abrir la página (Art. 26, literales b y f, del Decreto 1377 de 2013): no es una transferencia que hagamos por decisión propia ni con un tercero comercial, es la consecuencia inevitable de que cualquier página web funcione en internet.

---

## 5. Tu responsabilidad al crear tarjetas

Tarjetica es una herramienta, y como toda herramienta se puede usar bien o mal.

Antes de exportar la imagen, descargar el archivo \`.vcf\` o generar el enlace compartible, tienes que elegir una declaración obligatoria: **"es mi propia tarjeta"** o **"es de otra persona y tengo su autorización expresa"**. Si no eliges ninguna, esas acciones quedan bloqueadas.

Ahora, lo que esa declaración sí hace y lo que no:

- **Sí hace:** obligarte a detenerte un segundo y decir, de forma consciente, cuál de los dos casos es el tuyo.
- **No hace:** verificar nada. No podemos comprobar quién eres ni de quién son los datos que escribiste.

Hay además un caso de uso legítimo que la herramienta permite y que conviene nombrar: el **stand de evento**, donde alguien usa Tarjetica en un puesto para armarle la tarjeta a un visitante. Ahí, por diseño, es posible crear la tarjeta de otra persona. Es un riesgo residual conocido y preferimos decirlo antes que esconderlo.

Si creas la tarjeta de otra persona:

- Necesitas su autorización previa, expresa e informada para tratar sus datos personales. Es una exigencia de la ley colombiana, no un formalismo nuestro.
- **Tú eres el responsable de esos datos**, no Tarjetica. Tú respondes ante esa persona y ante la autoridad.
- Debes decirle para qué vas a usar sus datos y respetar sus derechos sobre ellos.

Esta declaración traslada la responsabilidad operativa a quien introduce los datos, pero no exime a Tarjetica de las obligaciones que la ley impone a quien diseña una herramienta que permite ese tratamiento. Como el producto no identifica usuarios ni deja rastro técnico de quién creó cada tarjeta, en la práctica la única evidencia de autorización es la que tú mismo obtuviste de la otra persona: consérvala si la pides.

Queda expresamente prohibido usar Tarjetica para suplantar la identidad de otra persona, para hacerte pasar por una empresa u organización a la que no representas, o para difundir datos de contacto de alguien sin su permiso.

---

## 6. Términos de uso de la herramienta

- **El código fuente se entrega "tal cual"**, sin garantías, bajo licencia MIT (ver \`LICENSE\`): eso te da derecho a usar, copiar y modificar el software. **El servicio que prestamos con ese código** se ofrece con las limitaciones descritas en este documento, sin que esto excluya las garantías mínimas de calidad e idoneidad que la ley colombiana reconoce a todo consumidor, aunque el servicio sea gratuito.
- **Tus datos personales no tienen nada que ver con la licencia del código.** El MIT le da libertad a otros de reusar el *software*; no te quita nada a ti sobre tus *datos*. Estos nunca se ceden, publican ni licencian: son tuyos, viven solo en tu navegador, y tú decides si los compartes y con quién.
- Puede dejar de estar disponible en cualquier momento, sin aviso previo. Como el proyecto es abierto, cualquiera puede ejecutarlo por su cuenta si eso ocurre.
- **Haz tus propias copias de lo que te importe.** Exporta tu imagen o tu \`.vcf\` si no quieres depender de que el navegador conserve el \`localStorage\`.
- El responsable no garantiza disponibilidad continua ni ausencia de errores. No responde por la pérdida de datos que solo existen en tu navegador (arquitectura local, sin respaldo en ningún servidor) ni por el uso que un tercero haga de un enlace que tú decidiste compartir voluntariamente, salvo que medie dolo o culpa grave del responsable, en los términos del artículo 63 del Código Civil colombiano.
- El uso de la herramienta implica la aceptación de este documento.

---

## 7. Tus derechos como titular de datos

Bajo la **Ley 1581 de 2012** de Colombia y sus normas reglamentarias (régimen vigilado por la Superintendencia de Industria y Comercio, SIC), como titular de tus datos personales tienes derecho a: conocer, actualizar y rectificar tus datos; solicitar prueba de la autorización otorgada; ser informado sobre el uso que se les ha dado; presentar quejas ante la SIC por infracciones a la ley; y revocar la autorización o solicitar la supresión de tus datos cuando proceda.

Aterrizados a cómo funciona Tarjetica, esos derechos se ejercen así:

**Conocer, actualizar y rectificar tus datos.**
Los tienes tú, en tu navegador, y los editas directamente en el editor de la tarjeta cuando quieras. No hace falta pedirnos nada: no hay intermediario.

**Suprimir tus datos.**
Como no guardamos tu tarjeta en ningún servidor, el borrado lo haces tú mismo, y es definitivo: usa el botón **"Borrar todo"** del editor, o limpia los datos del sitio desde la configuración de tu navegador. Cuando haces eso, no queda copia en ninguna parte, porque nunca la hubo.

**El caso del enlace ya compartido (importante).**
Si el dato que quieres retirar está en un **enlace que ya compartiste**, no podemos borrarlo, y esta es la razón: ese enlace no vive en ningún servidor nuestro, vive en el mensaje, el correo o la publicación donde lo pusiste, y en el historial de quien lo abrió. La única forma de retirarlo es **dejar de compartirlo** y **pedirle a quien lo recibió que lo elimine**. No tenemos un botón que pueda hacerlo por ti. Por eso la advertencia aparece antes de generar el enlace, y no después.

**Prueba de la autorización y uso de los datos.**
No recopilamos datos personales tuyos en ningún servidor, así que no existe una base de datos nuestra sobre la cual se te haya pedido autorización. Este documento es, en sí mismo, la información completa sobre el tratamiento.

**Presentar quejas.**
Puedes escribirnos primero a **johann09+tarjetica@gmail.com**. Respondemos consultas en **diez (10) días hábiles**, prorrogables cinco (5) días hábiles más, y reclamos en **quince (15) días hábiles**, prorrogables ocho (8) días hábiles más, en los términos del Decreto 1377 de 2013. Si no quedas conforme, puedes acudir a la **Superintendencia de Industria y Comercio (SIC)** de Colombia.

### Sobre el RGPD europeo y otras leyes fuera de Colombia

Tarjetica está operada desde Colombia y todo su contenido está en español, sin precios en euros ni ninguna mención a mercados de la Unión Europea: bajo el criterio del Art. 3(2) del Reglamento General de Protección de Datos (RGPD) y su Considerando 23, eso pesa en contra de considerar que la app "se dirige" al mercado europeo, incluso siendo gratuita y accesible desde cualquier país (la gratuidad no cambia este análisis; el RGPD aplica igual a servicios sin costo). Por eso no afirmamos que el RGPD nos sea aplicable.

Dicho esto, "no guardar datos en un servidor" reduce el riesgo pero no equivale automáticamente a "no hay tratamiento": si algún día esta app se dirigiera activamente al público europeo, quien decide cómo se codifican y procesan los datos (aunque sea dentro del navegador del usuario) puede seguir siendo responsable bajo el RGPD. Hoy ese escenario no aplica, y el mismo razonamiento de "no dirigido activamente" se extiende igual a la LGPD de Brasil y a la CCPA/CPRA de California. Si estás en cualquiera de esas jurisdicciones y tienes una solicitud sobre tus datos, escríbenos al mismo correo y la atenderemos con el mismo estándar que a cualquier persona en Colombia.

---

## 8. Menores de edad

Tarjetica es una herramienta de tarjetas de presentación profesionales y no está dirigida a niños. Si eres menor de edad, úsala solo con el acompañamiento de tu padre, madre o acudiente.

---

## 9. Cambios a este aviso

Si cambiamos algo relevante, actualizamos la fecha del encabezado y publicamos la nueva versión en esta misma página. Como el proyecto es de código abierto, el historial completo de cambios de este documento queda público y verificable en el repositorio de GitHub.

Si un cambio futuro implicara empezar a recolectar datos que hoy no recolectamos, se avisaría de forma visible dentro de la aplicación antes de aplicarlo, no solo en la letra pequeña.

---

## 10. Ley aplicable y jurisdicción

Este aviso y el uso de Tarjetica se rigen por las leyes de la **República de Colombia**, en particular la Ley 1581 de 2012, sus decretos reglamentarios y la Circular Única de la Superintendencia de Industria y Comercio.

Cualquier controversia se someterá a los jueces y tribunales competentes de Colombia.

---

## 11. Contacto

Para preguntas, solicitudes sobre tus datos, reportes de seguridad o reclamos:

**johann09+tarjetica@gmail.com**

Si encuentras algo en el código que contradiga lo que dice este documento, escríbenos. Ese es el tipo de reporte que más nos interesa recibir.
`
