import { describe, expect, it } from 'vitest'
import { loginSchema } from './loginSchema'

describe('loginSchema', () => {
  it('acepta usuario simple y correo completo', () => {
    expect(
      loginSchema.safeParse({ usuario: 'amontoya.jar', password: 'secreta123' })
        .success,
    ).toBe(true)
    expect(
      loginSchema.safeParse({
        usuario: 'tesoreria@sindicato.com',
        password: 'secreta123',
      }).success,
    ).toBe(true)
  })

  it('rechaza usuario vacío o con caracteres inválidos', () => {
    expect(
      loginSchema.safeParse({ usuario: '', password: 'secreta123' }).success,
    ).toBe(false)
    expect(
      loginSchema.safeParse({ usuario: 'ana torres', password: 'secreta123' })
        .success,
    ).toBe(false)
  })

  it('rechaza contraseña vacía', () => {
    expect(
      loginSchema.safeParse({ usuario: 'amontoya.jar', password: '' }).success,
    ).toBe(false)
  })
})
