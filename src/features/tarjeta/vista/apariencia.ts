import type { Tema } from '@/features/tarjeta/vista/tarjeta'

/**
 * Lee el tema y el color de marca de una tarjeta de forma TOLERANTE (ola 1, U4).
 *
 * Las claves `tm` (tema) y `cm` (color de marca) son opcionales en el contrato: un enlace creado
 * antes de esta ola no las trae, y un payload manipulado podria traer cualquier cosa. Aqui se
 * decide una sola vez que "ausente o invalido" significa el oscuro de siempre y el acento de la
 * app, para que ninguna pantalla tenga que repetir esa regla.
 *
 * Se lee por indice y no por el tipo `Tarjeta` a proposito: asi este archivo no depende de que el
 * contrato ya declare las claves, y si el contrato las declara, sigue valiendo igual.
 */
export function apariencia(tarjeta: object): { tema: Tema; colorMarca?: string } {
  const datos = tarjeta as Record<string, unknown>
  const tema: Tema = datos.tm === 'claro' ? 'claro' : 'oscuro'
  const cm = datos.cm
  const colorMarca = typeof cm === 'string' && /^#[0-9a-f]{6}$/i.test(cm) ? cm : undefined
  return { tema, colorMarca }
}
