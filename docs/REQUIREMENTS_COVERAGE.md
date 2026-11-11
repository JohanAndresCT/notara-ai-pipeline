# Cobertura de requisitos

Estado de los requisitos según el código actual y la evidencia disponible. MVP 1 se conserva como baseline; el backlog canónico vigente de MVP 2 tiene 19 historias (`US-001`–`US-019`). Las fuentes actuales viven en `ai-pipeline/outputs/`, no en `ai-pipeline/artifacts/`.

Estados: `IMPLEMENTED`, `PARTIAL` (implementado con diferencias que requieren decisión), `NOT_IMPLEMENTED`, `UNKNOWN`.

## Historias MVP

| ID | Historia | Estado | Evidencia | Observaciones |
|---|---|---|---|---|
| MVP-001 | Registro (FR-001) | IMPLEMENTED | `register_view`, `RegistrationPage.tsx`, tests de `accounts`, E2E 1 | Nombre, correo y contraseña ≥8 |
| MVP-002 | Login y logout (FR-002, FR-017) | IMPLEMENTED | `login_view`, `logout_view`, `AppShell.tsx`, E2E 1 | |
| MVP-003 | Perfil y contraseña (FR-003, FR-004) | PARTIAL | `current_user_view`, `change_password_view`, `ProfilePage.tsx` | Nombre, usuario, descripción, instrumento y contraseña funcionan. La API además admite foto, aunque la interfaz no la ofrece y `OOS-003` excluye imágenes (`P09-DISC-003`) |
| MVP-004 | Publicar (FR-005..009) | IMPLEMENTED | `scores_view`, `ScoreCreatePage.tsx`, tests de `scores`, E2E 2 | ABC y texto; validación ABC y límite 1000 |
| MVP-005 | Editar (FR-010) | IMPLEMENTED | `score_detail_view` (PATCH), `ScoreEditPage.tsx`, validación US-005 | La UI actual permite editar contenido y formato; el E2E histórico cubre edición de título, y P06 reporta browser check de contenido. `P09-DISC-004` está resuelto. |
| MVP-006 | Eliminar (FR-011) | IMPLEMENTED | `score_detail_view` (DELETE), E2E 4, `BUG-P07-204-01` | Solo propietario |
| MVP-007 | Panel y filtro (FR-012, FR-013) | IMPLEMENTED | `HomePage.tsx`, parámetros `mine` e `instrument`, tests de feed | 10 por página, más reciente primero. Sin registro individual en P06 |
| MVP-008 | Feed y detalle (FR-014, NFR-001) | IMPLEMENTED | `ScoreDetailPage.tsx`, `ScoreCard` | Contenido en `<pre>`; distingue ABC y texto. Sin registro individual en P06 |
| MVP-009 | Reacciones (FR-015) | PARTIAL | `score_reaction_view`, test `test_author_can_react_to_own_score` | Se puede reaccionar a la propia partitura, mientras que FR-015 dice "otro usuario" (`P09-DISC-006`, ver KNOWN_LIMITATIONS). Conviven `Reaction` y `Like` |
| MVP-010 | Comentarios (FR-016) | PARTIAL | `score_comments_view`, `ScoreDetailPage.tsx`, `DEC-211` | El comentario de texto propio no está bloqueado. El endpoint de comentario de voz sí rechaza la partitura propia. Borrar comentario propio queda ratificado por DEC-211, que supersede el AC-028 previo. |

## Requisitos no funcionales

| ID | Estado | Evidencia |
|---|---|---|
| NFR-001 Legibilidad | IMPLEMENTED | Líneas conservadas en `<pre>` y formato visible |
| NFR-002 Responsive 360/768/1280 | UNKNOWN | P06 reporta comprobaciones manuales de US-003 a 360 y 1280 px; no hay validación automática ni registro para Edge/Firefox |
| NFR-003 Seguridad | PARTIAL | Autenticación exigida, propiedad verificada y CSRF validado por el middleware global (`P09-DISC-007` resuelto). Los endpoints comprueban longitud mínima; aunque Django tiene validadores configurados en `settings.py`, las vistas de registro/cambio de contraseña no llaman al validador completo. No se encontró límite de intentos de login. |

## Trazabilidad con pruebas

La evidencia histórica P09 de MVP 1 registraba 88 pruebas backend; la revalidación más reciente para el código actual ejecutó 165 pruebas backend y voice (164 pasaron, una PostgreSQL-only omitida). E2E histórico: 5 escenarios, no reejecutados en la validación actual. Ver [TESTING.md](./TESTING.md).

## Validación de historias de P06

Los registros actuales contienen implementación y validación individual para `US-001`–`US-019`. La existencia de esos informes no significa que se hayan ejecutado todos los criterios de aceptación ni que haya aceptación manual, de rendimiento o de despliegue. P06 clasifica la ejecución global como `PASS_WITH_WARNINGS` / `PARTIAL`: 165 pruebas backend (164 pasaron y una prueba de concurrencia PostgreSQL fue omitida), Django `check` y migraciones pasaron; el typecheck frontend quedó bloqueado y el build actual no se reejecutó. Véanse `ai-pipeline/outputs/06_implementation/IMPLEMENTATION_VALIDATION_MVP2.md` y `ai-pipeline/outputs/07_testing/TEST_VALIDATION.md`.

## Historias canónicas de MVP 2 (US-011–US-019)

| ID / HU | Capacidad | Estado en el código | Evidencia actual | Límite de verificación |
|---|---|---|---|---|
| US-011 / HU11 | Dictado de voz a ABC | Implementado con STT local y parser determinista | `backend/voice/views.py`, `dictation.py`, `frontend/src/lib/api.ts`; validación US-011 | Calidad/corpus, micrófono real, p95 y memoria pendientes; CR-006 es enmienda separada |
| US-012 / HU12 | Comentario de voz transcrito con audio | Implementado | `scores` comment endpoint, `backend/voice/transcription.py`, `VoiceCommentComposer.tsx` | Verificación de micrófono y aceptación humana no completa |
| US-013 / HU13 | Solfeo hablado | Implementado para ABC compatible | `backend/voice/speech_views.py`, síntesis TTS, `ListeningPanel.tsx` | Calidad/latencia de proveedor no medidas en esta revalidación |
| US-014 / HU14 | Resumen hablado de la partitura | Implementado para ABC compatible | `speech_views.py`, lector ABC y TTS | Calidad/latencia no medidas |
| US-015 / HU15 | Reproducción instrumental | Implementado en navegador para el subconjunto ABC soportado | `scores/abc_reader.py`, `ListeningPanel.tsx` | La aceptación auditiva manual no se repitió |
| US-016 / HU16 | Caché de síntesis | Implementado | `backend/voice/synthesis.py`, `SynthesizedAudio` | Persistencia de archivos en producción no verificada |
| US-017 / HU17 | Voz de fallback | Implementado mediante cadena TTS configurada | `backend/voice/tts.py`, `synthesis.py` | Fallo/disponibilidad del proveedor externo no se probó en esta revalidación |
| US-018 / HU18 | Descarga MP3 de solfeo | Implementado en el cliente | `frontend/src/ListeningPanel.tsx`, `frontend/src/lib/renderInstrument.ts` | No se reejecutó el flujo de navegador |
| US-019 / HU19 | Cargar archivo `.abc` | Implementado en el editor, lectura local | `frontend/src/ScoreCreatePage.tsx` y validación US-019 | El typecheck y E2E actual no se pudieron completar |

### Cambios fuera del backlog canónico

| Cambio | Estado del alcance | Evidencia |
|---|---|---|
| CR-005 / HU20 propuesta | Pendiente de aprobación del equipo; no es una historia aprobada | `DECISIONS_MVP2.md`, `CR-005_INSTRUMENTS.md`; existen opciones de instrumento en el cliente |
| CR-006 / enmienda US-011 | Implementada y aprobada por el solicitante; ratificación del equipo pendiente | Normalizador Gemini opcional en `backend/voice/normalizer.py`; activación por configuración |
| CR-007 / HU21 propuesta | Implementada y aprobada por el solicitante; ratificación del equipo pendiente | Endpoints y servicio tutor en `backend/voice/tutor.py`, `tutor_views.py`; no se agrega a US-001–US-019 |

No se infiere aprobación ni aceptación de las capacidades CR-005/006/007 por su presencia en el código. Los backlogs P02 v5.5 y P03 v4.4 conservan 19 historias canónicas y el registro de cambios pendientes separado.

## Resultados de prueba vigentes

Backend: 165 ejecutadas en SQLite aislado con Python 3.11.9 / Django 5.2.18: 164 pasaron y una prueba específica de concurrencia PostgreSQL se omitió. `manage.py check` y `makemigrations --check --dry-run` pasaron. Typecheck frontend bloqueado por dependencias locales ausentes; build y E2E actuales no ejecutados. La evidencia histórica E2E P07 es 5/5, no una reejecución actual. Más detalle en [TESTING.md](./TESTING.md).
