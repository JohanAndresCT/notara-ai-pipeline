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

## 7. Revalidación P08 por fallo CI reportado

- El usuario informó que CI para `c34419a` falló en E2E con `ModuleNotFoundError: No module named 'django'`. Clasificado como `USER_REPORTED`; no se inspeccionó el run ni se verificó que el SHA corresponda al checkout local.
- Revisión directa: el job `e2e` configura PostgreSQL 16, Node/pnpm y Playwright, pero no usa `actions/setup-python` ni instala `backend/requirements.txt`. `frontend/playwright.config.ts` lanza Django mediante el comando `python backend/manage.py ...`; la ausencia de Django en ese runner explica el síntoma reportado.
- Corrección aplicada: el job E2E usa `actions/setup-python@v5` con Python 3.12, instala `../backend/requirements.txt` antes de Playwright y entrega `steps.setup-python.outputs.python-path` a `DJANGO_PYTHON`. Playwright usa esa ruta para migrate/runserver. PostgreSQL 16 y los cinco tests se mantienen; no hay cambio a SQLite en CI ni exclusiones.
- Validación local: workflow YAML pasa Prettier, typecheck app/E2E pasa; con `DJANGO_PYTHON` fijado a la ruta local, Playwright completó 5/5 en 23.1 s contra SQLite local aislado. Esta validación confirma el cableado del intérprete, no el job remoto ni PostgreSQL 16.
- CI configuration: `READY_WITH_WARNINGS`; el run corregido de GitHub Actions y PostgreSQL 16 siguen `NOT_RUN`. La falla histórica de `c34419a` permanece como USER_REPORTED y no se borra del registro.
- No hubo commit/push ni publicación.

## 8. Revalidación P08 posterior al despliegue (2026-10-14)

- Motivo: la usuaria informó que Notara ya está desplegada en https://notara-production.up.railway.app, lo que contradecía `NOT_DEPLOYED` en los artefactos.
- Consultas de solo lectura: API pública de GitHub Actions (runs `38481851856`, `38610251114`, `38606194394`, `38605929025`; jobs y pasos, sin logs) y GET a la URL pública (health, SPA, CSRF, 401 de API, estáticos, `/media/`, `/admin/login/`, cabecera HSTS).
- Resultado: los 4 jobs del run `38481851856` (SHA `430dfad`) y del run `38610251114` (SHA `3ce012f`) en success, con deploy a Railway y verificación de health. El E2E falló en el run `38606194394` (PR, SHA `54a26f5`) y pasó en el run `38605929025` con el mismo SHA: hallazgo `P08-VAL-005`, causa UNKNOWN.
- Actualizados: `CICD_VALIDATION.md` (sección 14 nueva; secciones 7/10 marcadas como históricas), `CICD_IMPLEMENTATION.md`, `DEPLOYMENT_GUIDE.md`, `README.md`. Las secciones 12-13 de la validación siguen siendo `USER_REPORTED`.
- Runtime: `DEPLOYED_AND_VERIFIED` con alcance limitado. Sin verificar: persistencia de medios, backups, rollback, protección del Environment `production`, redirección HTTP→HTTPS, ID de deployment de Railway.
- No se modificó código, tests, dependencias ni workflow; no hubo commit, push ni redeploy; no se crearon datos en producción ni se expusieron secretos.
