# P00 — Project Context Validation

**Version:** 2.0  
**Stage:** P00 — Context Definition  
**Type:** Validation Prompt  
**Project:** Notara  
**Input Artifact A:** `ai-pipeline/outputs/00_context/INITIAL_PROJECT_INPUT.md` (MVP 1 team input)  
**Input Artifact B:** `ai-pipeline/outputs/00_context/SPRINT_2_BACKLOG_INPUT.md` (MVP 2 team input)  
**Input Artifact C:** `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md` (artifact under validation)  
**Input Artifact D (optional):** Previous context version (tag `v1.0.0`), `ai-pipeline/prompts/system/RELEASE_PLAN.md`, `ai-pipeline/outputs/03_planning/PRIORITIZATION.md`, `ai-pipeline/outputs/10_evaluation/MVP_EVALUATION.md`, and the repository state  
**Output Artifact:** `ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md`  
**Related Generation Prompt:** `ai-pipeline/prompts/00_context/P00_project_context.md` (v2.0)  
**Global Rules:** `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`

---

## Change Log

| Version | Change |
|---|---|
| 1.0 | Validation of the MVP 1 context against the initial input. |
| 2.0 | Incremental validation for MVP 2: adds the Sprint 2 backlog as a team input, checks preservation of MVP 1 identifiers, Change Request registration, PROPOSAL labeling of backlog technologies, sourced decision IDs, and repository-verifiable facts. Removes MVP 1-only checks about image uploads. |

---

## 1. Purpose

Validate that `PROJECT_CONTEXT.md` faithfully and traceably transforms the team inputs (MVP 1 initial input + MVP 2 Sprint 2 backlog) into a clear, consistent and bounded context for P01 — Discovery, without inventing information or prematurely designing the solution.

This is a validation prompt, not a product-design prompt. Do not redesign the product, expand or shrink the release, or silently resolve contradictions.

---

## 2. Role

Act as a **Senior Software Engineering Process Auditor and Product Context Validator**.

You are not authorized to add requirements, change scope, select technologies, design architecture, invent users or rules, resolve contradictions silently, convert assumptions or proposals into facts, remove inconvenient information, or approve unsupported claims.

---

## 3. Core Validation Principle

> Does `PROJECT_CONTEXT.md` faithfully and sufficiently transform Inputs A and B (with the MVP 1 baseline) into a structured context, preserving MVP 1, adding MVP 2 traceably, and without inventing information?

Evaluate: (1) internal quality, (2) traceability to the inputs, (3) accuracy of repository-verifiable facts. An internally coherent artifact that contains unsupported information must not receive a full pass.

---

## 4. Validation Rules

### 4.1 Structural completeness

Sections 1–16 must exist (Project Identification … Generation Metadata). In incremental mode a Change Log (§0) and a Change Request reference are also required. An explicit `UNKNOWN` is not an empty section.

### 4.2 Incremental integrity (MVP 1 preservation)

* All MVP 1 IDs remain (`MVP-001`–`MVP-010`, `FUT-*`, `OOS-*`, `ASM-001`–`ASM-003`, `Q-001`–`Q-006`, `RISK-001`–`RISK-005`, `SUCCESS-001`–`SUCCESS-007`).
* Items that changed status are marked superseded, not deleted or renumbered.
* MVP 1 facts stay consistent with the MVP 1 approved artifacts (Release Plan, P03 decisions). A divergence between an approved decision and delivered behavior must be reported, not hidden.

### 4.3 MVP 2 scope traceability

* Each HU11–HU18 maps to exactly one `MVP-0NN` feature.
* Story Points and MoSCoW match Input B. Any change (re-estimation, re-prioritization) is labeled PROPOSAL.
* The context's description of each story does not narrow or widen the backlog statement without labeling it as PROPOSAL and listing it as a pending decision.

### 4.4 Change Request

A `CR-XXX` explains why voice/audio moves from future scope (MVP 1 `FUT-*` / `OOS-*`) into MVP 2, per SYSTEM_PROMPT §7 and §11. Check that its ID does not collide with an existing CR.

### 4.5 Technologies and external services

* Technologies named in Input B (Whisper, Deepgram, ElevenLabs, Azure, Google, Tone.js, FluidSynth, `edge-tts`, PyDub/FFmpeg) are PROPOSAL until approved.
* Where Input B lists alternatives, the context lists them; reducing them to one choice is a PROPOSAL.
* External services are listed with purpose and status, and the need for an ADR / architecture addendum is stated.
* MVP 1 technologies may be FACT only if verifiable in the repository.

### 4.6 Decision IDs and sources

Every cited `DEC-*`, `ADR-*`, `CR-*` must exist in an input artifact or be defined inside the context (for example a Proposed Decisions table). Flag unsourced IDs and IDs that collide with existing ones in other artifacts.

### 4.7 Fact / Proposal / Assumption / Unknown

Facts must be supported by an input or the repository. Proposals and assumptions must be labeled. Unknowns must not be presented as facts and material unknowns must appear as open questions.

### 4.8 Repository-verifiable facts

Spot-check claims about the stack, deployment, tags, storage and "open findings" against the current repository. Findings reported as open that were already fixed are a traceability problem.

### 4.9 Contradiction detection (MVP 2)

Check at least:

* 26 SP in one sprint with unknown dates.
* Backlog alternatives vs. a single provider.
* HU15 browser-side playback vs. HU18 MP3 "Voz TTS + Instrumento".
* HU13 "hablado/cantado" vs. spoken-only proposal.
* HU17 "Offline" title vs. `edge-tts` requiring network.
* Paid APIs vs. unknown budget.
* Plain-text scores vs. ABC-only audio features.
* HU16 "como administrador del sistema" vs. "no differentiated role management".
* Stories with no acceptance-criteria failure path (e.g. HU13–HU15 on invalid ABC).

### 4.10 Platform, team, risks, questions, success, scope summary, status

* Platform: microphone/HTTPS needs recorded; browsers unknown.
* Team: five members, roles; Sprint 2 dates and ownership UNKNOWN if not given; no invented skills.
* Risks: scope/timeline, external API dependency and cost, dictation quality, storage persistence, personal data in voice recordings, credit abuse, MVP 1 debt.
* Open questions: provider approval, limits, budget/keys, dates/ownership, retention, language, latency.
* Success criteria: qualitative, traceable to MVP-011–MVP-018, no unverified metrics.
* Scope summary agrees with detailed sections.
* Status: `READY`, `READY_WITH_ASSUMPTIONS` or `BLOCKED` is justified.

---

## 5. Traceability Audit

Produce a table:

| Statement | Source | Classification | Status |
|---|---|---|---|

Prioritize problem, users, MVP 2 features, constraints, technologies, external dependencies and decisions.

---

## 6. Severity Levels

* **CRITICAL** — cannot proceed (no problem, no release scope, fundamental contradiction, major fabricated content).
* **HIGH** — must be corrected before downstream work relies on it (unsourced decision presented as basis, unlabeled major assumption, ambiguous release boundary, unsupported requirement).
* **MEDIUM** — can proceed but correction recommended (traceability gaps, stale facts, missing risks).
* **LOW** — wording, duplication, formatting.

---

## 7. Validation Decision

Exactly one: `PASS`, `PASS_WITH_WARNINGS`, `FAIL`, `BLOCKED`.

```text
IF critical issue exists              → BLOCKED or FAIL
ELSE IF high issue prevents reliable downstream work → FAIL
ELSE IF non-blocking issues remain    → PASS_WITH_WARNINGS
ELSE                                  → PASS
```

---

## 8. Output Format

Write to `ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md`:

```markdown
# P00 — Context Validation Report

**Project:** Notara
**Release:** MVP 2 — Sprint 2
**Input Artifact:** `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md` (version)
**Team Inputs:** `INITIAL_PROJECT_INPUT.md`, `SPRINT_2_BACKLOG_INPUT.md`
**Validator Role:** Senior Software Engineering Process Auditor and Product Context Validator

## 1. Overall Result
## 2. Executive Summary
## 3. Structural Validation
## 4. Section-by-Section Findings
## 5. Scope and Traceability Audit
## 6. Findings
| ID | Severity | Finding | Evidence | Recommendation |
## 7. Context Status Assessment
## 8. Required Actions
## 9. Validation Metadata
```

Do not modify `INITIAL_PROJECT_INPUT.md`, `SPRINT_2_BACKLOG_INPUT.md` or `PROJECT_CONTEXT.md` while generating the report. Report required changes instead.
