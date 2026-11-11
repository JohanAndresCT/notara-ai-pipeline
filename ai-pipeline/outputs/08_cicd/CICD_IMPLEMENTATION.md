# Implementación CI/CD - P08

## 1. Metadatos y fuente

- Proyecto: Notara
- Estado inicial (2026-10-13, histórico): en implementación; ninguna ejecución remota ni publicación realizada. Estado vigente tras el despliegue: ver sección 6 y `CICD_VALIDATION.md` sección 14.
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
- Estado inicial (histórico, previo al despliegue): ninguna rama, commit, recurso Railway ni URL pública fue creado por esta etapa.

## 6. Validación y estado

Evidencia ejecutada: `pnpm install --frozen-lockfile` PASS; YAML workflow parseado/formateado con Prettier PASS; typecheck app/E2E PASS; build PASS_WITH_WARNINGS; backend 88/88 y E2E 5/5 PASS con SQLite local aislado; `makemigrations --check` PASS. `check --deploy` con variables sintéticas completó con dos avisos HSTS; prueba negativa confirmó fail-closed al faltar `DJANGO_ALLOWED_HOSTS`. Detalles/códigos en `CICD_VALIDATION.md` y `PROMPT_LOG.md`.

Pendiente: GitHub Actions real con PostgreSQL 16, Docker build/runtime, ejecución E2E PostgreSQL, configurar environment/secrets/vars y servicios/volumen Railway, validar HSTS conforme al dominio elegido y primer deployment/healthcheck. Docker no está instalado localmente y no se creó ni modificó ningún recurso remoto.

Estado actual (revalidado 2026-10-14): configuración CI `READY_WITH_WARNINGS`; ejecución remota `PASS` (run `38481851856`, SHA `430dfad`, y run `38610251114`, SHA `3ce012f`, rama `pruebas-despliegue`, con E2E intermitente en el run `38606194394`); producción `READY_WITH_WARNINGS`; runtime `DEPLOYED_AND_VERIFIED` (alcance limitado: health, SPA, 401 de API y CSRF verificados; persistencia de medios, backups y rollback pendientes). URL: https://notara-production.up.railway.app. Detalle y límites en `CICD_VALIDATION.md` sección 14. Esta revalidación no cambió código, tests, workflow ni configuración.


---

## Run 2 — MVP 2 (prompts P08 v2.0, 2026-11-11)

Modo incremental (P08_cicd v2.0 §0). Se conserva todo lo anterior.

### R2.1 Cambios aplicados

| Archivo | Cambio | Motivo |
|---|---|---|
| `.github/workflows/ci.yml` (job `backend`) | `manage.py test accounts scores` → `manage.py test` (todas las apps) con `STT_MODEL_REQUIRED=false` | **P08-MVP2-01**: CI omitía la app `voice` (40 pruebas MVP 2: STT, normalizador Gemini, tutor). Los proveedores se sustituyen por fakes, así que no se necesitan claves. |
| `.env.example` | `ELEVENLABS_API_KEY` y `ELEVENLABS_VOICE_ID` vaciados | **P08-MVP2-02 (CRITICAL)**: el commit `12c5e85` versionó una clave ElevenLabs con formato real en `.env.example` y está publicado en `origin`. Se elimina del árbol; **la clave debe revocarse/rotarse en ElevenLabs** (el historial de git la conserva). La voz de biblioteca devolvía 402 en plan gratuito; vacío = voz prefabricada por defecto. |

No se cambió el job de despliegue ni se activó ningún despliegue.

### R2.2 Configuración MVP 2 verificada (estática)

| Requisito P08 v2.0 | Evidencia | Estado |
|---|---|---|
| CI sin claves de proveedor | Ningún job define `ELEVENLABS_*`/`GEMINI_*`; pruebas con fakes/mocks (P07 Run 2) | OK |
| Variables MVP 2 documentadas sin valores | `.env.example`: `STT_*`, `AUDIO_*`, `VOICE_*`, `TTS_TIMEOUT_SECONDS`, `EDGE_TTS_VOICE`, `ELEVENLABS_*`, `GEMINI_*`, `DICTATION_AI_ENABLED`, `TUTOR_*` | OK (tras P08-MVP2-02) |
| Modelo Whisper en la imagen | `Dockerfile`: `voice.provision_model` descarga revisión fijada `ebe41f70…` y verifica `model_sha256.json`; `STT_MODEL_REQUIRED=true` | OK (estático) |
| `MEDIA_ROOT` en volumen persistente | `Dockerfile` `MEDIA_ROOT=/data/media`; volumen `/data` en Railway (PRE-005) | Configurado; montaje real NOT_RUN |
| Migraciones en despliegue | `deploy/entrypoint.sh` ejecuta `migrate --noinput` antes de Gunicorn; incluye `scores.0006`, `voice.0002`, `voice.0003`; CI comprueba drift (`makemigrations --check`) | OK |
| HTTPS (micrófono y WebSocket Gemini Live) | `SECURE_SSL_REDIRECT`/`SESSION_COOKIE_SECURE` con `DEBUG=False`; el job deploy exige `RAILWAY_PUBLIC_URL` `https://` | OK (estático) |
| Límites diarios | Defaults: STT 30, voz 20, tutor 5 sesiones / 20 preguntas. Valores locales distintos (p. ej. 50) solo en `.env` del desarrollador; en producción se fijan como variables Railway | Documentado |

### R2.3 Pendientes

- P08-MVP2-03: el job `backend` usa Python 3.12 y la ejecución local 3.13; la imagen también 3.12 (coherente con CI).
- P08-MVP2-04: modelos DDSP se cargan desde `storage.googleapis.com` (ARCH-RISK-211); sin CSP que lo restrinja. Auto-hospedar si el equipo lo exige.
- P08-MVP2-05: los defaults de modelos Gemini (`gemini-3.5-flash-lite`, `gemini-2.5-flash-native-audio-latest`) son alias que pueden cambiar (ARCH-RISK-212).
