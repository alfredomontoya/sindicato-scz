import { describe, expect, it } from 'vitest'
import { formatearNombre } from './nombres'

describe('formatearNombre', () => {
  it('capitaliza cada palabra y conserva tildes', () => {
    expect(formatearNombre('CRISTIAN MARCELO PIZARROSO')).toBe(
      'Cristian Marcelo Pizarroso',
    )
    expect(formatearNombre('MARÍA ELENA LÓPEZ')).toBe('María Elena López')
  })

  it('normaliza espacios y guiones', () => {
    expect(formatearNombre('  juan   pérez  ')).toBe('Juan Pérez')
    expect(formatearNombre('ANA-MARIA TORRES')).toBe('Ana-Maria Torres')
  })

  it('deja cadena vacía como vacía', () => {
    expect(formatearNombre('')).toBe('')
  })
})
