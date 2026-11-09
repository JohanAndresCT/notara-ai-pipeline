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

> `.mise.toml`, `package.json`, el Dockerfile y el CI usan Node 24 y pnpm 12.11.2. No se verificó cuál es la versión mínima real soportada.

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
| `STT_DAILY_LIMIT` | Intentos STT admitidos por usuario y día UTC | Por defecto 30 |
| `STT_MODEL_ID`, `STT_MODEL_SIZE` | Identidad y tamaño del modelo | Solo se acepta `Systran/faster-whisper-tiny`, `tiny` |
| `STT_MODEL_DIR` | Directorio local con los pesos `faster-whisper` | Ruta relativa a la raíz del repositorio o absoluta; vacío desactiva STT |
| `STT_MODEL_REVISION` | Commit completo del modelo | Fijado a `d90ca5fe260221311c53c58e660288d3deb8d356`; cualquier otra revisión falla |
| `STT_MODEL_MANIFEST` | Manifiesto versionado `backend/voice/model_sha256.json` | Verifica inventario, tamaños y SHA-256 antes de cargar |
| `STT_MODEL_REQUIRED` | Hace fallar el arranque si el modelo no puede cargarse/verificarse | `false` por defecto; establecer `true` en el runtime STT |
| `STT_DEVICE`, `STT_COMPUTE_TYPE`, `STT_LANGUAGE` | Parámetros de inferencia | Solo `cpu`, `int8`, `es` |
| `STT_CPU_THREADS`, `STT_MAX_CONCURRENT` | Hilos CPU y concurrencia por proceso | Por defecto 2 hilos y exactamente 1 inferencia |
| `AUDIO_MAX_BYTES`, `AUDIO_MAX_SECONDS` | Límites de archivo de HU11 | Por defecto 2 MiB y 30 s |
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

El servidor de desarrollo de Vite hace proxy de `/api` hacia `http://127.0.0.1:8000`. Su puerto es `PORT` o 5173 (`vite.config.ts`).

### STT local (HU11)

Las dependencias de Django están en `backend\requirements.txt`; las de `experiments\whisper_tiny\requirements.txt` son solo para el spike aislado y no forman parte del backend. Los pesos nunca se descargan durante una solicitud ni se guardan en Git. `.local-models/` está excluida de Git y del contexto Docker.

El contrato de integración para frontend está en [API_STT_HU11.md](./API_STT_HU11.md).

El backend usa el repositorio público `Systran/faster-whisper-tiny`, fijado al commit inmutable `d90ca5fe260221311c53c58e660288d3deb8d356`. El inventario y los SHA-256 esperados están versionados en [model_sha256.json](../backend/voice/model_sha256.json). La verificación requiere exactamente `config.json`, `model.bin`, `tokenizer.json` y `vocabulary.txt`; el verificador rechaza archivos faltantes, adicionales, con tamaño distinto o con SHA-256 distinto. El manifiesto de confianza se mantiene en el repositorio, no se genera a partir de los pesos descargados.

La descarga ocurre solo al ejecutar explícitamente el aprovisionador. Requiere acceso a Hugging Face; no se ejecuta en el arranque de una solicitud HTTP. Ejecuta los comandos desde la raíz del repositorio y con las dependencias de `backend\requirements.txt` instaladas.

```powershell
$env:STT_MODEL_DIR = [System.IO.Path]::GetFullPath(".local-models\whisper-tiny")
Push-Location backend
python -m voice.provision_model --model-dir $env:STT_MODEL_DIR
Pop-Location
$env:DJANGO_DB_ENGINE = "sqlite"
python backend\manage.py migrate
$env:STT_MODEL_REQUIRED = "true"
python backend\manage.py runserver --noreload
```

En Linux, desde la raíz y con el entorno virtual activo:

```sh
export STT_MODEL_DIR="$PWD/.local-models/whisper-tiny"
(
  cd backend
  python -m voice.provision_model --model-dir "$STT_MODEL_DIR"
)
DJANGO_DB_ENGINE=sqlite python backend/manage.py migrate
export STT_MODEL_REQUIRED=true
DJANGO_DB_ENGINE=sqlite python backend/manage.py runserver --noreload
```

El aprovisionador verifica que Hugging Face resuelva el commit solicitado al mismo hash fijado, descarga los cuatro archivos a una carpeta temporal, compara tamaños y SHA-256 con el manifiesto versionado y solo entonces instala el directorio limpio. Una instalación válida existente se verifica y reutiliza; un directorio no vacío que no coincide se rechaza para evitar reemplazar datos silenciosamente. Para desarrollo en Windows, crea primero el entorno virtual con Python 3.12 e instala `backend\requirements.txt`, como en la sección anterior.

Al iniciar, el backend vuelve a calcular SHA-256 antes de cargar el modelo local en CPU/int8; si `STT_MODEL_REQUIRED=true`, cualquier ausencia o discrepancia detiene el arranque. No copies el directorio de pesos ni lo incluyas en Git: comparte únicamente código, configuración y manifiesto. En Railway aún se necesita una estrategia de almacenamiento/provisión compatible con el filesystem del contenedor, además de pruebas de memoria, latencia, calidad y concurrencia; nada de esto se ha validado en Railway.

## Opción B: Docker Compose

```powershell
docker compose up
```

Levanta `postgres:16-alpine`, el backend (`python:3.12-slim`, `runserver`) y el frontend (`node:20-alpine`, `npm install`). Esta configuración usa Node 20 y npm, distinto al resto del proyecto (`P09-DISC-005`). No se ejecutó Compose en P09.

## Comandos de calidad

| Acción | Comando | Directorio |
|---|---|---|
| Pruebas backend | `python backend\manage.py test accounts scores voice` | raíz |
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
