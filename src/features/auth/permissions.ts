import type { RolUsuario } from '@/types'

export type Permiso =
  | 'usuarios.gestionar'
  | 'personas.ver'
  | 'personas.crear'
  | 'personas.editar'
  | 'aportes.ver'
  | 'aportes.registrar'
  | 'aportes.anular'
  | 'recibos.ver'
  | 'recibos.generar'
  | 'reportes.ver'
  | 'auditoria.ver'

const PERMISOS_POR_ROL: Record<RolUsuario, readonly Permiso[]> = {
  admin: [
    'usuarios.gestionar',
    'personas.ver',
    'personas.crear',
    'personas.editar',
    'aportes.ver',
    'aportes.registrar',
    'aportes.anular',
    'recibos.ver',
    'recibos.generar',
    'reportes.ver',
    'auditoria.ver',
  ],
  registro: [
    'personas.ver',
    'personas.crear',
    'personas.editar',
    'aportes.ver',
    'aportes.registrar',
    'aportes.anular',
    'recibos.ver',
    'recibos.generar',
    'reportes.ver',
  ],
  consulta: ['personas.ver', 'aportes.ver', 'recibos.ver', 'reportes.ver'],
}

export function can(
  rol: RolUsuario | null | undefined,
  permiso: Permiso,
): boolean {
  if (rol === null || rol === undefined) {
    return false
  }
  return PERMISOS_POR_ROL[rol].includes(permiso)
}
