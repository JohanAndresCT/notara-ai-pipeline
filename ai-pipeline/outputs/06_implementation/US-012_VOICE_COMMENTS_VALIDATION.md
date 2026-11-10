# P06.12 US-012 Leave a Voice Comment — Validation Report

## 1. Validation Metadata

| Field | Value |
|---|---|
| Validator | `P06_code_review.md` v2.0 (story mode) |
| Date | 2026-11-09 |
| Record reviewed | `US-012_VOICE_COMMENTS_IMPLEMENTATION.md` |
| Overall result | `PASS_WITH_WARNINGS` |
| Execution status | `PARTIAL` |
| DoD status | `PENDING_REVIEW` |

## 2. Executive Summary

An authenticated user records up to 30 s on another user's score, previews it and sends it; the backend transcribes it with the local Whisper model and stores one comment with the text and its audio. The audio is served only to authenticated users and is deleted with the comment. The validator re-ran the backend suite and the frontend typecheck/build and exercised the flow in the browser against the running backend (Edge voice, local Whisper). No HIGH or CRITICAL findings.

## 3. Acceptance Criteria Results

| Criterion | Result | Evidence |
|---|---|---|
| AC-037 record ≤30 s on another's score → comment with text and audio | PASS_WITH_LIMITATION | Live API with synthesized speech; microphone path not exercised |
| AC-038 others read text and play audio | PASS | Browser, authenticated audio endpoint |
| AC-039 failed/empty transcription → no comment, clear message | PASS | Backend tests (`TRANSCRIPTION_FAILED`, `STT_UNAVAILABLE` → M-09) |
| AC-040 no voice comment on own score | PASS | Backend `OWN_SCORE` test; composer hidden in UI |
| AC-041 unauthenticated | PASS | Existing 401 on the endpoint; audio 401 test |
| AC-042 author deletes → comment and audio gone | PASS | Tests and browser |
| AC-077 transcript 501-1,000 kept whole | PASS | Backend test |
| AC-076 shared STT quota | PASS | Transcription uses `reserve_daily_inference`; test checks the counter |

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
| IMPL-VAL-012-01 | MEDIUM | Real-microphone recording not verified. | Embedded browser blocks capture. | Test in Chrome/Edge/Firefox. |
| IMPL-VAL-012-02 | MEDIUM | Voice-comment audio relies on unverified Railway persistence. | PRE-005. | Verify the `/data` volume before enabling in production. |
| IMPL-VAL-012-03 | LOW | Audio duration not stored. | `Comment` has no duration field. | Add only if a feature needs it. |

## 7. Final Decision

**Overall result:** `PASS_WITH_WARNINGS` · **Execution:** `PARTIAL` · **DoD:** `PENDING_REVIEW`. May proceed to P07 for release-level testing.


## Addendum 2026-11-10 — assisted acceptance run

Voice comment recorded through the UI with a simulated microphone: preview, send, badge and protected audio (200 `audio/webm`); delete confirmation removed the comment and the audio (404). Real-microphone check and Railway persistence remain open.
