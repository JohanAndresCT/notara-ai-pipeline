# P06 — Implementation Log — MVP 2

## 1. Metadata

- **Proyecto:** Notara
- **Release:** MVP 2 — Sprint 2 (Audio, Voice and TTS/STT)
- **Etapa:** P06 — Implementation Foundation
- **Versión del registro:** 1.0
- **Fecha de corte del inventario:** 2026-11-08
- **Rama observada:** `pipeline/mvp2-p06-alejandro`
- **Estado de esta fase:** `DOCUMENTATION_BASELINE_CREATED`
- **Estado de implementación de la fundación MVP 2:** `NOT_STARTED`
- **Pruebas ejecutadas en esta fase:** Ninguna
- **Cambios de código/configuración ejecutados en esta fase:** Ninguno
- **Estado Git antes de crear este registro:** árbol limpio; la rama local informa como upstream `origin/pipeline/mvp2-p00-context`.
- **Registro histórico MVP 1:** `IMPLEMENTATION_LOG.md` se conserva sin cambios.

Este archivo es el registro independiente de MVP 2. El repositorio es la fuente de verdad; este registro describe el estado observado y no afirma que las propuestas de P05 estén aprobadas o implementadas.

## 2. Alcance y reglas de estado

Esta ejecución solo documenta y establece trazabilidad. No implementa historias, no cambia código, configuración, dependencias, modelos, migraciones o CI, y no ejecuta pruebas.

P06 debe convertir la arquitectura aprobada en una fundación técnica extensible. No debe implementar historias completas del Sprint 2. Las historias US-011 a US-019 permanecen como trabajo incremental posterior, excepto por fundaciones compartidas explícitamente aprobadas.

Los estados se usan así:

| Estado | Significado |
|---|---|
| `IMPLEMENTED` | Existe en el repositorio y satisface el alcance descrito. |
| `PARTIAL` | Existe una base reutilizable, pero falta la parte MVP 2 o la conformidad completa. |
| `MISSING` | No se encontró una implementación en el repositorio actual. |
| `BLOCKED` | No se debe decidir ni implementar aún porque falta una aprobación, verificación o dato humano. |

## 3. Estado actual del repositorio

### 3.1 Base reutilizable del MVP 1

- **Django modular monolith:** `backend/notara_backend`, `accounts` y `scores`; configuración de PostgreSQL, migraciones y modo SQLite local/de pruebas. (`IMPLEMENTED`)
- **Frontend de mismo origen:** React, TypeScript y Vite; shell, páginas existentes y cliente API en `frontend/src/lib/api.ts`. (`IMPLEMENTED` para MVP 1; `PARTIAL` para necesidades compartidas de MVP 2)
- **Autenticación y seguridad existente:** sesiones Django, CSRF, cookies same-site, controles de autenticación/propiedad y rutas de API versionadas. (`IMPLEMENTED` para los flujos existentes)
- **Partituras/comunidad:** modelos Score, Comment, Reaction y Like; validación básica ABC, límite de 1.000 caracteres, comentarios de texto y borrado por autor. (`IMPLEMENTED` para MVP 1)
- **Rutas:** coexisten rutas legacy `/api/` y `/api/v1/`; la aplicación frontend consume `/api/v1/`. El modelo `Like` también coexiste con `Reaction`. (`PARTIAL` respecto a ADR-013, que propone congelar legacy y usar `Reaction` en rutas nuevas)
- **Archivos protegidos:** `default_storage` configurable, `MEDIA_ROOT` y vista autenticada para fotos de perfil. No hay almacenamiento ni entrega de audio. (`PARTIAL`)
- **Runtime/deploy:** Docker, Nginx, Gunicorn, health check, PostgreSQL y despliegue Railway están presentes. Gunicorn conserva configuración sync con dos workers; Nginx no define el timeout de lectura propuesto para audio. (`PARTIAL`)
- **Verificación existente:** Django tests, CI sobre PostgreSQL, typecheck/build del frontend y Playwright E2E existen para el alcance implementado. No existen pruebas de componentes MVP 2. (`PARTIAL`)

### 3.2 Estado MVP 2

No se encontraron módulos, rutas, modelos, dependencias ni UI específicos de audio/voz en el código actual. Esto concuerda con la declaración de P05 de que aún no hay código MVP 2. La arquitectura v2.0 y sus ADR MVP 2 son propuestas de diseño con review gates; no son evidencia de implementación.

## 4. Matriz de trazabilidad arquitectura–código–estado

| Elemento de arquitectura / trazabilidad | Código o evidencia actual | Estado | Límite / siguiente acción |
|---|---|---|---|
| ADR-001: monolito modular, sin nuevos servicios | Aplicación Django única y despliegue existente en Docker | `IMPLEMENTED` para la base | Mantener el despliegue existente; no añadir workers/servicios. |
| ADR-002: React/TypeScript + Django + PostgreSQL | `frontend/package.json`, `backend/requirements.txt`, `settings.py`, Compose y CI | `IMPLEMENTED` para MVP 1 | No cambiar tecnologías ni añadir frameworks. |
| ADR-003: mismo origen, sesión y CSRF | Middleware Django, vistas de cuentas, `frontend/src/lib/api.ts`, proxy y Nginx | `IMPLEMENTED` para rutas existentes | Reutilizar para futuras rutas protegidas. |
| ADR-004/005: texto en DB; API valida permisos y datos | `scores/models.py`, `scores/views.py` y pruebas existentes | `IMPLEMENTED` para Score/comunidad existentes | Mantener reglas MVP 1 y ownership. |
| ADR-006: proveedores detrás de adaptadores en `voice` | No existe módulo `voice`, adaptador ni selección de motor | `MISSING` | ADR pendiente de aprobación; implementar solo la frontera aprobada, no flujos de historia. |
| ADR-007/014: procesamiento síncrono acotado y runtime threaded | `deploy/entrypoint.sh` arranca Gunicorn con dos workers sync; Nginx no tiene timeout de lectura API | `MISSING` para la propuesta MVP 2 | Los valores 25/20/75/90 s son propuestas; resolver Q-012 y aprobar ADR antes de fijarlos. |
| ADR-008: almacenamiento de audio vía `default_storage` y entrega autenticada | Almacenamiento configurable y foto servida con vista autenticada; sin audio | `PARTIAL` | Reutilizar el patrón. PRE-005 debe verificar persistencia del volumen antes de audio persistente en producción. No cambiar backend de almacenamiento sin evidencia/decisión. |
| ADR-009: módulo determinista `dictation` | No existe el módulo ni endpoint STT | `MISSING` | Lógica de dictado pertenece a US-011; PRE-002 bloquea su implementación. |
| ADR-010: `abc_reader` único y eventos de playback | No existe lector ABC ni bloque `playback` en el detalle | `MISSING` | Definir su contrato con aprobación; parser y reproducción son trabajo de historias, no de esta fase documental. |
| ADR-011: voz como extensión de Comment | `Comment` actual solo tiene cuerpo de texto de hasta 500 caracteres | `PARTIAL` como base de comentarios; `MISSING` para voz | No alterar el modelo ni generar migraciones hasta US-012 y decisión Q-026. |
| ADR-012: cuota `VoiceQuota` | No existe modelo ni contador de síntesis | `MISSING` | Corresponde a US-016 y depende de la arquitectura aprobada. Q-027 (cuota de STT) sigue abierto. |
| ADR-013: nuevas rutas solo `/api/v1/`, legacy congeladas | Ambas familias `/api/` y `/api/v1/` existen; no hay rutas de audio | `PARTIAL` | La propuesta aún requiere aprobación; no borrar ni refactorizar rutas o modelos MVP 1. |
| Contrato de error compartido con código estable | Vistas existentes responden con errores de campo; no se encontró helper MVP 2 con `code`/`message` | `PARTIAL` | Preservar la forma MVP 1; acordar adición compatible antes de usarla en nuevas APIs. |
| ADR-015: selección de motores y motores de prueba | `requirements.txt` no incluye `httpx` ni `edge-tts`; CI no configura motores de voz | `MISSING` | CONFLICT-ARCH-201 requiere decisión; no instalar dependencias en esta fase. |
| `SynthesizedAudio`, hash y cache `audio_cache/` | Sin modelo, archivos ni prefijo de cache | `MISSING` | Trabajo de US-016, no necesario para el registro documental. |
| Servicio STT/TTS y endpoints autenticados | `urls.py` solo contiene endpoints actuales de cuentas, scores, salud y CSRF | `MISSING` | No crear endpoints falsos; añadirlos en los incrementos de historia correspondientes. |
| Frontend compartido para grabación y escucha | No hay `MediaRecorder`, Tone.js, reproductor de audio ni controles de voz | `MISSING` para MVP 2; `PARTIAL` para shell/API base | Mantenerlos fuera de P06 foundation si implican flujos completos de historia. |
| Privacidad y logging específico de voz | No hay procesamiento de audio ni log de fallback | `MISSING` para MVP 2 | Definir antes de integrar proveedores; nunca registrar audio, transcripciones o claves. |
| CI desacoplada de proveedores | CI actual verifica MVP 1 sin motores de voz; todavía no hay pruebas de proveedores | `PARTIAL` | Resolver el conflicto CI/development de DEC-202 y AC-063 antes de fijar la configuración futura. |
| Registro independiente P06 MVP 2 | No existía antes de esta ejecución | `IMPLEMENTED` (documentación) | Este archivo no sustituye ni modifica el registro MVP 1. |

## 5. Decisiones, conflictos y gates pendientes

### 5.1 Aprobación de arquitectura y producto

- **PRE-001 / Q-020:** ratificación de DEC-201–DEC-218 por el equipo. Las decisiones son la línea de trabajo de P02 en adelante, pero la ratificación del equipo completo sigue pendiente.
- **ARCH-VAL-201:** aprobación humana de ADR-006–ADR-015; son propuestas de la arquitectura v2.0.
- **CONFLICT-ARCH-201:** DEC-202/AC-063 describen `edge-tts` como predeterminado también en CI, mientras NFR-010 requiere pruebas automatizadas independientes de servicios pagados/externos. P05 recomienda `fake` en CI y conservar Edge para desarrollo, pero esa enmienda requiere confirmación del equipo.
- **CONFLICT-ARCH-202 / Q-026:** el comentario actual limita `body` a 500 caracteres y una transcripción de hasta 30 s puede excederlo. P05 ofrece alternativas (límite mayor para voz o rechazo claro); no se elige ninguna aquí.
- **CONFLICT-ARCH-203:** AC-012-02 menciona WAV; la propuesta es conservar el contenedor grabado y validar MIME. Confirmar antes de definir el contrato de voz.
- **CONFLICT-ARCH-204:** se considera resuelto por el diseño de playback en el detalle existente, sin llamada adicional.

### 5.2 Preconditions y preguntas

- **PRE-002 / Q-021, Q-023:** aprobación de vocabulario de dictado BR-013 y composición de ABC BR-025 antes de US-011.
- **PRE-003 / Q-024, Q-025:** aprobación de regla de dificultad BR-014 y definición del contenido del tutor (clef/tempo) antes de US-014.
- **PRE-004 / Q-011:** claves, presupuesto y límite mensual global antes de usar proveedores comerciales. No guardar secretos en el repositorio.
- **PRE-005 / Q-009 / ARCH-VAL-202 — Railway volume verification (2026-11-08):** Production deployment reached `SUCCESS`. Infrastructure provisioning: `VERIFIED` — `notara-volume` was created with 500 MB capacity. Mounting: `VERIFIED` — the volume is mounted at `/data/media`, and `df -h /data/media` confirmed a dedicated filesystem. Application write permissions: `VERIFIED` — user `app` created and removed a test file successfully (`ESCRITURA_OK`). PostgreSQL remained operational and unchanged. Cross-deployment persistence: `NOT VERIFIED`. PostgreSQL backup: none exists.
- **PRE-008 / Q-022:** aclarar la retención de audio al borrar una cuenta, pues actualmente no hay flujo de borrado de cuenta.
- **PRE-009 / Q-012 / ARCH-VAL-205:** acordar objetivos/mediciones de latencia; los timeouts de ADR-014 son propuestas no medidas.
- **ARCH-VAL-203:** la cabecera `X-Notara-Tutor-Text` es una propuesta de transporte, no una decisión ratificada.
- **ARCH-VAL-204 / Q-027:** decidir si se requiere límite de uso de transcripción.
- **UX-VAL-201:** BR-013/BR-025 bloquean las decisiones de UX asociadas al dictado.
- **UX-VAL-202:** aprobar UX-PROP-001–007; UX-PROP-006 cambia el comportamiento existente de borrado inmediato de comentarios al añadir confirmación.
- **UX-VAL-203:** definir salida de estados de procesamiento prolongado cuando Q-012 se resuelva.
- **ARCH-RISK-206:** confirmar licencia de muestras de piano antes de incorporar assets para US-015.
- **ARCH-ASSUM-201:** verificar soporte de pausas del proveedor TTS en el spike correspondiente; no afirmar ritmo si no está confirmado.

La aprobación de estas decisiones no se presume por la creación de este registro.

## 6. Plan incremental de continuación P06

| Orden | Incremento | Alcance de fundación | Gate / exclusión |
|---|---|---|---|
| 0 | Cerrar gates y confirmar rama | Ratificar decisiones, aprobar ADRs relevantes, resolver conflictos que afecten interfaces y runtime; verificar upstream de `pipeline/mvp2-p06-alejandro`. | No alterar el comportamiento existente ni sincronizar ramas sin revisión. |
| 1 | Fundaciones de configuración/runtime | Una vez aprobados ADR-007/014 y Q-012, añadir configuración validada por entorno y los parámetros runtime aprobados; documentar variables y límites. | No fijar valores que siguen como propuesta. No añadir servicios ni cambiar despliegue fuera de la arquitectura. |
| 2 | Fronteras de integración y errores | Tras aprobación de ADR-006/015, establecer contratos mínimos de adaptadores, selección/configuración y errores compatibles con el contrato actual. | No implementar fallback, cache, cuotas, STT/TTS ni endpoints de éxito ficticios como “fundación”. |
| 3 | Frontera segura de almacenamiento | Reutilizar el patrón existente de `default_storage` y entrega autenticada solo cuando el diseño esté aprobado; registrar resultado PRE-005. | No añadir modelos/migraciones de audio ni persistencia en producción antes de verificar el volumen y resolver Q-026. |
| 4 | Smoke checks de la fundación | Verificar carga de configuración, importación/bootstrap y configuración Nginx/Gunicorn aprobada; dejar suites de aceptación de historias para sus incrementos/P07. | No se ejecutan en esta fase documental. No usar credenciales reales ni servicios externos en CI. |
| 5 | Validar P06 y transferir | Comparar código real con arquitectura y mantener este log al día; emitir una validación independiente MVP 2. | Historias completas US-011–US-019 siguen fuera de la fundación P06. |

P05 indica que grupos 1a/1b y parte del grupo 2 pueden comenzar bajo sus gates. Este registro no convierte US-015, US-019, US-017, US-016 ni otras historias en trabajo de fundación; sus parsers, pantallas y flujos completos siguen siendo incrementos de historia.

## 7. Superficies de archivos candidatas

Las siguientes rutas son candidatas para fases posteriores y no fueron modificadas aquí:

- Runtime/configuración: `backend/notara_backend/settings.py`, `deploy/entrypoint.sh`, `docker/nginx.conf.template`, `.env.example`, `Dockerfile` y `docker-compose.yml`, según las ADR aprobadas.
- CI/documentación operativa: `.github/workflows/ci.yml`, `docs/SETUP.md` y, si una aprobación cambia el contrato, las fuentes upstream que correspondan.
- Integración backend: potencial estructura `backend/voice/` para contratos aprobados. Los módulos de negocio `dictation` y `abc_reader` se incorporarán en sus incrementos de historia, evitando scaffolding vacío.
- Frontend: no se requiere modificación de la fundación del shell actual para este corte. `frontend/src/lib/api.ts`, dependencias y pantallas se modificarán al implementar los contratos e historias aprobados.

No se proponen cambios a `backend/scores/models.py`, migraciones, dependencias de audio, endpoints, UI de historias, ni `IMPLEMENTATION_LOG.md` del MVP 1 durante la fundación documental.

## 8. Pruebas previstas para proteger MVP 1

No se ejecutaron pruebas en esta fase. Antes de declarar una fundación con cambios de código, el plan es ejecutar:

1. Backend: `python backend/manage.py check`, `python backend/manage.py makemigrations --check --dry-run` y `python backend/manage.py test accounts scores` con SQLite.
2. Repetir la suite backend con PostgreSQL 16 en entorno desechable/CI, para validar migraciones, constraints y transacciones sin tocar datos persistentes.
3. Frontend: `pnpm typecheck`, typecheck del spec Playwright y `pnpm build` desde `frontend/`.
4. Playwright E2E existente: registro, login/logout, rutas protegidas, publicación, feed/detalle, reacción, edición y borrado de partituras. Añadir regresiones de comentarios/perfil cuando una modificación afecte esas áreas.
5. Compatibilidad API: conservar rutas `/api/` y `/api/v1/`, autenticación/CSRF, permisos de propiedad, respuestas de errores actuales y comportamiento `Like`/`Reaction` salvo decisión aprobada en sentido contrario.
6. Si se modifican archivos runtime: build de Docker, `manage.py check --deploy`, `nginx -t`, opciones reales de Gunicorn y smoke test del health endpoint.

Las pruebas específicas de voz y audio se derivarán de requisitos y contratos aprobados en los incrementos de historia; no se conectará CI a proveedores externos ni se usarán claves reales.

## 9. Fuentes revisadas

### Pipeline P00–P05 y P06

- `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`
- `ai-pipeline/prompts/06_implementation/P06_implementation.md`
- `ai-pipeline/prompts/06_implementation/P06_code_review.md`
- `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md` y `CONTEXT_VALIDATION.md`
- `ai-pipeline/outputs/00_context/DECISIONS_MVP2.md` y `SPRINT_2_BACKLOG_INPUT.md`
- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md` y `PRODUCT_VISION_VALIDATION.md`
- `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md`, `REQUIREMENTS_VALIDATION.md` y `product_backlog.json`
- `ai-pipeline/outputs/03_planning/PRIORITIZATION.md`, `PRIORITIZATION_VALIDATION.md` y `product_backlog.json`
- `ai-pipeline/outputs/04_ux/UX_SPEC.md` y `UX_SPEC_VALIDATION.md`
- `ai-pipeline/outputs/05_architecture/ARCHITECTURE.md` v2.0 y `ARCHITECTURE_VALIDATION.md`
- Registros preexistentes de `ai-pipeline/outputs/06_implementation/`, en especial `IMPLEMENTATION_LOG.md`, `IMPLEMENTATION_FOUNDATION_VALIDATION.md` e `IMPLEMENTATION_VALIDATION.md`.

### Código/configuración contrastados

- Backend: `backend/notara_backend/settings.py`, `urls.py`, `backend/accounts/`, `backend/scores/models.py`, `views.py`, migraciones y pruebas.
- Frontend: `frontend/package.json`, `frontend/src/lib/api.ts`, páginas existentes y `frontend/e2e/notara-e2e.spec.ts`.
- Runtime/CI: `Dockerfile`, `docker-compose.yml`, `deploy/entrypoint.sh`, `docker/nginx.conf.template` y `.github/workflows/ci.yml`.

## 10. Cierre de esta fase

- Se creó este registro independiente para MVP 2.
- No se modificaron artefactos históricos del MVP 1 ni archivos de código/configuración.
- No se aprobaron ADRs, conflictos ni propuestas de producto/UX mediante este documento.
- No se ejecutaron pruebas, migraciones, commits ni push.
- La siguiente fase requiere autorización del usuario y debe respetar los gates de la sección 5.

## 11. P06 Incremental Update — DEFECT-001 (2026-11-08)

This dated update records the isolated P06 fix completed after the initial documentation baseline above. It does not change the MVP 1 implementation or implement a complete Sprint 2 user story.

| Item | Result |
|---|---|
| Defect | DEFECT-001: the ABC score-content placeholder displayed literal `&#10;` separators instead of separate example lines. |
| Fix | Replaced the literal separators with newline characters in the ABC placeholder. Plain-text mode and score publication behavior remain unchanged. |
| `frontend/src/ScoreCreatePage.tsx` | Updated the ABC placeholder to show the six-line example. |
| `frontend/e2e/notara-e2e.spec.ts` | Added a Playwright regression test asserting the exact multiline placeholder. |
| Targeted Playwright test | PASSED — `pnpm exec playwright test e2e/notara-e2e.spec.ts -g "ABC placeholder"` (1 test). |
| Frontend typecheck | PASSED — `pnpm typecheck`. |
| Frontend production build | PASSED — `pnpm build`. |
| Diff whitespace check | PASSED — `git diff --check`. |

No dependencies, database migrations, backend code, architecture decisions, Railway or production configuration were changed. PRE-005 verification remains as recorded in section 5.2; cross-deployment persistence remains `NOT VERIFIED`.

## 12. CR-003 Documentation Update — Local Whisper Tiny

- **Authorization:** CR-003 and the DEC-201 amendment are recorded as approved based on the requester's statement. No approval date, approver names or meeting record were supplied and none is inferred.
- **Document state:** P02-P05 and their current validation records were updated to use local `faster-whisper tiny` behind `SttAdapter`. The P06 record now matches that architecture. Existing MVP 1 runtime behavior and its historical validation are unchanged.
- **Spike evidence (reported, not independently reproduced):** Python 3.11.9 on Windows; `faster-whisper` 1.2.1; CPU/int8, 2 threads; 3.81 s audio; 1.06 s transcription; 9.66 s initial load including import/download; sampled process RSS about 249 MB; result «¡Dorre mi, faso la sí!». This is evidence of execution on that machine only, not musical accuracy or production capacity.
- **Implementation status:** HU11/HU12 STT adapter, Django endpoints/models, frontend, Dockerfile, model weights and Railway settings remain unimplemented. No dependencies were installed and no deploy/test run was performed for this documentation change.
- **Open gates:** BR-013/BR-025 (PRE-002), representative corpus and exact parsed-ABC target (Q-028/PRE-011), p95/resource budgets (Q-012), rate limiting (Q-027), pinned model revision/hash, and process/replica concurrency. Proposed thresholds in CR-003/P05 require human approval.
- **Railway:** no commands or deployment were run. Railway memory, latency, cold start, concurrency, audio quality and hosting-provider privacy terms remain unverified.
- **P06.1 historical validation:** `IMPLEMENTATION_FOUNDATION_VALIDATION.md` remains a record of the earlier foundation review; it was not rewritten because this change did not alter the foundation or implementation. `IMPLEMENTATION_VALIDATION.md` likewise remains the prior as-built MVP 1 validation.

## 13. HU11 implementation authorization — documentation only

- **Authorization:** The requester reports human approval of HU11's dictation rules, corpus/quality target, performance/resource limits, concurrency, daily quota and security requirements, and ratification of the applicable HU11 ADRs. No approver names, approval date or meeting record were provided; none is inferred.
- **Decision state:** PRE-002 is satisfied for HU11. PRE-011 is approved for planning; corpus, latency, memory, concurrency, pinned-model and quota acceptance evidence is still required. PRE-001 remains open for decisions outside HU11. Q-026 remains a HU12 question.
- **HU11 implementation status:** Authorized to begin locally. No HU11 endpoint, Django model, adapter, frontend, migration, dependency or runtime setting was implemented in this documentation update.
- **Approved implementation constraints:** preserve `voice`/`SttAdapter`, `POST /api/v1/audio/stt/` and its success contract; `faster-whisper tiny` CPU/int8, Spanish; 30 s/2 MB recording cap; session auth, CSRF, server-side size/MIME/signature checks; no dictation audio/temp retention or content logging; deterministic approved vocabulary and ABC header completion; 30 admitted inferences/user/UTC day by default across HU11/HU12, configurable and atomically persisted; one inference/process.
- **Quota design:** persist a unique per-user/UTC-day admitted-inference counter shared by dictation and voice comments; reserve atomically after authentication, CSRF, upload validation and process-slot admission. Requests rejected before inference do not count; admitted attempts count even if later processing fails. Over-limit requests return `STT_DAILY_LIMIT_REACHED` (429) without inference.
- **Approved acceptance targets, not results:** ≥9 authorized recordings from ≥3 speakers and ≥7 of 9 exact parsed ABC; loaded-model p95 ≤15 s for a 30 s recording, with cold start reported separately; total service peak ≤800 MiB in a 1 GiB container; one inference/process. Do not mark HU11 accepted until measured.
- **Unresolved before affected implementation:** Q-029 tracks present-but-empty/malformed ABC headers and non-ABC content in an already populated field; resolve it before implementing that append path. The candidate completion-or-typed-error-before-25-s ceiling remains pending explicit approval under Q-012; TTS latency targets remain open.
- **Deployment:** Railway deployment/evaluation is not authorized by this implementation-start approval. No deployment command was run; Python 3.12 integrated runtime and Railway capacity remain unverified.

## 14. HU11 Backend First Increment

- **Implementation state:** HU11 backend is implemented partially for local development. No frontend or voice-comment/TTS functionality was changed. The endpoint remains unavailable unless a locally staged and verified model is configured; no weights were downloaded or committed, and no real-model transcription was run.
- **New backend components:** Added `voice.SttAdapter` and the local faster-whisper implementation, deterministic Spanish dictation parser, audio container/MIME/duration validator, one-inference-per-process lock, persistent per-user/UTC-day quota model and atomic conditional increment, typed API errors, startup model verification/loading, and the `POST /api/v1/audio/stt/` route.
- **Endpoint contract:** Authenticated multipart requests use `audio` and optional `title`; success returns exactly `transcript`, `meter`, `abc_line`, and `abc_document`. The new-document result follows BR-025 defaults and does not publish or persist audio/transcript. Existing-field merging is not implemented; P02 Q-029 and the missing content input in the endpoint contract must be resolved before implementing that append path.
- **Audio/admission rules:** Files are capped at 2 MiB and 30 seconds; only the four documented audio MIME/container pairs are accepted. Authentication, CSRF, format/signature, size, duration, model availability, and per-process saturation are checked before quota admission. An admitted request counts even when inference or parsing fails; saturation and an unavailable model do not consume quota.
- **Model operation:** Backend pins `faster-whisper==1.2.1`, `av==15.1.0`, and `huggingface-hub==0.36.0` separately from the isolated spike requirements. Model initialization uses `STT_MODEL_DIR`, CPU/int8, Spanish, and configured `STT_CPU_THREADS`; no endpoint path downloads weights. `STT_MODEL_REVISION` must be a full immutable commit; the SHA-256 manifest command verifies all staged files. No commit was selected because none was approved/provided.
- **Security error vocabulary:** P05 now records `AUTHENTICATION_REQUIRED` (401) and `CSRF_FAILED` (403) as implementation proposals to satisfy AC-075's typed-error requirement. These code names need team confirmation; all existing API CSRF responses continue to delegate to Django's prior behavior.
- **Configuration/documentation:** Added environment variables for limits and model path/revision/manifest/startup requirement/CPU threads. `.local-models/` is excluded from Git and Docker build context. Setup docs distinguish backend dependencies from experiment dependencies and include Windows/Linux model-staging instructions.
- **Validation environment:** Installed backend requirements in an isolated Python 3.11.9 Windows environment. Python 3.12 is not installed here; the repository's Docker runtime remains Python 3.12. A cross-platform `pip download --only-binary` check resolved all pinned and transitive dependencies for CPython 3.12/manylinux. This validates wheel availability, not runtime execution. Local tests use SQLite because PostgreSQL is not running. The PostgreSQL-only concurrency test is included but is skipped in this SQLite environment.
- **Measured test status:** Final combined run: `python backend\\manage.py test accounts scores voice --verbosity 1` with `DJANGO_DB_ENGINE=sqlite` — 110 tests passed, 1 PostgreSQL-only concurrency test skipped, 0 failures. `manage.py check` passed; `makemigrations --check --dry-run` reported no changes; `compileall` passed; `git diff --check` passed.
- **Open acceptance/deployment gates:** No 9-recording corpus/7-of-9 quality run, p95/cold-start run, total-service ≤800 MiB measurement, one-process saturation profile, Python 3.12 integration, or Railway test has been performed. Existing Railway entrypoint defaults to two Gunicorn workers; each worker would load its own model and enforce its own process-local lock. Do not infer the approved service memory/concurrency targets from the per-process implementation. Railway provisioning, worker count, and model artifact delivery require a measured and reviewed deployment plan. HU11 is not accepted.

## 15. Whisper Tiny provisioning and frontend handoff

- **Model pin:** The backend now pins `Systran/faster-whisper-tiny` to commit `d90ca5fe260221311c53c58e660288d3deb8d356`. `backend/voice/model_sha256.json` records the four expected files, byte sizes and SHA-256 digests. The provisioner checks the resolved upstream commit, stages only those files, verifies them against the checked-in manifest, and installs them outside the repository. Startup repeats the local manifest verification before loading the model; request handling never downloads weights.
- **Local weight handling:** A local copy exists under the ignored `.local-models/` directory for provisioning verification. Model files, audio fixtures, Python environments and generated bytecode are not commit candidates.
- **Reproducible setup:** `docs/SETUP.md` now documents the fixed revision, integrity checks, Windows PowerShell and Linux commands, required Python runtime and the distinction between backend and spike dependencies. `STT_MODEL_REQUIRED=true` makes model absence or verification failure fatal at startup; use it only after provisioning the local model.
- **Frontend handoff:** `docs/API_STT_HU11.md` documents session authentication, CSRF token refresh, multipart fields, the exact success shape, typed errors, file limits, quota/concurrency behavior and the unimplemented populated-field append path. The endpoint currently creates a new ABC document only; do not merge into an existing score until Q-029 is resolved.
- **Authentication error codes:** `AUTHENTICATION_REQUIRED` (401) and `CSRF_FAILED` (403) remain implementation code names whose confirmation is still pending in P05; they are documented as such, not presented as separately approved decisions.
- **Verification results:** The provisioner successfully fetched the pinned snapshot and installed all four files after checking the upstream commit and SHA-256 manifest. `python backend\\manage.py test accounts scores voice --verbosity 1` ran on Python 3.11.9/Windows with SQLite: 111 tests ran; 110 passed and 1 PostgreSQL-only concurrency test was skipped, with 0 failures. `manage.py check`, `makemigrations --check --dry-run`, `compileall`, and `git diff --check` passed. A Linux CPython 3.12 manylinux wheel-resolution check resolved all 30 pinned/transitive distributions; no Python 3.12 runtime is installed here, so this is not runtime validation.
- **Not verified by these checks:** No inference using the real model or representative audio was run. This does not measure musical accuracy, integrated latency, memory, or Railway behavior.
- **Open gates unchanged:** No real transcription with the pinned staged model, 9-recording corpus/7-of-9 ABC quality run, integrated latency or memory measurement, Python 3.12 runtime test, PostgreSQL concurrency test, or Railway evaluation has been completed. HU11 remains implemented partially and is not accepted or ready for production deployment.

## 16. Railway image and HU11 process configuration

- **Image model provisioning:** The root Dockerfile now sets the pinned model path and revision, provisions `Systran/faster-whisper-tiny` during the image build through `voice.provision_model`, and fails the build if the upstream commit or checked-in SHA-256 manifest does not match. The model directory is owned by `app` and made read-only; Django verifies it at process startup and the request path has no download behavior.
- **Gunicorn and readiness:** When STT is required, the entrypoint rejects more than one Gunicorn worker, runs one `gthread` worker with four HTTP threads by default, waits up to 90 seconds for Django health readiness before starting Nginx, and exits if Gunicorn fails. One worker prevents duplicate model copies; the existing per-process lock permits one STT inference at a time. When STT is not required, the entrypoint retains the prior two synchronous workers by default.
- **Preserved runtime surfaces:** PostgreSQL migrations, the `/data/media` volume handling, static assets, Nginx routing, and the SPA image stage remain in place. Docker image defaults expose the approved STT model/configuration limits; Railway can override them, but the revision and model type are validated by Django.
- **Deployment guide:** `docs/SETUP.md` records Railway variables and manual rollout steps. No secrets were changed and no commit, push, or deployment was performed.
- **Validation limitation:** Docker is unavailable in this environment, so the final multi-stage Linux image build, `app` filesystem permissions inside the image, startup health loop, and runtime memory were not empirically tested here. Prior local model RSS is not evidence that the full Railway service meets the 800 MiB target. Python 3.12 Linux wheel resolution and application tests do not replace a Docker build/runtime test.
- **Rollout gates:** Run a successful image build and CI, verify one-replica/1-worker configuration and app-readable model files, then measure cold start, loaded-model p95, total service peak memory and STT saturation on Railway before accepting HU11. No Railway deployment has been run.

## 17. CR-004 - Whisper Base Implementation

**Date:** 2026-11-09

**Authorization:** The requester approved CR-004 for local
implementation. Approval from other team members has not
been established. Production deployment is not authorized.

### Model migration

- Replaced Whisper Tiny with multilingual Whisper Base as the active STT model.
- Repository: `Systran/faster-whisper-base`.
- Pinned revision: `ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66`.
- CPU inference with `int8` computation remains the selected profile.
- The SHA-256 manifest covers four model files.
- `model.bin` size: 145,217,532 bytes.
- Model provisioning verifies the pinned revision and file hashes.
- Runtime requests do not download model weights.

### Modified implementation

- `backend/voice/model_config.py`: active model selection.
- `backend/voice/model_sha256.json`: Base model integrity manifest.
- `backend/voice/provision_model.py`: model provisioning.
- `backend/notara_backend/settings.py`: STT configuration defaults.
- `.env.example`: updated environment configuration.
- `Dockerfile`: build-time Base provisioning.
- `backend/voice/dictation.py`: deterministic parser refinements.
- `backend/voice/tests.py`: regression tests.

### Local verification

- Windows development environment with Python 3.11.9.
- Django test discovery: 113 tests.
- Results: 112 passed, one PostgreSQL-only test skipped, zero failures.
- Voice test subset: 23 discovered, one skipped.
- Local sample `acc.aac` was compared with Tiny and Base.
- Tiny transcript: `?Dorre mi, faso la s?!`
- Base transcript: `Do, re, mi, fa, sol, la, si.`
- This single comparison is not representative quality acceptance.
- The pinned Base model files were verified against the SHA-256 manifest.
- Docker and PostgreSQL runtime integration were not tested locally.

### Preserved contracts

- `POST /api/v1/audio/stt/` remains the STT endpoint.
- The `SttAdapter` boundary remains unchanged.
- The deterministic ABC parser remains responsible for musical conversion.
- Session authentication, CSRF, recording limits and quota requirements remain applicable.
- Existing MVP 1 behavior and historical CR-003 records are preserved.

### Pending acceptance

- At least 9 authorized recordings from at least three speakers.
- At least 7 of 9 exact expected ABC results.
- Loaded-model p95 at most 15 seconds for 30-second recordings.
- Total service memory peak at most 800 MiB in a 1 GiB container.
- Concurrency, quota, security and frontend integration regression.
- Python 3.12/Docker image execution.
- PostgreSQL concurrency verification.
- Railway runtime, cold start, memory and latency measurements.
- Separate production deployment authorization.

**Status:** IMPLEMENTED LOCALLY; ACCEPTANCE PENDING.
