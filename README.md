# EjiXhole Experience OS — Frontend (React)

Portal de administración. Ver `docs/frontend-diseno.md` (arquitectura
completa aprobada), `docs/entrega-1.md` (infraestructura), `docs/entrega-2.md`
(Dashboard real), `docs/entrega-3a.md` (infraestructura CRUD + Clientes),
`docs/entrega-3b.md` (Servicios) y `docs/entrega-3c.md` (Reservaciones).

## Requisitos

- Node.js 18+
- El backend de EjiXhole corriendo (ver el repo `Ejixhole-Backend`)

## Instalación

```bash
npm install
cp .env.example .env
# Edita .env si tu backend no corre en http://localhost:8000
npm run dev
```

Abre `http://localhost:5173`.

## ⚠️ Nota importante sobre esta entrega

Este proyecto se escribió en un entorno sin acceso al registro de npm
(no se pudo ejecutar `npm install` ni `tsc` con las dependencias
reales para validar). Se revisó manualmente cada archivo y se corrió
`tsc --noEmit` de forma parcial (sin poder resolver los paquetes) para
atrapar errores de sintaxis. Antes de construir el siguiente módulo:

```bash
npm install
npm run build
```

Si `tsc -b` marca algún error real (no relacionado a paquetes
faltantes, que no debería pasar tras `npm install`), avísame el
mensaje exacto — mismo protocolo que usamos con el backend.

## Estructura

Ver `docs/frontend-diseno.md` sección 2 para el árbol completo
explicado. Resumen rápido:

- `src/api/` — un archivo por módulo del backend, funciones puras de HTTP.
- `src/context/AuthContext.tsx` — sesión, login/logout, restauración de token.
- `src/router/` — rutas, guards (`RequireAuth`, `RequireRole`), navegación.
- `src/components/ui/` — primitivos shadcn/ui (escritos a mano, ver nota abajo).
- `src/components/shared/` — infraestructura CRUD reutilizable: `DataTable`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `TableSkeleton`.
- `src/components/layout/` — Sidebar, Topbar, AppShell.
- `src/lib/format.ts` — formateadores compartidos (moneda, etc.) — nunca se duplican por módulo.
- `src/features/` — un folder por módulo de negocio: `auth/`, `dashboard/`, `clientes/`, `servicios/`.
- `src/pages/` — páginas que no pertenecen a un módulo específico (404, no autorizado, placeholders).

## Nota sobre shadcn/ui

Los componentes en `src/components/ui/` se escribieron a mano
siguiendo exactamente los patrones oficiales de shadcn/ui, porque no
hay acceso a `npx shadcn@latest add ...` en el entorno donde se generó
esto. Una vez que tengas `npm install` corrido, puedes usar el CLI
normalmente para agregar los que falten (Select, Toast con Radix,
etc.):

```bash
npx shadcn@latest add select
```

`components.json` ya está configurado para que el CLI los coloque en
el lugar correcto.

## Qué ya funciona

- Login, sesión JWT, protección de rutas por rol.
- Dashboard real (`/dashboard/resumen`).
- Clientes: listar, buscar, crear, editar, desactivar.
- Servicios: listar, buscar, crear, editar, desactivar.
- Reservaciones: listar (con filtros reales de estado/servicio/fechas), buscar, crear, cambiar estado, cancelar (con confirmación).

## Qué falta (a propósito, por entregas)

Pagos, Caja, Reportes, Usuarios — cada ruta ya navega y respeta
permisos por rol, pero muestra "Próximamente" hasta su entrega
correspondiente.

## Limitación real heredada del backend: no se pueden editar los datos de una reservación

El backend nunca implementó un endpoint para modificar
fecha/personas/cliente/servicio de una reservación ya creada — solo
`POST` (crear), `GET` (listar/detalle) y `PATCH .../estado` (cambiar
estado). Por eso "editar" en este módulo significa **cambiar
estado**, no un formulario de edición completo. Ver `docs/entrega-3c.md`.
