# EjiXhole Experience OS — Frontend

Panel administrativo del ecosistema EjiXhole. Permite operar clientes,
servicios, reservaciones, pagos, caja, usuarios, dashboard y reportes
desde una interfaz web protegida por autenticación y permisos por rol.

## Estado

Proyecto en **preproducción**. Los módulos principales ya están conectados
al backend real y actualmente se encuentra en etapa de estabilización,
pruebas integrales y pulido de experiencia de usuario.

## Tecnologías

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- Radix UI
- Recharts

## Módulos disponibles

- Inicio de sesión y sesión JWT
- Permisos por rol
- Dashboard operativo
- Clientes
- Servicios
- Reservaciones
- Pagos
- Caja
- Diez reportes con exportación CSV
- Usuarios: listar, crear y desactivar

## Roles

- `admin`: acceso completo
- `operador`: clientes, reservaciones y caja
- `cajero`: pagos y caja

La interfaz aplica guards de rutas, pero el backend sigue siendo la fuente
definitiva de autorización.

## Arquitectura

```text
src/
├── api/          clientes HTTP por módulo
├── components/   interfaz compartida y layout
├── context/      sesión y estado global
├── features/     módulos de negocio
├── hooks/        lógica reutilizable
├── lib/          utilidades y formatos
├── router/       rutas y permisos
├── types/        contratos TypeScript
└── pages/        páginas generales
```

Los módulos se cargan bajo demanda mediante `React.lazy` para reducir el
peso inicial de la aplicación.

## Instalación local

```powershell
git clone https://github.com/JoseLH23/ejixhole-frontend.git
cd ejixhole-frontend

npm install
Copy-Item .env.example .env
npm run dev
```

La aplicación local se abre normalmente en:

```text
http://localhost:5173
```

## Configuración

En `.env` configura el backend:

```env
VITE_API_URL=http://127.0.0.1:8000
```

En producción debe apuntar al dominio real de la API.

## Compilación

```powershell
npm run build
```

Este comando ejecuta TypeScript y después genera el paquete de producción
con Vite.

## Flujo de autenticación

1. El usuario inicia sesión.
2. El frontend conserva la sesión actual.
3. Axios agrega el token a las solicitudes.
4. Los guards controlan la navegación visible.
5. El backend valida nuevamente el token y el rol.

## Funciones destacadas

### Reservaciones

- Listado y búsqueda
- Creación y edición
- Cambio de estado
- Cancelación
- Integración con clientes, servicios y pagos

### Caja y pagos

- Apertura y cierre de caja
- Registro de movimientos
- Historial de sesiones
- Registro de anticipos, saldos, pagos completos y reembolsos

### Reportes

Incluye diez reportes operativos con filtros, tablas, gráficas y exportación
CSV:

- ingresos
- cuentas por cobrar
- ocupación
- servicios más vendidos
- clientes frecuentes
- reservaciones por estado
- cancelaciones
- tendencia de reservaciones
- clientes nuevos
- próximas reservaciones

## Documentación interna

La carpeta `docs/` conserva el historial de diseño, entregas, decisiones de
interfaz y rediseños realizados durante el desarrollo.

## Pendientes principales

1. Añadir pruebas unitarias de formularios, permisos y utilidades.
2. Añadir pruebas end-to-end de los flujos críticos.
3. Validar expiración de sesión y errores de red.
4. Mejorar accesibilidad por teclado, foco y contraste.
5. Completar administración de usuarios: editar, reactivar y restablecer
   contraseña cuando el backend exponga esas operaciones.
6. Ejecutar una prueba completa desde reservación hasta pago, caja y reporte.
7. Configurar integración continua con GitHub Actions.

## Relación con el ecosistema

- Consume `C-Ejixhole-Backend`.
- Comparte la operación con el portal público `ejixhole-reservas`.
- En una fase posterior recibirá recomendaciones de MH-Core mediante el
  backend, sin conectarse directamente al núcleo de inteligencia.

## Documentación maestra

La visión, arquitectura y roadmap general se mantienen en el repositorio
privado `MH-Ecosystem`.
