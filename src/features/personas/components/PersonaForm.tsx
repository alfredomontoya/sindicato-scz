import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  personaSchema,
  type PersonaFormValues,
} from '../schemas/personaSchema'

const inputClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

export function PersonaForm({
  valoresIniciales,
  textoBoton = 'Guardar',
  onSubmit,
}: {
  valoresIniciales?: PersonaFormValues
  textoBoton?: string
  onSubmit: (values: PersonaFormValues) => Promise<void>
}) {
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PersonaFormValues>({
    resolver: zodResolver(personaSchema),
    defaultValues: valoresIniciales ?? {
      nombre: '',
      direccion: '',
      telefono: '',
      estado: true,
    },
  })

  const guardar = async (values: PersonaFormValues) => {
    setError(null)
    try {
      await onSubmit(values)
    } catch (e) {
      console.error(e)
      setError('No se pudo guardar la persona. Intente nuevamente.')
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
        <label htmlFor="nombre" className="text-sm font-medium">
          Nombre completo *
        </label>
        <input
          id="nombre"
          type="text"
          autoComplete="name"
          placeholder="Nombre y apellido"
          className={inputClass}
          {...register('nombre')}
        />
        {errors.nombre !== undefined && (
          <p role="alert" className="text-sm text-destructive">
            {errors.nombre.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="direccion" className="text-sm font-medium">
          Dirección
        </label>
        <input
          id="direccion"
          type="text"
          autoComplete="street-address"
          placeholder="Dirección (opcional)"
          className={inputClass}
          {...register('direccion')}
        />
        {errors.direccion !== undefined && (
          <p role="alert" className="text-sm text-destructive">
            {errors.direccion.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="telefono" className="text-sm font-medium">
          Teléfono
        </label>
        <input
          id="telefono"
          type="tel"
          autoComplete="tel"
          placeholder="Teléfono (opcional)"
          className={inputClass}
          {...register('telefono')}
        />
        {errors.telefono !== undefined && (
          <p role="alert" className="text-sm text-destructive">
            {errors.telefono.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="estado"
          type="checkbox"
          className="size-4 accent-primary"
          {...register('estado')}
        />
        <label htmlFor="estado" className="text-sm font-medium">
          Persona activa
        </label>
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
          {isSubmitting ? 'Guardando…' : textoBoton}
        </Button>
      </div>
    </form>
  )
}
