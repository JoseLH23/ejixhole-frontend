# EjiXhole Experience OS — Frontend (React)

Portal de administración. Ver `docs/frontend-diseno.md` (arquitectura
completa aprobada) y `docs/entrega-1.md` (qué cubre esta entrega).

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
- `src/components/layout/` — Sidebar, Topbar, AppShell.
- `src/features/` — un folder por módulo de negocio (por ahora solo `auth/`).
- `src/pages/` — páginas que no pertenecen a un módulo específico (Home, 404, etc).

## Nota sobre shadcn/ui

Los componentes en `src/components/ui/` se escribieron a mano
siguiendo exactamente los patrones oficiales de shadcn/ui, porque no
hay acceso a `npx shadcn@latest add ...` en el entorno donde se generó
esto. Una vez que tengas `npm install` corrido, puedes usar el CLI
normalmente para agregar más componentes (Select, Dialog, Table,
Toast, etc. — los que faltan para las próximas entregas):

```bash
npx shadcn@latest add select dialog table toast
```

`components.json` ya está configurado para que el CLI los coloque en
el lugar correcto.

## Qué NO incluye esta entrega (a propósito)

CRUDs de Clientes/Reservaciones/Servicios/Pagos/Caja, Dashboard real
(tarjetas de KPIs), Reportes. Cada sección del menú ya navega y
respeta permisos por rol, pero muestra una pantalla "Próximamente"
— ver `docs/entrega-1.md`.
