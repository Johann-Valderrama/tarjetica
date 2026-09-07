# Tarjetica

Tu tarjeta de presentación digital. La llenas una vez en tu teléfono, y la regalas como un QR que la
otra persona guarda en sus contactos, o como una imagen que le mandas por WhatsApp.

> **No guardamos tus datos en ningún servidor.**

Sin cuenta, sin registro y sin base de datos: tu tarjeta vive en tu navegador. Este proyecto no tiene
backend, así que no hay ningún lugar donde podamos ver, guardar ni perder lo que escribes.

## Qué hace

- Llenas tus datos (nombre, cargo, empresa, teléfonos, correo, redes, foto) en un formulario.
- Muestras un **QR de vCard**: quien lo escanea guarda tu contacto sin descargar nada.
- Guardas la tarjeta como **imagen `.jpeg`** para mandarla por WhatsApp o publicarla.
- Descargas tu contacto como archivo **`.vcf`**.
- Opcionalmente generas un **link compartible**, que lleva los datos dentro de la propia URL.
- Está en **español (es-CO) e inglés**. El idioma sigue al navegador de quien abre; en la home y en
  el editor se puede cambiar a mano.

## Lo que hay que saber antes de usarla

Son consecuencias directas de no tener servidor, y se dicen aquí y no en una nota al pie:

- **Tu tarjeta vive en este navegador y en este equipo.** Si borras los datos del sitio, cambias de
  teléfono o abres la app en otro navegador, la pierdes: no hay cuenta desde donde recuperarla. La
  imagen `.jpeg` que guardes es tu respaldo.
- **El link compartible no se puede desactivar.** No hay servidor donde borrarlo: lo que repartas
  queda vivo. Está apagado por defecto, y editar tu tarjeta genera un link nuevo, no actualiza el viejo.
- **Necesitas señal la primera vez** que abres la app. Todavía no funciona sin conexión.
- **Es para TU propia tarjeta.** Si haces la de otra persona, sus datos terminan en tu teléfono y en
  las copias de seguridad de tu teléfono.

## Qué manda a la red

Casi nada, y se dice completo porque es la promesa del producto:

- El QR, la imagen, el `.vcf` y el link se generan **en tu navegador**. No hay ninguna petición a un
  dominio ajeno en ninguna de las cuatro pantallas, y hay una prueba automática que lo mide.
- La app manda **un contador anónimo** al propio dominio, sin cuerpo, cuando se abre la home y la
  primera vez que una tarjeta queda lista en este dispositivo. No lleva ni un campo de tu tarjeta,
  ni un identificador, ni nada que distinga a una persona de otra, y **nunca se dispara en las
  pantallas que muestran una tarjeta**.
- Para agentes y modelos: `/llms.txt` describe qué hace la herramienta, qué no hace y sus tres
  límites. La home lleva datos estructurados (JSON-LD) que describen **la aplicación**, jamás la
  tarjeta de ningún usuario.

## Estado

Funcional. Se armó por olas: modelo y candados de seguridad, formulario con guardado local, vista de
la tarjeta, QR y vCard en el cliente, exportación a `.jpeg`, link compartible opcional, y por último
idiomas, puerta agéntica y el barrido final de superficie. Falta el despliegue público.

## Cómo correrlo

```bash
pnpm install
pnpm dev
```

Otros comandos: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test`, `pnpm verify:headers`.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 3.4, Zod. Sin base de datos, sin autenticación y sin
llamadas a servicios de terceros: la CSP del proyecto arranca en `default-src 'self'`, así que una
dependencia que intente hablar con un dominio ajeno la bloquea el navegador.

## Diseño y decisiones

El documento que gobierna esta construcción es el **PRP-TD-001 · Tarjeta de presentación digital**,
que vive en el repositorio privado de trabajo de su autor. Ahí están las decisiones cerradas (por qué
no hay servidor, por qué un solo QR y no dos, por qué la foto nunca entra al link) con sus mediciones.

## Licencia

[MIT](LICENSE) © 2026 Johann Valderrama.
