# P06.20 US-020 Play the Score with Other Instruments — Implementation Record

| Field | Value |
|---|---|
| Story | US-020 / HU20 (CR-005 — approved scope per P02 v5.6; formal approval record pending, Q-030) |
| Status | `IMPLEMENTED_WITH_GAPS` (listening by ear pending) |
| Date | 2026-11-11 |
| Decisions | DEC-242 |

## Implemented components

| File | Change |
|---|---|
| `frontend/src/lib/instruments.ts` | Instrument list (piano, guitar, violin, flute, trumpet, sax), AI flag, Tone.js patches (fallbacks), reverb readiness. |
| `frontend/src/lib/ddsp.ts` | DDSP inference with TensorFlow.js: f0/loudness curves at 250 fps from score events, octave placement, 5 s chunks with cross-fade, `Roll` op, post-gain and limiter. |
| `frontend/src/lib/renderInstrument.ts` | AI audio cache per page, playback through a Player + reverb, offline render and MP3 encoding (lamejs). |
| `frontend/src/ListeningPanel.tsx` | "Tocar con" picker, selection, AI badges, fallback notice M-20, per-instrument download, particles in the button colour, equaliser. |
| `frontend/src/StreamerBackground.tsx` | Instrument icons (incl. flute, trumpet, sax). |
| `frontend/src/brand-dash.css` | Picker, burst animation, colours per instrument, mobile grid. |
| `frontend/package.json` | `@tensorflow/tfjs` 4.22.0, `@breezystack/lamejs` 1.2.7 (exact). |
| `frontend/src/lib/api.ts`, `backend/accounts/views.py` | Trompeta/Saxofón added to instrument lists; "Voz" removed (CR-005 §12). |

## Verification

Backend suite (SQLite, Python 3.13 venv): 165 tests, 164 passed, 1 skipped. `tsc --noEmit` 0 errors; `vite build` OK (TensorFlow.js in a lazy chunk).

| Check | Result | Evidence |
|---|---|---|
| DDSP pitch accuracy (14-note melody) | PASS | Flute 13/13, violin 11/13 measured notes (2 estimator octave errors); ~0.3 s for 10.5 s of audio. |
| AI playback in the app | PASS | Violin started in 4.4 s on first use (model download); trumpet/sax 1.2–1.6 s; no fallback notice. |
| Fallback | PASS | With the model host blocked, flute played with Tone.js and M-20 was shown. |
| MP3 download | PASS | All instruments: valid MPEG, ~30.7–31.2 s, ~480 KB, 4.5–10 s render. |
| Particles colour | PASS | Icons and notes use the instrument colour (e.g. guitar rgb(234,88,12)). |
| 375 px | PASS | No overflow after the mobile grid fix. |
| Listening by ear | NOT RUN | Requires a human. |

## Gaps
Formal approval record (Q-030); models fetched from Google Cloud Storage (ARCH-RISK-211); listening quality not reviewed.
