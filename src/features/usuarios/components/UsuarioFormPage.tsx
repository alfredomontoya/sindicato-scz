import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorState, LoadingState } from '@/components/shared/States'
import { auditar } from '@/features/auditoria/services/auditoriaService'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { useUsuario } from '../hooks/useUsuarios'
import {
  createUsuario,
  updateUsuario,
} from '../services/usuarioService'
import {
  usuarioCreateSchema,
  usuarioEditSchema,
  type UsuarioCreateValues,
} from '../schemas/usuarioSchema'

const inputClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

export function UsuarioFormPage({ modo }: { modo: 'nuevo' | 'editar' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const esEdicion = modo === 'editar'
  const esPropio = esEdicion && user !== null && user.uid === id

  const { data: usuario, isLoading, isError } = useUsuario(esEdicion ? id : undefined)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioCreateValues>({
    resolver: zodResolver(
      (esEdicion ? usuarioEditSchema : usuarioCreateSchema) as typeof usuarioCreateSchema,
    ),
    values: {
      nombre: esEdicion ? (usuario?.nombre ?? '') : '',
      email: esEdicion ? (usuario?.email ?? '') : '',
      password: '',
      rol: esEdicion ? (usuario?.rol ?? 'consulta') : 'consulta',
      estado: esEdicion ? (usuario?.estado ?? true) : true,
    },
  })

  if (esEdicion && (isLoading || usuario === undefined)) {
    return (
      <main className="flex flex-col gap-4">
        <PageHeader titulo="Editar usuario" />
        <LoadingState mensaje="Cargando usuario…" />
      </main>
    )
  }

  if (esEdicion && (isError || usuario === null)) {
    return (
      <main className="flex flex-col gap-4">
        <PageHeader titulo="Editar usuario" />
        <ErrorState mensaje="No se encontró el usuario solicitado." />
      </main>
    )
  }

  const guardar = async (values: UsuarioCreateValues) => {
    setError(null)
    try {
      if (esEdicion) {
        if (id === undefined || id === '') {
          throw new Error('Falta el identificador.')
        }
        await updateUsuario(id, {
          nombre: values.nombre,
          rol: esPropio ? (usuario?.rol ?? values.rol) : values.rol,
          estado: esPropio ? true : values.estado,
        })
        if (user !== null) {
          auditar({
            usuarioId: user.uid,
            accion: 'usuario.editar',
            entidad: 'usuarios',
            entidadId: id,
            descripcion: values.nombre,
          })
        }
      } else {
        const nuevoId = await createUsuario(values)
        if (user !== null) {
          auditar({
            usuarioId: user.uid,
            accion: 'usuario.crear',
            entidad: 'usuarios',
            entidadId: nuevoId,
            descripcion: `${values.nombre} (${values.email})`,
          })
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      navigate('/usuarios', { replace: true })
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'No se pudo guardar el usuario.')
    }
  }

  return (
    <main className="flex flex-col gap-4">
      <PageHeader
        titulo={esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
        descripcion={
          esEdicion
            ? 'Modifique los datos y guarde los cambios.'
            : 'Se creará la credencial de acceso y el perfil.'
        }
      />
      {esPropio && (
        <p className="max-w-xl text-sm text-muted-foreground">
          Está editando su propia cuenta: el rol y el estado no se pueden cambiar
          aquí por seguridad.
        </p>
      )}
      <form
        onSubmit={(e) => {
          void handleSubmit(guardar)(e)
        }}
        className="flex max-w-xl flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nombre" className="text-sm font-medium">
            Nombre completo *
          </label>
          <input
            id="nombre"
            type="text"
            autoComplete="name"
            placeholder="Nombre y apellido"
            className={inputClass}
            {...register('nombre')}
          />
          {errors.nombre !== undefined && (
            <p role="alert" className="text-sm text-destructive">
              {errors.nombre.message}
            </p>
          )}
        </div>

        {!esEdicion && (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Correo electrónico *
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="usuario@sindicato.bo"
                className={inputClass}
                {...register('email')}
              />
              {errors.email !== undefined && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña inicial *
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                className={inputClass}
                {...register('password')}
              />
              {errors.password !== undefined && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="rol" className="text-sm font-medium">
              Rol *
            </label>
            <select id="rol" disabled={esPropio} className={inputClass} {...register('rol')}>
              <option value="admin">Admin</option>
              <option value="registro">Registro</option>
              <option value="consulta">Consulta</option>
            </select>
            {errors.rol !== undefined && (
              <p role="alert" className="text-sm text-destructive">
                {errors.rol.message}
              </p>
            )}
          </div>
          <div className="flex items-end gap-2 pb-2.5">
            <input
              id="estado"
              type="checkbox"
              disabled={esPropio}
              className="size-4 accent-primary"
              {...register('estado')}
            />
            <label htmlFor="estado" className="text-sm font-medium">
              Usuario activo
            </label>
          </div>
        </div>

        {error !== null && (
          <div
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </main>
  )
}
