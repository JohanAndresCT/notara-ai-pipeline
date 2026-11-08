# P05 - Software Architecture Design

**Version:** 2.1
**Stage:** P05 - Architecture
**Type:** Generation Prompt
**Project:** Notara
**Release covered:** MVP 2 - Sprint 2 (Audio, Voice and TTS/STT), incremental update of MVP 1
**Previous Stage:** P04 - UX/UI
**Next Stage:** P06 - Implementation

## Change Log

| Version | Change |
|---|---|
| 1.0 | Architecture proposal for MVP 1 before implementation. |
| 2.0 | Incremental mode for MVP 2. The delivered MVP 1 code and deployment are the baseline ("as built"); MVP 2 is designed as an addendum with ADRs for external voice services, audio storage, synchronous processing limits, usage quotas and the ABC reader. External services are allowed only as decided in `DECISIONS_MVP2.md`. |
| 2.1 | Removed state that belonged to a specific run (decision ranges, ID ranges, provisional estimates, open rules). The prompt now refers to the current content of its inputs (`DECISIONS_MVP2.md`, the latest upstream artifacts) so it stays valid when decisions are added. |

## 1. Purpose

Design the smallest maintainable architecture change that lets the delivered Notara system satisfy the MVP 2 requirements (every MVP 2 FR and NFR in the latest `REQUIREMENTS.md`), the plan (P03) and the UX handoff (P04 section 14), and record it as an addendum to the MVP 1 architecture.

The result is a proposal for human review. It does not claim code exists.

## 2. Inputs

```text
ai-pipeline/outputs/02_requirements/REQUIREMENTS.md (latest) and validation
ai-pipeline/outputs/03_planning/PRIORITIZATION.md (latest) and validation (open preconditions)
ai-pipeline/outputs/04_ux/UX_SPEC.md (latest) and validation (handoff needs and findings)
ai-pipeline/outputs/00_context/DECISIONS_MVP2.md
ai-pipeline/outputs/05_architecture/ARCHITECTURE.md (v1.0)
Repository: backend/, frontend/, Dockerfile, docker/, deploy/, .github/workflows/
ai-pipeline/prompts/system/SYSTEM_PROMPT.md
```

The repository is authoritative for the MVP 1 baseline. Where it differs from architecture v1.0, record the as-built state and the deviation.

## 3. Role

Act as a **Senior Software Architect**. You must explain each technical choice (fit, alternatives, trade-offs, approval status), keep authentication, authorization, validation and data ownership server-side, and distinguish FACT, DECISION, PROPOSAL, ASSUMPTION and UNKNOWN.

You must not add product capabilities, add microservices, queues or providers beyond the decisions, invent quantitative targets, assign people or dates, or claim implementation exists.

## 4. Process

1. **As-built baseline:** summarize the delivered stack, modules, API style, storage, deployment, workers and timeouts, and the deviations from v1.0.
2. **Drivers:** extract MVP 2 functional drivers, the UX handoff needs, decisions, NFRs and P03 preconditions that are technical and still open.
3. **Context:** update the system context with the external voice services and trust boundaries.
4. **Decisions:** record ADRs for provider integration, processing model (synchronous vs. asynchronous), audio storage and serving, cache, quotas, ABC reading for solfege/tutor/piano, voice comments, API versioning, runtime and timeouts, configuration and testing.
5. **Components, data, interfaces:** describe new modules, model changes, endpoints, request/response outcomes and error codes that the UX messages need.
6. **Runtime flows:** dictation, voice comment, solfege/tutor with cache, quota and fallback, piano, MP3, comment deletion.
7. **Security, privacy, quality:** secrets, upload validation, protected media, personal data lifecycle, logging, NFR responses with verification evidence.
8. **Deployment:** environment variables, worker model, timeouts, storage persistence, CI behavior.
9. **Conflicts and decisions needed:** report any conflict with upstream artifacts (decisions, UX handoff, requirements) and propose resolutions without applying them silently.
10. **Traceability and P06 handoff:** map FR/NFR/US/FLOW to components and endpoints; order implementation consistent with P03 groups.

## 5. Output

`ai-pipeline/outputs/05_architecture/ARCHITECTURE.md` with: Change Log; Metadata; Executive Summary; MVP 1 As-Built Baseline; MVP 2 Drivers and Boundaries; System Context; Technology Decisions; Logical Components; Data Model; API Boundaries; Runtime Flows; Security and Privacy; Quality Attributes; Deployment and Configuration; ADRs; Conflicts; Risks, Assumptions and Decisions Needed; Traceability; P06 Handoff; Status.

## 6. Status

`READY_FOR_REVIEW`, `READY_WITH_WARNINGS` or `BLOCKED`. State P06 readiness separately.

## 7. Self-review

- Every MVP 2 FR and NFR in the latest requirements has a design response.
- Every P04 handoff need is satisfied or a conflict is reported.
- External services limited to decided ones; keys server-side only.
- Error outcomes allow every UX message in the latest `UX_SPEC.md` catalogue without server errors.
- Personal-data lifecycle (DEC-214) and quotas (DEC-213) are enforced server-side.
- Deployment changes needed (workers, timeouts, env vars, storage) are explicit.
- No quantitative targets invented; unknowns visible.
