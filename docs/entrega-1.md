# Frontend React — Entrega 1: Infraestructura

Ver `docs/frontend-diseno.md` para la arquitectura completa aprobada.
Este documento cubre solo lo implementado en esta entrega.

## Qué se implementó

- Proyecto Vite + React + TypeScript, con alias `@/` → `src/`.
- Tailwind CSS + tokens de shadcn/ui (tema propio, no el gris/zinc default — ver sección de diseño visual abajo).
- Componentes base de shadcn/ui escritos a mano: `Button`, `Input`, `Label`, `Card`, `Avatar`, `Separator`, `DropdownMenu`, `Badge` (con variante `estado` propia).
- TanStack Query configurado (`QueryClientProvider` en `App.tsx`), listo para usarse en la próxima entrega.
- Axios (`api/client.ts`): interceptor de request (agrega JWT automáticamente) e interceptor de response (401 → limpia sesión).
- React Router v6: rutas públicas (`/login`), protegidas (`RequireAuth`), y protegidas por rol (`RequireRole`).
- `AuthContext`: login, logout, restauración de sesión desde `localStorage` al cargar la app, decodificación de JWT (solo lectura, sin verificar firma).
- Pantalla de Login funcional (React Hook Form + Zod), conectada a `POST /auth/login` real.
- `AppShell` (Sidebar + Topbar), con navegación que se filtra automáticamente según el rol del usuario.
- Permisos por rol en el router, reflejando **exactamente** `docs/modulos/permisos-por-rol.md` del backend.
- Tema visual: paleta propia inspirada en los ríos de la Huasteca (ver abajo), tipografía Fraunces + Inter + JetBrains Mono.

## Qué NO se implementó (a propósito, por instrucción explícita)

- Dashboard real (tarjetas de `/dashboard/resumen`) — la ruta `/` muestra un saludo + aviso de "en construcción".
- CRUD de Clientes, Reservaciones, Servicios, Pagos, Caja, Reportes, Usuarios — cada ruta existe y respeta permisos, pero renderiza `ComingSoonPage`.

## Diseño visual — resumen de decisiones

| Token | Valor | Por qué |
|---|---|---|
| Primario | Turquesa río Huasteca `#0D7480` | Color real de los ríos de la región (Tamul, Puente de Dios) — no un azul corporativo genérico. |
| Secundario | Arcilla templada `#C08054` | Evita el terracota `#D97757` sobreusado en diseño generado por IA. |
| Fondo | Piedra cálida `#F7F4EE` | Neutro cálido, no el gris frío default de shadcn. |
| Display | Fraunces | Carácter propio para títulos, usado con moderación. |
| Cuerpo/datos | Inter | Máxima legibilidad para tablas y formularios — la mayoría del uso real de la app. |
| Datos numéricos | JetBrains Mono | Un toque de precisión para montos/folios (se aplicará en las tablas de las próximas entregas). |
| Elemento de firma | Patrón de curvas tipo río, solo en el fondo del Login | Único lugar del sistema con decoración — el resto queda disciplinado a propósito. |

## Limitación honesta de este entorno

No hay acceso al registro de npm en el entorno donde se escribió este
código — no se pudo correr `npm install` ni compilar de verdad. Se
validó con `tsc --noEmit` de forma parcial (sin dependencias reales
instaladas, así que la mayoría de los errores eran "módulo no
encontrado", esperado). Se encontró una posible discrepancia en
`badge.tsx` que coincide exactamente con el patrón oficial de
shadcn/ui — muy probablemente ruido del entorno, no un bug real, pero
no pude confirmarlo con una compilación completa.

**Antes de seguir con la siguiente entrega, corre:**

```bash
npm install
npm run build
```

y avísame si `tsc` marca algo — con las dependencias reales instaladas
no debería haber ningún error.

## Cómo probarlo

```bash
npm install
cp .env.example .env
npm run dev
```

1. Abre `http://localhost:5173` → debe redirigir a `/login`.
2. Necesitas un usuario real en tu backend (`python -m scripts.create_admin` si no tienes uno).
3. Inicia sesión → debes llegar a `/` con el saludo y el Sidebar filtrado según tu rol.
4. Prueba entrar a una sección fuera de tu rol manipulando la URL directamente (ej. un `cajero` yendo a `/servicios`) → debe redirigir a `/no-autorizado`, no crashear.
5. Cierra sesión desde el menú del Topbar → debe volver a `/login`.
6. Refresca la página estando logueado → la sesión debe restaurarse sin pedir login de nuevo (hasta que el token expire).

## Siguiente paso

Con esto aprobado: Dashboard real (consumir `/dashboard/resumen`,
reemplazar el placeholder de `/` con las 9 `KpiCard`).
