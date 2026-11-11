# P06.13 US-013 Listen to the Spoken Solfege — Validation Report

## 1. Validation Metadata

| Field | Value |
|---|---|
| Validator | `P06_code_review.md` v2.0 (story mode) |
| Date | 2026-11-09 |
| Record reviewed | `US-013_SOLFEGE_IMPLEMENTATION.md` |
| Overall result | `PASS_WITH_WARNINGS` |
| Execution status | `PARTIAL` |
| DoD status | `PENDING_REVIEW` |

## 2. Executive Summary

On an ABC score, "Escuchar Solfeo" returns an MP3 of a Spanish voice naming the notes in order, which plays automatically. Plain-text scores show the option disabled; scores with unsupported ABC show M-03. The validator re-ran the backend suite and the frontend typecheck/build and exercised the flow in the browser against the running backend (Edge voice, local Whisper). No HIGH or CRITICAL findings.

## 3. Acceptance Criteria Results

| Criterion | Result | Evidence |
|---|---|---|
| AC-043 Spanish voice names the notes | PASS | Reader tests; Edge audio in browser |
| AC-044 playback starts on receipt | PASS | Audio element playing after the request |
| AC-045 pauses reflect durations where supported | PASS_WITH_LIMITATION | SSML breaks generated for ElevenLabs (test); Edge uses constant pace |
| AC-046 plain text disabled with M-02 | PASS | Browser |
| AC-047 unrenderable ABC → M-03, no server error | PASS | 422 `ABC_UNSUPPORTED` test |
| AC-048 daily limit → M-10, stored audio still available | PASS | Backend test with `VOICE_DAILY_LIMIT=1` |

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
| IMPL-VAL-013-01 | MEDIUM | ElevenLabs path not exercised with the real service. | No API key. | Run a demo-configuration check once PRE-004 closes. |
| IMPL-VAL-013-02 | LOW | ABC subset excludes chords, tuplets, ties, grace notes and voices. | ARCH-RISK-204. | Extend after MVP 2 if needed. |

## 7. Final Decision

**Overall result:** `PASS_WITH_WARNINGS` · **Execution:** `PARTIAL` · **DoD:** `PENDING_REVIEW`. May proceed to P07 for release-level testing.


## Addendum 2026-11-10

Solfege MP3 transcribed back with Whisper matched the expected note order; second request served from cache in 11 ms. Edge reads quickly (9 notes in 4.2 s).


## Addendum 2026-11-10 — real ElevenLabs verification (PRE-004)

- Real key configured locally in `.env` (not in the repository). Model `eleven_multilingual_v2`.
- **Library voices are refused on the free plan** (`402 paid_plan_required`: "Free users cannot use library voices via the API"); premade voices work. `ELEVENLABS_VOICE_ID` set to the premade voice *Sarah* (`EXAVITQu4vr4xnSDxMaL`); the library voice is kept commented for a paid plan.
- **Defect fixed:** the cache was checked for every engine before calling the primary, so audio cached earlier with Edge kept being served after enabling ElevenLabs. Now the primary's cache is checked first; fallback copies are served only when the primary fails or the daily limit is reached, and serving them releases the reserved quota. Two new tests.
- Through the running app (score 1): solfege 371 KB / 23.7 s generated in 2.3 s (pauses from SSML breaks applied), tutor 100 KB / 6.4 s in 1.0 s, repeat served from cache in 51 ms; no `voice_fallback` in the backend log.
