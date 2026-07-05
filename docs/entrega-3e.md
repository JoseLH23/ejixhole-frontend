# Frontend React — Entrega 3E: Módulo Caja completo

## Revisión del backend hecha antes de programar

Verifiqué `app/schemas/caja.py` y `app/routes/caja_routes.py` completos
antes de escribir cualquier código. Hallazgos relevantes:

- **Los 3 roles (admin, operador, cajero) tienen exactamente el mismo
  acceso a todo `/caja`** — a diferencia de Pagos/Reservaciones, aquí
  no hay ninguna restricción cruzada que documentar como limitación de
  permisos.
- **`CajaMovimientoOut` NO incluye `usuario_id`** en la respuesta,
  aunque el modelo de base de datos sí lo tiene — confirmado leyendo
  el schema exacto, no asumido.
- **No existe un endpoint `GET /caja/mia` o similar** para "mi caja
  actual" — pero `GET /caja` sí soporta `usuario_id` + `estado` como
  filtros reales, así que se resuelve exactamente con
  `GET /caja?usuario_id=X&estado=abierta` (ver abajo).
- **`GET /caja/corte-dia` existe y no se usó** — no fue parte de lo
  pedido en esta entrega; queda disponible para una futura pantalla de
  "corte del día".

## Principio seguido: cero infraestructura duplicada

| Reutilizado | Uso en Caja |
|---|---|
| `DataTable`, `EmptyState`, `ErrorState`, `TableSkeleton` | Movimientos de la sesión actual + historial de sesiones |
| `Dialog`, `Select`, `Input`, `Label`, `Button`, `Card` | Los 3 modales y la página principal |
| `ConfirmDialog` | Cerrar caja — primer uso real de este componente en un flujo de 2 pasos (ver abajo) |
| `Badge` | Estado de cada sesión en el historial |
| `useToast` | Éxito/error de las 3 mutaciones |
| `formatearMoneda` | Todos los montos |
| `useUsuarioIdTemporal` | Misma limitación ya documentada en Reservaciones/Pagos — tercera reutilización, tal como se anticipó |

**Ningún componente ni hook genérico se creó de nuevo.**

## Archivos nuevos

- `src/types/caja.ts`
- `src/api/caja.ts` — tipado completo, con un comentario explícito de que `corte-dia` existe pero no se consume aquí.
- `src/features/caja/useCaja.ts` — `useCajaSesiones`, `useCajaSesionActual`, `useCajaMovimientos`, `useAbrirCaja`, `useCerrarCaja`, `useRegistrarMovimiento`.
- `src/features/caja/AbrirCajaModal.tsx`
- `src/features/caja/RegistrarMovimientoModal.tsx`
- `src/features/caja/CerrarCajaModal.tsx`
- `src/features/caja/CajaPage.tsx`
- `docs/entrega-3e.md`

## Archivos modificados

- `src/router/AppRouter.tsx` — `/caja` real.
- `README.md`.

**Sidebar: sin cambios** — ya apuntaba a `/caja` con los 3 roles desde la Entrega 1.

## "Mi caja actual": cómo se resolvió sin un endpoint dedicado

`useCajaSesionActual(usuarioId)` llama a `GET /caja?usuario_id=X&estado=abierta`
y toma el primer resultado. Esto no es una aproximación — la regla de
negocio del backend (`CajaService.abrir_sesion`) ya garantiza que nunca
puede haber más de una sesión abierta por usuario al mismo tiempo, así
que "el primer resultado" siempre es exacto.

## `ConfirmDialog` con contenido real: cerrar caja

A diferencia de Clientes/Servicios/Reservaciones (donde `ConfirmDialog`
solo confirma una acción sin datos adicionales), cerrar una caja
necesita capturar el monto real contado. Se diseñó como flujo de 2
pasos en `CerrarCajaModal.tsx`:

1. Un `Dialog` con el formulario (monto real contado).
2. Al enviar, no se cierra la caja todavía — se calcula la diferencia
   (`monto_real - saldo_actual`) y se muestra en un `ConfirmDialog`
   real ("¿Confirmar cierre? Hay un FALTANTE/SOBRANTE de $X"),
   coloreado si hay diferencia. Solo al confirmar ahí se llama a la
   mutación.

Esto le da un propósito genuino a `ConfirmDialog` en este módulo, en
vez de forzarlo donde no encajaba.

## Invalidación de caché

Las 3 mutaciones (abrir, cerrar, registrarMovimiento) invalidan toda
la rama `["caja"]` completa, no solo su propia sub-clave — porque
cualquiera de las 3 puede cambiar `saldo_actual` de la sesión, que se
muestra en varios lugares a la vez. Invalidar de más aquí es más
seguro que invalidar de menos y dejar datos obsoletos en pantalla.

## Bug real que encontré y corregí antes de entregar (no era de compilación)

Diseñé inicialmente `AbrirCajaModal` con un callback `onAbierta()` que
el padre (`CajaPage`) debía usar para "refrescar" tras abrir una caja.
Al revisar el flujo completo antes de entregar, noté que era código
muerto: la invalidación de cache que ya hace `useAbrirCaja().onSuccess`
actualiza `useCajaSesionActual` automáticamente vía React Query — el
callback nunca hacía nada real. Se eliminó el prop por completo.

## Verificación de compilación

```bash
tsc --noEmit --project tsconfig.app.json --ignoreDeprecations 6.0
```

Sin errores nuevos reales — solo 2 apariciones más de la misma causa
raíz ya documentada de `badge.tsx` (Entregas 1-2), en los 2 usos de
`<Badge>` de esta página.

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

1. Entra a "Caja" (cualquier rol) → si no has configurado tu ID de usuario, te lo pide primero.
2. Sin caja abierta → debe verse el empty state con "Abrir caja".
3. Abre una caja con un monto de apertura → debe aparecer la tarjeta "Mi caja" con el saldo.
4. Registra un ingreso y un egreso → el saldo actual debe recalcularse y ambos deben aparecer en la tabla de movimientos.
5. Intenta abrir otra caja mientras esta sigue abierta → debe fallar con 409 y el mensaje real del backend.
6. "Cerrar caja" con un monto distinto al esperado → debe mostrar el `ConfirmDialog` con el faltante/sobrante calculado antes de cerrar de verdad.
7. Confirma → la sesión debe pasar a "cerrada" en el historial, con su diferencia visible.
8. Revisa el historial con el filtro de estado → debe filtrar contra el backend.

**Aislamiento:**
9. `/`, `/login`, `/clientes`, `/servicios`, `/reservaciones` y `/pagos` deben seguir funcionando exactamente igual.

## Confirmaciones finales pedidas

- El proyecto compila (`npm run build`) sin errores nuevos reales — verificado con `tsc --noEmit` completo, filtrando solo las causas raíz ya documentadas en entregas anteriores (nunca ocultas, siempre explicadas).
- Ningún archivo de Login, Dashboard, Clientes, Servicios, Reservaciones ni Pagos fue modificado en esta entrega — los únicos cambios fuera de `features/caja/` fueron `AppRouter.tsx` y `README.md`.

## Siguiente paso

Reportes (el módulo más grande restante, con 12+ endpoints ya construidos en el backend) o Usuarios (admin).
