import type { ReactNode } from 'react'

export function PageHeader({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string
  descripcion?: string
  acciones?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        {descripcion ? (
          <p className="text-sm text-muted-foreground">{descripcion}</p>
        ) : null}
      </div>
      {acciones ? <div className="no-print flex gap-2">{acciones}</div> : null}
    </div>
  )
}
