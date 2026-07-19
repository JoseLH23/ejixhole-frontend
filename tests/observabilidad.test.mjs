import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const leer = (ruta) => readFile(new URL(`../${ruta}`, import.meta.url), "utf8");

test("consulta por separado backend y MH-Core sin ocultar fallos parciales", async () => {
  const api = await leer("src/api/observabilidad.ts");
  assert.match(api, /\/observabilidad\/resumen/);
  assert.match(api, /\/dashboard\/mh-core\/observability/);
  assert.match(api, /Promise\.all/);
  assert.match(api, /reason: "unavailable"/);
});

test("la consola muestra PostgreSQL, cola durable, dead-letter y SLO", async () => {
  const pagina = await leer("src/features/observabilidad/ObservabilidadPage.tsx");
  assert.match(pagina, /PostgreSQL EjiXhole/);
  assert.match(pagina, /Cola durable/);
  assert.match(pagina, /Dead-letter/);
  assert.match(pagina, /SLO del Backend/);
  assert.match(pagina, /SLO de MH-Core/);
  assert.match(pagina, /measurement_complete/);
});

test("la ruta y navegación están limitadas al administrador", async () => {
  const router = await leer("src/router/AppRouter.tsx");
  const navigation = await leer("src/router/navigation.ts");
  assert.match(router, /path="\/observabilidad" element={<ObservabilidadPage \/>}/);
  assert.match(navigation, /label: "Observabilidad"/);
  assert.match(navigation, /path: "\/observabilidad"/);
  assert.match(navigation, /roles: \["admin"\]/);
});
