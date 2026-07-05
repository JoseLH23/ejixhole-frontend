# Frontend React — Entrega 2: Dashboard real

## Qué se implementó

- `src/types/dashboard.ts` — tipos reflejando `app/schemas/dashboard.py`.
- `src/api/dashboard.ts` — `dashboardApi.getResumen()`, única función que llama `GET /dashboard/resumen`.
- `src/features/dashboard/useDashboard.ts` — hook TanStack Query (`useDashboardResumen`), `staleTime` de 1 minuto.
- `src/features/dashboard/formatters.ts` — decide cómo formatear cada tarjeta (dinero/porcentaje/conteo).
- `src/features/dashboard/KpiCard.tsx` — un componente genérico para las 9 tarjetas, sin lógica específica por tarjeta.
- `src/features/dashboard/DashboardSkeleton.tsx` — loading state con el mismo layout de grid que los datos reales.
- `src/features/dashboard/DashboardPage.tsx` — la página real, con loading/error/empty manejados.

## Archivos modificados

- `src/router/AppRouter.tsx` — la ruta `/` ahora renderiza `DashboardPage` en vez del placeholder.

## Archivo eliminado

- `src/pages/HomePage.tsx` — reemplazado por `features/dashboard/DashboardPage.tsx`.

## Decisión de diseño: cómo se formatea cada tarjeta

El backend (`TarjetaOut`) no manda un campo "tipo"/"unidad" — solo
`valor` como `string` (si es dinero, porque así serializa Pydantic los
`Decimal`) o `number` (conteos/porcentajes). `formatters.ts` decide:

1. `valor` es string → siempre dinero → formato moneda MXN.
2. `valor` es number y el título es "Tasa de cancelación (mes)" u
   "Ocupación promedio (mes)" → porcentaje.
3. Cualquier otro number → conteo simple.

**Esto depende de los títulos exactos que genera
`DashboardService.resumen()` en el backend.** Si el backend le cambia
el nombre a una tarjeta, hay que actualizar `TITULOS_PORCENTAJE` en
`formatters.ts` — documentado explícitamente en el archivo para que no
se pierda esa dependencia oculta.

## Estados manejados

- **Loading**: `DashboardSkeleton` — 9 tarjetas pulsando, mismo grid que el real (sin salto visual al cargar).
- **Error**: mensaje + botón "Reintentar" que vuelve a llamar `refetch()`. Si el backend manda un `detail` en el error, se muestra tal cual.
- **Empty**: si `tarjetas` viniera vacío (no debería pasar con el backend actual, que siempre manda 9 — manejado de forma defensiva).
- **Éxito**: grid de `KpiCard`, 1 columna en mobile, 2 en tablet, 3 en desktop.

## Limitación honesta (mismo entorno sin npm)

`tsc --noEmit` parcial encontró un error adicional en
`DashboardPage.tsx` sobre la prop `key` en el `.map()` de tarjetas —
es el patrón de React más estándar que existe (`key` es una prop
especial que React excluye automáticamente de las props del
componente). Case idéntico al ya documentado en `badge.tsx` de la
Entrega 1: ambos apuntan a tipados de `@types/react`/JSX que no
resuelven sin `node_modules` reales. Confírmalo con:

```bash
npm install
npm run build
```

## Cómo probarlo

```bash
npm run dev
```

1. Login con un usuario real → debes llegar a `/` y ver las 9 tarjetas.
2. Si el backend no tiene datos todavía, los valores deben verse en 0/$0.00, sin error.
3. Apaga el backend y refresca `/` → debe verse el estado de error con botón "Reintentar".
4. Enciende el backend de nuevo y da clic en "Reintentar" → debe cargar normalmente.
5. Registra algunos pagos/reservaciones desde Swagger y refresca el Dashboard → los números y flechas de tendencia deben reflejarlo.

## Siguiente paso

CRUD de Clientes (primer módulo con formularios reales, tabla,
paginación) — o el resto de endpoints de Dashboard, según prioricemos.
