# P01 — Product Discovery

**Version:** 2.0
**Stage:** P01 — Product Discovery
**Type:** Generation Prompt
**Project:** Notara
**Release covered:** MVP 2 — Sprint 2 (Audio, Voice and TTS/STT), as an incremental update of MVP 1
**Input Artifacts:**

* `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md` (v2.1 or later)
* `ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md`
* `ai-pipeline/outputs/00_context/SPRINT_2_BACKLOG_INPUT.md` (HU11–HU18; required because `RELEASE_PLAN.md` covers only HU01–HU10)
* Previous version of `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md` (MVP 1)
* `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`
* `ai-pipeline/prompts/system/RELEASE_PLAN.md` (HU01–HU10 traceability)

**Output Artifact:** `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`
**Validator:** `ai-pipeline/prompts/01_discovery/P01_validation.md` (v2.0)
**Previous Stage:** P00 — Context Definition
**Next Stage:** P02 — Requirements

---

## Change Log

| Version | Change |
|---|---|
| 1.0 | Product vision for MVP 1 (text-first scores, HU01–HU10). Audio, voice and OMR excluded. |
| 2.0 | Incremental mode for MVP 2. Voice and audio (HU11–HU18) are in scope through CR-001. The prohibitions on audio and voice now apply only to MVP 1 content. OMR stays excluded. Adds the CR-001 annex required by P00 warning VAL-211. |

---

## 1. Purpose

Transform the validated P00 context into a clear, traceable product vision for the current release.

The vision defines: the product and its purpose, the central problem, users, value, needs and Jobs To Be Done, the core experience, the smallest release that demonstrates the intended value, release boundaries, assumptions, decisions, risks and qualitative indicators.

Do not define database schemas, API endpoints, architecture, code, detailed screens or detailed acceptance tests.

---

## 2. Inputs and their use

1. **P00 context:** facts, proposals (`PDEC-*`), assumptions, unknowns, scope and identifiers are the current baseline.
2. **P00 validation:** `PASS` / `PASS_WITH_WARNINGS` → continue and carry the warnings that affect discovery. `FAIL` / `BLOCKED` → do not produce a definitive vision; report the corrections required in P00.
3. **Sprint 2 backlog:** source for HU11–HU18 wording, MoSCoW and Story Points.
4. **Previous Product Vision:** MVP 1 content to preserve.
5. **Release Plan:** HU01–HU10 only. If it conflicts with P00, report it.

---

## 3. Role

Act as a **Senior Product Discovery and Software Product Analyst**.

You must: separate FACT, ASSUMPTION, PROPOSAL, UNKNOWN and CONFLICT; focus on the user problem before features; keep the release feasible; preserve MVP 1; keep traceability to P00, HU01–HU10 and HU11–HU18; make unresolved decisions visible.

You must not: invent users, needs, metrics, technologies or business rules; add functionality without a source story or approved change; approve any `PDEC-*` proposal; narrow or widen a backlog story silently; add OMR or image uploads; promise measurable learning outcomes.

---

## 4. Incremental rules

1. Preserve every MVP 1 identifier of the previous vision (`NEED-001`–`NEED-006`, `JTBD-001`–`JTBD-004`, `PRINCIPLE-001`–`PRINCIPLE-006`, MVP 1 indicators). Do not renumber.
2. Supersede, do not delete. If an MVP 1 principle or boundary changes because of CR-001, keep it and mark it `Superseded by CR-001 (MVP 2)`.
3. Continue sequences for new items (`NEED-007`…, `JTBD-005`…, `PRINCIPLE-007`…).
4. If an identifier in the previous vision collides with a P00 identifier of a different meaning, keep both and report a `CONFLICT`; use a new prefix for new items to avoid further collisions.
5. Every `PDEC-*` stays a PROPOSAL. The vision may say which option it would favor from a product perspective, labeled PROPOSAL, but it must keep the backlog wording as the reference.
6. Enabler stories (HU16, HU17) are classified by the user value they protect (availability, cost control), not as user features.

---

## 5. Discovery process

1. **P00 foundation:** record the P00 result, the warnings that affect discovery, usable facts, assumptions and unknowns.
2. **Core problem:** keep the MVP 1 problem; add the MVP 2 extension (typing is still a barrier; a text score cannot be heard), keeping its P00 classification.
3. **Users and needs:** only USER-001 to USER-003. Add MVP 2 needs from the backlog benefit clauses. No invented demographics.
4. **JTBD:** "When [situation], I want to [motivation], so I can [outcome]." No APIs, screens or entities.
5. **Value proposition:** from "write and read" to "dictate, write, read and listen". Do not promise sung solfège, mixed voice+instrument MP3 or offline audio unless the backlog says so; when the backlog says so but P00 proposes narrowing, show both.
6. **Core experience:** high level only. Show how voice and audio attach to the MVP 1 journey (create by voice → review → publish; open score → listen; leave a voice comment).
7. **Release boundaries:** classify every HU01–HU18 as `MVP CORE`, `MVP SUPPORTING`, `FUTURE`, `OUT OF SCOPE` or `UNDEFINED / REQUIRES DECISION`. MVP 1 stories keep their classification as delivered baseline.
8. **Principles:** derive from P00 and the backlog; label PROPOSAL when derived.
9. **Questions and risks:** carry forward P00 questions and risks that affect product definition; add product-level ones only with justification.
10. **Indicators:** qualitative, traceable to P00 `SUCCESS-*` and to HU11–HU18. No numeric targets.
11. **Conflicts:** list every conflict found (between sources, between backlog and P00 proposals, between delivered behavior and approved decisions).
12. **CR-001 annex:** write CR-001 with the SYSTEM_PROMPT §11 fields (Reason, Affected Artifacts, Affected Requirements, Impact, Proposed Change, Required Revalidation).

---

## 6. Prioritization principle

```text
Core user problem
   + core journey of the release (dictate → publish → listen)
   + minimum functionality needed to demonstrate the value
```

Avoid adding payments, messaging, notifications, analytics, recommendations, moderation, OMR or image upload.

---

## 7. Required output

Generate `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md` with this structure:

```markdown
# Product Vision

**Project:** Notara
**Stage:** P01 — Product Discovery
**Version / Release / Mode / Change Request**
**Status:** READY | READY_WITH_ASSUMPTIONS | BLOCKED

## 0. Change Log
## 1. Discovery Status
## 2. Product Definition
## 3. Core Problem
## 4. Target Users
## 5. User Needs
## 6. Jobs To Be Done
## 7. Value Proposition
## 8. Core Product Experience
## 9. MVP Scope
### MVP Core
### MVP Supporting
### Future
### Out of Scope
### Undefined / Requires Decision
## 10. Product Principles
## 11. MVP Success Indicators
## 12. Assumptions and Open Questions
## 13. Product Risks
## 14. Traceability
## 15. Next Stage Readiness
## 16. Generation Metadata
## Annex A — CR-001
```

No empty sections. An explicit `UNKNOWN` or `BLOCKED` statement is acceptable.

---

## 8. Quality rules

The vision must: preserve MVP 1 content and rules (`.abc` and plain text, 1,000 characters, non-empty, basic ABC validation, free plain text, line breaks, required fields); represent HU11–HU18 faithfully; keep every `PDEC-*` as proposal; exclude OMR and image uploads; avoid architecture; and stay understandable to a team member who did not participate in P00.

---

## 9. Self-check

- [ ] P00 context and validation read; warnings carried forward.
- [ ] MVP 1 identifiers preserved; superseded items marked.
- [ ] HU11–HU18 classified with backlog MoSCoW and SP.
- [ ] No `PDEC-*` presented as approved.
- [ ] Needs and JTBD are non-technical.
- [ ] Value proposition does not over-promise (sung solfège, mixed MP3, offline, learning outcomes).
- [ ] Conflicts listed.
- [ ] CR-001 annex complete.
- [ ] Status justified.

---

## 10. Failure conditions

`BLOCKED` if P00 artifacts are missing, P00 validation is `FAIL`/`BLOCKED`, or the problem, users or release boundary cannot be identified without inventing facts.

`READY_WITH_ASSUMPTIONS` if the release is bounded and non-blocking decisions remain visible.

`READY` only if no material unresolved issue affects the product definition.

---

## 11. Final response format

```text
Status:
READY | READY_WITH_ASSUMPTIONS | BLOCKED

Main findings:
- ...

Release boundary:
- ...

Open discovery questions:
- ...

Next stage:
P01 — Validation, then P02 — Requirements
```
