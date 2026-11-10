# P06.11 US-011 Dictate a Score by Voice — Implementation Record

## 1. Metadata

| Field | Value |
|---|---|
| Story | US-011 / HU11 — Dictate a score by voice |
| Priority / SP | P0 / 8 SP (provisional, DEC-208) — MVP Core |
| Story prompt | `ai-pipeline/prompts/06_implementation/P06.11_US-011_dictate_score_by_voice.md` |
| Generation prompt | `P06_implementation.md` v2.0 (story mode) |
| Backend | Alejandro Zamorano — branch `mvp-2` (commits `784864a`…`6fed2db`), merged into `pipeline/mvp2-p00-context` at `ca9f594` |
| Frontend | TEAM-001 working session — branch `pipeline/mvp2-p00-context` (not yet committed at the time of this record) |
| Date | 2026-11-09 |
| Status | `IMPLEMENTED_WITH_GAPS` |

## 2. Summary

A logged-in user on "Crear partitura" can press **Dictar**, record up to 30 seconds in Spanish and get the dictation inserted as a complete ABC document in "Tu partitura", with the ABC format selected, for review before publication. The audio is transcribed on Notara's backend by a local Whisper Base model, converted by a deterministic closed-vocabulary parser, and never stored or logged. The end-to-end path with a real microphone and the HU11 acceptance measurements are still pending.

## 3. Traceability

| Item | Implementation |
|---|---|
| AC-030 / FR-018 / FR-029 / M-11 | `DictationPanel.tsx`: notice shown before recording; `transcribeDictation()` posts to `POST /api/v1/audio/stt/`; backend `voice/views.py` → `SttAdapter` (`voice/adapters.py`) |
| AC-031 / FR-019 / BR-013 / BR-025 | Backend parser `voice/dictation.py` returns `abc_document` with headers for an empty field; frontend inserts it, selects ABC, focuses the field |
| AC-032 / FR-021 / M-01 | `DICTATION_UNINTERPRETABLE` (422) → "No se pudo interpretar el dictado musical"; field unchanged |
| AC-033 / FR-020 | Collapsible "Vocabulario soportado" with BR-013 terms and the backlog example |
| AC-034 / FR-030 / M-05 / M-05b | 30 s countdown, automatic stop at 29.5 s; client 2 MB check; backend size/duration validation (`voice/audio.py`) |
| AC-035 / NFR-005 / M-04 / M-04b | Permission failure and unsupported/insecure context shown; form remains usable |
| AC-036 / FR-025 / DEC-218 | Inserted content goes through the unchanged MVP 1 publish validation |
| AC-073-AC-076 / FR-045 / DEC-219 / M-17 | Backend quota (`voice/quota.py`, `voice/models.py`); 429 mapped to M-17 in the client |
| AC-075 / FR-043 | Backend: authentication, CSRF (custom failure view `voice/csrf.py`), validation before inference |
| AC-070-AC-072 | Acceptance measurements (corpus, p95, memory) — not part of this code; pending (PRE-011) |
| NFR-004 / DEC-214 | No dictation audio or transcript persisted or logged (backend) |
| P04 section 9 | Live region for recording/processing, visible explanation for the disabled button, keyboard-operable buttons, 375 px layout |

## 4. Implemented Components

| File | Change |
|---|---|
| `backend/voice/*` (`views.py`, `adapters.py`, `audio.py`, `dictation.py`, `quota.py`, `models.py`, `csrf.py`, `model_*`, `provision_model.py`, `tests.py`, migration `0001`) | STT endpoint, model provisioning/verification, parser, quota, tests (Alejandro) |
| `backend/notara_backend/settings.py`, `urls.py`, `requirements.txt`, `Dockerfile`, `deploy/entrypoint.sh` | Configuration, route `/api/v1/audio/`, dependencies, model baking, 1×4 gthread runtime when STT is required (Alejandro) |
| `frontend/src/lib/api.ts` | `transcribeDictation()` and error-code → message mapping |
| `frontend/src/DictationPanel.tsx` | New dictation panel (REG-001, REG-008) |
| `frontend/src/ScoreCreatePage.tsx` | Controlled title/content, dictation insertion, character counter, disabled state while the field has content |
| `frontend/src/index.css` | Voice panel styles, recording indicator (reduced-motion aware), mobile layout, `.sr-only` |

## 5. API and Data Behavior

- `POST /api/v1/audio/stt/` (multipart `audio`, optional `title`) → `200 {transcript, meter, abc_line, abc_document}` or `{code, message, errors}` with 400/401/403/413/422/429/503 (`docs/API_STT_HU11.md`).
- The client sends the recorded container (`webm`/`ogg`/`mp4`); the backend strips MIME parameters and checks the real container.
- The client inserts only `abc_document`, and only into an empty field.

## 6. Database and Migrations

`voice.0001_stt_inference_quota` (per-user/UTC-day STT counter). Applied locally on SQLite without errors.

## 7. Verification Results

| Check | Result | Evidence |
|---|---|---|
| Backend suite (SQLite, `.venv` Python 3.13) | PASS | 113 tests: 112 passed, 1 skipped (PostgreSQL-only), 0 failures |
| `tsc --noEmit` | PASS | 0 errors |
| `vite build` | PASS | Built without errors |
| Model provisioning | PASS | `Systran/faster-whisper-base@ebe41f7…` SHA-256 verified; backend started with `STT_MODEL_REQUIRED=true` |
| Real endpoint, generated 1 s WAV | PASS (error path) | 422 `DICTATION_UNINTERPRETABLE` in ~1.5 s; no server error |
| Unauthenticated request | PASS | 401 `AUTHENTICATION_REQUIRED` |
| Panel rendering, disabled state with content | PASS | Browser pane, desktop and 375 px (no horizontal scroll) |
| Microphone denied | PASS | Browser pane blocks capture; M-04 shown, form usable |
| **Recording with a real microphone and speech** | **NOT RUN** | The embedded browser blocks the microphone; must be checked in Chrome/Edge/Firefox at `http://localhost:5173` |
| Acceptance corpus / p95 / memory (AC-070-AC-072) | NOT RUN | PRE-011 |
| Playwright E2E | NOT RUN | Selectors used by the suite ("Tu partitura *", "Crear partitura") unchanged |

## 8. Scope Boundary, Deviations and Open Items

- **Append to a populated field not implemented.** The endpoint returns a full document; `docs/API_STT_HU11.md` forbids appending until P02 Q-029 is resolved. The button is disabled with "El dictado genera una partitura ABC completa. Vacía el campo para dictar." (stricter than UX-PROP-001).
- **Edit page not covered.** AC-030 mentions the edit page, but the delivered HU05 edit page does not edit content; adding content editing is a scope decision for the team.
- **AUDIO_INVALID** shows the server wording ("El formato, la duración o el contenido del audio no son válidos.") instead of M-01, because the cause is the audio, not the dictation.
- **M-17** is shown without the numeric limit, which the API does not return.

## 9. Definition of Done

| Item | Status | Evidence / Remaining action |
|---|---|---|
| Dictation inserts ABC from real speech | PENDING | Real-microphone test in a desktop browser |
| Errors shown without server errors | PASS | Error mapping and real 422/401 responses |
| Limits (30 s, 2 MB, daily quota) | PASS (code/tests) | Client timer and size check; backend tests |
| Privacy (no storage/logging) | PASS (backend tests/code review) | `voice` tests and code |
| Acceptance gates AC-070-AC-072 | PENDING | PRE-011 measurements |
| Product Owner review | PENDING | — |

## 10. Final Status

`IMPLEMENTED_WITH_GAPS` — code complete for the empty-field dictation flow on the create page; real-microphone verification and HU11 acceptance measurements pending.


## Addendum 2026-11-10 — populated field, edit page and vocabulary prompt

- **Q-029 resolved (DEC-239):** dictation appends to existing ABC per BR-025 (`frontend/src/lib/dictationMerge.ts`), rescaling durations to the existing `L:`. Plain text, header-less ABC and empty required headers are refused before recording.
- **Edit page:** dictation available on `ScoreEditPage` (FR-018).
- **Vocabulary prompt:** `voice/dictation.py` `DICTATION_PROMPT` passed as Whisper `initial_prompt` by the dictation view only. With Edge-synthesized speech "Do negra, Re corchea, Mi corchea, barra, Sol blanca", Whisper Base produced "Donegra, recorcea, mi corcea…" (uninterpretable) without it and the exact phrase with it.
- **Browser evidence:** the same speech, fed as a microphone stream on the edit page, appended `C2 D E | G4` to a score with `L:1/8`; saved and shown in the detail page.
- Still pending: real-microphone test and the AC-070..072 corpus.
