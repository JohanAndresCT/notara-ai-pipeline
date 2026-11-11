# Instalación y configuración

Guía para ejecutar Notara en local, con Docker Compose y para entender el despliegue en Railway. Cada comando se tomó de `package.json`, `docker-compose.yml`, `Dockerfile`, `deploy/entrypoint.sh` y `.github/workflows/ci.yml`.

## Requisitos previos

| Herramienta | Versión | Fuente |
|---|---|---|
| Python | 3.11.9 en la revalidación local actual; 3.12 en imagen Docker y CI | `P06` current validation, `Dockerfile`, `ci.yml` |
| Node.js | 24 (Dockerfile y CI) | `Dockerfile`, `ci.yml` |
| pnpm | 12.11.2 (campo `packageManager`) | `frontend/package.json` |
| PostgreSQL | 16 (Compose y CI) | `docker-compose.yml`, `ci.yml` |
| Docker + Docker Compose | Solo para la opción Compose | `docker-compose.yml` |

> `.mise.toml`, `package.json`, el Dockerfile y el CI usan Node 24 y pnpm 12.11.2. No se verificó cuál es la versión mínima real soportada.

## Variables de entorno

Se leen desde el entorno o desde un archivo `.env` en la raíz del repositorio. Copia `.env.example` a `.env` y completa los valores. **Nunca subas valores reales al repositorio.** Las variables son condicionales: la clave Django es obligatoria con `DJANGO_DEBUG=false`; `POSTGRES_*` se requieren al elegir PostgreSQL; `SQLITE_DB_PATH` solo aplica a SQLite; y `STT_MODEL_DIR` más su revisión/manifiesto se requieren cuando STT debe cargar un modelo. Las credenciales ElevenLabs/Gemini son opcionales y solo corresponden a los motores o cambios que las usan. El resto tiene defaults o se usa solo en su runtime, según las notas de la tabla y `settings.py`/`entrypoint.sh`.

| Variable | Uso | Notas |
|---|---|---|
| `DJANGO_SECRET_KEY` | Clave secreta de Django | Obligatoria cuando `DJANGO_DEBUG=false` |
| `DJANGO_DEBUG` | Modo debug | Por defecto `True` |
| `DJANGO_ALLOWED_HOSTS` | Hosts permitidos | Lista separada por comas; configura los hosts reales en despliegue |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | Orígenes confiables CSRF | Configuración condicional para los orígenes HTTPS |
| `RAILWAY_PUBLIC_DOMAIN` | Dominio público Railway | Solo para runtime Railway; lo provee Railway |
| `DJANGO_DB_ENGINE` | `sqlite` o `postgresql` | Por defecto PostgreSQL |
| `SQLITE_DB_PATH` | Ruta del archivo SQLite | Solo con `sqlite` |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` | Conexión PostgreSQL | Requeridas con `DJANGO_DB_ENGINE=postgresql`; no se requieren para SQLite |
| `MEDIA_ROOT`, `STATIC_ROOT` | Rutas de archivos | Opcionales; settings define valores por defecto |
| `DJANGO_FILE_STORAGE_BACKEND` | Backend de almacenamiento | Opcional; usa el backend configurado por Django si se omite |
| `PROFILE_PHOTO_MAX_BYTES` | Tamaño máximo de foto de perfil | Por defecto 5 MiB |
| `STT_DAILY_LIMIT` | Intentos STT admitidos por usuario y día UTC | Por defecto 30 |
| `STT_MODEL_ID`, `STT_MODEL_SIZE` | Identidad y tamaño del modelo | Defaults restringidos a `Systran/faster-whisper-base`, `base` |
| `STT_MODEL_DIR` | Directorio local con los pesos `faster-whisper` | Opcional; ruta relativa a la raíz del repositorio o absoluta; vacío desactiva STT |
| `STT_MODEL_REVISION` | Commit completo del modelo | Requerido con modelo local; fijado a `ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66`; otra revisión falla |
| `STT_MODEL_MANIFEST` | Manifiesto versionado `backend/voice/model_sha256.json` | Requerido con modelo local; verifica inventario, tamaños y SHA-256 antes de cargar |
| `STT_MODEL_REQUIRED` | Hace fallar el arranque si el modelo no puede cargarse/verificarse | `false` por defecto; establecer `true` en el runtime STT |
| `STT_DEVICE`, `STT_COMPUTE_TYPE`, `STT_LANGUAGE` | Parámetros de inferencia | Solo `cpu`, `int8`, `es` |
| `STT_CPU_THREADS`, `STT_MAX_CONCURRENT` | Hilos CPU y concurrencia por proceso | Por defecto 2 hilos y exactamente 1 inferencia |
| `GUNICORN_WORKERS`, `GUNICORN_THREADS` | Procesos e hilos HTTP | Con STT requerido en 1 GiB, exactamente 1 worker y 4 hilos; cuando STT no es requerido se conservan 2 workers por defecto |
| `AUDIO_MAX_BYTES`, `AUDIO_MAX_SECONDS` | Límites de archivo de HU11 | Por defecto 2 MiB y 30 s |
| `VOICE_PRIMARY_ENGINE`, `VOICE_DAILY_LIMIT`, `TTS_TIMEOUT_SECONDS` | Motor TTS principal, cuota diaria y timeout de síntesis | Opcionales; settings define defaults. Cuota por usuario; caché disponible no consume una síntesis nueva |
| `EDGE_TTS_VOICE` | Voz de `edge-tts` | Opcional; voz de fallback/desarrollo según configuración |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID` | Configuración opcional de ElevenLabs | El valor del API key es secreto; no lo copies a documentación ni al repositorio |
| `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_TIMEOUT_SECONDS` | Configuración Gemini para normalización opcional de dictado y tutor conversacional | Opcionales; API key requerida para habilitar las llamadas Gemini. CR-006/007 están aprobadas para alcance según el responsable; la key es secreta y la aceptación permanece pendiente |
| `DICTATION_AI_ENABLED` | Habilita la normalización Gemini del dictado | Desactivada salvo configuración explícita |
| `TUTOR_LIVE_MODEL`, `TUTOR_TEXT_MODEL`, `TUTOR_SESSION_SECONDS`, `TUTOR_DAILY_SESSIONS`, `TUTOR_DAILY_QUESTIONS` | Modelos y límites del tutor conversacional | Funcionalidad CR-007 aprobada para alcance según responsable; configuración y límites no constituyen aprobación de despliegue |
| `PORT` | Puerto del contenedor | Requerido por el entrypoint; lo provee Railway |
| `VITE_API_PROXY_TARGET` | Destino del proxy `/api` de Vite | Opcional; por defecto `http://127.0.0.1:8000` |
| `VITE_API_BASE_URL` | Aparece en `.env.example` | No se encontró uso en `frontend/src` ni `vite.config.ts` |

Con `DJANGO_DEBUG=false` se activan cookies seguras, redirección SSL, cabecera de proxy SSL y HSTS (`settings.py`).

## Opción A: ejecución local sin Docker (SQLite)

Desde la raíz del repositorio (PowerShell). Asigna una ruta SQLite nueva; si el archivo ya existe, elige otra para no sobrescribir una base local:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
$env:DJANGO_DB_ENGINE = "sqlite"
$env:SQLITE_DB_PATH = "$env:TEMP\notara-dev.sqlite3"
if (Test-Path $env:SQLITE_DB_PATH) { throw "Elige una ruta SQLite nueva; el destino ya existe." }
python backend\manage.py migrate
python backend\manage.py runserver
```

En otra terminal:

```powershell
cd frontend
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

El servidor de desarrollo de Vite hace proxy de `/api` hacia `http://127.0.0.1:8000`. Su puerto es `PORT` o 5173 (`vite.config.ts`).

### STT local (HU11)

Las dependencias de Django están en `backend\requirements.txt`; las de `experiments\whisper_tiny\requirements.txt` son solo para el spike aislado y no forman parte del backend. Los pesos nunca se descargan durante una solicitud ni se guardan en Git. `.local-models/` está excluida de Git y del contexto Docker.

El contrato de integración para frontend está en [API_STT_HU11.md](./API_STT_HU11.md).

El backend usa el repositorio público `Systran/faster-whisper-base`, fijado al commit inmutable `ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66`. El inventario y los SHA-256 esperados están versionados en [model_sha256.json](../backend/voice/model_sha256.json). La verificación requiere exactamente `config.json`, `model.bin`, `tokenizer.json` y `vocabulary.txt`; el verificador rechaza archivos faltantes, adicionales, con tamaño distinto o con SHA-256 distinto. El manifiesto de confianza se mantiene en el repositorio, no se genera a partir de los pesos descargados.

La descarga ocurre solo al ejecutar explícitamente el aprovisionador. Requiere acceso a Hugging Face; no se ejecuta en el arranque de una solicitud HTTP. Ejecuta los comandos desde la raíz del repositorio y con las dependencias de `backend\requirements.txt` instaladas.

```powershell
$env:STT_MODEL_DIR = [System.IO.Path]::GetFullPath(".local-models\whisper-base")
Push-Location backend
python -m voice.provision_model --model-dir $env:STT_MODEL_DIR
Pop-Location
$env:DJANGO_DB_ENGINE = "sqlite"
$env:SQLITE_DB_PATH = Join-Path $env:TEMP "notara-stt-dev.sqlite3"
if (Test-Path $env:SQLITE_DB_PATH) { throw "Elige una ruta SQLite nueva; el destino ya existe." }
python backend\manage.py migrate
$env:STT_MODEL_REQUIRED = "true"
python backend\manage.py runserver --noreload
```

En Linux, desde la raíz y con el entorno virtual activo:

```sh
export STT_MODEL_DIR="$PWD/.local-models/whisper-base"
export SQLITE_DB_PATH="${TMPDIR:-/tmp}/notara-stt-dev.sqlite3"
test ! -e "$SQLITE_DB_PATH" || { echo "Choose a new SQLite path; the target already exists."; exit 1; }
(
  cd backend
  python -m voice.provision_model --model-dir "$STT_MODEL_DIR"
)
DJANGO_DB_ENGINE=sqlite python backend/manage.py migrate
export STT_MODEL_REQUIRED=true
DJANGO_DB_ENGINE=sqlite python backend/manage.py runserver --noreload
```

El aprovisionador verifica que Hugging Face resuelva el commit solicitado al mismo hash fijado, descarga los cuatro archivos a una carpeta temporal, compara tamaños y SHA-256 con el manifiesto versionado y solo entonces instala el directorio limpio. Una instalación válida existente se verifica y reutiliza; un directorio no vacío que no coincide se rechaza para evitar reemplazar datos silenciosamente. Para desarrollo en Windows, crea primero el entorno virtual con Python 3.11.9 o la versión compatible de `backend\requirements.txt`, como en la sección anterior. La revalidación local actual se hizo en Python 3.11.9; no certifica todas las versiones locales.

Al iniciar, el backend vuelve a calcular SHA-256 antes de cargar el modelo local en CPU/int8; si `STT_MODEL_REQUIRED=true`, cualquier ausencia o discrepancia detiene el arranque. No copies el directorio de pesos ni lo incluyas en Git: comparte únicamente código, configuración y manifiesto. En Railway aún se necesita una estrategia de almacenamiento/provisión compatible con el filesystem del contenedor, además de pruebas de memoria, latencia, calidad y concurrencia; nada de esto se ha validado en Railway.

## Opción B: Docker Compose

```powershell
docker compose up
```

Levanta `postgres:16-alpine`, el backend (`python:3.12-slim`, `runserver`) y el frontend (`node:20-alpine`, `npm install`). Esta configuración usa Node 20 y npm, distinto del Node 24 y pnpm 12.11.2 declarados por el manifiesto principal/CI (`P09-DISC-005`). No se ejecutó Compose en esta revalidación.

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

## Evidencia histórica de despliegue (no verificada en esta ejecución)

- **Evidencia histórica:** `GET /api/health/` y `/api/v1/health/` respondieron 200 con `{"status": "ok", "service": "notara-backend"}` el 2026-10-14; metadatos de CI registraron jobs de despliegue exitosos en las ejecuciones #7 y #16. No se comprobó disponibilidad, commit desplegado ni configuración actual durante esta ejecución.
- **Imagen:** el `Dockerfile` raíz construye la SPA con Node 24 y pnpm, y la sirve con Nginx junto a Gunicorn/Django (`python:3.12-slim`).
- **Arranque:** `deploy/entrypoint.sh` exige `PORT`, `DJANGO_SECRET_KEY` y las variables `POSTGRES_*`, fuerza `DEBUG=false`, ejecuta `check --deploy` y `migrate`, e inicia Gunicorn (127.0.0.1:8000) y Nginx.
- **Nginx** (`docker/nginx.conf.template`): `/api/` hacia Gunicorn, `/static/` desde `staticfiles`, `/` como fallback SPA, `client_max_body_size` 6m. No sirve `/media/`.
- **CI/CD:** `.github/workflows/ci.yml` con los jobs `backend`, `frontend`, `e2e` y `deploy-railway`. El despliegue solo corre en `push` cuando `vars.RAILWAY_DEPLOY_ENABLED == 'true'` y la rama coincide con `vars.RAILWAY_PRODUCTION_BRANCH`, con el environment `production` y el secreto `RAILWAY_TOKEN`.
- **Sin verificar:** persistencia del volumen `/data`, copias de seguridad, rollback, protección del environment y redirección HTTP→HTTPS.

El procedimiento documentado en P08 está en `ai-pipeline/outputs/08_cicd/DEPLOYMENT_GUIDE.md`. Esta referencia describe evidencia e instrucciones históricas; no es autorización para desplegar ni afirma disponibilidad actual.

### Imagen Railway con HU11

El Dockerfile aprovisiona `Systran/faster-whisper-base` durante el build, en `/opt/notara/models/whisper-base`. El build exige que Hugging Face responda al commit fijado y que los cuatro archivos coincidan con `backend/voice/model_sha256.json`; una discrepancia o descarga fallida aborta la construcción. El modelo queda propiedad de `app`, legible pero sin permiso de escritura. Django usa esa ruta y vuelve a verificar revisión y hashes al iniciar cada proceso. Las peticiones HTTP no descargan pesos. El modelo añade aproximadamente 145 MB para `model.bin` (145,217,532 bytes); los demás archivos del modelo incrementan el tamaño total de la imagen.

Con `STT_MODEL_REQUIRED=true`, Gunicorn debe usar un solo proceso: `VoiceConfig.ready()` carga una copia del modelo en cada worker y la exclusión mutua STT es local al proceso. El entrypoint rechaza más de un worker. `gthread` permite cuatro hilos HTTP y el permiso STT admite una sola inferencia; peticiones STT simultáneas adicionales reciben `STT_UNAVAILABLE`. Esta configuración evita copias redundantes del modelo y mantiene otras solicitudes HTTP atendibles durante una inferencia. Mantén una sola réplica Railway para ajustarte a una instancia de 1 GiB; escalar réplicas duplica el consumo y permite una inferencia simultánea por réplica.

El entrypoint espera hasta 90 segundos a que Gunicorn responda en `/api/v1/health/` antes de iniciar Nginx. Así no se enruta tráfico mientras Django valida y carga el modelo. Si Gunicorn falla al arrancar o termina inesperadamente, el contenedor termina. Las migraciones PostgreSQL siguen ejecutándose antes de iniciar Gunicorn; el volumen `/data/media` y Nginx conservan sus rutas actuales.

#### Variables de servicio

Conserva las variables existentes `PORT`, `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_CSRF_TRUSTED_ORIGINS` y `POSTGRES_*` sin cambiar sus secretos ni valores de conexión. Establece o verifica en el servicio Railway:

| Variable | Valor |
|---|---|
| `DJANGO_DEBUG` | `false` |
| `STT_MODEL_REQUIRED` | `true` |
| `STT_MODEL_DIR` | `/opt/notara/models/whisper-base` |
| `STT_MODEL_REVISION` | `ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66` |
| `STT_MODEL_MANIFEST` | `/app/backend/voice/model_sha256.json` |
| `STT_MODEL_ID`, `STT_MODEL_SIZE` | `Systran/faster-whisper-base`, `base` |
| `STT_DEVICE`, `STT_COMPUTE_TYPE`, `STT_LANGUAGE` | `cpu`, `int8`, `es` |
| `STT_CPU_THREADS`, `STT_MAX_CONCURRENT` | `2`, `1` |
| `STT_DAILY_LIMIT`, `AUDIO_MAX_BYTES`, `AUDIO_MAX_SECONDS` | `30`, `2097152`, `30` |

Estos valores ya están establecidos como defaults de imagen; indicarlos en Railway hace explícita la configuración operativa. No montes el volumen de medios sobre `/opt/notara` ni sobre la ruta del modelo; el único volumen existente debe continuar en `/data/media`.

**CR-004 - Estado de despliegue (2026-11-09):**
Whisper Base está autorizado por el solicitante para
implementación local, pero no para despliegue en producción.
Las variables existentes en Railway pueden sobrescribir
los defaults del Dockerfile; antes de cualquier despliegue
autorizado se deben revisar `STT_MODEL_ID`, `STT_MODEL_SIZE`,
`STT_MODEL_DIR` y `STT_MODEL_REVISION` para evitar que
apunten al modelo Tiny. La rama `mvp-2` contiene Whisper Base; esto no implica
que el modelo activo siga siendo Tiny.

#### Pasos manuales de despliegue

Los cambios de esta guía y la imagen se encuentran en la rama de trabajo y no se han enviado a Railway. Antes de iniciar el rollout, el responsable debe aprobarlos y hacer commit/push; esta tarea no los realiza.

1. Revisa y aprueba el diff y ejecuta CI para `mvp-2`. El build de la imagen debe tener acceso de red a Hugging Face; no requiere tokens ni secretos de descarga para este repositorio público.
2. No cambies el volumen `/data/media`, las variables de PostgreSQL, secretos, dominio, frontend o configuración de Nginx. Confirma el límite de 1 GiB/2 vCPU y configura una sola réplica.
3. En Railway, abre el servicio web existente y confirma que usa el Dockerfile raíz, el contexto del repositorio y `/` como raíz del servicio. El registro previo indica despliegue mediante Railway CLI desde el repositorio local. Antes de desplegar, confirma que estás en la rama `mvp-2` y que los cambios están aprobados.
4. Verifica las variables anteriores (Railway puede sobrescribir los defaults de la imagen), guarda los cambios y lanza manualmente un nuevo deployment. No se debe promover el servicio hasta que el build registre `Provisioned and SHA-256 verified Systran/faster-whisper-base@ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66`.
5. Espera al health check y comprueba `/api/v1/health/`, los logs de Gunicorn y migraciones, y los flujos existentes de autenticación, cuentas, partituras y frontend. Realiza las pruebas funcionales de STT con el procedimiento y corpus aprobados; no uses la respuesta de health como evidencia de calidad o capacidad.
6. Observa memoria máxima del servicio, arranque frío, latencia con modelo cargado y saturación de concurrencia antes de aceptar HU11. Si el arranque excede el timeout del health check, el modelo no pasa hash, o se supera la cuota de memoria aprobada, revierte al deployment anterior y no amplíes réplicas.

**Límites de la evidencia:** no se dispone de Docker en el entorno de desarrollo y no se ejecutó el build ni Railway. La observación previa de unos 249 MB RSS fue una muestra local de otro entorno; no demuestra el límite aprobado de 800 MiB de servicio en Railway. El aprovisionamiento durante build, la compatibilidad Linux/Python 3.12 y las mediciones de memoria/latencia aún deben confirmarse en CI y en un rollout controlado. HU11 no queda aceptada por estos cambios.
