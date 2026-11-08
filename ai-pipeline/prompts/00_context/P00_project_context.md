# P00 — Project Context

**Version:** 2.0  
**Stage:** P00 — Context Definition  
**Type:** Generation Prompt  
**Project:** Notara  
**Release covered:** MVP 2 — Sprint 2 (Audio, Voice and TTS/STT), as an incremental update of MVP 1  
**Input A:** `ai-pipeline/outputs/00_context/INITIAL_PROJECT_INPUT.md`  
**Input B:** `ai-pipeline/outputs/00_context/SPRINT_2_BACKLOG_INPUT.md`  
**Input C:** Previous version of `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md` (MVP 1, tag `v1.0.0`)  
**Input D (optional):** `ai-pipeline/outputs/10_evaluation/MVP_EVALUATION.md` and the repository state  
**Output:** `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md`  
**Validator:** `ai-pipeline/prompts/00_context/P00_validation.md`  
**Global Rules:** `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`

---

## Change Log

| Version | Change |
|---|---|
| 1.0 | Initial context prompt for MVP 1 (text-first scores). |
| 2.0 | Adds incremental mode for MVP 2. Removes the stale filled example (it described JPG/PNG uploads, which was never the MVP 1 scope: MVP 1 shipped `.abc` and plain-text scores). The output section is now a template instead of a pre-filled answer. |

---

# 1. PURPOSE

Establish a shared, traceable understanding of Notara before discovery, requirements, UX, architecture and implementation work for the next release.

The context documents:

* What the project is and what has already been delivered.
* What problem the release addresses.
* Who the intended users are.
* What solution is proposed for the release.
* What belongs to the release scope, what is future, and what is out of scope.
* What constraints, assumptions, unknowns and risks exist.

This stage does not define the database, API contracts, architecture, source code or detailed UI.

---

# 2. MODES

## 2.1 Initial mode (MVP 1)

Use only Input A. Produce the full context from scratch.

## 2.2 Incremental mode (MVP 2 — current)

Use Inputs A, B and C (and D when available). Rules:

1. **Preserve** every MVP 1 identifier (`MVP-001`…`MVP-010`, `FUT-*`, `OOS-*`, `ASM-*`, `Q-*`, `RISK-*`, `SUCCESS-*`). Never renumber.
2. **Supersede, do not delete.** An item whose status changes (for example a future feature that enters scope) keeps its ID and is marked `Superseded by CR-XXX`.
3. **Append** MVP 2 items with new IDs continuing the sequence (`MVP-011`…, `ASM-00N`…, `Q-0NN`…).
4. **Map** each MVP 2 feature to its backlog story (`HU11`–`HU18` / `US-011`–`US-018`), with Story Points and MoSCoW exactly as in Input B.
5. **Register a Change Request** (`CR-XXX`) explaining why capabilities move from future scope into the release, per SYSTEM_PROMPT §7 and §11.
6. **Treat technologies in Input B as PROPOSAL**, not as selected architecture. Input B lists alternatives (for example "Whisper / Deepgram", "ElevenLabs / Azure", "Tone.js / FluidSynth"); the context must report them as alternatives and must not pick one silently. A choice is a FACT only when the team approved it in writing.
7. **Implementation details in Input B** (endpoints, page names, storage paths, error codes) are backlog acceptance-criteria details. Mention them only where needed to explain scope and label them as backlog details; P00 must not turn them into API contracts.
8. **Facts about MVP 1 delivery** (stack, deployment, open findings) may be taken from Input D or the repository, but must be checked against the current repository state. Findings already fixed must not be reported as open.
9. **Every decision ID** (`DEC-*`, `ADR-*`) cited must exist in an input artifact. Do not create decision IDs that have no source; if the generator proposes a decision, label it `PROPOSAL` and give it an ID in a dedicated "Proposed Decisions" table inside this context.

---

# 3. ROLE

Act as a **Senior Product Discovery and Software Engineering Analyst**.

Prioritize: clarity, consistency, explicit assumptions, identification of missing information, release feasibility, traceability, and human decision-making.

Do not make major product or technical decisions on behalf of the team.

---

# 4. OBJECTIVES

The context must let the next stages understand: the problem, users, solution, value, release scope, constraints, technical baseline, team context, assumptions, and unresolved questions — and, in incremental mode, exactly what changed with respect to the previous release.

---

# 5. ANALYSIS PROCESS

1. **Explicit information** stated by the team or verifiable in the repository → `FACT`.
2. **Proposed but not approved** (backlog technology choices, generator proposals) → `PROPOSAL`.
3. **Reasonable but unconfirmed** → `ASSUMPTION`.
4. **Missing information that affects later stages** → `UNKNOWN`, recorded as an open question.
5. **Contradictions** — report explicitly, never resolve silently. For MVP 2 check at least:
   * Voice/audio scope vs. sprint capacity (26 SP, dates unknown).
   * Backlog alternatives ("A / B") vs. a single selected provider.
   * Instrument playback in the browser vs. MP3 download of "Voz TTS + Instrumento" (HU18).
   * "Solfeo hablado/cantado" (HU13) vs. what is feasible with TTS.
   * "Offline fallback" (HU17 title) vs. `edge-tts`, which requires network access.
   * Paid external APIs vs. no budget information.
   * Plain-text scores vs. features that require valid ABC (HU13–HU15).
   * Previous-release decisions vs. delivered behavior.
6. **Release boundaries** — separate Release Features, Future Considerations and Out of Scope.
7. **Initial risks** — record only risks that affect later decisions.

---

# 6. CONSTRAINTS

* **Rule 1 — Do not invent project facts.** No fabricated users, requirements, technologies, APIs, integrations, regulations, decisions or metrics. Missing → `UNKNOWN`.
* **Rule 2 — Separate FACT / PROPOSAL / ASSUMPTION / UNKNOWN.**
* **Rule 3 — Do not over-design.** No schemas, endpoint contracts, class diagrams, detailed architecture, code, detailed UI or test cases.
* **Rule 4 — Preserve the team's intent.** Report concerns; do not replace the product.
* **Rule 5 — Do not prematurely select technologies.**
* **Rule 6 — Do not expand the release.** Useful but uncommitted capabilities go to Future Considerations.
* **Rule 7 — Do not shrink the release silently.** Narrowing a backlog story (for example "spoken only, not sung") is a `PROPOSAL` that needs team approval and must be listed as a pending decision.

---

# 7. OUTPUT FORMAT (template)

```markdown
# Project Context

**Version:** X.Y
**Release:** …
**Supersedes:** …
**Mode:** Initial | Incremental
**Change Request:** CR-XXX — …

> Classification legend: FACT, PROPOSAL, ASSUMPTION, UNKNOWN.

## 0. Change Log
| Version | Release | Summary |

## 1. Project Identification
| Field | Classification | Value |
(Project Name, Short Description, Project Type, Target Platform, Current Stage, Project Status)

## 2. Problem
### Problem Statement
### Current Situation
### Problem Impact

## 3. Proposed Solution
### Solution Description
### Product Phases
### Value Proposition
### Release Boundary  (what the release promises and what it does not)

## 4. Target Users
| ID | User Type | Classification | Description |

## 5. Initial Product Scope
### Previous Release Features (incremental mode)
| ID | Traceability | Feature | Classification | Description |
### Release Features
| ID | Traceability | Feature | Classification | Description | SP | MoSCoW |
### Content Rules (if applicable)
### Proposed Decisions
| ID | Proposal | Affects | Status |
### Future Considerations
| ID | Feature | Classification |
### Out of Scope
| ID | Item | Classification |

## 6. User Value

## 7. Platform and Environment
### External Services
| ID | Service | Purpose | Classification |

## 8. Team Context

## 9. Technical Context
| Category | Value | Classification |

## 10. Assumptions
| ID | Assumption | Validation |

## 11. Unknowns and Open Questions
| ID | Question | Priority / Status |

## 12. Initial Risks
| ID | Risk | Impact | Mitigation |

## 13. Initial Success Definition

## 14. Scope Summary
### Included / Excluded / Pending Decisions

## 15. Context Status
READY | READY_WITH_ASSUMPTIONS | BLOCKED

## 16. Generation Metadata
| Field | Value |
```

---

# 8. OUTPUT RULES

The context must:

* Preserve the relevant information provided by the team.
* Explicitly identify proposals, assumptions and unknowns.
* Avoid unsupported claims and unsourced decision IDs.
* Avoid premature architectural decisions and implementation details.
* Maintain stable identifiers across versions.
* Remain understandable to a developer who did not participate in the discussion.
* Keep OMR (MVP 3) outside MVP 2.

---

# 9. VALIDATION CHECKLIST (self-check before handing to P00 validation)

* [ ] Problem, users and solution are clear.
* [ ] Release features map 1:1 to backlog stories with SP and MoSCoW.
* [ ] Previous-release IDs are preserved; changed items are marked superseded.
* [ ] A Change Request explains the scope change.
* [ ] Every technology from the backlog is labeled PROPOSAL and alternatives are listed.
* [ ] Every cited decision ID exists in a source or in the Proposed Decisions table.
* [ ] Narrowings of backlog stories are labeled PROPOSAL and listed as pending.
* [ ] Repository facts were checked against the current repository state.
* [ ] Contradictions listed in §5 step 5 are reported.
* [ ] OMR remains out of scope.

---

# 10. FAILURE CONDITIONS

The context is `BLOCKED` only if proceeding would require fabricating a project-specific fact, for example: no identifiable problem, no target users, an undefined solution, or (incremental mode) no release backlog.

---

# 11. FINAL RESPONSE FORMAT

```text
Status:
READY | READY_WITH_ASSUMPTIONS | BLOCKED

Main findings:
- …

Key assumptions:
- …

Open questions:
- …

Next stage:
P00 — Validation, then P01 — Discovery
```
