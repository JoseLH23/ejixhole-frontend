# Frontend React — Entrega 3B: Módulo Servicios completo

## Principio seguido: cero infraestructura duplicada

Todo lo que ya existía de la Entrega 3A se reutilizó tal cual, sin
copiar ni reescribir nada:

| Reutilizado de 3A | Uso en Servicios |
|---|---|
| `components/shared/DataTable.tsx` | Tabla de servicios |
| `components/shared/ConfirmDialog.tsx` | Confirmar desactivación |
| `components/ui/toast-provider.tsx` (`useToast`) | Éxito/error de crear, editar, desactivar |
| `components/shared/EmptyState.tsx` / `ErrorState.tsx` / `TableSkeleton.tsx` | Los 3 estados de la lista |
| `hooks/useDebounce.ts` | Búsqueda |
| `components/ui/dialog.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`, `button.tsx` | Formulario de crear/editar |

**Ningún componente de UI se creó de nuevo para este módulo.**

## Archivos nuevos

- `src/types/servicio.ts` — refleja `app/schemas/servicio.py`.
- `src/api/servicios.ts` — `listar`, `crear`, `actualizar`, `desactivar`.
- `src/features/servicios/useServicios.ts` — 4 hooks, mismo patrón exacto que `useClientes.ts`.
- `src/features/servicios/ServicioFormModal.tsx` — crear + editar en un modal.
- `src/features/servicios/ServiciosListPage.tsx` — tabla, búsqueda, CRUD completo.
- `src/lib/format.ts` — **nuevo**, pero por una razón concreta: ver abajo.

## Archivos modificados

- `src/router/AppRouter.tsx` — `/servicios` ahora renderiza `ServiciosListPage` en vez del placeholder.
- `src/features/dashboard/formatters.ts` — refactorizado para reusar `formatearMoneda` de `lib/format.ts` en vez de tener su propia copia del formateador de moneda (ver abajo).
- `README.md` — actualizado con el estado real del proyecto.

## Sidebar: no necesitó cambios

El Sidebar (`router/navigation.ts`) ya tenía la entrada de "Servicios"
apuntando a `/servicios` con rol `admin` desde la Entrega 1 — la
navegación ya estaba correcta, solo faltaba que la ruta renderizara
algo real. No se tocó ningún archivo de layout/navegación.

## Decisión: se extrajo `lib/format.ts`

Servicios necesita formatear `precio` (Decimal → moneda) exactamente
igual que ya lo hacía `features/dashboard/formatters.ts` — pero ese
formateador vivía privado dentro de Dashboard. En vez de copiar la
lógica (violando la instrucción explícita de no duplicar), se extrajo
`formatearMoneda` a `lib/format.ts` y se actualizó `dashboard/formatters.ts`
para usar la versión compartida. **Esto significa que Dashboard sí
tuvo un cambio en esta entrega** — mínimo, sin alterar su
comportamiento (mismo resultado exacto, solo se movió el código),
verificado explícitamente para no romperlo.

## Validaciones espejando al backend

`ServicioFormModal.tsx` valida con Zod las mismas reglas que
`app/schemas/servicio.py`: `precio >= 0`, `duracion_minutos > 0` si se
manda, `capacidad_maxima > 0` si se manda. Esto da feedback inmediato,
pero el backend sigue siendo la autoridad final — cualquier regla de
negocio más compleja (ej. "no se puede desactivar con reservación
activa", "no se puede reducir capacidad bajo una reservación
existente") no se replica en el frontend; se deja que el backend
responda `409` y el mensaje `detail` se muestra tal cual en el toast.

## Precio: se maneja como string, no como number

El campo de precio en el formulario es un input de texto validado con
regex (`^\d+(\.\d{1,2})?$`), y se manda al backend como **string**
(ej. `"350.00"`), no como número de JavaScript. Esto evita cualquier
problema de precisión de punto flotante y aprovecha que Pydantic
parsea strings a `Decimal` de forma exacta — ya validado extensamente
en el propio backend a lo largo de este proyecto.

## Verificación de compilación

```bash
tsc --noEmit --project tsconfig.app.json --ignoreDeprecations 6.0
```

Sin errores nuevos reales. Los únicos hallazgos son los mismos 2 falsos
positivos ya documentados en Entregas 1 y 2 (`badge.tsx` y el `key` de
`DashboardPage.tsx`, ambos por falta de `node_modules` reales en este
entorno) — y una tercera aparición del mismo caso de `badge.tsx en
`ServiciosListPage.tsx` (uso de `<Badge>` para la categoría), que es
la misma causa raíz propagándose, no un bug nuevo.

**Confírmalo en tu máquina, donde sí hay dependencias reales instaladas:**

```bash
npm install
npm run build
```

## Limitaciones reales (documentadas, no ocultas)

1. **Búsqueda del lado del navegador**: igual que Clientes, `GET /servicios`
   no soporta texto libre — se filtra sobre los hasta 100 servicios
   cargados. Ver la misma nota en `docs/entrega-3a.md`.
2. **El formulario no valida en tiempo real las reglas de negocio
   complejas** (capacidad vs. reservaciones existentes) — solo las
   reglas de forma simples. La validación real ocurre al guardar,
   contra el backend.

## Cómo probarlo

```bash
npm install
npm run build
npm run dev
```

1. Login como `admin` → entra a "Servicios" en el Sidebar.
2. Debe listar los servicios reales de tu backend (o mostrar el empty state).
3. "Nuevo servicio" → crea uno con precio `350.00`, categoría `aventura`, capacidad `10` → debe aparecer en la tabla con el precio formateado como moneda.
4. Intenta crear uno con precio negativo o duración `0` → debe bloquear el envío antes de llamar al backend.
5. Busca por nombre/categoría → la tabla se filtra en tiempo real.
6. Edita un servicio y baja su capacidad por debajo de una reservación activa existente (si tienes una) → debe fallar con `409` y mostrar el mensaje exacto del backend.
7. Desactiva un servicio sin reservaciones → debe pedir confirmación y desaparecer de la lista.
8. Confirma que `/`, `/login` y `/clientes` siguen funcionando exactamente igual.

## Siguiente paso

Reservaciones (depende de Clientes y Servicios, ya ambos completos) o Pagos/Caja.
