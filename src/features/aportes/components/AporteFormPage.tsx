import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useNavigate, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/shared/PageHeader'
import { auditar } from '@/features/auditoria/services/auditoriaService'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { fechaInputADate } from '../services/aporteService'
import type { AporteFormValues } from '../schemas/aporteSchema'
import { createAporte } from '../services/aporteService'
import { usePersona } from '@/features/personas/hooks/usePersonas'
import { AporteForm } from './AporteForm'

export function AporteFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [params] = useSearchParams()
  const personaId = params.get('personaId') ?? ''
  const { data: persona } = usePersona(personaId === '' ? undefined : personaId)

  const guardar = async (values: AporteFormValues) => {
    if (user === null) {
      throw new Error('Su sesión expiró. Ingrese nuevamente.')
    }
    const { id, numeroRecibo } = await createAporte(
      {
        personaId: values.personaId,
        fecha: fechaInputADate(values.fecha),
        monto: values.monto,
        concepto: values.concepto,
      },
      { usuarioRegistroId: user.uid },
    )
    auditar({
      usuarioId: user.uid,
      accion: 'aporte.crear',
      entidad: 'aportes',
      entidadId: id,
      descripcion: `Recibo N.º ${numeroRecibo}`,
    })
    await queryClient.invalidateQueries({ queryKey: ['aportes'] })
    navigate(`/aportes/${id}`, { replace: true })
  }

  return (
    <main className="flex flex-col gap-4">
      <PageHeader
        titulo="Registrar aporte"
        descripcion={
          persona !== undefined && persona !== null
            ? `Aporte para ${persona.nombre}.`
            : 'Complete los datos. El número de recibo se asigna automáticamente.'
        }
      />
      <p className="text-xs text-muted-foreground">
        Hoy: {format(new Date(), 'dd/MM/yyyy')} · El recibo correlativo se genera
        de forma segura al guardar.
      </p>
      <AporteForm
        personaIdInicial={personaId}
        personaNombreInicial={persona?.nombre ?? ''}
        onSubmit={guardar}
      />
    </main>
  )
}
