# Instalación y configuración

Guía para ejecutar Notara en local, con Docker Compose y para entender el despliegue en Railway. Cada comando se tomó de `package.json`, `docker-compose.yml`, `Dockerfile`, `deploy/entrypoint.sh` y `.github/workflows/ci.yml`.

## Requisitos previos

| Herramienta | Versión | Fuente |
|---|---|---|
| Python | 3.12 (imagen Docker y CI). Las pruebas de P09 se ejecutaron con 3.13.14 | `Dockerfile`, `ci.yml` |
| Node.js | 24 (Dockerfile y CI) | `Dockerfile`, `ci.yml` |
| pnpm | 12.11.2 (campo `packageManager`) | `frontend/package.json` |
| PostgreSQL | 16 (Compose y CI) | `docker-compose.yml`, `ci.yml` |
| Docker + Docker Compose | Solo para la opción Compose | `docker-compose.yml` |

> `.mise.toml` declara Node 22 y pnpm 10.34.3, lo que difiere de `package.json`, el Dockerfile y el CI. Ver [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md) (`P09-DISC-005`). No se verificó cuál es la versión mínima real soportada.

## Variables de entorno

Se leen desde el entorno o desde un archivo `.env` en la raíz del repositorio. Copia `.env.example` a `.env` y completa los valores. **Nunca subas valores reales al repositorio.**

| Variable | Uso | Notas |
|---|---|---|
| `DJANGO_SECRET_KEY` | Clave secreta de Django | Obligatoria cuando `DJANGO_DEBUG=false` |
| `DJANGO_DEBUG` | Modo debug | Por defecto `True` |
| `DJANGO_ALLOWED_HOSTS` | Hosts permitidos | Lista separada por comas |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | Orígenes confiables CSRF | Necesaria tras HTTPS |
| `RAILWAY_PUBLIC_DOMAIN` | Dominio público Railway | Lo provee Railway |
| `DJANGO_DB_ENGINE` | `sqlite` o `postgresql` | Por defecto PostgreSQL |
| `SQLITE_DB_PATH` | Ruta del archivo SQLite | Solo con `sqlite` |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` | Conexión PostgreSQL | |
| `MEDIA_ROOT`, `STATIC_ROOT` | Rutas de archivos | |
| `DJANGO_FILE_STORAGE_BACKEND` | Backend de almacenamiento | |
| `PROFILE_PHOTO_MAX_BYTES` | Tamaño máximo de foto de perfil | Por defecto 5 MiB |
| `GUNICORN_WORKERS` | Workers de Gunicorn | Solo `deploy/entrypoint.sh` |
| `PORT` | Puerto del contenedor | Lo provee Railway |
| `VITE_API_PROXY_TARGET` | Destino del proxy `/api` de Vite | Por defecto `http://127.0.0.1:8000` |
| `VITE_API_BASE_URL` | Aparece en `.env.example` | No se encontró uso en `frontend/src` ni `vite.config.ts` |

Con `DJANGO_DEBUG=false` se activan cookies seguras, redirección SSL, cabecera de proxy SSL y HSTS (`settings.py`).

## Opción A: ejecución local sin Docker (SQLite)

Desde la raíz del repositorio (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
$env:DJANGO_DB_ENGINE = "sqlite"
python backend\manage.py migrate
python backend\manage.py runserver
```

En otra terminal:

```powershell
cd frontend
corepack enable
pnpm install
pnpm dev
```

El servidor de desarrollo de Vite hace proxy de `/api` hacia `http://127.0.0.1:8000`. Su puerto es `PORT` o 8443 (`vite.config.ts`).

## Opción B: Docker Compose

```powershell
docker compose up
```

Levanta `postgres:16-alpine`, el backend (`python:3.12-slim`, `runserver`) y el frontend (`node:20-alpine`, `npm install`). Esta configuración usa Node 20 y npm, distinto al resto del proyecto (`P09-DISC-005`). No se ejecutó Compose en P09.

## Comandos de calidad

| Acción | Comando | Directorio |
|---|---|---|
| Pruebas backend | `python backend\manage.py test accounts scores` | raíz |
| Chequeo Django | `python backend\manage.py check` | raíz |
| Migraciones pendientes | `python backend\manage.py makemigrations --check --dry-run` | raíz |
| Tipos | `pnpm typecheck` | `frontend/` |
| Build | `pnpm build` | `frontend/` |
| E2E | `pnpm test:e2e` | `frontend/` |
| Formato | `pnpm format` | `frontend/` |

Detalles en [TESTING.md](./TESTING.md).

## Despliegue

- **Estado:** `DEPLOYED`. URL pública: <https://notara-production.up.railway.app>.
- **Evidencia:** `GET /api/health/` y `/api/v1/health/` responden 200 con `{"status": "ok", "service": "notara-backend"}` (observado el 2026-10-14); el CI muestra el job `Deploy tested commit to Railway` exitoso en las ejecuciones #7 y #16 (metadatos de GitHub Actions). El equipo reportó además verificaciones manuales (`USER_REPORTED`).
- **Imagen:** el `Dockerfile` raíz construye la SPA con Node 24 y pnpm, y la sirve con Nginx junto a Gunicorn/Django (`python:3.12-slim`).
- **Arranque:** `deploy/entrypoint.sh` exige `PORT`, `DJANGO_SECRET_KEY` y las variables `POSTGRES_*`, fuerza `DEBUG=false`, ejecuta `check --deploy` y `migrate`, e inicia Gunicorn (127.0.0.1:8000) y Nginx.
- **Nginx** (`docker/nginx.conf.template`): `/api/` hacia Gunicorn, `/static/` desde `staticfiles`, `/` como fallback SPA, `client_max_body_size` 6m. No sirve `/media/`.
- **CI/CD:** `.github/workflows/ci.yml` con los jobs `backend`, `frontend`, `e2e` y `deploy-railway`. El despliegue solo corre en `push` cuando `vars.RAILWAY_DEPLOY_ENABLED == 'true'` y la rama coincide con `vars.RAILWAY_PRODUCTION_BRANCH`, con el environment `production` y el secreto `RAILWAY_TOKEN`.
- **Sin verificar:** persistencia del volumen `/data`, copias de seguridad, rollback, protección del environment y redirección HTTP→HTTPS.

Para el procedimiento completo ver `ai-pipeline/artifacts/08_cicd/DEPLOYMENT_GUIDE.md`.
