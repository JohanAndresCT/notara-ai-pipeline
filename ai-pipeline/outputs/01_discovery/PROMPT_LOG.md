## 01. Discovery:

Actúa siguiendo las reglas de:
#ai-pipeline/prompts/system/SYSTEM_PROMPT.md

Ejecuta la etapa P01 usando:
#ai-pipeline/prompts/01_discovery/P01_product_discovery.md

Usa como entradas:
#ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md
#ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md

Consulta también, únicamente si está aprobado como fuente del proyecto:
#ai-pipeline/prompts/system/RELEASE_PLAN.md

Genera el contenido completo de:
#ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md

Conserva la trazabilidad con P00 y distingue claramente:
FACT,
ASSUMPTION,
PROPOSAL,
UNKNOWN y
CONFLICT
cuando corresponda.

No inventes usuarios, necesidades, métricas, funcionalidades, tecnologías,
arquitectura, APIs, integraciones ni decisiones de negocio.

Respeta el alcance confirmado de Notara:

* MVP textual con formatos `.abc` y texto plano.
* Contenido no vacío de máximo 1.000 caracteres.
* Validación básica de sintaxis para `.abc`.
* Texto plano con formato libre.
* Visualización legible conservando saltos de línea y distinguiendo el formato.
* Título, instrumento, contenido y descripción obligatorios.
* Perfil con nombre de usuario, nombre, descripción, instrumento y cambio de contraseña.
* Sin imágenes, audio, entrada por voz ni OMR en MVP 1.

Clasifica las capacidades como:

MVP CORE,
MVP SUPPORTING,
FUTURE,
OUT OF SCOPE o
UNDEFINED / REQUIRES DECISION.

Mantén visibles las preguntas abiertas y los riesgos que deban pasar a P02.

## 01. Discovery: Validation

Usa el archivo:
#ai-pipeline/prompts/01_discovery/P01_validation.md

Aplica también las reglas de:
#ai-pipeline/prompts/system/SYSTEM_PROMPT.md

Valida:
#ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md

Contra:
#ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md
#ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md

Consulta:
#ai-pipeline/prompts/system/RELEASE_PLAN.md

Usa el RELEASE_PLAN únicamente para la trazabilidad HU01–HU10
si está aprobado como fuente del proyecto. Si existe un conflicto,
repórtalo y no lo resuelvas silenciosamente.

Genera el contenido completo de:
#ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md

Verifica:

* La estructura completa de PRODUCT_VISION.md.
* La trazabilidad con P00.
* La trazabilidad con HU01–HU10 cuando esté autorizada.
* La definición del problema y los usuarios.
* Las necesidades y Jobs To Be Done.
* La propuesta de valor.
* La experiencia principal del producto.
* La clasificación del MVP.
* El soporte de `.abc` y texto plano.
* El límite de 1.000 caracteres.
* La validación básica de `.abc`.
* El texto plano con formato libre.
* Los campos obligatorios de publicación.
* La exclusión de imágenes, audio, voz y OMR del MVP 1.
* Las preguntas abiertas, riesgos e indicadores de éxito.
* La preparación para P02 — Requirements.

No modifiques:

* `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md`
* `ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md`
* `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`
* `ai-pipeline/prompts/system/RELEASE_PLAN.md`

El resultado de validación debe ser exactamente uno de:

PASS,
PASS_WITH_WARNINGS,
FAIL o
BLOCKED.

## Estado de ejecución

### P01 — Product Vision

Resultado:
GENERADO

Artefacto:
#ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md

### P01 — Product Vision Validation

Resultado:
PASS_WITH_WARNINGS

Artefacto generado:
#ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md

La validación de Product Vision solo debe ejecutarse después de generar
`ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`.

Artefacto generado:
#ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md

P02 readiness:
READY_WITH_ASSUMPTIONS

---

# MVP 2 — Sprint 2 (Audio, Speech & TTS/STT)

## 01. Discovery (MVP 2): adaptación de prompts

- `prompts/01_discovery/P01_product_discovery.md` → v2.0: modo incremental; voz y audio (HU11–HU18) dentro del alcance por CR-001; las prohibiciones de audio/voz quedan solo para el MVP 1; OMR e imágenes siguen excluidos; agrega el Anexo A con el CR-001 completo (advertencia P00 VAL-211).
- `prompts/01_discovery/P01_validation.md` → v2.0 (re-codificado a UTF-8): valida cobertura HU11–HU18, preservación de IDs del MVP 1, PDEC como PROPOSAL, fidelidad al backlog y el anexo CR-001.

## 01. Discovery (MVP 2)

Ejecuta P01 v2.0 con:
#ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md (v2.1)
#ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md (PASS_WITH_WARNINGS)
#ai-pipeline/outputs/00_context/SPRINT_2_BACKLOG_INPUT.md
#ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md (v1.0, MVP 1)

Resultado: PRODUCT_VISION.md v2.0 — READY_WITH_ASSUMPTIONS.

## 01. Discovery (MVP 2): Validation

Ejecuta P01_validation.md v2.0 sobre PRODUCT_VISION.md v2.0.

## MVP 2 V2.0 Result: PASS_WITH_WARNINGS (0 HIGH, 0 MEDIUM, 4 LOW)

- DISC-VAL-201: reetiquetar como ASSUMPTION que el ABC dictado debe cumplir las reglas del MVP 1.
- DISC-VAL-202: RELEASE_PLAN.md sin HU11–HU18; dar el backlog como entrada a P02/P03.
- DISC-VAL-203: dos numeraciones de SUCCESS (P00 vs. P01); usar IND-2NN en P02.
- DISC-VAL-204: convención FACT/ASSUMPTION en los JTBD.

P02 readiness: READY_WITH_ASSUMPTIONS.
Decisiones del equipo antes de cerrar P02: PDEC-204 (MP3), PDEC-206 (solfeo), Q-016, Q-017, Q-018, Q-008, Q-013.

## 01. Discovery (MVP 2): v2.1 con decisiones y HU19

PRODUCT_VISION.md v2.1: aplica DEC-201..DEC-218, agrega HU19 (NEED-013, JTBD-011, recorrido A', IND-209)
y el Anexo B con CR-002; corrige DISC-VAL-201 y DISC-VAL-204.

## MVP 2 V2.1 Result (run 2): PASS_WITH_WARNINGS (0 HIGH, 0 MEDIUM, 2 LOW)

- DISC-VAL-202: RELEASE_PLAN.md sin HU11–HU19; P02/P03 deben leer el backlog y DECISIONS_MVP2.md.
- DISC-VAL-203: dos numeraciones SUCCESS; P02 usa IND-2NN.

P02 readiness: READY_WITH_ASSUMPTIONS.

## 01. Discovery (MVP 2): v2.2 — corrección de redacción

Tras P02 (REQ-VAL-202, REQ-VAL-203): USER-002, NEED-010 y JTBD-008 dicen clef; Q-002 y Q-006 como resueltas en el MVP 1; entrada P00 v2.3. Sin cambio de alcance.

## MVP 2 V2.2 Result (run 3): PASS_WITH_WARNINGS (2 LOW sin cambios)

## P01 — Reconciliación de cambios pendientes (2026-11-11)

- Actualizada `PRODUCT_VISION.md` a v2.3 y añadida la validación run 4.
- La visión aprobada mantiene HU01–HU19 y todos los identificadores existentes.
- CR-005/HU20, CR-006 como enmienda de US-011, y CR-007/HU21 se conservan como cambios pendientes; no se agregaron necesidades, indicadores ni criterios activos.
- P02 readiness: `READY_WITH_ASSUMPTIONS` sólo para el backlog vigente; la ratificación sigue pendiente.
