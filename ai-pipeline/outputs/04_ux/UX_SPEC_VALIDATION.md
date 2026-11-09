# P04 UX Design Validation Report

## 1. Validation Metadata

- **Validator:** P04 - UX Design Validation Prompt v2.0 (Senior UX Validation Auditor)
- **Project:** Notara
- **Release:** MVP 2 - Sprint 2 (Audio, Voice and TTS/STT)
- **UX Specification Version:** 4.0 (CR-003 and HU11 authorization addenda below; original run preserved)
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
| `REQUIREMENTS.md` v4.0 / validation | Yes | PASS_WITH_WARNINGS | REQ-VAL-201 carried as UX-Q-001; CR-003 notice/retention reflected |
| `PRIORITIZATION.md` v3.0 / validation | Yes | PASS_WITH_WARNINGS | P0 journeys designed first; CR-003 local-STT gates reflected |
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
| DEC-214/CR-003 notice, no dictation recordings kept | M-11 discloses Notara backend and hosting infrastructure; NFR-004 | PASS_WITH_WARNINGS — copy aligned; legal/privacy review remains |
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
| UX-VAL-205 | LOW | Wording | The original v2.0 report left OpenAI/provider wording unresolved (UX-Q-002). | Section 10, UX-Q-002 | Resolved in the CR-003 revalidation addendum; hosting/privacy review remains. |

## 11. P05 Readiness

- **Ready to proceed:** WITH CONSTRAINTS
- **Constraints:** P05 must satisfy the six handoff needs (section 14 of the spec): typed outcomes for transcription and synthesis, MP3 retrieval, voice comments as one deletable entity, local-only file loading and piano playback, and deletion compatible with confirmation. It must also define timeout behavior (UX-VAL-203).
- **Blocking items:** none for P05. PRE-002 must close before P06 builds US-011.

## 12. Final Decision

**`PASS_WITH_WARNINGS`.** The UX specification may proceed to P05 - Architecture. Track UX-VAL-201 to UX-VAL-205 and the UX-PROP approvals.

## 13. CR-003 Revalidation Addendum

- **Approval record:** CR-003 and the DEC-201 amendment are approved as reported by the requester; no approval date or individual approver names were supplied.
- **UX update:** UX_SPEC v3.0 updates M-11 for separate dictation and voice-comment retention, discloses upload to Notara's backend and hosting-provider processing, and does not promise on-device processing. Existing flows, route assumptions, recording limits and error states remain unchanged.
- **Question status:** UX-Q-002 is resolved by CR-003. The initial UX-VAL-205 provider-wording finding is closed by this wording; review by the privacy/legal owner is still required. UX-VAL-201 and UX-PROP approvals remain open.
- **Current result:** `PASS_WITH_WARNINGS`; privacy wording matches amended DEC-214, while hosting-provider terms and applicable privacy obligations remain to be reviewed. No UI was implemented or tested in this documentation change.

## 14. HU11 Authorization Revalidation Addendum

- **Inputs:** UX_SPEC v4.0, P02 v5.0, P03 v4.0 and the requester-reported HU11 authorization recorded in `DECISIONS_MVP2.md`.
- **UX updates:** FLOW-011 now reflects approved BR-013/BR-025 behavior and the `STT_DAILY_LIMIT_REACHED` response; M-17 displays the configurable daily transcription limit. The supported vocabulary/help and existing M-11 privacy disclosure remain aligned.
- **Decision status:** UX-Q-001 is resolved for HU11. UX-Q-004 / P02 Q-029 tracks malformed or present-but-empty ABC headers in existing content; it blocks only that append edge path. Q-026 remains scoped to HU12 and does not block HU11.
- **Traceability:** FLOW-011/FLOW-013 and M-17 cover the shared quota through FR-045, AC-070-076 and DEC-219. No frontend or UI behavior was implemented or browser-tested.
- **Acceptance:** quality, p95, memory and concurrency values are approved targets only; no empirical test result is claimed. The 25 s completion/error ceiling remains pending explicit approval.
- **Result:** `PASS_WITH_WARNINGS`; no UX contradiction was found for the approved HU11 flow, subject to the populated-field edge clarification and empirical acceptance tests.

## 15. CR-004 Revalidation Addendum

- **Date:** 2026-11-09
- **UX Specification Version:** 4.2
- **Requirements Version:** 5.2
- **Planning Version:** 4.2
- **Change Request:** CR-004 (APPROVED FOR IMPLEMENTATION BY REQUESTER)
- **Affected Stories:** US-011 (HU11), US-012 (HU12)
- **Result:** `PASS_WITH_WARNINGS` - documentation alignment only
- **Production Authorization:** NOT GRANTED

### Documentation review

- CR-004 authorizes implementing Whisper Base instead of Whisper Tiny.
- Authorization is from the requester; other team approval is not established.
- Existing recording and voice-comment flows remain applicable.
- No new screens, navigation paths or UX messages are required.
- Privacy notices continue describing backend processing.
- Recording limits, daily quota and accessibility requirements remain unchanged.
- AC-071 references Whisper Base in P02 v5.2.
- CR-003 remains the historical approved STT decision.
- MVP 1 UX remains unchanged.

### Pending verification

- Empirical STT quality, latency and memory acceptance.
- Frontend regression tests for HU11 and HU12.
- Verification of recording permissions, error states and quota messages.
- Security and quota integration tests.
- Railway runtime and end-to-end integration validation.
- Review of the temporary `/test-whisper` interface before production.
- Any additional team approval required by the project process.

### Conclusion

P04 documentation is aligned with CR-004 implementation
authorization from the requester.

This addendum does not certify implemented frontend behavior,
empirical model acceptance or production readiness.

## Addendum — Merge reconciliation run (UX v4.3)

**Date:** 2026-11-09 · **Trigger:** merge of `mvp-2` (CR-003, CR-004, HU11 implementation) into `pipeline/mvp2-p00-context`, with the second decision batch reconciled as DEC-230-DEC-238 · **Validator prompt:** v2.1 of this stage

**Result:** `PASS_WITH_WARNINGS` · **P05 readiness:** YES

| Check | Result |
|---|---|
| Every FR, NFR and AC of requirements v5.3 referenced | Yes |
| Messages defined and used | All (M-17 from `mvp-2` kept) |
| UX proposals | All seven approved (DEC-235) |
| M-11 | Keeps the `mvp-2` wording (audio sent to Notara's servers, CR-003); the former OpenAI wording is not applied |
| Open UX questions | UX-Q-004 (populated-field dictation edge case, P02 Q-029) |

UX-VAL-203 (LOW, no "Cancelar" during processing) remains.
