# CLAUDE.md — Ejixhole Frontend (Experience OS)

Contexto persistente para Claude Code en este repo.

## Qué es esto

Panel administrativo interno de **EjiXhole** (parque ecoturístico real). React + Vite + TypeScript. Lo usa el personal del parque (recepción, admin), no el público. Consume el backend en `C-Ejixhole-Backend` (repo separado, mismo dueño).

Existe un tercer repo hermano: `ejixhole-reservas`, el portal público de reservaciones (sin login) — comparte el mismo backend pero es un proyecto de frontend totalmente distinto.

## Objetivo de producto

Este panel debe reducir trabajo manual, proteger reservaciones/pagos y dar visibilidad confiable del negocio. No es una plantilla pública ni un producto multiempresa por ahora; está construido para beneficio operativo de EjiXhole.

## Entorno

- Windows + PowerShell, no bash. `npx tsc -b` (nunca solo `tsc`) para respetar `tsconfig`.
- `*.tsbuildinfo` está en `.gitignore` — si `git status` lo muestra como modificado, es ruido de build local, no lo agregues al commit.

## Comandos reales

```powershell
npm install
npm run dev       # localhost:5173
npx tsc -b         # type-check real, úsalo antes de dar por bueno un cambio
npm run build      # tsc -b && vite build
```

No hay `npm test` ni lint configurado todavía (deuda técnica real, conocida — no inventes que sí existe).

## Arquitectura

```
src/api/          Cliente axios centralizado (src/api/client.ts) — TODO pasa por ahí, ningún feature crea su propio cliente HTTP
src/features/      Un folder por dominio (reservaciones, pagos, clientes, caja, usuarios...) — hook de React Query + componente
src/components/    ui/ (primitivos shadcn-style) + shared/ (reutilizables del proyecto) + layout/
src/context/        AuthContext (JWT), ReservaContext no existe aquí (eso es del portal público)
src/router/         rutas protegidas por rol
src/lib/            utilidades puras (idempotencyKey.ts, csvExport.ts, platform.ts...)
```

## Convenciones reales — sigue el patrón existente

- **`apiClient`** (`src/api/client.ts`) adjunta el JWT automáticamente vía interceptor y maneja 401. Nunca crees un segundo cliente axios.
- **Token en `localStorage`** (`ejixhole_token`) — es una debilidad de seguridad documentada (AL-06), pendiente de migrar a cookie HttpOnly cuando el backend lo soporte. No lo arregles a medias: es un cambio coordinado de dos repositorios.
- **Idempotency-Key real** en creación de reservaciones y pagos (`src/lib/idempotencyKey.ts`, `crypto.randomUUID()`). Se genera una vez y permanece estable durante errores y reintentos inciertos. **Solo se renueva después de éxito confirmado.** No vuelvas a renovarla en `onError`: un timeout puede ocurrir después de que el backend ya guardó la operación.
- El backend libera la clave cuando la operación falla realmente y conserva la respuesta cuando terminó. Este contrato permite reintentar con seguridad usando la misma clave.
- **React Query** para todo estado remoto — nunca `useEffect` + `fetch` manual para datos del servidor.
- **Botones de submit se deshabilitan mientras `mutation.isPending`** — siempre, como primera línea de defensa contra doble clic.
- **Timeout real de 15s** en `apiClient` — un timeout significa resultado desconocido, no confirma que el backend no haya escrito.
- Cualquier header, endpoint o schema nuevo debe revisarse también en el backend y en el otro frontend que comparta el contrato. Ya ocurrió una regresión real cuando los clientes enviaron `Idempotency-Key` y CORS no lo permitía.
- Componentes de íconos: verifica que el nombre exista de verdad en la librería antes de usarlo — ya hubo un crash real por un ícono mal escrito.

## Reglas de trabajo

1. Antes de un cambio visual grande, diagnostica primero y explica el impacto; este proyecto espera dirección de producto/UX, no ejecución literal sin contexto.
2. Corre `npx tsc -b` y `npm run build` después de cualquier cambio.
3. No inventes endpoints del backend: revisa `C-Ejixhole-Backend` y documenta dependencias cross-repo.
4. Nunca borres funcionalidad existente sin decir explícitamente qué y por qué.
5. No trabajes directamente en `main`: rama, PR, CI verde y preview antes de fusionar.
6. Reservaciones, pagos, caja y usuarios son flujos de negocio críticos; un cambio debe preservar trazabilidad, permisos e idempotencia.
