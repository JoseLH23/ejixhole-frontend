# EjiXhole Experience OS — Frontend (React)

Portal de administración. Ver `docs/frontend-diseno.md` (arquitectura
completa aprobada), `docs/entrega-1.md` (infraestructura), `docs/entrega-2.md`
(Dashboard real), `docs/entrega-3a.md` (infraestructura CRUD + Clientes),
`docs/entrega-3b.md` (Servicios), `docs/entrega-3c.md` (Reservaciones),
`docs/entrega-3d.md` (Pagos), `docs/entrega-3e.md` (Caja),
`docs/entrega-3f.md` (Reportes), `docs/entrega-4-pulido.md` (pulido UX)
y `docs/entrega-5-premium-ui.md` (branding e identidad visual premium).

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

## Identidad visual (Entrega 5)

Sistema de diseño completo en variables CSS (`src/index.css` +
`tailwind.config.js`) — ningún color está hardcodeado en componentes
(única excepción documentada: `src/lib/chartColors.ts`, porque
Recharts pinta con SVG y necesita strings literales, no `hsl(var(--x))`).

- **Primary** — verde selva (marca, navegación activa, botones principales)
- **Secondary** — turquesa agua (datos, acentos de gráficas)
- **Accent** — beige madera (fondos sutiles de hover)
- **Wood** — madera saturada (acentos puntuales)
- **Success / Warning / Destructive** — semánticos, usados en botones, badges y toasts
- **Surface** — superficie elevada, distinta del fondo general

Ver `docs/entrega-5-premium-ui.md` para el detalle completo.

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
- Reservaciones: listar (filtros reales), buscar, crear, cambiar estado, cancelar.
- Pagos: bitácora general, historial por reservación, registrar (incluye reembolsos), integrado desde Reservaciones.
- Caja: abrir, cerrar (con confirmación), registrar movimientos, mi caja actual, historial.
- Reportes: los 10 reportes existentes en el backend, con filtros de fecha reutilizables, tablas y 3 gráficas de línea + 1 de barras.

## Qué falta (a propósito, por entregas)

Usuarios (admin) — la ruta ya navega y respeta permisos por rol, pero
muestra "Próximamente" hasta su entrega.

## Limitaciones reales heredadas del backend (documentadas, no ocultas)

1. **No se pueden editar los datos de una reservación** — solo cambiar
   su estado. Ver `docs/entrega-3c.md`.
2. **El rol `cajero` no puede listar reservaciones**, aunque sí tiene
   acceso a Pagos — `/pagos` cae a un campo de ID manual cuando esto
   pasa. Ver `docs/entrega-3d.md`.
3. **El JWT no trae el `usuario_id` numérico** — se pide una vez y se
   cachea en el navegador (`useUsuarioIdTemporal`), reutilizado en
   Reservaciones, Pagos y ahora Caja (tercera reutilización).
4. **No existe un endpoint dedicado para "mi caja actual"** — se
   resuelve con el filtro real `GET /caja?usuario_id=X&estado=abierta`
   que el backend sí soporta. Ver `docs/entrega-3e.md`.
