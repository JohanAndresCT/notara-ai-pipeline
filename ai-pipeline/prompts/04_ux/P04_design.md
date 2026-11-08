# P04 - UX Design Specification

**Version:** 2.0
**Stage:** P04 - UX/UI
**Type:** Generation Prompt
**Project:** Notara
**Release covered:** MVP 2 - Sprint 2 (Audio, Voice and TTS/STT), incremental update of MVP 1
**Previous Stage:** P03 - Planning
**Next Stage:** P05 - Architecture

## Change Log

| Version | Change |
|---|---|
| 1.0 | UX specification for MVP 1 (HU01-HU10); audio, voice and OMR excluded. |
| 2.0 | Incremental mode for MVP 2 (HU11-HU19). Voice, file-loading and listening UX in scope; comment deletion allowed (DEC-211). OMR, images, roles, comment editing and other exclusions remain. Adds interaction states, message catalogue, permission and accessibility rules for audio. |

## 1. Purpose

Translate the validated requirements and plan into a product-level UX specification for the current release: screens, regions, flows, states, messages and cross-cutting rules, preserving the delivered MVP 1 experience. No visual design, framework or implementation decisions.

## 2. Inputs

```text
ai-pipeline/outputs/02_requirements/REQUIREMENTS.md (v3.0) and REQUIREMENTS_VALIDATION.md
ai-pipeline/outputs/03_planning/PRIORITIZATION.md (v2.0) and PRIORITIZATION_VALIDATION.md
ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md (v2.2)
ai-pipeline/outputs/00_context/DECISIONS_MVP2.md
ai-pipeline/outputs/04_ux/UX_SPEC.md (previous version, MVP 1)
ai-pipeline/prompts/system/SYSTEM_PROMPT.md
```

P02 and P03 must be `PASS` or `PASS_WITH_WARNINGS`. Carry warnings that affect UX (provisional rules BR-013, BR-014, BR-025; open questions Q-021-Q-025).

## 3. Role

Act as a **Senior UX Designer and Interaction Analyst**. Define what the user sees, can do, and is told in each state. Do not invent product capabilities. When a requirement leaves an interaction detail open, propose it as `UX-PROP-*` and list it for approval.

## 4. Baseline

- Users USER-001-USER-003; no roles; HU16/HU17 personas are operators and get no UI.
- MVP 1 rules unchanged (formats, 1,000 characters, minimal ABC validation, line breaks, format distinction, newest-first with 10 per page, Chrome/Edge/Firefox at 360/768/1280 px).
- MVP 2 decisions DEC-201-DEC-218 constrain UX: Spanish only; recordings ≤ 30 s / 2 MB; notice before recording; listening only for `.abc` with the message "Disponible solo para partituras en ABC"; dictation message "No se pudo interpretar el dictado musical"; 20 new syntheses per day; fallback voice not signaled; MP3 = solfege voice; files read locally.
- Exclusions: OMR, image uploads, roles, comment editing, account recovery, sung solfege, mixed MP3, other languages.

## 5. Process

1. Classify FR-018-FR-044 and NFR-004-NFR-010 as `USER_FACING`, `UX_SUPPORTING`, `UX_CONSTRAINT`, `NON_UX` or `REQUIRES_DECISION`.
2. Prefer regions within existing screens over new screens; add a screen or dialog only when a flow needs it.
3. Write flows for HU11-HU19 and amend MVP 1 flows affected by DEC-211 or new entry points; keep MVP 1 flows otherwise.
4. For every asynchronous audio action define the states: idle, requesting permission (if any), recording, processing, success, error, disabled, limit reached.
5. Provide a message catalogue: backlog/decision copy marked as FACT/DECISION; new copy marked UX-PROP.
6. Define accessibility rules for recording and playback (keyboard, live announcements, visible timers, explanations for disabled controls that work on touch).
7. Define responsive rules for the new regions at 360/768/1280 px.
8. Trace each US/FR/AC to flows and screens; record MVP 1 corrections found.

## 6. Boundaries

No visual tokens, layouts at pixel level, component libraries, frameworks, endpoints or storage. No dates, owners or estimates.

## 7. Output

`ai-pipeline/outputs/04_ux/UX_SPEC.md` with the version 1.0 structure (Metadata; Objective and Boundary; Users and Access; Requirement UX Classification; Information Architecture; Core User Flows; Screen and Interaction Specifications; Cross-Cutting Rules; Responsive and Readability; Exclusions; Assumptions and Questions; Coverage Matrix; P05 Handoff; Status), plus Change Log, Interaction States, Message Catalogue, Accessibility, and UX Proposals sections.

## 8. Status

`READY`, `READY_WITH_ASSUMPTIONS` or `BLOCKED`. Use `READY_WITH_ASSUMPTIONS` when UX-PROP items or provisional upstream rules remain.

## 9. Self-review

- HU01-HU19 have at least one flow; MVP 1 flows preserved or explicitly amended.
- All USER_FACING requirements and their ACs covered; states and messages defined.
- Exclusions not designed; fallback not signaled; Spanish only.
- UX-PROP items labeled and listed.
- No technical or visual decisions; traceability complete.
