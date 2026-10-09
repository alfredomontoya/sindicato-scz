import { describe, expect, it } from 'vitest'
import { normalizarCi, toNombreBusqueda } from './personaService'

describe('toNombreBusqueda', () => {
  it('normaliza a minúsculas sin tildes', () => {
    expect(toNombreBusqueda('María Pérez')).toBe('maria perez')
  })

  it('recorta espacios extra en los extremos', () => {
    expect(toNombreBusqueda('  Juan  ')).toBe('juan')
  })

  it('deja cadena vacía como vacía', () => {
    expect(toNombreBusqueda('   ')).toBe('')
  })
})

describe('normalizarCi', () => {
  it('normaliza a mayúsculas sin espacios', () => {
    expect(normalizarCi('  ab1234 ')).toBe('AB1234')
  })

  it('rechaza símbolos, espacios internos o longitud inválida', () => {
    expect(() => normalizarCi('AB 12')).toThrow()
    expect(() => normalizarCi('AB-12')).toThrow()
    expect(() => normalizarCi('12')).toThrow()
    expect(() => normalizarCi('')).toThrow()
  })
})
