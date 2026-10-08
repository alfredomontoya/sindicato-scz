import { describe, expect, it } from 'vitest'
import { buildAuditoriaPayload } from './auditoriaService'

describe('buildAuditoriaPayload', () => {
  it('construye el registro con los campos requeridos', () => {
    const payload = buildAuditoriaPayload({
      usuarioId: 'u1',
      accion: 'aporte.crear',
      entidad: 'aportes',
      entidadId: 'a1',
      descripcion: 'Recibo N.º 000001',
    })
    expect(payload.usuarioId).toBe('u1')
    expect(payload.accion).toBe('aporte.crear')
    expect(payload.descripcion).toBe('Recibo N.º 000001')
    expect(payload.createdAt).toBeDefined()
  })

  it('omite la descripción cuando está vacía', () => {
    const payload = buildAuditoriaPayload({
      usuarioId: 'u1',
      accion: 'persona.crear',
      entidad: 'personas',
      entidadId: 'p1',
    })
    expect('descripcion' in payload).toBe(false)
  })
})
