# Frontend React — Entrega 6: Rediseño radical

Sin backend, sin endpoints, sin lógica de negocio tocada.

## Aviso honesto antes de empezar

Pediste comparar visualmente la versión vieja y la nueva. No tengo
navegador ni capacidad de generar capturas de pantalla en este
entorno — todo lo de abajo es una comparación estructural precisa (qué
componente/layout existía vs. qué existe ahora), no una imagen. Corre
`npm run dev` y compara tú mismo lado a lado con un commit anterior; si
algo se siente insuficiente, dime la pantalla específica y sigo
iterando ahí.

También aviso: no existen fotografías reales de EjiXhole en este
proyecto. En vez de una foto de stock genérica haciéndose pasar por el
parque, construí una ilustración SVG original propia
(`ParkIllustration.tsx`). Si tienes fotos reales, puedo integrarlas en
los mismos lugares donde hoy está la ilustración.

## Comparación estructural, pantalla por pantalla

### Login
| Antes (Entrega 5) | Ahora (Entrega 6) |
|---|---|
| Tarjeta centrada sobre un mosaico repetido pequeño y sutil | Split-screen: panel hero de media pantalla con degradado animado + ilustración propia + copy de marca, formulario limpio al lado |
| Sin movimiento | Degradado animado (18s), cascada con líneas animadas en la ilustración |
| Un solo tono de fondo | Dos zonas con contraste fuerte (hero saturado vs. panel claro) |

### Sidebar
| Antes | Ahora |
|---|---|
| Lista plana de 8 links iguales | 4 secciones agrupadas ("Principal", "Operación", "Análisis", "Administración") |
| Sin buscador | Disparador de la paleta de comandos (⌘K) integrado |
| Logo con insignia + hoja superpuesta | Logo simplificado (la riqueza visual se movió al hero del Login/Dashboard) |

### Topbar
| Antes | Ahora |
|---|---|
| Saludo + reloj + búsqueda embebida + estado — 4 widgets a la vez | Indicador de sección + botón "Buscar ⌘K" + estado + avatar — chrome mínimo |
| Sensación de panel de admin genérico | Sensación de barra de Linear/Arc: casi vacía hasta que se necesita |

### Dashboard — el cambio más grande
| Antes | Ahora |
|---|---|
| `<h1>` de texto plano + grid uniforme de 9 tarjetas iguales | Banner hero (degradado + ilustración) con la métrica principal en grande + 2 chips de vidrio, y grid de las 6 restantes debajo |
| "Actividad reciente" como lista simple | Timeline con línea conectora y puntos |
| Sin jerarquía entre las 9 tarjetas | Jerarquía real: 1 protagonista, 2 chips, 6 de apoyo |

### Elemento nuevo: Command Palette (⌘K)
No es una mejora de algo existente — es una capa que antes no estaba.
Se invoca con ⌘K/Ctrl+K desde cualquier pantalla, navegación por
teclado (flechas + Enter), inspirado en Raycast/Linear. Reemplaza la
búsqueda que antes vivía fija en el Topbar.

### Filtros
| Antes | Ahora |
|---|---|
| Selects/Inputs sueltos sobre el fondo | Envueltos en `FilterBar` — toolbar con borde, fondo sutil y sombra |
| Aplicado en Clientes, Servicios, Reservaciones, Pagos | Mismo componente compartido en los 4 |

## Archivos nuevos

- `src/components/brand/ParkIllustration.tsx`
- `src/components/shared/CommandPalette.tsx`
- `src/components/shared/FilterBar.tsx`
- `src/features/dashboard/DashboardHero.tsx`
- `src/router/breadcrumb.ts`

## Archivos reescritos por completo

- `src/features/auth/LoginPage.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Topbar.tsx`
- `src/components/layout/AppShell.tsx` (+ transición de página)
- `src/features/dashboard/DashboardPage.tsx`
- `src/features/dashboard/ActividadReciente.tsx`
- `src/router/navigation.ts` (+ campo `grupo`)
- `src/index.css` (+ `gradient-mesh-hero`, `glass-panel`, `dot-grid`; se quitó `river-pattern`)

## Archivos modificados (cambio puntual)

- `ClientesListPage.tsx`, `ServiciosListPage.tsx`, `ReservacionesListPage.tsx`, `PagosListPage.tsx` — filtro envuelto en `FilterBar`.

## Archivo eliminado

- `src/hooks/useReloj.ts` — quedó huérfano al quitar el reloj del Topbar; se eliminó en vez de dejar código muerto.

## Decisión explícita: `CajaPage.tsx` no usa `FilterBar`

Su filtro de estado vive junto al título "Historial de cajas" en la
misma fila. Meterlo en `FilterBar` habría encerrado el título dentro
de una caja de toolbar — se dejó tal cual a propósito.

## Bugs reales evitados/corregidos

1. `CommandPalette` no podía abrirse desde botones externos con su
   diseño inicial (estado interno + solo atajo de teclado). Se
   refactorizó a componente controlado antes de integrarlo.
2. Verifiqué explícitamente que no se repitiera el error de clases
   Tailwind inválidas (`h-4.5`) de la entrega anterior — ninguna
   aparición nueva.

## Verificación de compilación

```bash
tsc --noEmit --project tsconfig.app.json --ignoreDeprecations 6.0
```

Sin errores nuevos reales, sin variables/imports sin usar. Los únicos
hallazgos son las mismas 2 causas raíz ya documentadas desde las
Entregas 1-2, no relacionadas con este rediseño.

**Sobre `npm run build`:** mismo aviso que en cada entrega anterior —
sin acceso al registro de npm en este entorno. Corre
`npm install && npm run build` en tu máquina antes de dar esto por bueno.

## Cómo probarlo

```bash
npm install
npm run build
npm run dev
```

1. Login → panel hero animado a la izquierda (solo desktop).
2. ⌘K / Ctrl+K desde cualquier pantalla → paleta de comandos, navega con flechas, Enter.
3. Sidebar → 4 secciones agrupadas; el botón "Buscar..." también abre la paleta.
4. Dashboard → banner hero con "Ingresos del mes" en grande + 2 chips + grid de 6 + timeline (admin).
5. Filtros → Clientes/Servicios/Reservaciones/Pagos ahora tienen contenedor visual.
6. Navega entre secciones → transición sutil de aparición.

**Aislamiento:** Clientes, Servicios, Reservaciones, Pagos, Caja y Reportes conservan el 100% de su funcionalidad — solo cambió cómo se ve.

## Backend

No se tocó ningún archivo del backend.
