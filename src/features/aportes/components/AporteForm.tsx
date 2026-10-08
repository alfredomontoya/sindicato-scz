import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  aporteSchema,
  type AporteFormValues,
} from '../schemas/aporteSchema'
import { PersonaSelector } from './PersonaSelector'

const inputClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

const CONCEPTOS_SUGERIDOS = [
  'Aporte voluntario',
  'Cuota mensual',
  'Cuota extraordinaria',
  'Donación',
]

export function AporteForm({
  personaIdInicial = '',
  personaNombreInicial = '',
  onSubmit,
}: {
  personaIdInicial?: string
  personaNombreInicial?: string
  onSubmit: (values: AporteFormValues) => Promise<void>
}) {
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AporteFormValues>({
    resolver: zodResolver(aporteSchema),
    defaultValues: {
      personaId: personaIdInicial,
      fecha: format(new Date(), 'yyyy-MM-dd'),
      monto: undefined as unknown as number,
      concepto: '',
    },
  })

  const guardar = async (values: AporteFormValues) => {
    setError(null)
    try {
      await onSubmit(values)
    } catch (e) {
      console.error(e)
      setError(
        e instanceof Error ? e.message : 'No se pudo registrar el aporte.',
      )
    }
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(guardar)(e)
      }}
      className="flex max-w-xl flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium" id="persona-label">
          Persona *
        </span>
        <Controller
          control={control}
          name="personaId"
          render={({ field }) => (
            <PersonaSelector
              personaId={field.value}
              nombreInicial={personaNombreInicial}
              onChange={(id) => field.onChange(id)}
            />
          )}
        />
        {errors.personaId !== undefined && (
          <p role="alert" className="text-sm text-destructive">
            {errors.personaId.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fecha" className="text-sm font-medium">
            Fecha *
          </label>
          <input
            id="fecha"
            type="date"
            max={format(new Date(), 'yyyy-MM-dd')}
            className={inputClass}
            {...register('fecha')}
          />
          {errors.fecha !== undefined && (
            <p role="alert" className="text-sm text-destructive">
              {errors.fecha.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="monto" className="text-sm font-medium">
            Monto (Bs) *
          </label>
          <input
            id="monto"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="150.00"
            className={inputClass}
            {...register('monto', { valueAsNumber: true })}
          />
          {errors.monto !== undefined && (
            <p role="alert" className="text-sm text-destructive">
              {errors.monto.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="concepto" className="text-sm font-medium">
          Concepto *
        </label>
        <input
          id="concepto"
          type="text"
          list="conceptos-sugeridos"
          placeholder="Aporte voluntario"
          autoComplete="off"
          className={inputClass}
          {...register('concepto')}
        />
        <datalist id="conceptos-sugeridos">
          {CONCEPTOS_SUGERIDOS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        {errors.concepto !== undefined && (
          <p role="alert" className="text-sm text-destructive">
            {errors.concepto.message}
          </p>
        )}
      </div>

      {error !== null && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando…' : 'Registrar aporte'}
        </Button>
      </div>
    </form>
  )
}
