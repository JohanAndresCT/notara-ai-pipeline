# P04 UX Design Validation Report

## 1. Validation Metadata

- **Validator:** P04 - UX Design Validation Prompt v2.0 (Senior UX Validation Auditor)
- **Project:** Notara
- **Release:** MVP 2 - Sprint 2 (Audio, Voice and TTS/STT)
- **UX Specification Version:** 2.0
- **Validation Date:** 2026-11-08
- **Upstream Statuses:** P02 `PASS_WITH_WARNINGS`; P03 `PASS_WITH_WARNINGS` (P04 readiness WITH CONSTRAINTS)
- **Overall Result:** `PASS_WITH_WARNINGS`
- **P05 Readiness:** WITH CONSTRAINTS

> The MVP 1 validation report (UX v1.0, result `PASS`) is preserved in Git history.

## 2. Executive Summary

The specification covers HU01-HU19 and keeps the MVP 1 experience. It adds the MVP 2 behavior inside the existing screens, with eight regions and two confirmation dialogs, and no new navigation. For every asynchronous audio action it defines the full set of states, a 21-entry message catalogue, and accessibility and responsive rules. It respects every decision that affects the UI: Spanish only, 30 s / 2 MB, the notice before recording, `.abc`-only listening with the exact DEC-207 message, the 20-per-day limit, the silent fallback, the voice-only MP3, local file reading and comment deletion by the author.

Automated checks found every FR-001-FR-044 and AC-001-AC-069 referenced, with no undefined or unused message IDs.

**No CRITICAL or HIGH findings.**

**One MEDIUM finding:** the dictation UX depends on rules that are still proposals.

**Four LOW findings:**
- seven UX proposals need approval, one of which changes delivered behavior;
- no cancel or timeout behavior is defined for long processing;
- the AC references of version 1.0 were corrected;
- the provider-naming question.

## 3. Input Readiness

| Input | Present | Status | Notes |
|---|---|---|---|
| `REQUIREMENTS.md` v3.0 / validation | Yes | PASS_WITH_WARNINGS | REQ-VAL-201 carried as UX-Q-001 |
| `PRIORITIZATION.md` v2.0 / validation | Yes | PASS_WITH_WARNINGS | P0 journeys designed first, as requested |
| `PRODUCT_VISION.md` v2.2 | Yes | PASS_WITH_WARNINGS | Journeys A, A', B, C, D mapped to FLOW-011-FLOW-019 |
| `DECISIONS_MVP2.md` | Yes | Team input | DEC-201-DEC-218 |
| `UX_SPEC.md` v1.0 | Yes (Git) | PASS | MVP 1 baseline |
| Repository UI (`frontend/src`) | Yes | — | Checked: comment deletion exists without confirmation; `role="alert"` already used; DEFECT-001 confirmed |

## 4. Structural Validation

| Section | Present | Valid | Notes |
|---|---|---|---|
| 0 Change Log | Yes | Yes | |
| 1 Metadata | Yes | Yes | |
| 2 Objective and Boundary | Yes | Yes | |
| 3 Users and Access | Yes | Yes | |
| 4 Requirement UX Classification | Yes | Yes | MVP 1 and MVP 2 |
| 5 Information Architecture (screens, regions, navigation, access) | Yes | Yes | SCR-010, SCR-011, REG-001-REG-008 |
| 6 Core User Flows | Yes | Yes | FLOW-001-FLOW-019 (19 unique) |
| 7 Screen and Interaction Specs incl. Interaction States | Yes | Yes | |
| 8 Cross-Cutting Rules | Yes | Yes | |
| 9 Responsive, Readability, Accessibility | Yes | Yes | |
| 10 Message Catalogue | Yes | Yes | 21 entries |
| 11 Exclusions | Yes | Yes | |
| 12 Proposals, Assumptions, Questions | Yes | Yes | UX-PROP-001-007, UX-Q-001-003 |
| 13 Coverage Matrix | Yes | Yes | |
| 14 P05 Handoff | Yes | Yes | |
| 15 Status | Yes | Yes | |

## 5. Requirement UX Classification

**PASS.**
- **User-facing:** FR-018-FR-037, FR-042 and FR-044 are USER_FACING.
- **Supporting and non-UX:**
  - FR-025 and FR-043 are UX_SUPPORTING;
  - FR-038, FR-039 and FR-041 are NON_UX, correctly, since the store and the silent fallback have no UI;
  - FR-040 is NON_UX with a UX constraint (M-15).
- **NFRs:** NFR-004, NFR-005, NFR-007 and NFR-008 are UX constraints. NFR-009 is REQUIRES_DECISION, and the spec avoids inventing durations.

## 6. Flow Coverage

| HU | Flow | Main / Alternatives / Errors | ACs reachable | Result |
|---|---|---|---|---|
| HU10 (amended) | FLOW-010 | Yes | AC-026-AC-029 | PASS |
| HU11 | FLOW-011, FLOW-018 | Yes (6 error/alternative cases) | AC-030-AC-036 | PASS_WITH_WARNINGS (UX-VAL-201) |
| HU12 | FLOW-013, FLOW-018 | Yes | AC-037-AC-042 | PASS |
| HU13 | FLOW-014 | Yes | AC-043-AC-048 | PASS |
| HU14 | FLOW-015 | Yes | AC-049-AC-051 | PASS |
| HU15 | FLOW-016 | Yes | AC-052-AC-054 | PASS |
| HU16, HU17 | FLOW-019 | Behavior only | AC-055-AC-063 observable as "audio or M-15" | PASS |
| HU18 | FLOW-017 | Yes | AC-064-AC-065 | PASS |
| HU19 | FLOW-012 | Yes | AC-066-AC-069 | PASS |
| HU01-HU09 | FLOW-001-FLOW-009 | Preserved | AC-001-AC-025 | PASS |

## 7. States, Messages and Decisions

**States:** PASS. Section 7.2 defines idle, permission, active, processing, success, error and disabled states for all eight MVP 2 actions.

**Messages:** PASS.
- Backlog and decision copy is reproduced exactly: M-01 "No se pudo interpretar el dictado musical" (AC-011-03) and M-02 "Disponible solo para partituras en ABC" (DEC-207).
- All other copy is labeled UX-PROP.
- Every message ID used in the flows is defined, and every defined message is used.

**Decisions:**

| Decision | Reflected | Result |
|---|---|---|
| DEC-203 piano in browser | FLOW-016 has no network wait and no limit check | PASS |
| DEC-204 voice-only MP3 | FLOW-017 | PASS |
| DEC-205 vocabulary shown | REG-008 | PASS (content provisional) |
| DEC-207 `.abc` only + message | REG-003 disabled with M-02; M-03 | PASS |
| DEC-211 comment deletion | FLOW-010, REG-007 | PASS |
| DEC-213 limits | Countdown, M-05/M-05b, M-10 | PASS |
| DEC-214 notice, no dictation recordings kept | M-11, NFR-004 rule | PASS |
| DEC-215 Spanish | Cross-cutting rule | PASS |
| DEC-216 silent fallback | FLOW-019, cross-cutting rule | PASS |
| DEC-217 local file reading | FLOW-012; P05 handoff item 5 | PASS |
| DEC-218 MVP 1 rules on new content | FLOW-011 step 6, FLOW-012 step 5 | PASS |

## 8. Screens, Navigation, Accessibility and Responsive Review

**PASS.**
- **Navigation and placement:** no new top-level navigation. The regions sit in logical places, with listening under the score content and recording next to the content field and the comment input.
- **Ownership and access:** the voice composer is hidden on the user's own score, and the delete action is hidden on others' comments.
- **DEFECT-001:** the placeholder correction is specified in section 7.3.
- **Accessibility:** keyboard operation, live announcements consistent with the existing `role="alert"` usage, text countdown, associated explanations for disabled controls, and transcription and tutor text as alternatives to audio.
- **Responsive:** the 360 px behavior is defined for REG-003, the recording controls and the dialogs.

## 9. Scope, Traceability and Boundary Review

**PASS.**
- **Exclusions:** none of them is designed. Section 11 also excludes voice selection, language selection and a recordings list.
- **Boundary:** no framework, component library, visual tokens, endpoint or storage design. The P05 handoff states needs, not solutions.
- **Coverage matrix:** complete.
- **MVP 1 corrections:** recorded, namely the AC references of FLOW-008-FLOW-010 and the comment-deletion amendment.

## 10. Findings

| ID | Severity | Category | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|
| UX-VAL-201 | MEDIUM | Upstream dependency | The vocabulary help (REG-008) and insertion behavior (empty field → full ABC; otherwise append) of FLOW-011 depend on PROPOSAL rules BR-013 and BR-025. | UX_SPEC FLOW-011, UX-Q-001; P02 REQ-VAL-201; P03 PRE-002 | Approve BR-013/BR-025 (PRE-002) before P06 implements US-011; update REG-008 copy if the vocabulary changes. |
| UX-VAL-202 | LOW | Proposals | Seven UX-PROP items need approval. UX-PROP-006 (confirm before deleting a comment) changes delivered MVP 1 behavior, which deletes immediately. | Section 12; `frontend/src/ScoreDetailPage.tsx` `handleCommentDelete` | Approve UX-PROP-001-007 with the team; treat UX-PROP-006 as an explicit change to US-010 behavior in P06. |
| UX-VAL-203 | LOW | Interaction gap | Processing states have no cancel option or timeout behavior. With no latency target (NFR-009), a long wait has no defined exit. | Section 7.2; NFR-009 REQUIRES_DECISION | Define a timeout leading to M-07/M-15 in P05 once Q-012 is answered; consider a "Cancelar" during processing. |
| UX-VAL-204 | LOW | MVP 1 correction | Version 1.0 cited wrong AC ranges for FLOW-008-FLOW-010; v1.0 validation did not detect it. | v1.0 FLOW-008-FLOW-010; v2.0 corrections | Resolved in v2.0; recorded for traceability. |
| UX-VAL-205 | LOW | Wording | Whether M-11 names the provider (OpenAI) is open (UX-Q-002). | Section 10, UX-Q-002 | Team decision; no impact on architecture. |

## 11. P05 Readiness

- **Ready to proceed:** WITH CONSTRAINTS
- **Constraints:** P05 must satisfy the six handoff needs (section 14 of the spec): typed outcomes for transcription and synthesis, MP3 retrieval, voice comments as one deletable entity, local-only file loading and piano playback, and deletion compatible with confirmation. It must also define timeout behavior (UX-VAL-203).
- **Blocking items:** none for P05. PRE-002 must close before P06 builds US-011.

## 12. Final Decision

**`PASS_WITH_WARNINGS`.** The UX specification may proceed to P05 - Architecture. Track UX-VAL-201 to UX-VAL-205 and the UX-PROP approvals.

## Addendum — Run 2 (UX v2.1, prompt v2.1)

**Date:** 2026-11-08 · **Trigger:** decisions DEC-219-DEC-229 and requirements v3.1 · **Validator prompt:** `P04_validation.md` v2.1

**Result:** `PASS_WITH_WARNINGS` (0 HIGH, 0 MEDIUM, 1 LOW) · **P05 readiness:** YES

### Automated checks

| Check | Result |
|---|---|
| Every FR, NFR and AC of requirements v3.1 referenced | Yes (including FR-045, FR-046, AC-070-AC-072) |
| Messages defined and used | All; new M-17 defined and used in FLOW-011 and FLOW-013 |
| UX proposals approved | All seven (DEC-225) |
| UX open questions | None (UX-Q-001-003 resolved by DEC-229, DEC-226, DEC-227) |
| M-11 names the provider | Yes (DEC-226) |
| Tutor content | Clef, meter, estimated difficulty, plus key and tempo when defined (DEC-227) |

### Status of run 1 findings

| ID | Status |
|---|---|
| UX-VAL-201 (MEDIUM) | **Resolved** — dictation rules approved (DEC-229). |
| UX-VAL-202 (LOW) | **Resolved** — UX proposals approved (DEC-225). Note for P06: UX-PROP-006 adds a confirmation to the comment deletion already delivered in MVP 1. |
| UX-VAL-203 (LOW) | **Partially resolved** — initial timeouts set (DEC-221) and mapped to M-07/M-15; no "Cancelar" option during processing is defined. Remains LOW. |
| UX-VAL-204 (LOW) | Resolved earlier. |
| UX-VAL-205 (LOW) | **Resolved** — DEC-226. |
