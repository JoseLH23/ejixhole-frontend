import { expect, test } from "@playwright/test";

const perfilAdmin = {
  id: 1,
  nombre: "Administración E2E",
  email: "admin@ejixhole.test",
  rol: "admin",
  activo: true,
};

async function responderJson(route, status, body) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

test("una ruta protegida redirige al login cuando no existe sesión", async ({ page }) => {
  await page.route("**/api/auth/me", (route) =>
    responderJson(route, 401, { detail: "Sesión no válida" })
  );

  await page.goto("/clientes");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Bienvenido de vuelta" })).toBeVisible();
});

test("el formulario valida los campos antes de llamar al backend", async ({ page }) => {
  await page.route("**/api/auth/me", (route) =>
    responderJson(route, 401, { detail: "Sesión no válida" })
  );

  await page.goto("/login");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page.getByText("Ingresa tu email")).toBeVisible();
  await expect(page.getByText("Ingresa tu contraseña")).toBeVisible();
});

test("muestra un mensaje claro cuando las credenciales son rechazadas", async ({ page }) => {
  await page.route("**/api/auth/me", (route) =>
    responderJson(route, 401, { detail: "Sesión no válida" })
  );
  await page.route("**/api/auth/login", (route) =>
    responderJson(route, 401, { detail: "Credenciales incorrectas" })
  );

  await page.goto("/login");
  await page.getByLabel("Email").fill("persona@ejixhole.test");
  await page.getByLabel("Contraseña").fill("credencial-invalida");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page.getByText("Email o contraseña incorrectos.")).toBeVisible();
});

test("restaura una sesión HttpOnly consultando el perfil del servidor", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => responderJson(route, 200, perfilAdmin));

  await page.goto("/no-autorizado");

  await expect(page).toHaveURL(/\/no-autorizado$/);
  await expect(page.getByRole("heading", { name: "No tienes acceso a esta sección" })).toBeVisible();
  await expect(page.getByText(/Tu rol \(admin\)/)).toBeVisible();
});

test("un rol sin permiso es enviado a la pantalla de acceso restringido", async ({ page }) => {
  await page.route("**/api/auth/me", (route) =>
    responderJson(route, 200, { ...perfilAdmin, rol: "cajero" })
  );

  await page.goto("/tarifas");

  await expect(page).toHaveURL(/\/no-autorizado$/);
  await expect(page.getByText(/Tu rol \(cajero\)/)).toBeVisible();
});
