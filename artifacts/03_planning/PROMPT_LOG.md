## 03. Planning

### P03 - Prioritization and Delivery Planning

Actúa siguiendo las reglas de:
`prompts/system/SYSTEM_PROMPT.md`

Ejecuta la etapa P03 usando:
`prompts/03_planning/P03_planning.md`

Usa como entradas:

- `artifacts/00_context/PROJECT_CONTEXT.md`
- `artifacts/00_context/CONTEXT_VALIDATION.md`
- `artifacts/01_discovery/PRODUCT_VISION.md`
- `artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md`
- `artifacts/02_requirements/REQUIREMENTS.md`
- `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md`
- `prompts/system/SYSTEM_PROMPT.md`

Genera:

- `artifacts/03_planning/PRIORITIZATION.md`

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
`prompts/03_planning/P03_planning.md`

### P03 - Prioritization Artifact

Resultado: GENERADO

Artefacto:
`artifacts/03_planning/PRIORITIZATION.md`

Estado del artefacto: `READY`

El plan conserva las diez capacidades aprobadas `HU01`-`HU10`, prioriza el
flujo principal de publicación, descubrimiento e interacción, separa las
capacidades de soporte, mantiene explícitos los riesgos y no introduce
decisiones técnicas, de implementación, asignación, Story Points, sprints o
releases.

### P03 - Validation Prompt

Resultado: GENERADO

Prompt:
`prompts/03_planning/P03_validation.md`

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
`artifacts/03_planning/PRIORITIZATION_VALIDATION.md`

Resultado de validación: `PASS`

La validación confirmó que `PRIORITIZATION.md` mantiene el alcance aprobado
del MVP de Notara, cubre `HU01`-`HU10`, conserva la trazabilidad con
`FR-*`/`NFR-*`, respeta Q-001 a Q-006, documenta dependencias, riesgos y
supuestos, y no introduce decisiones técnicas o de implementación.

El plan queda listo para P04 bajo las restricciones documentadas. No se
identificaron hallazgos.

**Entradas de validación disponibles:**

- `artifacts/00_context/PROJECT_CONTEXT.md`
- `artifacts/00_context/CONTEXT_VALIDATION.md`
- `artifacts/01_discovery/PRODUCT_VISION.md`
- `artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md`
- `artifacts/02_requirements/REQUIREMENTS.md`
- `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md`
- `artifacts/03_planning/PRIORITIZATION.md`
- `prompts/system/SYSTEM_PROMPT.md`
