import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const leer = (ruta) => readFile(new URL(`../${ruta}`, import.meta.url), "utf8");

test("el panel conserva el flujo oficial de una visita", async () => {
  const pagina = await leer("src/features/reservaciones/ReservacionesListPage.tsx");

  assert.match(pagina, /pendiente:\s*"Pendiente"/);
  assert.match(pagina, /confirmada:\s*"Confirmada"/);
  assert.match(pagina, /en_curso:\s*"En curso"/);
  assert.match(pagina, /completada:\s*"Completada"/);

  assert.match(pagina, /r\.estado === "pendiente"/);
  assert.match(pagina, /r\.estado === "confirmada"/);
  assert.match(pagina, /r\.estado === "en_curso" && r\.pago_completo/);
  assert.match(pagina, /r\.estado === "en_curso" && !r\.pago_completo/);

  assert.match(pagina, /Check-in/);
  assert.match(pagina, /Check-out/);
  assert.match(pagina, /Cobrar saldo/);
});

test("reservaciones muestra prioridades operativas y recuperación de filtros", async () => {
  const pagina = await leer("src/features/reservaciones/ReservacionesListPage.tsx");

  assert.match(pagina, /Por revisar/);
  assert.match(pagina, /Llegadas pendientes/);
  assert.match(pagina, /En el parque/);
  assert.match(pagina, /Saldo por cobrar/);
  assert.match(pagina, /Siguiente paso/);
  assert.match(pagina, /Cobrar saldo antes de salida/);
  assert.match(pagina, /Limpiar filtros/);
  assert.match(pagina, /rangoFechasInvalido/);
  assert.match(pagina, /La fecha “Hasta” no puede ser anterior a “Desde”/);
});

test("los contratos HTTP críticos apuntan a los endpoints correctos", async () => {
  const [auth, reservaciones, pagos, caja] = await Promise.all([
    leer("src/api/auth.ts"),
    leer("src/api/reservaciones.ts"),
    leer("src/api/pagos.ts"),
    leer("src/api/caja.ts"),
  ]);

  assert.match(auth, /"\/auth\/login"/);
  assert.match(auth, /"\/auth\/logout"/);
  assert.match(reservaciones, /`\/reservaciones\/\$\{id\}\/check-in`/);
  assert.match(reservaciones, /`\/reservaciones\/\$\{id\}\/check-out`/);
  assert.match(pagos, /"\/pagos"/);
  assert.match(pagos, /"Idempotency-Key"/);
  assert.match(caja, /"\/caja\/abrir"/);
  assert.match(caja, /`\/caja\/\$\{sesionId\}\/movimientos`/);
  assert.match(caja, /"Idempotency-Key"/);
});

test("la sesión administrativa no persiste el JWT en JavaScript", async () => {
  const [cliente, contexto, vercel] = await Promise.all([
    leer("src/api/client.ts"),
    leer("src/context/AuthContext.tsx"),
    leer("vercel.json"),
  ]);

  assert.match(cliente, /withCredentials:\s*true/);
  assert.match(cliente, /"X-CSRF-Token"/);
  assert.match(cliente, /import\.meta\.env\.PROD \? "\/api"/);
  assert.doesNotMatch(cliente, /localStorage/);
  assert.doesNotMatch(cliente, /headers\.Authorization/);

  assert.match(contexto, /await authApi\.me\(\)/);
  assert.match(contexto, /await authApi\.logout\(\)/);
  assert.doesNotMatch(contexto, /jwtDecode|setStoredToken|getStoredToken/);

  assert.match(vercel, /"source": "\/api\/:path\*"/);
  assert.match(vercel, /c-ejixhole-backend\.onrender\.com/);
});

test("caja reutiliza la clave idempotente hasta recibir éxito", async () => {
  const hookCaja = await leer("src/features/caja/useCaja.ts");

  assert.match(hookCaja, /useRef\(generarIdempotencyKey\(\)\)/);
  assert.match(hookCaja, /cajaApi\.abrir\(data, idempotencyKeyRef\.current\)/);
  assert.match(
    hookCaja,
    /cajaApi\.registrarMovimiento\(sesionId, data, idempotencyKeyRef\.current\)/
  );
  assert.doesNotMatch(hookCaja, /onError:[\s\S]{0,180}generarIdempotencyKey/);
});

test("el generador produce UUID distintos para operaciones nuevas", async () => {
  const { generarIdempotencyKey } = await import("../src/lib/idempotencyKey.ts");
  const primera = generarIdempotencyKey();
  const segunda = generarIdempotencyKey();

  assert.notEqual(primera, segunda);
  assert.match(primera, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});
