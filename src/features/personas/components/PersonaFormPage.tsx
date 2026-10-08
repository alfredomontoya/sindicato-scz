import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorState, LoadingState } from '@/components/shared/States'
import { auditar } from '@/features/auditoria/services/auditoriaService'
import { useAuth } from '@/features/auth/components/AuthProvider'
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
    navigate(`/personas/${nuevoId}`, { replace: true })
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
        valoresIniciales={
          persona !== undefined && persona !== null
            ? {
                nombre: persona.nombre,
                direccion: persona.direccion,
                telefono: persona.telefono,
                estado: persona.estado,
              }
            : undefined
        }
        textoBoton={esEdicion ? 'Guardar cambios' : 'Registrar persona'}
        onSubmit={guardar}
      />
    </main>
  )
}
