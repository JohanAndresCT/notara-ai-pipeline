# Notara

## 1. Título y descripción breve

Comunidad web responsiva y gestor básico de partituras para estudiantes de música y músicos aficionados.

## 2. Propósito y problema

Notara ofrece un espacio sencillo para crear, publicar, encontrar y comentar partituras breves sin depender de software profesional de notación. MVP 1 admite partituras en ABC y texto libre; MVP 2 añade dictado por voz (con interpretación por IA), comentarios de voz, solfeo y tutor hablados, reproducción con piano, guitarra e instrumentos generados por IA, descarga MP3, carga de archivos `.abc` y un tutor conversacional por voz.

## 3. Funcionalidades implementadas

### Línea base MVP 1

- `MVP-001`, `MVP-002`, `MVP-004`, `MVP-006`–`MVP-008`: implementados en el código.
- `MVP-003`: parcial; la API admite foto de perfil, pero la interfaz no tiene carga de foto.
- `MVP-005`: implementado; la pantalla de edición permite cambiar título, instrumento, descripción, formato y contenido.
- `MVP-009`–`MVP-010`: parciales frente a los requisitos; ver [REQUIREMENTS_COVERAGE.md](./docs/REQUIREMENTS_COVERAGE.md).
- Las capacidades incluyen registro, autenticación, perfil y contraseña; creación/edición/eliminación de partituras; validación ABC básica y límite de 1.000 caracteres; feed, detalle, reacciones y comentarios.
- El contenido se muestra como texto; Notara no renderiza notación musical.

### Historias canónicas MVP 2 (US-011–US-021 / HU11–HU21)

| Historia | Estado en el código | Capacidad |
|---|---|---|
| US-011 / HU11 | Implementada; aceptación empírica pendiente | Dictado en español a ABC |
| US-012 / HU12 | Implementada; aceptación de micrófono pendiente | Comentarios de voz transcritos y publicados con audio |
| US-013–US-014 / HU13–HU14 | Implementadas; calidad/latencia no medidas | Solfeo y resumen hablados |
| US-015 / HU15 | Implementada para ABC compatible | Reproducción instrumental en el navegador |
| US-016–US-017 / HU16–HU17 | Implementadas; operación del proveedor no revalidada | Caché y voz de respaldo |
| US-018 / HU18 | Implementada; flujo de navegador no reejecutado | Descarga MP3 de solfeo |
| US-019 / HU19 | Implementada; E2E/typecheck actuales incompletos | Carga local de archivo `.abc` |
| US-020 / HU20 | Implementada; validación P06 `PASS_WITH_WARNINGS`; escucha humana pendiente; sin prioridad/estimación P03 | Piano y guitarra (Tone.js); violín, flauta, trompeta y saxofón con IA (Magenta DDSP) y respaldo Tone.js; MP3 por instrumento |
| US-021 / HU21 | Implementada; validación P06 `PASS_WITH_WARNINGS`; micrófono real pendiente; sin prioridad/estimación P03 | Tutor conversacional por voz (Gemini Live) y texto (Gemini) |

CR-006 añade AC-078–AC-082 a US-011; no reemplaza los criterios anteriores.

El responsable del proyecto informó que el equipo aprobó CR-005/006/007; esa confirmación se recibió el 2026-11-11. La fecha y acta formal de aprobación quedan pendientes de documentación. La aprobación de alcance no constituye aceptación de historias ni de pruebas. Véase [DECISIONS_MVP2.md](./ai-pipeline/outputs/00_context/DECISIONS_MVP2.md) y [KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md).

## 4. Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Django 5.2.18, Django REST Framework 3.15.2; Python 3.11.9 probado localmente |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| Base de datos | PostgreSQL 16 en configuración de Compose/CI; SQLite en la ejecución local de pruebas actual |
| Audio e IA | Whisper Base local (faster-whisper) para STT; ElevenLabs (principal) y edge-tts (respaldo) para TTS; Google Gemini (interpretación de dictado y respuestas escritas del tutor); Gemini Live (tutor por voz, tokens efímeros de un uso); Magenta DDSP con TensorFlow.js (instrumentos IA); Tone.js (síntesis en navegador) |
| Pruebas | Django test runner y Playwright |
| Empaquetado/despliegue | Docker, Nginx, Gunicorn, configuración Railway y GitHub Actions |

Usa las versiones indicadas en los manifiestos y la configuración de CI/Docker; ver [SETUP.md](./docs/SETUP.md).
`docker-compose.yml` conserva una configuración distinta de Node/npm a la del manifiesto principal y CI; véase `P09-DISC-005` en [KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md).

## 5. Prerrequisitos

- Python 3.11.9 o 3.13.14 para la configuración local validada; la imagen Docker y CI usan Python 3.12.
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
4. En partituras ABC compatibles, usa dictado, comentarios de voz, solfeo hablado, reproducción en navegador y descarga MP3. El alcance aprobado también incluye selección de instrumentos (HU20) y el tutor conversacional (HU21); su aceptación sigue pendiente.

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

Backend: 175 pruebas en SQLite (173 pasaron, 2 omitidas por ser exclusivas de PostgreSQL) y 175/175 en PostgreSQL 16, Python 3.13.14; `tsc` y `vite build` pasan; Playwright 9/9 (6 MVP 1 + 3 MVP 2). Ejecución P07 Run 2 del 2026-11-11. Las pruebas automatizadas sustituyen ElevenLabs, Gemini y Whisper por fakes; no necesitan claves. Micrófono real, escucha humana, corpus HU11 y producción siguen sin verificar. Véase [TESTING.md](./docs/TESTING.md).

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
- CR-005/006/007 están incorporados al alcance canónico P02; la aprobación fue reportada por el responsable. La fecha/acta formal sigue pendiente de documentación y el código no equivale a aceptación de historias.
- Algunas conductas del backend y frontend difieren de requisitos anteriores; ver [REQUIREMENTS_COVERAGE.md](./docs/REQUIREMENTS_COVERAGE.md).

## 13. Estado del proyecto

| Dimensión | Estado y evidencia |
|---|---|
| Release | MVP 2 — Sprint 2, del 28 de octubre al 11 de noviembre de 2026 (HU11–HU21, 44 SP). Plan en [RELEASE_PLAN.md](./ai-pipeline/prompts/system/RELEASE_PLAN.md); responsables y SP de HU20/HU21 son propuesta pendiente de confirmar. |
| Evaluación (P10) | `NEEDS_ITERATION`: 62 requisitos (19 verificados, 42 parciales, 1 sin verificar); 20 indicadores (7 cumplidos, 11 parciales, 2 sin medir). Falta la aceptación manual (micrófono real, escucha, corpus HU11) y el acta de aprobación de CR-005/006/007. |
| Seguridad | Una clave de ElevenLabs quedó en el commit `12c5e85`; se retiró de `.env.example` y **debe revocarse** en ElevenLabs. Las claves van solo en `.env` o en las variables de Railway. |
| Implementación | MVP 1 es la línea base entregada. P06 informa implementación para US-001–US-019 y código para CR-005/006/007; esto no equivale a aceptación. US-020/US-021 tienen validación P06 (`PASS_WITH_WARNINGS`); falta la medición AC-082 y la aceptación manual. |
| Pruebas | Backend: 175 pruebas en SQLite (173 pasaron, 2 omitidas por ser exclusivas de PostgreSQL) y 175/175 en PostgreSQL 16, Python 3.13.14; `tsc` y `vite build` pasan; Playwright 9/9 (6 MVP 1 + 3 MVP 2). Ejecución P07 Run 2 del 2026-11-11. |
| CI | El workflow está en `.github/`; desde P08 Run 2 el job backend ejecuta todas las apps (incluida `voice`). Resultados remotos no consultados en esta ejecución. |
| Despliegue | Health check público observado el 2026-10-14; disponibilidad y commit actualmente desplegado no verificados. No se realizó despliegue. |

La evidencia formal de aprobación de CR-005/006/007 (fecha/acta) sigue pendiente de documentación; la confirmación de alcance ya fue reportada por el responsable. P03 aún no asigna prioridad ni estimación a US-020/US-021; el plan de release propone HU20 = 5 SP y HU21 = 8 SP (Could) a la espera de confirmación del equipo.

## 14. Trazabilidad del pipeline

Los registros actuales del pipeline están en `ai-pipeline/outputs/` (no en `ai-pipeline/artifacts/`). Los prompts están en `ai-pipeline/prompts/`, adaptados al MVP 2 en modo incremental: P00–P01 v2.0, P02–P05 v2.1, P06 v2.0 (más P06.20 y P06.21), P07–P10 v2.0 y el prompt global [SYSTEM_PROMPT.md](./ai-pipeline/prompts/system/SYSTEM_PROMPT.md) v2.0. P02 incluye US-001–US-021; P03 mantiene el plan de 31 SP para US-011–US-019 y el [plan de release](./ai-pipeline/prompts/system/RELEASE_PLAN.md) añade el Sprint 2 con HU20/HU21 como propuesta.

| Etapa | Output más reciente |
|---|---|
| P00 Contexto | `outputs/00_context/PROJECT_CONTEXT.md` v2.5 |
| P01 Visión | `outputs/01_discovery/PRODUCT_VISION.md` v2.4 |
| P02 Requisitos | `outputs/02_requirements/REQUIREMENTS.md` v5.6 |
| P03 Planificación | `outputs/03_planning/PRIORITIZATION.md` v4.6 |
| P04 UX | `outputs/04_ux/UX_SPEC.md` v4.5 |
| P05 Arquitectura | `outputs/05_architecture/ARCHITECTURE.md` v4.6 |
| P06 Implementación | Registros `US-0XX_*` (US-001–US-021) e `IMPLEMENTATION_VALIDATION_MVP2.md` |
| P07 Pruebas | `outputs/07_testing/` — Run 2 (2026-11-11) |
| P08 CI/CD | `outputs/08_cicd/` — Run 2 |
| P09 Documentación | `outputs/09_documentation/` — Run 2 |
| P10 Evaluación | `outputs/10_evaluation/` — Run 2, `eval_metrics.json` v2.0 | Véanse el [reporte P09](./ai-pipeline/outputs/09_documentation/DOCUMENTATION_REPORT.md) y la [evaluación P10](./ai-pipeline/outputs/10_evaluation/MVP_EVALUATION.md).

## 15. Equipo

| Integrante | Rol en P00 |
|---|---|
| Johan Andrés Ceballos Tabarez | Frontend / UX |
| Emanuel Rivas | Backend / Arquitectura |
| David Urrego | Backend |
| Alejandro Rodríguez | Base de datos |
| Alejandro Zamorano | Pruebas / DevOps |
