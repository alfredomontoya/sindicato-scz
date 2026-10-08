import { describe, expect, it } from 'vitest'
import { personaSchema } from './personaSchema'

describe('personaSchema', () => {
  it('acepta una persona válida', () => {
    const result = personaSchema.safeParse({
      nombre: 'María Pérez',
      direccion: 'Av. Siempre Viva 123',
      telefono: '77712345',
      estado: true,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza nombre muy corto', () => {
    const result = personaSchema.safeParse({ nombre: 'A', estado: true })
    expect(result.success).toBe(false)
  })

  it('acepta campos opcionales ausentes', () => {
    const result = personaSchema.safeParse({ nombre: 'Juan López', estado: false })
    expect(result.success).toBe(true)
  })
})
