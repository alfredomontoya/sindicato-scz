import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ErrorState, LoadingState } from '@/components/shared/States'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { useUsuario } from '@/features/usuarios/hooks/useUsuarios'
import { useCierre } from '../hooks/useCierres'
import {
  cerrarMes,
  reabrirMes,
  recalcularMes,
} from '../services/cierreService'

type Accion = 'cerrar' | 'reabrir' | 'recalcular'

const ACCION_TEXTO: Record<Accion, { titulo: string; descripcion: string; boton: string }> = {
  cerrar: {
    titulo: 'Cerrar mes',
    descripcion:
      'Se guardará el snapshot del mes con los totales actuales. Es informativo: no bloquea registros.',
    boton: 'Cerrar mes',
  },
  reabrir: {
    titulo: 'Reabrir mes',
    descripcion: 'El mes volverá a estado abierto.',
    boton: 'Reabrir',
  },
  recalcular: {
    titulo: 'Recalcular mes',
    descripcion:
      'Se recalcularán los totales desde los aportes (no cambia si está abierto o cerrado).',
    boton: 'Recalcular',
  },
}

export function CierresPage() {
  const { profile, user } = useAuth()
  const puedeGestionar = profile?.rol === 'admin'
  const queryClient = useQueryClient()
  const [mes, setMes] = useState(() => format(new Date(), 'yyyy-MM'))
  const [year, month] = mes.split('-').map(Number) as [number, number]
  const [confirmar, setConfirmar] = useState<Accion | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: cierre, isLoading, isError } = useCierre(year, month)
  const registro = cierre ?? null
  const { data: cerroPor } = useUsuario(
    cierre?.cerradoPor === undefined ? undefined : cierre.cerradoPor,
  )

  const ejecutar = async () => {
    if (confirmar === null || user === null) {
      return
    }
    setProcesando(true)
    setError(null)
    try {
      if (confirmar === 'cerrar') {
        await cerrarMes(year, month, user.uid)
      } else if (confirmar === 'reabrir') {
        await reabrirMes(year, month)
      } else {
        await recalcularMes(year, month)
      }
      await queryClient.invalidateQueries({ queryKey: ['cierres'] })
      setConfirmar(null)
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'No se pudo completar la acción.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <main className="flex flex-col gap-4">
      <PageHeader
        titulo="Cierres mensuales"
        descripcion="Totales por mes en un solo registro."
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

      {isLoading && <LoadingState mensaje="Cargando cierre…" />}
      {isError && <ErrorState mensaje="No se pudo cargar el cierre." />}

      {!isLoading && !isError && (
        <>
          {registro === null ? (
            <p className="text-sm text-muted-foreground">
              Este mes aún no tiene registro de cierre. Se creará automáticamente
              con el primer aporte, o use Recalcular.
            </p>
          ) : (
            <section
              aria-label="Snapshot del mes"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="mt-1">
                  <StatusBadge
                    activo={registro.estado === 'abierto'}
                    texto={registro.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                  />
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total vigente</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  <MoneyDisplay monto={registro.total} />
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Aportes</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {registro.cantidad}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Anulados</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {registro.anulados}
                </p>
              </div>
            </section>
          )}
          {registro !== null && registro.cerradoPor !== undefined && (
            <p className="text-sm text-muted-foreground">
              Cerrado por {cerroPor?.nombre ?? '—'}
              {registro.cerradoEl !== undefined &&
                ` el ${registro.cerradoEl.toDate().toLocaleString('es-BO')}`}
              .
            </p>
          )}

          {error !== null && (
            <div
              role="alert"
              className="max-w-xl rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {puedeGestionar && (
            <div className="no-print flex flex-wrap gap-2">
              {(registro === null || registro.estado === 'abierto') && (
                <Button onClick={() => setConfirmar('cerrar')}>Cerrar mes</Button>
              )}
              {registro !== null && registro.estado === 'cerrado' && (
                <Button variant="outline" onClick={() => setConfirmar('reabrir')}>
                  Reabrir mes
                </Button>
              )}
              <Button variant="secondary" onClick={() => setConfirmar('recalcular')}>
                Recalcular
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        abierto={confirmar !== null}
        titulo={confirmar !== null ? ACCION_TEXTO[confirmar].titulo : ''}
        descripcion={confirmar !== null ? ACCION_TEXTO[confirmar].descripcion : ''}
        textoConfirmar={confirmar !== null ? ACCION_TEXTO[confirmar].boton : ''}
        confirmando={procesando}
        onConfirmar={() => {
          void ejecutar()
        }}
        onCancelar={() => setConfirmar(null)}
      />
    </main>
  )
}
