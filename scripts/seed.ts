/**
 * Datos de prueba para el entorno de desarrollo.
 *
 * Uso (PowerShell):
 *   $env:SEED_ADMIN_EMAIL = "amontoya.jar@gmail.com"
 *   $env:SEED_ADMIN_PASSWORD = "tu-contraseña"
 *   pnpm seed
 *
 * Si el usuario admin no existe en Authentication, el seed lo crea
 * (nombre desde SEED_ADMIN_NOMBRE o "Administrador"). El documento
 * `usuarios/{uid}` con rol admin se crea una sola vez en consola
 * (las reglas impiden el auto-registro) y luego se re-ejecuta.
 * Se detiene si ya existen personas (no duplica datos).
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { getDocs, limit, query } from 'firebase/firestore'
import { auditar } from '@/features/auditoria/services/auditoriaService'
import {
  anularAporte,
  createAporte,
  fechaInputADate,
} from '@/features/aportes/services/aporteService'
import { createPersona } from '@/features/personas/services/personaService'
import { getUsuario } from '@/features/usuarios/services/usuarioService'
import { auth } from '@/firebase/config'
import { collections } from '@/firebase/firestore'

interface PersonaSeed {
  nombre: string
  direccion: string
  telefono: string
  estado: boolean
}

interface AporteSeed {
  persona: number
  desfaseMeses: number
  dia: number
  monto: number
  concepto: string
  anular?: string
}

const PERSONAS: PersonaSeed[] = [
  { nombre: 'Juan Carlos Pérez', direccion: 'Av. Brasil 1234', telefono: '77712345', estado: true },
  { nombre: 'María Elena López', direccion: 'Calle Sucre 456', telefono: '77654321', estado: true },
  { nombre: 'Pedro Gómez Quispe', direccion: 'Av. Banzer 789', telefono: '77556789', estado: true },
  { nombre: 'Ana María Torres', direccion: 'Calle Libertad 321', telefono: '77443210', estado: true },
  { nombre: 'Luis Fernando Vargas', direccion: 'Av. Piraí 654', telefono: '77332109', estado: false },
  { nombre: 'Carmen Rosa Flores', direccion: 'Calle 24 de Septiembre 987', telefono: '77221098', estado: true },
  { nombre: 'Jorge Luis Morales', direccion: 'Av. Viedma 147', telefono: '77110987', estado: true },
  { nombre: 'Rosa Isabel Chávez', direccion: 'Calle Cochabamba 258', telefono: '77009876', estado: true },
]

const APORTES: AporteSeed[] = [
  { persona: 0, desfaseMeses: 0, dia: 3, monto: 150, concepto: 'Aporte voluntario' },
  { persona: 1, desfaseMeses: 0, dia: 4, monto: 100, concepto: 'Cuota mensual' },
  { persona: 2, desfaseMeses: 0, dia: 5, monto: 150.5, concepto: 'Aporte voluntario' },
  { persona: 3, desfaseMeses: 0, dia: 6, monto: 200, concepto: 'Cuota extraordinaria' },
  { persona: 0, desfaseMeses: 0, dia: 7, monto: 75.25, concepto: 'Donación', anular: 'Monto duplicado por error de digitación' },
  { persona: 5, desfaseMeses: 0, dia: 8, monto: 120, concepto: 'Aporte voluntario' },
  { persona: 1, desfaseMeses: 1, dia: 10, monto: 100, concepto: 'Cuota mensual' },
  { persona: 6, desfaseMeses: 1, dia: 12, monto: 300, concepto: 'Aporte voluntario' },
  { persona: 7, desfaseMeses: 1, dia: 15, monto: 80, concepto: 'Donación' },
  { persona: 2, desfaseMeses: 1, dia: 18, monto: 250, concepto: 'Cuota mensual', anular: 'La persona solicitó la devolución' },
  { persona: 3, desfaseMeses: 2, dia: 5, monto: 200, concepto: 'Cuota mensual' },
  { persona: 6, desfaseMeses: 2, dia: 20, monto: 500, concepto: 'Aporte voluntario' },
]

/** Fecha ISO (yyyy-MM-dd) N meses atrás; el día se limita al día actual si es el mes en curso. */
function fechaISO(desfaseMeses: number, dia: number): string {
  const ahora = new Date()
  const base = new Date(ahora.getFullYear(), ahora.getMonth() - desfaseMeses, 1)
  const ultimoDia = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()
  let diaFinal = Math.min(dia, ultimoDia)
  if (desfaseMeses === 0) {
    diaFinal = Math.min(diaFinal, ahora.getDate())
  }
  const mm = String(base.getMonth() + 1).padStart(2, '0')
  return `${base.getFullYear()}-${mm}-${String(diaFinal).padStart(2, '0')}`
}

function codigoAuth(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return (error as { code: string }).code
  }
  return null
}

/**
 * Inicia sesión; si el usuario no existe, lo crea (bootstrap del primer
 * admin). La contraseña nunca queda registrada en el repositorio.
 */
async function asegurarAdmin(email: string, password: string): Promise<string> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user.uid
  } catch (error) {
    const code = codigoAuth(error)
    if (code !== 'auth/user-not-found' && code !== 'auth/invalid-credential') {
      if (code === 'auth/configuration-not-found') {
        throw new Error(
          'Habilite el proveedor Email/Password en la consola Firebase (Authentication → Sign-in method) y vuelva a ejecutar.',
        )
      }
      throw error
    }
    try {
      const creado = await createUserWithEmailAndPassword(auth, email, password)
      const nombre = process.env.SEED_ADMIN_NOMBRE ?? 'Administrador'
      await updateProfile(creado.user, { displayName: nombre }).catch(
        (e: unknown) => console.error(e),
      )
      console.log(`Usuario admin creado en Authentication: ${email}`)
      return creado.user.uid
    } catch (errorCreacion) {
      if (codigoAuth(errorCreacion) === 'auth/email-already-in-use') {
        throw new Error('El usuario existe pero la contraseña es incorrecta.')
      }
      throw errorCreacion
    }
  }
}

async function main(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (email === undefined || email === '' || password === undefined || password === '') {
    throw new Error('Defina SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD antes de ejecutar.')
  }

  const uid = await asegurarAdmin(email, password)
  console.log(`Sesión iniciada como ${email}`)

  try {
    const perfil = await getUsuario(uid)
    if (perfil === null) {
      const nombre = process.env.SEED_ADMIN_NOMBRE ?? 'Administrador'
      throw new Error(
        [
          'Falta el documento del administrador en Firestore.',
          'Créelo en la consola con ID:',
          `  usuarios/${uid}`,
          'y campos:',
          `  nombre: "${nombre}"`,
          `  email: "${email.trim().toLowerCase()}"`,
          '  rol: "admin"',
          '  estado: true',
          '  createdAt/updatedAt: timestamp actual',
          'Luego vuelva a ejecutar pnpm seed.',
        ].join('\n'),
      )
    }
    if (perfil.rol !== 'admin' || !perfil.estado) {
      throw new Error('El usuario del seed debe ser admin y estar activo.')
    }
    const existentes = await getDocs(query(collections.personas, limit(1)))
    if (!existentes.empty) {
      throw new Error('Ya existen personas registradas. El seed no duplica datos.')
    }

    const ids: string[] = []
    for (const p of PERSONAS) {
      const id = await createPersona(p)
      ids.push(id)
      auditar({
        usuarioId: uid,
        accion: 'persona.crear',
        entidad: 'personas',
        entidadId: id,
        descripcion: `[seed] ${p.nombre}`,
      })
    }
    console.log(`Personas creadas: ${ids.length}`)

    let anulados = 0
    for (const a of APORTES) {
      const personaId = ids[a.persona]
      if (personaId === undefined) {
        throw new Error(`Índice de persona fuera de rango: ${a.persona}`)
      }
      const { id, numeroRecibo } = await createAporte(
        {
          personaId,
          fecha: fechaInputADate(fechaISO(a.desfaseMeses, a.dia)),
          monto: a.monto,
          concepto: a.concepto,
        },
        { usuarioRegistroId: uid },
      )
      auditar({
        usuarioId: uid,
        accion: 'aporte.crear',
        entidad: 'aportes',
        entidadId: id,
        descripcion: `[seed] Recibo N.º ${numeroRecibo}`,
      })
      if (a.anular !== undefined) {
        await anularAporte(id, a.anular, uid)
        auditar({
          usuarioId: uid,
          accion: 'aporte.anular',
          entidad: 'aportes',
          entidadId: id,
          descripcion: `[seed] Recibo N.º ${numeroRecibo}: ${a.anular}`,
        })
        anulados += 1
      }
    }
    console.log(`Aportes creados: ${APORTES.length} (${anulados} anulados)`)
    console.log('Seed completado.')
  } finally {
    await signOut(auth)
  }
}

main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error)
  if (mensaje.includes('permission-denied') || mensaje.includes('offline')) {
    console.error(
      'Sin acceso a Firestore. Despliegue las reglas con: firebase deploy --only firestore:rules,firestore:indexes',
    )
  } else {
    console.error(mensaje)
  }
  process.exit(1)
})
