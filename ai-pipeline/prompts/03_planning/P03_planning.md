# P03 - Prioritization and Delivery Planning

**Version:** 2.0
**Stage:** P03 - Planning
**Type:** Generation Prompt
**Project:** Notara
**Release covered:** MVP 2 - Sprint 2 (Audio, Voice and TTS/STT), incremental update of MVP 1
**Previous Stage:** P02 - Requirements
**Next Stage:** P04 - UX/UI

## Change Log

| Version | Change |
|---|---|
| 1.0 | Prioritization of MVP 1 (HU01-HU10); no points, sprints or developers. |
| 2.0 | Incremental mode for MVP 2 (HU11-HU19). Team-provided Story Points, MoSCoW, release and sprint from the Sprint 2 backlog and the decision log are approved sources and may be used; provisional estimates must be flagged. Developers stay unassigned until the team provides them (Q-010). Planned backlog paths updated from `artifacts/` to `outputs/`. |

## 1. Purpose

Transform the validated vision and requirements into a traceable, risk-aware and feasible prioritization and delivery plan for the current release, preserving MVP 1 as the delivered baseline.

P03 decides what is delivered first, what can be dropped under pressure and what stays out. It does not design screens, architecture or implementation.

## 2. Inputs

```text
ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md and CONTEXT_VALIDATION.md
ai-pipeline/outputs/00_context/SPRINT_2_BACKLOG_INPUT.md      (SP, MoSCoW, HU11-HU19)
ai-pipeline/outputs/00_context/DECISIONS_MVP2.md              (DEC-201-DEC-218)
ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md and PRODUCT_VISION_VALIDATION.md
ai-pipeline/outputs/02_requirements/REQUIREMENTS.md, product_backlog.json, REQUIREMENTS_VALIDATION.md
ai-pipeline/outputs/03_planning/PRIORITIZATION.md and product_backlog.json (previous version, MVP 1)
ai-pipeline/prompts/system/RELEASE_PLAN.md                    (MVP 1 load reference)
ai-pipeline/prompts/system/SYSTEM_PROMPT.md
```

P02 validation must be `PASS` or `PASS_WITH_WARNINGS`; otherwise `BLOCKED`. Carry the P02 findings that affect planning (for example estimates that depend on PROPOSAL rules).

## 3. Role

Act as a **Senior Product Strategy and Delivery Prioritization Analyst**. Prioritize with user value, release strategy, dependencies, feasibility, risk and opportunity cost. Make trade-offs explicit.

You must not add features, move OMR or other exclusions into scope, invent estimates, dates or assignments, or choose technologies beyond decided constraints.

## 4. Planning baseline

- **MVP 1 (HU01-HU10):** delivered (tag `v1.0.0`); keep its priorities as the baseline and mark it delivered. MVP 1 decisions Q-001-Q-006 remain, except comment deletion, now governed by DEC-211 (supersedes P03 DEC-002).
- **MVP 2 (HU11-HU19):** US-011-US-019, FR-018-FR-044, NFR-004-NFR-010, as refined by DEC-201-DEC-218.
- **Team estimates (approved source):** HU11 8 SP (DEC-208), HU12 3, HU13 5, HU14 3, HU15 3, HU16 3, HU17 2 (Must by DEC-209), HU18 2, HU19 2; total 31 SP. Must 21 SP, Should 8 SP, Could 2 SP.
- **Provisional estimates:** US-011 and US-014 depend on PROPOSAL rules BR-013, BR-014, BR-025 (P02 REQ-VAL-201).
- **Reference load:** MVP 1 delivered 31 SP in one two-week sprint with a five-person team (RELEASE_PLAN.md), evaluated `NEEDS_ITERATION`.

## 5. Priority model

`P0` required for the coherent release slice; `P1` strongly recommended; `P2` deferrable / stretch; `P3` future or excluded; `BLOCKED` cannot be planned without a decision. Map MoSCoW as a starting point (Must -> P0, Should -> P1, Could -> P2) and justify any deviation.

## 6. Process

1. Summarize upstream evidence and the P02 warnings that affect planning.
2. Define the release slice that demonstrates the value "dictate -> publish -> listen".
3. Prioritize each US with rationale.
4. Sequence delivery groups by dependency (DEP-004-DEP-010), external-dependency risk (keys, budget, storage) and risk discovery (high-uncertainty work early). Identify work that can start without external dependencies.
5. Define a capacity cut line: committed (P0), target (P1), stretch (P2), and the drop order if capacity is insufficient.
6. List preconditions (team decisions and verifications) with the stage that needs them.
7. Record MVP 1 debt and defects that affect MVP 2 sequencing as dependencies for P05/P06, without designing their fix.

## 7. Boundaries

P03 may decide priority, sequence, release slice, cut line and drop order, and may record team-provided SP, release and sprint. P03 must not decide technologies, architecture, implementation tasks, screen layouts, developer assignments, workload percentages or dates not given by the team.

## 8. Outputs

### `ai-pipeline/outputs/03_planning/PRIORITIZATION.md`

Same high-level structure as version 1.0 (Metadata; Executive Summary; Priorities at a Glance; MVP Focus with Core, Supporting, Future/Deferred, Out of Scope; Delivery Sequence; Dependencies, Decisions and Risks; Requirements-to-Priority Traceability; Assumptions and Unknowns; Key Constraints; Final Recommendation; Status and Next Actions), plus a Change Log, a Capacity and Cut Line section and a Preconditions section.

### `ai-pipeline/outputs/03_planning/product_backlog.json`

Planned index: MVP 1 items kept with `delivery_status: "DELIVERED"`; MVP 2 items with `priority`, `delivery_group_order`, `depends_on`, `story_points` (team source), `estimate_status` (`TEAM` or `PROVISIONAL`), `release: "MVP 2"`, `sprint: "Sprint 2"`, `assigned_developers: []`, `status: "PRIORITIZED"`, and canonical references to `outputs/02_requirements/product_backlog.json`.

## 9. Status

`READY`, `READY_WITH_ASSUMPTIONS` or `BLOCKED`. Use `READY_WITH_ASSUMPTIONS` when plan-relevant team decisions (dates, owners, budget, ratification, PROPOSAL rules) are still open.

## 10. Self-review

- All HU01-HU19 have priority and phase; MVP 1 marked delivered.
- Sum of SP and per-priority totals correct; provisional estimates flagged.
- Dependencies respected; external-dependency risk considered.
- Cut line and drop order explicit; P0 never dropped.
- Preconditions listed with owner stage.
- No technology, assignment or date invented.
- Markdown and JSON consistent; JSON valid.
