# Implementación CI/CD - P08

## 1. Metadatos y fuente

- Proyecto: Notara
- Estado: en implementación; ninguna ejecución remota ni publicación realizada.
- Rama observada al iniciar: `Arch-Front-end`.
- Inputs usados: `ai-pipeline/prompts/08_cicd/P08_cicd.md`, `ai-pipeline/artifacts/07_testing/TEST_VALIDATION.md`, `ai-pipeline/artifacts/05_architecture/ARCHITECTURE.md`, `ai-pipeline/artifacts/06_implementation/IMPLEMENTATION_VALIDATION.md`, manifests, settings, Compose y rutas reales.
- Nota de coherencia: el informe P06 conservado describe un estado anterior al backend actualmente presente; para runtime y comandos prevalecen `backend/`, sus tests y sus settings actuales. Se conserva el informe y se registra el desfase.

## 2. Runtime/dependencias observados

- Node local: 24.21.0; Vite 8 / TypeScript declarados en `frontend/package.json`.
- Gestor: pnpm 12.11.2, vía Corepack; lockfile único usado por CI: `frontend/pnpm-lock.yaml`.
- `frontend/package-lock.json` ya aparecía eliminado en el estado inicial P08; se conservó sin tocarlo y no se regeneró ni cambió el gestor.
- Playwright: 1.64.0, ya declarado/resuelto en el manifiesto/lockfile.
- Backend: Python 3.12 compatible, Django 5.2.1, DRF 3.15.2, psycopg2-binary 2.9.11.
- PostgreSQL: workflow configurado con servicio `postgres:16`.
- Railway CLI: `@railway/cli@5.67.1`, fijado en la invocación pnpm dlx.

## 3. Workflows y dependencias

`.github/workflows/ci.yml` corre en `pull_request`, `push` a todas las ramas y `workflow_dispatch`, con `contents: read`.

| Job | Runtime/base | Checks | Relación con deploy |
|---|---|---|---|
| `backend` | Python 3.12 + PostgreSQL 16 de CI | pip requirements, `manage.py check`, migraciones sin drift, `migrate`, suite `accounts scores`; exige un conteo ejecutado mayor que cero | Requisito |
| `frontend` | Node 24 + pnpm 12.11.2 | `pnpm install --frozen-lockfile`, typecheck app/E2E, build | Requisito |
| `e2e` | Node 24 + Chromium + PostgreSQL 16 separado | Instala browser deps y ejecuta los cinco casos Playwright contra backend/frontend reales; sube informes en fallo | Requisito |
| `deploy-railway` | Checkout de `github.sha`, Railway CLI 5.67.1 | Espera backend/frontend/E2E, sube el checkout y espera resultado; prueba `/api/health/` | Deshabilitado hasta configuración explícita |

El deploy requiere push al branch cuyo nombre exacto se configure en `RAILWAY_PRODUCTION_BRANCH`, variable `RAILWAY_DEPLOY_ENABLED=true`, environment protegido `production`, token y IDs/URL válidos. En ausencia de cualquiera de las variables de gate, el job se omite; si se habilita parcialmente, el preflight falla antes de invocar Railway. PR y workflow_dispatch no despliegan.

## 4. Producción/Railway

- `Dockerfile` construye frontend con pnpm frozen-lockfile y empaqueta el backend Python 3.12, Gunicorn y Nginx.
- Nginx sirve frontend compilado, fallback SPA, proxy same-origin `/api/` a Gunicorn y `/static/` de Django; no publica `/media/`.
- Django usa sesión/CSRF seguros, HTTPS del proxy Railway confiable, hosts/orígenes específicos, `DJANGO_DEBUG=false` y falla cerrado ante secret/host/origen ausentes o wildcard.
- Railway web service único + PostgreSQL privado. Perfil media va a `MEDIA_ROOT=/data/media`, respaldado por volumen `/data`; sin volumen persistente las fotos no se conservan.
- No se añadió `railway.toml` (Railway Config as Code está deprecado y no es aceptado en servicios nuevos; ver https://docs.railway.com/infrastructure-as-code) ni se aplicó Railway IaC. Los servicios, IDs, dominio, volumen/región y secretos quedan para alta/configuración manual documentada, evitando crear recursos.

## 5. Seguridad y límites

- Passwords PostgreSQL en CI son credenciales sintéticas de job y distintas a producción.
- El workflow nunca expone token Railway a PR. El deploy requiere environment protegido y `RAILWAY_TOKEN` como secret.
- `.railwayignore` excluye artefactos, traces, resultados, `.env` y credenciales locales de `railway up`.
- Ninguna rama, commit, recurso Railway ni URL pública fue creado.

## 6. Validación y estado

Evidencia ejecutada: `pnpm install --frozen-lockfile` PASS; YAML workflow parseado/formateado con Prettier PASS; typecheck app/E2E PASS; build PASS_WITH_WARNINGS; backend 88/88 y E2E 5/5 PASS con SQLite local aislado; `makemigrations --check` PASS. `check --deploy` con variables sintéticas completó con dos avisos HSTS; prueba negativa confirmó fail-closed al faltar `DJANGO_ALLOWED_HOSTS`. Detalles/códigos en `CICD_VALIDATION.md` y `PROMPT_LOG.md`.

Pendiente: GitHub Actions real con PostgreSQL 16, Docker build/runtime, ejecución E2E PostgreSQL, configurar environment/secrets/vars y servicios/volumen Railway, validar HSTS conforme al dominio elegido y primer deployment/healthcheck. Docker no está instalado localmente y no se creó ni modificó ningún recurso remoto.

Estado actual: configuración CI `READY_WITH_WARNINGS`; ejecución remota `NOT_RUN`; producción `READY_WITH_WARNINGS`; runtime `NOT_DEPLOYED`.
