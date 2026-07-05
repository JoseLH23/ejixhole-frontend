# Frontend React — Entrega de Pulido Profesional

Sin módulos de negocio nuevos. Objetivo: dejar el frontend más sólido,
consistente y listo para demo. Esta entrega es honesta sobre qué se
cubrió a fondo y qué quedó fuera por alcance/tiempo — ver sección final.

## 1. Manejo global de errores (el cambio más grande de esta entrega)

**Antes:** 12 archivos distintos repetían a mano
`error?.response?.data?.detail` con mensajes de fallback
inconsistentes entre sí, y algunos (`ServicioFormModal.tsx`) tenían su
propia mini-función local duplicando lo mismo otra vez.

**Ahora:**
- `src/lib/errors.ts` — `getErrorInfo(error, tituloFallback)`, una sola
  fuente de verdad que interpreta el status HTTP y devuelve un mensaje
  amigable:
  - `401` → "Sesión expirada"
  - `403` → "Sin permiso" (+ el `detail` del backend si lo trae)
  - `404` → "No encontrado"
  - `409` → "Conflicto" (+ `detail`)
  - `422` → "Datos inválidos" (+ `detail`)
  - `500/502/503` → "Error del servidor"
  - Sin respuesta (red caída) → "Sin conexión"
- `src/hooks/useErrorToast.ts` — combina `useToast` + `getErrorInfo` en
  una sola llamada: `onError: (error) => mostrarError(error, "título")`.
- `ErrorState.tsx` usa el mismo helper — el mensaje que ve el usuario
  en un toast y en una pantalla de error completa es el mismo texto,
  no dos redacciones distintas para el mismo problema.

**12 archivos refactorizados** para usar `useErrorToast` en vez de su
lógica manual: `ClienteFormModal`, `ClientesListPage`,
`ServicioFormModal` (+ se eliminó su función local duplicada),
`ServiciosListPage`, `ReservacionFormModal`, `ReservacionesListPage`,
`PagoModal`, `AbrirCajaModal`, `RegistrarMovimientoModal`,
`CerrarCajaModal`, y `DashboardPage` (que además dejó de reconstruir a
mano el markup de `ErrorState`/`EmptyState` y ahora los reutiliza).

### 401 — sesión expirada, con un bug real evitado

Se agregó un toast "Sesión expirada" cuando el interceptor global de
Axios detecta un 401 con una sesión previa real (no en cualquier 401).
Al implementarlo encontré un riesgo concreto: el mismo interceptor se
dispara también cuando `POST /auth/login` falla por contraseña
incorrecta (también un 401) — sin cuidado, eso habría mostrado dos
mensajes de error a la vez ("Sesión expirada" + "Contraseña
incorrecta") en un simple login fallido. Se corrigió excluyendo
explícitamente la ruta `/auth/login` del manejo global en
`api/client.ts`, ya que `LoginPage` ya maneja ese caso con su propio
mensaje específico.

### 403 y 500 — ya cubiertos por el mismo mecanismo

No requirieron código adicional más allá de `getErrorInfo` — cualquier
`ErrorState` o toast de error en el sistema ya interpreta esos códigos
correctamente, sin importar en qué pantalla.

## 2. Navegación responsiva (antes no existía)

El Sidebar era de ancho fijo y no se adaptaba a pantallas pequeñas.

- `Sidebar.tsx`: en pantallas `< md`, se oculta por defecto y aparece
  como overlay con fondo oscuro al activarlo; en `md+` se comporta
  exactamente igual que antes.
- `Topbar.tsx`: botón de menú (hamburguesa) visible solo en mobile.
- `AppShell.tsx`: coordina el estado abierto/cerrado entre ambos, y
  cierra el menú automáticamente al navegar a una ruta nueva.

## 3. Loading UX

- Ya existían skeletons en la mayoría de listas/tablas — se conservaron.
- Nuevo: barra sutil de carga global en el `Topbar` (`useIsFetching` de
  TanStack Query) — aparece cuando hay cualquier consulta en curso en
  segundo plano.
- El loading inicial de la app (restaurando sesión) ya mostraba un
  spinner en vez de pantalla en blanco — se revisó, ya estaba bien.

## 4. Seguridad UX

- Logout: sin cambios de comportamiento, ya era claro. Se agregó el
  email del usuario también dentro del menú desplegable (el botón del
  Topbar ahora lo oculta en mobile para dar espacio).
- Sesión expirada → redirige a `/login` automáticamente (ya funcionaba;
  ahora además avisa con el toast).
- Rutas prohibidas: `RequireRole` ya evita el "flash" de contenido
  prohibido — se confirmó que sigue siendo así, no se tocó.

## 5. React Query: no reintentar errores de autenticación

`retry` global cambió de un número fijo a una función: un 401/403
nunca se reintenta (reintentar no cambia que el token sea inválido o
el rol insuficiente, y solo retrasa el mensaje de error); cualquier
otro error sí se reintenta una vez, como antes.

## 6. Limpieza

- Se buscó código muerto (archivos no importados desde ningún otro
  lugar) — no se encontró ninguno.
- Se eliminó la función local duplicada `mostrarErrorBackend` en
  `ServicioFormModal.tsx`.
- Se eliminó el markup duplicado de error/empty en `DashboardPage.tsx`.
- `tsc --noEmit` completo: cero advertencias reales nuevas, cero
  variables/imports sin usar en todo el proyecto.

## Qué NO se hizo en esta entrega (alcance explícito, no descuido)

- **Breadcrumbs**: se evaluaron para las sub-páginas de Reportes, pero
  se decidió no implementarlos — el Sidebar ya resalta "Reportes" como
  activo en cualquier sub-ruta, y agregarlos de forma consistente a
  ~18 páginas era más alcance del que esta entrega debía cubrir de una
  sola vez.
- **`PageHeader` compartido**: casi todas las páginas repiten el mismo
  patrón de `<h1>` + descripción. Vale la pena extraerlo, pero tocar
  ~18 archivos en una sola entrega grande aumentaba el riesgo sin una
  necesidad urgente (los títulos ya son claros y consistentes
  visualmente). Queda como mejora concreta para una próxima entrega.
- **Tema oscuro**: no se pidió, no se agregó.

## Verificación de compilación

```bash
tsc --noEmit --project tsconfig.app.json --ignoreDeprecations 6.0
```

Sin errores nuevos reales — los mismos 2 falsos positivos ya
documentados desde las Entregas 1-2, sin ninguna aparición adicional.

**Confírmalo en tu máquina:**

```bash
npm install
npm run build
```

## Cómo probar el pulido específicamente

```bash
npm run dev
```

1. **Responsive**: cambia a una vista mobile (< 768px) en las herramientas de desarrollo → el Sidebar desaparece y aparece un botón de menú. Ábrelo, navega a otra sección → debe cerrarse solo.
2. **Errores amigables**: apaga el backend y entra a cualquier lista → debe decir "Sin conexión", no un mensaje técnico.
3. **401 real**: borra el token de `localStorage` (`ejixhole_token`) mientras estás en una pantalla protegida, luego intenta cualquier acción → toast "Sesión expirada" + regreso a `/login`.
4. **Login con contraseña incorrecta**: confirma que solo aparece el mensaje de `LoginPage`, no también un toast de "Sesión expirada".
5. **Indicador de carga global**: observa la línea delgada bajo el Topbar al navegar o refrescar datos.

**Aislamiento:**
6. Login, Dashboard, Clientes, Servicios, Reservaciones, Pagos, Caja y Reportes deben seguir funcionando exactamente igual.

## Backend

No se tocó ningún archivo del backend en esta entrega.
