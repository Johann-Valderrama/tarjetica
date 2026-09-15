# PRP-TD-002 · Cuentas, foto alojada y enlace revocable · BORRADOR

> **Estado: BORRADOR superficial.** Escrito el 2026-09-15 como unidad U8 de la ola 1 para dejar
> planteada la ola 2, no para ejecutarla. No diseña autenticación ni políticas de acceso: cuando se
> ejecute, ese diseño lo hace un modelo de contratos y migraciones (Opus), con debate adversarial
> antes de escribir una línea, porque reabre la decisión central del producto (D1).

## 1. Qué pide la ola 2 (alcance declarado por el dueño el 2026-09-14)

| Capacidad | Qué cambia para la persona |
|---|---|
| Login y cuentas | Su tarjeta deja de vivir solo en un navegador: la recupera desde otro equipo. |
| Foto y logo alojados | Las imágenes viven en almacenamiento remoto, no en `localStorage`. |
| Foto visible al abrir el enlace | Quien recibe el enlace ve la foto (hoy no: G5, la foto nunca viaja en el fragmento). |
| Miniatura con foto al compartir la URL | WhatsApp y LinkedIn muestran una vista previa con nombre y foto. |
| Enlace corto, cifrado y revocable | `tarjetica.app/c/<id>#<clave>` (~60 caracteres) en vez de `/t#<payload>`. El servidor guarda solo la tarjeta cifrada; la clave va en el fragmento y nunca le llega. Se puede apagar y editar sin repartir uno nuevo. Decidido por Johann el 2026-09-15. |
| Eliminar cuenta | Borra tarjeta, imágenes y enlaces; los enlaces repartidos dejan de resolver. |
| Backend | Base gestionada: **Supabase o Neon, se evalúa al abrir la ola 2** (pedido de Johann, 2026-09-15). |

## 2. Decisiones que esta ola REABRE (no se pueden esquivar)

- **D1 (los datos viven SOLO en el navegador).** Es la mitigación central de privacidad, no una
  limitación. Con cuentas y almacenamiento hay una base de datos con información personal de
  terceros y alguien pasa a ser Responsable del tratamiento. Reabrir D1 es reabrir el producto.
- **D5 (el enlace es opcional, apagado por defecto y lleva los datos adentro).** Un enlace corto
  con servidor invierte la lógica: los datos ya no viajan en la URL, pero existe un registro que
  resuelve la URL. Cambia qué se promete al generarlo (revocable, editable) y qué se advierte
  (queda en el historial igual; ahora además queda en el servidor).
- **El aviso "No guardamos tus datos en ningún servidor" (G2).** Deja de ser cierto en cuanto
  exista una cuenta. Hay que decidir si la ola 2 es un modo aparte ("Tarjetica con cuenta") que
  convive con el modo sin servidor, o si reemplaza la promesa entera. El README, `llms.txt`, el
  JSON-LD y la portada la repiten.
- **La meta original** ("que cualquier persona pueda crear y regalar su tarjeta, sin cuenta y sin
  servidor, para reemplazar el papel"). Si la ola 2 exige cuenta, la meta cambia; si la cuenta es
  opcional, la meta se conserva y la ola 2 es una capa encima. Recomendación provisional del
  director: **capa opcional**, con el modo actual intacto como camino por defecto.

## 3. Obligaciones de datos personales en Colombia (pregunta abierta para asesoría)

Con base de datos, aplica la Ley 1581 de 2012 y el Decreto 1377 de 2013 (tratamiento de datos
personales). Preguntas que un abogado tiene que responder antes de construir, no después:

1. ¿Quién es el Responsable del tratamiento: la persona natural titular del repo (D4) o una
   persona jurídica? Cambia registro, contacto de habeas data y quién firma la política.
2. ¿Hace falta registrar la base en el Registro Nacional de Bases de Datos (RNBD) de la SIC?
   Depende de umbrales de activos y de si el Responsable es persona natural.
3. Política de tratamiento y aviso de privacidad: texto, dónde se muestra, cómo se acepta.
4. Autorización del titular: la persona crea SU tarjeta (consentimiento propio), pero la app ya
   advierte que alguien puede crear la de otro. ¿Basta la casilla actual o hace falta más?
5. Datos de terceros que no usan la app: quien abre un enlace no crea cuenta; ¿qué se registra de
   esa visita (hoy: nada, un ping anónimo sin cuerpo)? Mantener ese "nada" es una decisión.
6. Transferencia internacional: Supabase aloja fuera de Colombia. ¿Qué exige la ley para eso?
7. Derechos del titular (consultar, actualizar, suprimir): "Eliminar cuenta" cubre suprimir; hace
   falta un canal y un plazo de respuesta.
8. Menores de edad, datos sensibles en la descripción libre (art. 5): hoy hay un aviso pegado al
   campo; con servidor, ¿se filtra, se advierte más, o se prohíbe?

Nada de lo anterior está resuelto aquí; es la lista para la asesoría.

## 4. Costo recurrente estimado (orden de magnitud, sin verificar precios hoy)

| Rubro | Estimación mensual | Nota |
|---|---|---|
| Supabase | 0 USD en plan gratuito mientras el uso sea bajo; ~25 USD al pasar a plan de pago | El plan gratuito pausa proyectos inactivos; una tarjeta "viva" no puede pausarse. Verificar límites vigentes antes de decidir. |
| Vercel | 0 USD en plan personal | Ya se usa. |
| Dominio propio | ~1 USD (unos 12 USD al año) | Un enlace corto necesita un dominio estable y propio; `vercel.app` no sirve para "para siempre". |
| Correo transaccional (login por enlace mágico) | 0 USD en el proveedor de Auth hasta cierto volumen | Depende del proveedor elegido. |
| Tiempo de operación | horas del dueño | Respaldos, respuestas de habeas data, incidentes. Es el costo que no aparece en ninguna factura. |

Total estimado: **entre 1 y 30 USD al mes** más tiempo de operación, con precios a verificar en
el momento de ejecutar.

## 5. Preguntas abiertas (para el gate de la ola 2)

1. ¿Capa opcional sobre el modo sin servidor, o reemplazo? (Recomendación provisional: opcional.)
2. ¿Login por enlace mágico al correo, OAuth (Google), o ambos? (No se diseña aquí.)
3. ¿La foto viaja en la vista previa del enlace (Open Graph) generada en el servidor? Eso implica
   render en servidor con datos personales: `next/og` está PROHIBIDO por decisión anterior; la ola
   2 tendría que reabrir esa prohibición o generar la miniatura al guardar, no al servir.
4. ¿Qué pasa con los enlaces `/t#…` ya repartidos? Siguen funcionando (no hay servidor que los
   apague); se documenta como camino heredado.
5. ¿Eliminar cuenta borra también las miniaturas cacheadas por WhatsApp o LinkedIn? No: esas
   copias viven fuera. Hay que decirlo en el copy de eliminar cuenta.
6. ¿Analítica? Hoy es un ping anónimo sin cuerpo. Con cuentas, la tentación de medir por usuario
   aparece; decidir antes que no.
7. ¿Se mantiene MIT y repo público con un backend que exige claves? Sí es posible (las claves van
   en variables de entorno), pero el despliegue deja de ser "clonar y correr".

## 6. Qué NO entra en la ola 2 (por decisión, no por olvido)

- Cobros, planes de pago, marca blanca.
- Varias tarjetas por cuenta (una persona, una tarjeta) hasta que exista demanda.
- App móvil nativa o PWA con caché sin conexión (G7 sigue vigente).

## 7. Cómo se ejecutaría (solo el esqueleto)

1. Debate adversarial sobre D1 y sobre "capa opcional o reemplazo", con el dueño decidiendo.
2. Asesoría legal con la lista de la sección 3; sin respuesta, no se construye la base de datos.
3. Contrato de datos y migración diseñados por Opus; RLS y políticas de acceso revisadas por dos
   lentes ortogonales (Sonnet y Haiku), y por un modelo de otra familia si el runtime lo permite.
4. Construcción por unidades pequeñas con commit por unidad, igual que las olas anteriores.
