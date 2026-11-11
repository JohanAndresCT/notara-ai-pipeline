# US-020 Play the Score with Other Instruments — Validation Report

| Field | Value |
|---|---|
| Validator | `P06_code_review.md` v2.0 (story mode) |
| Date | 2026-11-11 |
| Overall result | `PASS_WITH_WARNINGS` |
| Execution status | `PARTIAL` (human listening / real microphone pending) |
| DoD status | `PENDING_REVIEW` (approved scope; formal approval record pending, Q-030) |

## Acceptance criteria

| Criterion | Result | Evidence |
|---|---|---|
| AC-090 six instruments play; "Detener" | PASS | Browser: all buttons toggle; labels "Reproducir/Detener <instrumento>" |
| AC-091 one audio at a time | PASS | Starting solfege/tutor or another instrument stops the current one |
| AC-092 score instrument highlighted | PASS | `selected` class from the score's instrument |
| AC-093 plain text/unsupported disabled | PASS | Same blockedText as HU15 (M-02/M-03) |
| AC-094 AI with badge; fallback with notice | PASS | DDSP playback; blocked host → Tone.js + M-20 |
| AC-095 per-instrument MP3; solfege MP3 separate | PASS | Files `<titulo>-<instrumento>.mp3`; "Descargar solfeo (MP3)" kept |
| AC-096 reduced motion | PASS_WITH_LIMITATION | CSS media query disables particles/animations; not toggled in the test browser |

## Verification

Backend suite (SQLite, Python 3.13 venv): 165 tests, 164 passed, 1 skipped. `tsc --noEmit` 0 errors; `vite build` OK (TensorFlow.js in a lazy chunk).

## Findings

| ID | Severity | Finding | Recommendation |
|---|---|---|---|
| IMPL-VAL-020-01 | MEDIUM | Implemented before the formal approval record of CR-005 existed. | Attach the approval record (Q-030). |
| IMPL-VAL-020-02 | LOW | AI models depend on a third-party host. | Self-host checkpoints if required (ARCH-RISK-211). |
| IMPL-VAL-020-03 | LOW | Sound quality not reviewed by ear. | Listen in a desktop browser. |

## Decision

`PASS_WITH_WARNINGS` — no HIGH/CRITICAL findings. Approved scope per P02 v5.6; the formal approval record (Q-030) is still pending.
