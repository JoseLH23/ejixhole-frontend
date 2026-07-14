# CLAUDE.md — Ejixhole Frontend (Experience OS)

Contexto persistente para Claude Code en este repo.

## Qué es esto

Panel administrativo interno de **EjiXhole** (parque ecoturístico real). React + Vite + TypeScript. Lo usa el personal del parque (recepción, admin), no el público. Consume el backend en `Ejixhole-Backend` (repo separado, mismo dueño).

Existe un tercer repo hermano: `ejixhole-reservas`, el portal público de reservaciones (sin login) — comparte el mismo backend pero es un proyecto de frontend totalmente distinto.

## Entorno

- Windows + PowerShell, no bash. `npx tsc -b` (nunca solo `tsc`) para respetar `tsconfig`.
- `*.tsbuildinfo` está en `.gitignore` — si `git status` te lo muestra como modificado, es ruido de build local, no lo agregues al commit.

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

- **`apiClient`** (`src/api/client.ts`) adjunta el JWT automáticamente vía interceptor y maneja 401 (limpia sesión, redirige a login). Nunca crees un segundo cliente axios.
- **Token en `localStorage`** (`ejixhole_token`) — es una debilidad de seguridad ya documentada (AL-06, JWT robable por XSS), pendiente de migrar a cookie httpOnly cuando el backend lo soporte. No lo "arregles" a medias sin coordinar con el backend — es un cambio de dos repos a la vez.
- **Idempotency-Key real** en creación de reservaciones y pagos (`src/lib/idempotencyKey.ts`, `crypto.randomUUID()`) — generada una vez por intento (con `useRef`, no en cada render), renovada tras éxito o error. Si agregas una mutación de creación nueva (POST que crea algo con consecuencia real), replica este patrón.
- **React Query** para todo estado remoto — nunca `useEffect` + `fetch` manual para datos del servidor.
- **Botones de submit se deshabilitan mientras `mutation.isPending`** — siempre, es la primera línea de defensa contra doble clic.
- **Timeout real de 15s** en `apiClient` — si una petición se cuelga, el usuario no se queda esperando indefinidamente.
- Componentes de íconos: **verifica que el nombre del ícono exista de verdad en la librería antes de usarlo** — ya hubo un crash real en producción por un nombre de ícono inventado/mal escrito.

## Reglas de trabajo

1. Antes de un cambio visual grande, diagnostica primero (qué está mal, por qué) y propón — no ejecutes directo sin explicar, este proyecto espera un rol de "director de producto/UX", no solo ejecución literal.
2. Corre `npx tsc -b` después de cualquier cambio — cero errores de tipo antes de considerar terminado.
3. No inventes endpoints del backend — si no sabes si algo existe ahí, pregunta o revisa el repo del backend (`Ejixhole-Backend`, tiene su propio CLAUDE.md).
4. Nunca borres funcionalidad existente sin decir explícitamente qué y por qué.
