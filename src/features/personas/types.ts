export type { Persona } from '@/types'

export interface CreatePersonaInput {
  nombre: string
  ci: string
  direccion?: string
  telefono?: string
  estado: boolean
}
