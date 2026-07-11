# Frontend React — Entrega 10: Corrección de fotos reales + tiempo de carga

## Bug real encontrado y corregido: las 4 fotos eran del archivo equivocado

En la Entrega 7, al recortar las fotos reales del parque, mi script
cargó `/mnt/user-data/uploads/15575.png` — que en realidad era el
**flyer publicitario generado con IA** ("Parque Ecoturístico
EjiXhole... Bienvenidos"), no la captura de la galería de fotos reales
(`15576.png`). Confundí los dos archivos entre mi paso de
identificación visual y el script de recorte.

**Resultado del error:** `canoa.jpg`, `kayak.jpg`, `paddleboard.jpg` y
`pool-turquesa.jpg` no eran fotos del parque — eran recortes de texto
de un anuncio ("Huasteca Potosina", "¡Contáctanos Aho...", bordes de
hojas decorativas dibujadas). Por eso se veían "súper mal": no eran
fotos rotas, eran literalmente el contenido equivocado.

**Corrección:** volví a identificar visualmente cuál de los 6
archivos subidos es la captura real de la galería (`15576.png`,
confirmado de nuevo viéndolo), recorté las mismas 4 posiciones de la
cuadrícula desde ese archivo, y verifiqué cada una visualmente antes
de reemplazar nada — esta vez las 4 muestran fotos reales genuinas:
alberca turquesa con cascada, paddleboard, canoa, kayak con chaleco
verde.

Se reemplazaron los 4 archivos en `public/park/` — mismos nombres,
mismas rutas en el código, así que **no hubo que tocar ningún
componente**. Solo el contenido de las imágenes cambió.

## Tiempo de carga: code-splitting por ruta

Tu `npm run build` avisaba de un bundle único de ~1 MB (304 KB
comprimido) — todo el frontend se descargaba de golpe al hacer login,
incluyendo Recharts (la librería de gráficas, pesada) y los 15
archivos de Reportes, aunque el usuario nunca los visite en esa
sesión.

**`src/router/AppRouter.tsx` reescrito:** las 17 páginas de
módulo (Dashboard, Clientes, Servicios, Reservaciones, Pagos, Caja,
el hub de Reportes + sus 10 sub-reportes) ahora se cargan con
`React.lazy()` — se descargan solo cuando el usuario navega a esa
ruta, no todas al iniciar sesión. Se agregó un único `<Suspense>`
alrededor de las rutas con un spinner simple mientras carga un chunk.

**Qué NO se hizo lazy, a propósito:** `LoginPage`, `AppShell`, los
guards de rutas (`RequireAuth`, `RequireRole`) y las páginas de
error/no-autorizado — son pequeñas y se necesitan de inmediato, volverlas
lazy solo agregaría una espera innecesaria.

**`vite.config.ts`:** se agregó `manualChunks` para separar
`recharts` y el "vendor" de React/React Router en sus propios chunks
— así el navegador los puede cachear por separado entre despliegues
que no cambian esas dependencias.

## Archivos modificados

- `public/park/pool-turquesa.jpg`, `paddleboard.jpg`, `canoa.jpg`, `kayak.jpg` — reemplazados con las fotos correctas.
- `src/router/AppRouter.tsx` — reescrito con `React.lazy()` + `Suspense`.
- `vite.config.ts` — `manualChunks` para Recharts y vendor de React.

## Verificación de compilación

```bash
tsc --noEmit --project tsconfig.app.json --ignoreDeprecations 6.0
```

Sin errores nuevos reales, sin variables/imports sin usar. Los únicos
hallazgos son las mismas 3 causas raíz ya confirmadas como falsos
positivos por tu build real anterior (`badge.tsx`, `key` en
`DashboardPage.tsx`, `ServiciosListPage.tsx`).

## Cómo probarlo

```bash
npm run build
```

Debe seguir compilando limpio. Revisa el resumen de tamaños al final —
ya no debería aparecer un solo archivo de ~1 MB; en su lugar deberías
ver varios archivos más pequeños (`recharts-*.js`, `react-vendor-*.js`,
y un chunk por cada página/reporte).

```bash
npm run dev
```

1. Entra al Dashboard → confirma que la foto del hero ahora es una alberca turquesa real, no un fondo verde-madera genérico.
2. Revisa el Sidebar → la tarjeta del final ahora debe mostrar una canoa real en agua turquesa, no texto de "Huasteca Potosina / ¡Contáctanos!".
3. Abre las herramientas de desarrollo → pestaña Network → navega entre Clientes, Reportes, Caja, etc. → deberías ver archivos `.js` descargándose bajo demanda al entrar a cada sección por primera vez, no todos de golpe al cargar la página.

**Aislamiento:** confirma que todo lo demás (Login, ⌘K, permisos por rol, formularios, cálculos) sigue funcionando exactamente igual — este cambio es puramente de qué imagen se muestra y cómo se empaqueta el código, no de lógica.

## Backend

No se tocó ningún archivo del backend.
