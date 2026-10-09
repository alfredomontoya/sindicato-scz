import { describe, expect, it } from 'vitest'
import { resolverEmailsAcceso } from './constants'

describe('resolverEmailsAcceso', () => {
  it('combina el usuario con los dominios de acceso', () => {
    expect(resolverEmailsAcceso('amontoya.jar')).toEqual([
      'amontoya.jar@sindicato.com',
      'amontoya.jar@gmail.com',
    ])
  })

  it('normaliza mayúsculas y espacios', () => {
    expect(resolverEmailsAcceso('  Ana.Torres ')).toEqual([
      'ana.torres@sindicato.com',
      'ana.torres@gmail.com',
    ])
  })

  it('respeta un correo completo tal cual', () => {
    expect(resolverEmailsAcceso('otro@ejemplo.bo')).toEqual(['otro@ejemplo.bo'])
  })
})
