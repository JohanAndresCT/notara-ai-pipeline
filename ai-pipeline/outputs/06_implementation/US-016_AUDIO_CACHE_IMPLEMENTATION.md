# P06.16 US-016 Reuse Synthesized Audio — Implementation Record

## 1. Metadata

| Field | Value |
|---|---|
| Story | US-016 / HU16 — Reuse Synthesized Audio |
| Priority / SP | P0 / 3 SP — MVP Supporting (enabler) |
| Story prompt | `ai-pipeline/prompts/06_implementation/P06.16_US-016_audio_cache.md` |
| Generation prompt | `P06_implementation.md` v2.0 (story mode) |
| Contributor | TEAM-001 working session — branch `pipeline/mvp2-p00-context` (uncommitted at the time of this record) |
| Date | 2026-11-09 |
| Status | `IMPLEMENTED` |

## 2. Summary

Synthesized audio is stored once, keyed by kind + spoken text + engine/voice + language; repeated requests are served from storage without calling a provider or using quota.

## 3. Traceability

P02 US-016; AC-055-AC-058; FR-038, FR-039; BR-021 · DEC-210 · P05 ADR-008, ADR-012

## 4. Implemented Components

| File | Change |
|---|---|
| backend/voice/models.py | `SynthesizedAudio` (unique key, file under `audio_cache/`) |
| backend/voice/synthesis.py | `cache_key()`, `_read_cached()` (drops rows whose file is gone), `_store()` (best effort) |

## 5. Verification Results

Backend suite (SQLite, `.venv` Python 3.13): 134 tests, 133 passed, 1 skipped, 0 failures (21 new in `scores/tests_mvp2.py`). `tsc --noEmit` 0 errors; `vite build` OK (Tone.js in a lazy chunk).

| Check | Result | Evidence |
|---|---|---|
| Backend tests | PASS | Second request identical bytes, quota unchanged; edited content creates a new entry; storage failure still returns audio |

## 6. Scope Boundary, Deviations and Open Items

- Persistence of `audio_cache/` on Railway unverified (PRE-005); losing it only costs regeneration.
- No cleanup command for old cache files.

## 7. Final Status

`IMPLEMENTED`
