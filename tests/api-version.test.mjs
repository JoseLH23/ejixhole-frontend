import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const cliente = readFileSync(new URL("../src/api/client.ts", import.meta.url), "utf8");
const vercel = JSON.parse(
  readFileSync(new URL("../vercel.json", import.meta.url), "utf8")
);

test("el cliente local agrega el prefijo /api/v1", () => {
  assert.match(cliente, /conApiV1/);
  assert.match(cliente, /\/api\/v1/);
  assert.match(cliente, /VITE_API_BASE_URL/);
});

test("el proxy de producción dirige las solicitudes hacia /api/v1", () => {
  const apiRewrite = vercel.rewrites.find((rewrite) => rewrite.source === "/api/:path*");

  assert.ok(apiRewrite);
  assert.equal(
    apiRewrite.destination,
    "https://c-ejixhole-backend.onrender.com/api/v1/:path*"
  );
});

test("la sesión HttpOnly y CSRF continúan activos", () => {
  assert.match(cliente, /withCredentials:\s*true/);
  assert.match(cliente, /X-CSRF-Token/);
  assert.doesNotMatch(cliente, /localStorage/);
});
