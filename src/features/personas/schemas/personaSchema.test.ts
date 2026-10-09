import { describe, expect, it } from 'vitest'
import { personaSchema } from './personaSchema'

describe('personaSchema', () => {
  it('acepta una persona válida', () => {
    const result = personaSchema.safeParse({
      nombre: 'María Pérez',
      ci: '4821356',
      direccion: 'Av. Siempre Viva 123',
      telefono: '77712345',
      estado: true,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza nombre muy corto', () => {
    const result = personaSchema.safeParse({
      nombre: 'A',
      ci: '4821356',
      estado: true,
    })
    expect(result.success).toBe(false)
  })

  it('acepta campos opcionales ausentes', () => {
    const result = personaSchema.safeParse({
      nombre: 'Juan López',
      ci: 'AB1234',
      estado: false,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza CI con espacios, símbolos o muy corto', () => {
    expect(
      personaSchema.safeParse({ nombre: 'Juan López', ci: '12 34', estado: true })
        .success,
    ).toBe(false)
    expect(
      personaSchema.safeParse({ nombre: 'Juan López', ci: 'AB-12', estado: true })
        .success,
    ).toBe(false)
    expect(
      personaSchema.safeParse({ nombre: 'Juan López', ci: '12', estado: true })
        .success,
    ).toBe(false)
  })
})
