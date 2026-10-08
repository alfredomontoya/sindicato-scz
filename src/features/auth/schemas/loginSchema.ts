import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Ingrese su correo electrónico.')
    .email('Ingrese un correo electrónico válido.'),
  password: z.string().min(1, 'Ingrese su contraseña.').max(128),
})

export type LoginFormValues = z.infer<typeof loginSchema>
