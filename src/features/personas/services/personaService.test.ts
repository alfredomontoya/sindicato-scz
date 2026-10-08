import { describe, expect, it } from 'vitest'
import { toNombreBusqueda } from './personaService'

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
