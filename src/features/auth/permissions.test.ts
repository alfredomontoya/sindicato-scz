import { describe, expect, it } from 'vitest'
import { can } from './permissions'

describe('can', () => {
  it('admin puede gestionar usuarios y ver auditoría', () => {
    expect(can('admin', 'usuarios.gestionar')).toBe(true)
    expect(can('admin', 'auditoria.ver')).toBe(true)
  })

  it('registro no puede gestionar usuarios ni ver auditoría', () => {
    expect(can('registro', 'usuarios.gestionar')).toBe(false)
    expect(can('registro', 'auditoria.ver')).toBe(false)
    expect(can('registro', 'aportes.registrar')).toBe(true)
  })

  it('consulta solo puede ver', () => {
    expect(can('consulta', 'aportes.ver')).toBe(true)
    expect(can('consulta', 'reportes.ver')).toBe(true)
    expect(can('consulta', 'aportes.registrar')).toBe(false)
    expect(can('consulta', 'personas.editar')).toBe(false)
  })

  it('sin rol no permite nada', () => {
    expect(can(null, 'aportes.ver')).toBe(false)
    expect(can(undefined, 'aportes.ver')).toBe(false)
  })
})
