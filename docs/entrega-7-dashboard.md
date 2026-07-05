# Frontend React — Entrega 7: Dashboard reconstruido desde cero

Alcance: solo Dashboard (`DashboardPage` y sus componentes exclusivos).
Sin backend, sin endpoints, sin hooks nuevos, sin rutas, sin permisos
tocados.

## 1. Análisis del Dashboard anterior (Entrega 6)

Por qué seguía viéndose genérico, aunque ya tenía hero + banner:

1. **Jerarquía falsa**: 1 tarjeta grande (el hero) + 6 tarjetas idénticas en grid — "1 grande + 6 iguales", no una jerarquía real de varios niveles.
2. **La ilustración SVG era decorativa, no informativa** — no comunicaba nada del estado real de hoy.
3. **Una sola columna vertical** (hero → grid → timeline) — la estructura de cualquier panel de admin genérico.
4. **Sin fotografía real** — el mayor desperdicio de identidad de marca disponible, ahora resuelto.
5. **Sin indicador de tendencia visual** — números pelones se sienten a hoja de cálculo.

## 2. Qué NO se fabricó (para no romper lo ya establecido)

Se usó la imagen de referencia como dirección de diseño, no como
plantilla a copiar. Dos cosas del mockup de referencia no se
implementaron a propósito:

- **Widget de clima** — el backend no tiene ese dato. Fingirlo habría roto el principio de "nunca inventar datos" mantenido en las 6 entregas anteriores.
- **Mapa del parque con pines** — tampoco hay datos de ubicación reales en el backend. Un mapa con pines falsos se ve como una función rota.

El panel lateral usa solo datos reales: estado del sistema
(`GET /status`, ya existente) y la hora real de última sincronización
(`dataUpdatedAt` de React Query). También corregí una imprecisión que
casi se cuela: `GET /status` no verifica la base de datos por
separado, así que el panel muestra un único indicador "API backend",
no un "Base de datos: En línea" inventado.

## 3. Fotografía real

Extraje 4 fotos reales del parque de la cuadrícula de Facebook que
compartiste (`public/park/`): `pool-turquesa.jpg` (hero),
`paddleboard.jpg` (panel lateral), `canoa.jpg` y `kayak.jpg`
(disponibles para uso futuro, no usadas todavía). Evité a propósito
fotos con rostros de menores identificables en primer plano por
privacidad — se priorizaron tomas escénicas con personas
pequeñas/distantes.

**Limitación honesta de resolución**: estas fotos vienen de un
screenshot de una cuadrícula de galería, no del archivo original en
alta resolución, así que cada una quedó en ~406×390px. Se ven bien a
los tamaños que se usan aquí, pero si me compartes los archivos
originales en mejor resolución, los reemplazo sin tocar código.

## 4. Estructura nueva

```
DashboardHero          → foto real de fondo + saludo + chip de estado real + "Ingresos del mes" destacada
KpiFeatured x2          → "Reservaciones activas" y "Saldo pendiente total", con TrendBar real
┌─────────────────────────────┬──────────────────┐
│ Card "Más indicadores"      │ DashboardSidePanel│
│  → KpiCompact x6 (lista)    │  → foto real      │
│ ActividadReciente (admin)   │  → estado sistema │
└─────────────────────────────┴──────────────────┘
```

Las 9 tarjetas reales del backend se reparten en 3 niveles de
jerarquía en vez de "1 grande + resto igual": 1 en el hero, 2
"featured" con barra de tendencia, 6 en una lista compacta.

### TrendBar: honesto sobre qué dato es real

`TrendBar.tsx` dibuja una sola barra de magnitud (no un sparkline de
varios puntos) porque el backend solo da un número
(`comparacion_porcentaje`, el punto actual contra el periodo
anterior). Una línea de varios puntos habría insinuado una serie
histórica que no existe.

## Archivos nuevos

- `src/features/dashboard/KpiFeatured.tsx`
- `src/features/dashboard/KpiCompact.tsx`
- `src/features/dashboard/TrendBar.tsx`
- `src/features/dashboard/dashboardIcons.ts`
- `src/features/dashboard/DashboardSidePanel.tsx`
- `public/park/pool-turquesa.jpg`, `paddleboard.jpg`, `canoa.jpg`, `kayak.jpg`
- `docs/entrega-7-dashboard.md`

## Archivos reescritos por completo

- `src/features/dashboard/DashboardPage.tsx`
- `src/features/dashboard/DashboardHero.tsx`
- `src/features/dashboard/DashboardSkeleton.tsx`

## Archivo eliminado

- `src/features/dashboard/KpiCard.tsx` — reemplazado por `KpiFeatured.tsx` + `KpiCompact.tsx`.

## Archivos NO tocados (a propósito)

- `ActividadReciente.tsx` — el timeline de la Entrega 6 seguía siendo una buena pieza; se reutiliza tal cual en la nueva columna izquierda.
- `formatters.ts`, `useDashboard.ts` — sin cambios.
- Sidebar, Topbar, Login, y los demás 7 módulos — fuera de alcance según tu instrucción explícita.

## ¿Más del 50% cambió?

Sí — `DashboardPage.tsx` es una reescritura completa (layout de 2
columnas que no existía, jerarquía de 3 niveles que no existía),
`DashboardHero.tsx` cambió su fuente visual principal, se eliminó un
componente completo y se crearon 5 archivos nuevos. Lo único
conservado tal cual fue `ActividadReciente.tsx`.

## Verificación de compilación

```bash
tsc --noEmit --project tsconfig.app.json --ignoreDeprecations 6.0
```

Sin errores nuevos reales, sin variables/imports sin usar. Los
hallazgos son las mismas causas raíz ya documentadas desde las
Entregas 1-2 (ahora también en `KpiFeatured`/`KpiCompact` por usar
`key` en `.map()`).

**Sobre `npm run build`:** sin acceso al registro de npm en este
entorno, como en cada entrega. Corre `npm install && npm run build`
en tu máquina antes de dar esto por bueno.

## Cómo probarlo

```bash
npm install
npm run build
npm run dev
```

1. Dashboard → foto real de la alberca turquesa de fondo en el hero, saludo, métrica de ingresos del mes.
2. 2 tarjetas grandes con barra de tendencia.
3. Columna izquierda: lista compacta de 6 indicadores + timeline (admin).
4. Columna derecha: foto real del paddleboard + estado del sistema con hora real de sincronización.
5. Apaga el backend y refresca → hero y panel lateral deben mostrar "Sin conexión" en rojo.

**Aislamiento:** Login, Sidebar, Topbar, ⌘K, Clientes, Servicios, Reservaciones, Pagos, Caja y Reportes siguen funcionando exactamente igual.

## Backend

No se tocó ningún archivo del backend.
