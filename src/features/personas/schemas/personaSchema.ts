import { z } from 'zod'

export const personaSchema = z.object({
  nombre: z.string().min(2).max(150),
  direccion: z.string().max(255).optional(),
  telefono: z.string().max(30).optional(),
  estado: z.boolean(),
})

export type PersonaFormValues = z.infer<typeof personaSchema>
