import { useEffect, useRef, useState } from "react";
import { synthesizeScoreAudio, type PublishedScore } from "./lib/api";
import { createVoice, INSTRUMENTS, isAiInstrument, type InstrumentKind } from "./lib/instruments";
import { aiInstrumentAudio, playAiBuffer, renderInstrumentMp3 } from "./lib/renderInstrument";
import { InstrumentIcon, type Instrument } from "./StreamerBackground";

// REG-003 / REG-004 — listening panel on the score detail (UX_SPEC FLOW-014-FLOW-017).
// HU13 spoken solfege, HU14 audio tutor, HU15 piano + HU20 (proposed) other instruments
// played in the browser — violin, flute, trumpet and sax by the Magenta DDSP neural model
// (DEC-242) with a Tone.js fallback, the rest with Tone.js — and HU18 MP3 download.
const messages = {
  notAbc: "Disponible solo para partituras en ABC", // M-02
  unsupported: "Esta partitura contiene elementos que no se pueden reproducir.", // M-03
  needSolfege: "Genera primero el solfeo para descargarlo.", // M-16
  instrumentFailed: "No se pudo reproducir el instrumento en este navegador.",
  renderFailed: "No se pudo crear el MP3 del instrumento en este navegador.",
  aiFallback: "La IA no está disponible en este navegador; se usó el sintetizador.",
};

type AudioKind = "solfege" | "tutor";
type Busy = AudioKind | InstrumentKind | "render" | null;
type PlaybackHandle = { stop: () => void };
type Particle = { id: number; icon: Instrument; x: number; drift: number; rotate: number; size: number };

const ICON_FOR: Record<InstrumentKind, Instrument> = {
  piano: "piano",
  guitar: "guitar",
  violin: "violin",
  flute: "flute",
  trumpet: "trumpet",
  sax: "sax",
};

function slug(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "partitura";
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function ListeningPanel({ score }: { score: PublishedScore }) {
  const playback = score.playback;
  const [busy, setBusy] = useState<Busy>(null);
  const [playing, setPlaying] = useState<InstrumentKind | null>(null);
  const [urls, setUrls] = useState<Partial<Record<AudioKind, string>>>({});
  const [current, setCurrent] = useState<AudioKind | null>(null);
  const [tutorText, setTutorText] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);
  const preferred = INSTRUMENTS.find((item) => item.scoreName === score.instrument)?.kind ?? "piano";
  const [selected, setSelected] = useState<InstrumentKind>(preferred);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playbackRef = useRef<PlaybackHandle | null>(null);
  const urlsRef = useRef(urls);
  urlsRef.current = urls;

  useEffect(
    () => () => {
      playbackRef.current?.stop();
      Object.values(urlsRef.current).forEach((url) => url && URL.revokeObjectURL(url));
    },
    [],
  );

  // While an instrument plays, its icon and music notes float up from the active button.
  useEffect(() => {
    if (!playing || reducedMotion()) return;
    let id = 0;
    const timer = window.setInterval(() => {
      const icon: Instrument = Math.random() < 0.45 ? ICON_FOR[playing] : "note";
      const particle: Particle = {
        id: Date.now() + id++,
        icon,
        x: Math.round(Math.random() * 70 + 15),
        drift: Math.round(Math.random() * 80 - 40),
        rotate: Math.round(Math.random() * 50 - 25),
        size: icon === "note" ? 18 + Math.round(Math.random() * 8) : 22 + Math.round(Math.random() * 8),
      };
      setParticles((list) => [...list.slice(-14), particle]);
    }, 260);
    return () => {
      window.clearInterval(timer);
      window.setTimeout(() => setParticles([]), 1800);
    };
  }, [playing]);

  const blockedText = !playback?.playable
    ? playback?.reason === "UNSUPPORTED_ELEMENTS"
      ? messages.unsupported
      : messages.notAbc
    : null;

  function stopInstrument() {
    playbackRef.current?.stop();
    playbackRef.current = null;
    setPlaying(null);
  }

  function playUrl(kind: AudioKind, url: string) {
    stopInstrument(); // one audio at a time (UX-PROP-002)
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

  async function toggleInstrument(kind: InstrumentKind) {
    setError("");
    const wasPlaying = playing;
    setSelected(kind);
    stopInstrument();
    if (wasPlaying === kind || !playback?.playable) return;
    audioRef.current?.pause();
    setNotice("");
    setBusy(kind);
    try {
      const Tone = await import("tone");
      await Tone.start();
      if (isAiInstrument(kind)) {
        try {
          const audio = await aiInstrumentAudio(playback, kind);
          const stop = await playAiBuffer(Tone, audio, () => stopInstrument());
          playbackRef.current = { stop };
          setPlaying(kind);
          return;
        } catch {
          setNotice(messages.aiFallback);
        }
      }
      const voice = createVoice(Tone, kind);
      await voice.ready;
      const secondsPerBeat = 60 / (playback.tempo_bpm ?? 100);
      const startAt = Tone.now() + 0.15;
      let end = 0;
      for (const event of playback.events) {
        end = Math.max(end, (event.start + event.duration) * secondsPerBeat);
        if (event.midi === null) continue;
        voice.play(
          Tone.Frequency(event.midi + voice.transpose, "midi").toFrequency(),
          Math.max(0.05, event.duration * secondsPerBeat * 0.95),
          startAt + event.start * secondsPerBeat,
        );
      }
      const timer = window.setTimeout(() => stopInstrument(), (end + 1.6) * 1000);
      playbackRef.current = {
        stop: () => {
          window.clearTimeout(timer);
          voice.dispose();
        },
      };
      setPlaying(kind);
    } catch {
      setError(messages.instrumentFailed);
    } finally {
      setBusy(null);
    }
  }

  async function downloadInstrument() {
    if (!playback?.playable) return;
    setError("");
    setBusy("render");
    try {
      const { blob, usedAi } = await renderInstrumentMp3(playback, selected);
      setNotice(isAiInstrument(selected) && !usedAi ? messages.aiFallback : "");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const label = INSTRUMENTS.find((item) => item.kind === selected)?.label ?? selected;
      link.href = url;
      link.download = `${slug(score.title)}-${slug(label)}.mp3`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      setError(messages.renderFailed);
    } finally {
      setBusy(null);
    }
  }

  const selectedLabel = INSTRUMENTS.find((item) => item.kind === selected)?.label ?? "";
  const solfegeUrl = urls.solfege;
  const playingLabel = INSTRUMENTS.find((item) => item.kind === playing)?.label;
  const liveText =
    busy === "solfege" ? "Generando solfeo…" : busy === "tutor" ? "Preparando explicación…" : busy === "render" ? `Creando MP3 de ${selectedLabel}…` : busy && isAiInstrument(busy as InstrumentKind) ? `La IA está tocando ${INSTRUMENTS.find((item) => item.kind === busy)?.label}…` : playingLabel ? `Reproduciendo ${playingLabel}.` : "";
  const busyWithAudio = busy === "solfege" || busy === "tutor";

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
        {solfegeUrl ? (
          <a className="button secondary small" href={solfegeUrl} download={`${slug(score.title)}-solfeo.mp3`}>
            Descargar solfeo (MP3)
          </a>
        ) : (
          <button className="button secondary small" type="button" disabled aria-describedby="download-hint">
            Descargar solfeo (MP3)
          </button>
        )}
      </div>

      <div className="instrument-picker" role="group" aria-label="Tocar la partitura con un instrumento">
        <p className="instrument-title">Tocar con</p>
        <div className="instrument-buttons">
          {INSTRUMENTS.map((item) => {
            const isPlaying = playing === item.kind;
            return (
              <div className={`instrument-slot${isPlaying ? " is-playing" : ""}`} key={item.kind}>
                <button
                  className={`instrument-button instrument-${item.kind}${isPlaying ? " active" : ""}${item.kind === selected ? " selected" : ""}`}
                  type="button"
                  onClick={() => void toggleInstrument(item.kind)}
                  disabled={Boolean(blockedText) || busyWithAudio || (busy !== null && busy !== item.kind)}
                  aria-pressed={isPlaying}
                  aria-label={isPlaying ? `Detener ${item.label}` : `Reproducir ${item.label}`}
                  aria-describedby={blockedText ? "listening-hint" : undefined}
                >
                  <span className="instrument-icon"><InstrumentIcon name={ICON_FOR[item.kind]} size={22} /></span>
                  <span>{isPlaying ? "Detener" : busy === item.kind ? (item.ai ? "IA tocando…" : "Preparando…") : item.label}</span>
                  {item.ai ? <span className="ai-badge" title="Tocado por una red neuronal (Magenta DDSP)">IA</span> : null}
                  {isPlaying ? <span className="eq" aria-hidden="true"><i /><i /><i /></span> : null}
                </button>
                {isPlaying ? (
                  <span className="instrument-burst" aria-hidden="true">
                    {particles.map((particle) => (
                      <span
                        key={particle.id}
                        className={`burst-item${particle.icon === "note" ? " is-note" : ""}`}
                        style={{ left: `${particle.x}%`, ["--drift" as string]: `${particle.drift}px`, ["--rot" as string]: `${particle.rotate}deg` }}
                      >
                        <InstrumentIcon name={particle.icon} size={particle.size} />
                      </span>
                    ))}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <button className="button primary small instrument-download" type="button" onClick={() => void downloadInstrument()} disabled={Boolean(blockedText) || busy !== null}>
          <InstrumentIcon name={ICON_FOR[selected]} size={18} />
          {busy === "render" ? `Creando MP3 de ${selectedLabel}…` : `Descargar ${selectedLabel} (MP3)`}
        </button>
      </div>

      {!blockedText && !solfegeUrl ? <p className="voice-notice" id="download-hint">{messages.needSolfege}</p> : null}
      <audio
        ref={audioRef}
        className={current ? "listening-player" : "sr-only"}
        controls
        aria-label={current === "tutor" ? "Audio del tutor" : "Audio del solfeo"}
        onPlay={stopInstrument}
      />
      {current === "tutor" && tutorText ? <p className="tutor-text">{tutorText}</p> : null}
      <p className="sr-only" aria-live="polite">{liveText}</p>
      {notice ? <p className="voice-hint" role="status">{notice}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </section>
  );
}
