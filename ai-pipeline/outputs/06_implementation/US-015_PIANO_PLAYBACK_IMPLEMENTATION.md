# P06.15 US-015 Play the Score with an Instrument — Implementation Record

## 1. Metadata

| Field | Value |
|---|---|
| Story | US-015 / HU15 — Play the Score with an Instrument |
| Priority / SP | P0 / 3 SP — MVP Core |
| Story prompt | `ai-pipeline/prompts/06_implementation/P06.15_US-015_piano_playback.md` |
| Generation prompt | `P06_implementation.md` v2.0 (story mode) |
| Contributor | TEAM-001 working session — branch `pipeline/mvp2-p00-context` (uncommitted at the time of this record) |
| Date | 2026-11-09 |
| Status | `IMPLEMENTED_WITH_GAPS` |

## 2. Summary

The score detail response carries normalized note events; "Reproducir Piano" plays them in the browser with Tone.js, without any extra request or external service, and toggles to "Detener piano".

## 3. Traceability

P02 US-015; AC-052-AC-054; FR-035-FR-037 · DEC-203, DEC-207 · P04 FLOW-016 · P05 ADR-010 (events in the detail response), CONFLICT-ARCH-204

## 4. Implemented Components

| File | Change |
|---|---|
| backend/scores/abc_reader.py | `read_abc()`, `playback_data()` |
| backend/scores/views.py | `playback` block in `GET /api/v1/scores/{id}/` |
| frontend/src/ListeningPanel.tsx | Tone.js `PolySynth` scheduling (lazy import), stop, one audio at a time |
| frontend/package.json | `tone` 15.1.22 (exact) |

## 5. Verification Results

Backend suite (SQLite, `.venv` Python 3.13): 134 tests, 133 passed, 1 skipped, 0 failures (21 new in `scores/tests_mvp2.py`). `tsc --noEmit` 0 errors; `vite build` OK (Tone.js in a lazy chunk).

| Check | Result | Evidence |
|---|---|---|
| Backend tests | PASS | Events, key signature, bar accidentals, rests, reasons NOT_ABC/UNSUPPORTED_ELEMENTS |
| Browser | PASS | Button toggles to "Detener piano", pauses the solfege audio, stops cleanly; no console error |
| Audible piano timbre | NOT VERIFIED | The reviewer cannot hear the embedded browser |

## 6. Scope Boundary, Deviations and Open Items

- Uses a triangle-wave `PolySynth` instead of bundled piano samples (ADR's documented fallback; sample licence pending, ARCH-RISK-206).
- Sound quality not reviewed by ear.

## 7. Final Status

`IMPLEMENTED_WITH_GAPS`
