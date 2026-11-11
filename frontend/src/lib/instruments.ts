// HU20 (proposed, CR-005) — instrument voices for browser playback with Tone.js.
// Each voice is a small synthesis patch (no samples, no network); they imitate the
// instrument's character: plucked guitar, bowed violin with vibrato, breathy flute and
// brass/reed fallbacks for the AI instruments. Piano keeps the HU15 patch.

export type InstrumentKind = "piano" | "guitar" | "violin" | "flute" | "trumpet" | "sax";

/** ``ai``: played by a Magenta DDSP neural model (DEC-242); Tone.js patch is the fallback. */
export const INSTRUMENTS: { kind: InstrumentKind; label: string; scoreName: string; ai: boolean }[] = [
  { kind: "piano", label: "Piano", scoreName: "Piano", ai: false },
  { kind: "guitar", label: "Guitarra", scoreName: "Guitarra", ai: false },
  { kind: "violin", label: "Violín", scoreName: "Violín", ai: true },
  { kind: "flute", label: "Flauta", scoreName: "Flauta", ai: true },
  { kind: "trumpet", label: "Trompeta", scoreName: "Trompeta", ai: true },
  { kind: "sax", label: "Saxofón", scoreName: "Saxofón", ai: true },
];

export const isAiInstrument = (kind: InstrumentKind) => INSTRUMENTS.some((item) => item.kind === kind && item.ai);

type ToneModule = typeof import("tone");

export type InstrumentVoice = {
  /** Plays one note: frequency in Hz, duration and start time in seconds (Tone clock). */
  play: (frequency: number, duration: number, time: number) => void;
  /** Semitone shift applied to the score so each instrument sounds in its usual range. */
  transpose: number;
  /** Resolves when async parts (reverb impulse responses) are generated. */
  ready: Promise<unknown>;
  dispose: () => void;
};

export function createVoice(Tone: ToneModule, kind: InstrumentKind): InstrumentVoice {
  const nodes: { dispose: () => unknown }[] = [];
  const keep = <T extends { dispose: () => unknown }>(node: T) => {
    nodes.push(node);
    return node;
  };
  const dispose = () => nodes.reverse().forEach((node) => node.dispose());
  const reverbs: Promise<unknown>[] = [];
  const reverb = (options: { decay: number; wet: number }) => {
    const node = keep(new Tone.Reverb(options).toDestination());
    reverbs.push(node.ready);
    return node;
  };
  const ready = () => Promise.all(reverbs);

  if (kind === "guitar") {
    const room = reverb({ decay: 1.6, wet: 0.18 });
    const pluck = keep(new Tone.PluckSynth({ attackNoise: 1.2, dampening: 3800, resonance: 0.94, volume: 4 }).connect(room));
    return {
      transpose: -12,
      ready: ready(),
      play: (frequency, _duration, time) => pluck.triggerAttack(frequency, time),
      dispose,
    };
  }

  if (kind === "violin") {
    const room = reverb({ decay: 2.4, wet: 0.25 });
    const vibrato = keep(new Tone.Vibrato({ frequency: 5.5, depth: 0.12 }).connect(room));
    const filter = keep(new Tone.Filter({ type: "lowpass", frequency: 2600, Q: 1 }).connect(vibrato));
    const synth = keep(
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.09, decay: 0.2, sustain: 0.75, release: 0.45 },
        volume: -10,
      }).connect(filter),
    );
    return { transpose: 0, ready: ready(), play: (f, d, t) => synth.triggerAttackRelease(f, d, t), dispose };
  }

  if (kind === "flute") {
    const room = reverb({ decay: 2, wet: 0.22 });
    const vibrato = keep(new Tone.Vibrato({ frequency: 4.8, depth: 0.06 }).connect(room));
    const synth = keep(
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.07, decay: 0.1, sustain: 0.9, release: 0.25 },
        volume: -4,
      }).connect(vibrato),
    );
    // Soft breath noise on each attack.
    const breathFilter = keep(new Tone.Filter({ type: "bandpass", frequency: 2200, Q: 0.8 }).connect(room));
    const breath = keep(new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.02, decay: 0.12, sustain: 0 }, volume: -30 }).connect(breathFilter));
    return {
      transpose: 12,
      ready: ready(),
      play: (f, d, t) => {
        synth.triggerAttackRelease(f, d, t);
        breath.triggerAttackRelease(0.1, t);
      },
      dispose,
    };
  }

  if (kind === "trumpet" || kind === "sax") {
    // Fallback brass/reed patch (the AI models are preferred for these two).
    const room = reverb({ decay: 1.8, wet: 0.2 });
    const filter = keep(new Tone.Filter({ type: "lowpass", frequency: kind === "trumpet" ? 3200 : 1900, Q: 1.2 }).connect(room));
    const synth = keep(
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: kind === "trumpet" ? "sawtooth" : "square" },
        envelope: { attack: 0.05, decay: 0.15, sustain: 0.7, release: 0.25 },
        volume: -12,
      }).connect(filter),
    );
    return { transpose: kind === "sax" ? -12 : 0, ready: ready(), play: (f, d, t) => synth.triggerAttackRelease(f, d, t), dispose };
  }

  // Piano (HU15 patch).
  const synth = keep(
    new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 0.4, sustain: 0.15, release: 1.2 },
    }).toDestination(),
  );
  return { transpose: 0, ready: ready(), play: (f, d, t) => synth.triggerAttackRelease(f, d, t), dispose };
}
