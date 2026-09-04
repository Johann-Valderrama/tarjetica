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
- Opcionalmente generas un **link compartible**, que lleva los datos dentro de la propia URL.

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

## Estado

En construcción. La v1 se arma por olas; hoy está la fundación del repo (modelo de datos,
persistencia local y candados de seguridad).

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
