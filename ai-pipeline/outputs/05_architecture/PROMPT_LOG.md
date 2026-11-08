# 05. Architecture

## P05 - Architecture

The architecture was drafted from the validated project artifacts:

- `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md` and `CONTEXT_VALIDATION.md`
- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md` and `PRODUCT_VISION_VALIDATION.md`
- `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md` and `REQUIREMENTS_VALIDATION.md`
- `ai-pipeline/outputs/03_planning/PRIORITIZATION.md` and `PRIORITIZATION_VALIDATION.md`
- `ai-pipeline/outputs/04_ux/UX_SPEC.md` and `UX_SPEC_VALIDATION.md`

### Prompt availability

- `ai-pipeline/prompts/05_architecture/P05_architecture.md`: present, empty.
- `ai-pipeline/prompts/05_architecture/P05_validation.md`: present, empty.

No prompt-specific instructions or validation rubric were available. The architecture and validation were therefore grounded directly in P00-P04 and the approved product scope. The stack is presented as an explicit P05 recommendation for team review, not as a pre-existing project fact.

### P05 prompt files - authored after initial architecture draft

The previously empty prompt placeholders have now been populated from the
validated P00-P04 artifacts and the P05 architecture draft:

- `ai-pipeline/prompts/05_architecture/P05_architecture.md`: architecture generation
	workflow, source hierarchy, Notara requirements baseline, design steps,
	required artifact structure, and self-review criteria.
- `ai-pipeline/prompts/05_architecture/P05_validation.md`: independent architecture
	audit workflow, coverage/security criteria, result rules, and validation
	report structure.

Both prompt files were checked with workspace diagnostics; no errors were
reported.

### P05 architecture artifact

Result: GENERATED

Artifact: `ai-pipeline/outputs/05_architecture/ARCHITECTURE.md`

Status: `READY_FOR_REVIEW`

The document defines the modular-monolith architecture, recommended stack, system and data boundaries, API surface, authentication and ownership controls, validation/display behavior, deployment shape, risks, and P06 handoff. It preserves P0/P1 and out-of-scope decisions.

### P05 validation artifact

Result: COMPLETED_AS_UPSTREAM_REVIEW

Artifact: `ai-pipeline/outputs/05_architecture/ARCHITECTURE_VALIDATION.md`

Result: `PASS_WITH_WARNINGS`

No blocking coverage gaps were found. The stack requires team/course confirmation; hosting, operational targets, some API field policies, and concrete ABC validation examples remain open as recorded in the validation report.

---

# MVP 2 — Sprint 2 (Audio, Speech & TTS/STT)

## 05. Architecture (MVP 2): adaptación de prompts

- `prompts/05_architecture/P05_architecture.md` → v2.0: modo incremental; el código y despliegue del MVP 1 son la línea base "as built"; el MVP 2 se diseña como addendum con ADRs.
- `prompts/05_architecture/P05_validation.md` → v2.0 (antes estaba vacío; la validación del MVP 1 se hizo sin prompt).

## 05. Architecture (MVP 2)

Resultado: ARCHITECTURE.md v2.0 — READY_WITH_WARNINGS.
- Línea base verificada en el repo: vistas Django con JsonResponse (no serializers DRF), Reaction (v1) y Like (legado) duplicados, Comment.body ≤ 500, Gunicorn 2 workers síncronos sin timeout, Nginx sin proxy_read_timeout, foto de perfil servida con autenticación.
- ADR-006..ADR-015: módulo `voice` con adaptadores (Whisper, ElevenLabs, edge-tts, fake); procesamiento síncrono con timeouts y Gunicorn gthread (2×4, 75 s); audio en default_storage servido con autenticación; caché SynthesizedAudio por sha256(tipo|texto|voz|idioma); cuota VoiceQuota solo en fallos de caché; parser de dictado y lector ABC únicos en backend (eventos de reproducción en el detalle para Tone.js); comentarios de voz como extensión de Comment; endpoints nuevos solo en /api/v1/; motores por entorno (fake en CI).
- Conflictos: CONFLICT-ARCH-201 (edge-tts en CI vs NFR-010), CONFLICT-ARCH-202 (límite 500 vs transcripción de 30 s, Q-026), CONFLICT-ARCH-203 (.wav vs webm), CONFLICT-ARCH-204 (piano sin llamadas: resuelto).

## 05. Architecture (MVP 2): Validation

## MVP 2 V2.0 Result: PASS_WITH_WARNINGS (0 HIGH, 2 MEDIUM, 4 LOW)

- ARCH-VAL-201 (MEDIUM): aprobar ADRs y resolver CONFLICT-ARCH-201/202.
- ARCH-VAL-202 (MEDIUM): verificar persistencia de /data en Railway (PRE-005).
- ARCH-VAL-203..206 (LOW): texto del tutor en cabecera, cuota de transcripción (Q-027), timeouts sin medir, registrar Q-026/Q-027.

P06 readiness: YES_WITH_REVIEW_GATES (grupos 1a, 1b y 2 pueden empezar).

