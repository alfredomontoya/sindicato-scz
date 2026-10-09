import { CircleCheck } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export interface AccionExito {
  etiqueta: string
  to?: string
  onClick?: () => void
  variante?: 'default' | 'outline' | 'secondary'
}

/** Confirmación tras un registro exitoso con siguientes pasos. */
export function GuardadoExito({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string
  descripcion?: string
  acciones: AccionExito[]
}) {
  return (
    <div
      role="status"
      className="flex max-w-xl flex-col items-start gap-3 rounded-lg border bg-card p-6"
    >
      <CircleCheck className="size-8 text-primary" aria-hidden />
      <div>
        <h2 className="text-lg font-semibold">{titulo}</h2>
        {descripcion !== undefined && (
          <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>
        )}
      </div>
      <div className="no-print mt-1 flex flex-wrap gap-2">
        {acciones.map((a) =>
          a.to !== undefined ? (
            <Button key={a.etiqueta} asChild variant={a.variante ?? 'default'}>
              <Link to={a.to}>{a.etiqueta}</Link>
            </Button>
          ) : (
            <Button
              key={a.etiqueta}
              variant={a.variante ?? 'default'}
              onClick={a.onClick}
            >
              {a.etiqueta}
            </Button>
          ),
        )}
      </div>
    </div>
  )
}
