import { z } from 'zod'

export const personaSchema = z.object({
  nombre: z.string().min(2).max(150),
  ci: z
    .string()
    .trim()
    .min(3, 'El CI debe tener al menos 3 caracteres.')
    .max(20, 'El CI debe tener máximo 20 caracteres.')
    .regex(/^[A-Za-z0-9]+$/, 'El CI solo admite letras y números, sin espacios.'),
  direccion: z.string().max(255).optional(),
  telefono: z.string().max(30).optional(),
  estado: z.boolean(),
})

export type PersonaFormValues = z.infer<typeof personaSchema>
