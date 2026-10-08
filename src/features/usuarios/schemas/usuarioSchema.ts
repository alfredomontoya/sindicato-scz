import { z } from 'zod'

const rolSchema = z.enum(['admin', 'registro', 'consulta'], {
  errorMap: () => ({ message: 'Seleccione un rol válido.' }),
})

export const usuarioCreateSchema = z.object({
  nombre: z.string().trim().min(2, 'Ingrese el nombre (mínimo 2 caracteres).').max(100),
  email: z
    .string()
    .trim()
    .min(1, 'Ingrese el correo electrónico.')
    .email('Ingrese un correo electrónico válido.'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres.')
    .max(128),
  rol: rolSchema,
  estado: z.boolean(),
})

export type UsuarioCreateValues = z.infer<typeof usuarioCreateSchema>

export const usuarioEditSchema = z.object({
  nombre: z.string().trim().min(2, 'Ingrese el nombre (mínimo 2 caracteres).').max(100),
  rol: rolSchema,
  estado: z.boolean(),
})

export type UsuarioEditValues = z.infer<typeof usuarioEditSchema>
