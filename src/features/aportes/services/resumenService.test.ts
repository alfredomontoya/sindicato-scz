import { describe, expect, it } from 'vitest'
import { sumarMontos } from './resumenService'

describe('sumarMontos', () => {
  it('suma sin errores de punto flotante', () => {
    expect(sumarMontos([0.1, 0.2])).toBe(0.3)
    expect(sumarMontos([150.5, 75.25, 100])).toBe(325.75)
  })

  it('lista vacía suma cero', () => {
    expect(sumarMontos([])).toBe(0)
  })
})
