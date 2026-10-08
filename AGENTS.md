# AGENTS.md

## 1. Propósito del proyecto

Este proyecto es un sistema web para el **control de aportes voluntarios**.

El sistema debe permitir:

* Autenticación de usuarios.
* Control de acceso mediante roles.
* Registro y administración de personas.
* Registro de aportes voluntarios.
* Consulta del historial de aportes.
* Generación e impresión de recibos.
* Consulta de información por diferentes criterios.
* Administración de usuarios.
* Auditoría de operaciones importantes.
* Dashboard con información resumida.
* Funcionamiento responsive para escritorio, tablet y móvil.

El sistema será desarrollado como una aplicación SPA utilizando React y Firebase.

---

# 2. Stack tecnológico obligatorio

## Frontend

* React 19+
* TypeScript
* Vite
* React Router
* Tailwind CSS v4
* shadcn/ui
* Lucide React

## Formularios y validación

* React Hook Form
* Zod

## Datos

* Firebase Authentication
* Cloud Firestore
* Firebase Storage cuando sea necesario
* Firebase Cloud Functions únicamente cuando una operación deba ejecutarse en servidor

## Estado

* React Context solamente para estado global sencillo.
* TanStack Query cuando sea necesario administrar estado remoto/cache.
* No utilizar Redux salvo que exista una necesidad técnica real y documentada.

## Fechas

* date-fns

## Testing

* Vitest
* React Testing Library

## Calidad

* ESLint
* Prettier
* TypeScript strict mode

## Package manager

Utilizar:

```bash
pnpm
```

No utilizar npm ni yarn para instalar dependencias si el proyecto ya utiliza pnpm.

## Node

Utilizar Node.js 22 LTS.

---

# 3. Principios generales

## 3.1 TypeScript estricto

El proyecto debe utilizar:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

No utilizar `any`.

Si existe una situación excepcional donde `any` sea inevitable, debe estar justificada.

Preferir:

* tipos explícitos
* `unknown`
* type guards
* interfaces
* type aliases
* tipos inferidos mediante Zod

---

# 4. Arquitectura

Utilizar arquitectura basada en funcionalidades:

```text
src/
├── app/
│   ├── App.tsx
│   ├── providers.tsx
│   └── router.tsx
│
├── components/
│   ├── ui/
│   └── shared/
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── personas/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── aportes/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── recibos/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   └── usuarios/
│       ├── components/
│       ├── hooks/
│       ├── schemas/
│       ├── services/
│       └── types/
│
├── firebase/
│   ├── config.ts
│   ├── auth.ts
│   └── firestore.ts
│
├── hooks/
├── lib/
├── types/
├── utils/
├── main.tsx
└── index.css
```

No crear una arquitectura innecesariamente compleja.

La lógica relacionada con una funcionalidad debe permanecer dentro de su feature.

---

# 5. Convenciones de nombres

## Archivos

Utilizar:

```text
PascalCase.tsx
camelCase.ts
```

Ejemplos:

```text
PersonaForm.tsx
PersonaTable.tsx
usePersonas.ts
personaService.ts
personaSchema.ts
```

## Componentes

PascalCase:

```tsx
PersonaForm
AporteTable
ReciboPreview
```

## Hooks

Prefijo `use`:

```tsx
useAuth
usePersonas
useAportes
useCurrentUser
```

## Servicios

Utilizar funciones específicas:

```ts
createPersona()
updatePersona()
getPersona()
listPersonas()
```

Evitar servicios gigantes.

---

# 6. UI

Utilizar:

* Tailwind CSS v4
* shadcn/ui
* Lucide React

No crear componentes visuales complejos desde cero si shadcn/ui ya proporciona una solución adecuada.

Componentes base esperados:

* Button
* Input
* Label
* Select
* Checkbox
* Dialog
* DropdownMenu
* Table
* Card
* Badge
* Alert
* Sheet
* Tabs
* Tooltip
* Skeleton
* Form

Mantener una interfaz administrativa profesional y limpia.

No utilizar emojis como iconos de interfaz.

Utilizar Lucide React.

Ejemplo:

```tsx
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
```

---

# 7. Diseño responsive

La aplicación debe funcionar correctamente en:

* Desktop
* Laptop
* Tablet
* Mobile

Priorizar desktop para las pantallas administrativas, pero no permitir overflow horizontal innecesario.

Las tablas grandes deben utilizar:

* scroll horizontal controlado
* columnas prioritarias
* responsive design

---

# 8. Firebase

La configuración de Firebase debe estar centralizada.

Ejemplo:

```text
src/firebase/config.ts
```

Nunca duplicar la inicialización de Firebase.

Utilizar Firebase SDK modular.

Correcto:

```ts
import {
  getFirestore,
} from "firebase/firestore";
```

Evitar APIs antiguas o patrones deprecated.

---

# 9. Variables de entorno

Utilizar variables:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Crear:

```text
.env.example
```

Nunca subir `.env` real al repositorio.

Agregar `.env` a `.gitignore`.

---

# 10. Firebase Authentication

La autenticación debe utilizar Firebase Authentication.

Método inicial:

```text
Email + Password
```

No almacenar contraseñas en Firestore.

Firebase Authentication es responsable de las credenciales.

La colección `usuarios` solamente almacena información adicional del usuario.

---

# 11. Usuarios

Colección:

```text
usuarios
```

Documento:

```ts
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  estado: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Roles:

```ts
type RolUsuario =
  | "admin"
  | "registro"
  | "consulta";
```

---

# 12. Permisos

## Admin

Puede:

* administrar usuarios
* crear usuarios
* modificar usuarios
* activar/desactivar usuarios
* crear personas
* modificar personas
* registrar aportes
* consultar aportes
* generar recibos
* consultar reportes
* consultar auditoría

## Registro

Puede:

* crear personas
* modificar personas
* registrar aportes
* consultar personas
* consultar aportes
* generar recibos

No puede:

* administrar usuarios
* cambiar roles
* modificar permisos
* acceder a configuración administrativa

## Consulta

Puede:

* consultar personas
* consultar aportes
* consultar recibos
* consultar reportes

No puede:

* registrar aportes
* modificar personas
* eliminar información
* administrar usuarios

---

# 13. Seguridad de roles

Nunca confiar exclusivamente en el frontend para controlar permisos.

Esto:

```tsx
if (user.role === "admin") {
  // mostrar botón
}
```

solamente controla la interfaz.

La seguridad real debe implementarse mediante:

* Firebase Authentication
* Firestore Security Rules
* Custom Claims cuando sea apropiado

El usuario nunca debe poder modificar directamente su propio rol.

---

# 14. Firestore

Colecciones principales:

```text
usuarios
personas
aportes
recibos
auditoria
```

---

# 15. Modelo Persona

Colección:

```text
personas
```

Modelo:

```ts
interface Persona {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  estado: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Campos obligatorios:

```text
nombre
estado
createdAt
updatedAt
```

Campos opcionales:

```text
direccion
telefono
```

---

# 16. Modelo Aporte

Colección:

```text
aportes
```

Modelo:

```ts
interface Aporte {
  id: string;
  personaId: string;
  fecha: Timestamp;
  monto: number;
  concepto: string;
  numeroRecibo: string;
  usuarioRegistroId: string;
  estado: "vigente" | "anulado";
  motivoAnulacion?: string;
  usuarioAnulacionId?: string;
  fechaAnulacion?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

# 17. Reglas importantes de aportes

Los aportes financieros son información sensible dentro del sistema.

Nunca eliminar físicamente un aporte registrado.

No implementar:

```ts
deleteDoc(aporteRef)
```

para aportes.

En caso de error, utilizar anulación:

```text
estado = "anulado"
```

Guardar:

```text
motivoAnulacion
usuarioAnulacionId
fechaAnulacion
```

Esto permite mantener trazabilidad.

---

# 18. Montos

Los montos monetarios deben manejarse con precisión.

No realizar operaciones financieras complejas utilizando directamente números de punto flotante sin considerar problemas de precisión.

Para montos simples almacenados en Firestore, utilizar una representación consistente.

Preferiblemente:

```ts
monto: number
```

con validación a dos decimales.

Ejemplo:

```text
100.00
150.50
75.25
```

Nunca aceptar:

```text
NaN
Infinity
-10
```

salvo que exista una regla de negocio explícita.

Los montos deben ser mayores que cero para un aporte normal.

---

# 19. Número de recibo

El número de recibo debe ser único.

No generar el número de recibo únicamente en React mediante:

```ts
Math.random()
```

ni:

```ts
Date.now()
```

La generación de números correlativos debe realizarse de manera segura.

Cuando exista riesgo de concurrencia, utilizar:

* Firestore transaction
* contador controlado
* Cloud Function cuando sea necesario

Ejemplo:

```text
000001
000002
000003
```

Nunca permitir duplicados.

---

# 20. Fechas

Utilizar:

```ts
Timestamp
```

para fechas persistidas en Firestore.

No guardar fechas importantes como strings arbitrarios.

Utilizar:

```ts
serverTimestamp()
```

cuando la fecha de creación/modificación deba provenir del servidor.

Los timestamps de auditoría no deben depender del reloj del navegador.

---

# 21. createdAt y updatedAt

Todos los documentos principales deben mantener:

```text
createdAt
updatedAt
```

Al crear:

```text
createdAt = serverTimestamp()
updatedAt = serverTimestamp()
```

Al modificar:

```text
updatedAt = serverTimestamp()
```

No permitir que un usuario modifique manualmente `createdAt`.

---

# 22. Auditoría

Colección:

```text
auditoria
```

Modelo:

```ts
interface Auditoria {
  id: string;
  usuarioId: string;
  accion: string;
  entidad: string;
  entidadId: string;
  descripcion?: string;
  createdAt: Timestamp;
}
```

Registrar como mínimo:

* creación de persona
* modificación de persona
* creación de aporte
* anulación de aporte
* creación de usuario
* modificación de usuario
* cambios administrativos importantes

La auditoría no debe poder ser modificada libremente por usuarios normales.

---

# 23. Consultas

Las consultas principales serán:

## Personas

* por nombre
* por teléfono
* por estado
* por ID

## Aportes

* por persona
* por fecha
* por rango de fechas
* por número de recibo
* por estado
* por usuario que registró

## Reportes

* total aportado por periodo
* cantidad de aportes
* total por persona
* aportes vigentes
* aportes anulados

Evitar descargar toda la colección Firestore al navegador para luego filtrarla.

Las consultas deben realizarse utilizando queries de Firestore.

---

# 24. Paginación

Las listas potencialmente grandes deben utilizar paginación.

No realizar:

```ts
getDocs(collection(db, "aportes"))
```

para cargar indefinidamente toda la colección.

Preferir:

```ts
limit()
startAfter()
orderBy()
```

cuando corresponda.

---

# 25. Formularios

Utilizar:

```text
React Hook Form
+
Zod
```

Ejemplo:

```ts
const personaSchema = z.object({
  nombre: z.string().min(2).max(150),
  direccion: z.string().max(255).optional(),
  telefono: z.string().max(30).optional(),
  estado: z.boolean(),
});
```

Nunca depender exclusivamente de validaciones HTML.

---

# 26. Separación de responsabilidades

No hacer esto:

```tsx
function PersonaPage() {
  // 300 líneas de Firestore
  // validaciones
  // lógica de negocio
  // UI
}
```

Separar:

```text
PersonaPage
PersonaForm
PersonaTable
PersonaDialog
personaService
personaSchema
usePersonas
```

Los componentes deben encargarse principalmente de presentación y composición.

---

# 27. Servicios Firebase

Ejemplo:

```ts
export async function createPersona(
  data: CreatePersonaInput
): Promise<string> {
  // implementación Firestore
}
```

El componente no debería contener directamente toda la lógica de Firestore.

Preferir:

```tsx
await createPersona(data);
```

en lugar de mezclar múltiples operaciones Firestore dentro del componente.

---

# 28. Manejo de errores

Nunca ocultar errores silenciosamente.

Incorrecto:

```ts
try {
  await save();
} catch {
}
```

Correcto:

```ts
try {
  await save();
} catch (error) {
  console.error(error);
  // mostrar mensaje amigable al usuario
}
```

Los mensajes para el usuario deben ser comprensibles.

No mostrar errores internos innecesarios.

---

# 29. Estados de carga

Todas las operaciones asíncronas importantes deben tener estados:

```text
loading
success
error
empty
```

Ejemplo:

```text
Cargando personas...

No hay personas registradas.

No se pudieron cargar las personas.

```

No dejar botones activos durante operaciones que puedan generar duplicados.

---

# 30. Prevención de doble registro

Al registrar un aporte:

1. validar formulario
2. deshabilitar botón
3. realizar operación
4. mostrar resultado
5. actualizar la interfaz

Nunca permitir fácilmente dos clics consecutivos que creen dos aportes idénticos.

---

# 31. Dashboard

El dashboard debe mostrar información útil:

```text
Personas activas
Aportes del mes
Total recaudado
Aportes anulados
Últimos aportes
```

El contenido debe adaptarse al rol.

Un usuario `consulta` no necesita controles administrativos.

---

# 32. Recibos

El sistema debe permitir visualizar e imprimir recibos.

El recibo debe contener como mínimo:

```text
Nombre de la institución
Número de recibo
Fecha
Nombre de la persona
Concepto
Monto
Monto literal
Usuario que registró
```

El monto literal debe generarse de manera determinística.

Ejemplo:

```text
Bs 150.00

CIENTO CINCUENTA 00/100 BOLIVIANOS
```

La generación del literal debe estar aislada en una utilidad testeable.

---

# 33. Impresión

El recibo debe tener un formato optimizado para impresión.

Evitar que el diseño administrativo completo aparezca al imprimir.

Utilizar estilos específicos:

```css
@media print {
}
```

El recibo debe poder imprimirse desde el navegador.

---

# 34. Seguridad

Nunca almacenar:

* contraseñas
* tokens manualmente
* secretos
* claves privadas

en Firestore.

Nunca colocar secretos en:

```text
VITE_*
```

si esos valores realmente son secretos.

Recordar que las variables `VITE_*` terminan disponibles en el frontend.

---

# 35. Firestore Security Rules

Las reglas deben negar acceso por defecto.

Conceptualmente:

```text
allow read, write: if false;
```

y luego permitir explícitamente cada operación.

Nunca utilizar en producción:

```text
allow read, write: if true;
```

Los permisos deben depender del usuario autenticado y su rol.

---

# 36. Regla fundamental de seguridad

La UI nunca es la seguridad.

Esto:

```tsx
{user.role === "admin" && <Button />}
```

solamente controla visibilidad.

La autorización real debe estar en Firebase Security Rules y/o backend server-side cuando corresponda.

---

# 37. Rutas

Utilizar React Router.

Ejemplo:

```text
/login

/
/dashboard

/personas
/personas/nueva
/personas/:id
/personas/:id/editar

/aportes
/aportes/nuevo
/aportes/:id

/recibos/:id

/usuarios

/auditoria
```

Las rutas protegidas deben requerir autenticación.

Las rutas administrativas deben requerir el rol correspondiente.

---

# 38. Route Guards

Implementar componentes como:

```text
ProtectedRoute
RoleRoute
```

Ejemplo conceptual:

```tsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

y:

```tsx
<RoleRoute roles={["admin"]}>
  <UsuariosPage />
</RoleRoute>
```

Recordar que esto es una capa de UX/autorización del cliente y no sustituye las Firestore Rules.

---

# 39. Login

El login debe:

* validar email
* validar contraseña
* mostrar errores
* mostrar loading
* impedir múltiples envíos
* mantener sesión mediante Firebase
* redirigir al dashboard después del login

No almacenar manualmente la contraseña.

---

# 40. Estado de autenticación

Crear un `AuthProvider` o mecanismo equivalente.

Debe exponer como mínimo:

```ts
interface AuthContextValue {
  user: User | null;
  profile: Usuario | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}
```

---

# 41. No sobreingeniería

No agregar dependencias porque sí.

Antes de instalar una librería, comprobar si React, Firebase, TypeScript o las librerías ya instaladas resuelven el problema.

Evitar:

* Redux innecesario
* Axios innecesario
* Moment.js
* librerías duplicadas
* frameworks adicionales

---

# 42. TanStack Query

Utilizar TanStack Query cuando realmente aporte valor para:

* cache
* invalidación
* estados de carga
* refetch
* sincronización

No utilizarlo obligatoriamente para absolutamente todo.

Firestore puede manejar directamente ciertas suscripciones en tiempo real.

---

# 43. Tiempo real

Utilizar listeners de Firestore únicamente donde aporten valor.

Ejemplo:

```text
Dashboard
Últimos aportes
```

No utilizar listeners en todas las pantallas sin necesidad.

Cada listener puede aumentar lecturas.

---

# 44. Optimización de costos Firebase

El proyecto debe estar diseñado considerando las cuotas de Firebase.

Evitar:

```text
lecturas innecesarias
listeners permanentes
consultas repetitivas
cargar colecciones completas
refetch excesivo
```

Preferir:

```text
queries específicas
paginación
cache
listeners solamente cuando sean necesarios
```

---

# 45. Firestore índices

Cuando Firestore requiera índices compuestos, agregarlos al archivo de configuración correspondiente.

No intentar solucionar un problema de índice cargando todos los documentos y filtrándolos en React.

---

# 46. Componentes reutilizables

Crear componentes compartidos para:

```text
PageHeader
DataTable
ConfirmDialog
LoadingState
EmptyState
ErrorState
SearchInput
Pagination
StatusBadge
MoneyDisplay
DateDisplay
```

Pero no abstraer componentes demasiado pronto.

Primero identificar patrones reales de repetición.

---

# 47. Formato monetario

Para Bolivia utilizar:

```text
Bs
```

Ejemplo:

```text
Bs 150,00
```

La representación visual puede utilizar configuración regional:

```ts
Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
});
```

Mantener la representación interna consistente.

---

# 48. Idioma

La interfaz inicial será en español.

Utilizar textos claros:

```text
Guardar
Cancelar
Editar
Anular
Buscar
Consultar
Registrar aporte
Generar recibo
```

No mezclar español e inglés en la interfaz.

El código puede permanecer en inglés si mejora consistencia técnica.

Ejemplo:

```text
PersonaForm
AporteService
```

pero:

```text
"Registrar aporte"
```

en la interfaz.

---

# 49. Accesibilidad

Los componentes deben considerar:

* labels
* keyboard navigation
* focus
* aria-label cuando sea necesario
* contraste
* estados de error

No utilizar solamente color para indicar estados.

---

# 50. Testing

Crear tests para reglas de negocio críticas.

Prioridad:

1. validación de personas
2. validación de aportes
3. monto
4. generación de monto literal
5. permisos
6. anulación de aportes
7. número de recibo
8. componentes críticos

No es necesario crear tests triviales para cada línea de UI.

---

# 51. Git

Commits pequeños y descriptivos.

Ejemplos:

```text
feat: add persona management
feat: add aporte registration
feat: add role based access
fix: prevent duplicate receipt numbers
test: add aporte validation tests
refactor: extract firestore persona service
```

No utilizar commits genéricos:

```text
update
changes
fix
cosas
```

---

# 52. Proceso obligatorio antes de modificar código

Antes de implementar una funcionalidad:

1. inspeccionar la estructura existente
2. revisar dependencias
3. revisar tipos existentes
4. revisar servicios relacionados
5. revisar reglas Firebase
6. revisar rutas
7. reutilizar componentes existentes
8. implementar el cambio mínimo necesario
9. ejecutar TypeScript
10. ejecutar lint
11. ejecutar tests relacionados

No sobrescribir archivos completos si solamente es necesario modificar una parte.

---

# 53. Comandos esperados

Instalación:

```bash
pnpm install
```

Desarrollo:

```bash
pnpm dev
```

Build:

```bash
pnpm build
```

Lint:

```bash
pnpm lint
```

Tests:

```bash
pnpm test
```

---

# 54. Firebase CLI

Cuando sea necesario utilizar Firebase CLI:

```bash
firebase login
firebase use
firebase deploy
```

La configuración debe mantenerse en:

```text
firebase.json
.firebaserc
```

No incluir credenciales privadas en el repositorio.

---

# 55. Estructura Firebase

Mantener, cuando corresponda:

```text
firebase.json
.firebaserc
firestore.rules
firestore.indexes.json
functions/
```

Si no se necesitan Cloud Functions inicialmente, no agregarlas solamente por anticipación.

---

# 56. Cloud Functions

Utilizar Cloud Functions únicamente para lógica que realmente necesite ejecutarse en un entorno confiable de servidor.

Casos posibles:

* generación segura de números correlativos
* procesos administrativos
* generación de documentos
* operaciones que requieren privilegios
* integraciones externas
* tareas programadas

No mover toda la aplicación a Cloud Functions sin necesidad.

---

# 57. Datos derivados

No duplicar información innecesariamente.

Por ejemplo, un aporte debe guardar:

```text
personaId
```

y no necesariamente copiar:

```text
nombrePersona
direccionPersona
telefonoPersona
```

Si se requiere una copia histórica por razones contables, debe justificarse y tratarse como snapshot explícito.

---

# 58. Integridad de datos

Un aporte debe estar asociado a una persona válida.

Antes de registrar:

```text
personaId
```

verificar que la persona exista y esté habilitada según las reglas de negocio.

No permitir aportes para personas inexistentes.

---

# 59. Personas inactivas

Una persona puede tener:

```text
estado = false
```

Esto no significa que sus aportes históricos desaparezcan.

Los aportes históricos deben permanecer consultables.

No eliminar automáticamente los aportes de una persona inactiva.

---

# 60. Anulación

La anulación de un aporte debe requerir confirmación.

Debe solicitar:

```text
Motivo de anulación
```

El sistema debe guardar:

```text
estado = "anulado"
motivoAnulacion
usuarioAnulacionId
fechaAnulacion
```

Un aporte anulado no debe contabilizarse en los totales vigentes.

---

# 61. Reportes

Los reportes deben indicar claramente si consideran:

```text
solo aportes vigentes
```

o:

```text
vigentes + anulados
```

Por defecto, los totales financieros deben considerar únicamente aportes:

```text
estado = "vigente"
```

---

# 62. Reglas para OpenCode

Cuando una solicitud del usuario sea ambigua:

1. inspeccionar el código existente
2. determinar la intención más probable
3. evitar cambios destructivos
4. si la ambigüedad afecta datos o seguridad, pedir aclaración
5. si es un cambio visual menor, utilizar el patrón existente

No inventar APIs, colecciones o campos si ya existe una estructura establecida.

---

# 63. No modificar infraestructura innecesariamente

No cambiar:

* framework
* bundler
* base de datos
* sistema de autenticación
* estructura principal

sin una razón técnica clara.

No migrar de Firebase a otro proveedor simplemente por preferencia personal.

---

# 64. Seguridad de información

El sistema maneja información de personas y registros financieros.

Por tanto:

* minimizar datos personales
* no mostrar información innecesaria
* aplicar principio de mínimo privilegio
* proteger rutas
* proteger Firestore
* registrar operaciones sensibles
* evitar logs con información personal innecesaria

Nunca imprimir contraseñas, tokens o credenciales en logs.

---

# 65. Objetivo de la primera versión

La primera versión funcional debe incluir:

## Autenticación

* Login
* Logout
* sesión persistente
* roles

## Personas

* listar
* buscar
* crear
* editar
* activar/desactivar
* consultar detalle

## Aportes

* registrar
* consultar
* filtrar
* historial por persona
* anular
* evitar duplicación de recibos

## Recibos

* visualizar
* imprimir
* número único
* monto literal

## Usuarios

Admin:

* listar
* crear
* modificar
* activar/desactivar
* asignar rol

## Dashboard

* personas activas
* aportes del periodo
* total recaudado
* últimos aportes

---

# 66. Orden recomendado de implementación

Implementar en este orden:

### Fase 1

```text
Vite
React
TypeScript
Tailwind
shadcn/ui
Firebase
```

### Fase 2

```text
Firebase Authentication
AuthProvider
Login
ProtectedRoute
Roles
```

### Fase 3

```text
Firestore
Security Rules
usuarios
```

### Fase 4

```text
personas
PersonaForm
PersonaTable
PersonaDetail
```

### Fase 5

```text
aportes
registro
consulta
historial
anulación
```

### Fase 6

```text
recibos
número correlativo
monto literal
impresión
```

### Fase 7

```text
dashboard
reportes
filtros
paginación
```

### Fase 8

```text
auditoría
tests
optimización
seguridad
deploy
```

---

# 67. Criterio de terminado

Una funcionalidad no se considera terminada solamente porque "funciona".

Debe cumplir:

* TypeScript sin errores
* lint sin errores
* validación de formularios
* manejo de loading
* manejo de errores
* permisos correctos
* responsive
* accesibilidad razonable
* reglas Firestore actualizadas
* tests cuando la lógica sea crítica
* sin `any` innecesario
* sin código duplicado evidente
* sin datos sensibles expuestos

---

# 68. Regla final para OpenCode

Priorizar siempre:

```text
Seguridad
>
Integridad de datos
>
Correctitud
>
Mantenibilidad
>
Rendimiento
>
Estética
```

No sacrificar seguridad o integridad de datos para conseguir una implementación más rápida.

Cuando existan varias soluciones válidas, elegir la más sencilla que mantenga correctamente estos principios.
