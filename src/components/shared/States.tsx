export function LoadingState({ mensaje = 'Cargando...' }: { mensaje?: string }) {
  return (
    <div role="status" aria-live="polite" className="py-8 text-center text-sm">
      {mensaje}
    </div>
  )
}

export function EmptyState({ mensaje = 'No hay registros.' }: { mensaje?: string }) {
  return (
    <div role="status" className="py-8 text-center text-sm text-muted-foreground">
      {mensaje}
    </div>
  )
}

export function ErrorState({
  mensaje = 'No se pudo cargar la información.',
}: {
  mensaje?: string
}) {
  return (
    <div role="alert" className="py-8 text-center text-sm text-destructive">
      {mensaje}
    </div>
  )
}
