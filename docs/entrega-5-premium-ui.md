# Frontend React — Entrega 5: Premium UI / Branding EjiXhole

Sin módulos nuevos, sin cambios de lógica, endpoints ni rutas — 100%
visual. Cada mejora está justificada abajo con el archivo exacto que la
implementa.

## 1. Sistema de tema completo

**`tailwind.config.js` + `src/index.css`** — reescritos por completo.

| Token | Antes | Ahora | Propósito |
|---|---|---|---|
| `primary` | turquesa río | verde selva | marca, navegación activa, botón principal |
| `secondary` | arcilla | turquesa agua | datos, acentos de gráficas |
| `accent` | arcilla clara | beige madera | fondo sutil de hover |
| `wood` | no existía | madera saturada | acentos puntuales (iconos) |
| `success` | no existía | verde distinto de primary | estados positivos |
| `warning` | no existía | ámbar | estados de alerta |
| `surface` | no existía | superficie elevada | tarjetas dentro de tarjetas |
| `estado.*` | 4 estados | 8 estados | + activo/inactivo/abierta/cerrada |

Radio de bordes global subido de `0.6rem` a `0.75rem`, y se agregaron
`shadow-premium`/`premium-lg`/`premium-hover` y las animaciones
`fade-in-up`/`shimmer` como utilidades reutilizables de Tailwind.

### Auditoría de colores hardcodeados (hallazgo real)

Antes de dar por bueno "cero colores hardcodeados", busqué en todo el
proyecto en vez de asumirlo. Encontré 6 archivos de entregas
anteriores con colores fijos:

- `toast-provider.tsx` y `CajaPage.tsx` usaban `emerald-600` de
  Tailwind directamente → reemplazado por el token semántico `success`.
- `IngresosReportPage.tsx`, `ClientesNuevosReportPage.tsx`,
  `TendenciaReservacionesReportPage.tsx` y
  `ReservacionesPorEstadoReportPage.tsx` tenían hex crudos (`#0D7480`,
  etc.) pasados directo a Recharts, con `ReservacionesPorEstadoReportPage.tsx`
  además duplicando su propio mapa de colores de estado.

Se creó `src/lib/chartColors.ts` como única fuente de verdad para
colores de gráficas. Es una excepción documentada y deliberada:
Recharts pinta con atributos SVG (`stroke`/`fill`), que no resuelven
`hsl(var(--x))` de forma confiable entre navegadores, así que las
gráficas necesitan strings literales. Su mapa de estados coincide
exactamente con el de `<EstadoBadge/>`.

## 2. Dashboard rediseñado

- **`KpiCard.tsx`**: cada una de las 9 tarjetas tiene un ícono Lucide
  con fondo tintado (mapeado por título exacto, mismo patrón que ya
  usa `formatters.ts`). Entrada con `animate-fade-in-up` escalonada.
  Sombra que crece al hover. Flechas de tendencia ahora usan
  `success`/`destructive` en vez de `emerald-600` hardcodeado.
- **`ActividadReciente.tsx`** (nuevo): próximas visitas confirmadas de
  7 días. Reutiliza tal cual el endpoint `GET /reportes/proximas-
  reservaciones` ya construido en la Entrega 3F — cero endpoints nuevos.
- **`DashboardSkeleton.tsx`**: shimmer en vez de `animate-pulse` plano.

### Limitación real respetada: Actividad reciente es solo para admin

`/reportes/*` es admin-only en el backend, pero el Dashboard es visible
para los 3 roles. Si `ActividadReciente` se montara para
operador/cajero, recibiría 403. Se montó condicionalmente en
`DashboardPage.tsx` (`{tieneRol(["admin"]) && <ActividadReciente />}`)
— el hook nunca se ejecuta para esos roles.

## 3. Cards premium

`card.tsx`: `rounded-xl`, `shadow-premium` por defecto, y un nuevo prop
`interactive` (hover con elevación + sombra + cursor pointer) — usado
en `ReportesHubPage.tsx`, que ganó ícono tintado y entrada escalonada.

## 4. Botones

`button.tsx`: se agregaron `success` y `warning` (pedidas
explícitamente). Todas las variantes comparten `active:scale-[0.97]` y
sombra que crece al hover.

## 5. Inputs, Select, Textarea

Mismo lenguaje visual: sombra sutil, `hover:border-primary/30`, focus
con `ring-primary/30` en vez del `ring-ring` genérico anterior.

## 6. Tablas

`table.tsx`: cabecera más marcada, filas alternadas (zebra sutil),
hover tintado con `primary/5`, padding vertical aumentado, contenedor
con `shadow-premium`. `TableSkeleton.tsx`: shimmer.

## 7. Badges — cobertura completa de los 8 estados reales

`badge.tsx`: antes solo cubría los 4 estados de Reservaciones. Se
agregó `activo`/`inactivo` (Clientes/Servicios) y `abierta`/`cerrada`
(Caja) — los 8 estados reales del sistema, todos con
`<EstadoBadge estado="..." />`. Se agregó un punto de color opcional.

`CajaPage.tsx` usaba `<Badge variant="default"|"outline">` a mano —
inconsistente. Ahora usa `<EstadoBadge estado={s.estado} />`.

## 8. Sidebar

Insignia de logo con degradado `from-primary to-secondary` y una hoja
pequeña superpuesta en madera. Item activo con sombra + ícono que
crece al hover. Overlay de mobile con `backdrop-blur`.

## 9. Topbar

- Saludo dinámico + reloj en vivo (`useReloj.ts`).
- Estado del sistema real (`useEstadoSistema.ts` + `api/system.ts`):
  pinta contra `GET /status`, que ya existía en el backend — no es
  decorativo falso.
- Búsqueda rápida funcional: filtra las secciones del menú
  (ya filtradas por rol) y navega al elegir una. Se decidió no simular
  una búsqueda global contra datos porque el backend no expone un
  endpoint de búsqueda unificado.
- Avatar existente conservado, con anillo sutil.

## 10. Microanimaciones

Solo CSS/Tailwind: `animate-fade-in-up`, `animate-shimmer`,
`active:scale-[0.97]`, `hover:-translate-y-0.5`, `group-hover:scale-110`.

## 11. Consistencia entre módulos

Los 8 módulos ya compartían exactamente los mismos primitivos desde
las Entregas 3A-3F — rediseñar esos 7 archivos compartidos actualizó
todos los módulos automáticamente. La única inconsistencia real
(`CajaPage.tsx` con badges ad-hoc) se corrigió en el punto 7.

## 12. Accesibilidad

- Focus visible mejorado en Input/Select/Textarea/Button.
- Colores elegidos con foreground de alto contraste — revisado por
  diseño, no verificado con herramienta automática (sin navegador
  disponible en este entorno para Axe/Lighthouse).
- Responsive heredado de la Entrega 4, sin regresiones; nuevos
  elementos del Topbar se ocultan apropiadamente en mobile.

## Archivos modificados

**Tema:** `tailwind.config.js`, `src/index.css`

**Primitivos UI:** `button.tsx`, `card.tsx`, `input.tsx`, `textarea.tsx`,
`select.tsx`, `dropdown-menu.tsx`, `badge.tsx`, `table.tsx`

**Layout:** `Sidebar.tsx`, `Topbar.tsx`

**Dashboard:** `KpiCard.tsx`, `DashboardPage.tsx`, `DashboardSkeleton.tsx`

**Limpieza de colores:** `toast-provider.tsx`, `CajaPage.tsx`,
`IngresosReportPage.tsx`, `ClientesNuevosReportPage.tsx`,
`TendenciaReservacionesReportPage.tsx`,
`ReservacionesPorEstadoReportPage.tsx`, `ReportesHubPage.tsx`

**Compartidos:** `TableSkeleton.tsx`

**README.md**

## Archivos nuevos

- `src/lib/chartColors.ts`
- `src/api/system.ts`
- `src/hooks/useEstadoSistema.ts`, `src/hooks/useReloj.ts`
- `src/features/dashboard/ActividadReciente.tsx`
- `docs/entrega-5-premium-ui.md`

## Bugs reales que corregí antes de entregar

1. **Clases de Tailwind inválidas**: escribí `h-4.5`/`w-4.5` dos veces
   (`Sidebar.tsx`, `KpiCard.tsx`) — no existen en la escala default de
   Tailwind (salta de 4 a 5). Corregido a `h-5 w-5` y `h-[18px] w-[18px]`.
   En el segundo caso también quité un `style` inline redundante que
   había agregado para "compensar" el error en vez de arreglar la causa.
2. **6 archivos con colores hardcodeados** que violaban el requisito
   explícito de esta entrega — ver sección 1.
3. **`CajaPage.tsx` con Badges inconsistentes** — ver sección 7.

## Verificación de compilación

```bash
tsc --noEmit --project tsconfig.app.json --ignoreDeprecations 6.0
```

Sin errores nuevos reales, sin variables/imports sin usar. Los únicos
hallazgos son las mismas 2 causas raíz ya documentadas desde las
Entregas 1-2, producto de no tener `node_modules` reales en este
entorno — no de esta entrega.

**Sobre `npm run build`:** este entorno no tiene acceso al registro de
npm (igual que en todas las entregas anteriores), así que no pude
ejecutar el build real. Hice la verificación más rigurosa posible sin
esas dependencias (`tsc --noEmit` completo + búsqueda de clases
inválidas + auditoría de colores). Corre `npm install && npm run build`
en tu máquina antes de dar esto por bueno — si algo real aparece,
avísame el mensaje exacto.

## Cómo probarlo

```bash
npm install
npm run build
npm run dev
```

1. Login → el badge circular ahora es un degradado verde→turquesa.
2. Dashboard → tarjetas con íconos y entrada escalonada; si eres admin, "Actividad reciente" debe verse abajo.
3. Topbar → saludo con tu nombre, hora en vivo, indicador de "Sistema en línea" (apaga el backend y espera hasta un minuto para verlo cambiar a rojo), busca "caja" en el menú → debe navegar al hacer clic.
4. Cualquier tabla → filas alternadas, hover verde tenue, cabeceras en mayúsculas.
5. Caja → "abierta"/"cerrada" en el historial con el mismo estilo de badge que el resto del sistema.
6. Reportes → el hub tiene íconos con fondo tintado y se eleva al hover.
7. Mobile (< 768px): Sidebar colapsable, Topbar sin saludo/reloj.

**Aislamiento:** Login, Dashboard, Clientes, Servicios, Reservaciones, Pagos, Caja y Reportes conservan toda su funcionalidad — solo cambió la apariencia.

## Backend

No se tocó ningún archivo del backend.
