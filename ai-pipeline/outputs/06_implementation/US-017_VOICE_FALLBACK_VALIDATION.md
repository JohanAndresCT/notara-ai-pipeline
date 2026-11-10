# P06.17 US-017 Fall Back to a Free Voice — Validation Report

## 1. Validation Metadata

| Field | Value |
|---|---|
| Validator | `P06_code_review.md` v2.0 (story mode) |
| Date | 2026-11-09 |
| Record reviewed | `US-017_VOICE_FALLBACK_IMPLEMENTATION.md` |
| Overall result | `PASS` |
| Execution status | `COMPLETE` |
| DoD status | `PENDING_REVIEW` |

## 2. Executive Summary

With ElevenLabs as primary, any provider error (402, 429, 5xx, timeout, network) switches to `edge-tts`; if both fail the user gets `AUDIO_UNAVAILABLE` and the quota is released. The engine is never revealed; fallback use is logged without personal content. Development uses Edge by default and tests use the fake engine. The validator re-ran the backend suite and the frontend typecheck/build and exercised the flow in the browser against the running backend (Edge voice, local Whisper). No HIGH or CRITICAL findings.

## 3. Acceptance Criteria Results

| Criterion | Result | Evidence |
|---|---|---|
| AC-059 402/429 → fallback, no server error | PASS | Test |
| AC-060 provider unavailable → fallback | PASS | Same path (`TtsProviderError`) |
| AC-061 both fail → clear message, no server error | PASS | Test (503 JSON, M-15) |
| AC-062 engine not shown, event logged | PASS | Test |
| AC-063 local development uses the free voice; tests use fake | PASS | Settings default `edge`; tests override to `fake` |

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
| IMPL-VAL-017-01 | LOW | Fallback not exercised against the real commercial service. | No key. | Check in a demo configuration. |

## 7. Final Decision

**Overall result:** `PASS` · **Execution:** `COMPLETE` · **DoD:** `PENDING_REVIEW`. May proceed to P07 for release-level testing.
