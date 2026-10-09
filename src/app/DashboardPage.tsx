import { format } from 'date-fns'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/shared/PageHeader'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'
import { ErrorState, LoadingState } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AporteTable } from '@/features/aportes/components/AporteTable'
import {
  usePersonasActivas,
  useResumenMes,
  useUltimosAportes,
} from '@/features/aportes/hooks/useResumen'
import { usePersonasNombres } from '@/features/aportes/hooks/useAportes'
import { useCierre } from '@/features/cierres/hooks/useCierres'

function Tarjeta({ titulo, valor }: { titulo: string; valor: ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{titulo}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{valor}</p>
    </div>
  )
}

export function DashboardPage() {
  const [mes, setMes] = useState(() => format(new Date(), 'yyyy-MM'))
  const [year, month] = mes.split('-').map(Number) as [number, number]

  // El total del mes es una sola lectura al registro de cierre.
  // Si aún no existe (mes sin movimientos), se calcula en vivo una vez.
  const cierre = useCierre(year, month)
  const usarRespaldo = !cierre.isLoading && cierre.data === null
  const resumen = useResumenMes(year, month, usarRespaldo)
  const activas = usePersonasActivas()
  const ultimos = useUltimosAportes(5)

  const totales =
    cierre.data !== undefined && cierre.data !== null
      ? {
          total: cierre.data.total,
          cantidad: cierre.data.cantidad,
          anulados: cierre.data.anulados,
        }
      : resumen.data !== undefined
        ? resumen.data
        : null

  const ids = useMemo(
    () => [...new Set((ultimos.data ?? []).map((a) => a.personaId))],
    [ultimos.data],
  )
  const { data: personas } = usePersonasNombres(ids)

  const cargando =
    cierre.isLoading ||
    activas.isLoading ||
    ultimos.isLoading ||
    (usarRespaldo && resumen.isLoading)
  const conError =
    cierre.isError ||
    activas.isError ||
    ultimos.isError ||
    (usarRespaldo && resumen.isError)

  return (
    <main className="flex flex-col gap-4">
      <PageHeader
        titulo="Panel principal"
        descripcion="Resumen del control de aportes voluntarios."
        acciones={
          <input
            type="month"
            aria-label="Período"
            value={mes}
            max={format(new Date(), 'yyyy-MM')}
            onChange={(e) => {
              if (e.target.value !== '') {
                setMes(e.target.value)
              }
            }}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        }
      />

      {cargando && <LoadingState mensaje="Cargando resumen…" />}
      {conError && (
        <ErrorState mensaje="No se pudo cargar el resumen. Verifique su conexión." />
      )}

      {!cargando && !conError && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {cierre.data !== undefined && cierre.data !== null ? (
              <StatusBadge
                activo={cierre.data.estado === 'abierto'}
                texto={cierre.data.estado === 'abierto' ? 'Mes abierto' : 'Mes cerrado'}
              />
            ) : (
              <span className="text-muted-foreground">
                Mes sin cierre registrado (cálculo en vivo).
              </span>
            )}
            <Link
              to="/cierres"
              className="text-primary underline-offset-4 hover:underline"
            >
              Ver cierres
            </Link>
          </div>
          <section
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Resumen del período"
          >
            <Tarjeta titulo="Personas activas" valor={String(activas.data ?? 0)} />
            <Tarjeta titulo="Aportes del mes" valor={String(totales?.cantidad ?? 0)} />
            <Tarjeta
              titulo="Total recaudado"
              valor={
                totales !== null ? <MoneyDisplay monto={totales.total} /> : '—'
              }
            />
            <Tarjeta titulo="Aportes anulados" valor={String(totales?.anulados ?? 0)} />
          </section>
          <p className="text-xs text-muted-foreground">
            Los totales consideran únicamente aportes vigentes del período seleccionado.
          </p>

          <section aria-label="Últimos aportes" className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Últimos aportes</h2>
            {(ultimos.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay aportes registrados.</p>
            ) : (
              <AporteTable aportes={ultimos.data ?? []} personas={personas ?? {}} />
            )}
          </section>
        </>
      )}
    </main>
  )
}
