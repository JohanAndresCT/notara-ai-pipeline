# P02 - Requirements Engineering

**Version:** 2.1
**Stage:** P02 - Requirements Engineering
**Type:** Generation Prompt
**Project:** Notara
**Release covered:** MVP 2 - Sprint 2 (Audio, Voice and TTS/STT), incremental update of MVP 1
**Previous Stage:** P01 - Product Discovery
**Next Stage:** P03 - Planning

## Change Log

| Version | Change |
|---|---|
| 1.0 | Requirements for MVP 1 (HU01-HU10). Audio, voice, OMR excluded. |
| 2.0 | Incremental mode for MVP 2. HU11-HU19 in scope (CR-001, CR-002). Adds the Sprint 2 backlog and the MVP 2 decision log as inputs (P01 warning DISC-VAL-202). Exclusions on audio and voice apply only to MVP 1 content; OMR and image uploads stay excluded. Team-provided MoSCoW and Story Points are recorded as source data, not as P02 planning. |
| 2.1 | Removed state that belonged to a specific run (decision ranges, ID ranges, provisional estimates, open rules). The prompt now refers to the current content of its inputs (`DECISIONS_MVP2.md`, the latest upstream artifacts) so it stays valid when decisions are added. |

## 1. Purpose

Transform the validated product vision into a complete, traceable, testable and planning-ready requirements specification and product backlog for the current release, preserving the delivered MVP 1 requirements.

This stage defines **what Notara must do and under which conditions**, not how it is implemented.

## 2. Inputs and Source of Truth

Read before generating:

```text
ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md            (latest version)
ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md
ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md             (latest version)
ai-pipeline/outputs/00_context/SPRINT_2_BACKLOG_INPUT.md      (HU11-HU19, AC-0NN-0N)
ai-pipeline/outputs/00_context/DECISIONS_MVP2.md              (all DEC-2NN, every batch)
ai-pipeline/outputs/02_requirements/REQUIREMENTS.md           (previous version, MVP 1)
ai-pipeline/outputs/02_requirements/product_backlog.json      (previous version, MVP 1)
ai-pipeline/prompts/system/SYSTEM_PROMPT.md
```

Apply the P01 validation result: `PASS` / `PASS_WITH_WARNINGS` -> proceed and preserve warnings; `FAIL` / `BLOCKED` -> produce a blocked result.

The backlog acceptance criteria (`AC-011-01`, ...) are the team's statement of each story. Decisions (`DEC-2NN`) refine them. When a backlog criterion and a decision differ, the decision wins and the requirement cites both.

## 3. Role

Act as a **Senior Requirements Engineer and Product Analyst**.

You must translate needs into atomic, observable, testable requirements; preserve traceability to P01, HU01-HU19 and DEC-2NN; distinguish FACT, ASSUMPTION, PROPOSAL, UNKNOWN, CONFLICT and DECISION; keep the scope feasible.

You must not invent musical rules, roles, moderation, account recovery, performance targets or legal requirements; treat a common feature as approved without a source; silently resolve conflicts between the backlog, decisions and MVP 1 rules. When P01 or a decision delegates a definition to P02 (for example the difficulty rule of DEC-212 or the dictation vocabulary of DEC-205), write it as a concrete rule labeled `PROPOSAL` with an open question for team approval.

## 4. Incremental rules

1. Preserve every MVP 1 identifier: `EPIC-001`-`EPIC-004`, `FR-001`-`FR-017`, `NFR-001`-`NFR-003`, `US-001`-`US-010`, `AC-001`-`AC-028`, `BR-001`-`BR-012`, `EDGE-001`-`EDGE-013`, `DEP-001`-`DEP-003`, `Q-001`-`Q-006`, `ASM-001`-`ASM-003`. Never renumber.
2. Supersede, do not delete. When a decision changes an MVP 1 rule (for example DEC-211 on comment deletion), keep the old item, mark it `SUPERSEDED by <ID> (DEC-2NN)`, and add the new item.
3. Continue sequences for new items (`FR-018`..., `US-011`..., `AC-029`..., `BR-013`...).
4. User stories for MVP 2 use the backlog IDs: `US-011` for HU11 ... `US-019` for HU19. Requirement AC IDs continue the P02 sequence and cite the backlog AC they refine.
5. New epics are allowed when the MVP 2 capabilities do not fit existing ones; extending an MVP 1 epic is allowed when the capability is an extension of it (for example voice comments within Community Interaction).
6. Enabler stories (HU16, HU17) are written from the operator perspective stated by the backlog, without introducing a role.

## 5. Domain guardrails

- **Users:** USER-001-USER-003; no differentiated roles.
- **MVP 1 content rules** (unchanged): `.abc` and plain text; non-empty; at most 1,000 characters; basic ABC validation (`X:`, `T:`, `M:`, `L:`, `K:` and a musical line); free plain text; line breaks and format shown; title, instrument, description and content required.
- **MVP 2 capabilities:** HU11 dictation, HU12 voice comments, HU13 spoken solfege, HU14 audio tutor, HU15 instrument playback, HU16 audio cache, HU17 voice fallback, HU18 MP3 download, HU19 `.abc` file loading, as refined by every decision in `DECISIONS_MVP2.md`.
- **Excluded:** OMR, image uploads, differentiated roles, sung solfege, mixed voice+instrument MP3, server-side instrument synthesis, storing loaded files, languages other than Spanish.

## 6. Classification

Scope labels: `MVP_CORE`, `MVP_SUPPORTING`, `FUTURE`, `OUT_OF_SCOPE`, `REQUIRES_DECISION`. Use P01's Core/Supporting classification.
Evidence labels: `FACT`, `DECISION`, `ASSUMPTION`, `PROPOSAL`, `UNKNOWN`, `CONFLICT`.
Final status: `READY`, `READY_WITH_ASSUMPTIONS`, `BLOCKED`.

## 7. Process

1. Record P01 status, warnings and the decisions that affect requirements.
2. Define or extend epics with traceability.
3. Write functional requirements (`FR-*`) for every MVP 2 capability, including its validation, failure and authorization behavior.
4. Write non-functional requirements (`NFR-*`) only when supported (privacy, reliability, cost control, language, platform). Unspecified targets (for example latency) -> `REQUIRES_DECISION` + question.
5. Write user stories US-011-US-019 with "As a ..., I want ..., so that ..." from the backlog.
6. Write Given/When/Then acceptance criteria covering happy path, validation, failure, limits and authorization. Cite the backlog AC and the decisions.
7. Business rules (`BR-*`) for decisions and delegated definitions.
8. Edge cases (`EDGE-*`) and dependencies (`DEP-*`), including external-provider and storage dependencies as product dependencies (no technology design).
9. Assumptions and open questions: carry those from P00/P01 that affect requirements; add new ones found while writing.
10. Backlog: planning fields stay `null` / `[]`. Team-provided MoSCoW and Story Points go in `traceability.team_backlog` as source data.

## 8. Boundary

Do not specify languages, frameworks, endpoints, schemas, storage layout, infrastructure, screen layouts or test automation. Decisions that name a provider may be cited as constraints, not designed.

## 9. Outputs

### `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md`

Same section structure as version 1.0 (Metadata; Overview with scope, exclusions, assumptions; Epics; Functional Requirements; Non-Functional Requirements; User Stories; Business Rules; Edge Cases; Dependencies; Assumptions and Open Questions; Traceability; Status), plus a Change Log and a "Superseded items" table.

### `ai-pipeline/outputs/02_requirements/product_backlog.json`

Valid JSON with the version 1.0 shape (`backlog_metadata`, `epics`, `items`). Each item keeps `priority`, `story_points`, `release`, `sprint` = `null` and `assigned_developers` = `[]`. MVP 2 items add:

```json
"traceability": {
  "p01_elements": ["NEED-007", "JTBD-005", "IND-201"],
  "hu_ids": ["HU11"],
  "backlog_ac_ids": ["AC-011-01"],
  "decision_ids": ["DEC-205"],
  "team_backlog": {"moscow": "Must", "story_points": 5, "adjusted_by": ["DEC-208"], "adjusted_story_points": 8}
}
```

## 10. Self-validation

- Inputs read; P01 status respected.
- MVP 1 IDs preserved; superseded items marked.
- HU11-HU19 each covered by at least one FR, one US and testable ACs.
- Every decision in `DECISIONS_MVP2.md` that affects behavior is reflected in an FR, NFR or BR.
- Conflicts between backlog ACs, decisions and MVP 1 rules are reported.
- Delegated definitions written as PROPOSAL with a question.
- No technology design or planning values.
- Unique IDs; all references resolve; Markdown and JSON consistent; JSON parses.

## 11. Failure conditions and transition

`BLOCKED` if the vision is unavailable, P01 is blocking, or a contradiction prevents reliable requirements. Otherwise the artifacts go to P02 validation; after it, P03 alone decides priority, points, releases, sprints and assignments.
