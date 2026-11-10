# P06.11 US-011 Dictate a Score by Voice — Validation Report

## 1. Validation Metadata

| Field | Value |
|---|---|
| Validator | `P06_code_review.md` v2.0 (story mode) |
| Date | 2026-11-09 |
| Record reviewed | `US-011_DICTATION_IMPLEMENTATION.md` |
| Story prompt | `P06.11_US-011_dictate_score_by_voice.md` |
| Code reviewed | `backend/voice/*` (merged from `mvp-2`), `frontend/src/DictationPanel.tsx`, `frontend/src/lib/api.ts` (`transcribeDictation`), `frontend/src/ScoreCreatePage.tsx` (working tree, `pipeline/mvp2-p00-context`) |
| Overall result | `PASS_WITH_WARNINGS` |
| Execution status | `PARTIAL` |
| DoD status | `PENDING_REVIEW` |

## 2. Executive Summary

The empty-field dictation flow on the create page is implemented in the backend and the frontend, follows the P05 contract and the P04 messages, and keeps audio private. Every check that could run here passed, re-run by the validator: the backend suite (113 tests, 112 passed, 1 skipped), typecheck, build, the real endpoint's error path, and the UI states. What is **not** verified:
- recording real speech with a microphone, which the embedded browser blocks;
- the HU11 acceptance measurements AC-070-AC-072 (corpus, p95, memory).

There are no HIGH or CRITICAL findings.

## 3. Source and Decision Readiness

| Source | Present | Result |
|---|---|---|
| Story prompt P06.11 | Yes | Applied |
| P02 US-011, AC-030-AC-036, AC-070-AC-076 | Yes | Used |
| Decisions DEC-201 (CR-004), DEC-205, DEC-213, DEC-214, DEC-218, DEC-219, DEC-232 | Yes | Reflected |
| P03 preconditions | PRE-002 resolved; PRE-011 pending | Acceptance gates outstanding |
| P04 FLOW-011, FLOW-018, messages | Yes | Reflected |
| P05 ADR-006, ADR-009, ADR-014, STT contract | Yes | Conforms |

## 4. Acceptance Criteria Results

| Criterion | Result | Procedure | Evidence |
|---|---|---|---|
| AC-030 notice + record + transcribe | PASS_WITH_LIMITATION | Code review; endpoint call with generated WAV | Notice visible; request reaches Whisper and returns in ~1.5 s. Real speech not recorded (pane blocks microphone). Edit page not covered. |
| AC-031 ABC inserted, ABC selected, not published | NOT_VERIFIED (end to end) | Code review; backend parser tests | Insertion code and parser tests pass; no real dictation produced ABC in this environment. Append path not implemented (Q-029). |
| AC-032 uninterpretable → M-01, field unchanged | PASS | Real 422 response; code review | Message maps exactly; field untouched on error. |
| AC-033 vocabulary visible | PASS | Browser | "Vocabulario soportado" lists the BR-013 terms and example. |
| AC-034 30 s / 2 MB | PASS_WITH_LIMITATION | Code review; backend tests | Auto-stop at 29.5 s, client 2 MB check, backend size/duration validation; not exercised with a real recording. |
| AC-035 microphone denied | PASS | Browser pane | M-04 shown; form remains usable. |
| AC-036 publish rules apply | PASS | Code review; US-019 publish check | Same unchanged publish validation. |
| AC-070-AC-072 corpus, p95, memory | NOT_VERIFIED | — | PRE-011 measurements pending. |
| AC-073-AC-076 quota, validation, shared counter | PASS | Backend tests | `voice` tests pass; client maps 429 to M-17. |

## 5. Architecture and Contract Review

PASS. The endpoint, error shape and codes match `docs/API_STT_HU11.md` and P05. The adapter boundary and pinned model follow CR-004. The frontend uses the existing same-origin session/CSRF pattern from `lib/api.ts`. New dependencies are backend-only and were decided in CR-003/CR-004.

## 6. UX, Accessibility and Responsive Review

PASS_WITH_WARNINGS.
- **Messages:** M-01, M-04, M-04b, M-05, M-05b, M-07, M-11, M-12 match the catalogue exactly.
- **Accessibility:**
  - live region announces the recording, processing and permission states;
  - the disabled button has a visible, associated explanation;
  - all controls are buttons, so they work from the keyboard;
  - the recording dot respects reduced motion.
- **Responsive:** at 375 px the controls stack and there is no horizontal scroll.

## 7. Security, Privacy and Code Quality Review

PASS_WITH_WARNINGS.
- **Backend security:**
  - authentication is checked before reading files;
  - CSRF is enforced by the middleware, with a typed JSON failure;
  - size, type, container and duration are validated before inference;
  - one inference runs per process;
  - the quota is reserved atomically;
  - no audio or transcript is persisted or logged.
- **Frontend resources:** media tracks and timers are released on stop and on unmount; no secrets are in the client.
- **Minor quality points:** IMPL-VAL-011-04, IMPL-VAL-011-05.

## 8. Automated and Manual Verification

| Check | Result |
|---|---|
| `manage.py test` (SQLite) | 113 run, 112 passed, 1 skipped, 0 failures (re-run by the validator) |
| `tsc --noEmit` / `vite build` | Pass / pass |
| Endpoint: unauthenticated 401, generated WAV 422 | Pass |
| Browser: panel, vocabulary, disabled state, M-04, 375 px | Pass |
| Real microphone recording | Not run |
| Playwright E2E | Not run |

## 9. Findings

| ID | Severity | Finding | Evidence | Impact | Recommendation |
|---|---|---|---|---|---|
| IMPL-VAL-011-01 | MEDIUM | Recording and transcribing real speech was not verified end to end. | Embedded browser blocks the microphone. | AC-030, AC-031 and AC-034 are not proven with real audio. | Test in Chrome, Edge and Firefox at `http://localhost:5173/scores/new` with the backlog example phrase; record the result. |
| IMPL-VAL-011-02 | MEDIUM | HU11 acceptance gates (corpus ≥7/9 exact, p95 ≤15 s, memory ≤800 MiB) are not measured. | PRE-011; AC-070-AC-072. | HU11 cannot be accepted yet. | Run the approved corpus and measurements with the integrated UI. |
| IMPL-VAL-011-03 | LOW | Dictation is available only on the create page and only for an empty field. | Q-029 open; HU05 edit page does not edit content. | AC-030/AC-031 wording ("create or edit", "appended") is not fully met. | Team decides Q-029 and whether the edit page gets content editing. **Resolved 2026-11-10 (DEC-239):** dictation also on the edit page and appended to existing ABC. |
| IMPL-VAL-011-04 | LOW | If the user leaves the page while recording, the recorder's stop handler can still send the request after unmount. | `DictationPanel.tsx` `onstop` → `sendRecording`. | One unnecessary transcription (counts toward the quota). | Ignore `onstop` after unmount (e.g. an `isMounted` ref) in a follow-up. **Resolved 2026-11-09 (P06.12):** the shared `useRecorder` hook discards the recording on unmount. |
| IMPL-VAL-011-05 | LOW | AUDIO_INVALID shows the server wording instead of M-01, and M-17 omits the numeric limit. | `lib/api.ts` message map. | Minor deviation from the catalogue. | Record as UX-PROP or align the catalogue. **Resolved 2026-11-10:** dictation maps `AUDIO_INVALID` to M-01 and M-17 states the limit of 30 (DEC-219). |

## 10. Definition of Done

| Item | Status |
|---|---|
| Code for the empty-field create-page flow | DONE |
| Real-speech verification | PENDING |
| Acceptance gates AC-070-AC-072 | PENDING |
| Product Owner review | PENDING |

## 11. Final Decision

**Overall result:** `PASS_WITH_WARNINGS` · **Execution:** `PARTIAL` · **DoD:** `PENDING_REVIEW`. US-011 may continue to P07 for release-level testing. It is not accepted until IMPL-VAL-011-01 and IMPL-VAL-011-02 are closed.


## Addendum 2026-11-10 — assisted acceptance run

Simulated-microphone run and synthetic corpus recorded in `MVP2_MANUAL_ACCEPTANCE_CHECKLIST.md` §7: create/edit dictation, 30 s auto-stop, out-of-vocabulary rejection verified through the real UI path; synthetic corpus 21/27 exact (7/9 per voice); memory peak 353 MiB working set on Windows. New findings: temperature fallback can push a 30 s dictation to 19-26 s (AC-071 risk) and an auto-stop cut mid-word loses the whole dictation. IMPL-VAL-011-01/-02 stay open until real speakers and Railway measurements exist.

**DEC-240 (2026-11-10):** temperature fallback disabled for dictation; worst-case 30 s dictation 23.1 s → 5.0 s with identical transcript; synthetic corpus unchanged (21/27). Test `test_dictation_options_disable_temperature_fallback` added.
