# Notara

## 1. Título y descripción breve

Comunidad web responsiva y gestor básico de partituras para estudiantes de música y músicos aficionados.

## 2. Propósito y problema

Notara ofrece un espacio sencillo para crear, publicar, encontrar y comentar partituras breves sin depender de software profesional de notación. MVP 1 admite partituras en ABC y texto libre; MVP 2 añade entrada por voz, comentarios de voz, reproducción de audio y carga de archivos `.abc`.

## 3. Funcionalidades implementadas

### Línea base MVP 1

- `MVP-001`, `MVP-002`, `MVP-004`, `MVP-006`–`MVP-008`: implementados en el código.
- `MVP-003`: parcial; la API admite foto de perfil, pero la interfaz no tiene carga de foto.
- `MVP-005`: implementado; la pantalla de edición permite cambiar título, instrumento, descripción, formato y contenido.
- `MVP-009`–`MVP-010`: parciales frente a los requisitos; ver [REQUIREMENTS_COVERAGE.md](./docs/REQUIREMENTS_COVERAGE.md).
- Las capacidades incluyen registro, autenticación, perfil y contraseña; creación/edición/eliminación de partituras; validación ABC básica y límite de 1.000 caracteres; feed, detalle, reacciones y comentarios.
- El contenido se muestra como texto; Notara no renderiza notación musical.

### Historias canónicas MVP 2 (US-011–US-019 / HU11–HU19)

| Historia | Estado en el código | Capacidad |
|---|---|---|
| US-011 / HU11 | Implementada; aceptación empírica pendiente | Dictado en español a ABC |
| US-012 / HU12 | Implementada; aceptación de micrófono pendiente | Comentarios de voz transcritos y publicados con audio |
| US-013–US-014 / HU13–HU14 | Implementadas; calidad/latencia no medidas | Solfeo y resumen hablados |
| US-015 / HU15 | Implementada para ABC compatible | Reproducción instrumental en el navegador |
| US-016–US-017 / HU16–HU17 | Implementadas; operación del proveedor no revalidada | Caché y voz de respaldo |
| US-018 / HU18 | Implementada; flujo de navegador no reejecutado | Descarga MP3 de solfeo |
| US-019 / HU19 | Implementada; E2E/typecheck actuales incompletos | Carga local de archivo `.abc` |

### Cambios implementados fuera del backlog canónico

No se promueven a historias aprobadas: CR-005 / propuesta HU20 sigue pendiente de aprobación del equipo; CR-006 / enmienda HU11 y CR-007 / propuesta HU21 están implementados con aprobación del solicitante, pero pendientes de ratificación del equipo. El código incluye normalización Gemini opcional para dictados y un tutor conversacional Gemini. Véase [DECISIONS_MVP2.md](./ai-pipeline/outputs/00_context/DECISIONS_MVP2.md) y [KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md). La existencia de código no constituye ratificación ni aceptación.

## 4. Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Django 5.2.18, Django REST Framework 3.15.2; Python 3.11.9 probado localmente |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| Base de datos | PostgreSQL 16 en configuración de Compose/CI; SQLite en la ejecución local de pruebas actual |
| Audio | faster-whisper local para STT, proveedores TTS configurables, reproducción web con Tone.js |
| Pruebas | Django test runner y Playwright |
| Empaquetado/despliegue | Docker, Nginx, Gunicorn, configuración Railway y GitHub Actions |

Usa las versiones indicadas en los manifiestos y la configuración de CI/Docker; ver [SETUP.md](./docs/SETUP.md).
`docker-compose.yml` conserva una configuración distinta de Node/npm a la del manifiesto principal y CI; véase `P09-DISC-005` en [KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md).

## 5. Prerrequisitos

- Python 3.11.9 para la configuración local validada; la imagen Docker y CI usan Python 3.12.
- Node.js 24 y Corepack con pnpm 12.11.2 para el frontend.
- PostgreSQL 16 solo si se usa PostgreSQL o Docker Compose.
- Para activar dictado y comentarios de voz: un modelo STT local verificado. Su aprovisionamiento es opcional, explícito y requiere acceso a Hugging Face; no se descarga al recibir una petición HTTP.

## 6. Inicio rápido

Desde la raíz del repositorio en PowerShell, define una ruta SQLite aislada antes de migrar; elige otra ruta si el archivo ya existe:

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

Abre la URL de Vite que aparece en la terminal. La configuración completa y el aprovisionamiento opcional de STT están en [SETUP.md](./docs/SETUP.md).

## 7. Configuración

Copia `.env.example` a `.env` solo cuando lo necesites y completa los valores locales. No subas credenciales. Las opciones principales cubren Django/base de datos, límites de audio, modelo y cuota STT, proveedores TTS y funciones Gemini opcionales. El inventario completo de variables y sus valores predeterminados están en [SETUP.md](./docs/SETUP.md).

## 8. Uso

1. Regístrate e inicia sesión.
2. Publica una partitura ABC o de texto, o carga un archivo `.abc` local en el editor.
3. Explora el feed, filtra por instrumento y abre una partitura para reaccionar o comentar.
4. En partituras ABC compatibles, usa dictado, comentarios de voz, solfeo hablado, reproducción en navegador y descarga MP3. El código también incluye el tutor conversacional CR-007, aprobado por el solicitante y pendiente de ratificación del equipo.

Las funciones de grabación requieren soporte del navegador, permiso de micrófono y un contexto seguro. La partitura debe estar dentro del subconjunto ABC admitido para reproducir audio. Consulta [USER_GUIDE.md](./docs/USER_GUIDE.md).

## 9. Estructura del proyecto

```text
backend/       API Django, cuentas, partituras y voz
frontend/      Aplicación React/Vite y pruebas Playwright
docs/          Guías de configuración, API, arquitectura, uso y alcance
deploy/        Entrypoint del contenedor
docker/        Configuración Nginx y Compose
.github/       Workflows de CI/despliegue
ai-pipeline/   Prompts y registros del pipeline
```

## 10. Pruebas

La última ejecución local del backend ejecutó 165 pruebas: 164 pasaron y una prueba de concurrencia exclusiva de PostgreSQL se omitió. Usó Python 3.11.9, Django 5.2.18 y SQLite de pruebas aislado. `check` de Django y la comprobación de migraciones también pasaron.

El typecheck del frontend está bloqueado por tres paquetes ausentes en el `node_modules` local existente; no se instalaron dependencias. E2E 5/5 es evidencia histórica de P07, no una reejecución en esta validación. No se volvió a verificar el E2E, el build actual, PostgreSQL ni el comportamiento de producción. Véase [TESTING.md](./docs/TESTING.md).

## 11. Índice de documentación

| Documento | Propósito |
|---|---|
| [SETUP.md](./docs/SETUP.md) | Configuración local, variables, provisión STT y evidencia histórica de despliegue |
| [USER_GUIDE.md](./docs/USER_GUIDE.md) | Flujos de usuario y límites funcionales |
| [API.md](./docs/API.md) | Endpoints existentes |
| [API_STT_HU11.md](./docs/API_STT_HU11.md) | Contrato del endpoint de dictado |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arquitectura implementada |
| [DATA_MODEL.md](./docs/DATA_MODEL.md) | Modelos y migraciones |
| [TESTING.md](./docs/TESTING.md) | Comandos, resultados y límites de prueba |
| [REQUIREMENTS_COVERAGE.md](./docs/REQUIREMENTS_COVERAGE.md) | Trazabilidad de MVP 1 y MVP 2 |
| [KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md) | Brechas de verificación y cambios pendientes |
| [index.md](./docs/index.md) | Índice de documentación del sitio |

## 12. Limitaciones y alcance

- MVP 2 no incluye OMR, reconocimiento de partituras desde imágenes, recuperación de cuenta ni gestión diferenciada de roles.
- La calidad del dictado, la aceptación de micrófono/navegador, la concurrencia PostgreSQL y los objetivos de memoria/latencia de producción no están todos medidos.
- El código contiene cambios CR-005/006/007 que siguen fuera del backlog canónico ratificado. Sus estados se detallan por separado; la presencia de código no equivale a aprobación ni ratificación.
- Algunas conductas del backend y frontend difieren de requisitos anteriores; ver [REQUIREMENTS_COVERAGE.md](./docs/REQUIREMENTS_COVERAGE.md).

## 13. Estado del proyecto

| Dimensión | Estado y evidencia |
|---|---|
| Implementación | MVP 1 es la línea base entregada. El repositorio contiene implementación de las historias canónicas MVP 2 US-011–US-019, pero esto no equivale a aceptación; quedan gates manuales y de rendimiento. |
| Pruebas | Backend: 164 pasaron y 1 PostgreSQL-only se omitió. Typecheck bloqueado por dependencias locales ausentes; E2E y build actuales no reejecutados. |
| CI | El workflow está en `.github/`; sus resultados documentados son históricos y no fueron consultados en esta ejecución. |
| Despliegue | Health check público observado el 2026-10-14; disponibilidad y commit actualmente desplegado no verificados. No se realizó despliegue. |

La ratificación del equipo para CR-006/007 sigue pendiente. CR-005/HU20 continúa propuesta.

## 14. Trazabilidad del pipeline

Los registros actuales del pipeline están en `ai-pipeline/outputs/` (no en `ai-pipeline/artifacts/`). Los prompts P00–P10 están en `ai-pipeline/prompts/`. El backlog canónico P02/P03 conserva US-001–US-019; CR-005/006/007 están separados como cambios pendientes. Véanse el [reporte P09](./ai-pipeline/outputs/09_documentation/DOCUMENTATION_REPORT.md) y la [evaluación P10](./ai-pipeline/outputs/10_evaluation/MVP_EVALUATION.md).

## 15. Equipo

| Integrante | Rol en P00 |
|---|---|
| Johan Andrés Ceballos Tabarez | Frontend / UX |
| Emanuel Rivas | Backend / Arquitectura |
| David Urrego | Backend |
| Alejandro Rodríguez | Base de datos |
| Alejandro Zamorano | Pruebas / DevOps |
