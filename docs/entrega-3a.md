# Frontend React — Entrega 3A: Infraestructura CRUD + Clientes completo

## 1. Infraestructura reutilizable (nueva)

| Archivo | Qué hace |
|---|---|
| `components/ui/dialog.tsx` | Dialog de shadcn/ui (nuevo — requiere `@radix-ui/react-dialog`, agregado a `package.json`). |
| `components/ui/table.tsx` | Primitivos de tabla (Table/TableHeader/TableRow/TableCell...). |
| `components/ui/textarea.tsx` | Para el campo `notas`. |
| `components/ui/toast-provider.tsx` | Sistema de toasts propio — **decisión deliberada**: no se usó `@radix-ui/react-toast` para no agregar una dependencia más que no puedo validar en este entorno sin npm real. Es un Context simple con auto-dismiss a los 5s. |
| `components/shared/DataTable.tsx` | Tabla genérica por columnas — la usa Clientes hoy, y la usarán Reservaciones/Servicios/Pagos/Caja después. |
| `components/shared/ConfirmDialog.tsx` | Confirmación reutilizable para cualquier acción destructiva. |
| `components/shared/EmptyState.tsx` / `ErrorState.tsx` / `TableSkeleton.tsx` | Estados genéricos de loading/error/empty, reutilizados por cualquier lista futura. |
| `hooks/useDebounce.ts` | Para inputs de búsqueda. |

## 2. Clientes — capa de datos

- `src/types/cliente.ts` — refleja `app/schemas/cliente.py` exacto.
- `src/api/clientes.ts` — `listar`, `crear`, `actualizar`, `desactivar`.
- `src/features/clientes/useClientes.ts` — 4 hooks: `useClientes`, `useCrearCliente`, `useActualizarCliente`, `useDesactivarCliente`. Cada mutación invalida la cache de la lista al tener éxito.

## 3. Clientes — UI

- `ClienteFormModal.tsx` — un solo modal para crear y editar (según si recibe un `clienteEditar`).
- `ClientesListPage.tsx` — tabla, búsqueda, crear, editar, desactivar (con confirmación), loading/error/empty.

## Decisiones importantes

### Búsqueda es del lado del cliente (navegador), no del backend
`GET /clientes` no tiene un parámetro de texto libre — solo `solo_activos`/`limit`/`offset`. La búsqueda filtra sobre los hasta 100 clientes ya cargados. **Si el catálogo crece más allá de eso, esto deja de ser confiable** — la solución correcta entonces sería agregar un filtro de búsqueda al backend y paginación real en la tabla. Documentado también como comentario en el código.

### El flujo de "posibles duplicados" no bloquea la creación
El backend siempre crea el cliente y *después* informa si hay coincidencias — no hay un paso de "¿estás seguro?" antes de guardar (así es como ya funciona `ClienteService.crear`). El frontend refleja esto exactamente: si `posibles_duplicados` viene no vacío, se muestra un toast informativo con los nombres, pero el cliente ya quedó creado.

### Campos opcionales vacíos se mandan como `undefined`, no como `""`
Si el usuario deja "Apellido" en blanco, el formulario no manda `apellido: ""` — lo omite del todo. Esto importa especialmente al **editar**: el backend usa `exclude_unset=True`, así que un campo omitido significa "no tocar este campo", mientras que mandar `""` significaría "bórralo". Ver el comentario en `ClienteFormModal.tsx` (`limpiar()`).

## Bug real que encontré y corregí antes de entregar

`EmptyState.tsx` usaba `React.ReactNode` como tipo sin importar `React` — error real de TypeScript, no ruido del entorno (a diferencia de los 2 falsos positivos ya documentados en Entregas 1 y 2, que siguen presentes y sin relación con este cambio: `badge.tsx` y el `key` de `DashboardPage.tsx`). Se corrigió usando `import type { ReactNode } from "react"`.

## Cómo probarlo

```bash
npm install
npm run build   # confirma que tsc no marca nada nuevo real
npm run dev
```

1. Entra a `/clientes` (rol admin u operador) → debe listar los clientes reales de tu backend (o mostrar el empty state si no hay ninguno).
2. "Nuevo cliente" → llena el formulario → debe aparecer un toast de éxito y el cliente en la tabla.
3. Crea otro cliente con el mismo teléfono → debe seguir creándose, pero con un toast informativo de posible duplicado.
4. Busca por nombre/teléfono/email → la tabla debe filtrarse en tiempo real (con debounce).
5. Edita un cliente, cambia el teléfono a uno que ya use otro cliente → debe fallar con `409` y mostrar el mensaje exacto del backend en el toast.
6. Desactiva un cliente → debe pedir confirmación, y al confirmar desaparecer de la lista (sigue activo=false en la BD).
7. Confirma que `/` (Dashboard) y `/login` siguen funcionando exactamente igual que antes.

## Siguiente paso

Reservaciones (el flujo más importante: depende de Clientes y Servicios) o completar el resto de módulos con el mismo patrón ya establecido aquí.
