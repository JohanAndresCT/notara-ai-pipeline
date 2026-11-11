# CR-007 — Conversational music tutor with Gemini Live (new HU21 / US-021)

| Field | Value |
|---|---|
| Status | **IMPLEMENTED** (2026-11-10) — requested and approved by the requester (Johan); team ratification pending (DEC-244) |
| Requested by | TEAM-001 (Johan), 2026-11-10 |
| Affects | New story HU21 / US-021; EPIC-006 (Listening and Audio Learning); score detail page (REG-003/REG-004) |
| Course AI tool | **Google Gemini Live API** (course list item 8) |

## 1. Request

Add a "Preguntar al tutor" button on the score detail page so the user can **ask questions by voice** about the score ("¿qué compás tiene?", "¿cómo toco esto en guitarra?", "¿qué significa L:1/8?") and hear a spoken answer in Spanish, in a short live conversation.

## 2. Proposed story

**HU21 / US-021 — Talk to the music tutor about a score.** As a music student, I want to ask the tutor questions by voice about the score I am viewing, so that I can understand it and learn how to play it without leaving the page.

| ID | Criterion |
|---|---|
| AC-083 | Given an authenticated user on a score detail page, when they press "Preguntar al tutor" and accept the notice, then a live voice conversation starts and the tutor answers in Spanish with voice, also showing the text of each answer. |
| AC-084 | Given the conversation is active, then the tutor knows the score's title, instrument, format and content (ABC or text) and answers about that score and general music theory; it declines unrelated topics politely. |
| AC-085 | Given a conversation, then it ends automatically after 2 minutes or when the user presses "Terminar"; the microphone is released when it ends. |
| AC-086 | Given the user has used the tutor 5 times today (proposed limit), when they try again, then a clear daily-limit message is shown. |
| AC-087 | Given the microphone is denied or the AI service is unavailable, then a clear message is shown and the user can still type a question and receive a text answer (or use the existing audio tutor, HU14). |
| AC-088 | The Gemini API key never reaches the browser: the backend issues a short-lived token for each session; audio is streamed to the provider only during the session and is not stored by Notara. |
| AC-089 | Given a plain-text score, then the tutor still answers using the text content, stating that playback features need ABC. |

## 3. Technical approach

- **Backend:** `POST /api/v1/scores/{id}/tutor/session/` → checks auth, quota and score access; returns a short-lived Gemini Live ephemeral token plus the system instruction (role: patient music teacher in Spanish; score context; scope limits; short answers).
- **Frontend:** "Preguntar al tutor" panel: microphone streaming (16 kHz PCM) over the Gemini Live WebSocket, playback of the streamed audio answer, live transcript bubbles, 2-minute timer, "Terminar" button, typed-question fallback.
- **Model:** current Gemini Live model with native audio output (exact model name to be fixed at implementation).
- **Privacy:** new notice (M-18): "Tu voz se envía a Google Gemini durante la conversación para generar las respuestas; Notara no guarda el audio."

## 4. Risks

- Preview/real-time API: model names and limits change; pin and verify at implementation.
- Answers can be wrong (LLM): show "Respuesta generada por IA; puede contener errores".
- Cost/quota: free tier limits; per-user daily limit.
- Browser support for streaming audio; needs HTTPS in production (Railway provides it).

## 5. Estimate and priority

Suggested priority P2 (after HU11-HU19 acceptance); 5-8 SP (new endpoint, streaming client, UX, tests).

## 6. Pipeline actions if approved

P01/P02: new US-021 with AC-083..089, FR-047..FR-050, BR-033, M-18 · P03: prioritise · P04: new region REG-009 "Tutor conversacional" · P05: ADR for real-time AI provider and ephemeral tokens · P06.21 · P07 tests (mocked provider) · P08 security review of the token flow.

## 7. Implementation (2026-11-10)

- **Backend** `voice/tutor.py`, `voice/tutor_views.py`, model `TutorUsageQuota` (migration `voice.0003`):
  - `POST /api/v1/scores/{id}/tutor/session/` → single-use ephemeral token (`v1alpha/auth_tokens`, `uses: 1`, connect within 1 min, expires after `TUTOR_SESSION_SECONDS + 60`) with the **Live setup locked in the token** (model `gemini-2.5-flash-native-audio-latest`, AUDIO output, input/output transcription, tutor instructions with the score context). Verified that a client attempt to replace the instructions is ignored.
  - `POST /api/v1/scores/{id}/tutor/ask/` → typed fallback with `gemini-3.5-flash-lite` (`generateContent`).
  - Daily limits per user: 5 sessions, 20 typed questions (`TUTOR_DAILY_*`); quota released on provider failure; errors `TUTOR_DAILY_LIMIT_REACHED` 429, `TUTOR_UNAVAILABLE` 503, `QUESTION_INVALID` 400; auth + CSRF.
- **Frontend** `lib/liveTutor.ts` (WebSocket to `BidiGenerateContentConstrained`, AudioWorklet microphone capture at 16 kHz PCM16 in 100 ms packets, gap-free playback of 24 kHz PCM16 answers, barge-in stops playback), `TutorChat.tsx` (panel "Pregúntale al tutor": orb that reacts to voice level and speech, live pill with 2-minute countdown, "Terminar", chat bubbles from live transcriptions, suggestions, typed questions, M-18 notice and AI disclaimer).
- **Tests:** `voice/tests_tutor.py` (8, provider mocked).

## 8. Evidence (local, real Gemini)

- Typed question "¿Qué compás tiene?" on *Estrellita*: answered in 3.1 s, correct (4/4, M:4/4).
- Live session with simulated microphone (Edge-synthesised "Hola tutor, ¿qué compás tiene esta partitura?"): session live in 1.9 s; question transcribed; spoken answer played ("Esta partitura tiene un compás de cuatro por cuatro…") with its transcript; "Terminar" closed the socket (1000), released the microphone and showed "Conversación terminada".
- Raw Live test from Python: first audio after ~4.1 s for a text prompt; 13.4 s of 24 kHz audio.
- Mobile 375 px: no overflow after fixing the instrument grid.
- Pending: real-microphone conversation in a desktop browser; listening quality by ear.
