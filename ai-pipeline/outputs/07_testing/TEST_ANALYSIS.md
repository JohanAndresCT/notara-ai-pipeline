# Análisis de pruebas - P07

## 1. Metadatos

- Proyecto abierto: `c:\Users\aleja.DESKTOP-J7B21IN\OneDrive\Desktop\notara-ai-pipeline\notara-ai-pipeline`
- Ruta absoluta confirmada del repositorio: `c:\Users\aleja.DESKTOP-J7B21IN\OneDrive\Desktop\notara-ai-pipeline\notara-ai-pipeline`
- Rama actual confirmada: `Arch-Front-end` (leída desde `.git/HEAD` como `ref: refs/heads/Arch-Front-end`)
- Fecha del análisis: 2026-10-13
- Input prompt del sistema: `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`
- Prompt analizado: `ai-pipeline/prompts/07_testing/P07_test_analysis.md`
- Estado del análisis: `READY_WITH_WARNINGS`

## 2. Alcance implementado



- `backend/accounts/tests.py`
- `backend/scores/tests.py`

El código y las pruebas existentes cubren principalmente:

- Registro de usuarios y sesión autenticada.
- Login / logout con validación CSRF.
- Perfil de usuario, edición, foto, contraseña y estadísticas.
- Publicación, detalle, edición, eliminación, reacción, comentario y like de scores.
- Feed con filtros, paginación y autorización por propietario.

No se inspeccionaron carpetas superiores ni copias alternas; la evidencia utilizada corresponde únicamente al repositorio abierto.

## 3. Herramientas, configuración y ejecución real

### Backend

- Framework: Django 5.2.1
- API: Django REST Framework 3.15.2
- Base de datos por defecto: PostgreSQL (`notara_backend/settings.py`), con override para SQLite en pruebas locales si se configura `DJANGO_DB_ENGINE=sqlite`.
- Autenticación: sesión de Django + `SessionAuthentication` de DRF.
- Archivos relevantes:
  - `backend/requirements.txt`
  - `backend/notara_backend/settings.py`
  - `backend/manage.py`

### Frontend

- Framework: React 19 + Vite 8
- Estilo: Tailwind CSS v4
- Script principal del front: `frontend/package.json`

### Evidencia de pruebas existentes

- `backend/accounts/tests.py`: 25 pruebas definidas
- `backend/scores/tests.py`: 61 pruebas definidas
- Total verificado por inspección: 86 pruebas de Django dentro de estas dos apps.

### Restricciones de ejecución

Este análisis es de tipo read-only y no modifica código ni dependencias. No se ejecutó ni la suite Django ni migraciones ni pruebas del navegador, y no se hizo ninguna instalación de paquetes. La evaluación se apoya en la inspección de pruebas existentes y la configuración del proyecto.

## 4. Cobertura actual y limitaciones de evidencia

### Cobertura observada

#### `accounts`

La suite de `accounts` comprueba:

- Creación de usuario con hash y sesión autenticada.
- Rechazo de correos duplicados, emails inválidos, campos obligatorios y contraseñas cortas.
- Requerimiento de CSRF para registro y acceso protegido.
- Login correcto y manejo de credenciales incorrectas.
- Logout con invalidación de sesión.
- Perfil con nombre, username, instrumento principal, foto y estadísticas de likes/score count.
- Actualización y validación de photo uploads, incluyendo tipos de archivo, tamaños y limpieza de archivos antiguos.
- Validación de contraseña con protección de sesión y requisitos mínimos.

#### `scores`

La suite de `scores` comprueba:

- Publicación autenticada de scores en texto y ABC.
- Feed con filtros por instrumento, paginación y soporte de `mine=1`.
- Validación de campos obligatorios, formatos no soportados, tamaños de contenido y estructura ABC.
- Lectura, edición y eliminación de scores con control de propietario.
- Reacciones y toggle de like con conteo y persistencia.
- Comentarios con validación y permisos.
- Casos de autorización, CSRF y recursos inexistentes.

### Limitaciones reales

- No se encontró evidencia de una trazabilidad formal por IDs de requisito (`FR`, `US`, `AC`) dentro del repositorio abierto; el análisis usa la funcionalidad implementada como base de trazabilidad operativa.
- No se validó integración frontend/backend real mediante navegador.
- No se documentan pruebas de regresión cross-browser o de carga.
- La suite existente no incluye pruebas de despliegue ni CI/CD en esta etapa.

## 5. Tabla de trazabilidad

| Requisito / criterio funcional | Fuente observada | Prueba existente | Brecha / observación | Prioridad |
|---|---|---|---|---|
| Registro de cuenta | `backend/accounts/tests.py` | `RegistrationTests` | Cobertura sólida de campos, duplicado, CSRF y sesión. | Alta |
| Autenticación y cierre de sesión | `backend/accounts/tests.py` | `AuthenticationTests` | Muestra comportamiento consistente para login/logout y errores genéricos. | Alta |
| Perfil y foto | `backend/accounts/tests.py` | `ProfileManagementTests` | Cubre normas de actualización, validaciones y seguridad de fotos. | Alta |
| Publicación de score | `backend/scores/tests.py` | `ScorePublicationTests` | Cubre texto y ABC, validaciones y requisitos de autenticación. | Alta |
| Edición y detalle de score | `backend/scores/tests.py` | `ScoreEditTests` | Buen nivel de validación de permisos y validación parcial. | Alta |
| Eliminación de score | `backend/scores/tests.py` | `ScoreDeleteTests` | Cobertura de autor, CSRF y 404. | Alta |
| Reacciones | `backend/scores/tests.py` | `ScoreReactionTests` | Cobertura útil de toggle, conteo y permisos. | Alta |
| Comentarios y likes | `backend/scores/tests.py` | Clases de comentarios/likes | Hay evidencia concreta, pero la trazabilidad formal de requisitos no se documenta en el repositorio. | Media |
| Feed y paginación | `backend/scores/tests.py` | `ScorePublicationTests`, `ScoreEditTests` | Cobertura relevante y consistente con filtros por instrumento y `mine=1`. | Alta |
| Frontend integration / UX | No evidencia de pruebas E2E | No hay suite front-end real | Gaps de integración browser-level y navegación. | Media |

## 6. Riesgos clasificados

### Product / behavior risks

- El requisito formal no aparece documentado con IDs de historia/criterio en la rama actual.
- La lógica de negocio está validada en backend pero no siempre se valida con UX real en navegador.

### Test risks

- La suite no incluye pruebas end-to-end de frontend.
- Las validaciones están centradas en apps concretas, no en red full-stack.

### Requirements risks

- Hay funcionalidad implementada con cobertura real, pero no siempre hay una relación explícita a requisitos formales en el proyecto abierto.

### Environment risks

- El backend por defecto apunta a PostgreSQL; los entornos locales pueden requerir configuración específica.
- El proyecto usa `DJANGO_SECRET_KEY` y variables de entorno que deben configurarse correctamente.

## 7. Suposiciones y desconocidos

- Se asume que el repositorio abierto es la fuente de verdad para el proyecto actual.
- No se dispone de un archivo de requisitos formal con IDs `FR/US/AC` en la rama actual para mapear a cada caso de prueba.
- No se documentan errores no reproducibles ni bloqueos del entorno en esta etapa.
- No se ejecutó la suite de pruebas; el análisis se basa en la inspección de archivos y en la evidencia declarada por los tests existentes.

## 8. Estado y acción siguiente

El estado del análisis es `READY_WITH_WARNINGS` porque existe evidencia real y útil de cobertura, pero la trazabilidad formal de requisitos y la validación de integración navegador no están completamente cerradas.

Siguiente acción recomendada: generar la suite de pruebas o ampliaciones de pruebas desde los escenarios de mayor riesgo y mejor reproducibilidad, priorizando:

1. Registro / login / sesión.
2. Perfil / foto / contraseña.
3. Públicación / edición / eliminación de scores.
4. Reacciones y comentarios.
5. Seguridad y CSRF.



---

## Run 2 — MVP 2 (prompts P07 v2.0, 2026-11-11)

Modo incremental (P07_test_analysis v2.0 §0). Las secciones anteriores se conservan; esta corrida añade la matriz MVP 2 y sustituye, para MVP 2, la indicación previa de que US-020/US-021 no tenían registro P06/P07 (ahora existen `US-020_INSTRUMENTS_*` y `US-021_TUTOR_CHAT_VALIDATION.md`).

### R2.1 Alcance y estado de aprobación (según P02 v5.6 / P03 v4.6)

- MVP 1 (US-001–US-010): línea base `v1.0.0`; regresión automatizada.
- MVP 2: US-011–US-019 y, como **alcance aprobado reportado por el líder del proyecto** con registro formal pendiente (Q-030), CR-005 (US-020), CR-006 (enmienda US-011) y CR-007 (US-021). Este análisis no modifica la aprobación.
- Excluidos y no probados como entregados: voz cantada, «Voz» como instrumento, a cappella sintético, OMR, MP3 mixto voz+instrumento (DEC-204).

### R2.2 Entorno

| Elemento | Valor |
|---|---|
| Rama / base | `pipeline/mvp2-p00-context`, HEAD `658f2e8` + cambios de prueba sin commit (`backend/voice/tests.py`, `frontend/e2e/notara-e2e.spec.ts`) |
| Python | 3.13.14 (venv `.venv`), Django 5.2 |
| Node / gestor | Node 22.19.0, pnpm 12.11.2 (`frontend/`, `pnpm install --frozen-lockfile`, dependencias instaladas) |
| Bases de datos | SQLite (temporal) y PostgreSQL 16 en contenedor local `notara-p07-pg` (puerto 55432) |
| Modelo Whisper | No requerido (`STT_MODEL_REQUIRED=false`); STT/TTS/Gemini sustituidos por fakes/mocks |
| Proveedores reales | No invocados por la suite automatizada (DEC-230, NFR-010) |
| Diferencias | CI usa PostgreSQL de servicio y fakes; Railway (volumen `/data`, HTTPS, claves) no ejecutado en esta corrida |

### R2.3 Matriz de cobertura AC-029–AC-096

| AC | Historia | Pruebas existentes | Clase de evidencia | Brecha |
|---|---|---|---|---|
| AC-029 | US-010 enmienda: borrar comentario propio | `scores/tests.py::ScoreCommentTests` (204, CSRF, no autor), `ScoreCommunityApiTests.test_visitor_can_comment_and_delete_own_comment_but_not_owner_comment` | AUTOMATED_EXECUTED | — |
| AC-030–AC-036 | US-011 dictado | `DictationParserTests`, `SttEndpointTests` (contrato, auth, CSRF, 2 MB, MIME/firma, 30 s, modelo no configurado), `FasterWhisperAdapterTests`; E2E bloqueo en texto plano; navegador con voz sintética (P06) | AUTOMATED_EXECUTED; navegador SIMULATED | Micrófono real, corte a 30 s y permiso denegado NOT_RUN (checklist #1–#5) |
| AC-037–AC-042 | US-012 comentario de voz | `scores/tests_mvp2.py::VoiceCommentTests` (creación, rechazos, audio con auth, borrado y cascada); E2E propio/ajeno | AUTOMATED_EXECUTED | Grabar/escuchar/borrar con micrófono real NOT_RUN (#6, #7) |
| AC-043–AC-048 | US-013 solfeo | `AbcReaderTests.test_solfege_text_names_and_pauses`, `SynthesisEndpointTests` (MP3, caché, límite diario) | AUTOMATED_EXECUTED (FakeTts) | Escucha humana NOT_RUN (#8) |
| AC-049–AC-051 | US-014 tutor auditivo | `test_difficulty_and_tutor_text`, `test_tutor_returns_text_header`, `test_text_unsupported_and_auth_errors` | AUTOMATED_EXECUTED | Escucha NOT_RUN (#9) |
| AC-052–AC-054 | US-015 piano | `DetailPlaybackTests`, `AbcReaderTests` (eventos, alteraciones, silencios); E2E panel y texto plano (M-02) | AUTOMATED_EXECUTED | Ritmo por oído NOT_RUN (#10) |
| AC-055–AC-058 | US-016 caché de audio | `test_solfege_returns_mp3_and_is_cached`, `test_edited_content_generates_new_audio`, `test_storage_failure_still_returns_audio` | AUTOMATED_EXECUTED | Latencia de caché percibida NOT_RUN (#12) |
| AC-059–AC-063 | US-017 voz de respaldo | `test_fallback_voice_when_primary_fails`, `test_both_voices_fail_returns_503_and_releases_quota`, `test_elevenlabs_primary_serves_audio_without_fallback`, `test_primary_voice_is_not_hidden_by_fallback_cache`, `test_fallback_cache_used_when_primary_fails_without_spending_quota` | AUTOMATED_EXECUTED (mock) | ElevenLabs real con clave inválida NOT_RUN (#13) |
| AC-064–AC-065 | US-018 MP3 | Endpoint MP3 en `SynthesisEndpointTests`; E2E descarga deshabilitada antes de sintetizar | AUTOMATED_EXECUTED | Descarga y reproducción fuera de la app NOT_RUN (#11) |
| AC-066–AC-069 | US-019 carga `.abc` | E2E: botón «Cargar archivo .abc» visible en edición; validaciones de publicación MVP 1 | AUTOMATED_EXECUTED (parcial) | Selección real de archivo, confirmación de reemplazo y rechazos (AC-067/068) sin E2E — brecha menor |
| AC-070–AC-072 | US-011 metas de corpus | — | NOT_RUN | Corpus humano ≥ 9 grabaciones / 3 personas (Q-028, PRE-011) |
| AC-073–AC-075 | US-011 cuota y admisión | `SttEndpointTests` (cuota, saturación, rechazos), `QuotaConcurrencyTests` | AUTOMATED_EXECUTED | — |
| AC-076–AC-077 | US-012 cuota compartida y 1.000 caracteres | `test_long_transcript_is_kept_up_to_1000`, `test_text_comments_keep_500_limit`; cuota compartida vía `SttEndpointTests` | AUTOMATED_EXECUTED | — |
| AC-078–AC-082 | US-011 enmienda CR-006 | `DictationAiTests` (6) + `GeminiNormalizerParsingTests` (3, **nuevas**) | AUTOMATED_EXECUTED (mock); Gemini real SIMULATED (CR-006 §8) | AC-082 NOT_RUN (depende del corpus) |
| AC-083–AC-089 | US-021 tutor | `voice/tests_tutor.py` (8); E2E aviso M-18 y botones | AUTOMATED_EXECUTED (mock); Live SIMULATED | Conversación con micrófono real NOT_RUN |
| AC-090–AC-096 | US-020 instrumentos | E2E: 6 instrumentos, 4 insignias IA, selección inicial, solfeo separado | AUTOMATED_EXECUTED (UI); DDSP/MP3 SIMULATED (P06.20) | Escucha humana NOT_RUN; reduced motion sin alternar |

### R2.4 Riesgos altos MVP 2 y cobertura

| Riesgo | Cobertura en esta corrida |
|---|---|
| Cuota STT y slot de inferencia | `QuotaConcurrencyTests`, `test_saturated_process_returns_unavailable_without_quota_charge` — PASS |
| Normalizador IA (BR-032: solo texto, sin notas añadidas, 8 s, M-01) | `DictationAiTests.test_ai_cannot_add_notes`, `test_provider_failure_keeps_m01_without_server_error`; clave en cabecera, nunca en URL (`GeminiNormalizerParsingTests`) — PASS |
| Cadena TTS (ElevenLabs primario, Edge respaldo, caché prioriza primario) | `SynthesisEndpointTests` con FakeTts, incl. `language_code` por modelo — PASS |
| Almacenamiento y borrado de comentarios de voz | `VoiceCommentTests` — PASS |
| Token efímero del tutor (un uso, setup bloqueado, sin clave) y cuotas BR-033 | `tests_tutor.py` — PASS |
| Fallback DDSP y MP3 | Solo navegador; registrado como SIMULATED en P06.20 |
| Migraciones en PostgreSQL | `scores/tests_migrations.py` (7) en PostgreSQL 16 — PASS |

### R2.5 Casos manuales importados (`MVP2_MANUAL_ACCEPTANCE_CHECKLIST.md`)

| Caso | Contenido | Estado |
|---|---|---|
| MAN-MVP2-01 | Micrófono real HU11/HU12 (checklist #1–#7) | NOT_RUN |
| MAN-MVP2-02 | Escucha humana HU13/14/15/16/18 (#8–#12) | NOT_RUN |
| MAN-MVP2-03 | Corpus HU11 AC-070–AC-072 y AC-082 | NOT_RUN |
| MAN-MVP2-04 | ElevenLabs con clave real y clave inválida (#13) | USER_REPORTED parcial (CR-005); fallback con clave inválida NOT_RUN |
| MAN-MVP2-05 | Railway `/data` y migraciones (#14, #15) | NOT_RUN (sin despliegue autorizado) |
| MAN-MVP2-06 | Escucha de instrumentos IA y conversación del tutor con micrófono real | NOT_RUN |

### R2.6 Brechas seleccionadas para generación

1. Analizador de respuesta Gemini del normalizador (JSON válido, «unintelligible», respuesta malformada, clave ausente, clave en cabecera) → añadido.
2. E2E MVP 2 de interfaz sin proveedores (panel de escucha, partitura de texto, comentario de voz propio/ajeno) → añadido.
3. Brecha menor sin cubrir: carga real de archivo `.abc` (AC-067/068) en E2E — se deja para una próxima corrida.
4. Pendientes no automatizables en CI: micrófono, WebGL/DDSP, AudioWorklet y WebSocket Live → manuales.

### R2.7 Estado

`PASS_WITH_WARNINGS` — cobertura automatizada completa del contrato backend y de la UI sin proveedores; aceptación con micrófono real, escucha humana, corpus y Railway pendiente.
