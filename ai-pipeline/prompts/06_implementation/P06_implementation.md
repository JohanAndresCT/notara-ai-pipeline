# P06 — Implementation

**Version:** 2.0
**Stage:** P06 — Implementation
**Type:** Generation Prompt
**Project:** Notara
**Release covered:** MVP 2 — Sprint 2 (Audio, Voice and TTS/STT), incremental over the delivered MVP 1
**Validator:** `ai-pipeline/prompts/06_implementation/P06_code_review.md` (v2.0)
**Previous Stage:** P05 — Architecture
**Next Stage:** P07 — Testing

## Change Log

| Version | Change |
|---|---|
| 1.0 | MVP 1: implement the architecture foundation only; stories were implemented afterwards with ad hoc per-story prompts (P06.2-P06.9) recorded in the P06 PROMPT_LOG. Paths used `artifacts/`. |
| 2.0 | Formalizes the two modes used in practice: **Foundation** and **Story increment** (one run per user story, with its own story prompt, implementation record and validation). Paths moved to `outputs/`. Reads the latest P02-P05 artifacts and every decision in `DECISIONS_MVP2.md`; no run-specific state. |

---

## 1. Purpose

Turn the approved requirements, plan, UX and architecture into working, tested code for the current release, one traceable increment at a time, without redesigning the architecture or expanding scope.

## 2. Modes

### 2.1 Foundation mode (P06.1)

Implement only the shared technical foundation the architecture requires before stories can be built (modules, configuration, adapters, persistence, cross-cutting infrastructure). Do not implement story behavior. Output: a section in `IMPLEMENTATION_LOG_MVP2.md`.

### 2.2 Story increment mode (P06.N — one run per story)

Implement one user story end to end (backend, frontend, tests) as specified upstream.

1. **Story prompt.** Create `ai-pipeline/prompts/06_implementation/P06.N_US-0XX_<short_name>.md` stating: the story and its P02 acceptance criteria (canonical IDs), FR/NFR/BR, decisions, P04 flows/states/messages, P05 components/contracts, P03 dependencies, explicit exclusions, required tests and evidence. For MVP 2, `N` is the story number (e.g. `P06.11` for US-011), so prompts, records and validations sort by story.
2. **Implementation.** Change only what the story needs, following existing repository conventions and the decided architecture.
3. **Verification.** Run what applies: backend tests, typecheck, build, browser checks at the NFR widths, and real-device checks when the story needs hardware (e.g. microphone). Record what was not run and why.
4. **Implementation record.** Write `ai-pipeline/outputs/06_implementation/US-0XX_<NAME>_IMPLEMENTATION.md` (structure in section 5).
5. **Log.** Add a section to `IMPLEMENTATION_LOG_MVP2.md` and an entry to the P06 `PROMPT_LOG.md`.
6. **Validation.** Run `P06_code_review.md` in story mode, which writes `US-0XX_<NAME>_VALIDATION.md`.

A story may be split across contributors (e.g. backend and frontend); the record covers the whole story and names each part's evidence.

## 3. Inputs (latest versions)

```text
ai-pipeline/outputs/00_context/DECISIONS_MVP2.md (all DEC-2NN, CRs)
ai-pipeline/outputs/02_requirements/REQUIREMENTS.md, product_backlog.json
ai-pipeline/outputs/03_planning/PRIORITIZATION.md, product_backlog.json (priority, group, dependencies, preconditions)
ai-pipeline/outputs/04_ux/UX_SPEC.md (flows, states, message catalogue, accessibility)
ai-pipeline/outputs/05_architecture/ARCHITECTURE.md (ADRs, components, endpoints, error codes)
ai-pipeline/outputs/06_implementation/IMPLEMENTATION_LOG_MVP2.md
docs/ (API contracts such as docs/API_STT_HU11.md, SETUP.md)
Repository source code
ai-pipeline/prompts/system/SYSTEM_PROMPT.md
```

Before starting a story, check its P03 preconditions. If a precondition blocks it, stop and report instead of implementing around it.

## 4. Rules

- **Traceability:** every code change maps to an FR, AC, BR, decision, flow or ADR; record the mapping.
- **No scope creep:** implement only the story's approved behavior. If upstream artifacts conflict with the delivered code or with each other, implement the safest compliant subset and record the conflict as a finding for the team.
- **Conventions:** reuse existing patterns (function views and `{"code", "message", "errors"}` error shape, `lib/api.ts` client, CSS tokens in `index.css`, same-origin session + CSRF).
- **Security and privacy:** server-side validation and authorization; no secrets in code or client; respect DEC-214 retention and logging rules.
- **Messages:** use the exact copy of the P04 message catalogue; label any new copy as UX-PROP in the record.
- **Accessibility and responsive:** follow P04 section 9 (keyboard, live regions, visible explanations for disabled controls, 360/768/1280 px).
- **Dependencies:** add only those decided in P05/DECISIONS; pin versions.
- **Honesty:** never mark a criterion PASS without evidence; distinguish IMPLEMENTED, PARTIAL, NOT_VERIFIED and BLOCKED.

## 5. Story implementation record — structure

```markdown
# P06.N US-0XX <Title> Implementation Record
## 1. Metadata (story, HU, priority/SP, branch/commits, contributors, prompt, date, status)
## 2. Summary
## 3. Traceability (AC / FR / BR / DEC / FLOW / ADR → code)
## 4. Implemented Components (file, change)
## 5. API and Data Behavior
## 6. Database and Migrations
## 7. Verification Results (command/check, result, evidence)
## 8. Scope Boundary, Deviations and Open Items
## 9. Definition of Done (item, status, evidence/remaining action)
## 10. Final Status (IMPLEMENTED | IMPLEMENTED_WITH_GAPS | PARTIAL | BLOCKED)
```

## 6. Status

- `IMPLEMENTED`: all story ACs implemented and verified.
- `IMPLEMENTED_WITH_GAPS`: implemented; some checks or acceptance gates not yet run (listed).
- `PARTIAL`: part of the story implemented (e.g. backend only).
- `BLOCKED`: a precondition or conflict prevents implementation.

## 7. Self-check

- [ ] Story prompt created and logged.
- [ ] Preconditions checked.
- [ ] Every AC mapped to code or marked not implemented with a reason.
- [ ] Message copy matches P04.
- [ ] Tests/typecheck/build run; unrun checks listed.
- [ ] Record, implementation log and PROMPT_LOG updated.
- [ ] Ready for `P06_code_review.md`.
