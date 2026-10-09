import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

export function ConfirmDialog({
  abierto,
  titulo,
  descripcion,
  textoConfirmar = 'Confirmar',
  confirmando = false,
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean
  titulo: string
  descripcion: string
  textoConfirmar?: string
  confirmando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}) {
  const cancelarRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (abierto) {
      cancelarRef.current?.focus()
    }
  }, [abierto ])

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
        aria-labelledby="confirm-titulo"
        aria-describedby="confirm-descripcion"
        className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-titulo" className="text-lg font-semibold">
          {titulo}
        </h2>
        <p id="confirm-descripcion" className="mt-2 text-sm text-muted-foreground">
          {descripcion}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button ref={cancelarRef} type="button" variant="outline" onClick={onCancelar} disabled={confirmando}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirmar} disabled={confirmando}>
            {confirmando ? 'Procesando…' : textoConfirmar}
          </Button>
        </div>
      </div>
    </div>
  )
}
