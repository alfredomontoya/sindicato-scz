import { z } from 'zod'
import { DOMINIO_USUARIOS } from '@/features/auth/constants'

const rolSchema = z.enum(['admin', 'registro', 'consulta'], {
  errorMap: () => ({ message: 'Seleccione un rol válido.' }),
})

export const usuarioCreateSchema = z.object({
  nombre: z.string().trim().min(2, 'Ingrese el nombre (mínimo 2 caracteres).').max(100),
  usuario: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, 'Ingrese el nombre de usuario.')
    .max(64)
    .regex(
      /^[a-z0-9._-]+$/,
      'Solo letras minúsculas, números, punto, guion y guion bajo.',
    ),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres.')
    .max(128),
  rol: rolSchema,
  estado: z.boolean(),
})

export type UsuarioCreateValues = z.infer<typeof usuarioCreateSchema>

/** Correo institucional que recibirá la cuenta nueva. */
export function emailNuevoUsuario(usuario: string): string {
  return `${usuario}@${DOMINIO_USUARIOS}`
}

export const usuarioEditSchema = z.object({
  nombre: z.string().trim().min(2, 'Ingrese el nombre (mínimo 2 caracteres).').max(100),
  rol: rolSchema,
  estado: z.boolean(),
})

export type UsuarioEditValues = z.infer<typeof usuarioEditSchema>
