import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  anulacionSchema,
  type AnulacionFormValues,
} from '../schemas/aporteSchema'

export function AnularDialog({
  abierto,
  numeroRecibo,
  procesando = false,
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean
  numeroRecibo: string
  procesando?: boolean
  onConfirmar: (motivo: string) => void
  onCancelar: () => void
}) {
  const motivoRef = useRef<HTMLTextAreaElement>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnulacionFormValues>({
    resolver: zodResolver(anulacionSchema),
    defaultValues: { motivo: '' },
  })
  const { ref: motivoFormRef, ...motivoRegistro } = register('motivo')

  useEffect(() => {
    if (abierto) {
      reset({ motivo: '' })
      setTimeout(() => motivoRef.current?.focus(), 0)
    }
  }, [abierto, reset])

  useEffect(() => {
    if (!abierto) {
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancelar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierto, onCancelar])

  if (!abierto) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancelar}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="anular-titulo"
        aria-describedby="anular-descripcion"
        className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="anular-titulo" className="text-lg font-semibold">
          Anular aporte
        </h2>
        <p id="anular-descripcion" className="mt-2 text-sm text-muted-foreground">
          Se anulará el recibo N.º {numeroRecibo}. Esta acción queda registrada
          y no se puede deshacer. El aporte no se elimina.
        </p>
        <form
          onSubmit={(e) => {
            void handleSubmit((v) => onConfirmar(v.motivo))(e)
          }}
          className="mt-4 flex flex-col gap-3"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="motivo" className="text-sm font-medium">
              Motivo de la anulación *
            </label>
            <textarea
              id="motivo"
              rows={3}
              placeholder="Ej.: monto registrado por error"
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...motivoRegistro}
              ref={(e) => {
                motivoFormRef(e)
                motivoRef.current = e
              }}
            />
            {errors.motivo !== undefined && (
              <p role="alert" className="text-sm text-destructive">
                {errors.motivo.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancelar}
              disabled={procesando}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={procesando}>
              {procesando ? 'Anulando…' : 'Anular aporte'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
