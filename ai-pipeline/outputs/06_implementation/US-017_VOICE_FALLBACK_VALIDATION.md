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


## Addendum 2026-11-10 — DEC-241

ElevenLabs becomes the primary engine when `ELEVENLABS_API_KEY` is set; edge-tts remains the fallback. Defect found and fixed before any real call: the adapter sent `language_code`, which `eleven_multilingual_v2` rejects, so every request would have fallen back to Edge. New tests: primary served without fallback; payload without `language_code` for multilingual v2 and with it for flash v2.5. Real-key check still pending (PRE-004).


## Addendum 2026-11-10 — real ElevenLabs verification (PRE-004)

- Real key configured locally in `.env` (not in the repository). Model `eleven_multilingual_v2`.
- **Library voices are refused on the free plan** (`402 paid_plan_required`: "Free users cannot use library voices via the API"); premade voices work. `ELEVENLABS_VOICE_ID` set to the premade voice *Sarah* (`EXAVITQu4vr4xnSDxMaL`); the library voice is kept commented for a paid plan.
- **Defect fixed:** the cache was checked for every engine before calling the primary, so audio cached earlier with Edge kept being served after enabling ElevenLabs. Now the primary's cache is checked first; fallback copies are served only when the primary fails or the daily limit is reached, and serving them releases the reserved quota. Two new tests.
- Through the running app (score 1): solfege 371 KB / 23.7 s generated in 2.3 s (pauses from SSML breaks applied), tutor 100 KB / 6.4 s in 1.0 s, repeat served from cache in 51 ms; no `voice_fallback` in the backend log.
