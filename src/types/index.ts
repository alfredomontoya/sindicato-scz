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
  /** CI único, alfanumérico en mayúsculas (3 a 20 caracteres). */
  ci: string
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

export type EstadoCierre = 'abierto' | 'cerrado'

/** Snapshot mensual de aportes: el total del mes es una sola lectura. */
export interface CierreMensual {
  id: string
  year: number
  month: number
  total: number
  cantidad: number
  anulados: number
  totalAnulados: number
  estado: EstadoCierre
  cerradoPor?: string
  cerradoEl?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
