# Frontend React — Entrega 8: Dashboard operativo premium (fiel a referencia)

Alcance: solo el contenido interno del Dashboard (Sidebar/Topbar NO se
tocaron — no estaban en la lista de "sí puedes tocar"). Sin backend,
sin endpoints, sin rutas, sin permisos tocados.

## Mapeo imagen → dato real (hecho antes de programar)

| Elemento de la imagen | Fuente real | Decisión |
|---|---|---|
| "Parque Abierto" | No existe en el backend | **Decorativo**, documentado explícitamente en el código y aquí — no hay concepto de "parque abierto/cerrado" en tiempo real |
| Clima 24°C | No existe endpoint | **Decorativo**, por instrucción tuya explícita |
| "Visitantes hoy" | No existe en `/dashboard/resumen` | Sustituido por **"Clientes nuevos (mes)"** (real) |
| "Reservaciones activas" | `/dashboard/resumen` | Real, sin cambios |
| "Ingresos hoy" | `/dashboard/resumen` | Real, sin cambios |
| "Caja actual" | No existe en `/dashboard/resumen` (es dato de Caja, no de Dashboard) | Sustituido por **"Diferencia de caja (hoy)"** (real, sí está en el endpoint) |
| Mini-sparkline por KPI | El backend solo da 2 puntos (`comparacion_valor_anterior`, `valor`) | Línea real de **2 puntos**, no un sparkline de 7 días fabricado |
| "Actividad reciente" (eventos mixtos: pagos, check-in, caja) | No existe un endpoint de bitácora unificada | Sustituido honestamente por **próximas reservaciones confirmadas reales** (mismo dato que ya usábamos, re-etiquetado sin pretender ser algo que no es) |
| "Próximas reservaciones" (cards con foto) | `/reportes/proximas-reservaciones` | Real. Las fotos de cabaña/tienda de la referencia se sustituyeron por **íconos** (Home/Tent/Waves) — no hay foto real por servicio en el backend, y usar una foto genérica al lado de una reservación real habría insinuado que es la foto de ese lugar específico |
| "Servicios más vendidos" | `/reportes/servicios-mas-vendidos` | Real |
| "Reservaciones por estado" (dona) | `/reportes/reservaciones-por-estado` | Real |
| "Ingresos últimos 7 días" | `/reportes/ingresos` (rango fijo, agrupado por día) | Real, múltiples puntos genuinos (no fabricados) |
| "Resumen mensual" | Tarjeta "Ingresos del mes" de `/dashboard/resumen` | Real — y por eso es la única sección "extra" visible para los 3 roles, no solo admin |
| "Estado del sistema" | `GET /status` | Real. Se muestra un único indicador "API backend" — `/status` no verifica la base de datos por separado, así que no se inventó una fila de "Base de datos: En línea" |

## Rol y qué ve cada quien

Todo lo que depende de `/reportes/*` es **admin-only en el backend**
(confirmado desde la Entrega 3F). El Dashboard es visible para los 3
roles. Por eso:

- **Admin**: ve el layout completo de la referencia — franja superior, hero, 4 KPIs, actividad + próximas reservaciones + panel derecho (estado + resumen mensual + servicios más vendidos), y la fila de gráficas inferior (reservaciones por estado + ingresos 7 días).
- **Operador/Cajero**: ven la franja superior, hero, 4 KPIs (reales, de `/dashboard/resumen`), y "Resumen mensual" + "Estado del sistema" (ninguno de los 2 requiere Reportes). Un aviso honesto al final explica que el resto requiere rol de administrador — no se les muestra una sección vacía sin explicación, ni se rellena con datos falsos.

## Archivos nuevos

- `src/features/dashboard/MiniTrendLine.tsx` — línea de 2 puntos reales.
- `src/features/dashboard/KpiRowCard.tsx` — tarjeta de KPI uniforme (ícono + valor + tendencia + mini-línea).
- `src/features/dashboard/ProximasReservacionesCards.tsx`
- `src/features/dashboard/ServiciosMasVendidosPanel.tsx`
- `src/features/dashboard/ReservacionesPorEstadoChart.tsx`
- `src/features/dashboard/IngresosUltimos7DiasChart.tsx`
- `src/features/dashboard/ResumenMensualCard.tsx`
- `docs/entrega-8-dashboard-operativo.md`

## Archivos reescritos

- `src/features/dashboard/DashboardPage.tsx` — ensambla todo, con la lógica de "qué ve cada rol" explícita.
- `src/features/dashboard/DashboardHero.tsx` — ya no tiene el panel de métrica destacada de la Entrega 7 (la referencia no lo pide); ahora incluye la tarjeta de clima decorativa.
- `src/features/dashboard/DashboardSidePanel.tsx` — se quitó la foto (ese tipo de tarjeta vive en el Sidebar en la nueva referencia, fuera de alcance); queda solo "Estado del sistema".
- `src/features/dashboard/DashboardSkeleton.tsx` — refleja la nueva forma exacta de la página.
- `src/types/dashboard.ts` — comentario actualizado (referencia a componentes que ya no existen).

## Archivos eliminados (huérfanos de la Entrega 7)

- `KpiFeatured.tsx`, `KpiCompact.tsx`, `TrendBar.tsx` — reemplazados por `KpiRowCard.tsx` + `MiniTrendLine.tsx` para coincidir exactamente con el layout de tu imagen (4 tarjetas uniformes, no una jerarquía de 1+2+6).

## Archivo NO tocado

- `ActividadReciente.tsx` — ya era honesto (título explica que son "próximas visitas confirmadas"), se reutiliza tal cual.

## Fotografía

Se reutiliza `public/park/pool-turquesa.jpg` (de la Entrega 7) para el
hero. `paddleboard.jpg`, `canoa.jpg`, `kayak.jpg` siguen disponibles
sin usar. Ninguna foto usada muestra el texto "Baños" ni está mal
recortada — se verificó explícitamente contra esa instrucción tuya.

## Bug real evitado antes de entregar

Al armar la franja superior, dejé una llamada a `useEstadoSistema()`
sin usar en `DashboardPage.tsx` (había decidido que "Parque Abierto"
fuera puramente decorativo, no atado al estado real del servidor, para
no confundir "backend en línea" con "parque físicamente abierto" —
son cosas distintas). `tsc` lo marcó como variable sin usar
(`TS6133`); se eliminó la llamada.

## Verificación de compilación

```bash
tsc --noEmit --project tsconfig.app.json --ignoreDeprecations 6.0
```

Sin errores nuevos reales, sin variables/imports sin usar. Los
hallazgos son las mismas 2 causas raíz ya documentadas desde las
Entregas 1-2.

**Sobre `npm run build`:** sin acceso al registro de npm en este
entorno, como en cada entrega. Corre `npm install && npm run build`
en tu máquina antes de dar esto por bueno.

## Responsive

Franja superior: `flex-wrap`. Hero: min-height fijo, texto se apila en mobile (`flex-col sm:flex-row`). KPIs: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. Cuerpo de 3 columnas: `grid-cols-1 lg:grid-cols-12` (se apila completo en mobile/tablet). Gráficas inferiores: `grid-cols-1 lg:grid-cols-2`.

## Cómo probarlo

```bash
npm install
npm run build
npm run dev
```

1. Login como **admin** → Dashboard debe verse igual a la estructura de tu imagen: franja + hero + 4 KPIs + 3 columnas + 2 gráficas abajo.
2. Login como **operador** o **cajero** → Dashboard reducido y honesto: franja + hero + 4 KPIs + Resumen mensual + Estado del sistema + aviso de que el resto requiere admin.
3. Apaga el backend → el indicador de "Estado del sistema" debe pasar a rojo.
4. Revisa "Próximas reservaciones" → deben ser íconos, no fotos de cabañas que no existen.

**Aislamiento:** confirma que Login, Sidebar, Topbar, ⌘K, Clientes, Servicios, Reservaciones, Pagos, Caja y Reportes siguen funcionando exactamente igual.

## Backend

No se tocó ningún archivo del backend.
