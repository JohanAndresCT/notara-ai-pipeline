# P06.21 US-021 Talk to the Music Tutor — Implementation Record

| Field | Value |
|---|---|
| Story | US-021 / HU21 (CR-007) |
| Status | `IMPLEMENTED_WITH_GAPS` (real microphone pending) |
| Date | 2026-11-10 |
| Decision | DEC-244 |

Implementation and evidence: `00_context/CR-007_GEMINI_LIVE_TUTOR.md` §7-8.

| Criterion | Result |
|---|---|
| AC-083 live voice answer with text | PASS (simulated microphone) |
| AC-084 score context and scope | PASS (instructions include title, instrument, format, ABC summary and content; scope limited to music) |
| AC-085 2-minute limit, "Terminar", microphone released | PASS |
| AC-086 daily limit | PASS (backend tests) |
| AC-087 failure → typed question | PASS (typed answer in 3.1 s; microphone-denied message) |
| AC-088 key never in browser; ephemeral token; no stored audio | PASS (token test; key absent from response) |
| AC-089 plain-text scores | PASS (instruction test) |

Gaps: real-microphone conversation and listening by ear; Gemini Live model is an alias that Google may update.
