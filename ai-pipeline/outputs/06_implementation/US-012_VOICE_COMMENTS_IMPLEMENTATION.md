# P06.12 US-012 Leave a Voice Comment — Implementation Record

## 1. Metadata

| Field | Value |
|---|---|
| Story | US-012 / HU12 — Leave a Voice Comment |
| Priority / SP | P1 / 3 SP — MVP Supporting |
| Story prompt | `ai-pipeline/prompts/06_implementation/P06.12_US-012_voice_comments.md` |
| Generation prompt | `P06_implementation.md` v2.0 (story mode) |
| Contributor | TEAM-001 working session — branch `pipeline/mvp2-p00-context` (uncommitted at the time of this record) |
| Date | 2026-11-09 |
| Status | `IMPLEMENTED_WITH_GAPS` |

## 2. Summary

An authenticated user records up to 30 s on another user's score, previews it and sends it; the backend transcribes it with the local Whisper model and stores one comment with the text and its audio. The audio is served only to authenticated users and is deleted with the comment.

## 3. Traceability

P02 US-012; AC-037-AC-042, AC-071 (renumbered AC-077 on merge), AC-072/AC-076; FR-026-FR-030, FR-043, FR-045, FR-046; BR-017-BR-019, BR-022, BR-027, BR-029-BR-031 · DEC-211, DEC-214, DEC-219, DEC-231, DEC-233, DEC-235 · P04 FLOW-010, FLOW-013, FLOW-018; REG-005-REG-007; SCR-011; M-04, M-05, M-05b, M-09, M-11, M-17 · P05 ADR-011

## 4. Implemented Components

| File | Change |
|---|---|
| backend/scores/models.py | `Comment.kind`, `audio`, `audio_mime`; body column up to 1,000 (text keeps 500 in views) |
| backend/scores/migrations/0006_* | Schema for voice comments |
| backend/scores/views.py | Multipart branch on `POST /api/v1/scores/{id}/comments/` (`_create_voice_comment`), `comment_audio_view`, `kind`/`audio_url` in comment data |
| backend/scores/signals.py, apps.py | `post_delete` removes the audio file on commit (direct, score cascade, administrative user deletion) |
| backend/voice/transcription.py | Shared transcription with upload validation, inference slot and the shared STT quota |
| backend/notara_backend/urls.py | `GET /api/v1/comments/{id}/audio/` |
| frontend/src/VoiceCommentComposer.tsx | Record, preview (UX-PROP-003), send/discard, notice M-11 (voice-comment wording) |
| frontend/src/lib/useRecorder.ts | Recording hook shared with dictation |
| frontend/src/ScoreDetailPage.tsx | Composer only on others' scores; voice badge and audio player; delete confirmation (UX-PROP-006) |
| frontend/src/lib/api.ts | `createVoiceComment()` and error mapping |

## 5. Verification Results

Backend suite (SQLite, `.venv` Python 3.13): 134 tests, 133 passed, 1 skipped, 0 failures (21 new in `scores/tests_mvp2.py`). `tsc --noEmit` 0 errors; `vite build` OK (Tone.js in a lazy chunk).

| Check | Result | Evidence |
|---|---|---|
| Backend tests (6 voice-comment cases) | PASS | Created with audio; up to 1,000 characters kept, 1,001 rejected; own score, empty transcript and invalid audio rejected; audio requires authentication; audio deleted with the comment and on cascade; text comments keep 500 |
| Real Whisper, synthesized Spanish speech (6.6 s WAV) via the live API | PASS | 201 in 1.2 s; transcript stored; audio served `audio/wav` |
| Browser: comment rendered with badge and player | PASS | Detail page as non-author |
| Browser: delete with confirmation | PASS | Confirmation text mentions the audio; comment removed; audio URL then 404 |
| Browser: composer hidden on own score | PASS | Text score owned by the user |
| Recording with a real microphone | NOT RUN | Embedded browser blocks the microphone |
| Railway storage persistence (PRE-005) | NOT RUN | Required before production |

## 6. Scope Boundary, Deviations and Open Items

- Real-microphone recording not verified (pane blocks capture).
- Production depends on Railway `/data` persistence (PRE-005, ARCH-VAL-202).
- Audio duration is not stored (`audio_duration_ms` in P05 was omitted as unused).
- Text comments still use the existing JSON path; the 500-character limit is unchanged.

## 7. Final Status

`IMPLEMENTED_WITH_GAPS`
