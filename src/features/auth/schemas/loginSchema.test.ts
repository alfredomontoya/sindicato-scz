import { describe, expect, it } from 'vitest'
import { loginSchema } from './loginSchema'

describe('loginSchema', () => {
  it('acepta credenciales válidas', () => {
    const result = loginSchema.safeParse({
      email: 'tesoreria@sindicato.bo',
      password: 'secreta123',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza email inválido o vacío', () => {
    expect(
      loginSchema.safeParse({ email: 'no-es-email', password: 'secreta123' })
        .success,
    ).toBe(false)
    expect(
      loginSchema.safeParse({ email: '', password: 'secreta123' }).success,
    ).toBe(false)
  })

  it('rechaza contraseña vacía', () => {
    expect(
      loginSchema.safeParse({ email: 'a@b.bo', password: '' }).success,
    ).toBe(false)
  })
})
