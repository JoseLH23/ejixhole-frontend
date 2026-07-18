import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const configuracion = JSON.parse(
  await readFile(new URL("../vercel.json", import.meta.url), "utf8")
);

const cabecerasGlobales = new Map(
  configuracion.headers
    .find((regla) => regla.source === "/(.*)")
    .headers.map(({ key, value }) => [key, value])
);

test("el panel aplica cabeceras defensivas en todas las rutas", () => {
  assert.equal(cabecerasGlobales.get("X-Content-Type-Options"), "nosniff");
  assert.equal(cabecerasGlobales.get("X-Frame-Options"), "DENY");
  assert.equal(cabecerasGlobales.get("Cross-Origin-Opener-Policy"), "same-origin");
  assert.match(cabecerasGlobales.get("Strict-Transport-Security"), /includeSubDomains/);
  assert.match(cabecerasGlobales.get("Permissions-Policy"), /camera=\(\)/);
});

test("la CSP bloquea objetos y framing sin impedir el proxy oficial", () => {
  const csp = cabecerasGlobales.get("Content-Security-Policy");
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /connect-src 'self' https:\/\/c-ejixhole-backend\.onrender\.com/);
  assert.match(csp, /https:\/\/fonts\.gstatic\.com/);
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'/);
});
