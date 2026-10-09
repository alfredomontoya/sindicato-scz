import { z } from 'zod'

export const loginSchema = z.object({
  usuario: z
    .string()
    .trim()
    .min(1, 'Ingrese su usuario.')
    .refine(
      (v) =>
        v.includes('@')
          ? /.+@.+\..+/.test(v)
          : /^[A-Za-z0-9._-]+$/.test(v),
      'Ingrese un usuario válido (solo su nombre de usuario o su correo).',
    ),
  password: z.string().min(1, 'Ingrese su contraseña.').max(128),
})

export type LoginFormValues = z.infer<typeof loginSchema>
