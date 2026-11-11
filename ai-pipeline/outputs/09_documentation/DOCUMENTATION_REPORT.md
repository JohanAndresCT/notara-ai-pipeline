# Reporte de documentación — P09

## 1. Metadatos de documentación (Document Metadata)

- Proyecto: Notara
- Etapa: P09 — Documentación
- Fecha de reconciliación: 2026-11-11
- Estado: `READY_WITH_ASSUMPTIONS`
- Evidencia: árbol de trabajo actual y registros vigentes en `ai-pipeline/outputs/`
- Ubicación vigente: `ai-pipeline/outputs/`; no se creó ni duplicó `ai-pipeline/artifacts/`
- Alcance: documentación raíz y `docs/`; sin cambios en aplicación, pruebas, dependencias, CI/CD o infraestructura.

## 2. Resumen de documentación (Documentation Summary)

La documentación ahora refleja MVP 1 y el backlog canónico P02 v5.6 de US-001–US-021. CR-005/HU20 y CR-007/HU21 son historias aprobadas para alcance según la confirmación del responsable; CR-006 añade AC-078–AC-082 a US-011. P03 v4.6 deja US-020/US-021 sin prioridad ni estimación; P06/P07 aún no acreditan su aceptación. La fecha/acta formal de aprobación queda pendiente de documentación.

La documentación distingue la evidencia local actual de pruebas y los datos históricos de CI/despliegue. En la revisión de consistencia P09 se precisaron en `docs/API.md` los campos de los comentarios y la variación de idioma/formato de errores de voz. La configuración MkDocs (`mkdocs.yml`, `requirements-docs.txt` y `.github/workflows/docs.yml`) ya existía por una solicitud anterior; se inventarió y preservó sin cambios. No se hicieron llamadas a Railway, GitHub, Hugging Face, proveedores de audio ni servicios de pago. No se instalaron dependencias ni se hicieron commits, push o despliegues.

## 3. Inventario documental (Documentation Inventory)

| Archivo | Propósito | Estado |
|---|---|---|
| `README.md` | Entrada, funcionalidades, configuración breve, estado y trazabilidad | Actualizado; 15 secciones ordenadas |
| `docs/SETUP.md` | Requisitos, variables, instalación local, STT y evidencia histórica de despliegue | Actualizado; distingue verificación actual e histórica |
| `docs/USER_GUIDE.md` | Recorridos MVP 1 y funciones MVP 2 | Actualizado |
| `docs/API.md` | API de cuentas, partituras, voz y rutas heredadas | Actualizado desde URLs/vistas; contrato GET de comentarios y formatos/idiomas de error contrastados |
| `docs/API_STT_HU11.md` | Contrato de dictado | Corregido para DEC-232 y el estado de CR-006 |
| `docs/ARCHITECTURE.md` | Arquitectura backend, frontend y voz | Actualizado; inventario P00–P10 y errores por endpoint |
| `docs/DATA_MODEL.md` | Modelos de cuentas, partituras, voz y migraciones | Actualizado |
| `docs/TESTING.md` | Resultado actual, comandos y límites | Reescrito con datos de la revalidación |
| `docs/REQUIREMENTS_COVERAGE.md` | Trazabilidad MVP 1/MVP 2, CR-005/006/007 y límites de validación | Actualizado para P02 v5.6 / US-001–US-021 |
| `docs/KNOWN_LIMITATIONS.md` | Alcance excluido, aprobación formal pendiente y brechas de aceptación | Actualizado |
| `docs/index.md` | Índice de documentación | Actualizado |
| `mkdocs.yml` | Navegación del sitio documental | Preexistente; preservado sin cambios |
| `requirements-docs.txt` | Dependencia MkDocs Material | Preexistente; preservado sin cambios |
| `.github/workflows/docs.yml` | Build de documentación y publicación en GitHub Pages | Preexistente; no ejecutado ni modificado |

## 4. Resumen de evidencia de implementación (Implementation Evidence Summary)

Se contrastaron rutas y vistas de Django, modelos y migraciones `accounts`, `scores` y `voice`, configuración y manifiestos, formularios/páginas frontend, llamadas API, grabación de audio, lectura de ABC, reproducción y configuración de despliegue. Los hallazgos de código se describen como implementación; no se usan como sustituto de pruebas o aceptación.

## 5. Cobertura de capacidades (Capability Coverage)

| Grupo | Cobertura documentada | Estado |
|---|---|---|
| MVP 1 / US-001–US-010 | Cuenta, perfil, publicación/edición/eliminación, feed, detalle, reacciones y comentarios | Conservado; diferencias de requisitos explícitas |
| US-011 / HU11 | Dictado STT local y parser determinista | Implementado; evaluación humana y mediciones pendientes |
| US-012 / HU12 | Comentario de voz transcrito con audio | Implementado; aceptación de micrófono pendiente |
| US-013–US-014 / HU13–HU14 | Solfeo y resumen hablado | Implementados para ABC compatible; calidad/latencia no medidas |
| US-015 / HU15 | Reproducción instrumental web | Implementada para el subconjunto ABC; aceptación auditiva pendiente |
| US-016–US-017 / HU16–HU17 | Caché y fallback TTS | Implementados; disponibilidad y persistencia de producción no verificadas |
| US-018 / HU18 | Descarga MP3 de solfeo | Implementada en cliente; no revalidada en navegador |
| US-019 / HU19 | Lectura local de archivo `.abc` | Implementada; E2E/typecheck actuales incompletos |
| US-020 / HU20 | Selección de instrumentos, DDSP/fallback y descarga instrumental | Código presente; aprobación de alcance reportada; sin plan/validación P06 individual |
| US-021 / HU21 | Tutor conversacional de voz/texto | Código y registro de implementación presentes; aprobación de alcance reportada; sin validación P06 individual |

Los detalles de trazabilidad y los estados de verificación se encuentran en `docs/REQUIREMENTS_COVERAGE.md`.

## 6. Registro de verificaciones (Verification Log)

| Verificación | Método | Resultado |
|---|---|---|
| Backend | `.venv` Python 3.11.9, Django 5.2.18, SQLite temporal: `manage.py test accounts scores voice --verbosity 1` | 165 ejecutadas: 164 pasaron, 1 prueba PostgreSQL-only omitida |
| Django system check | `manage.py check` | Sin problemas |
| Deriva de migraciones | `makemigrations --check --dry-run` | Sin cambios detectados |
| Typecheck frontend | `npm.cmd run typecheck`, Node 24.21.0 | Bloqueado por `@tensorflow/tfjs`, `tone` y `@breezystack/lamejs` ausentes del `node_modules` local |
| Build frontend | No se ejecutó | `NOT_RUN`; se preservó `frontend/dist/` existente |
| Playwright E2E | No se ejecutó | `NOT_RUN`; P07 histórico registra 5/5 |
| PostgreSQL local | No se ejecutó | `NOT_RUN`; SQLite no se considera equivalente |
| Despliegue/servicios remotos | No se consultaron | Sin verificación actual |
| Quick Start backend/frontend | Inspección de manifiestos, scripts, settings y rutas | `VERIFIED_BY_INSPECTION`; no se ejecutó una instalación limpia ni `runserver` para evitar cambios en dependencias/base local |
| Contrato de rutas y variables | Inspección de `urls.py`, vistas, `.env.example`, settings y configuración Vite | `VERIFIED_BY_INSPECTION`; inventario de 45 nombres en `.env.example`, sin valores |
| Contrato de comentarios y errores | Contraste de `score_comments_view`, `_comment_data`, `VOICE_COMMENT_MESSAGES` y `error_response` | `VERIFIED_BY_INSPECTION`; campos `kind`/`audio_url` y mensajes de error de voz documentados |
| Consistencia de arquitectura y alcance del pipeline | Contraste de `docs/ARCHITECTURE.md` con el sistema de errores y los prompts P00–P10 | `VERIFIED_BY_INSPECTION`; sin afirmar idioma uniforme de errores ni detener el inventario en P09 |
| Navegación MkDocs | Contraste de `mkdocs.yml` con los archivos del `nav` | `VERIFIED_BY_INSPECTION`; todos los destinos existen; `mkdocs build --strict` no ejecutado porque MkDocs no está instalado |

No se instalaron paquetes; no se modificaron lockfiles. Los comandos y restricciones están en `docs/TESTING.md`.

## 7. Discrepancias (Discrepancies)

| Elemento | Tratamiento documental |
|---|---|
| Rutas `/api/` y `/api/v1/` heredadas | Ambas se documentan; no se cambió código |
| `Reaction` y `Like` | Se documentan como modelos y conteos separados |
| Foto de perfil | Se reconoce el endpoint, la ausencia de UI y la diferencia de alcance |
| Edición | La discrepancia P09-DISC-004 se marca resuelta: la UI actual permite editar contenido y formato |
| `P09-DISC-005` — Node/npm en Compose frente a Node/pnpm en manifiesto y CI | Se documentan las versiones y la diferencia; Compose no se ejecutó |
| `P09-DISC-006` — reacción/comentario propio y comentario de voz | Se documenta que la UI permite los dos primeros y que el endpoint de voz rechaza partituras propias |
| CSRF | Se actualiza a la configuración vigente descrita por el middleware; no se modificó código |
| `P09-DISC-008` — estado P08 frente a evidencia histórica de despliegue | Se conserva como evidencia histórica; no se afirma disponibilidad actual |
| Rutas de artefactos | Se corrigen referencias al directorio vigente `ai-pipeline/outputs/` |
| `P09-DISC-010` — borrado de comentarios y AC-028 | Se registra DEC-211 como resolución previa, sin volver a decidirla |
| `P09-DISC-011` — validaciones individuales | Se registra la existencia de informes US-001–US-019 sin inferir aceptación |
| `VITE_API_BASE_URL` | Se conserva como variable sin uso frontend observado |

## 8. Limitaciones conocidas (Known Limitations)

- Typecheck frontend bloqueado; build y E2E no reejecutados.
- Una prueba de concurrencia requiere PostgreSQL y quedó omitida.
- Faltan aceptación manual y mediciones aprobadas de precisión, p95, memoria y calidad auditiva.
- El despliegue, su commit, persistencia de archivos, rollback, backups y protecciones de entorno no se verificaron en esta ejecución.
- `mkdocs build --strict` no se ejecutó: el comando no está instalado; no se instalaron dependencias.
- No existen métricas de adopción, uso ni resultados de negocio.

## 9. Brechas documentales (Documentation Gaps)

No se identificó un gap que impida describir las capacidades implementadas. La documentación no certifica el estado actual de producción ni la aceptación de todos los criterios manuales; estos límites se destacan donde corresponde. La lista detallada está en `docs/KNOWN_LIMITATIONS.md`.

## 10. Supuestos de documentación (Documentation Assumptions)

| Supuesto | Tratamiento |
|---|---|
| La documentación se refiere al árbol actual, no necesariamente al código desplegado | Se indica que el commit servido es desconocido |
| Los comandos de instalación reflejan manifiestos y scripts | Se citan como instrucciones; no se afirma que la instalación limpia se ejecutó en esta etapa |
| Variables en `docs/SETUP.md` describen nombres, no valores secretos | `.env.example` se inspeccionó solo por nombres |

## 11. Preguntas abiertas (Open Questions)

- Ratificación de equipo pendiente para CR-006 y CR-007; aprobación pendiente para CR-005.
- Evidencia empírica de HU11/HU12 y objetivos de rendimiento/capacidad aún pendiente.
- Persistencia, rollback y configuración operativa del despliegue siguen sin verificar.
- Se conservan en los artefactos las preguntas de planificación y operación que requieren decisión del equipo.

## 12. Riesgos de documentación (Documentation Risks)

| Riesgo | Mitigación aplicada |
|---|---|
| Documentación de MVP 1 presentada como alcance completo | Se añadieron US-011–US-019 y se mantuvo el historial como baseline |
| Cambios pendientes confundidos con historias aprobadas | Se separaron CR-005/006/007 y sus estados |
| Evidencia histórica presentada como estado actual | Se fechó y marcó como no revalidada |
| Pruebas parciales descritas como aceptación | Se distinguen ejecución, implementación y gates manuales |

## 13. Resumen de alcance (Scope Summary)

P09 modifica solo documentación del producto y artefactos P09. Preserva MVP 1, el backlog canónico de 19 historias MVP 2 y los cambios de MVP2 existentes. No añade funcionalidades ni requisitos, no modifica código, y no resuelve decisiones abiertas.

## 14. Resumen de trazabilidad (Traceability Summary)

La documentación enlaza a los backlogs P02/P03, contexto y decisiones MVP2, validación de implementación P06, pruebas P07 y CI/CD P08 bajo `ai-pipeline/outputs/`. `README.md` es la entrada; `docs/REQUIREMENTS_COVERAGE.md` mapea las historias a código y sus límites.

## 15. Estado de documentación (Documentation Status)

`READY_WITH_ASSUMPTIONS`. P09 está listo para su gate de validación con advertencias explícitas por la ejecución frontend parcial y la ausencia de verificación remota/operativa actual.

## Metadatos de generación (Generation Metadata)

- Prompt: `ai-pipeline/prompts/09_documentation/P09_documentation.md`
- Generación: P09 incremental, 2026-11-11
- Validador relacionado: `ai-pipeline/prompts/09_documentation/P09_validation.md`
- Estado de validación: ver `DOCUMENTATION_VALIDATION.md`


---

## Run 2 — MVP 2 (prompts P09 v2.0, 2026-11-11)

Modo incremental: se conservan las secciones anteriores; esta corrida actualiza la evidencia y corrige afirmaciones superadas.

| Archivo | Cambio |
|---|---|
| `README.md` | Estado US-020/US-021 (validación P06 existente), tabla de tecnologías con proveedores de IA y su propósito, resultados P07 Run 2, nota de CI con app `voice` |
| `docs/TESTING.md` | Nueva tabla de evidencia P07 Run 2 (SQLite, PostgreSQL, tsc, build, E2E 9/9); la evidencia previa se conserva como anterior |
| `docs/KNOWN_LIMITATIONS.md` | Cifras actualizadas; secreto versionado en `12c5e85` (rotación pendiente) |
| `docs/REQUIREMENTS_COVERAGE.md` | Validaciones P06 de US-020/US-021; resultados vigentes |
| `docs/USER_GUIDE.md` | Nombres de instrumentos tal como aparecen en la interfaz; filtro con 7 opciones |
| `.env.example` (P08) | Sin valores secretos; `ELEVENLABS_VOICE_ID` vacío |

Sin cambios: `API.md` (ya documenta `/api/v1/audio/stt/`, audio de solfeo/tutor, audio de comentarios y `tutor/session`/`tutor/ask`), `API_STT_HU11.md` (`ai_interpreted`), `ARCHITECTURE.md`, `DATA_MODEL.md`, `SETUP.md` (variables `VOICE_*`, `ELEVENLABS_*`, `GEMINI_*`, `TUTOR_*` ya inventariadas).

Elementos eliminados (voz cantada, «Voz» como instrumento, a cappella) no aparecen como funciones entregadas. CR-005/006/007 se describen con el estado de aprobación registrado en P02 v5.6 (reportado por el responsable; acta formal pendiente).

**Estado:** `PASS_WITH_WARNINGS` — documentación alineada con el código y con P07 Run 2; las limitaciones de verificación manual siguen declaradas.
