# P02 Requirements Validation Report

## 1. Validation Metadata

- **Project:** Notara
- **Validator:** P02 - Requirements Validation Prompt v2.0 (Senior Requirements Validation Auditor)
- **Stage:** P02 - Requirements Engineering
- **Release:** MVP 2 - Sprint 2 (Audio, Voice and TTS/STT)
- **Validation Date:** 2026-11-08
- **Requirements Version:** 3.0
- **Backlog Version:** 3.0
- **Inputs:** `PRODUCT_VISION.md` v2.1 and its validation (PASS_WITH_WARNINGS); `PROJECT_CONTEXT.md` v2.2; `SPRINT_2_BACKLOG_INPUT.md`; `DECISIONS_MVP2.md`; requirements v2.0 (Git `HEAD`); `SYSTEM_PROMPT.md`
- **Overall Result:** `PASS_WITH_WARNINGS`

> The MVP 1 validation report (requirements v2.0) is preserved in Git history.

## 2. Executive Summary

The requirements cover HU01-HU19 with testable acceptance criteria and complete traceability, and the Markdown and JSON artifacts are consistent. Automated checks (section 11) found no duplicate IDs, no unresolved references, no missing MVP 1 identifier and no populated planning field.

**No CRITICAL or HIGH findings.**

**Two MEDIUM findings:**
- Three rules that P02 had to define are still proposals: the dictation vocabulary, the estimated-difficulty rule and the completion of dictated ABC. Acceptance criteria of US-011 (a Must story) and US-014 depend on them.
- The P00 and P01 artifacts translate "clave" as "key", while the backlog means the clef. P02 uses clef, so the three stages now disagree.

**Four LOW findings** concern synchronization and wording.

**What P02 found while writing, all reported rather than silently resolved:**
- The backlog's own dictation example would fail ABC validation (CONFLICT-201).
- The retention decision refers to account deletion, which does not exist (CONFLICT-203).
- P00 is out of sync with resolved MVP 1 questions (CONFLICT-204).

## 3. Structural Validation

### 3.1 REQUIREMENTS.md

| Section | Status |
|---|---|
| 0. Change Log | PASS |
| 1. Document Metadata | PASS |
| 2. Requirements Overview (scope, exclusions, assumptions) | PASS |
| 3. Epics (EPIC-001-EPIC-007) | PASS |
| 4. Functional Requirements (FR-001-FR-044) | PASS |
| 5. Non-Functional Requirements (NFR-001-NFR-010) | PASS |
| 6. User Stories (6.1 MVP 1 preserved; 6.2 US-011-US-019) | PASS |
| 7. Business Rules (BR-001-BR-028) | PASS |
| 8. Edge Cases (EDGE-001-EDGE-030) | PASS |
| 9. Dependencies (DEP-001-DEP-010) | PASS |
| 10. Assumptions, Open Questions, Conflicts | PASS |
| 11. Traceability + Superseded items | PASS |
| 12. Status | PASS |

### 3.2 product_backlog.json

**PASS.** The JSON parses and keeps the version 1.0 shape (`backlog_metadata`, `epics`, `items`): 7 epics and 19 items with 69 acceptance criteria. MVP 2 items add `traceability.backlog_ac_ids`, `decision_ids` and `team_backlog`, as the P02 v2.0 prompt allows. AC-028 carries `status: SUPERSEDED` and `superseded_by: AC-029`.

## 4. MVP 1 Preservation

**PASS.**
- **Identifiers:** every MVP 1 identifier from version 2.0 is present (FR-001-017, NFR-001-003, US-001-010, AC-001-028, BR-001-012, EDGE-001-013, DEP-001-003, Q-001-006, ASM-001-003).
- **Content rules:** the MVP 1 rules are unchanged.
- **DEC-211 applied by superseding, not deleting:** BR-011 → BR-019, AC-028 → AC-029, the deletion part of EDGE-013 → EDGE-029, and the Q-004 resolution is updated. All four appear in the "Superseded items" table. US-010 gains FR-028 and AC-029, marked "added in v3.0".

## 5. MVP 2 Coverage and Fidelity

| HU | Story | FRs | ACs | Backlog ACs covered | Fidelity |
|---|---|---|---|---|---|
| HU11 | US-011 | FR-018-021, 025, 029, 030, 043 | AC-030-036 | AC-011-01, -02, -03 | Faithful; AC-031 adds header completion (BR-025, PROPOSAL) to resolve CONFLICT-201 |
| HU12 | US-012 | FR-026-030, 043 | AC-037-042 | AC-012-01, -02 | Faithful; playback by others (FR-027) derived from "se publique como texto y audio" |
| HU13 | US-013 | FR-031-033, 036, 037, 043, 044 | AC-043-048 | AC-013-01, -02 | Faithful with DEC-206 (spoken) |
| HU14 | US-014 | FR-033, 034, 036, 037, 043, 044 | AC-049-051 | AC-014-01 | Faithful to backlog ("clave" = clef); differs from P00/P01 wording (REQ-VAL-202) |
| HU15 | US-015 | FR-035-037 | AC-052-054 | AC-015-01 | Faithful with DEC-203 |
| HU16 | US-016 | FR-038, 039 | AC-055-058 | AC-016-01, -02 | Faithful with DEC-210; AC-058 from P00 RISK-008 mitigation |
| HU17 | US-017 | FR-040, 041 | AC-059-063 | AC-017-01 | Faithful; AC-060 (provider unavailable) derived from the story text "falle" |
| HU18 | US-018 | FR-036, 042, 044 | AC-064-065 | AC-018-01 (reworded) | Faithful with DEC-204 |
| HU19 | US-019 | FR-022-025 | AC-066-069 | AC-019-01..04 | Faithful 1:1 |

User story IDs match the backlog (US-0NN = HU-NN). Team MoSCoW and SP are recorded as source data, with the DEC-208 and DEC-209 adjustments shown.

## 6. Decision Reflection

| Decision | Reflected in | Result |
|---|---|---|
| DEC-201 Whisper | FR-018, FR-026; AC-030, AC-037 | PASS |
| DEC-202 ElevenLabs + edge-tts, dev default | FR-031, FR-040; NFR-006; AC-063 | PASS |
| DEC-203 Tone.js in browser | FR-035; AC-052 | PASS |
| DEC-204 MP3 voice only | FR-042; BR-016; AC-064; CONFLICT-205 | PASS |
| DEC-205 closed vocabulary | FR-019, FR-020; BR-013 (PROPOSAL detail) | PASS (see REQ-VAL-201) |
| DEC-206 spoken solfege | FR-031, FR-032; AC-043, AC-045 | PASS |
| DEC-207 `.abc` only | FR-036, FR-037; BR-015 | PASS |
| DEC-208 / DEC-209 estimates | `team_backlog` of US-011 and US-017 | PASS (not used as P02 planning) |
| DEC-210 cache key | FR-038, FR-039; BR-021; AC-057 | PASS |
| DEC-211 comment deletion | FR-028; BR-019; AC-029, AC-042 | PASS |
| DEC-212 estimated difficulty | FR-034; BR-014 (PROPOSAL detail) | PASS (see REQ-VAL-201) |
| DEC-213 limits | FR-030, FR-043, FR-044; BR-017 | PASS |
| DEC-214 retention and notice | FR-029; NFR-004; BR-018 | PASS (CONFLICT-203 reported) |
| DEC-215 Spanish | NFR-007; BR-022 | PASS |
| DEC-216 silent fallback | FR-041; BR-023; AC-062 | PASS |
| DEC-217 file read locally | FR-022; BR-020; AC-069 | PASS |
| DEC-218 MVP 1 rules on new input | FR-025; BR-024; AC-036, AC-069 | PASS |

## 7. Acceptance Criteria Audit

| Story | Criteria Present | Testable | Rules Covered | Result |
|---|---|---|---|---|
| US-010 (amended) | Yes | Yes | Deletion by author, audio removed | PASS |
| US-011 | Yes (7) | Yes; AC-031 expectation depends on PROPOSAL BR-013/BR-025 | Vocabulary, notice, 30 s/2 MB, permission, MVP 1 rules | PASS_WITH_WARNINGS |
| US-012 | Yes (6) | Yes | Auth, own-score exclusion, failure, deletion | PASS |
| US-013 | Yes (6) | Yes | `.abc` only, unrenderable, limit | PASS |
| US-014 | Yes (3) | Yes; AC-050 depends on PROPOSAL BR-014 | Clef, meter, difficulty | PASS_WITH_WARNINGS |
| US-015 | Yes (3) | Yes | No external call, `.abc` only | PASS |
| US-016 | Yes (4) | Yes | Reuse, invalidation, storage failure | PASS |
| US-017 | Yes (5) | Yes | 402/429, unavailable, double failure, silent | PASS |
| US-018 | Yes (2) | Yes | Voice-only MP3, `.abc` only | PASS |
| US-019 | Yes (4) | Yes | Extension, empty, unreadable, 1,000 chars, confirmation | PASS |

## 8. Business Rules, Edge Cases and Dependencies

**PASS.**
- **Business rules:** BR-013-BR-028 each trace to a decision, a backlog criterion or a conflict. PROPOSAL rules (BR-013, BR-014, BR-025, part of BR-026) are labeled and linked to open questions Q-021, Q-024 and Q-023.
- **Edge cases:** EDGE-014-EDGE-030 cover permissions, limits, provider failures, storage failure, plain text, unrenderable ABC and invalid files. EDGE-018 makes explicit that there is no transcription fallback in MVP 2.
- **Dependencies:** DEP-004-DEP-010 are product dependencies, including provider budget (Q-011), storage (Q-009) and ratification (Q-020). None of them is a technical design.

## 9. Scope and Exclusions

**PASS.**
- **Exclusions respected:** OMR, image uploads, roles, account recovery, sung solfege, mixed MP3, server-side synthesis, file storage and other languages are excluded and do not appear as active requirements.
- **Enabler personas:** HU16 and HU17 use operator personas marked "no product role".
- **No scope creep:** every capability traces to HU11-HU19 or a decision.

## 10. Assumptions, Open Questions and Conflicts

**PASS.** Carried open: Q-009, Q-010, Q-011, Q-012, Q-020. New: Q-021-Q-025. Conflicts CONFLICT-201-205 are listed with treatment. P01 warning DISC-VAL-202 is resolved: the backlog and the decision log are inputs. DISC-VAL-203 is respected: indicators are cited as IND-2NN.

## 11. Traceability and Cross-Artifact Consistency

**PASS.** Automated checks on 2026-11-08:

| Check | Result |
|---|---|
| Duplicate definitions | None |
| Unresolved references | None (CONFLICT-001 is an external reference to P01) |
| MVP 1 identifiers missing | None |
| AC set Markdown = JSON | Identical (69) |
| Story links (FR, BR, EDGE, DEP, Q) JSON present in Markdown story | 0 issues |
| HU11-HU19 present | All |
| DEC-201-DEC-218 present | All 18 |

## 12. Technical and Planning Boundary

**Technical boundary: PASS_WITH_WARNINGS.**
- **No design introduced:** no framework, endpoint, schema or storage layout is designed. Providers appear only as decided constraints.
- **LOW REQ-VAL-205:** AC-059 cites provider status codes (402/429), copied from the backlog AC-017-01.
- **LOW REQ-VAL-206:** AC-063 is an operational criterion (development and test configuration) rather than a user-observable one.

**Planning boundary: PASS.**
- **Fields empty:** `priority`, `story_points`, `release` and `sprint` are null and `assigned_developers` is empty for all 19 items.
- **Source data only:** team MoSCoW and SP sit only under `traceability.team_backlog`.

## 13. Findings Matrix

| Finding ID | Severity | Category | Description | Evidence | Recommended Correction |
|---|---|---|---|---|---|
| REQ-VAL-201 | MEDIUM | Delegated definitions | BR-013 (vocabulary), BR-014 (difficulty) and BR-025 (dictated ABC completion) are PROPOSAL. AC-031 (US-011, Must, 8 SP) and AC-050 (US-014) depend on them, so their expected results may change. | REQUIREMENTS.md section 7; Q-021, Q-023, Q-024 | Approve or adjust BR-013, BR-014 and BR-025 with the team before P03 estimates US-011 and US-014. |
| REQ-VAL-202 | MEDIUM | Cross-stage consistency | P00 (MVP-014, SUCCESS-010) and P01 (NEED-010, JTBD-008, §7) say "key"; the backlog example "clave de Sol" means clef, and P02 now says clef (CONFLICT-202). | Backlog HU14, AC-014-01; P00 v2.2; P01 v2.1; BR-028 | Correct the wording in P00 and P01 to "clef (clave)" and record it in their change logs; resolve Q-025 (key and tempo). |
| REQ-VAL-203 | LOW | Synchronization | P00 lists Q-002 and Q-006 as open although MVP 1 requirements resolved them (CONFLICT-204). | P00 section 11; requirements v2.0 | Sync P00 in its next revision. |
| REQ-VAL-204 | LOW | Decision gap | DEC-214 deletes audio "with the account", but there is no account deletion (CONFLICT-203). | DEC-214; BR-018 | Resolve Q-022. |
| REQ-VAL-205 | LOW | Technical boundary | AC-059 names provider status codes 402/429. | AC-059; backlog AC-017-01 | Acceptable as a backlog citation; P07 may rephrase as "no credits / rate limit". |
| REQ-VAL-206 | LOW | Testability | AC-063 (fallback voice default in development and testing) is not user-observable. | AC-063; NFR-006 | Keep it; verify it as a configuration check in P07/P08. |

## 14. Readiness for P03

```text
READY_WITH_ASSUMPTIONS
```

P03 can plan with:
- **Load:** 31 SP of team estimates, 21 SP of them Must.
- **Dependency order:** US-016/US-017 before US-013/US-014 (DEP-007), US-013 before US-018 (DEP-006), and US-011/US-019 on top of US-004/US-005 (DEP-004).
- **Pending before estimating:** ratification (Q-020) and the PROPOSAL rules (REQ-VAL-201).

## 15. Final Decision

- **Result:** `PASS_WITH_WARNINGS`
- **Conditions to Proceed:** keep REQ-VAL-201-206 visible in P03, and do not commit estimates for US-011 and US-014 as final until BR-013, BR-014 and BR-025 are approved.
- **Required Corrections:** none blocking. Recommended: REQ-VAL-202 (P00/P01 wording) and REQ-VAL-201 (team approval).

## 16. Auditor Integrity Statement

This report did not modify `REQUIREMENTS.md`, `product_backlog.json`, P00/P01 artifacts, the backlog input or the decision log. No requirement was added, no conflict was resolved and no planning value was assigned by the validator.

## Addendum — Run 2 (requirements v3.1, prompt v2.1)

**Date:** 2026-11-08 · **Trigger:** second decision batch DEC-219-DEC-229 applied to the requirements · **Validator prompt:** `P02_validation.md` v2.1 (no run-specific state)

**Result:** `PASS_WITH_WARNINGS` (0 HIGH, 0 MEDIUM, 2 LOW) · **P03 readiness:** `READY_WITH_ASSUMPTIONS`

### Automated checks

| Check | Result |
|---|---|
| Duplicate definitions | None |
| Unresolved references | None (CONFLICT-001 is a P01 reference) |
| MVP 1 identifiers missing | None |
| Acceptance criteria, Markdown = JSON | Identical (72) |
| Planning fields null in all 19 items | Yes |
| PROPOSAL rules left in BR-013, BR-014, BR-025 | None (initial versions, DEC-229) |
| Decisions reflected | 27 of 29. DEC-224 (tutor text transport) and DEC-226 (notice wording) have no requirement-level effect; they are reflected in P05 and P04. |
| Open questions | Q-009, Q-010, Q-011, Q-012, Q-020 (team inputs or verifications) |

### Status of run 1 findings

| ID | Status |
|---|---|
| REQ-VAL-201 (MEDIUM) | **Resolved** — BR-013, BR-014, BR-025 approved as initial versions (DEC-229); AC-031 and AC-050 now rest on approved rules. |
| REQ-VAL-202 (MEDIUM) | **Resolved** — "clef" wording corrected in P00 v2.3 and P01 v2.2. |
| REQ-VAL-203 (LOW) | **Resolved** — Q-002/Q-006 synced in P00 v2.3. |
| REQ-VAL-204 (LOW) | **Resolved** — DEC-228 (no account deletion; cascade covers administrative deletion). |
| REQ-VAL-205 (LOW) | Open — AC-059 still cites provider status codes from the backlog. |
| REQ-VAL-206 (LOW) | Open — AC-063 (reworded by DEC-219) remains a configuration criterion; verify in P07/P08. |

### New content checked

FR-045 (20 transcriptions per day), FR-046 (voice transcripts up to 1,000 characters, never truncated), BR-029, BR-030, AC-070-AC-072 are testable, traced to DEC-220, DEC-222 and DEC-223, and linked in both Markdown and JSON. The tutor content change (DEC-227) widens AC-049 slightly (key and tempo when defined); it comes from an approved decision and is recorded in the change log.
