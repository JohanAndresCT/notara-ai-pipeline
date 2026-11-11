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
  test("ABC placeholder contains separate lines", async ({ page }) => {
    await registerUser(page);
    await page.goto("/scores/new");
    await page.getByRole("button", { name: /Notación ABC/i }).click();

    await expect(page.getByLabel("Tu partitura *")).toHaveAttribute(
      "placeholder",
      "X:1\nT:Mañana en Sol\nM:4/4\nL:1/8\nK:G\nGABc d2 B2",
    );
  });

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
    await expect(page.locator('header a[href="/login"]')).toBeVisible();
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

// MVP 2 (P07 v2.0): UI states of the voice/audio features without calling any provider
// (no ElevenLabs, Gemini, microphone or AI model download is triggered).
async function publishAbcScore(page: Page, title: string) {
  await page.goto("/scores/new");
  await page.getByLabel("Título *").fill(title);
  await page.getByLabel("Instrumento *").selectOption("Violín");
  await page.getByLabel("Descripción *").fill("Partitura ABC creada por la prueba E2E.");
  await page.getByRole("button", { name: /Notación ABC/i }).click();
  await page.getByLabel("Tu partitura *").fill("X:1\nT:Escala\nM:4/4\nL:1/4\nK:C\nC D E F | G A B c |");
  await page.getByRole("button", { name: /Crear partitura/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

async function openScore(page: Page, title: string) {
  await page.goto("/");
  const card = page.locator("article.post-card", { hasText: title }).first();
  await card.getByRole("link", { name: /Ver partitura/i }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
}

test.describe("Notara E2E — MVP 2", () => {
  test("panel de escucha, instrumentos con IA y tutor en una partitura ABC", async ({ page }) => {
    await registerUser(page);
    const title = `ABC ${uniqueToken()}`;
    await publishAbcScore(page, title);
    await openScore(page, title);

    await expect(page.getByRole("heading", { name: "Escuchar la partitura" })).toBeVisible();
    for (const name of ["Piano", "Guitarra", "Violín", "Flauta", "Trompeta", "Saxofón"]) {
      await expect(page.getByRole("button", { name: `Reproducir ${name}` })).toBeEnabled();
    }
    await expect(page.locator(".instrument-button .ai-badge")).toHaveCount(4);
    await expect(page.getByRole("button", { name: "Reproducir Violín" })).toHaveClass(/selected/);
    await expect(page.getByRole("button", { name: /Descargar solfeo \(MP3\)/ })).toBeDisabled();
    await expect(page.getByText("Genera primero el solfeo para descargarlo.")).toBeVisible();

    await page.getByRole("button", { name: /Preguntar al tutor/ }).click();
    await expect(page.getByText(/se envían a Google Gemini/)).toBeVisible();
    await expect(page.getByRole("button", { name: /Hablar con el tutor/ })).toBeVisible();
    await expect(page.getByText("Respuestas generadas por IA; pueden contener errores.")).toBeVisible();
  });

  test("partitura de texto: escucha desactivada y dictado bloqueado al editar", async ({ page }) => {
    await registerUser(page);
    const title = `Texto ${uniqueToken()}`;
    await publishScore(page, title);
    await openScore(page, title);

    await expect(page.getByText("Disponible solo para partituras en ABC").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Reproducir Piano" })).toBeDisabled();
    await expect(page.getByRole("button", { name: /Escuchar Solfeo/ })).toBeDisabled();

    await page.getByRole("link", { name: "Editar" }).click();
    await expect(page.getByRole("heading", { name: "Dictar por voz" })).toBeVisible();
    await expect(page.getByText(/El dictado solo se añade a partituras en ABC/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Dictar" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Cargar archivo .abc" })).toBeVisible();
  });

  test("el comentario de voz solo aparece en partituras de otros usuarios", async ({ page }) => {
    await registerUser(page);
    const title = `Ajena ${uniqueToken()}`;
    await publishAbcScore(page, title);
    await openScore(page, title);
    await expect(page.getByRole("heading", { name: "Comentar con voz" })).toHaveCount(0);

    await page.getByRole("button", { name: /Cerrar sesión/i }).click();
    await registerUser(page);
    await openScore(page, title);
    await expect(page.getByRole("heading", { name: "Comentar con voz" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Grabar comentario" })).toBeVisible();
  });
});
