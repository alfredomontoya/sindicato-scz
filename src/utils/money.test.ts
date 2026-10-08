import { describe, expect, it } from 'vitest'
import { montoALiteral } from './money'

describe('montoALiteral', () => {
  it('convierte 150.00', () => {
    expect(montoALiteral(150)).toBe('CIENTO CINCUENTA 00/100 BOLIVIANOS')
  })

  it('rechaza montos inválidos', () => {
    expect(() => montoALiteral(0)).toThrow()
    expect(() => montoALiteral(-10)).toThrow()
    expect(() => montoALiteral(Number.NaN)).toThrow()
  })
})
