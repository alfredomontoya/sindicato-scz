import { describe, expect, it } from 'vitest'
import {
  emailNuevoUsuario,
  usuarioCreateSchema,
  usuarioEditSchema,
} from './usuarioSchema'

describe('usuarioCreateSchema', () => {
  it('acepta un usuario válido', () => {
    expect(
      usuarioCreateSchema.safeParse({
        nombre: 'Ana Torres',
        usuario: 'ana.torres',
        password: 'secreta123',
        rol: 'registro',
        estado: true,
      }).success,
    ).toBe(true)
  })

  it('rechaza usuario con espacios y contraseña corta', () => {
    expect(
      usuarioCreateSchema.safeParse({
        nombre: 'Ana Torres',
        usuario: 'ana torres',
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
        usuario: 'ana.torres',
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

describe('emailNuevoUsuario', () => {
  it('compone el correo institucional', () => {
    expect(emailNuevoUsuario('ana.torres')).toBe('ana.torres@sindicato.com')
  })
})
