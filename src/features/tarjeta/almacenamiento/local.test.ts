import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  borrarTodo,
  CLAVES,
  guardarFoto,
  guardarTarjeta,
  leerFoto,
  leerTarjeta,
  leerTarjetaDetallado,
  VERSION_ALMACEN,
} from '@/features/tarjeta/almacenamiento/local'

/** Doble minimo de `Storage`. No se usa jsdom: lo que se prueba es el manejo del fallo, no el DOM. */
function almacenFalso(inicial: Record<string, string> = {}) {
  const datos = new Map(Object.entries(inicial))
  return {
    getItem: (k: string) => datos.get(k) ?? null,
    setItem: (k: string, v: string) => void datos.set(k, v),
    removeItem: (k: string) => void datos.delete(k),
    clear: () => datos.clear(),
    key: (i: number) => [...datos.keys()][i] ?? null,
    get length() {
      return datos.size
    },
    _datos: datos,
  }
}

function instalar(almacen: unknown) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: almacen,
    configurable: true,
    writable: true,
  })
}

afterEach(() => {
  // @ts-expect-error se quita el doble entre pruebas
  delete globalThis.localStorage
  vi.restoreAllMocks()
})

describe('almacenamiento local (unidad 1d)', () => {
  it('guarda y vuelve a leer la misma tarjeta', () => {
    instalar(almacenFalso())
    expect(guardarTarjeta({ n: 'Johann', co: 'j@example.com' })).toBe(true)
    expect(leerTarjeta()).toEqual({ n: 'Johann', co: 'j@example.com' })
  })

  it('sin nada guardado devuelve borrador vacio, no lanza', () => {
    instalar(almacenFalso())
    expect(leerTarjeta()).toEqual({})
    expect(leerTarjetaDetallado().motivo).toBe('sin-datos')
  })

  it('con JSON corrupto devuelve borrador vacio en vez de tumbar la app', () => {
    instalar(almacenFalso({ [CLAVES.tarjeta]: '{esto no es json' }))
    expect(leerTarjeta()).toEqual({})
    expect(leerTarjetaDetallado().motivo).toBe('json-invalido')
  })

  it('con una version vieja descarta el dato en vez de adivinar su forma', () => {
    instalar(almacenFalso({ [CLAVES.tarjeta]: JSON.stringify({ v: 0, d: { n: 'Johann' } }) }))
    expect(leerTarjeta()).toEqual({})
    expect(leerTarjetaDetallado().motivo).toBe('version-desconocida')
  })

  it('con datos que ya no cumplen el contrato devuelve borrador vacio', () => {
    const guardado = JSON.stringify({ v: VERSION_ALMACEN, d: { n: 'Johann', campoQueYaNoExiste: 1 } })
    instalar(almacenFalso({ [CLAVES.tarjeta]: guardado }))
    expect(leerTarjeta()).toEqual({})
    expect(leerTarjetaDetallado().motivo).toBe('datos-invalidos')
  })

  it('si localStorage LANZA al leer, la app sigue de pie', () => {
    instalar({
      getItem: () => {
        throw new Error('SecurityError: almacenamiento bloqueado')
      },
      setItem: () => {},
      removeItem: () => {},
    })
    expect(() => leerTarjeta()).not.toThrow()
    expect(leerTarjeta()).toEqual({})
    expect(leerTarjetaDetallado().motivo).toBe('almacen-no-disponible')
  })

  it('si localStorage LANZA al escribir, devuelve false para poder avisar', () => {
    instalar({
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => {},
    })
    expect(guardarTarjeta({ n: 'Johann' })).toBe(false)
  })

  it('sin localStorage (SSR, modo privado extremo) no lanza y no guarda', () => {
    instalar(undefined)
    expect(leerTarjeta()).toEqual({})
    expect(guardarTarjeta({ n: 'Johann' })).toBe(false)
    expect(borrarTodo()).toBe(false)
  })

  it('no guarda un borrador con una clave desconocida', () => {
    instalar(almacenFalso())
    // @ts-expect-error se prueba justo el caso que el tipo prohibe
    expect(guardarTarjeta({ n: 'Johann', colada: 1 })).toBe(false)
  })

  it('la foto vive en su propia clave, aparte de la tarjeta', () => {
    const almacen = almacenFalso()
    instalar(almacen)
    guardarTarjeta({ n: 'Johann' })
    guardarFoto({ dataUrl: 'data:image/jpeg;base64,AAAA' })
    expect(leerFoto()).toEqual({ dataUrl: 'data:image/jpeg;base64,AAAA' })
    expect(almacen._datos.get(CLAVES.tarjeta)).not.toContain('data:image/jpeg')
  })

  it('borrar deja las claves SIN RASTRO, no en blanco', () => {
    const almacen = almacenFalso()
    instalar(almacen)
    guardarTarjeta({ n: 'Johann' })
    guardarFoto({ dataUrl: 'data:image/jpeg;base64,AAAA' })
    expect(borrarTodo()).toBe(true)
    expect(almacen.getItem(CLAVES.tarjeta)).toBeNull()
    expect(almacen.getItem(CLAVES.foto)).toBeNull()
    expect(almacen.length).toBe(0)
    expect(leerTarjeta()).toEqual({})
    expect(leerFoto()).toBeNull()
  })
})
