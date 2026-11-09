## 04. UX/UI

### P04 - UX Design

Actúa siguiendo las reglas de:
`ai-pipeline/prompts/system/SYSTEM_PROMPT.md`

Ejecuta la etapa P04 usando:
`ai-pipeline/prompts/04_ux/P04_design.md`

Usa como entradas los artefactos validados de P00, P01, P02 y P03.

Genera:

- `ai-pipeline/outputs/04_ux_design/UX_SPEC.md`

### Estado de ejecución

#### P04 - Design Prompt

Resultado: GENERADO

Prompt:
`ai-pipeline/prompts/04_ux/P04_design.md`

#### P04 - UX Artifact

Resultado: GENERADO

Artefacto:
`ai-pipeline/outputs/04_ux_design/UX_SPEC.md`

Estado del artefacto: `READY`

La especificación cubre `HU01`-`HU10`, las pantallas y flujos del MVP, las
reglas de contenido `.abc` y texto plano, los límites de acceso y propiedad,
la respuesta responsive y las exclusiones aprobadas.

#### P04 - Validation Prompt

Resultado: GENERADO

Prompt:
`ai-pipeline/prompts/04_ux/P04_validation.md`

Estado: `LISTO_PARA_EJECUCION`

#### P04 - Validation Artifact

Resultado: GENERADO
Estado: `VALIDADO`

Artefacto:
`ai-pipeline/outputs/04_ux_design/UX_SPEC_VALIDATION.md`

Resultado de validación: `PASS`

La validación confirmó la cobertura de `HU01`-`HU10`, la trazabilidad con
`FR-*` y `NFR-*`, la conservación de Q-001 a Q-006, la representación de las
reglas `.abc` y texto plano, los límites de autenticación y propiedad, y la
ausencia de funcionalidades no aprobadas o decisiones técnicas prematuras.

P05 queda habilitado. No se identificaron hallazgos.

---

# MVP 2 — Sprint 2 (Audio, Speech & TTS/STT)

## 04. UX (MVP 2): adaptación de prompts

- `prompts/04_ux/P04_design.md` → v2.0: modo incremental; UX de voz, carga de archivo y escucha dentro del alcance; borrado de comentarios (DEC-211); estados de interacción, catálogo de mensajes, accesibilidad y propuestas UX-PROP.
- `prompts/04_ux/P04_validation.md` → v2.0.

## 04. UX (MVP 2)

Resultado: UX_SPEC.md v2.0 — READY_WITH_ASSUMPTIONS.
- Sin navegación nueva: regiones REG-001..REG-008 en SCR-005/006/007 y diálogos SCR-010 (reemplazar contenido) y SCR-011 (confirmar borrado de comentario).
- Flujos FLOW-011..FLOW-019 (HU11–HU19); FLOW-004/005/008/010 enmendados; referencias AC de FLOW-008..010 corregidas.
- Catálogo de 21 mensajes (M-01 y M-02 textuales del backlog/DEC-207; resto UX-PROP).
- 7 propuestas UX-PROP y 3 preguntas UX-Q.
- DEFECT-001 especificado (placeholder en varias líneas).

## 04. UX (MVP 2): Validation

## MVP 2 V2.0 Result: PASS_WITH_WARNINGS (0 HIGH, 1 MEDIUM, 4 LOW)

- UX-VAL-201 (MEDIUM): el UX del dictado depende de BR-013/BR-025 (PRE-002).
- UX-VAL-202..205 (LOW): aprobar UX-PROP (UX-PROP-006 cambia el borrado inmediato ya entregado), timeout/cancelar en procesamiento, corrección de referencias v1.0, nombrar o no al proveedor en M-11.

P05 readiness: WITH CONSTRAINTS.

## MVP 2 — Actualización por decisiones DEC-219..DEC-229 (v2.1)

UX-PROP-001..007 aprobadas (DEC-225); M-11 nombra a OpenAI (DEC-226); tutor con tonalidad y tempo (DEC-227);
UX-Q-001..003 resueltas; nuevo mensaje M-17 (límite de transcripciones, DEC-222); FR-045/FR-046 y AC-070..AC-072 trazados.
Hallazgos resueltos: UX-VAL-201, UX-VAL-202, UX-VAL-205.

## Re-validación (run 2) — prompts v2.1

Prompts P04 v2.1. Validación sobre UX v2.1: PASS_WITH_WARNINGS (0 MEDIUM, 1 LOW: UX-VAL-203 sin opción de cancelar). P05 readiness: YES.

## Merge `mvp-2` → `pipeline/mvp2-p00-context` (2026-11-09)

Se tomó como base la versión de `mvp-2` (CR-003, CR-004, implementación de HU11) y se reaplicó el segundo lote de decisiones renumerado como DEC-230..DEC-238. Retiradas: antigua DEC-222 (20/día; gana DEC-219 con 30/día) y antigua DEC-226 (aviso con OpenAI; obsoleto tras CR-003). Validaciones re-ejecutadas: PASS_WITH_WARNINGS.
