## 03. Planning

### P03 - Prioritization and Delivery Planning

Actúa siguiendo las reglas de:
`ai-pipeline/prompts/system/SYSTEM_PROMPT.md`

Ejecuta la etapa P03 usando:
`ai-pipeline/prompts/03_planning/P03_planning.md`

Usa como entradas:

- `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md`
- `ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md`
- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`
- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md`
- `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md`
- `ai-pipeline/outputs/02_requirements/REQUIREMENTS_VALIDATION.md`
- `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`

Genera:

- `ai-pipeline/outputs/03_planning/PRIORITIZATION.md`

El plan debe priorizar el MVP de Notara sin agregar funcionalidades, conservar
la trazabilidad `HU01`-`HU10` y `FR-*`, respetar las decisiones Q-001 a Q-006,
explicar dependencias y riesgos, y mantener separadas las decisiones de
producto de la arquitectura y la implementación.

Los artefactos P02 de entrada están en versión `2.0` y su validación es
`PASS`. La generación del plan P03 fue ejecutada; su validación permanece
pendiente.

## Estado de ejecución

### P03 - Planning Prompt

Resultado: GENERADO

Prompt:
`ai-pipeline/prompts/03_planning/P03_planning.md`

### P03 - Prioritization Artifact

Resultado: GENERADO

Artefacto:
`ai-pipeline/outputs/03_planning/PRIORITIZATION.md`

Estado del artefacto: `READY`

El plan conserva las diez capacidades aprobadas `HU01`-`HU10`, prioriza el
flujo principal de publicación, descubrimiento e interacción, separa las
capacidades de soporte, mantiene explícitos los riesgos y no introduce
decisiones técnicas, de implementación, asignación, Story Points, sprints o
releases.

### P03 - Validation Prompt

Resultado: GENERADO

Prompt:
`ai-pipeline/prompts/03_planning/P03_validation.md`

Estado: `LISTO_PARA_EJECUCION`

El prompt de validación fue adaptado al dominio de Notara. Verifica la
priorización y secuencia de entrega contra los artefactos validados de P00,
P01 y P02, incluyendo:

- cobertura de `HU01`-`HU10`, `MVP-*`, `FR-*` y `NFR-*`;
- separación entre MVP Core, MVP Supporting, Future/Deferred y Out of Scope;
- preservación de las decisiones aprobadas Q-001 a Q-006;
- reglas de partituras `.abc` y texto plano;
- validación ABC mínima, límite de 1.000 caracteres y saltos de línea;
- feed más reciente primero y paginación de 10 publicaciones;
- navegadores y viewports aprobados;
- dependencias, riesgos, supuestos y trazabilidad;
- ausencia de decisiones de arquitectura, implementación, asignación de
  desarrolladores, Story Points, sprints o releases;
- preparación del plan para P04.

### P03 - Validation Artifact

Resultado: GENERADO
Estado: `VALIDADO`

Artefacto:
`ai-pipeline/outputs/03_planning/PRIORITIZATION_VALIDATION.md`

Resultado de validación: `PASS`

La validación confirmó que `PRIORITIZATION.md` mantiene el alcance aprobado
del MVP de Notara, cubre `HU01`-`HU10`, conserva la trazabilidad con
`FR-*`/`NFR-*`, respeta Q-001 a Q-006, documenta dependencias, riesgos y
supuestos, y no introduce decisiones técnicas o de implementación.

El plan queda listo para P04 bajo las restricciones documentadas. No se
identificaron hallazgos.

### P03 - Prioritized Product Backlog

Resultado: GENERADO

Artefacto:
`artifacts/03_planning/product_backlog.json`

El backlog P03 conserva las diez historias canónicas de P02 por sus IDs
estables y agrega prioridad, grupos/secuencia de entrega, dependencias,
trazabilidad FR/HU/MVP y referencias a criterios de aceptación. Los textos
canónicos de historias y criterios permanecen en
`artifacts/02_requirements/product_backlog.json` para evitar duplicación y
deriva. No se asignan Story Points, sprints, releases ni desarrolladores.
La planificación validada P03 (`PASS`) es la fuente de prioridad y secuencia.

**Entradas de validación disponibles:**

- `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md`
- `ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md`
- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`
- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md`
- `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md`
- `ai-pipeline/outputs/02_requirements/REQUIREMENTS_VALIDATION.md`
- `ai-pipeline/outputs/03_planning/PRIORITIZATION.md`
- `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`

---

# MVP 2 — Sprint 2 (Audio, Speech & TTS/STT)

## 03. Planning (MVP 2): adaptación de prompts

- `prompts/03_planning/P03_planning.md` → v2.0: modo incremental; SP, MoSCoW, release y sprint del backlog del equipo y de DECISIONS_MVP2.md se aceptan como fuente aprobada; estimaciones provisionales marcadas; desarrolladores sin asignar hasta Q-010; rutas `artifacts/` → `outputs/`.
- `prompts/03_planning/P03_validation.md` → v2.0: valida prioridades HU11–HU19, totales, provisionales, secuencia, riesgo de dependencias externas, línea de corte, precondiciones y JSON.

## 03. Planning (MVP 2)

Resultado: PRIORITIZATION.md v2.0 y product_backlog.json v2.0 — READY_WITH_ASSUMPTIONS.
- P0 (21 SP, comprometido): US-011 dictado (8, provisional), US-013 solfeo (5), US-015 instrumento (3), US-016 caché (3), US-017 respaldo (2).
- P1 (8 SP, objetivo): US-019 archivo .abc (2), US-012 comentarios de voz (3), US-014 tutor (3, provisional).
- P2 (2 SP, extra): US-018 MP3.
- Secuencia: 1a US-015 y 1b US-019 (sin dependencias externas) → 2a US-017 → 2b US-016 → 2c US-013; 3 US-011 en paralelo y temprano; 4 US-014, US-012; 5 US-018.
- Orden de recorte: US-018 → US-012 → US-014 → US-019; P0 nunca se recorta.
- Precondiciones PRE-001..PRE-010 (ratificación, reglas BR, llaves/presupuesto, volumen Railway, fechas/responsables, prefijo de rutas, borrado de cuenta, latencia, ítems NEEDS_ITERATION del MVP 1).

## 03. Planning (MVP 2): Validation

## MVP 2 V2.0 Result: PASS_WITH_WARNINGS (0 HIGH, 1 MEDIUM, 4 LOW)

- PLAN-VAL-201 (MEDIUM): no es compromiso de sprint hasta resolver PRE-001, PRE-002, PRE-004, PRE-006; 11 SP provisionales.
- PLAN-VAL-202..205 (LOW): US-019 temprano no implica prioridad; dependencia US-012→US-011 asumida; PRE-007 queda para P05; rutas artifacts/ corregidas.

P04 readiness: WITH CONSTRAINTS.

