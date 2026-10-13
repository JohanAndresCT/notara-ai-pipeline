# Registro de prompt - P08 CI/CD

## 1. Identidad

- Proyecto: Notara
- Prompt del sistema: `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`
- Prompt de etapa: `ai-pipeline/prompts/08_cicd/P08_cicd.md`
- Rama al inspeccionar: `Arch-Front-end`
- Estado inicial local: cambios previos en prompts P07/P08, corrección HTTP 204 y suite Playwright; todos se preservaron.
- `frontend/package-lock.json` ya constaba como eliminado en el diff inicial P08; se dejó intacto. El único gestor configurado/ejecutado es pnpm.

## 2. Entrada P07 usada

- `ai-pipeline/artifacts/07_testing/TEST_VALIDATION.md`: 88/88 backend y 5/5 Playwright PASS usando SQLite local; PostgreSQL NOT_RUN.
- Playwright 1.64.0 en `frontend/package.json` + `frontend/pnpm-lock.yaml`; lockfile pnpm existente.
- El workflow CI nuevo ejecuta tanto backend como los cinco E2E con PostgreSQL 16 para cerrar la brecha que quedó pendiente en P07.

## 3. Runtime observado

- Node local: 24.21.0.
- pnpm local/proyecto: 12.11.2 (`corepack.cmd pnpm --version`).
- Playwright lockeado: 1.64.0.
- Railway CLI consultado mediante `pnpm view`: 5.67.1; se fija esa versión en el job de deploy.
- Docker no está instalado en este entorno. No se inició PostgreSQL local, no se construyó imagen y no se contactó/provisionó Railway.

## 4. Alcance previsto

- GitHub Actions en PR, push y workflow_dispatch: check/migraciones/tests Django sobre PostgreSQL 16, typecheck/build pnpm frozen-lockfile y cinco Playwright E2E contra PostgreSQL 16.
- Deploy Railway en el mismo workflow, condicionado a todos los jobs, push al branch indicado por variable de repo, variable de habilitación explícita, GitHub Environment y credenciales/IDs configurados.
- Producción: imagen única Nginx + Gunicorn, UI y API bajo el mismo origen, PostgreSQL por red privada y media en volumen montado manualmente. No se agrega Config as Code `railway.toml`: Railway lo deprecó para proyectos nuevos; tampoco se agrega IaC que pudiera crear recursos al aplicarse.

## 5. Validación de esta etapa

Checks locales ejecutados (SQLite es evidencia complementaria, no PostgreSQL):

- `corepack.cmd pnpm install --frozen-lockfile`: PASS con pnpm 12.11.2, lockfile up to date.
- `corepack.cmd pnpm typecheck`: PASS.
- Typecheck estricto de `playwright.config.ts` y `e2e/notara-e2e.spec.ts`: PASS.
- `corepack.cmd pnpm build`: PASS; Lightning CSS reportó advertencias sobre `@theme`/`@tailwind`.
- `corepack.cmd pnpm test:e2e`: 5/5 PASS en Chromium con SQLite temporal por proceso y servicios locales propios.
- `python backend/manage.py test accounts scores --verbosity 1` con SQLite temporal: 88/88 PASS (`Ran 88 tests in 74.632s`).
- `python backend/manage.py makemigrations --check --dry-run`: PASS, `No changes detected`.
- `python backend/manage.py check`: PASS.
- `python backend/manage.py check --deploy` con settings/valores sintéticos: 2 warnings HSTS (includeSubDomains/preload), pendientes de decidir para el dominio real.
- Prueba fail-closed: `DJANGO_DEBUG=False` sin `DJANGO_ALLOWED_HOSTS` detuvo startup con el error esperado.
- `pnpm dlx prettier@3.6.2 --check ../.github/workflows/ci.yml`: PASS; YAML parseado/formateado. Prettier fue efímero y no se agregó al proyecto.

No ejecutado:

- GitHub Actions y PostgreSQL 16 real: `NOT_RUN`.
- Docker build/container smoke: `NOT_RUN`; Docker CLI no está instalado.
- Deploy/healthcheck Railway: `NOT_RUN`; gate desactivado y sin credenciales/IDs/URL/recursos.

La validación P06 conservada afirma que backend/PostgreSQL no existen, en contradicción con el source actual que sí contiene Django, migrations y tests. Se priorizó el estado del código y manifests activos; el desfase está documentado en `CICD_IMPLEMENTATION.md`. Los prompts P07/P08 preexistentes permanecen intactos; no se crearon ramas, commits, pushes ni recursos externos.

## 6. Auditoría P08_validation

- Se releyeron `SYSTEM_PROMPT.md`, `P08_validation.md`, el workflow actual, Dockerfile, Nginx, entrypoint, settings y los informes P08 actuales. No se ejecutó el comando Git anterior ni se modificó código/configuración.
- Workflow/gates y SHA: STATIC_REVIEW. `deploy-railway` depende de backend/frontend/e2e, solo push en branch variable, valida activación/IDs/URL, checkout explícito `github.sha`, serializa production y hace smoke `/` + `/api/health/`. No existe run remoto para comprobar el valor concreto del SHA ni sus logs.
- Railway Environment: referencia `production` presente, pero approvals/restricciones de branch no se configuran desde este YAML y no fueron verificados en GitHub.
- Railway docs oficiales consultadas 2026-10-13: https://docs.railway.com/config-as-code y https://docs.railway.com/infrastructure-as-code. Confirman deprecated; servicios nuevos no pueden elegir Config as Code; legacy deja de leer railway.toml/json el 2026-12-01. La afirmación anterior es correcta con ese alcance.
- Estado de evidencia: P07 backend/E2E SQLite y checks locales están resumidos en los artifacts; GitHub Actions con PostgreSQL16, Docker y Railway continúan `NOT_RUN`. No se hicieron cambios a fuentes, tests ni workflow.
- Informe actualizado: `ai-pipeline/artifacts/08_cicd/CICD_VALIDATION.md`; runtime sigue `NOT_DEPLOYED`.
