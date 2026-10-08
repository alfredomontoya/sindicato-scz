import { describe, expect, it } from 'vitest'
import { usuarioCreateSchema, usuarioEditSchema } from './usuarioSchema'

describe('usuarioCreateSchema', () => {
  it('acepta un usuario válido', () => {
    expect(
      usuarioCreateSchema.safeParse({
        nombre: 'Ana Torres',
        email: 'ana@sindicato.bo',
        password: 'secreta123',
        rol: 'registro',
        estado: true,
      }).success,
    ).toBe(true)
  })

  it('rechaza email inválido y contraseña corta', () => {
    expect(
      usuarioCreateSchema.safeParse({
        nombre: 'Ana Torres',
        email: 'no-email',
        password: '123',
        rol: 'registro',
        estado: true,
      }).success,
    ).toBe(false)
  })

  it('rechaza rol desconocido', () => {
    expect(
      usuarioCreateSchema.safeParse({
        nombre: 'Ana Torres',
        email: 'ana@sindicato.bo',
        password: 'secreta123',
        rol: 'superadmin',
        estado: true,
      }).success,
    ).toBe(false)
  })
})

describe('usuarioEditSchema', () => {
  it('acepta edición válida sin contraseña', () => {
    expect(
      usuarioEditSchema.safeParse({
        nombre: 'Ana Torres',
        rol: 'consulta',
        estado: false,
      }).success,
    ).toBe(true)
  })
})
