import { ArrowLeft, Printer } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { DateDisplay } from '@/components/shared/DateDisplay'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'
import { ErrorState, LoadingState } from '@/components/shared/States'
import { usePersona } from '@/features/personas/hooks/usePersonas'
import { useUsuario } from '@/features/usuarios/hooks/useUsuarios'
import { useAporte } from '@/features/aportes/hooks/useAportes'
import { montoALiteral } from '@/utils/money'
import { formatearNombre } from '@/utils/nombres'
import { INSTITUCION_LOGO, INSTITUCION_NOMBRE, INSTITUCION_SUBTITULO } from '../constants'

export function ReciboPage() {
  const { id } = useParams()
  const { data: aporte, isLoading, isError } = useAporte(id)
  const { data: persona } = usePersona(aporte?.personaId)
  const { data: registrador } = useUsuario(aporte?.usuarioRegistroId)

  if (isLoading || aporte === undefined) {
    return (
      <main className="flex flex-col gap-4">
        <LoadingState mensaje="Cargando recibo…" />
      </main>
    )
  }

  if (isError || aporte === null) {
    return (
      <main className="flex flex-col gap-4">
        <ErrorState mensaje="No se encontró el recibo solicitado." />
      </main>
    )
  }

  const vigente = aporte.estado === 'vigente'

  return (
    <main className="flex flex-col gap-4">
      <div className="no-print flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link to={`/aportes/${aporte.id}`}>
            <ArrowLeft className="size-4" aria-hidden />
            Volver al aporte
          </Link>
        </Button>
        <Button
          variant="secondary"
          onClick={() => window.print()}
          disabled={!vigente}
          title={vigente ? 'Imprimir recibo' : 'El recibo anulado no se imprime'}
        >
          <Printer className="size-4" aria-hidden />
          Imprimir
        </Button>
      </div>

      <article
        aria-label={`Recibo número ${aporte.numeroRecibo}`}
        className="print-area mx-auto w-full max-w-xl rounded-lg border bg-card p-6 sm:p-8"
      >
        <header className="border-b pb-4 text-center">
          <img
            src={INSTITUCION_LOGO}
            alt={INSTITUCION_NOMBRE}
            className="mx-auto h-20 w-auto"
          />
          <p className="mt-2 text-xl font-bold tracking-tight">{INSTITUCION_NOMBRE}</p>
          <p className="text-sm text-muted-foreground">{INSTITUCION_SUBTITULO}</p>
          <p className="mt-2 text-sm font-semibold">
            <span className="rounded bg-highlight px-2 py-0.5 text-highlight-foreground">
              RECIBO N.º {aporte.numeroRecibo}
            </span>
          </p>
          {!vigente && (
            <p
              role="alert"
              className="mx-auto mt-2 inline-block rounded border border-destructive px-3 py-1 text-sm font-bold text-destructive"
            >
              ANULADO
            </p>
          )}
        </header>

        <dl className="flex flex-col gap-2.5 py-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Fecha</dt>
            <dd className="font-medium">
              <DateDisplay fecha={aporte.fecha} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Recibí de</dt>
            <dd className="text-right font-medium">
              {persona !== undefined && persona !== null
                ? formatearNombre(persona.nombre)
                : '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Concepto</dt>
            <dd className="text-right font-medium">{aporte.concepto}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t pt-2.5">
            <dt className="text-muted-foreground">Monto</dt>
            <dd className="text-lg">
              <MoneyDisplay monto={aporte.monto} />
            </dd>
          </div>
          <div className="flex flex-col gap-1 border-t pt-2.5">
            <dt className="text-muted-foreground">Monto literal</dt>
            <dd className="font-medium">{montoALiteral(aporte.monto)}</dd>
          </div>
        </dl>

        <footer className="flex items-end justify-between gap-4 border-t pt-6 text-sm">
          <div className="text-center">
            <p className="border-t border-foreground/40 px-6 pt-1">Entregué conforme</p>
          </div>
          <div className="text-center">
            <p className="border-t border-foreground/40 px-6 pt-1">Recibí conforme</p>
          </div>
        </footer>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Registrado por:{' '}
          {registrador !== undefined && registrador !== null ? registrador.nombre : '—'}
        </p>
      </article>
    </main>
  )
}
