## 04. UX/UI

### P04 - UX Design

Actúa siguiendo las reglas de:
`prompts/system/SYSTEM_PROMPT.md`

Ejecuta la etapa P04 usando:
`prompts/04_ux/P04_design.md`

Usa como entradas los artefactos validados de P00, P01, P02 y P03.

Genera:

- `artifacts/04_ux_design/UX_SPEC.md`

### Estado de ejecución

#### P04 - Design Prompt

Resultado: GENERADO

Prompt:
`prompts/04_ux/P04_design.md`

#### P04 - UX Artifact

Resultado: GENERADO

Artefacto:
`artifacts/04_ux_design/UX_SPEC.md`

Estado del artefacto: `READY`

La especificación cubre `HU01`-`HU10`, las pantallas y flujos del MVP, las
reglas de contenido `.abc` y texto plano, los límites de acceso y propiedad,
la respuesta responsive y las exclusiones aprobadas.

#### P04 - Validation Prompt

Resultado: GENERADO

Prompt:
`prompts/04_ux/P04_validation.md`

Estado: `LISTO_PARA_EJECUCION`

#### P04 - Validation Artifact

Resultado: GENERADO
Estado: `VALIDADO`

Artefacto:
`artifacts/04_ux_design/UX_SPEC_VALIDATION.md`

Resultado de validación: `PASS`

La validación confirmó la cobertura de `HU01`-`HU10`, la trazabilidad con
`FR-*` y `NFR-*`, la conservación de Q-001 a Q-006, la representación de las
reglas `.abc` y texto plano, los límites de autenticación y propiedad, y la
ausencia de funcionalidades no aprobadas o decisiones técnicas prematuras.

P05 queda habilitado. No se identificaron hallazgos.
