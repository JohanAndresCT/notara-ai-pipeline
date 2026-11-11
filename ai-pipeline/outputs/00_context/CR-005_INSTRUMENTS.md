# CR-005 — Play the score with other instruments (proposed HU20)

| Field | Value |
|---|---|
| Status | **PROPOSED** — implemented in the working branch; pending team approval. AI instruments: DEC-242 |
| Requested by | TEAM-001 (Johan), 2026-11-10 |
| Affects | HU15 / US-015 (instrument playback), UX REG-004, ADR-010 |
| Branch | `pipeline/mvp2-p00-context` (uncommitted at the time of writing) |

## 1. Request

Besides the piano, let the user play an ABC score with **guitar, violin, flute and a cappella voice**, each with its own icon and animation. While an instrument plays, its icon and music notes rise from the button.

## 2. Proposed story

**HU20 / US-020 — Play the score with other instruments.** As a user viewing an ABC score, I want to choose the instrument that plays it, so that I can hear how the melody sounds on my own instrument.

| AC | Given / When / Then |
|---|---|
| AC-020-01 | Given a score with valid ABC, when I choose Piano, Guitarra, Violín, Flauta or Voz a cappella, then the melody plays in the browser with that instrument's sound and the button shows "Detener". |
| AC-020-02 | Given an instrument is playing, when I choose another instrument, the solfege or the tutor, then the previous playback stops (one audio at a time, UX-PROP-002). |
| AC-020-03 | Given the score's instrument matches one of the options, when the panel loads, then that option is highlighted. |
| AC-020-04 | Given a plain-text or unsupported score, then all instruments are disabled with M-02 / M-03 (same as HU15). |
| AC-020-05 | Playback makes no server or third-party request and does not use the daily audio limit. |
| AC-020-06 | With "reduce motion" enabled, no rising icons or animations are shown. |
| AC-020-07 | Given an instrument is selected, when I press "Descargar <instrumento> (MP3)", then an MP3 of the whole score played with that instrument is downloaded, named `<titulo>-<instrumento>.mp3`. The spoken-solfege MP3 of HU18 stays available as "Descargar solfeo (MP3)". |

## 3. Technical approach (prototype)

- `frontend/src/lib/instruments.ts`: one Tone.js synthesis patch per instrument (no samples, no network):
  - Piano: triangle `PolySynth` (HU15 patch).
  - Guitar: `PluckSynth` (Karplus-Strong plucked string), one octave lower, short reverb.
  - Violin: sawtooth `PolySynth` + low-pass filter + vibrato + reverb.
  - Flute: sine `PolySynth` + light vibrato + pink-noise breath, one octave higher.
  - Voice a cappella: detuned `fatsawtooth` through two vowel formant filters ("aah", 800 Hz / 1150 Hz) + vibrato + chorus + reverb.
- `frontend/src/ListeningPanel.tsx`: "Tocar con" picker; rising icon/note particles from the playing button; equaliser bars; reverb is awaited before scheduling notes.
- `frontend/src/lib/renderInstrument.ts`: renders the selected instrument with `Tone.Offline` (faster than real time, silent) and encodes MP3 in the browser with `@breezystack/lamejs` 1.2.7 (LGPL-3.0), 128 kbps stereo.
- Data: unchanged — uses the `playback` events already returned by `GET /api/v1/scores/{id}/` (ADR-010).

## 4. Limitations

- Sounds are **synthesised imitations**, not recordings; realism is limited (same licence question as sampled piano, ARCH-RISK-206).
- The a cappella voice is a sung vowel ("aah"), not lyrics or note names (that is the solfege, HU13).

## 5. Classification

- **AI (DEC-242):** violin, flute, trumpet and tenor saxophone are synthesised by **Google Magenta DDSP** neural models (TensorFlow.js in the browser), marked "IA" in the UI.
- **Not AI:** piano, guitar and a cappella voice (Tone.js synthesis), and the Tone.js fallback for the AI instruments.
- Other AI components of the project: Whisper (STT, HU11/HU12) and the neural TTS voices (ElevenLabs / edge-tts, HU13/HU14).

## 6. Pipeline actions if approved

P02: add US-020 with AC-020-01..06 and FR for instrument selection · P03: prioritise (suggested P2, 2 SP) · P04: REG-004 update · P05: ADR-010 note · P06.20 story record and validation · P07 tests.

## 7. Why not ElevenLabs for instrument audio

ElevenLabs offers speech, sound effects and music generation from a text prompt. None of them plays a given score note by note: music generation composes a new piece, so the result would not match the user's ABC. Instrument audio therefore stays with Tone.js (no AI). A note-accurate AI option would be Magenta DDSP (violin, flute, trumpet, saxophone), recorded as a future option.

## 8. Verification (2026-11-10, local)

Browser render of a 42-event score (Estrellita) for all five instruments: valid MP3 (MPEG frame header), 30.7 s, 480 KB, non-silent (peak 0.35-0.96), 6-10 s to render in the embedded browser; file names `estrellita-donde-estas-<instrumento>.mp3`. Listening quality not reviewed by ear.

## 9. AI instruments — Magenta DDSP (DEC-242, 2026-11-10)

**How it works:** `frontend/src/lib/ddsp.ts` turns the score events into two curves at 250 frames/s — pitch (f0, Hz, with a light 5.5 Hz vibrato) and loudness (dB, attack/decay/release per note), moved by whole octaves towards each model's mean pitch and scaled to the model's loudness range. The DDSP graph model (`f0_hz`, `loudness_db` → 16 kHz audio) runs in 5 s chunks with 0.5 s cross-fades; `postGain` from each checkpoint's `settings.json` is applied and peaks are limited. Playback adds a light reverb; MP3 download renders the same audio through `Tone.Offline` and lamejs. The custom `Roll` op is registered as in Magenta.js.

**Checkpoints:** `violin`, `flute`, `trumpet`, `tenor_saxophone` (model.json ≈ 381 KB + weights each), fetched on first use and cached by the browser.

**Fallback:** if TensorFlow.js or the model cannot load/run (no WebGL, offline, blocked), the Tone.js patch plays instead and the panel shows "La IA no está disponible en este navegador; se usó el sintetizador."

**Evidence (local, embedded browser, WebGL):**
- 14-note test melody: 10.5 s of audio generated in ~0.3 s per instrument; pitch measured by autocorrelation matched all 13 sampled notes for flute and 11/13 for violin (2 octave errors of the simple estimator).
- In the app (Estrellita, 42 events): violin started in 4.4 s on first use (model download) and ~1.2-1.6 s for trumpet/sax; MP3 downloads for trumpet and sax 31.2 s / 488 KB, rendered in 4.5-5.0 s, no fallback notice.
- Fallback: with the model host blocked, flute played with the Tone.js patch in 0.4 s and the notice was shown.
- Bundle: TensorFlow.js is a separate lazy chunk (1.08 MB, 272 KB gzip) loaded only when an AI instrument is used.
- Listening quality not reviewed by ear.

**Risks:** third-party model hosting (Google Cloud Storage) — self-host the four checkpoints under `frontend/public/` if required for the deployment; 16 kHz output; no expressive phrasing beyond the generated curves.

## 10. Changes 2026-11-10 (requester review)

- **A cappella voice removed** from the instrument picker and from playback/MP3 (the Tone.js "aah" patch sounded like an instrument, not a voice). A sung-voice option would need a singing-voice AI (see the proposal in the conversation summary: pitch-shifted ElevenLabs syllables or a singing-synthesis model); not implemented.
- Rising icons **and music notes** now use the colour of the playing instrument's button.
- Score and profile instrument lists add **Trompeta** and **Saxofón** (`instrumentOptions`, `PROFILE_INSTRUMENTS`).
- Score detail cards use `overflow: clip` so rising particles can never shift the card.

## 11. Sung voice with AI (option A, 2026-11-10) — **REMOVED the same day at the requester's request**

**What:** a "Voz cantada" option (badge IA) in "Tocar con" sings the score's melody with the solfege syllables in the AI voice.

**How:**
1. `POST /api/v1/audio/syllables/` (auth + CSRF) returns one MP3 with "Do. Re. Mi. Fa. Sol. La. Si." spoken by the TTS chain (ElevenLabs → edge-tts; SSML pauses for ElevenLabs). The text is the same for everyone, so after the first synthesis it comes from the shared cache and uses no quota.
2. `frontend/src/lib/sungVoice.ts` decodes it, finds the 7 voiced regions (10 ms RMS envelope), and measures each syllable's pitch with **YIN** on the vowel segment that will be sustained.
3. For each note, `Tone.GrainPlayer` plays the matching syllable (sharps/flats use the natural's syllable) from its consonant, loops the vowel to the note's duration and **re-pitches** it by `(note − syllable pitch) × 100` cents; the melody is moved by whole octaves into the voice's range; per-note gain fades avoid clicks; light reverb.
4. The rendered buffer is played or encoded to MP3 like the other instruments. No synthesis fallback: if the voice cannot be produced, the panel shows "No se pudo generar la voz cantada".

**Evidence (local, ElevenLabs voice "Sarah"):** 7 syllables detected (voice ≈ MIDI 51.4-57.2); 14-note test melody: **11/13 measured notes exact and 13/13 within one semitone** (YIN on the rendered audio); in the app *Estrellita* started in 3.9 s and the MP3 downloaded (30.4 s, 476 KB). Backend: 2 new tests (shared cache, auth). Listening quality not reviewed by ear — expect a "tuned speech" character, not a trained singer.

## 12. Removals (2026-11-10, requester decision)

- **"Voz cantada" removed** (section 11): frontend `lib/sungVoice.ts`, the instrument entry, `POST /api/v1/audio/syllables/` and its tests were deleted. It was part of this proposed CR (HU20), not a separate story.
- **"Voz" removed from the instrument lists** (score create/edit, community filter, profile `PROFILE_INSTRUMENTS`). Existing scores whose instrument is "Voz" keep it (the edit page shows the current value); a profile with "Voz" is shown as "Otro".
- Final instrument set: Piano, Guitarra (Tone.js); Violín, Flauta, Trompeta, Saxofón (Magenta DDSP, Tone.js fallback).
