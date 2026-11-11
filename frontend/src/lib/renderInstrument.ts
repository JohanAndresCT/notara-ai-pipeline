// HU20 (proposed, CR-005) — instrument audio for playback and MP3 download.
// AI instruments (DEC-242) use the Magenta DDSP neural model; if it cannot load or run,
// the Tone.js synthesis patch is used instead. MP3 encoding runs in the browser (lamejs).
import type { ScorePlayback } from "./api";
import { DDSP_SAMPLE_RATE, synthesizeDdsp, type DdspKind } from "./ddsp";
import { createVoice, isAiInstrument, type InstrumentKind } from "./instruments";

type ToneModule = typeof import("tone");

const SAMPLE_RATE = 44100;
const KBPS = 128;
const TAIL_SECONDS = 1.8; // let the last notes and the reverb ring out
const AI_REVERB = { decay: 2.2, wet: 0.22 };

export type AiAudio = { buffer: AudioBuffer; needsReverb: boolean };
const aiCache = new WeakMap<ScorePlayback, Map<InstrumentKind, AiAudio>>();

/** AI (DDSP) audio for the score, cached per page so replay and download reuse it. */
export async function aiInstrumentAudio(playback: ScorePlayback, kind: InstrumentKind): Promise<AiAudio> {
  let perScore = aiCache.get(playback);
  if (!perScore) {
    perScore = new Map();
    aiCache.set(playback, perScore);
  }
  const cached = perScore.get(kind);
  if (cached) return cached;
  const audio: AiAudio = { buffer: toAudioBuffer(await synthesizeDdsp(playback, kind as DdspKind)), needsReverb: true };
  perScore.set(kind, audio);
  return audio;
}

export function toAudioBuffer(samples: Float32Array): AudioBuffer {
  const buffer = new AudioBuffer({ length: samples.length, numberOfChannels: 1, sampleRate: DDSP_SAMPLE_RATE });
  buffer.copyToChannel(Float32Array.from(samples), 0);
  return buffer;
}

/** Starts the AI audio on the live context; returns a stop function. */
export async function playAiBuffer(Tone: ToneModule, audio: AiAudio, onEnded: () => void) {
  const room = new Tone.Reverb(audio.needsReverb ? AI_REVERB : { decay: 0.1, wet: 0 }).toDestination();
  await room.ready;
  const player = new Tone.Player(audio.buffer).connect(room);
  player.onstop = onEnded;
  player.start(Tone.now() + 0.05);
  return () => {
    player.onstop = () => undefined;
    player.stop();
    player.dispose();
    room.dispose();
  };
}

function toInt16(samples: Float32Array) {
  const out = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

async function renderSynth(Tone: ToneModule, playback: ScorePlayback, kind: InstrumentKind) {
  const secondsPerBeat = 60 / (playback.tempo_bpm ?? 100);
  const end = playback.events.reduce((max, event) => Math.max(max, (event.start + event.duration) * secondsPerBeat), 0);
  const startAt = 0.05;
  return Tone.Offline(
    async () => {
      const voice = createVoice(Tone, kind);
      await voice.ready;
      for (const event of playback.events) {
        if (event.midi === null) continue;
        voice.play(
          Tone.Frequency(event.midi + voice.transpose, "midi").toFrequency(),
          Math.max(0.05, event.duration * secondsPerBeat * 0.95),
          startAt + event.start * secondsPerBeat,
        );
      }
    },
    startAt + end + TAIL_SECONDS,
    2,
    SAMPLE_RATE,
  );
}

async function renderAi(Tone: ToneModule, playback: ScorePlayback, kind: InstrumentKind) {
  const audio = await aiInstrumentAudio(playback, kind);
  if (!audio.needsReverb) return new Tone.ToneAudioBuffer(audio.buffer);
  return Tone.Offline(
    async () => {
      const room = new Tone.Reverb(AI_REVERB).toDestination();
      await room.ready;
      new Tone.Player(audio.buffer).connect(room).start(0);
    },
    audio.buffer.duration + 1.5,
    2,
    SAMPLE_RATE,
  );
}

/** MP3 of the whole score with the chosen instrument; ``usedAi`` tells which engine played it. */
export async function renderInstrumentMp3(playback: ScorePlayback, kind: InstrumentKind): Promise<{ blob: Blob; usedAi: boolean }> {
  const Tone = await import("tone");
  let rendered;
  let usedAi = false;
  if (isAiInstrument(kind)) {
    try {
      rendered = await renderAi(Tone, playback, kind);
      usedAi = true;
    } catch {
      rendered = undefined;
    }
  }
  if (!rendered) rendered = await renderSynth(Tone, playback, kind);

  const buffer = rendered.get();
  if (!buffer) throw new Error("empty render");
  const left = toInt16(buffer.getChannelData(0));
  const right = toInt16(buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : buffer.getChannelData(0));

  const { Mp3Encoder } = await import("@breezystack/lamejs");
  const encoder = new Mp3Encoder(2, buffer.sampleRate, KBPS);
  const chunks: BlobPart[] = [];
  const block = 1152;
  for (let i = 0; i < left.length; i += block) {
    const data = encoder.encodeBuffer(left.subarray(i, i + block), right.subarray(i, i + block));
    if (data.length) chunks.push(Uint8Array.from(data));
  }
  const tail = encoder.flush();
  if (tail.length) chunks.push(Uint8Array.from(tail));
  return { blob: new Blob(chunks, { type: "audio/mpeg" }), usedAi };
}
