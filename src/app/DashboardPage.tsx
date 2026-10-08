import { format } from 'date-fns'
import { useMemo, useState, type ReactNode } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'
import { ErrorState, LoadingState } from '@/components/shared/States'
import { AporteTable } from '@/features/aportes/components/AporteTable'
import {
  usePersonasActivas,
  useResumenMes,
  useUltimosAportes,
} from '@/features/aportes/hooks/useResumen'
import { usePersonasNombres } from '@/features/aportes/hooks/useAportes'

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

  const resumen = useResumenMes(year, month)
  const activas = usePersonasActivas()
  const ultimos = useUltimosAportes(5)

  const ids = useMemo(
    () => [...new Set((ultimos.data ?? []).map((a) => a.personaId))],
    [ultimos.data],
  )
  const { data: nombres } = usePersonasNombres(ids)

  const cargando = resumen.isLoading || activas.isLoading || ultimos.isLoading
  const conError = resumen.isError || activas.isError || ultimos.isError

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
          <section
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Resumen del período"
          >
            <Tarjeta titulo="Personas activas" valor={String(activas.data ?? 0)} />
            <Tarjeta titulo="Aportes del mes" valor={String(resumen.data?.cantidad ?? 0)} />
            <Tarjeta
              titulo="Total recaudado"
              valor={
                resumen.data !== undefined ? (
                  <MoneyDisplay monto={resumen.data.total} />
                ) : (
                  '—'
                )
              }
            />
            <Tarjeta titulo="Aportes anulados" valor={String(resumen.data?.anulados ?? 0)} />
          </section>
          <p className="text-xs text-muted-foreground">
            Los totales consideran únicamente aportes vigentes del período seleccionado.
          </p>

          <section aria-label="Últimos aportes" className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Últimos aportes</h2>
            {(ultimos.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay aportes registrados.</p>
            ) : (
              <AporteTable aportes={ultimos.data ?? []} nombres={nombres ?? {}} />
            )}
          </section>
        </>
      )}
    </main>
  )
}
