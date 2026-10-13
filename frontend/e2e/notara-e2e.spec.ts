import { expect, test, type Page } from "@playwright/test";

function uniqueToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function registerUser(page: Page) {
  const token = uniqueToken();
  const name = `Usuario ${token}`;
  const email = `e2e-${token}@example.com`;
  const password = "secret-pass-123";

  await page.goto("/register");
  await page.getByLabel("Nombre *").fill(name);
  await page.getByLabel("Correo electrónico *").fill(email);
  await page.getByLabel("Contraseña *").fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/$/);
  return { name, email, password };
}

async function publishScore(page: Page, title: string) {
  await page.goto("/scores/new");
  await page.getByLabel("Título *").fill(title);
  await page.getByLabel("Instrumento *").selectOption("Piano");
  await page.getByLabel("Descripción *").fill("Idea creada por la prueba E2E.");
  await page.getByLabel("Tu partitura *").fill("C D E F G");
  await page.getByRole("button", { name: /Crear partitura/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

test.describe("Notara E2E", () => {
  test("registro, login, logout y acceso anónimo a rutas protegidas", async ({ page }) => {
    const token = uniqueToken();
    const name = `Usuario ${token}`;
    const email = `e2e-${token}@example.com`;
    const password = "secret-pass-123";

    await page.goto("/register");
    await page.getByLabel("Nombre *").fill(name);
    await page.getByLabel("Correo electrónico *").fill(email);
    await page.getByLabel("Contraseña *").fill(password);
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: /Qué bueno verte/i })).toBeVisible();

    await page.getByRole("button", { name: /Cerrar sesión/i }).click();
    await expect(page.getByRole("link", { name: /Iniciar sesión/i })).toBeVisible();

    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: /Inicia sesión/i })).toBeVisible();

    await page.goto("/login");
    await page.getByLabel("Correo electrónico *").fill(email);
    await page.getByLabel("Contraseña *").fill(password);
    await page.getByRole("button", { name: /Iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.getByRole("button", { name: /Cerrar sesión/i }).click();
    await expect(page.getByRole("link", { name: /Iniciar sesión/i })).toBeVisible();
  });

  test("publicación con detalle y visualización en el feed", async ({ page }) => {
    await registerUser(page);
    const title = `Partitura ${uniqueToken()}`;

    await publishScore(page, title);
    await expect(page.getByRole("heading", { name: title })).toHaveCount(2);
    await page.getByRole("link", { name: /Ver partitura/i }).first().click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText("Idea creada por la prueba E2E.")).toBeVisible();
    await expect(page).toHaveURL(/\/scores\/\d+\/?$/);

    await page.getByRole("button", { name: /Me gusta/i }).click();
    await expect(page.getByText(/Te gusta|Me gusta/i)).toBeVisible();
  });

  test("edición de una partitura del propietario", async ({ page }) => {
    await registerUser(page);
    const beforeTitle = `Editar antes ${uniqueToken()}`;
    const afterTitle = `Editar después ${uniqueToken()}`;

    await publishScore(page, beforeTitle);
    await page.getByRole("link", { name: /Ver partitura/i }).first().click();
    await page.getByRole("link", { name: "Editar" }).click();

    await page.getByLabel("Título *").fill(afterTitle);
    await page.getByRole("button", { name: /Guardar cambios/i }).click();

    await expect(page.getByRole("heading", { name: afterTitle })).toBeVisible();
    await expect(page).toHaveURL(/\/scores\/\d+\/?$/);
  });

  test("eliminación de una partitura del propietario", async ({ page }) => {
    await registerUser(page);
    const title = `Eliminar ${uniqueToken()}`;

    await publishScore(page, title);
    await page.getByRole("link", { name: /Ver partitura/i }).first().click();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Eliminar" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(title)).not.toBeVisible();
  });

  test("publicación y acceso anónimo a una ruta protegida", async ({ page }) => {
    const user = await registerUser(page);
    const title = `Anónimo ${uniqueToken()}`;

    await publishScore(page, title);
    await page.getByRole("button", { name: /Cerrar sesión/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/scores/new");
    await expect(page).toHaveURL(/\/scores\/new\/?$/);
    await expect(page.getByRole("heading", { name: /Inicia sesión/i })).toBeVisible();

    await page.goto("/login");
    await page.getByLabel("Correo electrónico *").fill(user.email);
    await page.getByLabel("Contraseña *").fill(user.password);
    await page.getByRole("button", { name: /Iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
