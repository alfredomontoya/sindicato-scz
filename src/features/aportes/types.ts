export type { Aporte, EstadoAporte } from '@/types'

export interface CreateAporteInput {
  personaId: string
  fecha: Date
  monto: number
  concepto: string
}
