// AI instrument synthesis with Google Magenta DDSP (Engel et al., 2020) — CR-005 / DEC-242.
// The score's notes become two control curves (pitch f0 in Hz and loudness in dB, 250 frames
// per second). A neural network trained on recordings of a real instrument turns those curves
// into audio (16 kHz). The pitch comes from the score, so the AI plays exactly the written
// notes; it only supplies the instrument's timbre. Runs in the browser with TensorFlow.js;
// the pretrained models are Magenta's public checkpoints (Apache-2.0).
import type { ScorePlayback } from "./api";

export type DdspKind = "violin" | "flute" | "trumpet" | "sax";

const CHECKPOINTS: Record<DdspKind, string> = {
  violin: "violin",
  flute: "flute",
  trumpet: "trumpet",
  sax: "tenor_saxophone",
};
const BASE_URL = "https://storage.googleapis.com/magentadata/js/checkpoints/ddsp";

export const DDSP_SAMPLE_RATE = 16000;
const FRAME_RATE = 250; // frames per second expected by the models
const SAMPLES_PER_FRAME = DDSP_SAMPLE_RATE / FRAME_RATE; // 64
const CHUNK_FRAMES = 1250; // 5 s per inference, the size the checkpoints were exported for
const OVERLAP_FRAMES = 125; // 0.5 s cross-fade between chunks
const SILENCE_DB = -120;

type Settings = { averageMaxLoudness: number; meanLoudness: number; meanPitch: number; postGain?: number };
type Tf = typeof import("@tensorflow/tfjs");
type LoadedModel = { model: import("@tensorflow/tfjs").GraphModel; settings: Settings };

let tfPromise: Promise<Tf> | null = null;
const models = new Map<DdspKind, Promise<LoadedModel>>();

async function loadTf(): Promise<Tf> {
  if (!tfPromise) {
    tfPromise = (async () => {
      const tf = await import("@tensorflow/tfjs");
      // Custom op used by the exported graphs (same definition as Magenta.js).
      tf.registerOp("Roll", (node) => {
        const input = node.inputs[0] as import("@tensorflow/tfjs").Tensor;
        const halves = tf.split(input, 2, 2);
        const result = tf.concat([halves[1], halves[0]], 2);
        halves.forEach((tensor) => tensor.dispose());
        return result;
      });
      try {
        await tf.setBackend("webgl");
        tf.env().set("WEBGL_PACK", false);
        tf.env().set("WEBGL_CONV_IM2COL", false);
      } catch {
        await tf.setBackend("cpu");
      }
      await tf.ready();
      return tf;
    })().catch((error) => {
      tfPromise = null;
      throw error;
    });
  }
  return tfPromise;
}

function loadModel(kind: DdspKind): Promise<LoadedModel> {
  let pending = models.get(kind);
  if (!pending) {
    pending = (async () => {
      const tf = await loadTf();
      const url = `${BASE_URL}/${CHECKPOINTS[kind]}`;
      const [model, settings] = await Promise.all([
        tf.loadGraphModel(`${url}/model.json`),
        fetch(`${url}/settings.json`).then((response) => {
          if (!response.ok) throw new Error(`settings ${response.status}`);
          return response.json() as Promise<Settings>;
        }),
      ]);
      return { model, settings };
    })().catch((error) => {
      models.delete(kind);
      throw error;
    });
    models.set(kind, pending);
  }
  return pending;
}

/** Turns the score events into f0 / loudness curves in the range each model was trained on. */
function buildCurves(playback: ScorePlayback, settings: Settings) {
  const secondsPerBeat = 60 / (playback.tempo_bpm ?? 100);
  const notes = playback.events.filter((event) => event.midi !== null) as { midi: number; start: number; duration: number }[];
  const end = playback.events.reduce((max, event) => Math.max(max, (event.start + event.duration) * secondsPerBeat), 0);
  const leadIn = 0.1;
  const tail = 0.8;
  const frames = Math.ceil((leadIn + end + tail) * FRAME_RATE);

  // Move the melody by whole octaves towards the instrument's usual register.
  const meanMidi = notes.reduce((sum, note) => sum + note.midi, 0) / Math.max(1, notes.length);
  const octaveShift = 12 * Math.round((settings.meanPitch - meanMidi) / 12);

  const f0 = new Float32Array(frames);
  const loudness = new Float32Array(frames).fill(SILENCE_DB);
  const peak = settings.averageMaxLoudness;
  const body = (settings.meanLoudness + settings.averageMaxLoudness) / 2;
  let lastHz = 440;

  for (const note of notes) {
    const hz = 440 * 2 ** ((note.midi + octaveShift - 69) / 12);
    const startFrame = Math.round((leadIn + note.start * secondsPerBeat) * FRAME_RATE);
    const length = Math.max(4, Math.round(note.duration * secondsPerBeat * FRAME_RATE));
    const attack = Math.min(10, Math.floor(length / 3)); // ~40 ms
    const release = Math.min(14, Math.floor(length / 3)); // ~56 ms, keeps notes articulated
    for (let i = 0; i < length && startFrame + i < frames; i += 1) {
      const t = i / FRAME_RATE;
      // Gentle vibrato that fades in after 150 ms, like a player would add.
      const vibrato = t > 0.15 ? 0.004 * Math.min(1, (t - 0.15) / 0.2) * Math.sin(2 * Math.PI * 5.5 * t) : 0;
      f0[startFrame + i] = hz * (1 + vibrato);
      let level = body + (peak - body) * Math.exp(-t * 2.5);
      if (i < attack) level = SILENCE_DB + ((level - SILENCE_DB) * (i + 1)) / (attack + 1);
      if (i >= length - release) level = level - (i - (length - release)) * 4;
      loudness[startFrame + i] = Math.max(SILENCE_DB, level);
    }
    lastHz = hz;
  }
  // Keep the pitch defined during rests (the network expects a continuous f0).
  let held = notes.length ? 440 * 2 ** ((notes[0].midi + octaveShift - 69) / 12) : lastHz;
  for (let i = 0; i < frames; i += 1) {
    if (f0[i] > 0) held = f0[i];
    else f0[i] = held;
  }
  return { f0, loudness, frames };
}

/** Synthesises the whole score with the instrument's DDSP model; returns 16 kHz mono samples. */
export async function synthesizeDdsp(playback: ScorePlayback, kind: DdspKind): Promise<Float32Array> {
  const tf = await loadTf();
  const { model, settings } = await loadModel(kind);
  const { f0, loudness, frames } = buildCurves(playback, settings);
  const totalSamples = frames * SAMPLES_PER_FRAME;
  const output = new Float32Array(totalSamples);
  const step = CHUNK_FRAMES - OVERLAP_FRAMES;
  const fade = OVERLAP_FRAMES * SAMPLES_PER_FRAME;

  for (let startFrame = 0; startFrame < frames; startFrame += step) {
    const f0Chunk = new Float32Array(CHUNK_FRAMES);
    const ldChunk = new Float32Array(CHUNK_FRAMES).fill(SILENCE_DB);
    for (let i = 0; i < CHUNK_FRAMES; i += 1) {
      const source = Math.min(startFrame + i, frames - 1);
      f0Chunk[i] = f0[source];
      if (startFrame + i < frames) ldChunk[i] = loudness[startFrame + i];
    }
    const f0Tensor = tf.tensor1d(f0Chunk, "float32");
    const ldTensor = tf.tensor1d(ldChunk, "float32");
    const result = (await model.executeAsync({ f0_hz: f0Tensor, loudness_db: ldTensor })) as import("@tensorflow/tfjs").Tensor;
    const audio = (await result.data()) as Float32Array;
    f0Tensor.dispose();
    ldTensor.dispose();
    result.dispose();

    const offset = startFrame * SAMPLES_PER_FRAME;
    for (let i = 0; i < audio.length && offset + i < totalSamples; i += 1) {
      const isOverlap = startFrame > 0 && i < fade;
      if (isOverlap) {
        const w = i / fade;
        output[offset + i] = output[offset + i] * (1 - w) + audio[i] * w;
      } else {
        output[offset + i] = audio[i];
      }
    }
    if (startFrame + CHUNK_FRAMES >= frames) break;
  }

  const gain = settings.postGain ?? 1;
  let peak = 0;
  for (let i = 0; i < output.length; i += 1) {
    output[i] *= gain;
    peak = Math.max(peak, Math.abs(output[i]));
  }
  if (peak > 0.98) {
    const scale = 0.98 / peak;
    for (let i = 0; i < output.length; i += 1) output[i] *= scale;
  }
  return output;
}
