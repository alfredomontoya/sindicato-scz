import { describe, expect, it } from 'vitest'
import {
  anulacionSchema,
  aporteSchema,
} from './aporteSchema'
import {
  fechaInputADate,
  formatearNumeroRecibo,
  normalizarMonto,
} from '../services/aporteService'

const base = {
  personaId: 'abc123',
  fecha: '2026-01-15',
  monto: 150.5,
  concepto: 'Aporte voluntario',
}

describe('aporteSchema', () => {
  it('acepta un aporte válido', () => {
    expect(aporteSchema.safeParse(base).success).toBe(true)
  })

  it('rechaza sin persona', () => {
    expect(
      aporteSchema.safeParse({ ...base, personaId: '' }).success,
    ).toBe(false)
  })

  it('rechaza monto cero, negativo o con más de dos decimales', () => {
    expect(aporteSchema.safeParse({ ...base, monto: 0 }).success).toBe(false)
    expect(aporteSchema.safeParse({ ...base, monto: -10 }).success).toBe(
      false,
    )
    expect(aporteSchema.safeParse({ ...base, monto: 10.123 }).success).toBe(
      false,
    )
  })

  it('rechaza fecha futura y formato inválido', () => {
    expect(aporteSchema.safeParse({ ...base, fecha: '2999-01-01' }).success).toBe(
      false,
    )
    expect(aporteSchema.safeParse({ ...base, fecha: '15/01/2026' }).success).toBe(
      false,
    )
  })
})

describe('anulacionSchema', () => {
  it('exige motivo de al menos 3 caracteres', () => {
    expect(anulacionSchema.safeParse({ motivo: '' }).success).toBe(false)
    expect(anulacionSchema.safeParse({ motivo: 'ok' }).success).toBe(false)
    expect(
      anulacionSchema.safeParse({ motivo: 'Monto duplicado' }).success,
    ).toBe(true)
  })
})

describe('formatearNumeroRecibo', () => {
  it('rellena a 6 dígitos', () => {
    expect(formatearNumeroRecibo(1)).toBe('000001')
    expect(formatearNumeroRecibo(150)).toBe('000150')
  })
})

describe('fechaInputADate', () => {
  it('convierte yyyy-MM-dd a Date local', () => {
    const d = fechaInputADate('2026-03-10')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(2)
    expect(d.getDate()).toBe(10)
  })
})

describe('normalizarMonto', () => {
  it('acepta montos válidos', () => {
    expect(normalizarMonto(150.5)).toBe(150.5)
  })

  it('rechaza cero, negativos e infinitos', () => {
    expect(() => normalizarMonto(0)).toThrow()
    expect(() => normalizarMonto(-10)).toThrow()
    expect(() => normalizarMonto(Number.NaN)).toThrow()
    expect(() => normalizarMonto(Number.POSITIVE_INFINITY)).toThrow()
  })
})
