# Frontend React — Entrega 3C: Módulo Reservaciones completo

## Principio seguido: cero infraestructura duplicada

| Reutilizado (de 3A/3B) | Uso en Reservaciones |
|---|---|
| `DataTable` | Tabla de reservaciones |
| `ConfirmDialog` | Confirmar cancelación |
| `useToast` | Éxito/error de crear y cambiar estado |
| `EmptyState` / `ErrorState` / `TableSkeleton` | Los 3 estados de la lista |
| `useDebounce` | Búsqueda |
| `EstadoBadge` (de `ui/badge.tsx`, ya existía desde el diseño original) | Columna "Estado" |
| `formatearMoneda` (`lib/format.ts`) | Columna "Saldo" |
| `useClientes`, `useServicios` | Poblar los `Select` del formulario y **resolver nombres** en la tabla (ver abajo) |
| `Dialog`, `Input`, `Label`, `Textarea`, `Button` | Formulario de creación |

**Un solo primitivo de UI nuevo:** `components/ui/select.tsx` — no
existía ningún `Select` en el proyecto todavía (Clientes/Servicios no
lo necesitaban). Se agregó `@radix-ui/react-select` a `package.json`,
siguiendo el mismo patrón ya usado para `Dialog` en la Entrega 3A.

## Archivos nuevos

- `src/types/reservacion.ts` — incluye las constantes `ESTADOS_RESERVACION`/`ORIGENES_RESERVACION`, espejo exacto de las del backend.
- `src/api/reservaciones.ts` — `listar` (con filtros reales), `crear`, `cambiarEstado`.
- `src/features/reservaciones/useReservaciones.ts` — `useReservaciones`, `useCrearReservacion`, `useCambiarEstadoReservacion`.
- `src/features/reservaciones/ReservacionFormModal.tsx` — solo creación (ver limitación abajo).
- `src/features/reservaciones/ReservacionesListPage.tsx`.
- `src/components/ui/select.tsx` — nuevo primitivo.
- `src/hooks/useUsuarioIdTemporal.ts` — ver limitación del `usuario_id` abajo. Se puso en `hooks/` (no en `features/reservaciones/`) a propósito, porque Pagos y Caja van a necesitar exactamente lo mismo.

## Archivos modificados

- `package.json` — `+@radix-ui/react-select`.
- `src/router/AppRouter.tsx` — `/reservaciones` real.
- `README.md`.

## Dos limitaciones reales del backend, encontradas y documentadas (no ocultas)

### 1. No existe edición de detalles de una reservación

Revisé `app/routes/reservacion_routes.py` del backend antes de
construir esto: solo hay `POST`, `GET` (lista y detalle) y
`PATCH /{id}/estado`. **No hay `PUT`.** Por eso:

- "Editar" en este módulo = cambiar estado (`Confirmar`, `Completar`, `Cancelar`), no un formulario de edición de fecha/personas/cliente/servicio.
- Los botones de acción por fila solo ofrecen transiciones válidas según el estado actual (mismo árbol de decisión que `ReservacionService.cambiar_estado` en el backend): `pendiente` → Confirmar/Cancelar; `confirmada` → Completar/Cancelar; `completada`/`cancelada` → sin acciones (estados terminales).
- Cancelar siempre pide confirmación (`ConfirmDialog`) por ser irreversible. Confirmar/Completar se ejecutan directo — no son destructivos.

Si en el futuro el backend agrega edición real, este módulo necesitará
un `ReservacionFormModal` en modo edición, siguiendo el mismo patrón
ya usado en Clientes/Servicios.

### 2. El JWT no trae el `usuario_id` numérico

El token solo tiene `sub` (email) y `rol` — no hay forma de resolver
el `usuario_id` de la sesión actual, y no existe ningún endpoint
(`/auth/me`, lista de usuarios) para buscarlo por email. Pero
`POST /reservaciones` **requiere** `usuario_id` en el body (documentado
como temporal en el propio backend).

**Solución implementada:** un campo "Tu ID de usuario (temporal)" en
el formulario de creación, con una nota explicando la limitación. El
valor que funciona se guarda en `localStorage` (`useUsuarioIdTemporal`)
para no tener que volver a escribirlo cada vez en el mismo navegador.

**Esto no es una solución definitiva** — es honesto sobre una
limitación real del backend. La solución correcta a futuro es que el
backend resuelva `usuario_id` del JWT automáticamente (como ya se
anotó en los propios docs del backend) y elimine este campo del todo.

## Nombres resueltos en la tabla (no solo IDs)

`ReservacionOut` solo trae `cliente_id`/`servicio_id`, no los nombres.
Mostrar "Cliente #4" en la tabla sería inutilizable — por eso la
página también llama a `useClientes`/`useServicios` (ya existentes) y
arma un lookup en memoria para resolver nombres. No es una llamada
nueva a esas APIs "de más": son los mismos hooks que ya usan sus
propios módulos, reutilizados aquí con otro propósito.

## Filtros: servidor vs. navegador

- **Estado, servicio, fecha desde/hasta**: van directo a
  `GET /reservaciones` como query params reales — el backend sí los
  soporta, así que no hay razón para filtrarlos en el navegador.
- **Búsqueda de texto**: el backend no tiene un parámetro de texto
  libre — se filtra en el navegador sobre los nombres ya resueltos de
  cliente/servicio y las notas, mismo patrón y misma limitación ya
  documentada en Clientes y Servicios.

## Verificación de compilación

Encontré y corregí un bug real (no ruido del entorno) antes de
entregar: `ejecutarTransicion` recibía un parámetro `label` que
nunca se usaba (`noUnusedParameters` de `tsconfig.app.json` lo marcó
como error real: `TS6133`). Se quitó el parámetro y se actualizaron
sus dos llamadas.

```bash
tsc --noEmit --project tsconfig.app.json --ignoreDeprecations 6.0
```

Después del fix, los únicos hallazgos son los mismos ya documentados
en entregas anteriores (causa raíz de `badge.tsx`, y el `key` de
`DashboardPage.tsx`) — ninguno nuevo.

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

1. Login como `admin` u `operador` → entra a "Reservaciones".
2. "Nueva reservación" → selecciona cliente y servicio (verás el precio en el desplegable) → completa fecha, personas, y tu ID de usuario (pregúntaselo a un admin la primera vez) → crear.
3. La reservación debe aparecer en la tabla con el nombre del cliente/servicio resueltos, estado "pendiente", y el saldo igual al total.
4. Filtra por estado "pendiente" → debe filtrar contra el backend (revisa la Network tab: el query param `estado` va en la URL).
5. Da clic en "Confirmar" → debe pasar a "confirmada" sin pedir confirmación.
6. Da clic en "Cancelar" → debe pedir confirmación antes de ejecutar.
7. Intenta crear una segunda reservación activa para el mismo cliente → debe fallar con `409` y mostrar el mensaje real del backend.
8. Confirma que `/`, `/login`, `/clientes` y `/servicios` siguen funcionando exactamente igual.

## Siguiente paso

Pagos (depende de Reservaciones, ya completo) — reutilizará
`useUsuarioIdTemporal` desde el primer momento.
