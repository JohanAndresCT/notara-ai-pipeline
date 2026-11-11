# CR-006 — AI interpretation of dictation with Gemini (amends HU11 / US-011)

| Field | Value |
|---|---|
| Status | **IMPLEMENTED** (2026-11-10) — approved by the requester (Johan); team ratification pending (DEC-243) |
| Requested by | TEAM-001 (Johan), 2026-11-10 |
| Affects | HU11 / US-011 (dictation), FR-019, FR-021, BR-013, BR-025, M-01, M-11, AC-070 |
| Course AI tool | **Google Gemini API** (course list item 8, Gemini family) |

## 1. Problem

Whisper sometimes writes the dictated words in ways the deterministic parser does not accept, for example "Donegra" (Do negra), "se mi corchea" (semicorchea), "Son blanca" (Sol blanca) or "con paz" (compás). One wrong word makes the whole dictation fail with M-01, even when the intention is clear. In the synthetic corpus (MVP2 manual checklist §7) 6 of 27 dictations failed only for this reason.

## 2. Change

When the parser cannot interpret the transcript, the backend asks **Gemini** to rewrite the transcript using only the supported vocabulary (BR-013), and then parses the rewritten text **with the same deterministic parser**. The parser stays the only source of the ABC, so Gemini cannot add notes that are not in the dictation.

```
audio → Whisper (STT) → transcript → parser ── ok ─────────────→ ABC
                                        └─ fails → Gemini normalises text → parser ── ok → ABC
                                                                                └─ fails → M-01
```

## 3. Rules (proposed BR-032)

- Gemini receives **only the transcript text** (never the audio) and the vocabulary list; it must return text in the vocabulary or an "unintelligible" marker.
- Gemini may fix spelling, spacing and word splits, and map close synonyms (e.g. "semi corchea" → "semicorchea", "Donegra" → "Do negra"); it must not add, remove or reorder notes, figures, bars or meter.
- Safety check (as implemented): the parsed result may not contain more notes/rests than the transcript has words; otherwise it is discarded (M-01). The rewritten text must also pass the same deterministic parser.
- The page shows the interpreted dictation before publishing (existing review step) and labels it "Interpretado con IA" when Gemini was used.
- If Gemini is unavailable, slow (> 8 s) or not configured, the current behaviour applies (M-01). Dictation never depends on Gemini to work.
- Quota (as implemented): Gemini is called at most once per STT request and only when the parser fails, so it is bounded by the STT daily limit (30 per user, DEC-219); no separate counter.

## 4. Proposed acceptance criteria (US-011 additions)

| ID | Criterion |
|---|---|
| AC-078 | Given the transcript contains recognisable dictation words written incorrectly (e.g. "Donegra, recorcea"), when the parser fails, then the AI normalisation is applied and the expected ABC (e.g. `C D/2`) is inserted for review, labelled "Interpretado con IA". |
| AC-079 | Given the transcript is unrelated to music (e.g. "hola qué tal"), when the AI normalisation runs, then no ABC is produced and M-01 is shown. |
| AC-080 | Given the AI service is unavailable, misconfigured or exceeds 8 s, when the parser fails, then M-01 is shown and no server error reaches the user. |
| AC-081 | Given the AI normalisation is used, then only the transcript text is sent to the provider (never audio) and the M-11 notice for dictation mentions that the text may be processed by an AI provider. |
| AC-082 | Given the evaluation corpus (AC-070), when measured with the AI normalisation enabled, then exact results are reported both with and without it. |

## 5. Technical approach

- Backend: new `voice/normalizer.py` adapter (Gemini API via HTTPS, key in `.env` as `GEMINI_API_KEY`), called from `voice/views.py` only after `Uninterpretable`; JSON-only response; timeout 8 s; fake adapter in tests.
- Frontend: label "Interpretado con IA" in the dictation feedback; updated M-11 text.
- Privacy/ops: document the provider in the privacy notice; key never sent to the browser.

## 6. Pipeline actions if approved

P02: US-011 amendment (AC-078..082, BR-032, updated FR-019/M-11) · P04: REG-001 label and notice · P05: ADR note (second AI provider for dictation) · P06.11 increment with tests · P07: corpus with/without AI.

## 7. Implementation (2026-11-10)

- `backend/voice/normalizer.py`: `GeminiNormalizer` (REST `generateContent`, key in the `x-goog-api-key` header, JSON schema output `{status, text}`, temperature 0, 8 s timeout); `get_normalizer()` returns None when `GEMINI_API_KEY` is empty or `DICTATION_AI_ENABLED=false`.
- `backend/voice/views.py`: Whisper still runs inside the inference slot; parsing and the AI call run after the slot is released. `interpret_with_ai()` never raises; response field `ai_interpreted`.
- Settings / `.env.example`: `GEMINI_API_KEY`, `GEMINI_MODEL` (default `gemini-3.5-flash-lite`; `gemini-2.5-flash-lite` is no longer available to new keys), `GEMINI_TIMEOUT_SECONDS=8`, `DICTATION_AI_ENABLED`.
- Frontend: feedback "Dictado interpretado con IA (Gemini). Revísalo antes de publicar."; M-11 notice mentions that only the transcript text may be sent to Google Gemini.
- Tests: 6 new (`voice/tests.py::DictationAiTests`) with a fake normalizer; real calls never run in tests.

## 8. Evidence (real Gemini, local)

| Whisper transcript | Result |
|---|---|
| "compás cuatro cuartos, donegra, Re corchea, Mi corchea." | `M:4/4 C D/2 E/2` ✔ |
| "Re se mi corchea, Mi se mi corchea, Fa corchea, Sol negra, Barra, La blanca." | `D/4 E/4 F/2 G \| A2` ✔ |
| "Son blanca, La negra, Si negra." | `G2 A B` ✔ |
| "Donegra, recorcea, mi corcea, barra, sol blanca." | `C D/2 E/2 \| G2` ✔ |
| "Do resonda, barra, Re re ronda." | rejected (M-01) — conservative miss |
| "Do redonda, barra, redonda." (note missing) | rejected (M-01) ✔ |
| "hola qué tal, buenos días a todos" | rejected (M-01) ✔ |
| "Me gusta mucho la melodía, el segundo con paz suena muy bien." | rejected (M-01) ✔ |

7 of 8 as expected, no invented notes. Gemini latency 0.9-7.0 s per call (provider-side variance). End to end in the app (simulated microphone, Edge-synthesised speech): transcript "Son blanca, La negra, Si negra." → `G2 A B` inserted with the AI label in 7.2 s. Real-microphone and AC-082 corpus measurement still pending.
