import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const leer = (ruta) => readFile(new URL(`../${ruta}`, import.meta.url), "utf8");

test("la auditoría usa el endpoint v1 y solo permite lectura", async () => {
  const api = await leer("src/api/auditoria.ts");
  assert.match(api, /apiClient\.get<AuditEvent\[]>\("\/auditoria"/);
  assert.match(api, /apiClient\.get<AuditEvent>/);
  assert.doesNotMatch(api, /apiClient\.(post|put|patch|delete)/);
});

test("la ruta y el menú son exclusivos para administradores", async () => {
  const router = await leer("src/router/AppRouter.tsx");
  const navigation = await leer("src/router/navigation.ts");
  assert.match(router, /path="\/auditoria" element={<AuditoriaPage \/>}/);
  assert.match(navigation, /label: "Auditoría"/);
  assert.match(navigation, /path: "\/auditoria"/);
  assert.match(navigation, /roles: \["admin"\]/);
});

test("la pantalla compara cambios y oculta campos sensibles", async () => {
  const pagina = await leer("src/features/auditoria/AuditoriaPage.tsx");
  const presentacion = await leer("src/features/auditoria/auditPresentation.ts");
  assert.match(pagina, /Comparación antes \/ después/);
  assert.match(pagina, /textoSeguro/);
  assert.match(pagina, /actor_usuario_id/);
  assert.match(presentacion, /CAMPOS_OCULTOS/);
  assert.match(presentacion, /\[REDACTADO\]/);
  assert.match(presentacion, /\[PROTEGIDO\]/);
});
