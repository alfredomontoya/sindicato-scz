export type { Persona } from '@/types'

export interface CreatePersonaInput {
  nombre: string
  direccion?: string
  telefono?: string
  estado: boolean
}
