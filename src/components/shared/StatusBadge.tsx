export function StatusBadge({
  activo,
  texto,
}: {
  activo: boolean
  texto?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        activo
          ? 'border-transparent bg-primary text-primary-foreground'
          : 'border-input bg-muted text-muted-foreground'
      }`}
    >
      <span
        aria-hidden
        className={`size-1.5 rounded-full ${activo ? 'bg-primary-foreground' : 'bg-muted-foreground'}`}
      />
      {texto ?? (activo ? 'Activo' : 'Inactivo')}
    </span>
  )
}
