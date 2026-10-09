import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { GuardadoExito } from '@/components/shared/GuardadoExito'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorState, LoadingState } from '@/components/shared/States'
import { auditar } from '@/features/auditoria/services/auditoriaService'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { formatearNombre } from '@/utils/nombres'
import { usePersona } from '../hooks/usePersonas'
import { createPersona, updatePersona } from '../services/personaService'
import type { PersonaFormValues } from '../schemas/personaSchema'
import { PersonaForm } from './PersonaForm'

export function PersonaFormPage({ modo }: { modo: 'nueva' | 'editar' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const esEdicion = modo === 'editar'
  const [formKey, setFormKey] = useState(0)
  const [exito, setExito] = useState<{ id: string; nombre: string } | null>(null)

  const { data: persona, isLoading, isError } = usePersona(esEdicion ? id : undefined)

  if (esEdicion && (isLoading || persona === undefined)) {
    return (
      <main className="flex flex-col gap-4">
        <PageHeader titulo="Editar persona" />
        <LoadingState mensaje="Cargando persona…" />
      </main>
    )
  }

  if (esEdicion && (isError || persona === null)) {
    return (
      <main className="flex flex-col gap-4">
        <PageHeader titulo="Editar persona" />
        <ErrorState mensaje="No se encontró la persona solicitada." />
      </main>
    )
  }

  const guardar = async (values: PersonaFormValues) => {
    if (esEdicion) {
      if (id === undefined || id === '') {
        throw new Error('Falta el identificador.')
      }
      await updatePersona(id, values)
      if (user !== null) {
        auditar({
          usuarioId: user.uid,
          accion: 'persona.editar',
          entidad: 'personas',
          entidadId: id,
          descripcion: values.nombre,
        })
      }
      await queryClient.invalidateQueries({ queryKey: ['personas'] })
      navigate(`/personas/${id}`, { replace: true })
      return
    }
    const nuevoId = await createPersona(values)
    if (user !== null) {
      auditar({
        usuarioId: user.uid,
        accion: 'persona.crear',
        entidad: 'personas',
        entidadId: nuevoId,
        descripcion: values.nombre,
      })
    }
    await queryClient.invalidateQueries({ queryKey: ['personas'] })
    setExito({ id: nuevoId, nombre: values.nombre.trim() })
  }

  if (exito !== null) {
    return (
      <main className="flex flex-col gap-4">
        <PageHeader titulo="Nueva persona" />
        <GuardadoExito
          titulo={`Persona registrada: ${formatearNombre(exito.nombre)}`}
          descripcion="Ya puede registrar aportes a su nombre."
          acciones={[
            { etiqueta: 'Ver detalle', to: `/personas/${exito.id}` },
            { etiqueta: 'Ir al listado', to: '/personas', variante: 'outline' },
            {
              etiqueta: 'Registrar otra persona',
              variante: 'secondary',
              onClick: () => {
                setExito(null)
                setFormKey((k) => k + 1)
              },
            },
          ]}
        />
      </main>
    )
  }

  return (
    <main className="flex flex-col gap-4">
      <PageHeader
        titulo={esEdicion ? 'Editar persona' : 'Nueva persona'}
        descripcion={
          esEdicion
            ? 'Modifique los datos y guarde los cambios.'
            : 'Complete los datos para registrar a la persona.'
        }
      />
      <PersonaForm
        key={formKey}
        valoresIniciales={
          persona !== undefined && persona !== null
            ? {
                nombre: persona.nombre,
                ci: persona.ci,
                direccion: persona.direccion,
                telefono: persona.telefono,
                estado: persona.estado,
              }
            : undefined
        }
        textoBoton={esEdicion ? 'Guardar cambios' : 'Registrar persona'}
        onCancelar={() => navigate('/personas')}
        onSubmit={guardar}
      />
    </main>
  )
}
