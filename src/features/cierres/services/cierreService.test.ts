import { describe, expect, it } from 'vitest'
import {
  aplicarMovimientoCierre,
  docIdCierre,
} from './cierreService'

describe('docIdCierre', () => {
  it('formatea YYYY-MM con cero inicial', () => {
    expect(docIdCierre(2026, 1)).toBe('2026-01')
    expect(docIdCierre(2026, 10)).toBe('2026-10')
  })
})

describe('aplicarMovimientoCierre', () => {
  it('inicia desde cero cuando no hay registro', () => {
    expect(
      aplicarMovimientoCierre(null, { montoCentavos: 15050, esAnulacion: false }),
    ).toEqual({ total: 150.5, cantidad: 1, anulados: 0, totalAnulados: 0 })
  })

  it('acumula altas sin errores de punto flotante', () => {
    const base = { total: 0.1, cantidad: 1, anulados: 0, totalAnulados: 0 }
    const r = aplicarMovimientoCierre(base, { montoCentavos: 20, esAnulacion: false })
    expect(r.total).toBe(0.3)
    expect(r.cantidad).toBe(2)
  })

  it('la anulación resta de vigentes y suma a anulados', () => {
    const base = { total: 250.5, cantidad: 2, anulados: 0, totalAnulados: 0 }
    const r = aplicarMovimientoCierre(base, { montoCentavos: 10000, esAnulacion: true })
    expect(r).toEqual({ total: 150.5, cantidad: 1, anulados: 1, totalAnulados: 100 })
  })

  it('la cantidad nunca es negativa', () => {
    const r = aplicarMovimientoCierre(null, { montoCentavos: 100, esAnulacion: true })
    expect(r.cantidad).toBe(0)
  })
})
