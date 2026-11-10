# P06.15 US-015 Play the Score with an Instrument — Validation Report

## 1. Validation Metadata

| Field | Value |
|---|---|
| Validator | `P06_code_review.md` v2.0 (story mode) |
| Date | 2026-11-09 |
| Record reviewed | `US-015_PIANO_PLAYBACK_IMPLEMENTATION.md` |
| Overall result | `PASS_WITH_WARNINGS` |
| Execution status | `PARTIAL` |
| DoD status | `PENDING_REVIEW` |

## 2. Executive Summary

The score detail response carries normalized note events; "Reproducir Piano" plays them in the browser with Tone.js, without any extra request or external service, and toggles to "Detener piano". The validator re-ran the backend suite and the frontend typecheck/build and exercised the flow in the browser against the running backend (Edge voice, local Whisper). No HIGH or CRITICAL findings.

## 3. Acceptance Criteria Results

| Criterion | Result | Evidence |
|---|---|---|
| AC-052 piano sound in the browser, no external call | PASS_WITH_LIMITATION | No network request for playback; synth rather than sampled piano |
| AC-053 plain text / unrenderable | PASS | Disabled with M-02 or M-03 |
| AC-054 not counted in the daily limit | PASS | No server call |

## 4. Architecture, UX, Security and Code Review

- **Architecture:** follows P05 (adapters behind the `voice` module, cache → quota → primary → fallback, events in the detail response, routes only under `/api/v1/`, ADR-013).
- **UX:** message copy from the P04 catalogue; disabled controls carry visible explanations; live regions for processing; buttons usable by keyboard; 375 px layout without horizontal scroll.
- **Security/privacy:** session + CSRF on every POST; server-side validation; protected audio with `nosniff` and `no-store`; no secrets in the client; logs without transcripts or audio.
- **Code quality:** pure, unit-tested ABC reader; storage and provider failures handled without server errors; media streams, timers and object URLs released.

## 5. Automated and Manual Verification

Backend suite (SQLite, `.venv` Python 3.13): 134 tests, 133 passed, 1 skipped, 0 failures (21 new in `scores/tests_mvp2.py`). `tsc --noEmit` 0 errors; `vite build` OK (Tone.js in a lazy chunk).

## 6. Findings

| ID | Severity | Finding | Evidence | Recommendation |
|---|---|---|---|---|
| IMPL-VAL-015-01 | LOW | Synthesizer timbre instead of sampled piano. | ADR fallback; licence pending. | Bundle CC-licensed samples once approved. |
| IMPL-VAL-015-02 | LOW | Audible output not reviewed. | Embedded browser. | Listen in a desktop browser. |

## 7. Final Decision

**Overall result:** `PASS_WITH_WARNINGS` · **Execution:** `PARTIAL` · **DoD:** `PENDING_REVIEW`. May proceed to P07 for release-level testing.


## Addendum 2026-11-10

Piano start/stop and pausing of the solfege confirmed; oscillators active during playback. Pitch accuracy still requires listening.
