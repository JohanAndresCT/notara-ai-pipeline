# P06.13 US-013 Listen to the Spoken Solfege — Implementation Record

## 1. Metadata

| Field | Value |
|---|---|
| Story | US-013 / HU13 — Listen to the Spoken Solfege |
| Priority / SP | P0 / 5 SP — MVP Core |
| Story prompt | `ai-pipeline/prompts/06_implementation/P06.13_US-013_spoken_solfege.md` |
| Generation prompt | `P06_implementation.md` v2.0 (story mode) |
| Contributor | TEAM-001 working session — branch `pipeline/mvp2-p00-context` (uncommitted at the time of this record) |
| Date | 2026-11-09 |
| Status | `IMPLEMENTED_WITH_GAPS` |

## 2. Summary

On an ABC score, "Escuchar Solfeo" returns an MP3 of a Spanish voice naming the notes in order, which plays automatically. Plain-text scores show the option disabled; scores with unsupported ABC show M-03.

## 3. Traceability

P02 US-013; AC-043-AC-048; FR-031-FR-033, FR-036, FR-037, FR-043, FR-044; BR-015, BR-017, BR-022, BR-026 · DEC-202, DEC-206, DEC-207, DEC-213, DEC-230 · P04 FLOW-014; REG-003, REG-004; M-02, M-03, M-10, M-15 · P05 ADR-006, ADR-010, ADR-012

## 4. Implemented Components

| File | Change |
|---|---|
| backend/scores/abc_reader.py | ABC subset reader, `solfege_text()` (commas for engines without pause markup; SSML breaks proportional to duration for ElevenLabs) |
| backend/voice/tts.py | Fake, Edge and ElevenLabs adapters |
| backend/voice/synthesis.py | Cache → quota → primary → fallback |
| backend/voice/speech_views.py | `POST /api/v1/scores/{id}/audio/solfege/` returning `audio/mpeg` |
| backend/voice/models.py + migration 0002 | `SynthesizedAudio`, `VoiceSynthesisQuota` |
| backend/notara_backend/settings.py, .env.example | `VOICE_PRIMARY_ENGINE`, `VOICE_DAILY_LIMIT`, `TTS_TIMEOUT_SECONDS`, Edge/ElevenLabs settings |
| backend/requirements.txt | `edge-tts==7.3.1` (7.2.8 failed the handshake with the service) |
| frontend/src/ListeningPanel.tsx | "Escuchar Solfeo", shared audio player, disabled states |
| frontend/src/lib/api.ts | `synthesizeScoreAudio()` and error mapping |

## 5. Verification Results

Backend suite (SQLite, `.venv` Python 3.13): 134 tests, 133 passed, 1 skipped, 0 failures (21 new in `scores/tests_mvp2.py`). `tsc --noEmit` 0 errors; `vite build` OK (Tone.js in a lazy chunk).

| Check | Result | Evidence |
|---|---|---|
| Backend tests (reader + synthesis endpoints) | PASS | MP3 response, NOT_ABC 409, unsupported 422, 401, 404, limit 429 |
| Real `edge-tts` | PASS | 14.5 KB MP3 in 1.9 s from the adapter; 3.9 s audio played in the browser |
| Browser: plain-text score | PASS | All listening options disabled with M-02 |
| ElevenLabs primary | NOT RUN | No API key (PRE-004) |

## 6. Scope Boundary, Deviations and Open Items

- ElevenLabs not exercised (no key); pause-markup pacing only applies to that engine. With Edge the pace is constant, as DEC-206 allows.
- Audible quality reviewed only through duration/playback state.

## 7. Final Status

`IMPLEMENTED_WITH_GAPS`
