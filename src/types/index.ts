import type { Timestamp } from 'firebase/firestore'

export type RolUsuario = 'admin' | 'registro' | 'consulta'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: RolUsuario
  estado: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Persona {
  id: string
  nombre: string
  /** Nombre normalizado (minúsculas, sin tildes) para búsquedas por prefijo. */
  nombreBusqueda: string
  direccion: string
  telefono: string
  estado: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type EstadoAporte = 'vigente' | 'anulado'

export interface Aporte {
  id: string
  personaId: string
  fecha: Timestamp
  monto: number
  concepto: string
  numeroRecibo: string
  usuarioRegistroId: string
  estado: EstadoAporte
  motivoAnulacion?: string
  usuarioAnulacionId?: string
  fechaAnulacion?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Auditoria {
  id: string
  usuarioId: string
  accion: string
  entidad: string
  entidadId: string
  descripcion?: string
  createdAt: Timestamp
}
