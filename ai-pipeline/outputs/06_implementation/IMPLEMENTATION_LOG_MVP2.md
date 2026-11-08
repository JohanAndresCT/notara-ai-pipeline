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
