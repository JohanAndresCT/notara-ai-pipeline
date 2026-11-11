# P01 — Product Discovery Validation

**Version:** 2.0
**Stage:** P01 — Product Discovery
**Type:** Validation Prompt
**Project:** Notara
**Release:** MVP 2 — Sprint 2 (Audio, Voice and TTS/STT), incremental
**Input Artifact A:** `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md`
**Input Artifact B:** `ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md`
**Input Artifact C:** `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md` (artifact under validation)
**Input Artifact D:** `ai-pipeline/outputs/00_context/SPRINT_2_BACKLOG_INPUT.md`
**Optional Inputs:** previous Product Vision (MVP 1, Git history), `ai-pipeline/prompts/system/RELEASE_PLAN.md`
**Global Rules:** `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`
**Output Artifact:** `ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md`
**Next Stage:** P02 — Requirements

---

## Change Log

| Version | Change |
|---|---|
| 1.0 | Validation of the MVP 1 vision; audio, voice and OMR had to be excluded. |
| 2.0 | Incremental validation for MVP 2: checks HU11–HU18 coverage, preservation of MVP 1 identifiers, PROPOSAL status of `PDEC-*`, fidelity to backlog wording, conflict reporting and the CR-001 annex. Audio and voice are valid MVP 2 scope; OMR and image uploads remain excluded. File re-encoded as UTF-8. |

---

## 1. Purpose

Validate that `PRODUCT_VISION.md` faithfully transforms the validated P00 context (v2.1) and the Sprint 2 backlog into a bounded, traceable product vision, preserving MVP 1, without inventing information or specifying the solution.

Do not add requirements, resolve decisions silently or modify the vision while validating it.

## 2. Role

Act as a **Senior Product Discovery Auditor and Software Product Process Validator**. You are not authorized to add requirements, change the release, select technologies, invent users or metrics, convert proposals into facts or resolve conflicts silently.

## 3. Validation rules

### 3.1 Inputs and status
* All required inputs exist; otherwise `BLOCKED`.
* The vision status is consistent with the P00 result and carries P00 warnings that affect discovery (VAL-211, VAL-212).

### 3.2 Structure
Sections 0–16 and Annex A exist; MVP Scope contains Core, Supporting, Future, Out of Scope and Undefined / Requires Decision.

### 3.3 Incremental integrity
* MVP 1 identifiers of the previous vision are preserved and not renumbered.
* Items changed by CR-001 are marked superseded.
* ID collisions with P00 are reported as CONFLICT.

### 3.4 Problem, users, needs, JTBD
* Only USER-001–USER-003; no invented demographics; no role management (HU16/HU17 are enablers).
* MVP 2 needs and JTBD trace to HU11–HU18 benefit clauses; they are product-level, not technical.

### 3.5 Value proposition
* May promise dictation, voice comments, listening (solfège, tutor, instrument) and MP3 download, because HU11–HU18 are in scope.
* Must not promise sung solfège, mixed voice+instrument MP3 or offline audio as settled facts while PDEC-204/PDEC-206 are pending, nor measurable learning outcomes, adoption or performance.
* Must not include OMR or image uploads.

### 3.6 Core experience
High level; MVP 1 journey preserved; voice and audio attached to it; no screens, APIs or storage design.

### 3.7 MVP 1 text rules
`.abc` and plain text; 1,000 characters; non-empty; basic ABC validation; free plain text; line breaks and format shown; title, instrument, content and description required.

### 3.8 Release scope
* HU01–HU10 classified as delivered baseline.
* HU11–HU18 each classified; MoSCoW and SP match the backlog; Core vs. Supporting justified.
* Every `PDEC-*` appears as UNDEFINED / REQUIRES DECISION or PROPOSAL, never as approved.
* Scope creep: classify any capability not in P00 or the backlog as SUPPORTED, ASSUMPTION, PROPOSAL, UNSUPPORTED or CONTRADICTORY.

### 3.9 Principles, indicators, questions, risks, conflicts
* Principles derived and labeled PROPOSAL; superseded MVP 1 principles marked.
* Indicators qualitative and traceable to P00 `SUCCESS-008`–`SUCCESS-015`.
* Open questions carry P00 Q-007–Q-018 that affect discovery.
* Risks carry P00 product risks (scope, external dependency, dictation quality, personal data, cost).
* Conflicts between sources are listed, not resolved.

### 3.10 CR-001 annex
Contains Reason, Affected Artifacts, Affected Requirements, Impact, Proposed Change, Required Revalidation (SYSTEM_PROMPT §11), consistent with P00.

### 3.11 Traceability and readiness
Traceability table `| Product Vision Element | Source Identifier | Source Artifact | Classification | Status |` covers users, needs, HU01–HU18, principles, indicators and conflicts. P02 readiness is justified.

## 4. Severity

* **CRITICAL** — missing input; no problem, users or release boundary.
* **HIGH** — unsupported feature; a PDEC presented as approved; backlog story narrowed or widened silently; OMR/image included; MVP 1 rules lost.
* **MEDIUM** — traceability gaps, missing questions or risks, over-broad value statement, incomplete CR annex.
* **LOW** — wording, duplication, classification or formatting.

## 5. Decision

Exactly one of `PASS`, `PASS_WITH_WARNINGS`, `FAIL`, `BLOCKED`.

```text
IF critical issue exists                               → BLOCKED or FAIL
ELSE IF high issue prevents reliable requirements work → FAIL
ELSE IF non-blocking issues remain                     → PASS_WITH_WARNINGS
ELSE                                                   → PASS
```

## 6. Output

Write `ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md`:

```markdown
# P01 — Product Discovery Validation Report

**Project:** Notara
**Release:** MVP 2 — Sprint 2
**Input Artifact / P00 Context / P00 Validation / Backlog**
**Validator Role:** Senior Product Discovery Auditor and Software Product Process Validator

## 1. Overall Result
## 2. Executive Summary
## 3. Structural Validation
## 4. Section-by-Section Findings
## 5. Scope and Traceability Audit
## 6. Findings
| ID | Severity | Finding | Evidence | Recommendation |
## 7. Context and Discovery Status Assessment
## 8. P02 Readiness
## 9. Required Actions
## 10. Validation Metadata
```

Finding IDs: `DISC-VAL-2NN`. Do not modify the vision, P00 artifacts, the backlog or `RELEASE_PLAN.md`.

## 7. Final response format

```text
Status: PASS | PASS_WITH_WARNINGS | FAIL | BLOCKED
Main findings: ...
Blocking issues: None | ...
P02 readiness: READY | READY_WITH_ASSUMPTIONS | NOT_READY
Required actions: ...
Next stage: P02 — Requirements
```
