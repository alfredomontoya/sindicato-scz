import { useQueryClient } from '@tanstack/react-query'
import { Ban, Printer } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { DateDisplay } from '@/components/shared/DateDisplay'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ErrorState, LoadingState } from '@/components/shared/States'
import { auditar } from '@/features/auditoria/services/auditoriaService'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { can } from '@/features/auth/permissions'
import { usePersona } from '@/features/personas/hooks/usePersonas'
import { useUsuario } from '@/features/usuarios/hooks/useUsuarios'
import { montoALiteral } from '@/utils/money'
import { useAporte } from '../hooks/useAportes'
import { anularAporte } from '../services/aporteService'
import { AnularDialog } from './AnularDialog'

function Fila({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b py-2.5 last:border-0">
      <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
      <dd className="col-span-2 text-sm font-medium">{children}</dd>
    </div>
  )
}

export function AporteDetailPage() {
  const { id } = useParams()
  const { profile, user } = useAuth()
  const queryClient = useQueryClient()
  const puedeAnular = can(profile?.rol, 'aportes.anular')

  const [dialogo, setDialogo] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [errorAnular, setErrorAnular] = useState<string | null>(null)

  const { data: aporte, isLoading, isError } = useAporte(id)
  const { data: persona } = usePersona(aporte?.personaId)
  const { data: registrador } = useUsuario(aporte?.usuarioRegistroId)

  if (isLoading || aporte === undefined) {
    return (
      <main className="flex flex-col gap-4">
        <PageHeader titulo="Detalle de aporte" />
        <LoadingState mensaje="Cargando aporte…" />
      </main>
    )
  }

  if (isError || aporte === null) {
    return (
      <main className="flex flex-col gap-4">
        <PageHeader titulo="Detalle de aporte" />
        <ErrorState mensaje="No se encontró el aporte solicitado." />
      </main>
    )
  }

  const vigente = aporte.estado === 'vigente'

  const anular = async (motivo: string) => {
    if (id === undefined || id === '' || user === null) {
      return
    }
    setProcesando(true)
    setErrorAnular(null)
    try {
      await anularAporte(id, motivo, user.uid)
      auditar({
        usuarioId: user.uid,
        accion: 'aporte.anular',
        entidad: 'aportes',
        entidadId: id,
        descripcion: `Recibo N.º ${aporte.numeroRecibo}: ${motivo}`,
      })
      await queryClient.invalidateQueries({ queryKey: ['aportes'] })
      setDialogo(false)
    } catch (e) {
      console.error(e)
      setErrorAnular(e instanceof Error ? e.message : 'No se pudo anular el aporte.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <main className="flex flex-col gap-4">
      <PageHeader
        titulo={`Recibo N.º ${aporte.numeroRecibo}`}
        descripcion={vigente ? 'Aporte vigente.' : 'Aporte anulado.'}
        acciones={
          <Button asChild variant="outline">
            <Link to={`/recibos/${aporte.id}`}>
              <Printer className="size-4" aria-hidden />
              Ver recibo
            </Link>
          </Button>
        }
      />

      <section aria-label="Datos del aporte" className="max-w-xl rounded-lg border p-4">
        <dl>
          <div className="grid grid-cols-3 gap-2 border-b py-2.5">
            <dt className="text-sm text-muted-foreground">Estado</dt>
            <dd className="col-span-2">
              <StatusBadge activo={vigente} texto={vigente ? 'Vigente' : 'Anulado'} />
            </dd>
          </div>
          <Fila etiqueta="Persona">
            {persona !== undefined && persona !== null ? (
              <Link
                to={`/personas/${persona.id}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {persona.nombre}
              </Link>
            ) : (
              '—'
            )}
          </Fila>
          <Fila etiqueta="Fecha">
            <DateDisplay fecha={aporte.fecha} />
          </Fila>
          <Fila etiqueta="Concepto">{aporte.concepto}</Fila>
          <Fila etiqueta="Monto">
            <MoneyDisplay monto={aporte.monto} />
          </Fila>
          <Fila etiqueta="Monto literal">{montoALiteral(aporte.monto)}</Fila>
          <Fila etiqueta="Registrado por">
            {registrador !== undefined && registrador !== null ? registrador.nombre : '—'}
          </Fila>
          {!vigente && (
            <Fila etiqueta="Motivo de anulación">
              {aporte.motivoAnulacion ?? '—'}
            </Fila>
          )}
        </dl>

        {errorAnular !== null && (
          <div
            role="alert"
            className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {errorAnular}
          </div>
        )}

        {puedeAnular && vigente && (
          <div className="no-print mt-4">
            <Button variant="destructive" onClick={() => setDialogo(true)}>
              <Ban className="size-4" aria-hidden />
              Anular aporte
            </Button>
          </div>
        )}
      </section>

      <AnularDialog
        abierto={dialogo}
        numeroRecibo={aporte.numeroRecibo}
        procesando={procesando}
        onConfirmar={(motivo) => {
          void anular(motivo)
        }}
        onCancelar={() => setDialogo(false)}
      />
    </main>
  )
}
