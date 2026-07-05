# Frontend React — Entrega 3D: Módulo Pagos completo

## Principio seguido: cero infraestructura duplicada

| Reutilizado | Uso en Pagos |
|---|---|
| `DataTable`, `EmptyState`, `ErrorState`, `TableSkeleton` | Bitácora de `/pagos` |
| `Dialog`, `Select`, `Input`, `Label`, `Textarea`, `Separator`, `Button` | `PagoModal` y `SeleccionarReservacionModal` |
| `useToast` | Éxito/error al registrar un pago |
| `useDebounce` | Búsqueda en la bitácora |
| `formatearMoneda` | Montos en historial y bitácora |
| `useUsuarioIdTemporal` | Mismo campo temporal que ya usa Reservaciones — primera reutilización real entre dos módulos |
| `useReservaciones` (de Reservaciones) | Resolver nombres/saldo en `/pagos` y en el selector de reservación |

**Ningún componente de UI ni hook genérico se creó de nuevo.**

## Archivos nuevos

- `src/types/pago.ts`
- `src/api/pagos.ts`
- `src/features/pagos/usePagos.ts` — `usePagos`, `usePagosDeReservacion`, `useRegistrarPago`.
- `src/features/pagos/PagoModal.tsx` — historial + formulario de registro, para una reservación ya conocida.
- `src/features/pagos/SeleccionarReservacionModal.tsx` — paso previo solo necesario en `/pagos` (ver limitación 1).
- `src/features/pagos/PagosListPage.tsx` — bitácora general de pagos.
- `docs/entrega-3d.md`.

## Archivos modificados

- `src/features/reservaciones/useReservaciones.ts` — se exportó `RESERVACIONES_QUERY_KEY` (antes privada) para que Pagos invalide la cache de Reservaciones sin duplicar el literal.
- `src/features/reservaciones/ReservacionesListPage.tsx` — botón "Pagos" por fila que abre `PagoModal` (la integración pedida). Se corrigió que el contexto (saldo pendiente) se resuelva en vivo, no contra una copia guardada al abrir el modal.
- `src/router/AppRouter.tsx` — `/pagos` real.
- `README.md`.

**Sidebar: sin cambios** — ya apuntaba a `/pagos` con roles admin+cajero desde la Entrega 1.

## Limitación real #1 (la más importante): `cajero` no puede listar reservaciones

Verifiqué `app/routes/reservacion_routes.py` antes de construir esto:
el router completo de Reservaciones exige admin+operador — **`cajero`
recibe 403 en cualquier `GET /reservaciones`**, aunque sí tiene acceso
pleno a Pagos.

`SeleccionarReservacionModal` maneja esto explícitamente: si
`useReservaciones` responde bien (admin), muestra un `Select` con las
reservaciones activas; si falla (403, el caso real de cajero), cae a
un campo de texto para escribir el ID manualmente, con una nota
explicando por qué. Nunca finge que el selector funciona cuando no
puede.

Esto es también lo que hace valiosa la integración desde
Reservaciones (botón "Pagos" por fila): admin/operador nunca necesitan
pasar por ese flujo manual, ya están sobre la fila correcta.

## Limitación real #2: sin contexto de saldo al escribir el ID a mano

Cuando un cajero escribe el ID manualmente, `PagoModal` no puede
mostrar "saldo pendiente: $X" en el encabezado — `GET /reservaciones/{id}`
también es admin+operador. El modal omite esa línea y deja que el
backend valide el monto contra el saldo real al guardar (ya devuelve
un 400 claro si el monto excede el saldo, mostrado en el toast).

## Bug de consistencia corregido antes de entregar

Guardé inicialmente el objeto `Reservacion` completo al abrir
`PagoModal` desde Reservaciones. Al registrar un segundo pago sin
cerrar el modal, el saldo del encabezado seguía mostrando el valor
anterior, porque era una copia tomada al abrir, no algo reactivo. Se
corrigió guardando solo el `id` y resolviendo el contexto en cada
render contra la lista ya invalidada por `useRegistrarPago`.

## Reembolsos

No se construyó un flujo separado — `reembolso` es solo otra opción
del `Select` de "Tipo", igual que anticipo/pago_completo/pago_saldo.
El backend ya limita que no se reembolse más de lo pagado y sí permite
reembolsos sobre reservaciones canceladas — el frontend no agrega
ninguna restricción propia.

## Verificación de compilación

```bash
tsc --noEmit --project tsconfig.app.json --ignoreDeprecations 6.0
```

Sin errores nuevos reales — solo las mismas apariciones ya
documentadas de la causa raíz de `badge.tsx` y el `key` de
`DashboardPage.tsx` (Entregas 1 y 2).

**Confírmalo en tu máquina:**

```bash
npm install
npm run build
```

## Cómo probarlo

```bash
npm install
npm run build
npm run dev
```

**Como admin u operador (desde Reservaciones):**
1. "Reservaciones" → clic en "Pagos" en cualquier fila.
2. Debe abrir el modal con el saldo correcto y el historial (vacío si es nueva).
3. Registra un anticipo → debe aparecer en el historial y el saldo del encabezado debe actualizarse sin cerrar el modal.
4. Ve a "Reservaciones" y confirma que el saldo también cambió ahí.

**Como cajero (desde /pagos):**
5. "Pagos" → "Registrar pago" → debe pedir el ID manualmente, con la nota explicando por qué.
6. Escribe un ID válido → continúa → registra un pago.
7. Intenta un reembolso mayor a lo pagado → debe fallar con el mensaje real del backend.

**Aislamiento:**
8. Confirma que `/`, `/login`, `/clientes`, `/servicios` y el resto de `/reservaciones` siguen funcionando exactamente igual.

## Siguiente paso

Caja — también usará `useUsuarioIdTemporal` (tercera reutilización).
