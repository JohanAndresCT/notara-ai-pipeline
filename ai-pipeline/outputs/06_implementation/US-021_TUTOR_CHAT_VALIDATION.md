# US-021 Talk to the Music Tutor — Validation Report

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
| AC-083 live voice answer with text | PASS_WITH_LIMITATION | Simulated microphone: live in 1.9 s, question transcribed, spoken answer with transcript |
| AC-084 score context and scope | PASS | Instruction includes title, instrument, format, ABC summary, content; answers about the score (4/4) |
| AC-085 2 min, Terminar, Reiniciar | PASS | Socket closed 1000; microphone released; restart clears chat |
| AC-086 daily limit | PASS | `voice/tests_tutor.py::test_session_daily_limit` |
| AC-087 typed fallback | PASS | Typed answer in 3.1 s; microphone-denied message |
| AC-088 key never in browser; single-use locked token | PASS | Test asserts key absent and `uses: 1`; client override of instructions ignored (live test) |
| AC-089 plain-text scores | PASS | `test_plain_text_score_context` |

## Verification

Backend suite (SQLite, Python 3.13 venv): 165 tests, 164 passed, 1 skipped. `tsc --noEmit` 0 errors; `vite build` OK (TensorFlow.js in a lazy chunk).

## Findings

| ID | Severity | Finding | Recommendation |
|---|---|---|---|
| IMPL-VAL-021-01 | MEDIUM | Implemented before the formal approval record of CR-007 existed. | Attach the approval record (Q-030). |
| IMPL-VAL-021-02 | MEDIUM | `v1alpha` endpoint and alias model. | Pin a dated model before production (ARCH-RISK-212). |
| IMPL-VAL-021-03 | LOW | Real-microphone conversation not run. | Test in Chrome/Edge. |
| IMPL-VAL-021-04 | LOW | Frontend limit message omits the number (UX-VAL-211). | Use the server message. |

## Decision

`PASS_WITH_WARNINGS` — no HIGH/CRITICAL findings. Approved scope per P02 v5.6; the formal approval record (Q-030) is still pending.
