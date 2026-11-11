## 02. Requirements:

### P02 - Requirements Engineering

Actúa siguiendo las reglas de:
`ai-pipeline/prompts/system/SYSTEM_PROMPT.md`

Ejecuta la generación de requisitos usando:
`ai-pipeline/prompts/02_requirements/P02_requirements.md`

Usa como entradas:

- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`
- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md`
- `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`

Genera:

- `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md`
- `ai-pipeline/outputs/02_requirements/product_backlog.json`

La especificación se adaptó al dominio de Notara y conserva:

- Partituras `.abc` y texto plano.
- Contenido no vacío de máximo 1.000 caracteres.
- Validación básica de sintaxis `.abc`.
- Título, instrumento, descripción y contenido textual.
- Visualización legible, saltos de línea y distinción de formato.
- Registro, autenticación, perfil, publicaciones propias, dashboard, feed,
  filtro por instrumento, comentarios y reacciones.
- Exclusión de audio, imágenes, voz, OMR y roles diferenciados del MVP 1.
- Trazabilidad P01 y `HU01`-`HU10` cuando la fuente esté autorizada.
- Separación entre requisitos, arquitectura y planificación P03.

### P02 - Requirements Validation

Usa el archivo:
`ai-pipeline/prompts/02_requirements/P02_validation.md`

Aplica también:
`ai-pipeline/prompts/system/SYSTEM_PROMPT.md`

Valida:

- `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md`
- `ai-pipeline/outputs/02_requirements/product_backlog.json`

Contra:

- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`
- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md`

Genera:
`ai-pipeline/outputs/02_requirements/REQUIREMENTS_VALIDATION.md`

La validación debe revisar estructura, reglas de contenido Notara, cobertura
`HU01`-`HU10`, trazabilidad, criterios de aceptación, alcance MVP,
supuestos, preguntas abiertas, consistencia Markdown/JSON, ausencia de
decisiones técnicas prematuras y ausencia de decisiones de planificación.

El resultado de validación debe ser exactamente uno de:

```text
PASS
PASS_WITH_WARNINGS
FAIL
BLOCKED
```

No modificar durante la validación:

- `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md`
- `ai-pipeline/outputs/02_requirements/product_backlog.json`
- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`
- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md`

## Estado de ejecución

### P02 - Requirements Prompt

Resultado: GENERADO

Prompt:
`ai-pipeline/prompts/02_requirements/P02_requirements.md`

### P02 - Requirements Validation Prompt

Resultado: GENERADO

Prompt:
`ai-pipeline/prompts/02_requirements/P02_validation.md`

## Resultado de ejecución

Estado actual: `VALIDADO`

### Control de versiones de requisitos

#### Versión 1.0.0

En la versión `1.0.0` las preguntas `Q-001` a `Q-006` permanecían abiertas.
Por ese motivo, los requisitos se clasificaban como
`READY_WITH_ASSUMPTIONS` y el documento no podía considerarse completamente
cerrado para la planificación.

Las preguntas pendientes eran:

- `Q-001`: subconjunto exacto de sintaxis ABC.
- `Q-002`: navegadores y tamaños de viewport.
- `Q-003`: orden y paginación del feed.
- `Q-004`: edición y eliminación de comentarios.
- `Q-005`: recuperación de cuenta.
- `Q-006`: criterios de éxito medibles del MVP.

#### Versión 2.0.0

En la versión `2.0.0` el equipo estableció una respuesta para cada pregunta.
Estas respuestas se incorporaron a `REQUIREMENTS.md`, al backlog JSON y a los
criterios de aceptación afectados. Como consecuencia, el estado de requisitos
pasó a `READY`.

La versión `2.0.0` no agrega funcionalidades fuera del alcance: formaliza
decisiones del MVP y mantiene separadas las decisiones de producto de las
decisiones técnicas y de planificación.

Artefactos generados:

- `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md`
- `ai-pipeline/outputs/02_requirements/product_backlog.json`

Estado de requisitos: `READY`

Versión actual de requisitos: `2.0.0`

La generación conserva la trazabilidad con P01 y `HU01`-`HU10`, las reglas de
partituras `.abc` y texto plano, el límite de 1.000 caracteres, la validación
básica ABC, la propiedad de publicaciones y las exclusiones del MVP 1.

Las decisiones abiertas Q-001 a Q-006 fueron aprobadas para el MVP:

- ABC mínimo con campos `X:`, `T:`, `M:`, `L:`, `K:` y una línea musical
  válida; las funciones avanzadas quedan fuera del MVP 1.
- Chrome, Edge y Firefox actuales en anchos de 360 px, 768 px y 1280 px;
  Safari queda fuera de la validación inicial.
- Feed descendente por fecha, con 10 publicaciones por página y sin otros
  ordenamientos.
- Los comentarios no se pueden editar ni eliminar en MVP 1.
- La recuperación de cuenta queda fuera del MVP 1; sí se permite cambiar la
  contraseña con sesión iniciada.
- El éxito del MVP se demuestra cubriendo HU01-HU10, los criterios principales
  y el flujo de registro, publicación, descubrimiento, comentarios y
  reacciones sin funciones fuera de alcance.

Verificaciones realizadas:

- `product_backlog.json` es JSON válido.
- El backlog contiene 4 épicas y 10 historias de usuario.
- Cada historia tiene requisitos y criterios de aceptación.
- Los campos de planificación de P03 permanecen sin asignar.
- `REQUIREMENTS.md` y el backlog usan los mismos identificadores principales.
- Las seis preguntas abiertas quedaron registradas como `Resolved`.

Artefacto de validación generado:

- `ai-pipeline/outputs/02_requirements/REQUIREMENTS_VALIDATION.md`

Resultado final de validación: `PASS`

Las advertencias anteriores quedaron resueltas:

- La metadata de `REQUIREMENTS.md` y `product_backlog.json` está alineada en
  versión `2.0`.
- `PRODUCT_VISION_VALIDATION.md` fue reconciliado en su revisión `1.1` y
  registra Q-001 a Q-006 como resueltas mediante las decisiones aprobadas en
  P02.

No quedan correcciones pendientes para avanzar a P03.

---

# MVP 2 — Sprint 2 (Audio, Speech & TTS/STT)

## 02. Requirements (MVP 2): adaptación de prompts

- `prompts/02_requirements/P02_requirements.md` → v2.0: modo incremental; HU11–HU19 en alcance (CR-001, CR-002); entradas nuevas `SPRINT_2_BACKLOG_INPUT.md` y `DECISIONS_MVP2.md` (resuelve DISC-VAL-202); MoSCoW/SP del equipo como dato de origen en `traceability.team_backlog`, campos de planificación en null.
- `prompts/02_requirements/P02_validation.md` → v2.0: valida cobertura HU11–HU19, reflejo de DEC-201..DEC-218, preservación y reemplazo de IDs del MVP 1, conflictos y límites técnico/planificación.

## 02. Requirements (MVP 2)

Ejecuta P02 v2.0 con PRODUCT_VISION.md v2.1, PROJECT_CONTEXT.md v2.2, SPRINT_2_BACKLOG_INPUT.md,
DECISIONS_MVP2.md y REQUIREMENTS.md / product_backlog.json v2.0 (MVP 1).

Resultado: REQUIREMENTS.md v3.0 y product_backlog.json v3.0 — READY_WITH_ASSUMPTIONS.
- US-011..US-019, FR-018..FR-044, NFR-004..NFR-010, AC-029..AC-069, BR-013..BR-028, EDGE-014..EDGE-030, DEP-004..DEP-010, EPIC-005..EPIC-007.
- US-010 enmendada por DEC-211 (AC-028 → AC-029, BR-011 → BR-019).
- Reglas PROPOSAL: BR-013 (vocabulario de dictado), BR-014 (dificultad estimada), BR-025 (cabeceras del ABC dictado).
- Conflictos: CONFLICT-201 (ejemplo AC-011-02 sin cabeceras), CONFLICT-202 ("clave" = clef, no key), CONFLICT-203 (no existe borrado de cuenta), CONFLICT-204 (P00 desincronizado), CONFLICT-205 (MP3, resuelto por DEC-204).

## 02. Requirements (MVP 2): Validation

## MVP 2 V3.0 Result: PASS_WITH_WARNINGS (0 HIGH, 2 MEDIUM, 4 LOW)

- REQ-VAL-201 (MEDIUM): aprobar BR-013, BR-014 y BR-025 antes de estimar US-011 y US-014.
- REQ-VAL-202 (MEDIUM): corregir "key" → "clef (clave)" en P00 y P01.
- REQ-VAL-203..206 (LOW): sincronizar P00 (Q-002/Q-006), Q-022 borrado de cuenta, códigos 402/429 en AC-059, AC-063 operativo.

P03 readiness: READY_WITH_ASSUMPTIONS.
## Post-validación

REQ-VAL-202 y REQ-VAL-203 corregidas aguas arriba (P00 v2.3, P01 v2.2). CONFLICT-202 y CONFLICT-204 en REQUIREMENTS.md marcados como corregidos/sincronizados. El informe de validación P02 se conserva tal como se emitió.

## MVP 2 — Actualización por decisiones DEC-219..DEC-229 (v3.1)

REQUIREMENTS.md y product_backlog.json → v3.1: BR-013, BR-014, BR-025 aprobadas como versión inicial; Q-021..Q-025 resueltas;
FR-045 (20 transcripciones/día), FR-046 (transcripción de voz hasta 1.000), BR-029, BR-030; AC-029, AC-049, AC-063 reformulados;
AC-070..AC-072 nuevos (72 AC). Verificación automática: sin duplicados ni referencias rotas; Markdown y JSON coinciden.
Hallazgos resueltos: REQ-VAL-201 (reglas aprobadas). El informe de validación se conserva tal como se emitió.

## Re-validación (run 2) — prompts v2.1

Prompts P02 v2.1: sin estado fijo de una ejecución (rangos DEC, versiones). Validación sobre requisitos v3.1: PASS_WITH_WARNINGS (0 HIGH, 0 MEDIUM, 2 LOW: REQ-VAL-205, REQ-VAL-206). REQ-VAL-201..204 resueltos.

## Merge `mvp-2` → `pipeline/mvp2-p00-context` (2026-11-09)

Se tomó como base la versión de `mvp-2` (CR-003, CR-004, implementación de HU11) y se reaplicó el segundo lote de decisiones renumerado como DEC-230..DEC-238. Retiradas: antigua DEC-222 (20/día; gana DEC-219 con 30/día) y antigua DEC-226 (aviso con OpenAI; obsoleto tras CR-003). Validaciones re-ejecutadas: PASS_WITH_WARNINGS.

## MVP 2 — Proposed changes recorded (2026-11-10)

- REQUIREMENTS.md v5.4: section 6.3 lists **proposed** CR-005 (US-020 instruments; DEC-242 AI instruments), CR-006 (US-011 amendment, Gemini interpretation of dictation) and CR-007 (US-021 conversational tutor, Gemini Live). Reserved IDs: AC-078..AC-096, BR-032, BR-033, FR-047..FR-050, M-18. Pending team approval before re-running P02-P05 for them.
