import { useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ErrorState, LoadingState } from '@/components/shared/States'
import { auditar } from '@/features/auditoria/services/auditoriaService'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { can } from '@/features/auth/permissions'
import { usePersona } from '../hooks/usePersonas'
import { setPersonaEstado } from '../services/personaService'

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b py-2.5 last:border-0">
      <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
      <dd className="col-span-2 text-sm font-medium">{valor}</dd>
    </div>
  )
}

export function PersonaDetailPage() {
  const { id } = useParams()
  const { profile, user } = useAuth()
  const queryClient = useQueryClient()
  const puedeEditar = can(profile?.rol, 'personas.editar')

  const [confirmando, setConfirmando] = useState<null | { aEstado: boolean }>(null)
  const [procesando, setProcesando] = useState(false)

  const { data: persona, isLoading, isError } = usePersona(id)

  if (isLoading || persona === undefined) {
    return (
      <main className="flex flex-col gap-4">
        <PageHeader titulo="Detalle de persona" />
        <LoadingState mensaje="Cargando persona…" />
      </main>
    )
  }

  if (isError || persona === null) {
    return (
      <main className="flex flex-col gap-4">
        <PageHeader titulo="Detalle de persona" />
        <ErrorState mensaje="No se encontró la persona solicitada." />
      </main>
    )
  }

  const cambiarEstado = async () => {
    if (confirmando === null || id === undefined) {
      return
    }
    setProcesando(true)
    try {
      await setPersonaEstado(id, confirmando.aEstado)
      if (user !== null) {
        auditar({
          usuarioId: user.uid,
          accion: 'persona.estado',
          entidad: 'personas',
          entidadId: id,
          descripcion: confirmando.aEstado ? 'Activada' : 'Desactivada',
        })
      }
      await queryClient.invalidateQueries({ queryKey: ['personas'] })
      setConfirmando(null)
    } catch (e) {
      console.error(e)
    } finally {
      setProcesando(false)
    }
  }

  return (
    <main className="flex flex-col gap-4">
      <PageHeader
        titulo={persona.nombre}
        descripcion="Información registrada de la persona."
        acciones={
          puedeEditar ? (
            <Button asChild variant="outline">
              <Link to={`/personas/${persona.id}/editar`}>
                <Pencil className="size-4" aria-hidden />
                Editar
              </Link>
            </Button>
          ) : undefined
        }
      />

      <section aria-label="Datos" className="max-w-xl rounded-lg border p-4">
        <dl>
          <div className="grid grid-cols-3 gap-2 border-b py-2.5">
            <dt className="text-sm text-muted-foreground">Estado</dt>
            <dd className="col-span-2">
              <StatusBadge activo={persona.estado} />
            </dd>
          </div>
          <Fila etiqueta="Dirección" valor={persona.direccion === '' ? '—' : persona.direccion} />
          <Fila etiqueta="Teléfono" valor={persona.telefono === '' ? '—' : persona.telefono} />
        </dl>
        {puedeEditar && (
          <div className="no-print mt-4">
            <Button
              variant={persona.estado ? 'destructive' : 'outline'}
              onClick={() => setConfirmando({ aEstado: !persona.estado })}
            >
              {persona.estado ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        )}
      </section>

      <section aria-label="Historial de aportes" className="max-w-xl">
        <h2 className="text-lg font-semibold">Historial de aportes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <Link
            to={`/aportes?personaId=${persona.id}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            Ver historial de aportes de {persona.nombre}
          </Link>
        </p>
      </section>

      <ConfirmDialog
        abierto={confirmando !== null}
        titulo={confirmando?.aEstado === true ? 'Activar persona' : 'Desactivar persona'}
        descripcion={
          confirmando?.aEstado === true
            ? `Se activará a ${persona.nombre}. Los aportes históricos se mantienen sin cambios.`
            : `Se desactivará a ${persona.nombre}. Sus aportes históricos seguirán consultables.`
        }
        textoConfirmar={confirmando?.aEstado === true ? 'Activar' : 'Desactivar'}
        confirmando={procesando}
        onConfirmar={() => {
          void cambiarEstado()
        }}
        onCancelar={() => setConfirmando(null)}
      />
    </main>
  )
}
