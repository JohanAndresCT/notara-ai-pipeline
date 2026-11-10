import { useEffect, useRef, useState } from "react";
import { synthesizeScoreAudio, type PublishedScore } from "./lib/api";

// REG-003 / REG-004 — listening panel on the score detail (UX_SPEC FLOW-014-FLOW-017).
// HU13 spoken solfege, HU14 audio tutor, HU15 piano (Tone.js in the browser), HU18 MP3 download.
const messages = {
  notAbc: "Disponible solo para partituras en ABC", // M-02
  unsupported: "Esta partitura contiene elementos que no se pueden reproducir.", // M-03
  needSolfege: "Genera primero el solfeo para descargarlo.", // M-16
  pianoFailed: "No se pudo reproducir el piano en este navegador.",
};

type AudioKind = "solfege" | "tutor";
type Busy = AudioKind | "piano" | null;
type PianoHandle = { stop: () => void };

function slug(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "partitura";
}

export default function ListeningPanel({ score }: { score: PublishedScore }) {
  const playback = score.playback;
  const [busy, setBusy] = useState<Busy>(null);
  const [pianoPlaying, setPianoPlaying] = useState(false);
  const [urls, setUrls] = useState<Partial<Record<AudioKind, string>>>({});
  const [current, setCurrent] = useState<AudioKind | null>(null);
  const [tutorText, setTutorText] = useState<string | null>(null);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const pianoRef = useRef<PianoHandle | null>(null);
  const urlsRef = useRef(urls);
  urlsRef.current = urls;

  useEffect(
    () => () => {
      pianoRef.current?.stop();
      Object.values(urlsRef.current).forEach((url) => url && URL.revokeObjectURL(url));
    },
    [],
  );

  const blockedText = !playback?.playable
    ? playback?.reason === "UNSUPPORTED_ELEMENTS"
      ? messages.unsupported
      : messages.notAbc
    : null;

  function stopPiano() {
    pianoRef.current?.stop();
    pianoRef.current = null;
    setPianoPlaying(false);
  }

  function playUrl(kind: AudioKind, url: string) {
    stopPiano(); // one audio at a time (UX-PROP-002)
    setCurrent(kind);
    const element = audioRef.current;
    if (!element) return;
    element.src = url;
    void element.play().catch(() => undefined);
  }

  async function requestAudio(kind: AudioKind) {
    setError("");
    const existing = urls[kind];
    if (existing) {
      playUrl(kind, existing);
      return;
    }
    setBusy(kind);
    try {
      const result = await synthesizeScoreAudio(score.id, kind);
      const url = URL.createObjectURL(result.audio);
      setUrls((previous) => ({ ...previous, [kind]: url }));
      if (kind === "tutor") setTutorText(result.tutorText);
      playUrl(kind, url);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function togglePiano() {
    setError("");
    if (pianoPlaying) {
      stopPiano();
      return;
    }
    if (!playback?.playable) return;
    audioRef.current?.pause();
    setBusy("piano");
    try {
      const Tone = await import("tone");
      await Tone.start();
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.005, decay: 0.4, sustain: 0.15, release: 1.2 },
      }).toDestination();
      const secondsPerBeat = 60 / (playback.tempo_bpm ?? 100);
      const startAt = Tone.now() + 0.1;
      let end = 0;
      for (const event of playback.events) {
        end = Math.max(end, (event.start + event.duration) * secondsPerBeat);
        if (event.midi === null) continue;
        synth.triggerAttackRelease(
          Tone.Frequency(event.midi, "midi").toFrequency(),
          Math.max(0.05, event.duration * secondsPerBeat * 0.95),
          startAt + event.start * secondsPerBeat,
        );
      }
      const timer = window.setTimeout(() => stopPiano(), (end + 1.3) * 1000);
      pianoRef.current = {
        stop: () => {
          window.clearTimeout(timer);
          synth.releaseAll();
          synth.dispose();
        },
      };
      setPianoPlaying(true);
    } catch {
      setError(messages.pianoFailed);
    } finally {
      setBusy(null);
    }
  }

  const solfegeUrl = urls.solfege;
  const liveText =
    busy === "solfege" ? "Generando solfeo…" : busy === "tutor" ? "Preparando explicación…" : pianoPlaying ? "Reproduciendo piano." : "";

  return (
    <section className="listening-panel" aria-labelledby="listening-heading">
      <div className="listening-head">
        <h2 id="listening-heading">Escuchar la partitura</h2>
        {blockedText ? <p className="voice-hint" id="listening-hint">{blockedText}</p> : null}
      </div>
      <div className="listening-actions">
        <button className="button secondary small" type="button" onClick={() => void requestAudio("solfege")} disabled={Boolean(blockedText) || busy !== null} aria-describedby={blockedText ? "listening-hint" : undefined}>
          {busy === "solfege" ? "Generando solfeo…" : "Escuchar Solfeo"}
        </button>
        <button className="button secondary small" type="button" onClick={() => void requestAudio("tutor")} disabled={Boolean(blockedText) || busy !== null} aria-describedby={blockedText ? "listening-hint" : undefined}>
          {busy === "tutor" ? "Preparando explicación…" : "Tutor Auditivo"}
        </button>
        <button className={`button small ${pianoPlaying ? "primary" : "secondary"}`} type="button" onClick={() => void togglePiano()} disabled={Boolean(blockedText) || (busy !== null && busy !== "piano")} aria-pressed={pianoPlaying} aria-describedby={blockedText ? "listening-hint" : undefined}>
          {pianoPlaying ? "Detener piano" : busy === "piano" ? "Preparando piano…" : "Reproducir Piano"}
        </button>
        {solfegeUrl ? (
          <a className="button secondary small" href={solfegeUrl} download={`${slug(score.title)}-solfeo.mp3`}>
            Descargar MP3
          </a>
        ) : (
          <button className="button secondary small" type="button" disabled aria-describedby="download-hint">
            Descargar MP3
          </button>
        )}
      </div>
      {!blockedText && !solfegeUrl ? <p className="voice-notice" id="download-hint">{messages.needSolfege}</p> : null}
      <audio
        ref={audioRef}
        className={current ? "listening-player" : "sr-only"}
        controls
        aria-label={current === "tutor" ? "Audio del tutor" : "Audio del solfeo"}
        onPlay={stopPiano}
      />
      {current === "tutor" && tutorText ? <p className="tutor-text">{tutorText}</p> : null}
      <p className="sr-only" aria-live="polite">{liveText}</p>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </section>
  );
}
