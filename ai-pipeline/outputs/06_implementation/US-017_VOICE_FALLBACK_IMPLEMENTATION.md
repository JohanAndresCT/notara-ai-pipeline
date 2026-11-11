# P06.17 US-017 Fall Back to a Free Voice — Implementation Record

## 1. Metadata

| Field | Value |
|---|---|
| Story | US-017 / HU17 — Fall Back to a Free Voice |
| Priority / SP | P0 / 2 SP (Must by DEC-209) — MVP Supporting (enabler) |
| Story prompt | `ai-pipeline/prompts/06_implementation/P06.17_US-017_voice_fallback.md` |
| Generation prompt | `P06_implementation.md` v2.0 (story mode) |
| Contributor | TEAM-001 working session — branch `pipeline/mvp2-p00-context` (uncommitted at the time of this record) |
| Date | 2026-11-09 |
| Status | `IMPLEMENTED` |

## 2. Summary

With ElevenLabs as primary, any provider error (402, 429, 5xx, timeout, network) switches to `edge-tts`; if both fail the user gets `AUDIO_UNAVAILABLE` and the quota is released. The engine is never revealed; fallback use is logged without personal content. Development uses Edge by default and tests use the fake engine.

## 3. Traceability

P02 US-017; AC-059-AC-063; FR-040, FR-041; BR-023 · DEC-202, DEC-209, DEC-216, DEC-230, DEC-232 · P05 ADR-006, ADR-015

## 4. Implemented Components

| File | Change |
|---|---|
| backend/voice/tts.py | `engine_chain()`, `TtsProviderError`, 20 s timeout per attempt |
| backend/voice/synthesis.py | Fallback loop, `voice_fallback` warning, quota release on total failure |

## 5. Verification Results

Backend suite (SQLite, `.venv` Python 3.13): 134 tests, 133 passed, 1 skipped, 0 failures (21 new in `scores/tests_mvp2.py`). `tsc --noEmit` 0 errors; `vite build` OK (Tone.js in a lazy chunk).

| Check | Result | Evidence |
|---|---|---|
| Backend tests | PASS | Primary 402 → Edge audio + `voice_fallback` log; both fail → 503 and quota back to 0; no engine header |
| Real ElevenLabs failure | NOT RUN | No key |

## 6. Scope Boundary, Deviations and Open Items

- Real ElevenLabs behavior not exercised (PRE-004).

## 7. Final Status

`IMPLEMENTED`
