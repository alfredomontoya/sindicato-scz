import { format } from 'date-fns'
import { z } from 'zod'

const hoyLocal = () => format(new Date(), 'yyyy-MM-dd')

export const aporteSchema = z.object({
  personaId: z.string().min(1, 'Seleccione a la persona.'),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingrese una fecha válida.')
    .refine((s) => s <= hoyLocal(), 'La fecha no puede ser futura.'),
  monto: z
    .number({ invalid_type_error: 'Ingrese un monto válido.' })
    .positive('El monto debe ser mayor que cero.')
    .max(999999999.99, 'El monto es demasiado grande.')
    .refine((m: number) => Number.isFinite(m), 'Ingrese un monto válido.')
    .refine(
      (m: number) => Math.abs(m * 100 - Math.round(m * 100)) < 1e-6,
      'El monto admite máximo dos decimales.',
    ),
  concepto: z
    .string()
    .trim()
    .min(2, 'Ingrese el concepto (mínimo 2 caracteres).')
    .max(255, 'El concepto es demasiado largo.'),
})

export type AporteFormValues = z.infer<typeof aporteSchema>

export const anulacionSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(3, 'Indique el motivo de la anulación.')
    .max(500, 'El motivo es demasiado largo.'),
})

export type AnulacionFormValues = z.infer<typeof anulacionSchema>
